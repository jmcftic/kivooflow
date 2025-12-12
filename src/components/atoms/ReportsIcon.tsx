import React from 'react';

interface ReportsIconProps {
  className?: string;
}

const ReportsIcon: React.FC<ReportsIconProps> = ({ className = "" }) => {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M3.5 2.5C3.22386 2.5 3 2.72386 3 3V13C3 13.2761 3.22386 13.5 3.5 13.5H12.5C12.7761 13.5 13 13.2761 13 13V5.5L9.5 2H3.5Z" stroke="white" strokeWidth="1.2" fill="none"/>
      <path d="M9.5 2V5.5H13" stroke="white" strokeWidth="1.2" fill="none"/>
      <path d="M5 8H11" stroke="white" strokeWidth="1.2"/>
      <path d="M5 10H11" stroke="white" strokeWidth="1.2"/>
      <path d="M5 6H8" stroke="white" strokeWidth="1.2"/>
    </svg>
  );
};

export default ReportsIcon;

