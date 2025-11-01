import React from 'react';
import OrderArrows from '../atoms/OrderArrows';

const NetworkTableHeader: React.FC = () => {
  return (
    <div className="w-full mb-3">
      <div className="w-full flex items-center px-6">
        <div className="flex-1 grid grid-cols-6 gap-4 h-10 items-center text-xs text-white"> 
          <div className="flex items-center justify-center gap-1">Correo electrónico <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">Fecha de unión <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">Nivel <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">Historial resumido <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">Comisiones generadas <OrderArrows /></div>
          <div className="flex items-center justify-end pr-20">Acciones</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTableHeader;

