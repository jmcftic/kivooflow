import React from 'react';
import { useTranslation } from 'react-i18next';
import OrderArrows from '../atoms/OrderArrows';

interface NetworkTableHeaderProps {
  activeTab?: 'b2c' | 'b2b' | 'b2t';
  userModel?: string | null; // Para determinar si es B2B viendo su red o B2C viendo B2B
}

const NetworkTableHeader: React.FC<NetworkTableHeaderProps> = ({ activeTab = 'b2c', userModel }) => {
  const { t } = useTranslation(['network', 'common']);
  
  // Si es B2B viendo su red (tab B2B), mostrar "Usuario", si es B2C viendo B2B, mostrar "Empresa"
  const emailColumnLabel = activeTab === 'b2b' 
    ? (userModel?.toLowerCase() === 'b2b' ? t('network:table.headers.user') : t('network:table.headers.company'))
    : t('network:table.headers.email');
  
  // Ocultar columna Actividad cuando es B2C viendo tab B2B (empresas)
  const showActivityColumn = !(activeTab === 'b2b' && userModel?.toLowerCase() !== 'b2b');
  // Mostrar columna Nombre cuando es B2C en tab B2C o B2B en tab B2B
  const showNameColumn = (activeTab === 'b2c' && userModel?.toLowerCase() === 'b2c') || (activeTab === 'b2b' && userModel?.toLowerCase() === 'b2b');
  // Calcular número de columnas: base 5 (email, fecha, nivel, volumen, acciones) + actividad (condicional) + nombre (condicional)
  // Usar clases específicas de Tailwind para grid-cols
  let gridCols = 'grid-cols-5'; // Base: email, fecha, nivel, volumen, acciones
  if (showActivityColumn && showNameColumn) {
    gridCols = 'grid-cols-7'; // email, nombre, fecha, nivel, volumen, actividad, acciones
  } else if (showActivityColumn) {
    gridCols = 'grid-cols-6'; // email, fecha, nivel, volumen, actividad, acciones
  } else if (showNameColumn) {
    gridCols = 'grid-cols-6'; // email, nombre, fecha, nivel, volumen, acciones
  }
  
  return (
    <div className="w-full mb-3 hidden md:block">
      <div className="w-full flex items-center px-6">
        <div className={`flex-1 grid ${gridCols} gap-4 h-10 items-center text-xs text-white`}> 
          <div className="flex items-center justify-center gap-1">{emailColumnLabel} <OrderArrows /></div>
          {showNameColumn && (
            <div className="flex items-center justify-center gap-1">{t('network:table.headers.name')} <OrderArrows /></div>
          )}
          <div className="flex items-center justify-center gap-1">{t('network:table.headers.joinDate')} <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">{t('network:table.headers.level')} <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">{t('network:table.headers.volume')} <OrderArrows /></div>
          {showActivityColumn && (
            <div className="flex items-center justify-center gap-1">{t('network:table.headers.activity')}</div>
          )}
          <div className="flex items-center justify-end pr-20">{t('network:table.headers.actions')}</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTableHeader;

