import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "USDT 0";
  return `USDT ${formatCurrencyWithThreeDecimals(value)}`;
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
  const { t, i18n } = useTranslation(['commissions', 'claims', 'common']);

  const formatDate = (value?: string) => {
    if (!value) return "—";

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return "—";

      // Determinar si debemos usar UTC para evitar saltos de día por zona horaria.
      const shouldShowUTC = /^\d{4}-\d{2}-\d{2}$/.test(value) ||
        value.includes('T00:00:00') ||
        value.includes('T23:59:59');

      // Usar locale según el idioma
      const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: shouldShowUTC ? 'UTC' : undefined
      });
    } catch {
      return "—";
    }
  };

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
  } = commission;

  // Función para obtener el badge de nivel
  const getLevelBadge = () => {
    if (level === undefined || level === null) return null;

    let badgeText = '';
    let badgeVariant: 'yellow' | 'green' | 'blue' | 'red' | 'default' = 'default';

    if (level === 1) {
      badgeText = t('claims:item.commissionTypes.level1');
      badgeVariant = 'yellow';
    } else if (level === 2) {
      badgeText = t('claims:item.commissionTypes.level2');
      badgeVariant = 'green';
    } else if (level === 3) {
      badgeText = t('claims:item.commissionTypes.level3');
      badgeVariant = 'blue';
    } else {
      badgeText = `${t('claims:item.labels.level')} ${level}`;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#212020] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "available" ? t('commissions:modals.b2bCommissionDetail.summary') : t('commissions:modals.b2bCommissionDetail.detail')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Rango de fechas considerado - Más visible */}
          <div className="p-4 bg-[#2A2A2A] rounded-lg border border-white/10">
            <p className="text-[#CBCACA] text-xs mb-2 uppercase tracking-wide">
              {t('commissions:modals.b2bCommissionDetail.dateRange')}
            </p>
            <p className="text-white font-semibold text-sm">
              {periodStartDate && periodEndDate
                ? `${formatDate(periodStartDate)} - ${formatDate(periodEndDate)}`
                : "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[#CBCACA] text-xs mb-1">{t('commissions:modals.b2bCommissionDetail.team')}</p>
              <p className="text-white font-medium">{teamName || "—"}</p>
            </div>
            <div>
              <p className="text-[#CBCACA] text-xs mb-1">{t('commissions:modals.b2bCommissionDetail.level')}</p>
              {level !== undefined && level !== null ? (
                getLevelBadge()
              ) : (
                <p className="text-white font-medium">—</p>
              )}
            </div>
            <div>
              <p className="text-[#CBCACA] text-xs mb-1">{t('commissions:modals.b2bCommissionDetail.status')}</p>
              <p className="text-white font-medium capitalize">
                {status?.toLowerCase() === 'available' ? t('commissions:status.available') : (status ?? "—")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">{t('commissions:modals.b2bCommissionDetail.commission')}</p>
              <p className="text-[#32d74b] font-semibold">
                {commissionAmount !== undefined && commissionAmount !== null ? formatCurrencyWithThreeDecimals(commissionAmount) : '0'} <span className="text-[#FFF100]">USDT</span>
              </p>
            </div>
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">{t('commissions:modals.b2bCommissionDetail.totalVolume')}</p>
              <p className="text-[#FFF100] font-semibold">
                {formatVolume(totalVolume)}
              </p>
            </div>
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">{t('commissions:modals.b2bCommissionDetail.commissionPercentage')}</p>
              <p className="text-[#FF7A7A] font-semibold">
                {commissionPercentage !== undefined && commissionPercentage !== null
                  ? `${(commissionPercentage * 100).toFixed(2)}%`
                  : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[#2A2A2A] rounded-lg">
              <p className="text-[#CBCACA] text-xs mb-1">{t('commissions:modals.b2bCommissionDetail.transactions')}</p>
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
            {t('commissions:modals.b2bCommissionDetail.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default B2BCommissionDetailModal;

