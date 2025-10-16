import React, { FunctionComponent } from 'react';

interface Ki6IconProps {
  width?: number;
  height?: number;
  className?: string;
  rotation?: number;
}

const Ki6Icon: FunctionComponent<Ki6IconProps> = ({ 
  width = 1425.46, 
  height = 470.04, 
  rotation = -166.82,
  className = "" 
}) => {
  return (
    <img
      src="/Ki-6 2.png"
      alt="Ki-6 Icon"
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

export default Ki6Icon;
