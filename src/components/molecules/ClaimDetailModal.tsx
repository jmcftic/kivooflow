import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import FoldedCard from "../atoms/FoldedCard";
import { formatCurrencyWithThreeDecimals } from "@/lib/utils";
import Input from "../atoms/Input";
import MoneyCircleIcon from "../atoms/MoneyCircleIcon";
import { getMisTarjetas } from "@/services/cards";
import { UserCard } from "@/types/card";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/auth";

interface ClaimDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  monto: number;
  tarjetasDisponibles?: string[]; // Mantener por compatibilidad pero no se usará
  mode?: 'view' | 'claim'; // 'view' para ver detalle, 'claim' para solicitar
  onConfirm?: () => void; // Callback para cuando se confirma el claim (modo claim)
  isClaiming?: boolean; // Indica si está procesando el claim
  // Nuevos props para mostrar datos de la comisión
  usuario?: string;
  fecha?: string;
  estado?: string;
  nivel?: number;
  comision?: number; // Valor de comisión que se muestra en la tabla (monto)
  tipoComision?: string; // Tipo de comisión (commissionType)
  baseAmount?: number | string; // Monto base (baseAmount) - puede venir como string o number
  commissionPercentage?: number | string; // Porcentaje de comisión (commissionPercentage) - puede venir como string o number
  commissionAmount?: number | string; // Monto de comisión (commissionAmount) - puede venir como string o number
  hideCardSelection?: boolean; // Si es true, no muestra el select de tarjeta incluso en modo claim
  periodStartDate?: string | null; // Fecha inicio período (para retroactive)
  periodEndDate?: string | null; // Fecha fin período (para retroactive)
  originalClaim?: any; // Claim original completo para acceder a calculationDetails
}

