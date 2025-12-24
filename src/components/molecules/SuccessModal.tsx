import React from "react";
import InfoModal from "./InfoModal";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onOpenChange,
  title = "¡Éxito!",
  message = "Operación realizada exitosamente",
}) => {
  return (
    <InfoModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      message={message}
      titleColor="yellow"
      titleSize="large"
      buttonText="Continuar"
      buttonVariant="yellow"
    />
  );
};

export default SuccessModal;

