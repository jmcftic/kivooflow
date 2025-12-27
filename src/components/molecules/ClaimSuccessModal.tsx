import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FoldedCard from "../atoms/FoldedCard";

interface ClaimSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  showSubtext?: boolean;
}

const ClaimSuccessModal: React.FC<ClaimSuccessModalProps> = ({
  open,
  onOpenChange,
  message,
  showSubtext = true,
}) => {
  const { t } = useTranslation(['commissions', 'common']);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[500px] bg-transparent border-0 shadow-none">
        <FoldedCard
          className="w-[500px] h-auto min-h-[300px]"
          gradientColor="#FFF100"
          backgroundColor="#212020"
          variant="md"
        >
          <div className="w-full h-full flex flex-col p-6">
            {/* Título - Mensaje principal en amarillo */}
            <h2 className="text-[#FFF100] text-xl font-bold mb-4 text-center">
              {message}
            </h2>

            {/* Subtexto si es exitoso */}
            {showSubtext && (
              <p className="text-white text-sm mb-6 text-center opacity-80">
                {t('commissions:modals.claimSuccess.subtext')}
              </p>
            )}

            {/* Botón de cerrar */}
            <div className="mt-auto">
              <Button
                variant="yellow"
                className="w-full font-semibold"
                onClick={() => onOpenChange(false)}
              >
                {t('commissions:modals.claimSuccess.understood')}
              </Button>
            </div>
          </div>
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimSuccessModal;

