import React from "react";
import InfoModal from "./InfoModal";

interface NoClaimsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NoClaimsModal: React.FC<NoClaimsModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <InfoModal
      open={open}
      onOpenChange={onOpenChange}
      illustrationSrc="/icons/Dashboard/NoClaimsIlutration.svg"
      title="No hay comisiones disponibles para reclamar"
      message="Por el momento, no hay comisiones disponibles para reclamar. Si se trata de un error, comunícate con el canal de soporte para poder darte un seguimiento."
      titleColor="white"
      titleSize="small"
      buttonText="Continuar"
    />
  );
};

export default NoClaimsModal;

