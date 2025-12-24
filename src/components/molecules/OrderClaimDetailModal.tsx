import React from "react";
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
  if (!claim) return null;

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
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
        return 'Recibida';
      case 'requested':
        return 'En proceso';
      case 'available':
        return 'Disponible';
      case 'paid':
        return 'Pagada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getCommissionTypeLabel = (commissionType: string): string => {
    const typeMap: Record<string, string> = {
      'papa': 'Nivel 1',
      'abuelo': 'Nivel 2',
      'bis_abuelo': 'Nivel 3',
      'leader_retention': 'Comisión Empresa',
      'b2b_commission': 'Comisión B2B',
      'retroactive': 'Retroactiva',
    };
    return typeMap[commissionType] || commissionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
    if (!email) return 'N/A';
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
              Detalle
            </h2>

            {/* ScrollArea con datos en filas */}
            <ScrollArea className="flex-1 w-full">
              <div className="flex flex-col gap-2 w-full pr-4">
                {/* Usuario/Empresa */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-white/60 text-sm">
                    {showEmpresa ? 'Empresa' : 'Usuario'}
                  </span>
                  <span className="text-white text-sm">
                    {showEmpresa && teamName 
                      ? teamName 
                      : (userFullName || (isRetroactive && userEmail ? userEmail : (userEmail ? censorEmail(userEmail) : 'N/A')))}
                  </span>
                </div>
                
                {/* Fecha */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-white/60 text-sm">Fecha</span>
                  <span className="text-white text-sm">{formatDate(claim.createdAt)}</span>
                </div>
                
                {/* Estado con badge */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-white/60 text-sm">Estado</span>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(claim.status)}
                  >
                    {getStatusLabel(claim.status)}
                  </Badge>
                </div>
                
                {/* Nivel con badge */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-white/60 text-sm">Nivel</span>
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
                
                {/* Monto Base - Ocultar si es retroactive */}
                {!isRetroactive && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Monto base</span>
                    <span className="text-white text-sm">
                      {formatCurrencyWithThreeDecimals(claim.baseAmount || 0)} <span className="text-[#FFF100]">{claim.currency}</span>
                    </span>
                  </div>
                )}

                {/* Porcentaje - Ocultar si es retroactive */}
                {!isRetroactive && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Porcentaje</span>
                    <span className="text-white text-sm">
                      {claim.commissionPercentage !== null 
                        ? `${claim.commissionPercentage}%`
                        : 'N/A'}
                    </span>
                  </div>
                )}

                {/* Comisión */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-white/60 text-sm">Comisión</span>
                  <span className="text-white text-sm">
                    {formatCurrencyWithThreeDecimals(claim.commissionAmount)} <span className="text-[#FFF100]">{claim.currency}</span>
                  </span>
                </div>
              </div>
            </ScrollArea>
          </div>
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default OrderClaimDetailModal;

