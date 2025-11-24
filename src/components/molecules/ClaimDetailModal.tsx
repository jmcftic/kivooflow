import React, { useState, useEffect } from "react";
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
import { getMisTarjetas } from "@/services/cards";
import { UserCard } from "@/types/card";
import { Spinner } from "@/components/ui/spinner";

interface ClaimDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  monto: number;
  tarjetasDisponibles?: string[]; // Mantener por compatibilidad pero no se usará
}

const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  open,
  onOpenChange,
  claimId,
  monto,
}) => {
  const [selectedTarjeta, setSelectedTarjeta] = useState<string>("");
  const [montoInput, setMontoInput] = useState<string>(monto.toFixed(2));
  const [confirmed, setConfirmed] = useState(false);
  const [tarjetas, setTarjetas] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tarjetas cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadTarjetas();
      // Resetear estados al abrir
      setSelectedTarjeta("");
      setConfirmed(false);
      setMontoInput(monto.toFixed(2));
    }
  }, [open, monto]);

  const loadTarjetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMisTarjetas();
      // Filtrar solo tarjetas activas
      const tarjetasActivas = response.cards.filter(
        (card) => card.isActive && !card.isBlocked && card.cardStatus === "ACTIVA"
      );
      setTarjetas(tarjetasActivas);
    } catch (err) {
      console.error("Error cargando tarjetas:", err);
      setError("Error al cargar las tarjetas");
      setTarjetas([]);
    } finally {
      setLoading(false);
    }
  };

  // Formatear tarjeta para mostrar en el select
  const formatTarjetaLabel = (card: UserCard): string => {
    return `**** ${card.cardNumber} - ${card.holderName}`;
  };

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
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner className="size-4 text-[#FFF000]" />
                  <span className="text-sm text-[#aaa] ml-2">Cargando tarjetas...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-[#ff6d64] py-2">{error}</div>
              ) : (
                <Select 
                  value={selectedTarjeta} 
                  onValueChange={setSelectedTarjeta}
                  disabled={tarjetas.length === 0}
                >
                  <SelectTrigger className="w-full" disabled={tarjetas.length === 0}>
                    <SelectValue 
                      placeholder={tarjetas.length === 0 ? "Sin tarjetas activas" : "Elige una tarjeta"} 
                    />
                  </SelectTrigger>
                  {tarjetas.length > 0 && (
                    <SelectContent>
                      {tarjetas.map((tarjeta) => (
                        <SelectItem key={tarjeta.id} value={String(tarjeta.id)}>
                          {formatTarjetaLabel(tarjeta)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              )}
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
                disabled={true} // Deshabilitado por ahora según requerimiento
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

