import { FunctionComponent } from "react";

export type VectorGradientType = {
  className?: string;
};

const VectorGradient: FunctionComponent<VectorGradientType> = ({ 
  className = "" 
}) => {
  return (
    <div className={`absolute top-0 left-0 pointer-events-none ${className}`}>
      <svg
        className="w-[280%] h-[200%]"
        viewBox="0 0 1019 706"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="vectorGradient" cx="0%" cy="50%" r="100%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4C4C4C" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#3A3A3A" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#212020" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#212020" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <path 
          d="M0 0.000205088V705.438L421.008 705.438C475.223 705.438 527.183 683.858 565.514 645.453L958.648 251.552C996.979 213.147 1018.52 161.052 1018.52 106.765V3.33786e-06L0 0.000205088Z" 
          fill="url(#vectorGradient)"
        />
      </svg>
    </div>
  );
};

export default VectorGradient;
