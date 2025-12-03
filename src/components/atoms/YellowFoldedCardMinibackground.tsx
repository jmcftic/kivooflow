import React from 'react';

interface YellowFoldedCardMinibackgroundProps {
  className?: string;
  width?: number;
  height?: number;
}

const YellowFoldedCardMinibackground: React.FC<YellowFoldedCardMinibackgroundProps> = ({ 
  className = "", 
  width = 56, 
  height = 56 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 56 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M56 34.6986C56 35.222 55.8649 35.7391 55.5767 36.1759C54.8016 37.3508 53.765 38.5879 52.3779 39.7852C48.1793 43.4092 35.2609 54.8252 32.8379 55.5508C32.3986 55.6822 31.9215 55.806 31.4355 55.9227C31.2183 55.9749 30.9956 56 30.7723 56H2.9281C1.31096 56 0 54.689 0 53.0719V2.9281C0 1.31096 1.31096 0 2.9281 0H53.0719C54.689 0 56 1.31096 56 2.9281V34.6986Z" fill="#FFFF79"/>
    </svg>
  );
};

export default YellowFoldedCardMinibackground;

