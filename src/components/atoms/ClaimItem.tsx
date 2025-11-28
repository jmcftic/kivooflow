import React, { FunctionComponent } from "react";
import FoldedCard from "./FoldedCard";

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
  actionLabel = "Ver detalle"
}) => {
  // Formatear fecha a formato local
  const formatFecha = (fechaStr: string) => {
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const toNumber = (value: number | string): number => {
    if (typeof value === "number") return value;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatMonto = (value: number | string): string => {
    const numericValue = toNumber(value);
    const valueStr = numericValue.toString();
    const [integerPart, decimalPart = ""] = valueStr.split(".");
    const truncatedDecimals = decimalPart.slice(0, 2);
    return truncatedDecimals ? `${integerPart}.${truncatedDecimals}` : integerPart;
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

  return (
    <FoldedCard 
      className={`min-h-[180px] md:min-h-[92px] ${className}`}
      gradientColor="#FFF100"
      backgroundColor="#212020"
      variant="md"
    >
    <div className={`grid grid-cols-2 ${nivel !== undefined ? (id ? 'md:grid-cols-7' : 'md:grid-cols-6') : 'md:grid-cols-6'} gap-4 md:gap-4 lg:gap-6 w-full py-4 md:py-0`}>
      {/* ID */}
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium mb-1">{id || '—'}</span>
        <span className="text-[#CBCACA] text-xs">ID</span>
      </div>

      {/* Fecha */}
        <div className="flex flex-col">
        <span className="text-white text-sm font-medium mb-1">{formatFecha(fecha)}</span>
        <span className="text-[#CBCACA] text-xs">Fecha</span>
      </div>

      {/* Tarjeta/Empresa */}
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium mb-1">{tarjeta}</span>
        <span className="text-[#CBCACA] text-xs">{labelEmpresa ? 'Empresa' : 'Tarjeta'}</span>
      </div>

      {/* Nivel - Solo para B2B */}
      {nivel !== undefined && (
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

      {/* Monto */}
      <div className="flex flex-col">
        <span className="text-[#32d74b] text-sm font-semibold mb-1">
          ${formatMonto(monto)}
        </span>
        <span className="text-[#CBCACA] text-xs">Monto</span>
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

