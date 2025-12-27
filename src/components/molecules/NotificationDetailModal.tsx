import React from "react";
import { useTranslation } from "react-i18next";
import InfoModal from "./InfoModal";
import { KfNotification } from "@/types/network";
import { translateNotificationKey } from "@/utils/notificationTranslator";

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

  return (
    <InfoModal
      open={open}
      onOpenChange={onOpenChange}
      title={translateNotificationKey(notification.title)}
      message={translateNotificationKey(notification.body || notification.message)}
      titleColor="white"
      titleSize="small"
      buttonText={t('common:buttons.close')}
      onButtonClick={() => onOpenChange(false)}
    />
  );
};

export default NotificationDetailModal;

