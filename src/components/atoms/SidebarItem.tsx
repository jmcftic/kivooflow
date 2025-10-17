import React from 'react';
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
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  isActive = false, 
  isCollapsed = false,
  onClick,
  className = "" 
}) => {
  return (
    <div 
      className={`relative ${isCollapsed ? 'w-[48px]' : 'w-[252px]'} h-[32px] mx-auto mb-2 cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Fondo amarillo para hover y estado activo */}
      {isCollapsed ? (
        <SidebarBackgroundItemPrimaryMini 
          className={`${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        />
      ) : (
        <SidebarBackgroundItemPrimaryFull 
          className={`${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
          <span className={`text-sm font-medium transition-colors duration-200 ${
            isActive ? 'text-black' : 'text-white group-hover:text-black'
          }`} style={{ fontFamily: 'Brahma Rounded Medium, sans-serif' }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default SidebarItem;
