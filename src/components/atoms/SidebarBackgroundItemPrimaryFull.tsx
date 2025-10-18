import React from 'react';

interface SidebarBackgroundItemPrimaryFullProps {
  className?: string;
}

const SidebarBackgroundItemPrimaryFull: React.FC<SidebarBackgroundItemPrimaryFullProps> = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 z-30 transition-all duration-200 ${className}`}>
      {/* Fondo sólido amarillo para evitar transparencia */}
      <div className="absolute inset-0 bg-[#FFF000] rounded-lg"></div>
      <svg width="252" height="36" viewBox="0 0 252 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[32px] relative z-10">
        <path d="M252 22.6002C252 22.9078 251.947 23.2138 251.827 23.497C251.253 24.8525 250.283 26.466 248.646 27.9971C247.063 29.4771 243.785 32.5976 240.739 35.3515C240.276 35.7703 239.673 36 239.049 36H2.53762C1.13613 36 0 34.8639 0 33.4624V2.53764C0 1.13614 1.13614 0 2.53763 0H249.462C250.864 0 252 1.13614 252 2.53763V22.6002Z" fill="#FFF000"/>
      </svg>
    </div>
  );
};

export default SidebarBackgroundItemPrimaryFull;
