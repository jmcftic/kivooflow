import React from "react";

export interface MaintenanceIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const MaintenanceIcon: React.FC<MaintenanceIconProps> = ({
  className = "",
  width = 390,
  height = 390,
}) => {
  return (
    <div className={`maintenance-icon-container ${className}`} style={{ width, height, position: 'relative' }}>
      {/* Icono principal - en el medio */}
      <img
        src="/icons/Dashboard/MaintenanceIconOnly.svg"
        alt="Mantenimiento"
        className="maintenance-icon-only"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${(192 / 390) * 100}%`,
          height: `${(317 / 390) * 100}%`,
          zIndex: 2,
        }}
      />
      {/* Estrellas - encima */}
      <img
        src="/icons/Dashboard/MaintenanceStars.svg"
        alt=""
        className="maintenance-stars"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${(281 / 390) * 100}%`,
          height: `${(260 / 390) * 100}%`,
          zIndex: 3,
        }}
      />
    </div>
  );
};

export default MaintenanceIcon;
