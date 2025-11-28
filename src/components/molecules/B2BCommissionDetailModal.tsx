import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { B2BCommission } from "@/types/network";
import { cn } from "@/lib/utils";

interface B2BCommissionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commission: B2BCommission | null;
  mode: "available" | "requested";
  onConfirm?: () => void;
  isSubmitting?: boolean;
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "$0";
  // Truncar a 2 decimales sin redondear
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const valueStr = numericValue.toString();
  const [integerPart, decimalPart = ""] = valueStr.split(".");
  const truncatedDecimals = decimalPart.slice(0, 2);
  const formattedValue = truncatedDecimals ? `${integerPart}.${truncatedDecimals}` : integerPart;
  return `$${formattedValue}`;
};

const B2BCommissionDetailModal: React.FC<B2BCommissionDetailModalProps> = ({
  open,
  onOpenChange,
  commission,
  mode,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!commission) return null;

  const {
    teamName,
    level,
    commissionAmount,
    totalVolume,
    totalTransactions,
    status,
    periodStartDate,
    periodEndDate,
    calculationDetails,
  } = commission;

  const transactions = calculationDetails?.transactions ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#212020] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "available" ? "Resumen de comisión" : "Detalle de comisión"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[#CBCACA] text-xs mb-1">Equipo</p>
              <p className="text-white font-medium">{teamName || "—"}</p>
            </div>
            <div>
              <p className="text-[#CBCACA] text-xs mb-1">Nivel</p>
              <p className="text-white font-medium">{level ?? "—"}</p>
            </div>
            <div>
              <p className="text-[#CBCACA] text-xs mb-1">Estado</p>
              <p className="text-white font-medium capitalize">
                {status ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[#CBCACA] text-xs mb-1">Periodo</p>
              <p className="text-white font-medium">
                {`${formatDate(periodStartDate)} - ${formatDate(periodEndDate)}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">Monto estimado</p>
              <p className="text-[#32d74b] font-semibold">
                {formatCurrency(commissionAmount)}
              </p>
            </div>
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">Volumen total</p>
              <p className="text-white font-semibold">
                {totalVolume?.toString() ?? "0"}
              </p>
            </div>
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">Transacciones</p>
              <p className="text-white font-semibold">
                {totalTransactions ?? transactions.length}
              </p>
            </div>
          </div>

          {transactions.length > 0 && (
            <div className="space-y-3">
              <p className="text-[#CBCACA] text-xs uppercase tracking-wide">
                Transacciones consideradas
              </p>
              <div className="max-h-56 overflow-y-auto space-y-3 pr-2">
                {transactions.map((tx, index) => (
                  <div
                    key={`${tx.transactionId}-${index}`}
                    className={cn(
                      "rounded-lg border border-white/5 p-3 text-xs md:text-sm",
                      "bg-[#1A1A1A]"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="text-white font-medium">
                          {tx.transactionId || "Transacción"}
                        </p>
                        <p className="text-[#CBCACA]">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          Volumen MXN: {tx.volumeMXN ?? 0}
                        </p>
                        <p className="text-[#CBCACA]">
                          Monto {tx.cryptocurrency}: {tx.receivedAmount ?? 0}
                        </p>
                      </div>
                    </div>
                    {tx.status && (
                      <p className="text-[#CBCACA] text-xs mt-2">
                        Estado: {tx.status}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col md:flex-row md:justify-between gap-3 pt-4">
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          {mode === "available" && onConfirm && (
            <Button
              variant="yellow"
              className="w-full md:w-auto font-semibold"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Solicitando..." : "Solicitar comisión"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default B2BCommissionDetailModal;

