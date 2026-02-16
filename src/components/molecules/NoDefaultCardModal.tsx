import React from "react";
import { useTranslation } from "react-i18next";
import InfoModal from "./InfoModal";

interface NoDefaultCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NoDefaultCardModal: React.FC<NoDefaultCardModalProps> = ({ open, onOpenChange }) => {
    const { t } = useTranslation(['commissions']);

    return (
        <InfoModal
            open={open}
            onOpenChange={onOpenChange}
            title={t('commissions:modals.noDefaultCard.title')}
            message={t('commissions:modals.noDefaultCard.message')}
            titleColor="yellow"
            titleSize="large"
            buttonText={t('commissions:modals.noDefaultCard.continue')}
            onButtonClick={() => onOpenChange(false)}
        />
    );
};

export default NoDefaultCardModal;
