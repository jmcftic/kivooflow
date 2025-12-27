import React from "react";
import { useTranslation } from "react-i18next";
import InfoModal from "./InfoModal";

interface NoClaimsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NoClaimsModal: React.FC<NoClaimsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation(['commissions', 'common']);
  
  return (
    <InfoModal
      open={open}
      onOpenChange={onOpenChange}
      illustrationSrc="/icons/Dashboard/NoClaimsIlutration.svg"
      title={t('commissions:modals.noClaims.title')}
      message={t('commissions:modals.noClaims.message')}
      titleColor="white"
      titleSize="small"
      buttonText={t('commissions:modals.noClaims.continue')}
    />
  );
};

export default NoClaimsModal;

