import React, { useEffect, useRef, useState } from 'react';
import SidebarBackgroundItemPrimaryFull from './SidebarBackgroundItemPrimaryFull';
import SidebarBackgroundItemPrimaryMini from './SidebarBackgroundItemPrimaryMini';
import SidebarBackgroundItemSecondary from './SidebarBackgroundItemSecondary';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  isActive = false, 
  isCollapsed = false,
  onClick,
  className = "",
  disabled = false,
  disabledMessage = "El módulo estará próximamente disponible"
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipIdRef = useRef<string>(`${label}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('sidebar-tooltip-show', handleExternalTooltip);
    };
  }, []);

  const handleExternalTooltip = (event: Event) => {
    const detail = (event as CustomEvent<{ id: string }>).detail;
    if (detail?.id !== tooltipIdRef.current) {
      setShowTooltip(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const handleClick = () => {
    if (disabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('sidebar-tooltip-show', handleExternalTooltip);
      window.addEventListener('sidebar-tooltip-show', handleExternalTooltip, { once: true });
      const event = new CustomEvent('sidebar-tooltip-show', {
        detail: { id: tooltipIdRef.current },
      });
      window.dispatchEvent(event);
      setShowTooltip(true);
      timeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
        timeoutRef.current = null;
      }, 2000);
      return;
    }

    onClick?.();
  };

  return (
    <div 
      className={`relative ${isCollapsed ? 'w-[48px]' : 'w-[252px]'} h-[32px] mx-auto mb-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer group'} ${className}`}
      onClick={handleClick}
    >
      {/* Fondo amarillo para hover y estado activo */}
      {isCollapsed ? (
        <SidebarBackgroundItemPrimaryMini 
          className={`${
            !disabled && isActive ? 'opacity-100' : !disabled ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <SidebarBackgroundItemPrimaryFull 
          className={`${
            !disabled && isActive ? 'opacity-100' : !disabled ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
          }`}
        />
      )}
      
      {/* Contenido del elemento */}
      <div className={`relative z-40 flex items-center h-full ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {/* Subfondo gris para el icono */}
        <div className={`w-6 h-6 relative z-50 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`}>
          <SidebarBackgroundItemSecondary />
          
          {/* Icono principal */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-60">
            <div className="w-4 h-4 flex items-center justify-center">
              {icon}
            </div>
          </div>
        </div>
        
        {/* Texto del elemento - solo visible cuando no está colapsado */}
        {!isCollapsed && (
          <span className={`text-sm transition-colors duration-200 ${
            !disabled && isActive ? 'text-black' : disabled ? 'text-white/60' : 'text-white group-hover:text-black'
          }`}>
            {label}
          </span>
        )}
      </div>

      {disabled && showTooltip && (
        <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 rounded-lg shadow-lg text-xs font-medium text-black bg-[#FFF100] animate-pulse whitespace-nowrap ${isCollapsed ? 'z-50' : ''}`}>
          {disabledMessage}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
