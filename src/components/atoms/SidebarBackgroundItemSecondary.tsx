import React from 'react';

interface SidebarBackgroundItemSecondaryProps {
  className?: string;
}

const SidebarBackgroundItemSecondary: React.FC<SidebarBackgroundItemSecondaryProps> = ({ className = "" }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${className}`}>
      <path d="M24 14.8712C24 15.0955 23.9421 15.3172 23.8185 15.5044C23.4865 16.0078 23.0424 16.5379 22.4482 17.0508C20.6488 18.604 15.1114 23.497 14.0732 23.8076C13.8852 23.8639 13.6811 23.9169 13.4732 23.9669C13.3801 23.9892 13.2847 24 13.1889 24H1.2549C0.561839 24 0 23.4382 0 22.7451V1.2549C0 0.561839 0.561839 0 1.2549 0H22.7451C23.4382 0 24 0.561839 24 1.2549V14.8712Z" fill="#4A4A4A"/>
    </svg>
  );
};

export default SidebarBackgroundItemSecondary;
