import React, { useState } from 'react';
import Logo from './Logo';
import LogoMini from './LogoMini';
import SidebarNavigation from '../molecules/SidebarNavigation';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
  };

  return (
    <div 
      className={`${isCollapsed ? 'w-[80px] bg-[#212020]' : 'w-[284px]'} h-screen flex-none order-0 flex-grow-0 z-50 relative transition-all duration-300 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Fondo del sidebar - Solo visible cuando está expandido */}
      {!isCollapsed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Imagen PNG con la parte cortada que deja ver el fondo de la página */}
          <div className="absolute bottom-[-64.89%] left-0 right-0 top-0">
            <img
              alt=""
              className="block max-w-none size-full object-cover"
              height="1688.528"
              src="/SidebarBg.png"
              width="284"
            />
          </div>
        </div>
      )}
      
      {/* Logo Kivoo */}
      <div className="pt-6.5 px-6 flex justify-center relative z-60">
        {isCollapsed ? (
          <LogoMini />
        ) : (
          <Logo width={180} height={25} />
        )}
      </div>
      
      {/* Contenido del sidebar */}
      <div className="mt-8 px-6 relative z-60">
        <SidebarNavigation isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Sidebar;