import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ClaimItem from "../atoms/ClaimItem";
import ClaimDetailModal from "../molecules/ClaimDetailModal";
import B2BCommissionDetailModal from "../molecules/B2BCommissionDetailModal";
import ClaimSuccessModal from "../molecules/ClaimSuccessModal";
import NoCardsModal from "../molecules/NoCardsModal";
import { Spinner } from "@/components/ui/spinner";
import { getClaims, getB2BCommissions, claimB2BCommission, claimMlmTransaction, getAvailableMlmModels } from "@/services/network";
import { Claim, B2BCommission } from "@/types/network";
import { maskCardNumber, maskFullName } from "@/lib/utils";
import { authService } from "@/services/auth";

type CommissionTabId = 'b2c' | 'b2b' | 'b2t';

interface CommissionsListCardProps {
  className?: string;
  activeTab: CommissionTabId;
  currentPage: number;
  pageSize: number;
  onSummaryChange?: (summary: { totalCommissions: number; gainsFromRecharges: number; gainsFromCards: number; totalCommissionsPercentageChange?: number; gainsFromRechargesPercentageChange?: number; gainsFromCardsPercentageChange?: number; totalGananciasPorReclamar?: number; claimedUltimoMes?: number } | null) => void;
  onPaginationChange?: (data: { totalItems: number; totalPages: number }) => void;
}

// Mapear Claim del backend al formato esperado por ClaimItem
interface MappedClaim {
  id: string;
  fecha: string;
  tarjeta: string;
  estado: string;
  monto: number;
  nivel?: number; // Para comisiones B2B
  originalClaim?: Claim;
  originalB2BCommission?: B2BCommission;
  userEmail?: string; // Email del usuario que generó la comisión
  commissionType?: string; // Tipo de comisión: papa, abuelo, bis_abuelo, leader_retention
  usuarioLabel?: string; // Label para la columna Usuario/Empresa
  usuarioValue?: string; // Valor a mostrar (correo censurado o teamName)
  concept?: 'fund' | 'card_selling'; // Concepto de la comisión: recarga o venta de tarjetas
}

