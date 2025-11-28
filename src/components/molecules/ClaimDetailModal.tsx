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
  mode?: 'view' | 'claim'; // 'view' para ver detalle, 'claim' para solicitar
  onConfirm?: () => void; // Callback para cuando se confirma el claim (modo claim)
  isClaiming?: boolean; // Indica si está procesando el claim
}

const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  open,
  onOpenChange,
  claimId,
  monto,
  mode = 'view',
  onConfirm,
  isClaiming = false,
}) => {
  const [selectedTarjeta, setSelectedTarjeta] = useState<string>("");
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
    }
  }, [open]);

  const loadTarjetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMisTarjetas();
      // Filtrar solo tarjetas activas
      // Usar cardStatus como fuente de verdad principal
      const tarjetasActivas = response.cards.filter(
        (card) => {
          // Verificar que el estado sea ACTIVA (fuente de verdad principal)
          const isActive = card.cardStatus === "ACTIVA";
          
          // Si cardStatus es ACTIVA, considerar la tarjeta como activa
          // independientemente de blockedAt (puede haber sido bloqueada y luego reactivada)
          if (isActive) {
            return true;
          }
          
          // Si cardStatus no es ACTIVA, verificar campos opcionales para compatibilidad
          const optionalIsActive = (card as any).isActive !== undefined ? (card as any).isActive : false;
          return optionalIsActive;
        }
      );
      
      // Si después del filtro no hay tarjetas, mostrar error
      if (tarjetasActivas.length === 0) {
        setError("Sin tarjetas activas disponibles");
        setTarjetas([]);
      } else {
        setTarjetas(tarjetasActivas);
      }
    } catch (err: any) {
      console.error("Error cargando tarjetas:", err);
      // Si es un error 500, mostrar mensaje específico
      if (err?.status === 500 || err?.response?.status === 500) {
        setError("Sin tarjetas disponibles");
        setTarjetas([]);
      } else {
        setError("Error al cargar las tarjetas");
        setTarjetas([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Formatear tarjeta para mostrar en el select
  const formatTarjetaLabel = (card: UserCard): string => {
    return `**** ${card.cardNumber} - ${card.holderName}`;
  };

  const handleConfirm = () => {
    if (mode === 'claim' && onConfirm) {
      // Si es modo claim, llamar al callback
      onConfirm();
    } else {
      // Modo view, solo cerrar
      console.log("Claim confirmado:", {
        claimId,
        tarjeta: selectedTarjeta,
        monto: monto,
        confirmed
      });
      onOpenChange(false);
    }
  };

  // Determinar si el botón debe estar habilitado
  const canConfirm = mode === 'claim' 
    ? !loading && !error && tarjetas.length > 0 && selectedTarjeta !== '' && confirmed && !isClaiming
    : false; // En modo view siempre está deshabilitado

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
            <h2 className="text-[#FFF100] text-xl font-bold mb-6">
              {mode === 'claim' ? 'Solicitar Comisión' : `Detalle del Claim ${claimId}`}
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
                <Select 
                  value={selectedTarjeta} 
                  onValueChange={setSelectedTarjeta}
                  disabled={true}
                >
                  <SelectTrigger className="w-full" disabled={true}>
                    <SelectValue 
                      placeholder={error === "Sin tarjetas disponibles" ? "Sin tarjetas disponibles" : "Error al cargar tarjetas"} 
                    />
                  </SelectTrigger>
                </Select>
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
                value={monto.toString()}
                disabled
                placeholder="0.00"
                rightIcon={<MoneyCircleIcon size={24} />}
              />
            </div>

            {/* Checkbox de confirmación - Solo en modo claim */}
            {mode === 'claim' && (
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox
                  id="confirm"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  disabled={loading || error !== null || tarjetas.length === 0}
                />
                <label
                  htmlFor="confirm"
                  className={`text-sm text-white leading-none ${(loading || error !== null || tarjetas.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Confirmo que deseo solicitar esta comisión
                </label>
              </div>
            )}

            {/* Botón de confirmación */}
            {mode === 'claim' && (
              <div className="mt-auto">
                <Button
                  variant="yellow"
                  className="w-full font-semibold"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                >
                  {isClaiming ? 'Solicitando...' : 'Solicitar'}
                </Button>
                {(error || (tarjetas.length === 0 && !loading)) && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {error || 'No hay tarjetas disponibles para solicitar la comisión'}
                  </p>
                )}
              </div>
            )}
          </div>
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailModal;

