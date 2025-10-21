import React, { FunctionComponent } from "react";
import FoldedCard from "./FoldedCard";

export type ClaimItemType = {
  id: string;
  fecha: string;
  tarjeta: string;
  estado: string;
  monto: number;
  onVerDetalle?: () => void;
  className?: string;
};

const ClaimItem: FunctionComponent<ClaimItemType> = ({ 
  id,
  fecha,
  tarjeta,
  estado,
  monto,
  onVerDetalle,
  className = ""
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

  // Color del estado
  const getEstadoColor = (estado: string) => {
    switch(estado.toLowerCase()) {
      case 'aprobado':
        return 'text-[#32d74b]';
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
      className={`min-h-[92px] ${className}`}
      gradientColor="#FFF100"
      backgroundColor="#212020"
      variant="md"
    >
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-4 lg:gap-6 w-full">
      {/* ID */}
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium mb-1">{id}</span>
        <span className="text-[#CBCACA] text-xs">ID</span>
      </div>

      {/* Fecha */}
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium mb-1">{formatFecha(fecha)}</span>
        <span className="text-[#CBCACA] text-xs">Fecha</span>
      </div>

      {/* Tarjeta */}
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium mb-1">{tarjeta}</span>
        <span className="text-[#CBCACA] text-xs">Tarjeta</span>
      </div>

      {/* Estado */}
      <div className="flex flex-col">
        <span className={`text-sm font-medium mb-1 ${getEstadoColor(estado)}`}>{estado}</span>
        <span className="text-[#CBCACA] text-xs">Estado</span>
      </div>

      {/* Monto */}
      <div className="flex flex-col">
        <span className="text-[#32d74b] text-sm font-semibold mb-1">${monto.toFixed(2)}</span>
        <span className="text-[#CBCACA] text-xs">Monto</span>
      </div>

      {/* Ver detalle */}
      <div className="flex flex-col col-span-2 md:col-span-1">
        <button
          onClick={onVerDetalle}
          className="action-text text-left mb-1"
        >
          Ver detalle
        </button>
        <span className="text-[#CBCACA] text-xs invisible">Acción</span>
      </div>
    </div>
    </FoldedCard>
  );
};

export default ClaimItem;