const mapClaim = (claim: Claim): MappedClaim => {
  // Mapear estado del backend a formato legible
  const mapStatus = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'processed' || statusLower === 'claimed') return 'Aprobado';
    if (statusLower === 'pending') return 'Pendiente';
    if (statusLower === 'available') return 'Disponible';
    if (statusLower === 'rejected' || statusLower === 'cancelled') return 'Rechazado';
    return status;
  };

  // Para tarjeta, priorizar calculationDetails.DefaultCard.card_number
  // Si no existe, usar cryptoTransactionId como fallback
  let tarjeta = 'N/A';
  
  if (claim.calculationDetails?.DefaultCard?.card_number) {
    tarjeta = maskCardNumber(claim.calculationDetails.DefaultCard.card_number);
  } else if (claim.cryptoTransactionId) {
    tarjeta = `**** ${String(claim.cryptoTransactionId).slice(-4)}`;
  }

  // Calcular monto: commissionAmount + leaderMarkupAmount (si existe y no es 0)
  const commissionAmount = typeof claim.commissionAmount === 'number' 
    ? claim.commissionAmount 
    : parseFloat(String(claim.commissionAmount)) || 0;
  
  const leaderMarkupAmount = typeof claim.leaderMarkupAmount === 'number' 
    ? claim.leaderMarkupAmount 
    : (claim.leaderMarkupAmount ? parseFloat(String(claim.leaderMarkupAmount)) : 0) || 0;
  
  const monto = commissionAmount + leaderMarkupAmount;

  // Obtener userEmail si está disponible (puede venir en calculationDetails, directamente en el claim, o en generatedBy)
  // El email puede venir de diferentes lugares según el tipo de comisión
  // Si no hay email pero hay userFullName, usaremos el userFullName censurado como alternativa
  let userEmail: string | undefined = undefined;
  
  // Intentar obtener el email de diferentes fuentes
  if ((claim as any).userEmail) {
    userEmail = (claim as any).userEmail;
  } else if (claim.calculationDetails && 'userEmail' in claim.calculationDetails) {
    userEmail = (claim.calculationDetails as any).userEmail;
  } else if ((claim as any).userEmail || (claim as any).email) {
    userEmail = (claim as any).userEmail || (claim as any).email;
  }
  
  // Si no hay email pero hay userFullName, usar el userFullName censurado como alternativa
  if (!userEmail && claim.calculationDetails && 'userFullName' in claim.calculationDetails) {
    const userFullName = (claim.calculationDetails as any).userFullName;
    if (userFullName) {
      userEmail = maskFullName(userFullName);
    }
  }

  // Obtener correo censurado del backend si viene (puede venir como userEmail censurado)
  // Si no viene censurado del backend, usar el userEmail que ya tenemos
  let usuarioValue = (claim as any).userEmailCensored || (claim.calculationDetails && 'userEmailCensored' in claim.calculationDetails 
    ? (claim.calculationDetails as any).userEmailCensored 
    : userEmail);

  // Para comisiones retroactive, usar user_email de calculationDetails si está disponible
  // También considerar userEmail directo del claim como fallback
  const isRetroactive = claim.commissionType?.toLowerCase() === 'retroactive';
  let usuarioLabel: string | undefined = undefined;
  
  if (isRetroactive) {
    let retroactiveEmail: string | undefined = undefined;
    
    // Prioridad 1: user_email de calculationDetails
    if (claim.calculationDetails) {
      const calcDetails = claim.calculationDetails as any;
      if (calcDetails.user_email && typeof calcDetails.user_email === 'string' && calcDetails.user_email.trim()) {
        retroactiveEmail = calcDetails.user_email.trim();
      }
    }
    
    // Prioridad 2: userEmail directo del claim (si viene censurado desde el backend)
    if (!retroactiveEmail && (claim as any).userEmail && typeof (claim as any).userEmail === 'string') {
      const claimUserEmail = String((claim as any).userEmail).trim();
      if (claimUserEmail) {
        retroactiveEmail = claimUserEmail;
      }
    }
    
    // Si encontramos un email para retroactive, usarlo
    if (retroactiveEmail) {
      usuarioValue = retroactiveEmail;
      usuarioLabel = 'Usuario';
    }
  }

  return {
    id: `CLM-${String(claim.id).padStart(3, '0')}`,
    fecha: claim.createdAt,
    tarjeta,
    estado: mapStatus(claim.status),
    monto,
    originalClaim: claim,
    commissionType: claim.commissionType,
    userEmail,
    usuarioValue,
    usuarioLabel,
    concept: claim.concept,
  };
};

// Mapear B2BCommission al formato esperado por ClaimItem
const mapB2BCommission = (commission: B2BCommission): MappedClaim => {
  const mapStatus = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'available') return 'Disponible';
    if (statusLower === 'requested') return 'Solicitado';
    if (statusLower === 'processed' || statusLower === 'claimed') return 'Aprobado';
    if (statusLower === 'pending') return 'Pendiente';
    if (statusLower === 'rejected' || statusLower === 'cancelled') return 'Rechazado';
    return status;
  };

  // Función auxiliar para obtener fecha válida en formato ISO
  const getValidDate = (dateString: string | null | undefined): string | null => {
    if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
      return null;
    }
    
    try {
      const dateObj = new Date(dateString);
      // Verificar que la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return null;
      }
      
      // Retornar la fecha en formato ISO para que ClaimItem la formatee
      return dateObj.toISOString();
    } catch (error) {
      console.warn('Error parseando fecha:', dateString, error);
      return null;
    }
  };

  // Usar createdAt para la fecha con validación, con fallback a periodEndDate o periodStartDate
  // Retornamos la fecha en formato ISO para que ClaimItem la formatee correctamente
  let fecha = getValidDate(commission.createdAt);
  
  if (!fecha) {
    fecha = getValidDate(commission.periodEndDate);
  }
  
  if (!fecha) {
    fecha = getValidDate(commission.periodStartDate);
  }
  
  // Si aún no hay fecha válida, usar una fecha por defecto o 'N/A'
  // Usamos una fecha por defecto en formato ISO para evitar "Invalid Date" en ClaimItem
  if (!fecha) {
    fecha = new Date().toISOString(); // Fecha actual como fallback
  }

  // id siempre tiene valor ahora (ya no es nullable)
  const id = `B2B-${String(commission.id).padStart(3, '0')}`;

  return {
    id,
    fecha,
    tarjeta: commission.teamName || 'N/A',
    estado: mapStatus(commission.status),
    monto: commission.commissionAmount || 0,
    nivel: commission.level,
    originalB2BCommission: commission,
    userEmail: commission.userEmail,
    commissionType: commission.commissionType,
    concept: commission.concept,
  };
};

