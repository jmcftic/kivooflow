import React, { FunctionComponent } from "react";
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
  actionLabel = "Ver detalle",
  userEmail,
  commissionType,
  hideId = false,
  hideTarjeta = false,
  usuarioLabel,
  usuarioValue,
}) => {
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
      
      const formatted = date.toLocaleDateString('es-ES', { 
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
    switch(estado.toLowerCase()) {
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

  // Función para obtener el badge de tipo de comisión
  const getCommissionTypeBadge = () => {
    // Si hay commissionType, usarlo
    if (commissionType) {
      const tipoLower = commissionType.toLowerCase();
      let badgeText = commissionType;
      let badgeVariant: 'yellow' | 'green' | 'blue' | 'red' | 'default' = 'default';

      if (tipoLower === 'papa' || tipoLower === 'padre') {
        badgeText = 'Nivel 1';
        badgeVariant = 'yellow';
      } else if (tipoLower === 'abuelo') {
        badgeText = 'Nivel 2';
        badgeVariant = 'green';
      } else if (tipoLower === 'bis_abuelo' || tipoLower === 'bisabuelo') {
        badgeText = 'Nivel 3';
        badgeVariant = 'blue';
      } else if (tipoLower === 'leader_markup' || tipoLower === 'leader_retention') {
        badgeText = 'Comisión Empresa';
        badgeVariant = 'red';
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
      let badgeText = `Nivel ${nivel}`;
      let badgeVariant: 'yellow' | 'green' | 'blue' | 'red' | 'default' = 'default';

      if (nivel === 1) {
        badgeVariant = 'yellow';
      } else if (nivel === 2) {
        badgeVariant = 'green';
      } else if (nivel === 3) {
        badgeVariant = 'blue';
      } else {
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
  
  // Calcular número de columnas para el grid
  let columnCount = 6; // Fecha, Tarjeta, Estado, Monto, Acción (5) + ID/Email (1) = 6
  if (hideId && !userEmail) columnCount--; // Si ocultamos ID y no hay email
  if (hideTarjeta) columnCount--; // Si ocultamos Tarjeta
  // Si hay badge de tipo de comisión, agregamos columna
  if (showCommissionTypeBadge) columnCount++;
  // Si hay columna Usuario/Empresa, agregamos columna
  if (usuarioLabel && usuarioValue) columnCount++;
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
    <FoldedCard 
      className={`min-h-[180px] md:min-h-[92px] ${className}`}
      gradientColor="#FFF100"
      backgroundColor="#212020"
      variant="md"
    >
    <div className={`grid grid-cols-2 ${gridCols} gap-4 md:gap-4 lg:gap-6 w-full py-4 md:py-0`}>
      {/* Usuario/Empresa - Primera columna si está presente */}
      {usuarioLabel && usuarioValue && (
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium mb-1">
            {usuarioValue}
          </span>
          <span className="text-[#CBCACA] text-xs">{usuarioLabel}</span>
        </div>
      )}

      {/* ID/Email - Solo mostrar si no está oculto */}
      {!hideId && (
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium mb-1">
            {userEmail ? censorEmail(userEmail) : (id || '—')}
          </span>
          <span className="text-[#CBCACA] text-xs">{userEmail ? 'Correo' : 'ID'}</span>
        </div>
      )}

      {/* Fecha */}
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium mb-1">{formatFecha(fecha)}</span>
        <span className="text-[#CBCACA] text-xs">Fecha</span>
      </div>

      {/* Tarjeta/Empresa - Solo mostrar si no está oculta */}
      {!hideTarjeta && (
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium mb-1">{tarjeta}</span>
          <span className="text-[#CBCACA] text-xs">{labelEmpresa ? 'Empresa' : 'Tarjeta'}</span>
        </div>
      )}

      {/* Tipo de Comisión - Mostrar si hay commissionType o nivel */}
      {(commissionType || (nivel !== undefined && nivel !== null)) && (
        <div className="flex flex-col">
          <div className="mb-1">
            {getCommissionTypeBadge()}
          </div>
          <span className="text-[#CBCACA] text-xs">Tipo de comisión</span>
        </div>
      )}

      {/* Nivel - NO mostrar si se está mostrando el badge de tipo de comisión */}
      {nivel !== undefined && !showCommissionTypeBadge && (
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium mb-1">{nivel}</span>
          <span className="text-[#CBCACA] text-xs">Nivel</span>
        </div>
      )}

      {/* Estado */}
      <div className="flex flex-col">
        <span className={`text-sm font-medium mb-1 ${getEstadoColor(estado)}`}>{estado}</span>
        <span className="text-[#CBCACA] text-xs">Estado</span>
      </div>

      {/* Monto/Comisión */}
      <div className="flex flex-col">
        <span className="text-[#FFF100] text-sm font-bold mb-1">
          ${formatMonto(monto)}
        </span>
        <span className="text-[#CBCACA] text-xs">{labelEmpresa ? 'Comisión' : 'Monto'}</span>
      </div>

      {/* Acción - Ver detalle */}
      <div className="flex flex-col col-span-2 md:col-span-1 justify-start">
        <button
          onClick={onVerDetalle}
          disabled={!onVerDetalle}
          className={`action-text text-left mb-1 py-1 ${!onVerDetalle ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {actionLabel}
        </button>
        <span className="text-[#CBCACA] text-xs invisible">Acción</span>
      </div>
    </div>
    </FoldedCard>
  );
};

export default ClaimItem;

