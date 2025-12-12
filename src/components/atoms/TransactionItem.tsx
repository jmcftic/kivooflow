import React, { FunctionComponent } from "react";
import SidebarBackgroundItemSecondary from "./SidebarBackgroundItemSecondary";
import ArrowUpIcon from "./ArrowUpIcon";
import ArrowDownIcon from "./ArrowDownIcon";

export type TransactionItemType = {
  empresa: string;
  montoUSDT: number;
  montoCOP: number;
  tipo: "ingreso" | "egreso";
  className?: string;
  cryptocurrency?: string; // Opcional: tipo de crypto (USDT, USDC, etc.)
  localCurrency?: string; // Opcional: moneda local (MXN, USD, COP, etc.)
  hideLocalCurrency?: boolean; // Opcional: ocultar moneda local (para B2C)
  fecha?: string; // Opcional: fecha de la transacción (createdAt)
};

const TransactionItem: FunctionComponent<TransactionItemType> = ({ 
  empresa,
  montoUSDT,
  montoCOP,
  tipo,
  className = "",
  cryptocurrency,
  localCurrency,
  hideLocalCurrency = false,
  fecha
}) => {
  const isPositive = montoUSDT > 0;
  const colorClass = isPositive ? "text-[#32d74b]" : "text-[#ff6d64]";
  
  // Función para formatear la fecha
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-MX', {
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
  
  return (
    <div className={`flex items-center justify-between py-3 border-b border-[#333] last:border-b-0 ${className}`}>
      {/* Lado izquierdo: Icono y nombre */}
      <div className="flex items-center flex-1">
        {/* Icono con fondo gris */}
        <div className="flex-shrink-0 w-8 h-8 relative mr-3">
          <SidebarBackgroundItemSecondary />
          
          {/* Icono de flecha */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {tipo === "ingreso" ? (
              <ArrowUpIcon size={14} />
            ) : (
              <ArrowDownIcon size={14} />
            )}
          </div>
        </div>
        
        {/* Nombre de la empresa y fecha */}
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium">{empresa}</span>
          {fecha && (
            <span className="text-white/60 text-xs mt-0.5">{formatDate(fecha)}</span>
          )}
        </div>
      </div>
      
      {/* Lado derecho: Montos */}
      <div className="flex flex-col items-end">
        {/* Monto en USDT */}
        <div className={`text-sm font-semibold ${colorClass}`}>
          {isPositive ? '+' : ''}{montoUSDT.toFixed(2)} <span className="text-[#FFF100]">{cryptocurrency || 'USDT'}</span>
        </div>
        
        {/* Monto en moneda local - Solo mostrar si no está oculto (para B2C) */}
        {!hideLocalCurrency && (
          <div className="text-xs text-[#CBCACA]">
            {isPositive ? '+' : ''}{montoCOP.toLocaleString('es-CO')} {localCurrency || 'COP'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;