const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  open,
  onOpenChange,
  claimId,
  monto,
  mode = 'view',
  onConfirm,
  isClaiming = false,
  usuario,
  fecha,
  estado,
  nivel,
  comision,
  tipoComision,
  baseAmount,
  commissionPercentage,
  commissionAmount,
  hideCardSelection = false,
  periodStartDate,
  periodEndDate,
  originalClaim,
}) => {
  const { t, i18n } = useTranslation(['commissions', 'claims', 'common']);
  const [selectedTarjeta, setSelectedTarjeta] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [tarjetas, setTarjetas] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Detectar si es retroactive
  const isRetroactive = tipoComision?.toLowerCase() === 'retroactive';

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    if (!estado) return 'text-[#aaa]';
    
    const estadoLower = estado.toLowerCase().trim();
    
    // Estados que son verdes (aprobado/disponible)
    if (estadoLower === 'aprobado' || estadoLower === 'approved' || 
        estadoLower === 'recibida' || estadoLower === 'disponible' || 
        estadoLower === 'available' || estadoLower === 'processed' || 
        estadoLower === 'claimed') {
      return 'text-[#32d74b]';
    }
    
    // Estados que son amarillos (solicitado/pendiente)
    if (estadoLower === 'solicitado' || estadoLower === 'requested' || 
        estadoLower === 'pendiente' || estadoLower === 'pending') {
      return 'text-[#FFF100]';
    }
    
    // Estados que son rojos (rechazado)
    if (estadoLower === 'rechazado' || estadoLower === 'rejected' || 
        estadoLower === 'cancelled') {
      return 'text-[#ff6d64]';
    }
    
    return 'text-[#aaa]';
  };

  // Función para obtener el badge de nivel
  const getLevelBadge = () => {
    if (nivel === undefined || nivel === null) return null;
    
    let badgeText = '';
    let badgeVariant: 'yellow' | 'green' | 'blue' | 'red' | 'default' = 'default';

    if (nivel === 1) {
      badgeText = t('claims:item.commissionTypes.level1');
      badgeVariant = 'yellow';
    } else if (nivel === 2) {
      badgeText = t('claims:item.commissionTypes.level2');
      badgeVariant = 'green';
    } else if (nivel === 3) {
      badgeText = t('claims:item.commissionTypes.level3');
      badgeVariant = 'blue';
    } else {
      badgeText = `${t('claims:item.labels.level')} ${nivel}`;
      badgeVariant = 'default';
    }

    return (
      <Badge 
        variant={badgeVariant}
        className="text-xs"
      >
        {badgeText}
      </Badge>
    );
  };

  // Función para censurar email
  const censorEmail = (email: string): string => {
    if (!email || email === 'N/A') return 'N/A';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const censoredLocal = localPart.length > 2 
      ? `${localPart.substring(0, 2)}${'*'.repeat(Math.min(localPart.length - 2, 3))}`
      : '***';
    return `${censoredLocal}@${domain}`;
  };

  // Obtener usuario loggeado para retroactive
  const getLoggedUserDisplay = (): string => {
    if (!isRetroactive) return usuario || '';
    
    const loggedUser = authService.getStoredUser();
    if (loggedUser?.full_name) {
      return loggedUser.full_name;
    }
    if (loggedUser?.email) {
      return censorEmail(loggedUser.email);
    }
    return usuario || '';
  };

  // Formatear fecha de período (mes, día, año)
  const formatPeriodDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      // Usar locale según el idioma
      const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
      return date.toLocaleDateString(locale, {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Cargar tarjetas cuando se abre el modal solo en modo claim y no se oculta la selección
  useEffect(() => {
    if (open && mode === 'claim' && !hideCardSelection) {
      loadTarjetas();
      // Resetear estados al abrir
      setSelectedTarjeta("");
      setConfirmed(false);
    }
  }, [open, mode, hideCardSelection]);

  const loadTarjetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMisTarjetas();
      // Filtrar solo tarjetas activas
      // Usar cardStatus como fuente de verdad principal
      const tarjetasActivas = response.cards.filter(
        (card) => {
          // Verificar que el estado sea ACTIVA (fuente de verdad principal)
          const isActive = card.cardStatus === "ACTIVA";
          
          // Si cardStatus es ACTIVA, considerar la tarjeta como activa
          // independientemente de blockedAt (puede haber sido bloqueada y luego reactivada)
          if (isActive) {
            return true;
          }
          
          // Si cardStatus no es ACTIVA, verificar campos opcionales para compatibilidad
          const optionalIsActive = (card as any).isActive !== undefined ? (card as any).isActive : false;
          return optionalIsActive;
        }
      );
      
      // Si después del filtro no hay tarjetas, mostrar error
      if (tarjetasActivas.length === 0) {
        setError(t('commissions:modals.claimDetail.noActiveCards'));
        setTarjetas([]);
      } else {
        setTarjetas(tarjetasActivas);
      }
    } catch (err: any) {
      console.error("Error cargando tarjetas:", err);
      // Si es un error 500, mostrar mensaje específico
      if (err?.status === 500 || err?.response?.status === 500) {
        setError(t('commissions:modals.claimDetail.noCardsAvailable'));
        setTarjetas([]);
      } else {
        setError(t('commissions:modals.claimDetail.errorLoadingCards'));
        setTarjetas([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Formatear tarjeta para mostrar en el select
  const formatTarjetaLabel = (card: UserCard): string => {
    return `**** ${card.cardNumber} - ${card.holderName}`;
  };

  const handleConfirm = () => {
    if (mode === 'claim' && onConfirm) {
      // Si es modo claim, llamar al callback
      onConfirm();
    } else {
      // Modo view, solo cerrar
      console.log("Claim confirmado:", {
        claimId,
        tarjeta: selectedTarjeta,
        monto: monto,
        confirmed
      });
      onOpenChange(false);
    }
  };

  // Determinar si el botón debe estar habilitado
  const canConfirm = mode === 'claim' 
    ? !loading && !error && tarjetas.length > 0 && selectedTarjeta !== '' && confirmed && !isClaiming
    : false; // En modo view siempre está deshabilitado

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[95vw] md:max-w-[500px] bg-transparent border-0 shadow-none">
        <div className="relative w-full md:w-[500px] h-auto min-h-[400px] md:h-[369px] rounded-lg overflow-hidden isolate">
          {/* Background con clipPath */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              backgroundColor: "#212020",
              clipPath: `polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%)`,
              transform: "translateZ(0)",
            }}
          >
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(to top, #FFF10000 0%, #FFF10047 100%)`,
              }}
            />
          </div>
          {/* Content container */}
          <div className="relative z-10 h-full flex flex-col">
          {/* Modo view o cuando se oculta la selección de tarjeta: Mostrar datos de la comisión con estilos específicos */}
          {mode === 'view' || hideCardSelection ? (
            <div 
              className="flex flex-col items-center relative w-full py-6 px-4 md:py-8 md:px-6 gap-6 md:gap-8 min-h-[400px] md:min-h-[369px] md:justify-center"
              style={{
                isolation: 'isolate',
                borderRadius: '24px'
              }}
            >
              {/* Título */}
              <h2 className="text-[#FFF100] text-xl font-bold">
                {t('commissions:modals.claimDetail.detail')}
              </h2>

              {/* ScrollArea con datos en filas */}
              <ScrollArea className="flex-1 w-full">
                <div className="flex flex-col gap-2 w-full pr-4 md:justify-center md:min-h-full">
                  {/* Usuario - Solo mostrar si hay valor */}
                  {getLoggedUserDisplay() && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('commissions:labels.user')}</span>
                      <span className="text-white text-sm">{getLoggedUserDisplay()}</span>
                    </div>
                  )}
                  
                  {/* Fecha - Solo mostrar si hay fecha válida */}
                  {fecha && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('commissions:labels.date')}</span>
                      <span className="text-white text-sm">
                        {(() => {
                          try {
                            const date = new Date(fecha);
                            if (isNaN(date.getTime())) return null;
                            return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-MX', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            });
                          } catch {
                            return null;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                  
                  {/* Estado - Solo mostrar si hay estado */}
                  {estado && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('commissions:labels.status')}</span>
                      <span className={`text-sm ${getEstadoColor(estado)}`}>{estado}</span>
                    </div>
                  )}
                  
                  {/* Nivel - Mostrar si hay nivel, independientemente de tipoComision */}
                  {nivel !== undefined && nivel !== null && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('claims:item.labels.level')}</span>
                      {getLevelBadge()}
                    </div>
                  )}
                  
                  {/* Tipo de comisión - Solo mostrar si hay tipoComision válido y no hay nivel (para evitar duplicados) */}
                  {tipoComision && tipoComision !== 'N/A' && (typeof tipoComision !== 'string' || tipoComision.trim() !== '') && (nivel === undefined || nivel === null) && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('commissions:labels.commissionType')}</span>
                      {(() => {
                        const tipoLower = tipoComision.toLowerCase();
                        let badgeText = tipoComision;
                        let badgeVariant: 'yellow' | 'green' | 'blue' | 'red' | 'default' = 'default';

                        // Mapear los tipos de comisión a los textos y variantes deseados
                        if (tipoLower === 'papa' || tipoLower === 'padre') {
                          badgeText = t('claims:item.commissionTypes.level1');
                          badgeVariant = 'yellow';
                        } else if (tipoLower === 'abuelo') {
                          badgeText = t('claims:item.commissionTypes.level2');
                          badgeVariant = 'green';
                        } else if (tipoLower === 'bis_abuelo' || tipoLower === 'bisabuelo') {
                          badgeText = t('claims:item.commissionTypes.level3');
                          badgeVariant = 'blue';
                        } else if (tipoLower === 'leader_markup' || tipoLower === 'leader_retention') {
                          badgeText = t('claims:item.commissionTypes.companyCommission');
                          badgeVariant = 'red';
                        } else if (tipoLower === 'retroactive') {
                          badgeText = t('claims:item.commissionTypes.retroactive');
                          badgeVariant = 'yellow';
                        }

                        return (
                          <Badge 
                            variant={badgeVariant}
                            className="text-xs"
                          >
                            {badgeText}
                          </Badge>
                        );
                      })()}
                    </div>
                  )}
                  
                  {/* Línea divisoria con 10px de padding interno */}
                  <div className="w-full" style={{ padding: '10px 0' }}>
                    <div className="w-full h-[1px] bg-white"></div>
                  </div>
                  
                  {/* Monto - Solo mostrar si no es retroactive y hay baseAmount */}
                  {!isRetroactive && baseAmount !== undefined && baseAmount !== null && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('commissions:labels.amount')}</span>
                      <span className="text-[#198500] text-sm">
                        ${(() => {
                          const baseAmountNum = typeof baseAmount === 'string' ? parseFloat(baseAmount) : baseAmount;
                          return isNaN(baseAmountNum) ? '0.00' : baseAmountNum.toFixed(2);
                        })()}
                      </span>
                    </div>
                  )}

                  {/* Notes - Solo mostrar si es retroactive y hay notas */}
                  {isRetroactive && originalClaim?.calculationDetails && (originalClaim.calculationDetails as any)?.notes && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('commissions:modals.claimDetail.notes')}</span>
                      <span className="text-white text-sm">
                        {(originalClaim.calculationDetails as any).notes}
                      </span>
                    </div>
                  )}
                  
                  {/* Porcentaje - Solo mostrar si no es retroactive y hay porcentaje */}
                  {!isRetroactive && commissionPercentage !== undefined && commissionPercentage !== null && String(commissionPercentage).trim() !== '' && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('commissions:modals.claimDetail.percentage')}</span>
                      <span className="text-white text-sm">
                        {`${String(commissionPercentage)}%`}
                      </span>
                    </div>
                  )}

                  {/* Período - Solo mostrar si es retroactive y hay fechas válidas */}
                  {isRetroactive && periodStartDate && periodEndDate && formatPeriodDate(periodStartDate) && formatPeriodDate(periodEndDate) && (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-white/60 text-sm">{t('commissions:modals.claimDetail.periodStart')}</span>
                        <span className="text-white text-sm">{formatPeriodDate(periodStartDate)}</span>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-white/60 text-sm">{t('commissions:modals.claimDetail.periodEnd')}</span>
                        <span className="text-white text-sm">{formatPeriodDate(periodEndDate)}</span>
                      </div>
                    </>
                  )}
                  
                  {/* Comisión - Solo mostrar si hay commissionAmount */}
                  {(commissionAmount !== undefined && commissionAmount !== null) || (comision !== undefined && comision !== null) ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white/60 text-sm">{t('commissions:labels.commission')}</span>
                      <span className="text-[#FFF100] font-bold text-sm">
                        {(() => {
                          if (commissionAmount !== undefined && commissionAmount !== null) {
                            const commissionAmountNum = typeof commissionAmount === 'string' ? parseFloat(commissionAmount) : commissionAmount;
                            return isNaN(commissionAmountNum) ? '0' : formatCurrencyWithThreeDecimals(commissionAmountNum);
                          }
                          // Fallback a comision si commissionAmount no está disponible
                          if (comision !== undefined && comision !== null) {
                            return typeof comision === 'number' ? formatCurrencyWithThreeDecimals(comision) : '0';
                          }
                          return '0.00';
                        })()} <span className="text-[#FFF100]">USDT</span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col p-4 md:p-6">
              {/* Título */}
              <h2 className="text-[#FFF100] text-xl font-bold mb-6">
                {t('commissions:modals.claimDetail.requestCommission')}
              </h2>
              {/* Select de tarjeta - Solo en modo claim */}
              <div className="mb-4">
                  <label className="text-white text-sm mb-2 block">{t('commissions:modals.claimDetail.selectCard')}</label>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Spinner className="size-4 text-[#FFF000]" />
                      <span className="text-sm text-[#aaa] ml-2">{t('commissions:modals.claimDetail.loadingCards')}</span>
                    </div>
                  ) : error ? (
                    <Select 
                      value={selectedTarjeta} 
                      onValueChange={setSelectedTarjeta}
                      disabled={true}
                    >
                      <SelectTrigger className="w-full" disabled={true}>
                        <SelectValue 
                          placeholder={error === t('commissions:modals.claimDetail.noCardsAvailable') ? t('commissions:modals.claimDetail.noCardsAvailable') : t('commissions:modals.claimDetail.errorLoadingCardsPlaceholder')} 
                        />
                      </SelectTrigger>
                    </Select>
                  ) : (
                    <Select 
                      value={selectedTarjeta} 
                      onValueChange={setSelectedTarjeta}
                      disabled={tarjetas.length === 0}
                    >
                      <SelectTrigger className="w-full" disabled={tarjetas.length === 0}>
                        <SelectValue 
                          placeholder={tarjetas.length === 0 ? t('commissions:modals.claimDetail.noActiveCards') : t('commissions:modals.claimDetail.chooseCard')} 
                        />
                      </SelectTrigger>
                      {tarjetas.length > 0 && (
                        <SelectContent>
                          {tarjetas.map((tarjeta) => (
                            <SelectItem key={tarjeta.id} value={String(tarjeta.id)}>
                              {formatTarjetaLabel(tarjeta)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      )}
                    </Select>
                  )}
                </div>

              {/* Input de monto */}
              <div className="mb-4">
                <Input
                  variant="kivoo-glass"
                  value={monto.toString()}
                  disabled
                  placeholder="0.00"
                  rightIcon={<MoneyCircleIcon size={24} />}
                />
              </div>

              {/* Checkbox de confirmación - Solo en modo claim */}
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox
                  id="confirm"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  disabled={loading || error !== null || tarjetas.length === 0}
                />
                <label
                  htmlFor="confirm"
                  className={`text-sm text-white leading-none ${(loading || error !== null || tarjetas.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('commissions:modals.claimDetail.confirmCheckbox')}
                </label>
              </div>

              {/* Botón de confirmación */}
              <div className="mt-auto">
                <Button
                  variant="yellow"
                  className="w-full font-semibold"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                >
                  {isClaiming ? t('commissions:modals.claimDetail.requesting') : t('commissions:modals.claimDetail.request')}
                </Button>
                {(error || (tarjetas.length === 0 && !loading)) && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {error || t('commissions:modals.claimDetail.noCardsForClaim')}
                  </p>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailModal;

