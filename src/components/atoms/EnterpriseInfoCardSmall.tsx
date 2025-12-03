import { cn } from "@/lib/utils"
import React from "react"
import IncreaseArrow from "./IncreaseArrow"
import DecreaseArrow from "./DecreaseArrow"

interface EnterpriseInfoCardSmallProps {
  primaryText: string;
  secondaryText: string;
  className?: string;
  gradientColor?: string;
  backgroundColor?: string;
  height?: number;
  showChart?: boolean;
  percentageChange?: number | null;
  secondaryTextColor?: 'white' | 'gray' | 'black';
  forceSmallFont?: boolean; // Forzar tamaño de fuente pequeño
}

// SVG Background para el componente pequeño con path decorativo invertido
const SmallCardSVG = ({ backgroundColor = "#2d2d2d", gradientColor = "#fff000", uniqueId }: { backgroundColor?: string; gradientColor?: string; uniqueId: string }) => {
  const gradientId = `paint0_linear_small_${uniqueId}`;
  
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 199 50"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="199" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopOpacity="0"/>
          <stop offset="1" stopColor={gradientColor} stopOpacity="0.28"/>
        </linearGradient>
      </defs>
      {/* Path decorativo invertido en la esquina superior derecha como forma visible - reducido 20% */}
      <g transform="translate(199, 0) scale(-1, 1)">
        <g transform="translate(19.9, 5) scale(0.8)">
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
      </g>
    </svg>
  );
};

