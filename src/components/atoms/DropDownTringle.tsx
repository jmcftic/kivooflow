import React from 'react';

interface DropDownTringleProps {
  className?: string;
  isExpanded?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const DropDownTringle: React.FC<DropDownTringleProps> = ({ className = "", isExpanded = false, onClick }) => (
  <svg
    width="17"
    height="9"
    viewBox="0 0 17 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
    style={{ 
      transform: isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)',
      transition: 'transform 0.3s ease'
    }}
  >
    <path
      d="M16.2812 1.28063L8.78122 8.78063C8.71156 8.85036 8.62884 8.90568 8.5378 8.94342C8.44675 8.98116 8.34915 9.00059 8.25059 9.00059C8.15203 9.00059 8.05443 8.98116 7.96339 8.94342C7.87234 8.90568 7.78962 8.85036 7.71996 8.78063L0.219966 1.28063C0.114957 1.17573 0.0434315 1.04204 0.0144437 0.89648C-0.0145441 0.750917 0.00030937 0.600025 0.0571237 0.462907C0.113938 0.32579 0.210159 0.208613 0.333604 0.12621C0.457049 0.0438069 0.602169 -0.000116571 0.750591 2.3235e-07H15.7506C15.899 -0.000116571 16.0441 0.0438069 16.1676 0.12621C16.291 0.208613 16.3872 0.32579 16.4441 0.462907C16.5009 0.600025 16.5157 0.750917 16.4867 0.89648C16.4577 1.04204 16.3862 1.17573 16.2812 1.28063Z"
      fill="white"
    />
  </svg>
);

export default DropDownTringle;


