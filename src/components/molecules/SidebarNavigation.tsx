import React from 'react';
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

interface SidebarNavigationProps {
  className?: string;
  isCollapsed?: boolean;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ className = "", isCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };
  
  const handleClaimsClick = () => {
    navigate('/claims');
  };

  const handleCardAcquisitionClick = () => {
    console.log('Navegando a Adquisición de tarjeta');
  };

  const handleCommissionsClick = () => {
    console.log('Navegando a Comisiones');
  };

  const handleNetworkClick = () => {
    navigate('/network');
  };

  const handleActivityClick = () => {
    console.log('Navegando a Actividad');
  };

  const handleHelpClick = () => {
    console.log('Navegando a Ayuda');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <SidebarItem
        icon={<DashboardIcon />}
        label="Dashboard"
        isActive={location.pathname === '/dashboard'}
        isCollapsed={isCollapsed}
        onClick={handleDashboardClick}
      />
      <SidebarItem
        icon={<ClaimsIcon />}
        label="Claims"
        isActive={location.pathname === '/claims'}
        isCollapsed={isCollapsed}
        onClick={handleClaimsClick}
      />
      <SidebarItem
        icon={<CardAcquisitionIcon />}
        label="Adquisición de tarjeta"
        isActive={false}
        isCollapsed={isCollapsed}
        onClick={handleCardAcquisitionClick}
      />
      <SidebarItem
        icon={<CommissionsIcon />}
        label="Comisiones"
        isActive={false}
        isCollapsed={isCollapsed}
        onClick={handleCommissionsClick}
      />
      <SidebarItem
        icon={<NetworkIcon />}
        label="Red"
        isActive={location.pathname === '/network'}
        isCollapsed={isCollapsed}
        onClick={handleNetworkClick}
      />
      <SidebarItem
        icon={<ActivityIcon />}
        label="Actividad"
        isActive={false}
        isCollapsed={isCollapsed}
        onClick={handleActivityClick}
      />
      
      {/* Línea divisoria */}
      {!isCollapsed && (
        <div className="mt-4">
          <SidebarDivider />
        </div>
      )}
      
      {/* Elemento Ayuda */}
      <div className="mt-4">
        <SidebarItem
          icon={<HelpIcon />}
          label="Ayuda"
          isActive={false}
          isCollapsed={isCollapsed}
          onClick={handleHelpClick}
        />
      </div>
      
      {/* Segunda línea divisoria */}
      {!isCollapsed && (
        <div className="mt-4">
          <SidebarDivider />
        </div>
      )}
    </div>
  );
};

export default SidebarNavigation;