// SVG Chart para la gráfica en la parte inferior derecha del componente pequeño
const SmallChartSVG = () => (
  <svg 
    width="195" 
    height="114" 
    viewBox="0 0 195 114" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    style={{ display: 'block' }}
  >
    <path d="M4.24645 43.7457L0.709351 40.0492V90L192.709 113.5V42.5L187.209 32L184.004 27.513C182.878 25.9359 181.059 25 179.121 25C178.865 25 178.626 25.131 178.488 25.3474L167.689 42.3179C166.223 44.6213 162.931 44.8118 161.21 42.6928L152.565 32.0537C152.058 31.4293 151.2 31.2146 150.458 31.5268L143.866 34.3026C142.851 34.73 141.681 34.5472 140.845 33.8304C139.654 32.8098 137.869 32.9172 136.809 34.0733L136.45 34.4646C134.856 36.2039 132.026 35.8701 130.88 33.8076L129.424 31.1872C128.651 29.795 127.323 28.7966 125.771 28.4403L125.209 28.3115C123.91 28.7587 122.789 29.611 122.011 30.743L119.21 34.8175C118.284 36.1636 116.699 36.899 115.074 36.7365C113.595 36.5886 112.139 37.1839 111.188 38.3256L104.073 46.8632C103.251 47.8504 101.907 48.2326 100.688 47.8262C100.052 47.6144 99.5019 47.2037 99.1178 46.6549L96.9425 43.5473C96.4547 42.8504 95.9069 42.1975 95.3054 41.596L95.03 41.3206C93.4942 39.7849 92.2324 37.9977 91.2991 36.0366L90.0406 33.3919L87.3623 26.1872L80.8354 36.9662C80.4817 37.5502 79.739 37.7648 79.1284 37.4595C78.5887 37.1897 77.9346 37.3232 77.5439 37.7829L70.2917 46.3149C69.9223 46.7495 69.3806 47 68.8102 47C68.1272 47 67.4943 46.6417 67.143 46.056L62.7108 38.6691C62.0895 37.6336 60.9704 37 59.7628 37C58.4981 37 57.3354 36.3056 56.7358 35.192L54.8382 31.6678C54.4361 30.9211 53.7494 30.3686 52.934 30.1356C51.6108 29.7576 50.1955 30.2842 49.4412 31.4352L46.1224 36.5L45.2094 38.1372L41.7094 46L37.9824 53.371C37.8149 53.7023 37.4753 53.9111 37.1041 53.9111C36.8507 53.9111 36.6071 53.8134 36.424 53.6383L36.1366 53.3636C35.8579 53.0971 35.6632 52.7549 35.5766 52.3792L29.4934 25.9844C29.4515 25.8023 29.3784 25.6288 29.2775 25.4716C28.7223 24.6067 27.5135 24.4682 26.777 25.1852L26.6108 25.3471C26.3677 25.5838 26.1959 25.8839 26.1148 26.2133L22.8777 39.3651C22.7734 39.789 22.4528 40.1263 22.0347 40.252C21.5389 40.4009 21.0029 40.2247 20.6923 39.8106L20.3352 39.3345C19.9412 38.8092 19.3229 38.5 18.6663 38.5H18.3677C17.3514 38.5 16.4222 39.0742 15.9677 39.9833L14.89 42.1387C12.8533 46.2121 7.39496 47.0362 4.24645 43.7457Z" fill="url(#paint0_linear_small_chart)"/>
    <path d="M0.709351 40.2927L7.48941 45.4086C9.42637 46.8701 12.251 45.9937 13.2554 43.7848C15.0399 39.8602 17.8352 35.3654 20.2044 38.8387C24.0293 44.4462 24.2523 21.5925 28.718 23.2625C30.939 24.0931 31.4069 34.7358 33.4067 43.6156C34.4456 48.2286 35.0757 51.2504 36.0093 52.7886C36.7386 53.9903 38.2116 53.1667 38.7731 51.8779L45.77 35.8179C45.8737 35.5799 46.1892 35.5295 46.3619 35.7233C46.5348 35.9173 46.8506 35.8666 46.954 35.6282L48.8444 31.2702C50.0871 28.4054 54.2136 28.6007 55.1802 31.57L56.5932 35.9107C56.9488 37.003 58.3046 37.3772 59.17 36.6218C59.9423 35.9478 61.1402 36.1624 61.6304 37.0626L66.0147 45.1133C67.2875 47.4504 70.5893 47.5949 72.0613 45.3779L77.3518 37.4103C77.8052 36.7274 78.7469 36.5807 79.3866 37.0934C80.0967 37.6626 81.1529 37.4105 81.5293 36.5819L86.2499 26.1913C86.6732 25.2596 87.9467 25.1364 88.5408 25.9697C88.6352 26.1022 88.7046 26.2509 88.7453 26.4085L91.43 36.7993C91.6593 37.6867 92.3086 38.4056 93.1681 38.7237C93.7577 38.9419 94.2566 39.3523 94.5845 39.8887L98.3741 46.088C99.6303 48.1431 102.53 48.3664 104.086 46.5279L112.066 37.099C112.935 36.0732 114.427 35.8467 115.561 36.5687C116.93 37.4411 118.755 36.9084 119.44 35.436L122.254 29.3897C123.476 26.7632 127.165 26.6426 128.556 29.1837L131.006 33.6579C132.069 35.6006 134.871 35.5678 135.889 33.6008C136.812 31.8162 139.27 31.5804 140.515 33.1569L140.624 33.2951C141.531 34.4425 143.154 34.7282 144.398 33.9593L148.405 31.4823C149.954 30.5249 151.977 30.9016 153.078 32.3524L161.94 44.0338C163.49 46.0778 166.634 45.8399 167.859 43.5857L177.288 26.2385C178.626 23.7772 182.159 23.7773 183.497 26.2385L187.032 32.7424L193.709 46" stroke="#C94740" strokeWidth="2.35556"/>
    <defs>
      <linearGradient id="paint0_linear_small_chart" x1="44.6496" y1="23.7972" x2="44.6496" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C94740" stopOpacity="0.3"/>
        <stop offset="1" stopColor="#C94740" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

export function EnterpriseInfoCardSmall({
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
}: EnterpriseInfoCardSmallProps) {
  const hasPercentageChange = percentageChange != null && !isNaN(percentageChange);
  const isPositive = hasPercentageChange && percentageChange >= 0;
  const isNegative = hasPercentageChange && percentageChange < 0;
  
  // Contar dígitos numéricos en el texto (sin contar el símbolo $ y puntos decimales)
  const countDigits = (text: string): number => {
    // Remover símbolos no numéricos excepto el punto decimal
    const numericText = text.replace(/[^0-9.]/g, '');
    // Contar solo los dígitos (no el punto decimal)
    return numericText.replace(/\./g, '').length;
  };
  
  const digitCount = countDigits(primaryText);
  const shouldReduceFontSize = forceSmallFont || digitCount > 6;
  const fontSize = shouldReduceFontSize ? '20px' : '40px'; // Reducir 50% si tiene más de 6 cifras o si se fuerza
  
  // Generar un ID único para este componente usando useMemo para evitar regeneraciones
  const uniqueId = React.useMemo(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  return (
    <div 
      className={cn("relative w-full overflow-hidden isolate", className)} 
      style={{ height: `${height}px` }}
    >
      {/* SVG Background - mantiene dimensiones proporcionales aunque el contenedor se estire */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        <SmallCardSVG backgroundColor={backgroundColor} gradientColor={gradientColor} uniqueId={uniqueId} />
      </div>

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col px-3 py-2.5 overflow-hidden w-full">
        {/* Texto principal - alineado a la izquierda arriba */}
        <div className="flex-1 flex flex-col justify-start min-w-0 w-full">
          <div 
            className={backgroundColor === '#FFF100' || backgroundColor === '#fced00' ? 'text-black' : 'text-white'}
            style={{ 
              height: '40px',
              display: 'flex',
              alignItems: 'flex-start',
              fontFamily: 'Archivo, sans-serif',
              fontSize: fontSize,
              lineHeight: '1',
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <span className="truncate flex-1 min-w-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{primaryText}</span>
            {hasPercentageChange && (
              <div className="flex items-center gap-1 flex-shrink-0 ml-2" style={{ fontSize: '16px', lineHeight: '1' }}>
                {isPositive ? (
                  <IncreaseArrow width={17} height={16} />
                ) : (
                  <DecreaseArrow width={17} height={16} />
                )}
                <span style={{ color: isPositive ? '#198500' : '#C94740' }}>
                  {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
                </span>
              </div>
            )}
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

      {/* Gráfica en la parte inferior derecha - solo se muestra si showChart es true */}
      {showChart && (
        <div 
          className="absolute"
          style={{ 
            bottom: '10px',
            right: '0',
            width: '195px',
            height: '114px',
            zIndex: 5
          }}
        >
          <SmallChartSVG />
        </div>
      )}
    </div>
  )
}

export default EnterpriseInfoCardSmall

