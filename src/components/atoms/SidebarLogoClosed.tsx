import React from 'react';
import LogoMini from './LogoMini';

interface SidebarLogoClosedProps {
  className?: string;
}

const SidebarLogoClosed: React.FC<SidebarLogoClosedProps> = ({ className = "" }) => {
  return (
    <LogoMini className={className} />
  );
};

export default SidebarLogoClosed;

