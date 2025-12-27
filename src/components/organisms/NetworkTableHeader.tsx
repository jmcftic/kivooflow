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
  
  return (
    <div className="w-full mb-3">
      <div className="w-full flex items-center px-6">
        <div className="flex-1 grid grid-cols-5 gap-4 h-10 items-center text-xs text-white"> 
          <div className="flex items-center justify-center gap-1">{emailColumnLabel} <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">{t('network:table.headers.joinDate')} <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">{t('network:table.headers.level')} <OrderArrows /></div>
          <div className="flex items-center justify-center gap-1">{t('network:table.headers.volume')} <OrderArrows /></div>
          <div className="flex items-center justify-end pr-20">{t('network:table.headers.actions')}</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTableHeader;

