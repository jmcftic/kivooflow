import React from 'react';
import { useTranslation } from 'react-i18next';
import InfoModal from './InfoModal';

interface DescendantCardStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasActiveCard: boolean | null; // null cuando hay error
  error?: string | null;
}

const DescendantCardStatusModal: React.FC<DescendantCardStatusModalProps> = ({
  open,
  onOpenChange,
  hasActiveCard,
  error = null,
}) => {
  const { t } = useTranslation(['network', 'common']);
  
  // Si hay error, mostrar con icono por defecto
  if (error) {
    return (
      <InfoModal
        open={open}
        onOpenChange={onOpenChange}
        title={t('network:cardStatus.title')}
        message={error}
        titleColor="white"
        titleSize="small"
        buttonText={t('common:buttons.close')}
        buttonSize="sm"
        buttonClassName="text-sm"
        buttonContainerClassName="mb-4 sm:mb-6"
      />
    );
  }
  
  // Determinar la ilustración y el mensaje según el resultado
  const illustrationSrc = hasActiveCard 
    ? '/icons/Dashboard/HasActiveCard.svg' 
    : '/icons/Dashboard/HasNotActiveCard.svg';
  const message = hasActiveCard 
    ? t('network:cardStatus.hasActiveCard') 
    : t('network:cardStatus.hasNotActiveCard');

  return (
    <InfoModal
      open={open}
      onOpenChange={onOpenChange}
      illustrationSrc={illustrationSrc}
      title={t('network:cardStatus.title')}
      message={message}
      titleColor="white"
      titleSize="small"
      buttonText={t('common:buttons.close')}
      buttonSize="sm"
      buttonClassName="text-sm"
      buttonContainerClassName="mb-4 sm:mb-6"
    />
  );
};

export default DescendantCardStatusModal;

