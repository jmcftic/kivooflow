import React from "react";
import { useTranslation } from "react-i18next";
import InfoModal from "./InfoModal";

interface ClaimAllInProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClaimAllInProgressModal: React.FC<ClaimAllInProgressModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation(['commissions', 'common']);

  return (
    <InfoModal
      open={open}
      onOpenChange={onOpenChange}
      title={t('commissions:modals.claimAllInProgress.title')}
      message={t('commissions:modals.claimAllInProgress.message')}
      titleColor="yellow"
      titleSize="large"
      buttonText={t('commissions:modals.claimAllInProgress.understood')}
      onButtonClick={() => onOpenChange(false)}
    />
  );
};

export default ClaimAllInProgressModal;

