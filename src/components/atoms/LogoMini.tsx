import React from 'react';

interface LogoMiniProps {
  className?: string;
}

const LogoMini: React.FC<LogoMiniProps> = ({ className = "" }) => {
  return (
    <img
      src="/icons/Dashboard/LogoMiniKivo.svg"
      alt="Logo Kivo"
      width={34}
      height={32}
      className={className}
    />
  );
};

export default LogoMini;
