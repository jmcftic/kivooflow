import React from 'react';

interface SidebarDividerProps {
  className?: string;
}

const SidebarDivider: React.FC<SidebarDividerProps> = ({ className = "" }) => {
  return (
    <div 
      className={`w-[252px] h-[1px] flex-none order-2 self-stretch flex-grow-0 mx-auto ${className}`}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
    />
  );
};

export default SidebarDivider;
