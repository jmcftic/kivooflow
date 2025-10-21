import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import FoldedCard from "../atoms/FoldedCard";
import Input from "../atoms/Input";
import MoneyCircleIcon from "../atoms/MoneyCircleIcon";

interface ClaimDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  monto: number;
  tarjetasDisponibles: string[];
}

const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  open,
  onOpenChange,
  claimId,
  monto,
  tarjetasDisponibles,
}) => {
  const [selectedTarjeta, setSelectedTarjeta] = useState<string>("");
  const [montoInput, setMontoInput] = useState<string>(monto.toFixed(2));
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    console.log("Claim confirmado:", {
      claimId,
      tarjeta: selectedTarjeta,
      monto: montoInput,
      confirmed
    });
    // Aquí iría la lógica para confirmar el claim
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[500px] bg-transparent border-0 shadow-none">
        <FoldedCard
          className="w-[500px] h-[386px]"
          gradientColor="#FFF100"
          backgroundColor="#212020"
          variant="md"
        >
          <div className="w-full h-full flex flex-col p-6">
            {/* Título */}
            <h2 className="text-[#FFF000] text-xl font-bold mb-6">
              Detalle del Claim {claimId}
            </h2>

            {/* Select de tarjeta */}
            <div className="mb-4">
              <label className="text-white text-sm mb-2 block">Seleccionar tarjeta</label>
              <Select value={selectedTarjeta} onValueChange={setSelectedTarjeta}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elige una tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  {tarjetasDisponibles.map((tarjeta) => (
                    <SelectItem key={tarjeta} value={tarjeta}>
                      {tarjeta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Input de monto */}
            <div className="mb-4">
              <Input
                variant="kivoo-glass"
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                placeholder="0.00"
                rightIcon={<MoneyCircleIcon size={24} />}
              />
            </div>

            {/* Checkbox de confirmación */}
            <div className="flex items-center space-x-2 mb-6">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <label
                htmlFor="confirm"
                className="text-sm text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirmo que deseo cargar este monto a mi tarjeta
              </label>
            </div>

            {/* Botón de confirmación */}
            <div className="mt-auto">
              <Button
                variant="yellow"
                className="w-full font-semibold"
                onClick={handleConfirm}
                disabled={!selectedTarjeta || !confirmed}
              >
                Confirmar claim
              </Button>
            </div>
          </div>
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailModal;

