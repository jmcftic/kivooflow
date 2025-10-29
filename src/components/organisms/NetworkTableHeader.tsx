import React from 'react';

const NetworkTableHeader: React.FC = () => {
  return (
    <div className="w-full mb-3">
      <div className="w-full flex items-center px-6">
        <div className="flex-1 grid grid-cols-6 gap-4">
          <div className="text-white text-xs">Correo electrónico</div>
          <div className="text-white text-xs">Fecha de unión</div>
          <div className="text-white text-xs">Nivel</div>
          <div className="text-white text-xs">Historial resumido</div>
          <div className="text-white text-xs">Comisiones generadas</div>
          <div className="text-white text-xs">Acciones</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTableHeader;

