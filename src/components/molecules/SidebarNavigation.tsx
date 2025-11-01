import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarItem from '../atoms/SidebarItem';
import DashboardIcon from '../atoms/DashboardIcon';
import ClaimsIcon from '../atoms/ClaimsIcon';
import CardAcquisitionIcon from '../atoms/CardAcquisitionIcon';
import CommissionsIcon from '../atoms/CommissionsIcon';
import NetworkIcon from '../atoms/NetworkIcon';
import ActivityIcon from '../atoms/ActivityIcon';
import HelpIcon from '../atoms/HelpIcon';
import SidebarDivider from '../atoms/SidebarDivider';
import SidebarLogoutItem from '../atoms/SidebarLogoutItem';

interface SidebarNavigationProps {
  className?: string;
  isCollapsed?: boolean;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ className = "", isCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const primaryNavItems = useMemo(() => ([
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      disabled: false,
    },
    {
      key: 'claims',
      label: 'Claims',
      icon: <ClaimsIcon />,
      path: '/claims',
      disabled: true,
    },
    {
      key: 'card',
      label: 'Adquisición de tarjeta',
      icon: <CardAcquisitionIcon />,
      path: '/card-acquisition',
      disabled: true,
    },
    {
      key: 'commissions',
      label: 'Comisiones',
      icon: <CommissionsIcon />,
      path: '/commissions',
      disabled: true,
    },
    {
      key: 'network',
      label: 'Red',
      icon: <NetworkIcon />,
      path: '/network',
      disabled: false,
    },
    {
      key: 'activity',
      label: 'Actividad',
      icon: <ActivityIcon />,
      path: '/activity',
      disabled: true,
    },
  ]), []);

  const helpItem = useMemo(() => ({
    key: 'help',
    label: 'Ayuda',
    icon: <HelpIcon />,
    path: '/help',
    disabled: true,
  }), []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="space-y-2 flex-1">
      {primaryNavItems.map((item) => (
        <SidebarItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          isActive={!item.disabled && location.pathname === item.path}
          isCollapsed={isCollapsed}
          onClick={!item.disabled ? () => navigate(item.path) : undefined}
          disabled={item.disabled}
          disabledMessage="El módulo estará próximamente disponible"
        />
      ))}
      
      {/* Línea divisoria */}
      {!isCollapsed && (
        <div className="mt-4">
          <SidebarDivider />
        </div>
      )}
      
      {/* Elemento Ayuda */}
      <div className="mt-4">
        <SidebarItem
          key={helpItem.key}
          icon={helpItem.icon}
          label={helpItem.label}
          isActive={false}
          isCollapsed={isCollapsed}
          onClick={undefined}
          disabled={helpItem.disabled}
          disabledMessage="El módulo estará próximamente disponible"
        />
      </div>
      
      {/* Segunda línea divisoria */}
      {!isCollapsed && (
        <div className="mt-4">
          <SidebarDivider />
        </div>
      )}
      </div>
      
      {/* Elemento Cerrar sesión - siempre en la parte inferior */}
      <div className="mt-auto pt-8 pb-8">
        {!isCollapsed && (
          <div className="mb-4">
            <SidebarDivider />
          </div>
        )}
        <div>
          <SidebarLogoutItem isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;
