import React from "react";
import { useTranslation } from "react-i18next";
import InfoModal from "./InfoModal";

interface NoCardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestCard?: () => void;
  customTitle?: string;
  customMessage?: string;
  hideButton?: boolean;
  buttonText?: string;
  userEmail?: string; // Email del usuario para agregar al mensaje de WhatsApp
  illustrationSrc?: string; // Prop opcional para mostrar una ilustración personalizada en el futuro
}

const NoCardsModal: React.FC<NoCardsModalProps> = ({
  open,
  onOpenChange,
  onRequestCard,
  customTitle,
  customMessage,
  hideButton = false,
  buttonText,
  userEmail,
  illustrationSrc,
}) => {
  const { t } = useTranslation(['commissions', 'common']);
  const defaultButtonText = buttonText || t('commissions:modals.noCards.requestCard');
  
  const handleContactSupport = () => {
    // Número de WhatsApp de soporte (formato: código de país + número sin espacios, guiones o +)
    // +52 1 55 4057 6890 (México) -> 5215540576890
    const supportPhoneNumber = '5215540576890';
    let message = t('commissions:modals.noCards.whatsappMessage');
    // Agregar el correo al final del mensaje si está disponible
    if (userEmail) {
      message += `. ${t('commissions:modals.noCards.whatsappEmailSuffix')} ${userEmail}`;
    }
    // Usar api.whatsapp.com en lugar de wa.me para mejor compatibilidad con el mensaje precargado
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${supportPhoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
  };

  const title = customTitle || t('commissions:modals.noCards.title');
  const message = customMessage || t('commissions:modals.noCards.message');
  const buttonTextToShow = hideButton ? defaultButtonText : t('commissions:modals.noCards.contactSupport');

  return (
    <InfoModal
      open={open}
      onOpenChange={onOpenChange}
      illustrationSrc={illustrationSrc}
      title={title}
      message={message}
      titleColor="yellow"
      titleSize="large"
      buttonText={buttonTextToShow}
      onButtonClick={hideButton ? onRequestCard : handleContactSupport}
    />
  );
};

export default NoCardsModal;

