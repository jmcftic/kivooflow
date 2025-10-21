import React, { FunctionComponent } from "react";

export type ArrowUpIconType = {
  className?: string;
  size?: number;
};

const ArrowUpIcon: FunctionComponent<ArrowUpIconType> = ({ 
  className = "",
  size = 16,
  ...props 
}) => (
  <img 
    src="/icons/Dashboard/ArrowUp.svg"
    alt="Arrow Up"
    width={size} 
    height={size}
    className={className}
    {...props}
  />
);

export default ArrowUpIcon;

