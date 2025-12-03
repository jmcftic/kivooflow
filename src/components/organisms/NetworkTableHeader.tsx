import React from 'react';
import OrderArrows from '../atoms/OrderArrows';

interface NetworkTableHeaderProps {
  activeTab?: 'b2c' | 'b2b' | 'b2t';
  hideResumenColumn?: boolean;
  userModel?: string | null; // Para determinar si es B2B viendo su red o B2C viendo B2B
}

const NetworkTableHeader: React.FC<NetworkTableHeaderProps> = ({ activeTab = 'b2c', hideResumenColumn = false, userModel }) => {
  // Si es B2B viendo su red (tab B2B), mostrar "Usuario", si es B2C viendo B2B, mostrar "Empresa"
  const emailColumnLabel = activeTab === 'b2b' 
    ? (userModel?.toLowerCase() === 'b2b' ? 'Usuario' : 'Empresa')
    : 'Correo electrónico';
  
  return (
    <div className="w-full mb-3">
      <div className="w-full flex items-center px-6">
        <div className={`flex-1 grid ${hideResumenColumn ? 'grid-cols-5' : 'grid-cols-6'} gap-4 h-10 items-center text-xs text-white`}> 
          <div className="flex items-center justify-center gap-1">{emailColumnLabel} <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">Fecha de unión <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">Nivel <OrderArrows /></div>
          {!hideResumenColumn && (
            <div className="flex items-center justify-center gap-1">Historial resumido <OrderArrows /></div>
          )}
          <div className="flex items-center justify-center gap-1">Volumen <OrderArrows /></div>
          <div className="flex items-center justify-end pr-20">Acciones</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTableHeader;

