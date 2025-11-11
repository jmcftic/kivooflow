import React from 'react';

interface SidebarLogoOpenProps {
  className?: string;
}

const SidebarLogoOpen: React.FC<SidebarLogoOpenProps> = ({ className = "" }) => {
  return (
    <img
      src="/icons/Dashboard/OpenSidebarLogo.svg"
      alt="Logo Kivo"
      className={className}
    />
  );
};

export default SidebarLogoOpen;

