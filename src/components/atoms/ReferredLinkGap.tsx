import React, { FunctionComponent } from "react";

export type ReferredLinkGapType = {
  className?: string;
  children?: React.ReactNode;
};

const ReferredLinkGap: FunctionComponent<ReferredLinkGapType> = ({ 
  className = "",
  children,
  ...props 
}) => (
  <div className={`relative w-full h-10 md:h-[49px] ${className}`}>
    <svg 
      width="100%" 
      height="49" 
      viewBox="0 0 600 49" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="none"
      {...props}
    >
      <rect x="0.5" y="0.5" width="599" height="48" rx="12" fill="#FEF100" fillOpacity="0.05"/>
      <rect x="0.5" y="0.5" width="599" height="48" rx="12" stroke="#FEF100" strokeDasharray="2 2"/>
    </svg>
    
    {/* Contenido del gap */}
    {children && (
      <div className="absolute inset-0 flex items-center justify-start pl-4">
        {children}
      </div>
    )}
  </div>
);

export default ReferredLinkGap;
