import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import FoldedCard from "../atoms/FoldedCard";
import { OrderClaimItem } from "@/types/network";
import { maskCardNumber, formatCurrencyWithThreeDecimals } from "@/lib/utils";

interface OrderClaimDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: OrderClaimItem | null;
}

const OrderClaimDetailModal: React.FC<OrderClaimDetailModalProps> = ({
  open,
  onOpenChange,
  claim,
}) => {
  const { t, i18n } = useTranslation(['claims', 'commissions', 'common']);
  
  if (!claim) return null;

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // Usar locale según el idioma
      const locale = i18n.language === 'en' ? 'en-US' : 'es-MX';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const formatted = formatCurrencyWithThreeDecimals(amount);
    const symbol = currency === 'USDT' ? 'USDT' : '$';
    return `${symbol} ${formatted}`;
  };

  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'claimed':
      case 'paid':
        return 'bg-[#32d74b]/20 text-[#32d74b] border-[#32d74b]/30';
      case 'requested':
        return 'bg-[#FFF100]/20 text-[#FFF100] border-[#FFF100]/30';
      case 'available':
        return 'bg-[#aaa]/20 text-[#aaa] border-[#aaa]/30';
      case 'cancelled':
        return 'bg-[#ff6d64]/20 text-[#ff6d64] border-[#ff6d64]/30';
      default:
        return 'bg-[#aaa]/20 text-[#aaa] border-[#aaa]/30';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'claimed':
        return t('claims:detail.statusLabels.received');
      case 'requested':
        return t('claims:detail.statusLabels.inProcess');
      case 'available':
        return t('claims:detail.statusLabels.available');
      case 'paid':
        return t('claims:detail.statusLabels.paid');
      case 'cancelled':
        return t('claims:detail.statusLabels.cancelled');
      default:
        return status;
    }
  };

  const getCommissionTypeLabel = (commissionType: string): string => {
    const typeLower = commissionType.toLowerCase();
    if (typeLower === 'papa' || typeLower === 'padre') return t('claims:detail.commissionTypes.level1');
    if (typeLower === 'abuelo') return t('claims:detail.commissionTypes.level2');
    if (typeLower === 'bis_abuelo' || typeLower === 'bisabuelo') return t('claims:detail.commissionTypes.level3');
    if (typeLower === 'leader_retention' || typeLower === 'leader_markup') return t('claims:detail.commissionTypes.companyCommission');
    if (typeLower === 'b2b_commission') return t('claims:detail.commissionTypes.b2bCommission');
    if (typeLower === 'retroactive') return t('claims:detail.commissionTypes.retroactive');
    return commissionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCommissionTypeBadgeVariant = (commissionType: string): 'yellow' | 'green' | 'blue' | 'red' | 'default' => {
    const typeLower = commissionType.toLowerCase();
    if (typeLower === 'papa' || typeLower === 'padre') return 'yellow'; // Nivel 1 - amarillo
    if (typeLower === 'abuelo') return 'green'; // Nivel 2 - verde
    if (typeLower === 'bis_abuelo' || typeLower === 'bisabuelo') return 'blue'; // Nivel 3 - azul
    if (typeLower === 'leader_markup' || typeLower === 'leader_retention') return 'yellow'; // Comisión Empresa - amarillo
    if (typeLower === 'b2b_commission') return 'yellow'; // Comisión B2B - amarillo
    if (typeLower === 'retroactive') return 'yellow'; // Retroactiva - amarillo
    return 'default';
  };

  const censorEmail = (email: string): string => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const censoredLocal = localPart.length > 2 
      ? `${localPart.substring(0, 2)}${'*'.repeat(Math.min(localPart.length - 2, 3))}`
      : '***';
    return `${censoredLocal}@${domain}`;
  };

  const calcDetails = claim.calculationDetails;
  // Detectar si es retroactive
  const isRetroactive = claim.commissionType?.toLowerCase() === 'retroactive';
  
  // Acceder a userEmail, user_email, userFullName y teamName de forma segura según el tipo
  // Para retroactive, usar user_email que viene censurado del backend
  let userEmail = '';
  if (isRetroactive && calcDetails && 'user_email' in calcDetails) {
    userEmail = (calcDetails as any).user_email || '';
  } else if (calcDetails && 'userEmail' in calcDetails) {
    userEmail = (calcDetails as any).userEmail || '';
  }
  
  const userFullName = (calcDetails && 'userFullName' in calcDetails) 
    ? (calcDetails as any).userFullName || '' 
    : '';
  const teamName = (calcDetails && 'teamName' in calcDetails) 
    ? (calcDetails as any).teamName || '' 
    : '';
  const montoClaim = claim.commissionAmount + (claim.leaderMarkupAmount || 0);
  const isMlmTransaction = claim.origin === 'mlm_transaction';
  const isB2BCommission = claim.origin === 'b2c_from_b2b_commission';
  
  // Mostrar "Empresa" solo cuando es una comisión B2B (b2c_from_b2b_commission)
  // Esto significa que un usuario B2C está viendo comisiones de empresas B2B
  const showEmpresa = isB2BCommission;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[500px] bg-transparent border-0 shadow-none">
        <FoldedCard
          className="w-[500px] h-[405px] lg:h-[405px]"
          gradientColor="#FFF100"
          backgroundColor="#212020"
          variant="md"
        >
          <div 
            className="flex flex-col items-center relative h-full"
            style={{
              padding: '32px 24px',
              gap: '32px',
              isolation: 'isolate',
              width: '500px',
              borderRadius: '24px'
            }}
          >
            {/* Título - Texto amarillo grande */}
            <h2 className="text-[#FFF100] text-xl font-bold">
              {t('commissions:modals.claimDetail.detail')}
            </h2>

            {/* ScrollArea con datos en filas */}
            <ScrollArea className="flex-1 w-full">
              <div className="flex flex-col gap-2 w-full pr-4">
                {/* Usuario/Empresa - Solo mostrar si hay valor */}
                {(() => {
                  const usuarioValue = showEmpresa && teamName 
                    ? teamName 
                    : (userFullName || (isRetroactive && userEmail ? userEmail : (userEmail ? censorEmail(userEmail) : '')));
                  if (usuarioValue) {
                    return (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-white/60 text-sm">
                          {showEmpresa ? t('claims:item.labels.company') : t('claims:item.labels.user')}
                        </span>
                        <span className="text-white text-sm">{usuarioValue}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Fecha - Solo mostrar si hay fecha válida */}
                {formatDate(claim.createdAt) && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">{t('claims:item.labels.date')}</span>
                    <span className="text-white text-sm">{formatDate(claim.createdAt)}</span>
                  </div>
                )}
                
                {/* Estado con badge */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-white/60 text-sm">{t('claims:item.labels.status')}</span>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(claim.status)}
                  >
                    {getStatusLabel(claim.status)}
                  </Badge>
                </div>
                
                {/* Nivel con badge */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-white/60 text-sm">{t('claims:item.labels.level')}</span>
                  <Badge 
                    variant={getCommissionTypeBadgeVariant(claim.commissionType)}
                    className="text-xs"
                  >
                    {getCommissionTypeLabel(claim.commissionType)}
                  </Badge>
                </div>
                
                {/* Línea divisoria */}
                <div className="w-full" style={{ padding: '10px 0' }}>
                  <div className="w-full h-[1px] bg-white"></div>
                </div>
                
                {/* Monto Base - Solo mostrar si no es retroactive y hay baseAmount */}
                {!isRetroactive && claim.baseAmount != null && claim.baseAmount !== undefined && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">{t('commissions:modals.claimDetail.baseAmount', 'Monto base')}</span>
                    <span className="text-white text-sm">
                      {formatCurrencyWithThreeDecimals(claim.baseAmount)} <span className="text-[#FFF100]">{claim.currency}</span>
                    </span>
                  </div>
                )}

                {/* Notes - Solo mostrar si es retroactive y hay notas */}
                {isRetroactive && calcDetails && (calcDetails as any)?.notes && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">{t('commissions:modals.claimDetail.notes')}</span>
                    <span className="text-white text-sm">
                      {(calcDetails as any).notes}
                    </span>
                  </div>
                )}

                {/* Porcentaje - Solo mostrar si no es retroactive y hay porcentaje */}
                {!isRetroactive && claim.commissionPercentage != null && claim.commissionPercentage !== undefined && (() => {
                  const percentage = typeof claim.commissionPercentage === 'string' 
                    ? parseFloat(claim.commissionPercentage) 
                    : claim.commissionPercentage;
                  
                  // Si es un número válido, mostrar (si es menor a 1, multiplicar por 100; si es >= 1, mostrar directamente)
                  if (!isNaN(percentage)) {
                    const displayPercentage = percentage < 1 ? (percentage * 100).toFixed(2) : percentage.toFixed(2);
                    return (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-white/60 text-sm">{t('commissions:modals.claimDetail.percentage')}</span>
                        <span className="text-white text-sm">{`${displayPercentage}%`}</span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Comisión */}
                {claim.commissionAmount != null && claim.commissionAmount !== undefined && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">{t('commissions:labels.commission')}</span>
                    <span className="text-white text-sm">
                      {formatCurrencyWithThreeDecimals(claim.commissionAmount)} <span className="text-[#FFF100]">{claim.currency}</span>
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default OrderClaimDetailModal;

