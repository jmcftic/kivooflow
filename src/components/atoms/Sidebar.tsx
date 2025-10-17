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
      className={`${isCollapsed ? 'w-[80px]' : 'w-[284px]'} h-screen bg-[#212020] flex-none order-0 flex-grow-0 z-50 relative transition-all duration-300 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* SVG de fondo rotado y centrado, cubre verticalmente */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
      <div
        className="absolute"
        style={{
          top: '25%',
          left: '50%',
          width: '100%',
          height: '600%',
          transform: 'translate(-20%, -50%) rotate(90deg)',
          transformOrigin: 'center',
          backgroundImage: "url('/Ki-6 2.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '300% auto',
          filter: 'grayscale(100%)'
        }}
      />

      </div>
      
      {/* Logo Kivoo */}
      <div className="pt-8 px-6 flex justify-center relative z-60">
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