import React, { FunctionComponent } from "react";

export type ShareLinkYellowIconType = {
  className?: string;
  size?: number;
};

const ShareLinkYellowIcon: FunctionComponent<ShareLinkYellowIconType> = ({ 
  className = "",
  size = 24,
  ...props 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="#FFF000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="#FFF000"/>
  </svg>
);

export default ShareLinkYellowIcon;
