import React from "react";
import { useTranslation } from "react-i18next";
import InfoModal from "./InfoModal";

interface InsufficientAmountModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message?: string;
}

const InsufficientAmountModal: React.FC<InsufficientAmountModalProps> = ({ open, onOpenChange, message }) => {
    const { t } = useTranslation(['commissions']);

    return (
        <InfoModal
            open={open}
            onOpenChange={onOpenChange}
            title={t('commissions:modals.insufficientAmount.title')}
            message={message || t('commissions:modals.insufficientAmount.message')}
            titleColor="yellow"
            titleSize="large"
            buttonText={t('commissions:modals.insufficientAmount.continue')}
            onButtonClick={() => onOpenChange(false)}
        />
    );
};

export default InsufficientAmountModal;
