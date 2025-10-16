import React, { FunctionComponent } from 'react';

interface Ki6SvgIconProps {
  width?: number;
  height?: number;
  className?: string;
  rotation?: number;
}

const Ki6SvgIcon: FunctionComponent<Ki6SvgIconProps> = ({ 
  width = 1425.46, 
  height = 470.04, 
  rotation = -166.82,
  className = "" 
}) => {
  return (
    <img
      src="/Ki-6 2.svg"
      alt="Ki-6 SVG Icon"
      width={width}
      height={height}
      className={className}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center'
      }}
    />
  );
};

export default Ki6SvgIcon;
