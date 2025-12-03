import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import MoneyIcon from "../atoms/MoneyIcon";
import Button from "../atoms/Button";
import YellowFoldedCardMinibackground from "../atoms/YellowFoldedCardMinibackground";
import FoldedCard from "../atoms/FoldedCard";

interface MaterializeSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

const MaterializeSuccessModal: React.FC<MaterializeSuccessModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
  };

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
            {/* Icono de dinero dentro del elemento del sidebar con fondo amarillo */}
            <div className="mb-6 flex-shrink-0 w-14 h-14 relative">
              {/* Fondo amarillo con YellowFoldedCardMinibackground - 56x56 por defecto */}
              <div className="absolute inset-0">
                <YellowFoldedCardMinibackground width={56} height={56} className="w-full h-full" />
              </div>
              
              {/* Icono de dinero centrado - negro y 28x28 */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                <style>{`
                  .money-icon-black svg path {
                    fill: #000000 !important;
                  }
                `}</style>
                <div className="money-icon-black">
                  <MoneyIcon size={28} />
                </div>
              </div>
            </div>

            {/* Texto principal amarillo */}
            <h2 className="text-[#FFF100] text-[32px] font-bold mb-4 text-center">
              Comisión materializada con éxito
            </h2>

            {/* Subtexto blanco */}
            <p className="text-white text-base mb-8 text-center">
              Ahora puedes solicitar tu comisión para la empresa
            </p>

            {/* Botón Entiendo */}
            <Button
              variant="yellow"
              size="lg"
              className="w-full rounded-xl font-semibold text-lg"
              onClick={handleConfirm}
            >
              Entiendo
            </Button>
          </div>
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default MaterializeSuccessModal;

