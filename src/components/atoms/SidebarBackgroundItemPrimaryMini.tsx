import React from 'react';

interface SidebarBackgroundItemPrimaryMiniProps {
  className?: string;
}

const SidebarBackgroundItemPrimaryMini: React.FC<SidebarBackgroundItemPrimaryMiniProps> = ({ className = "" }) => {
  return (
    <div
      className={`absolute inset-0 z-30 transition-all duration-200 ${className}`}
      style={{
        background: '#FFF000',
        borderRadius: '2.53763px',
        // Esquina inferior derecha cortada (versión mini)
        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)'
      }}
    />
  );
};

export default SidebarBackgroundItemPrimaryMini;
