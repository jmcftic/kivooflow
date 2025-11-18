import React from 'react';

interface LevelFourPlusTagProps {
  className?: string;
  width?: number;
  height?: number;
  level?: number;
}

const LevelFourPlusTag: React.FC<LevelFourPlusTagProps> = ({ 
  className = "", 
  width = 66, 
  height = 22,
  level = 4 
}) => {
  // Calcular el ancho del SVG basado en el número de dígitos del nivel
  const svgWidth = level >= 10 ? 70 : 66; // Más ancho si el nivel tiene 2 dígitos
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${svgWidth} 22`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width={svgWidth} height="22" rx="6" fill="#FAFAF0" fillOpacity="0.04"/>
      <rect x="8" y="7.5" width="7" height="7" rx="2" fill="white"/>
      <text 
        x="20" 
        y="15" 
        fill="white" 
        fontSize="9" 
        fontFamily="Arial, sans-serif"
        fontWeight="500"
        letterSpacing="0.5px"
      >
        NIVEL {level}
      </text>
    </svg>
  );
};

export default LevelFourPlusTag;

