import React from "react";
import { useTranslation } from "react-i18next";
import InfoModal from "./InfoModal";
import { KfNotification } from "@/types/network";
import { translateNotificationKey, translateNotification } from "@/utils/notificationTranslator";

interface NotificationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: KfNotification | null;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  open,
  onOpenChange,
  notification,
}) => {
  const { t } = useTranslation(['common']);

  if (!notification) return null;

  // Usar la utilidad de traducción que ahora maneja metadata e interpolación
  const translated = translateNotification({
    title: notification.title,
    body: notification.body || notification.message,
    metadata: notification.metadata
  });

  return (
    <InfoModal
      open={open}
      onOpenChange={onOpenChange}
      title={translated.title}
      message={translated.body}
      titleColor="white"
      titleSize="small"
      buttonText={t('common:buttons.close')}
      onButtonClick={() => onOpenChange(false)}
    />
  );
};

export default NotificationDetailModal;

