import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { OrderClaimItem } from "@/types/network";
import { maskCardNumber } from "@/lib/utils";

interface OrderClaimsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderStatus: 'pending' | 'paid' | 'cancelled';
  orderTotalAmount: number;
  claims: OrderClaimItem[];
  loading?: boolean;
}

const OrderClaimsModal: React.FC<OrderClaimsModalProps> = ({
  open,
  onOpenChange,
  orderId,
  orderStatus,
  orderTotalAmount,
  claims,
  loading = false,
}) => {
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
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency === 'USDT' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'claimed':
      case 'paid':
        return 'text-[#32d74b]';
      case 'requested':
        return 'text-[#FFF100]';
      case 'available':
        return 'text-[#aaa]';
      case 'cancelled':
        return 'text-[#ff6d64]';
      default:
        return 'text-[#aaa]';
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

  const getOriginLabel = (origin: string): string => {
    switch(origin) {
      case 'mlm_transaction':
        return 'MLM Transaction';
      case 'b2c_from_b2b_commission':
        return 'B2B Commission';
      default:
        return origin;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#212020] text-white p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-semibold text-[#FFF100]">
            Orden #{orderId} - {claims.length} claim(s)
          </DialogTitle>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div>
              <span className="text-white/60">Estado: </span>
              <span className={getStatusColor(orderStatus)}>{getStatusLabel(orderStatus)}</span>
            </div>
            <div>
              <span className="text-white/60">Total: </span>
              <span className="text-white font-semibold">{formatCurrency(orderTotalAmount, 'MXN')}</span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Spinner className="size-6 text-[#FFF100]" />
                <span className="text-sm text-[#aaa]">Cargando claims...</span>
              </div>
            </div>
          ) : claims.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-sm text-[#aaa]">No hay claims en esta orden</span>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim, index) => {
                const calcDetails = claim.calculationDetails;
                const isMlmTransaction = claim.origin === 'mlm_transaction';
                const isB2BCommission = claim.origin === 'b2c_from_b2b_commission';

                return (
                  <div
                    key={claim.id}
                    className="bg-[#2A2A2A] rounded-lg p-4 border border-white/10"
                  >
                    {/* Header del claim */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-[#FFF100] font-semibold">
                          Claim #{index + 1}
                        </span>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                          {getOriginLabel(claim.origin)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={getStatusColor(claim.status)}>
                          {getStatusLabel(claim.status)}
                        </span>
                        <span className="text-white font-semibold">
                          {formatCurrency(claim.commissionAmount, claim.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Información del claim */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {/* Información básica */}
                      <div>
                        <span className="text-white/60 block mb-1">ID</span>
                        <span className="text-white">#{claim.id}</span>
                      </div>
                      <div>
                        <span className="text-white/60 block mb-1">Fecha</span>
                        <span className="text-white">{formatDate(claim.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-white/60 block mb-1">Moneda</span>
                        <span className="text-white">{claim.currency}</span>
                      </div>

                      {/* Montos */}
                      {claim.baseAmount > 0 && (
                        <div>
                          <span className="text-white/60 block mb-1">Monto Base</span>
                          <span className="text-white">
                            {formatCurrency(claim.baseAmount, claim.currency)}
                          </span>
                        </div>
                      )}
                      {claim.commissionPercentage !== null && (
                        <div>
                          <span className="text-white/60 block mb-1">Porcentaje</span>
                          <span className="text-white">
                            {(claim.commissionPercentage * 100).toFixed(2)}%
                          </span>
                        </div>
                      )}
                      {claim.leaderMarkupAmount && claim.leaderMarkupAmount > 0 && (
                        <div>
                          <span className="text-white/60 block mb-1">Markup Líder</span>
                          <span className="text-white">
                            {formatCurrency(claim.leaderMarkupAmount, claim.currency)}
                          </span>
                        </div>
                      )}

                      {/* Tipo de comisión */}
                      <div>
                        <span className="text-white/60 block mb-1">Tipo</span>
                        <span className="text-white capitalize">
                          {claim.commissionType?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>

                      {/* Tarjeta */}
                      {calcDetails?.DefaultCard?.card_number && (
                        <div>
                          <span className="text-white/60 block mb-1">Tarjeta</span>
                          <span className="text-white">
                            {maskCardNumber(calcDetails.DefaultCard.card_number)}
                          </span>
                        </div>
                      )}

                      {/* Usuario */}
                      {calcDetails?.userFullName && (
                        <div>
                          <span className="text-white/60 block mb-1">Usuario</span>
                          <span className="text-white">{calcDetails.userFullName}</span>
                        </div>
                      )}
                    </div>

                    {/* Información específica según el tipo */}
                    {isMlmTransaction && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-white font-semibold mb-2 text-sm">Detalles MLM Transaction</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {calcDetails?.ancestorLevelName && (
                            <div>
                              <span className="text-white/60 block mb-1">Nivel Ancestro</span>
                              <span className="text-white">{calcDetails.ancestorLevelName}</span>
                            </div>
                          )}
                          {calcDetails?.ancestorMlmCode && (
                            <div>
                              <span className="text-white/60 block mb-1">Código MLM</span>
                              <span className="text-white">{calcDetails.ancestorMlmCode}</span>
                            </div>
                          )}
                          {calcDetails?.generatedBy && (
                            <div>
                              <span className="text-white/60 block mb-1">Generado por</span>
                              <span className="text-white">#{calcDetails.generatedBy}</span>
                            </div>
                          )}
                          {calcDetails?.cryptocurrency && (
                            <div>
                              <span className="text-white/60 block mb-1">Criptomoneda</span>
                              <span className="text-white">{calcDetails.cryptocurrency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {isB2BCommission && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-white font-semibold mb-2 text-sm">Detalles B2B Commission</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {calcDetails?.teamName && (
                            <div>
                              <span className="text-white/60 block mb-1">Equipo</span>
                              <span className="text-white">{calcDetails.teamName}</span>
                            </div>
                          )}
                          {calcDetails?.level !== undefined && (
                            <div>
                              <span className="text-white/60 block mb-1">Nivel</span>
                              <span className="text-white">{calcDetails.level}</span>
                            </div>
                          )}
                          {calcDetails?.totalVolume !== undefined && (
                            <div>
                              <span className="text-white/60 block mb-1">Volumen Total</span>
                              <span className="text-white">
                                {formatCurrency(calcDetails.totalVolume, 'MXN')}
                              </span>
                            </div>
                          )}
                          {calcDetails?.periodStartDate && calcDetails?.periodEndDate && (
                            <div className="col-span-2 md:col-span-3">
                              <span className="text-white/60 block mb-1">Período</span>
                              <span className="text-white">
                                {formatDate(calcDetails.periodStartDate)} - {formatDate(calcDetails.periodEndDate)}
                              </span>
                            </div>
                          )}
                          {calcDetails?.transactions && calcDetails.transactions.length > 0 && (
                            <div className="col-span-2 md:col-span-3 mt-2">
                              <span className="text-white/60 block mb-2">Transacciones ({calcDetails.transactions.length})</span>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {calcDetails.transactions.map((tx, txIndex) => (
                                  <div key={txIndex} className="bg-white/5 p-2 rounded text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-white/60">Volumen:</span>
                                      <span className="text-white">{formatCurrency(tx.volumeMXN, 'MXN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/60">Esperado:</span>
                                      <span className="text-white">{tx.expectedAmount} {tx.cryptocurrency}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderClaimsModal;

