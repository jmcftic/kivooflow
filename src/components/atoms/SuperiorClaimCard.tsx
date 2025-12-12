import React from 'react';
import { cn } from "@/lib/utils";
import IncreaseArrow from "./IncreaseArrow";
import DecreaseArrow from "./DecreaseArrow";

interface SuperiorClaimCardProps {
  primaryText: string;
  secondaryText: string;
  className?: string;
  gradientColor?: string;
  backgroundColor?: string;
  height?: number;
  showChart?: boolean;
  percentageChange?: number | null;
  secondaryTextColor?: 'white' | 'gray' | 'black';
  forceSmallFont?: boolean;
}

// SVG Background con clipPath decorativo invertido
const SuperiorCardSVG = ({ backgroundColor = "#2d2d2d", gradientColor = "#fff000", uniqueId }: { backgroundColor?: string; gradientColor?: string; uniqueId: string }) => {
  const gradientId = `paint0_linear_superior_${uniqueId}`;
  
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 199 50"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="199" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopOpacity="0"/>
          <stop offset="1" stopColor={gradientColor} stopOpacity="0.28"/>
        </linearGradient>
      </defs>
      {/* Path decorativo invertido en la esquina superior derecha */}
      <g transform="translate(199, 0) scale(-1, 1)">
        <path
          d="M0.110056 19.6483C0.113891 18.6249 0.509132 17.6425 1.21594 16.9024C5.69946 12.2078 10.9553 6.72622 16.2842 1.27238C17.0391 0.499794 18.0752 0.0670555 19.1553 0.0711037L194.182 0.727087C196.391 0.735367 198.176 2.53293 198.167 4.74205L198.014 45.7418C198.005 47.9509 196.208 49.735 193.999 49.7267L4.00002 49.0146C1.7909 49.0064 0.00676175 47.2088 0.0150413 44.9997L0.110056 19.6483Z"
          fill={backgroundColor}
          stroke="none"
        />
        <path
          d="M0.110056 19.6483C0.113891 18.6249 0.509132 17.6425 1.21594 16.9024C5.69946 12.2078 10.9553 6.72622 16.2842 1.27238C17.0391 0.499794 18.0752 0.0670555 19.1553 0.0711037L194.182 0.727087C196.391 0.735367 198.176 2.53293 198.167 4.74205L198.014 45.7418C198.005 47.9509 196.208 49.735 193.999 49.7267L4.00002 49.0146C1.7909 49.0064 0.00676175 47.2088 0.0150413 44.9997L0.110056 19.6483Z"
          fill={`url(#${gradientId})`}
          fillOpacity="0.2"
          stroke="none"
        />
      </g>
    </svg>
  );
};

export const SuperiorClaimCard: React.FC<SuperiorClaimCardProps> = ({
  primaryText,
  secondaryText,
  className,
  gradientColor = "#fff000",
  backgroundColor = "#2d2d2d",
  height = 129,
  showChart = false,
  percentageChange,
  secondaryTextColor = 'gray',
  forceSmallFont = false,
}) => {
  const hasPercentageChange = percentageChange != null && !isNaN(percentageChange);
  const isPositive = hasPercentageChange && percentageChange >= 0;
  
  // Contar dígitos numéricos en el texto (sin contar el símbolo $ y puntos decimales)
  const countDigits = (text: string): number => {
    const numericText = text.replace(/[^0-9.]/g, '');
    return numericText.replace(/\./g, '').length;
  };
  
  const digitCount = countDigits(primaryText);
  const shouldReduceFontSize = forceSmallFont || digitCount > 6;
  const fontSize = shouldReduceFontSize ? '12.5px' : '25px'; // Aumentado 25%: 20px->25px, 10px->12.5px
  
  // Generar un ID único para este componente
  const uniqueId = React.useMemo(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  return (
    <div 
      className={cn("relative w-full overflow-hidden isolate", className)} 
      style={{ height: `${height}px` }}
    >
      {/* SVG Background */}
      <SuperiorCardSVG backgroundColor={backgroundColor} gradientColor={gradientColor} uniqueId={uniqueId} />

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col px-4 py-3 overflow-hidden w-full">
        {/* Texto principal - centrado verticalmente */}
        <div className="flex-1 flex flex-col justify-center min-w-0 w-full">
          <div 
            className={backgroundColor === '#FFF100' || backgroundColor === '#fced00' ? 'text-black' : 'text-white'}
            style={{ 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'Archivo, sans-serif',
              fontSize: fontSize,
              lineHeight: '1',
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <span className="flex-1 min-w-0" style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {primaryText}
              </span>
              {hasPercentageChange && (
                <span className="flex items-center gap-1 flex-shrink-0" style={{ fontSize: '10px', lineHeight: '1' }}>
                  {isPositive ? (
                    <IncreaseArrow width={11} height={10} />
                  ) : (
                    <DecreaseArrow width={11} height={10} />
                  )}
                  <span style={{ color: isPositive ? '#198500' : '#C94740' }}>
                    {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
                  </span>
                </span>
              )}
            </span>
          </div>
          
          {/* Texto secundario - debajo del principal */}
          <div 
            className={
              secondaryTextColor === 'white' 
                ? 'text-white' 
                : secondaryTextColor === 'black'
                ? 'text-black'
                : 'text-gray-400'
            }
            style={{ 
              height: '18px',
              fontFamily: 'Archivo, sans-serif',
              fontSize: '14px',
              lineHeight: '1.29',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              maxWidth: '100%'
            }}
          >
            {secondaryText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperiorClaimCard;