// Función para obtener comisiones B2C (claims disponibles) de la API con paginación
const fetchB2CCommissions = async ({ 
  page = 1,
  pageSize = 10,
  claimType
}: { 
  page: number;
  pageSize: number;
  claimType?: 'B2C' | 'B2B' | 'B2T';
}): Promise<{ data: MappedClaim[], totalItems: number, totalPages: number, summary?: any }> => {
  // Filtrar solo por estado "available" y agregar claimType
  const response = await getClaims({ page, pageSize, status: 'available', claimType });
  
  const mappedData = response.items.map(mapClaim);
  
  return {
    data: mappedData,
    totalItems: response.pagination.total,
    totalPages: response.pagination.totalPages,
    summary: response.summary,
  };
};

// Función para obtener comisiones B2B de la API con paginación
const fetchB2BCommissions = async ({ 
  page = 1,
  pageSize = 20
}: { 
  page: number;
  pageSize: number;
}): Promise<{ data: MappedClaim[], totalItems: number, totalPages: number, summary?: any }> => {
  const limit = pageSize;
  const offset = (page - 1) * limit;
  
  const response = await getB2BCommissions({ limit, offset });
  
  const mappedData = response.commissions.map(mapB2BCommission);
  
  return {
    data: mappedData,
    totalItems: response.total || response.commissions.length,
    totalPages: response.pagination.totalPages,
    summary: response.summary, // B2B commissions ahora tiene summary
  };
};

