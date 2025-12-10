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
import { cn, formatCurrencyWithThreeDecimals } from "@/lib/utils";

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
  
  // Si la fecha viene en formato "YYYY-MM-DD" (sin hora), parsearla directamente
  // para evitar problemas de zona horaria con new Date()
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return `${day}/${month}/${year}`;
  }
  
  // Si viene con hora, usar métodos UTC
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "$0";
  return `$${formatCurrencyWithThreeDecimals(value)}`;
};

const formatVolume = (value?: number) => {
  if (value === undefined || value === null) return "0";
  // Truncar a 3 decimales sin redondear
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const valueStr = numericValue.toString();
  const [integerPart, decimalPart = ""] = valueStr.split(".");
  const truncatedDecimals = decimalPart.slice(0, 3);
  return truncatedDecimals ? `${integerPart}.${truncatedDecimals}` : integerPart;
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
    commissionPercentage,
    isMaterialized,
  } = commission;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#212020] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "available" ? "Resumen de comisión" : "Detalle de comisión"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Rango de fechas considerado - Más visible */}
          <div className="p-4 bg-[#2A2A2A] rounded-lg border border-white/10">
            <p className="text-[#CBCACA] text-xs mb-2 uppercase tracking-wide">
              Rango de fechas considerado para la comisión
            </p>
            <p className="text-white font-semibold text-sm">
              {periodStartDate && periodEndDate 
                ? `${formatDate(periodStartDate)} - ${formatDate(periodEndDate)}`
                : "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                {status?.toLowerCase() === 'available' ? 'Disponible' : (status ?? "—")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">Comisión</p>
              <p className="text-[#32d74b] font-semibold">
                {formatCurrency(commissionAmount)}
              </p>
            </div>
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">Volumen total</p>
              <p className="text-[#FFF100] font-semibold">
                {formatVolume(totalVolume)}
              </p>
            </div>
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">Porcentaje de comisión</p>
              <p className="text-[#FF7A7A] font-semibold">
                {commissionPercentage !== undefined && commissionPercentage !== null
                  ? `${(commissionPercentage * 100).toFixed(2)}%`
                  : '—'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">Transacciones</p>
              <p className="text-white font-semibold">
                {totalTransactions ?? 0}
              </p>
            </div>
          </div>

        </div>
        <DialogFooter className="flex flex-col md:flex-row md:justify-between gap-3 pt-4">
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          {mode === "available" && onConfirm && !isMaterialized && (
            <Button
              variant="yellow"
              className="w-full md:w-auto font-semibold"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Materializando..." : "Solicitar comisiones por volumen"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default B2BCommissionDetailModal;

