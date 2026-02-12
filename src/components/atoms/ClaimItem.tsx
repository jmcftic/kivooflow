import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import FoldedCard from "./FoldedCard";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyWithThreeDecimals } from "@/lib/utils";

export type ClaimItemType = {
  id: string;
  fecha: string;
  tarjeta: string;
  estado: string;
  monto: number;
  nivel?: number; // Para comisiones B2B
  labelEmpresa?: boolean; // Si es true, muestra "Empresa" en lugar de "Tarjeta"
  onVerDetalle?: () => void;
  className?: string;
  actionLabel?: string;
  userEmail?: string; // Email del usuario que generó la comisión (reemplaza ID)
  commissionType?: string; // Tipo de comisión: papa, abuelo, bis_abuelo, leader_retention
  hideId?: boolean; // Si es true, oculta la columna ID
  hideTarjeta?: boolean; // Si es true, oculta la columna Tarjeta
  usuarioLabel?: string; // Label para la columna Usuario/Empresa (ej: "Usuario" o "Empresa")
  usuarioValue?: string; // Valor a mostrar en la columna Usuario/Empresa (correo censurado o teamName)
  concept?: 'fund' | 'card_selling'; // Concepto de la comisión: recarga o venta de tarjetas
  periodStartDate?: string;
  periodEndDate?: string;
};

