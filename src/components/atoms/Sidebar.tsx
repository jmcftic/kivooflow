import React from 'react';
import Logo from './Logo';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  return (
    <div className={`w-[284px] h-screen bg-[#212020] flex-none order-0 flex-grow-0 z-0 ${className}`}
         style={{
           backgroundImage: "url('/Ki-6 2.png')",
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      {/* Kivoo Logo en la parte superior */}
      <div className="pt-8 px-6 flex justify-center">
        <Logo width={180} height={25} />
      </div>
      
      {/* Contenido adicional del sidebar puede ir aquí */}
      <div className="mt-8 px-6">
        {/* Placeholder para futuras opciones del menú */}
      </div>
    </div>
  );
};

export default Sidebar;
