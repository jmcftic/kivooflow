import React from 'react';

interface SidebarLogoClosedProps {
  className?: string;
}

const SidebarLogoClosed: React.FC<SidebarLogoClosedProps> = ({ className = "" }) => {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 448 562" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M447.04 0.61L403.56 90.98C395.01 108.73 376.76 120.21 357.03 120.21H180.91C170.88 120.21 161.26 116.23 154.17 109.13L128.8 83.76C127.48 82.44 126.04 82.17 125.06 82.17C122.38 82.17 119.6 84.18 119.6 87.57V193.76H372.31L328.82 284.15C320.29 301.9 302.02 313.38 282.31 313.38H182.17C172.42 313.38 163.08 309.51 156.19 302.61L134.78 281.2C129.18 275.6 119.61 279.56 119.61 287.48V491.4C119.61 507.78 113.3 523.24 101.82 534.95L87.6699 549.37C79.7799 557.4 68.8198 562 57.5798 562H0V91.12C0 79.73 4.43999 69.01 12.49 60.95L60.96 12.49C69.02 4.43 79.7299 0 91.1199 0L447.04 0.61Z" fill="#FFF100"/>
    </svg>
  );
};

export default SidebarLogoClosed;

