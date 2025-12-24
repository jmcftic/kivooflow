import React from 'react';

interface ManualLoadsIconProps {
  className?: string;
}

const ManualLoadsIcon: React.FC<ManualLoadsIconProps> = ({ className = "" }) => {
  return (
    <svg 
      width="14" 
      height="12" 
      viewBox="0 0 14 12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M1 2H13V3H1V2Z" fill="white"/>
      <path d="M1 5.5H13V6.5H1V5.5Z" fill="white"/>
      <path d="M1 9H10V10H1V9Z" fill="white"/>
      <path d="M11 9H13V10H11V9Z" fill="white"/>
    </svg>
  );
};

export default ManualLoadsIcon;

