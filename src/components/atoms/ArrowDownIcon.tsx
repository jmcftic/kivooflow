import React, { FunctionComponent } from "react";

export type ArrowDownIconType = {
  className?: string;
  size?: number;
};

const ArrowDownIcon: FunctionComponent<ArrowDownIconType> = ({ 
  className = "",
  size = 16,
  ...props 
}) => (
  <img 
    src="/icons/Dashboard/ArrowDown.svg"
    alt="Arrow Down"
    width={size} 
    height={size}
    className={className}
    {...props}
  />
);

export default ArrowDownIcon;