const CommissionsListCard: React.FC<CommissionsListCardProps> = ({ className = "", activeTab, currentPage, pageSize, onSummaryChange, onPaginationChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<MappedClaim | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'claim' | 'claimMlm'>('view');
  const [claiming, setClaiming] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccessSubtext, setShowSuccessSubtext] = useState(true);
  const [noCardsModalOpen, setNoCardsModalOpen] = useState(false);
  const [b2bModalOpen, setB2bModalOpen] = useState(false);
  const [selectedB2BCommission, setSelectedB2BCommission] = useState<B2BCommission | null>(null);
  const [b2bModalMode, setB2bModalMode] = useState<'available' | 'requested'>('available');
  const queryClient = useQueryClient();

  // Obtener el modelo del usuario para determinar qué endpoint usar
  const { data: userModelData } = useQuery({
    queryKey: ['availableMlmModels'],
    queryFn: getAvailableMlmModels,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const userModel = userModelData?.my_model?.trim().toLowerCase() || '';

  // Determinar qué función usar según el tab y el modelo del usuario
  // - Si está en tab B2C: usar claims con claimType=B2C
  // - Si está en tab B2B y el usuario es B2B: usar claims con claimType=B2B
  // - Si está en tab B2B y el usuario es B2C: usar b2c-from-b2b-commissions (solo para B2C con empresas hijas)
  // - Si está en tab B2T: usar claims con claimType=B2T (si existe) o similar
  const queryFn = React.useCallback(async () => {
    if (activeTab === 'b2c') {
      return fetchB2CCommissions({ page: currentPage, pageSize, claimType: 'B2C' });
    }
    
    if (activeTab === 'b2t') {
      // Para B2T, usar el mismo endpoint de claims pero con claimType=B2T si el backend lo soporta
      // Por ahora, usar B2B como fallback hasta que el backend soporte B2T
      return fetchB2CCommissions({ page: currentPage, pageSize, claimType: 'B2B' });
    }
    
    // Si está en tab B2B
    if (userModel === 'b2b') {
      // Usuario B2B usa el endpoint normal de claims
      return fetchB2CCommissions({ page: currentPage, pageSize, claimType: 'B2B' });
    } else {
      // Usuario B2C con empresas hijas usa el endpoint b2c-from-b2b-commissions
      return fetchB2BCommissions({ page: currentPage, pageSize });
    }
  }, [activeTab, userModel, currentPage, pageSize]);

  const {
    data: queryData,
    status,
  } = useQuery({
    queryKey: ['commissions', activeTab, userModel, currentPage, pageSize],
    queryFn,
    enabled: !!userModelData && !!activeTab, // Solo ejecutar cuando tengamos el modelo del usuario y el tab activo
  });

  const commissions = queryData?.data || [];
  const totalItems = queryData?.totalItems || 0;
  const totalPages = queryData?.totalPages || 0;

  // Notificar cambios de paginación al componente padre
  useEffect(() => {
    if (onPaginationChange && queryData) {
      onPaginationChange({
        totalItems,
        totalPages,
      });
    }
  }, [queryData, totalItems, totalPages, onPaginationChange]);

  // Extraer summary y notificar al componente padre
  useEffect(() => {
    const summary = (queryData as any)?.summary;
    if (summary && onSummaryChange) {
      // Mapear el summary al formato esperado
      // - Para B2B commissions: usa totalGains en lugar de totalCommissions
      // - Para claims (B2C/B2B/B2T): usa totalCommissions y gainsFromRecharges directamente
      const mappedSummary = {
        totalCommissions: summary.totalGains ?? summary.totalCommissions ?? 0,
        gainsFromRecharges: summary.gainsFromRecharges ?? 0, // Mapeado desde el endpoint /network/claims
        gainsFromCards: summary.gainsFromCards ?? 0,
        totalCommissionsPercentageChange: summary.totalGainsPercentageChange ?? summary.totalCommissionsPercentageChange,
        gainsFromRechargesPercentageChange: summary.gainsFromRechargesPercentageChange,
        gainsFromCardsPercentageChange: summary.gainsFromCardsPercentageChange,
        totalGananciasPorReclamar: summary.totalGananciasPorReclamar,
        claimedUltimoMes: summary.claimedUltimoMes,
      };
      onSummaryChange(mappedSummary);
    } else if (!summary && onSummaryChange) {
      onSummaryChange(null);
    }
  }, [queryData, onSummaryChange]);

  const handleVerDetalle = (idOrIndex: string | number) => {
    const claim = typeof idOrIndex === 'number' 
      ? commissions[idOrIndex]
      : commissions.find((c: MappedClaim) => c.id === idOrIndex || (idOrIndex === '' && c.originalB2BCommission));

    if (!claim) return;

    if (claim.originalB2BCommission) {
      const status = claim.originalB2BCommission.status?.toLowerCase();
      setSelectedB2BCommission(claim.originalB2BCommission);
      setB2bModalMode(status === 'available' ? 'available' : 'requested');
      setB2bModalOpen(true);
      return;
    }

    setSelectedClaim(claim);
    const originalClaim = claim.originalClaim;
    const calculationDetails = originalClaim?.calculationDetails;
    const isB2BSource = calculationDetails && 'source' in calculationDetails && calculationDetails.source === "B2B";
    const isAvailable = claim.estado.toLowerCase() === 'disponible' || originalClaim?.status === 'available';
    
    if (isB2BSource && isAvailable) {
      setModalMode('claimMlm');
    } else {
      setModalMode('view');
    }
    setModalOpen(true);
  };

  const handleConfirmB2BCommission = async () => {
    if (!selectedB2BCommission || claiming) return;
    
    // Validar que las fechas estén presentes (requeridas por el backend)
    if (!selectedB2BCommission.periodStartDate || !selectedB2BCommission.periodEndDate) {
      console.error('Error: Las fechas del período son requeridas para reclamar la comisión');
      alert('Error: No se encontraron las fechas del período. Por favor, intenta nuevamente.');
      return;
    }
    
    try {
      setClaiming(true);
      // Todas las comisiones ahora se reclaman directamente (ya no hay materialización)
      await claimB2BCommission({
        teamId: selectedB2BCommission.teamId,
        level: selectedB2BCommission.level,
        periodStartDate: selectedB2BCommission.periodStartDate,
        periodEndDate: selectedB2BCommission.periodEndDate,
      });
      await queryClient.invalidateQueries({ queryKey: ['commissions', activeTab, userModel, currentPage, pageSize] });
      setB2bModalOpen(false);
      setSelectedB2BCommission(null);
      setSuccessMessage('Comisión solicitada exitosamente');
      setShowSuccessSubtext(true); // Mostrar subtexto cuando se solicita
      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Error solicitando comisión:', error);
      const errorMessage = error?.message || error?.response?.data?.message || '';
      const statusCode = error?.response?.status || error?.statusCode || error?.status;
      
      // Verificar si es el error específico de no tener tarjetas
      const messageLower = errorMessage.toLowerCase();
      if (
        statusCode === 400 && 
        (messageLower.includes('no tienes tarjetas disponibles') || 
         messageLower.includes('debe tener al menos una tarjeta') ||
         messageLower.includes('tarjetas disponibles'))
      ) {
        setB2bModalOpen(false);
        setNoCardsModalOpen(true);
      } else {
        // Para otros errores, mostrar alerta
        const finalErrorMessage = errorMessage || 'Error al procesar la solicitud. Por favor, intenta nuevamente.';
        alert(finalErrorMessage);
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleConfirmClaim = async () => {
    if (claiming) return;

    try {
      setClaiming(true);
      
      let responseMessage = '';
      
      // Si es modo claimMlm, usar el endpoint de MLM transactions
      if (modalMode === 'claimMlm' && selectedClaim?.originalClaim) {
        const claim = selectedClaim.originalClaim;
        const response = await claimMlmTransaction({
          transactionId: claim.id,
        });
        responseMessage = response.message;
      } 
      // Si es modo claim normal, usar el endpoint de B2B commissions
      else if (modalMode === 'claim' && selectedClaim?.originalB2BCommission) {
        const b2bCommission = selectedClaim.originalB2BCommission;
        await claimB2BCommission({
          teamId: b2bCommission.teamId,
          level: b2bCommission.level,
          periodStartDate: b2bCommission.periodStartDate,
          periodEndDate: b2bCommission.periodEndDate,
        });
        responseMessage = 'Comisión solicitada exitosamente';
      } else {
        return;
      }

      // Invalidar la query para recargar los datos
      await queryClient.invalidateQueries({ queryKey: ['commissions', activeTab, userModel, currentPage, pageSize] });
      
      // Cerrar modal de detalle
      setModalOpen(false);
      setSelectedClaim(null);
      
      // Mostrar modal de éxito con el mensaje de la respuesta
      setSuccessMessage(responseMessage);
      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Error solicitando comisión:', error);
      // Si el error es 404 con mensaje sobre que ya fue solicitada, mostrar mensaje
      if (error?.status === 404 || error?.response?.status === 404) {
        alert(error?.message || 'La comisión ya ha sido solicitada');
      } else {
        alert('Error al solicitar la comisión. Por favor, intenta nuevamente.');
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full flex flex-col">
        {/* Contenido scrolleable */}
        <div className="w-full space-y-4">
            {status === "pending" ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="size-6 text-[#FFF000]" />
                  <span className="text-sm text-[#aaa]">Cargando comisiones...</span>
                </div>
              </div>
            ) : status === "error" ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#ff6d64]">Error al cargar comisiones</span>
              </div>
            ) : commissions.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#aaa]">No hay comisiones disponibles</span>
              </div>
            ) : (
              <>
                {/* Lista de comisiones */}
                {commissions.map((commission: MappedClaim, index: number) => {
                  // Para usuarios B2C viendo la tab B2B, ocultar ID y Tarjeta, mostrar correo y tipo de comisión
                  const isB2CViewingB2B = userModel === 'b2c' && activeTab === 'b2b' && !!commission.originalB2BCommission;
                  // Para usuarios B2C viendo la tab B2C, también ocultar ID y Tarjeta, mostrar correo y tipo de comisión
                  const isB2CViewingB2C = userModel === 'b2c' && activeTab === 'b2c' && !!commission.originalClaim;
                  // Para usuarios B2B viendo la tab B2B, también ocultar ID y Tarjeta, mostrar correo y tipo de comisión
                  const isB2BViewingB2B = userModel === 'b2b' && activeTab === 'b2b' && !!commission.originalClaim;
                  
                  // Determinar si se deben aplicar los cambios
                  const shouldApplyChanges = isB2CViewingB2B || isB2CViewingB2C || isB2BViewingB2B;
                  
                  // Verificar si es retroactive
                  const isRetroactive = commission.commissionType?.toLowerCase() === 'retroactive';
                  
                  // Determinar label y value para la columna Usuario/Empresa
                  // Si ya viene usuarioLabel desde mapClaim (para retroactive), usarlo
                  let usuarioLabel: string | undefined = commission.usuarioLabel;
                  let usuarioValue: string | undefined = commission.usuarioValue;
                  
                  // Para retroactive, siempre usar los valores que vienen de mapClaim
                  if (isRetroactive) {
                    // Usar los valores desde mapClaim (ya vienen establecidos)
                    usuarioLabel = commission.usuarioLabel;
                    usuarioValue = commission.usuarioValue;
                  } else if (!usuarioLabel && shouldApplyChanges) {
                    // Si no es retroactive y se deben aplicar cambios, usar lógica según el contexto
                    if (isB2CViewingB2B) {
                      // B2C viendo B2B: mostrar "Empresa" con teamName
                      usuarioLabel = 'Empresa';
                      usuarioValue = commission.originalB2BCommission?.teamName || commission.usuarioValue;
                    } else {
                      // B2C viendo B2C o B2B viendo B2B: mostrar "Usuario" con correo censurado
                      usuarioLabel = 'Usuario';
                      // El correo censurado viene del backend, usar usuarioValue si está disponible, sino userEmail
                      usuarioValue = commission.usuarioValue || commission.userEmail;
                    }
                  }
                  
                  // Para retroactive, siempre ocultar ID y Tarjeta
                  // Para no retroactive, usar shouldApplyChanges
                  const finalHideId = isRetroactive ? true : shouldApplyChanges;
                  const finalHideTarjeta = isRetroactive ? true : shouldApplyChanges;
                  
                  return (
                    <ClaimItem
                      key={commission.id || `b2b-${index}`}
                      id={commission.id}
                      fecha={commission.fecha}
                      tarjeta={commission.tarjeta}
                      estado={commission.estado}
                      monto={commission.monto}
                      nivel={commission.nivel}
                      labelEmpresa={!!commission.originalB2BCommission}
                      onVerDetalle={() => handleVerDetalle(commission.id || index)}
                      userEmail={shouldApplyChanges ? commission.userEmail : undefined}
                      commissionType={commission.commissionType}
                      hideId={finalHideId}
                      hideTarjeta={finalHideTarjeta}
                      usuarioLabel={usuarioLabel}
                      usuarioValue={usuarioValue}
                      concept={commission.concept}
                    />
                  );
                })}
              </>
            )}
        </div>
      </div>

      {/* Modal de detalle/solicitar */}
      {selectedClaim && (
        <ClaimDetailModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              setSelectedClaim(null);
              setModalMode('view');
            }
          }}
          claimId={selectedClaim.id || 'Sin ID'}
          monto={selectedClaim.monto}
          mode={modalMode === 'claimMlm' ? 'claim' : modalMode}
          onConfirm={modalMode === 'claim' || modalMode === 'claimMlm' ? handleConfirmClaim : undefined}
          isClaiming={claiming}
          usuario={
            selectedClaim.originalClaim?.calculationDetails && (selectedClaim.originalClaim.calculationDetails as any)?.userFullName
              ? (selectedClaim.originalClaim.calculationDetails as any).userFullName
              : (selectedClaim.originalClaim?.userId ? `Usuario ${selectedClaim.originalClaim.userId}` : 'N/A')
          }
          fecha={selectedClaim.fecha}
          estado={selectedClaim.estado}
          nivel={
            selectedClaim.nivel !== undefined 
              ? selectedClaim.nivel 
              : (selectedClaim.originalClaim?.calculationDetails && 'ancestorDepth' in selectedClaim.originalClaim.calculationDetails
                  ? (selectedClaim.originalClaim.calculationDetails as any).ancestorDepth
                  : undefined)
          }
          tipoComision={selectedClaim.originalClaim?.commissionType || 'N/A'}
          baseAmount={selectedClaim.originalClaim?.baseAmount}
          commissionPercentage={selectedClaim.originalClaim?.commissionPercentage !== null && selectedClaim.originalClaim?.commissionPercentage !== undefined
            ? selectedClaim.originalClaim.commissionPercentage
            : undefined}
          commissionAmount={selectedClaim.originalClaim?.commissionAmount !== undefined && selectedClaim.originalClaim?.commissionAmount !== null
            ? selectedClaim.originalClaim.commissionAmount
            : undefined}
          comision={selectedClaim.monto}
          hideCardSelection={true}
          periodStartDate={selectedClaim.originalClaim?.calculationDetails && 'period_start_date' in selectedClaim.originalClaim.calculationDetails
            ? (selectedClaim.originalClaim.calculationDetails as any).period_start_date
            : undefined}
          periodEndDate={selectedClaim.originalClaim?.calculationDetails && 'period_end_date' in selectedClaim.originalClaim.calculationDetails
            ? (selectedClaim.originalClaim.calculationDetails as any).period_end_date
            : undefined}
          originalClaim={selectedClaim.originalClaim}
        />
      )}

      {selectedB2BCommission && (
        <B2BCommissionDetailModal
          open={b2bModalOpen}
          onOpenChange={(open) => {
            setB2bModalOpen(open);
            if (!open) {
              setSelectedB2BCommission(null);
            }
          }}
          commission={selectedB2BCommission}
          mode={b2bModalMode}
          onConfirm={b2bModalMode === 'available' ? handleConfirmB2BCommission : undefined}
          isSubmitting={claiming}
        />
      )}

      {/* Modal de éxito */}
      <ClaimSuccessModal
        open={successModalOpen}
        onOpenChange={(open) => {
          setSuccessModalOpen(open);
          if (!open) {
            setSuccessMessage('');
            setShowSuccessSubtext(true); // Resetear a true por defecto
          }
        }}
        message={successMessage}
        showSubtext={showSuccessSubtext}
      />

      {/* Modal de no tarjetas */}
      <NoCardsModal
        open={noCardsModalOpen}
        onOpenChange={setNoCardsModalOpen}
        onRequestCard={() => {
          // Aquí puedes agregar la lógica para redirigir a la página de solicitud de tarjeta
          console.log('Solicitar tarjeta');
        }}
      />

    </div>
  );
};

export default CommissionsListCard;

