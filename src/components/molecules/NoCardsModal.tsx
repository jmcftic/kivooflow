import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import AlertIcon from "../atoms/AlertIcon";
import Button from "../atoms/Button";
import YellowFoldedCardMinibackground from "../atoms/YellowFoldedCardMinibackground";
import FoldedCard from "../atoms/FoldedCard";

interface NoCardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestCard?: () => void;
  customTitle?: string;
  customMessage?: string;
  hideButton?: boolean;
  buttonText?: string;
}

const NoCardsModal: React.FC<NoCardsModalProps> = ({
  open,
  onOpenChange,
  onRequestCard,
  customTitle,
  customMessage,
  hideButton = false,
  buttonText = 'Solicitar tarjeta',
}) => {
  const handleRequestCard = () => {
    if (onRequestCard) {
      onRequestCard();
    }
    onOpenChange(false);
  };

  const handleContactSupport = () => {
    // Número de WhatsApp de soporte (formato: código de país + número sin espacios, guiones o +)
    // +52 1 55 4057 6890 (México) -> 5215540576890
    const supportPhoneNumber = '5215540576890';
    const message = 'Deseo adquirir mi tarjeta kivoo para poder recibir mis comisiones';
    // Usar api.whatsapp.com en lugar de wa.me para mejor compatibilidad con el mensaje precargado
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${supportPhoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
  };

  const title = customTitle || 'NO PUEDES COBRAR TUS COMISIONES';
  const message = customMessage || 'Para recibir tus pagos necesitas adquirir tu tarjeta KIVOO';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[500px] bg-transparent border-0 shadow-none">
        <FoldedCard
          className="w-[500px] h-[405px] lg:h-[405px]"
          gradientColor="#FFF100"
          backgroundColor="#212020"
          variant="md"
        >
          {/* Contenido centrado */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">
            {/* Icono de alerta dentro del elemento del sidebar con fondo amarillo */}
            <div className="mb-6 flex-shrink-0 w-14 h-14 relative">
              {/* Fondo amarillo con YellowFoldedCardMinibackground */}
              <div className="absolute inset-0">
                <YellowFoldedCardMinibackground width={56} height={56} className="w-full h-full" />
              </div>
              
              {/* Icono de alerta centrado */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                <AlertIcon width={56} height={56} />
              </div>
            </div>

            {/* Texto principal amarillo */}
            <h2 className="text-[#FFF100] text-[32px] font-bold mb-4 text-center">
              {title}
            </h2>

            {/* Subtexto blanco */}
            <p className="text-white text-base mb-8 text-center">
              {message}
            </p>

            {/* Botón Contactar a soporte o Cerrar */}
            {!hideButton ? (
              <Button
                variant="yellow"
                size="lg"
                className="w-full rounded-xl font-semibold text-lg"
                onClick={handleContactSupport}
              >
                Contactar a soporte
              </Button>
            ) : (
              <Button
                variant="yellow"
                size="lg"
                className="w-full rounded-xl font-semibold text-lg"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            )}
          </div>
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default NoCardsModal;