const ClaimItem: FunctionComponent<ClaimItemType> = ({
  id,
  fecha,
  tarjeta,
  estado,
  monto,
  nivel,
  labelEmpresa = false,
  onVerDetalle,
  className = "",
  actionLabel,
  userEmail,
  commissionType,
  hideId = false,
  hideTarjeta = false,
  usuarioLabel,
  usuarioValue,
  concept,
  periodStartDate,
  periodEndDate,
}) => {
  const { t, i18n } = useTranslation(['claims', 'common']);
  const defaultActionLabel = t('claims:item.actions.viewDetail');
  const finalActionLabel = actionLabel || defaultActionLabel;

  // Formatear fecha a formato local
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr || fechaStr === 'N/A') {
      return 'N/A';
    }

    try {
      const date = new Date(fechaStr);

      // Verificar que la fecha es válida
      if (isNaN(date.getTime())) {
        return 'N/A';
      }

      // Usar locale según el idioma
      const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
      const formatted = date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Verificar que el resultado no sea "Invalid Date"
      if (formatted === 'Invalid Date' || formatted.includes('Invalid')) {
        return 'N/A';
      }

      return formatted;
    } catch (error) {
      console.warn('Error formateando fecha en ClaimItem:', fechaStr, error);
      return 'N/A';
    }
  };

  const toNumber = (value: number | string): number => {
    if (typeof value === "number") return value;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatMonto = (value: number | string): string => {
    const numericValue = toNumber(value);
    return formatCurrencyWithThreeDecimals(numericValue);
  };

  // Color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'aprobado':
        return 'text-[#32d74b]';
      case 'recibida':
        return 'text-[#32d74b]'; // Verde para recibida
      case 'disponible':
        return 'text-[#32d74b]'; // Verde para disponible
      case 'solicitado':
        return 'text-[#FFF100]'; // Amarillo para solicitado
      case 'rechazado':
        return 'text-[#ff6d64]';
      case 'pendiente':
        return 'text-[#FFF100]';
      default:
        return 'text-[#aaa]';
    }
  };

  // Función para obtener el badge de concepto
  const getConceptBadge = () => {
    if (!concept) return null;

    let badgeText = '';
    let badgeVariant: 'blue' | 'green' | 'default' = 'default';

    if (concept === 'fund') {
      badgeText = t('claims:item.concepts.fund');
      badgeVariant = 'blue';
    } else if (concept === 'card_selling') {
      badgeText = t('claims:item.concepts.card_selling');
      badgeVariant = 'green';
    }

    if (!badgeText) return null;

    return (
      <Badge
        variant={badgeVariant}
        className="text-xs"
      >
        {badgeText}
      </Badge>
    );
  };

  // Función para obtener el badge de tipo de comisión
  const getCommissionTypeBadge = () => {
    // Si hay commissionType, usarlo
    if (commissionType) {
      const tipoLower = commissionType.toLowerCase();
      let badgeText = commissionType;
      let badgeVariant: 'yellow' | 'green' | 'blue' | 'red' | 'default' = 'default';

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
      } else if (tipoLower === 'b2b_commission') {
        badgeText = t('claims:item.commissionTypes.b2bCommission');
        badgeVariant = 'yellow';
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
    }

    // Si no hay commissionType pero hay nivel, generar badge basado en el nivel
    if (nivel !== undefined && nivel !== null) {
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
    }

    return null;
  };

  // Función para censurar email
  const censorEmail = (email: string): string => {
    if (!email || email === 'N/A') return 'N/A';

    // Si no contiene "@", asumimos que ya es un nombre censurado y lo devolvemos tal cual
    if (!email.includes('@')) {
      return email;
    }

    const [localPart, domain] = email.split('@');
    if (!domain) return email;

    if (localPart.length <= 2) {
      return `${localPart}***@${domain}`;
    }

    const visibleChars = Math.max(2, Math.floor(localPart.length * 0.3));
    const censored = localPart.slice(0, visibleChars) + '***';
    return `${censored}@${domain}`;
  };

  // Determinar si se muestra el badge de tipo de comisión
  const showCommissionTypeBadge = commissionType || (nivel !== undefined && nivel !== null);
  // Determinar si se muestra el badge de concepto
  const showConceptBadge = concept !== undefined;

  // Calcular número de columnas para el grid
  // Base: Fecha, Estado, Monto, Acción = 4 columnas base
  let columnCount = 4;
  // Agregar ID/Email si no está oculto
  if (!hideId) columnCount++;
  // Agregar Tarjeta si no está oculta
  if (!hideTarjeta) columnCount++;
  // Si hay badge de tipo de comisión, agregamos columna
  if (showCommissionTypeBadge) columnCount++;
  // Si hay badge de concepto, agregamos columna
  if (showConceptBadge) columnCount++;
  // Si hay columna Usuario/Empresa, agregamos columna
  if (usuarioLabel && usuarioValue) columnCount++;
  // Si hay fechas de período, agregamos dos columnas (Inicial y Final) y ocultamos la de createdAt
  if (periodStartDate && periodEndDate) {
    columnCount = columnCount + 1; // +2 por período, -1 por la fecha de creación
  }
  // NO agregamos columna para nivel si se está mostrando el badge

  // Mapear número de columnas a clases de Tailwind
  const gridColsMap: Record<number, string> = {
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    7: 'md:grid-cols-7',
    8: 'md:grid-cols-8',
  };

  const gridCols = `grid-cols-2 ${gridColsMap[columnCount] || 'md:grid-cols-6'}`;

  return (
    <div className={`relative w-full rounded-lg overflow-visible md:overflow-hidden isolate h-auto min-h-[400px] md:h-24 md:min-h-[92px] flex flex-col md:flex-row ${className}`}>
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
      <div className={`relative z-10 flex flex-col md:grid ${gridCols} gap-4 md:gap-4 lg:gap-6 w-full py-6 md:py-0 px-4 md:px-6 md:px-8 lg:px-10 md:items-center md:justify-center md:h-full`}>
        {/* Usuario/Empresa - Primera columna si está presente */}
        {usuarioLabel && usuarioValue && (
          <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full">
            <span className="text-[#CBCACA] text-xs md:mb-1">{usuarioLabel}</span>
            <span className="text-white text-sm font-medium md:mb-1">
              {usuarioValue}
            </span>
          </div>
        )}

        {/* ID/Email - Ocultar en móviles si hay userEmail (ya se muestra en Usuario), condicional en desktop */}
        <div className={`flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full ${hideId ? 'md:hidden' : ''} ${userEmail ? 'hidden md:flex' : ''}`}>
          <span className="text-[#CBCACA] text-xs md:mb-1">{userEmail ? t('claims:item.labels.email') : t('claims:item.labels.id')}</span>
          <span className="text-white text-sm font-medium md:mb-1">
            {userEmail ? censorEmail(userEmail) : (id || '—')}
          </span>
        </div>

        {/* Fecha Inicial/Final - Reemplaza la fecha de creación si hay período */}
        {periodStartDate && periodEndDate ? (
          <>
            <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full">
              <span className="text-[#CBCACA] text-xs md:mb-1">{t('claims:item.labels.initialDate')}</span>
              <span className="text-white text-sm font-medium md:mb-1">{formatFecha(periodStartDate)}</span>
            </div>
            <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full">
              <span className="text-[#CBCACA] text-xs md:mb-1">{t('claims:item.labels.finalDate')}</span>
              <span className="text-white text-sm font-medium md:mb-1">{formatFecha(periodEndDate)}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full">
            <span className="text-[#CBCACA] text-xs md:mb-1">{t('claims:item.labels.date')}</span>
            <span className="text-white text-sm font-medium md:mb-1">{formatFecha(fecha)}</span>
          </div>
        )}

        {/* Concepto - Mostrar solo si hay concepto, ocultar en desktop si no hay badge */}
        {showConceptBadge && (
          <div className={`flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full`}>
            <span className="text-[#CBCACA] text-xs md:mb-1">{t('claims:item.labels.concept')}</span>
            <div className="md:mb-1">
              {getConceptBadge() || <span className="text-white text-sm">—</span>}
            </div>
          </div>
        )}

        {/* Tarjeta/Empresa - Mostrar siempre en móviles, condicional en desktop */}
        <div className={`flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full ${hideTarjeta ? 'md:hidden' : ''}`}>
          <span className="text-[#CBCACA] text-xs md:mb-1">{labelEmpresa ? t('claims:item.labels.company') : t('claims:item.labels.card')}</span>
          <span className="text-white text-sm font-medium md:mb-1">{tarjeta}</span>
        </div>

        {/* Tipo de Comisión - Mostrar siempre en móviles, condicional en desktop */}
        <div className={`flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full ${!(commissionType || (nivel !== undefined && nivel !== null)) ? 'md:hidden' : ''}`}>
          <span className="text-[#CBCACA] text-xs md:mb-1">{t('claims:item.labels.commissionType')}</span>
          <div className="md:mb-1">
            {getCommissionTypeBadge() || <span className="text-white text-sm">—</span>}
          </div>
        </div>

        {/* Nivel - NO mostrar si se está mostrando el badge de tipo de comisión */}
        {nivel !== undefined && !showCommissionTypeBadge && (
          <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full">
            <span className="text-[#CBCACA] text-xs md:mb-1">{t('claims:item.labels.level')}</span>
            <span className="text-white text-sm font-medium md:mb-1">{nivel}</span>
          </div>
        )}

        {/* Estado - Siempre visible */}
        <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full">
          <span className="text-[#CBCACA] text-xs md:mb-1">{t('claims:item.labels.status')}</span>
          <span className={`text-sm font-medium md:mb-1 ${getEstadoColor(estado)}`}>{estado}</span>
        </div>

        {/* Monto/Comisión - Siempre visible */}
        <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center w-full md:w-auto py-2 md:py-0 md:h-full">
          <span className="text-[#CBCACA] text-xs md:mb-1">{labelEmpresa ? t('claims:item.labels.commission') : t('claims:item.labels.amount')}</span>
          <span className="text-[#FFF100] text-sm font-bold md:mb-1">
            ${formatMonto(monto)}
          </span>
        </div>

        {/* Acción - Ver detalle - Siempre visible */}
        <div className="flex flex-col md:flex-col items-center md:items-center justify-center md:justify-center w-full md:w-auto md:col-span-1 py-2 md:py-0 md:h-full">
          <span className="text-[#CBCACA] text-xs invisible md:visible md:mb-1">{t('claims:item.labels.action')}</span>
          <button
            onClick={onVerDetalle}
            disabled={!onVerDetalle}
            className={`action-text text-center md:text-left md:mb-1 py-1 ${!onVerDetalle ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {finalActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimItem;

