import React, { useState, useMemo } from "react";
import { useInfiniteQuery, useQueryClient, useQuery } from "@tanstack/react-query";
import ClaimItem from "../atoms/ClaimItem";
import ClaimDetailModal from "../molecules/ClaimDetailModal";
import B2BCommissionDetailModal from "../molecules/B2BCommissionDetailModal";
import ClaimSuccessModal from "../molecules/ClaimSuccessModal";
import { Spinner } from "@/components/ui/spinner";
import { getClaims, getB2BCommissions, claimB2BCommission, claimMlmTransaction, getAvailableMlmModels } from "@/services/network";
import { Claim, B2BCommission } from "@/types/network";

type CommissionTabId = 'b2c' | 'b2b';

interface CommissionsListCardProps {
  className?: string;
  activeTab?: CommissionTabId;
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

  // Para tarjeta, usar cryptoTransactionId si existe, sino mostrar un placeholder
  const tarjeta = claim.cryptoTransactionId 
    ? `**** ${String(claim.cryptoTransactionId).slice(-4)}`
    : 'N/A';

  // Calcular monto: commissionAmount + leaderMarkupAmount (si existe y no es 0)
  const commissionAmount = typeof claim.commissionAmount === 'number' 
    ? claim.commissionAmount 
    : parseFloat(String(claim.commissionAmount)) || 0;
  
  const leaderMarkupAmount = typeof claim.leaderMarkupAmount === 'number' 
    ? claim.leaderMarkupAmount 
    : (claim.leaderMarkupAmount ? parseFloat(String(claim.leaderMarkupAmount)) : 0) || 0;
  
  const monto = commissionAmount + leaderMarkupAmount;

  return {
    id: `CLM-${String(claim.id).padStart(3, '0')}`,
    fecha: claim.createdAt,
    tarjeta,
    estado: mapStatus(claim.status),
    monto,
    originalClaim: claim,
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

  // Usar createdAt para la fecha
  const fecha = commission.createdAt 
    ? new Date(commission.createdAt).toLocaleDateString('es-MX')
    : new Date().toLocaleDateString('es-MX');

  // Si id es null, no mostrar ID
  const id = commission.id !== null 
    ? `B2B-${String(commission.id).padStart(3, '0')}` 
    : '—';

  return {
    id,
    fecha,
    tarjeta: commission.teamName || 'N/A',
    estado: mapStatus(commission.status),
    monto: commission.commissionAmount || 0,
    nivel: commission.level,
    originalB2BCommission: commission,
  };
};

// Función para obtener comisiones B2C (claims disponibles) de la API con paginación
const fetchB2CCommissions = async ({ 
  pageParam = 1 
}: { 
  pageParam: number;
}): Promise<{ data: MappedClaim[], nextPage: number | null, totalPages: number }> => {
  const pageSize = 10;
  // Filtrar solo por estado "available"
  const response = await getClaims({ page: pageParam, pageSize, status: 'available' });
  
  const mappedData = response.items.map(mapClaim);
  const hasMore = pageParam < response.pagination.totalPages;
  
  return {
    data: mappedData,
    nextPage: hasMore ? pageParam + 1 : null,
    totalPages: response.pagination.totalPages,
  };
};

// Función para obtener comisiones B2B de la API con paginación
const fetchB2BCommissions = async ({ 
  pageParam = 1 
}: { 
  pageParam: number;
}): Promise<{ data: MappedClaim[], nextPage: number | null, totalPages: number }> => {
  const limit = 20;
  const offset = (pageParam - 1) * limit;
  
  const response = await getB2BCommissions({ limit, offset });
  
  const mappedData = response.commissions.map(mapB2BCommission);
  const hasMore = pageParam < response.pagination.totalPages;
  
  return {
    data: mappedData,
    nextPage: hasMore ? pageParam + 1 : null,
    totalPages: response.pagination.totalPages,
  };
};

const CommissionsListCard: React.FC<CommissionsListCardProps> = ({ className = "", activeTab = 'b2c' }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<MappedClaim | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'claim' | 'claimMlm'>('view');
  const [claiming, setClaiming] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
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
  // - Si es B2B y está en tab B2B: usar claims (endpoint normal)
  // - Si es B2C y está en tab B2B: usar b2c-from-b2b-commissions (solo para B2C con empresas hijas)
  // - Si está en tab B2C: usar claims (endpoint normal)
  const getQueryFn = () => {
    if (activeTab === 'b2c') {
      return fetchB2CCommissions;
    }
    
    // Si está en tab B2B
    if (userModel === 'b2b') {
      // Usuario B2B usa el endpoint normal de claims
      return fetchB2CCommissions;
    } else {
      // Usuario B2C con empresas hijas usa el endpoint b2c-from-b2b-commissions
      return fetchB2BCommissions;
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['commissions', activeTab, userModel],
    queryFn: ({ pageParam = 1 }) => getQueryFn()({ pageParam: pageParam as number }),
    getNextPageParam: (lastPage: { data: MappedClaim[], nextPage: number | null }) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: !!userModelData, // Solo ejecutar cuando tengamos el modelo del usuario
  });

  const allCommissions = useMemo(() => {
    return data?.pages.flatMap((page: { data: MappedClaim[] }) => page.data) || [];
  }, [data]);

  const handleVerDetalle = (idOrIndex: string | number) => {
    const claim = typeof idOrIndex === 'number' 
      ? allCommissions[idOrIndex]
      : allCommissions.find((c: MappedClaim) => c.id === idOrIndex || (idOrIndex === '' && c.originalB2BCommission));

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
    const isB2BSource = originalClaim?.calculationDetails?.source === "B2B";
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
    try {
      setClaiming(true);
      await claimB2BCommission({
        teamId: selectedB2BCommission.teamId,
        level: selectedB2BCommission.level,
        periodStartDate: selectedB2BCommission.periodStartDate,
        periodEndDate: selectedB2BCommission.periodEndDate,
      });
      await queryClient.invalidateQueries({ queryKey: ['commissions', activeTab, userModel] });
      setB2bModalOpen(false);
      setSelectedB2BCommission(null);
      setSuccessMessage('Comisión solicitada exitosamente');
      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Error solicitando comisión:', error);
      const alreadyRequested = error?.status === 404 || error?.response?.status === 404;
      alert(alreadyRequested ? (error?.message || 'La comisión ya ha sido solicitada') : 'Error al solicitar la comisión. Por favor, intenta nuevamente.');
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
      await queryClient.invalidateQueries({ queryKey: ['commissions', activeTab, userModel] });
      
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
            ) : allCommissions.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#aaa]">No hay comisiones disponibles</span>
              </div>
            ) : (
              <>
                {/* Lista de comisiones */}
                {allCommissions.map((commission: MappedClaim, index: number) => (
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
                  />
                ))}

                {/* Botón cargar más / Spinner de carga */}
                {hasNextPage && (
                  <div className="flex items-center justify-center py-6">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2">
                        <Spinner className="size-4 text-[#FFF000]" />
                        <span className="text-sm text-[#aaa]">Cargando más comisiones...</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => fetchNextPage()}
                        className="action-text"
                      >
                        Cargar más comisiones
                      </button>
                    )}
                  </div>
                )}
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
          }
        }}
        message={successMessage}
        showSubtext={true}
      />
    </div>
  );
};

export default CommissionsListCard;

