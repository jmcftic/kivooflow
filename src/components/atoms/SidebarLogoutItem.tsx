import React from 'react';
import { useTranslation } from 'react-i18next';
import SidebarBackgroundItemLogout from './SidebarBackgroundItemLogout';
import LogoutIcon from './LogoutIcon';
import { authService } from '../../services/auth';

interface SidebarLogoutItemProps {
  isCollapsed?: boolean;
  onLoggedOut?: () => void;
}

const SidebarLogoutItem: React.FC<SidebarLogoutItemProps> = ({ 
  isCollapsed = false,
  onLoggedOut 
}) => {
  const { t } = useTranslation('navigation');
  const handleLogout = async () => {
    try {
      await authService.logout();
      if (onLoggedOut) onLoggedOut();
      // Clear any remaining tokens manually
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Clear tokens even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = "/";
    }
  };

  return (
    <div 
      className={`relative ${isCollapsed ? 'w-[48px]' : 'w-[252px]'} h-[32px] mx-auto cursor-pointer transition-all duration-300`}
      onClick={handleLogout}
    >
      {/* Contenido del elemento */}
      <div className={`relative z-40 flex items-center h-full transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {/* Fondo rojo para el icono */}
        <div className={`w-8 h-8 relative z-50 flex-shrink-0 transition-all duration-300 ${!isCollapsed ? 'mr-3' : ''}`}>
          <SidebarBackgroundItemLogout />
          
          {/* Icono principal */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-60">
            <div className="w-7 h-7 flex items-center justify-center">
              <LogoutIcon />
            </div>
          </div>
        </div>
        
        {/* Texto del elemento - con transición suave */}
        <span 
          className={`text-sm transition-all duration-300 ${
            isCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100 scale-100'
          }`}
          style={{ color: '#c94740' }}
        >
          {t('menu.logout')}
        </span>
      </div>
    </div>
  );
};

export default SidebarLogoutItem;
