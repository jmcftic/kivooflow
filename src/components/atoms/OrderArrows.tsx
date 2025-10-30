import React from 'react';

interface OrderArrowsProps {
  className?: string;
}

const OrderArrows: React.FC<OrderArrowsProps> = ({ className = "" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.14645 9.14645C5.34171 8.95118 5.65829 8.95118 5.85355 9.14645L8 11.2929L10.1464 9.14645C10.3417 8.95118 10.6583 8.95118 10.8536 9.14645C11.0488 9.34171 11.0488 9.65829 10.8536 9.85355L8.35355 12.3536C8.15829 12.5488 7.84171 12.5488 7.64645 12.3536L5.14645 9.85355C4.95118 9.65829 4.95118 9.34171 5.14645 9.14645Z"
      fill="white"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.14645 6.85355C5.34171 7.04882 5.65829 7.04882 5.85355 6.85355L8 4.70711L10.1464 6.85355C10.3417 7.04882 10.6583 7.04882 10.8536 6.85355C11.0488 6.65829 11.0488 6.34171 10.8536 6.14645L8.35355 3.64645C8.15829 3.45118 7.84171 3.45118 7.64645 3.64645L5.14645 6.14645C4.95118 6.34171 4.95118 6.65829 5.14645 6.85355Z"
      fill="white"
    />
  </svg>
);

export default OrderArrows;


