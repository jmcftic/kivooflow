import React, { FunctionComponent, useEffect, useState } from 'react';

interface VectorPatternProps {
  className?: string;
}

const VectorPattern: FunctionComponent<VectorPatternProps> = ({ 
  className = "" 
}) => {
  // Configuración del patrón
  const vectorWidth = 80;
  const vectorHeight = 96;
  const gap = 10; // separación más pequeña entre vectores
  const spacingX = vectorWidth + gap;
  const spacingY = vectorHeight + gap;


  

  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });

  useEffect(() => {
    const computeGrid = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cols = Math.ceil(vw / spacingX) + 2; // margen extra para cubrir
      const rows = Math.ceil(vh / spacingY) + 2;
      setGridSize({ rows, cols });
    };

    computeGrid();
    window.addEventListener('resize', computeGrid);
    return () => window.removeEventListener('resize', computeGrid);
  }, [spacingX, spacingY]);
  
  // Generar array de vectores con rotaciones alternadas
  const vectors = [];
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      const x = col * spacingX;
      const y = row * spacingY;
      // Rotación alternada: 0°, 90°, 180°, 270° en patrón
      const rotation = (row + col) % 4 * 90;
      
      vectors.push(
        <div
          key={`${row}-${col}`}
          className="absolute"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        >
          <img
            src="/Vector.svg"
            alt="Vector Pattern"
            width={vectorWidth}
            height={vectorHeight}
            className="opacity-60"
          />
        </div>
      );
    }
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {vectors}
    </div>
  );
};

export default VectorPattern;
