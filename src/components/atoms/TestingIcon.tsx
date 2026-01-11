import React from 'react';

interface TestingIconProps {
  className?: string;
}

const TestingIcon: React.FC<TestingIconProps> = ({ className = "" }) => {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M8 2L3 7L8 12M13 7H3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="2" r="1.5" fill="white"/>
      <circle cx="3" cy="7" r="1.5" fill="white"/>
      <circle cx="8" cy="12" r="1.5" fill="white"/>
      <circle cx="13" cy="7" r="1.5" fill="white"/>
    </svg>
  );
};

export default TestingIcon;

