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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ClaimDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  monto: number;
  tarjetasDisponibles?: string[]; // Mantener por compatibilidad pero no se usará
  mode?: 'view' | 'claim'; // 'view' para ver detalle, 'claim' para solicitar
  onConfirm?: () => void; // Callback para cuando se confirma el claim (modo claim)
  isClaiming?: boolean; // Indica si está procesando el claim
  // Nuevos props para mostrar datos de la comisión
  usuario?: string;
  fecha?: string;
  estado?: string;
  nivel?: number;
  comision?: number; // Valor de comisión que se muestra en la tabla (monto)
  tipoComision?: string; // Tipo de comisión (commissionType)
  baseAmount?: number | string; // Monto base (baseAmount) - puede venir como string o number
  commissionPercentage?: number | string; // Porcentaje de comisión (commissionPercentage) - puede venir como string o number
  commissionAmount?: number | string; // Monto de comisión (commissionAmount) - puede venir como string o number
  hideCardSelection?: boolean; // Si es true, no muestra el select de tarjeta incluso en modo claim
}

const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  open,
  onOpenChange,
  claimId,
  monto,
  mode = 'view',
  onConfirm,
  isClaiming = false,
  usuario,
  fecha,
  estado,
  nivel,
  comision,
  tipoComision,
  baseAmount,
  commissionPercentage,
  commissionAmount,
  hideCardSelection = false,
}) => {
  const [selectedTarjeta, setSelectedTarjeta] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [tarjetas, setTarjetas] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tarjetas cuando se abre el modal solo en modo claim y no se oculta la selección
  useEffect(() => {
    if (open && mode === 'claim' && !hideCardSelection) {
      loadTarjetas();
      // Resetear estados al abrir
      setSelectedTarjeta("");
      setConfirmed(false);
    }
  }, [open, mode, hideCardSelection]);

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
          className="w-[500px] h-[369px]"
          gradientColor="#FFF100"
          backgroundColor="#212020"
          variant="md"
        >
          {/* Modo view o cuando se oculta la selección de tarjeta: Mostrar datos de la comisión con estilos específicos */}
          {mode === 'view' || hideCardSelection ? (
            <div 
              className="flex flex-col items-center relative"
              style={{
                padding: '32px 24px',
                gap: '32px',
                isolation: 'isolate',
                width: '500px',
                height: '369px',
                borderRadius: '24px'
              }}
            >
              {/* Título */}
              <h2 className="text-[#FFF100] text-xl font-bold">
                Detalle
              </h2>

              {/* ScrollArea con datos en filas */}
              <ScrollArea className="flex-1 w-full">
                <div className="flex flex-col gap-2 w-full pr-4">
                  {/* Usuario */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Usuario</span>
                    <span className="text-white text-sm">{usuario || 'N/A'}</span>
                  </div>
                  
                  {/* Fecha */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Fecha</span>
                    <span className="text-white text-sm">
                      {fecha ? new Date(fecha).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      }) : 'N/A'}
                    </span>
                  </div>
                  
                  {/* Estado */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Estado</span>
                    <span className="text-white text-sm">{estado || 'N/A'}</span>
                  </div>
                  
                  {/* Tipo de comisión */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Tipo de comisión</span>
                    {tipoComision ? (
                      (() => {
                        const tipoLower = tipoComision.toLowerCase();
                        let badgeText = tipoComision;
                        let badgeVariant: 'yellow' | 'green' | 'blue' | 'red' | 'default' = 'default';

                        // Mapear los tipos de comisión a los textos y variantes deseados
                        if (tipoLower === 'papa' || tipoLower === 'padre') {
                          badgeText = 'Nivel 1';
                          badgeVariant = 'yellow';
                        } else if (tipoLower === 'abuelo') {
                          badgeText = 'Nivel 2';
                          badgeVariant = 'green';
                        } else if (tipoLower === 'bis_abuelo' || tipoLower === 'bisabuelo') {
                          badgeText = 'Nivel 3';
                          badgeVariant = 'blue';
                        } else if (tipoLower === 'leader_markup' || tipoLower === 'leader_retention') {
                          badgeText = 'Comisión Empresa';
                          badgeVariant = 'red';
                        }

                        return (
                          <Badge 
                            variant={badgeVariant}
                            className="text-xs"
                          >
                            {badgeText}
                          </Badge>
                        );
                      })()
                    ) : (
                      <span className="text-white text-sm">N/A</span>
                    )}
                  </div>
                  
                  {/* Línea divisoria con 10px de padding interno */}
                  <div className="w-full" style={{ padding: '10px 0' }}>
                    <div className="w-full h-[1px] bg-white"></div>
                  </div>
                  
                  {/* Monto */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Monto</span>
                    <span className="text-[#198500] text-sm">
                      ${(() => {
                        if (baseAmount !== undefined && baseAmount !== null) {
                          const baseAmountNum = typeof baseAmount === 'string' ? parseFloat(baseAmount) : baseAmount;
                          return isNaN(baseAmountNum) ? '0.00' : baseAmountNum.toFixed(2);
                        }
                        return '0.00';
                      })()}
                    </span>
                  </div>
                  
                  {/* Porcentaje */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Porcentaje</span>
                    <span className="text-white text-sm">
                      {commissionPercentage !== undefined && commissionPercentage !== null && String(commissionPercentage).trim() !== ''
                        ? `${String(commissionPercentage)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  
                  {/* Comisión */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/60 text-sm">Comisión</span>
                    <span className="text-[#FFF100] font-bold text-sm">
                      ${(() => {
                        if (commissionAmount !== undefined && commissionAmount !== null) {
                          const commissionAmountNum = typeof commissionAmount === 'string' ? parseFloat(commissionAmount) : commissionAmount;
                          return isNaN(commissionAmountNum) ? '0.00' : commissionAmountNum.toFixed(2);
                        }
                        // Fallback a comision si commissionAmount no está disponible
                        if (comision !== undefined && comision !== null) {
                          return typeof comision === 'number' ? comision.toFixed(2) : '0.00';
                        }
                        return '0.00';
                      })()}
                    </span>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col p-6">
              {/* Título */}
              <h2 className="text-[#FFF100] text-xl font-bold mb-6">
                Solicitar Comisión
              </h2>
              {/* Select de tarjeta - Solo en modo claim */}
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

              {/* Botón de confirmación */}
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
            </div>
          )}
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailModal;

