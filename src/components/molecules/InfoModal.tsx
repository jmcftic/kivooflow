import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AlertIcon from "../atoms/AlertIcon";
import Button from "../atoms/Button";
import YellowFoldedCardMinibackground from "../atoms/YellowFoldedCardMinibackground";
import FoldedCard from "../atoms/FoldedCard";

export interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Contenido visual
  illustrationSrc?: string; // Ruta a una ilustración SVG/imagen
  icon?: ReactNode; // Componente de icono personalizado (ej: <AlertIcon />)
  // Textos
  title: string;
  message: string;
  // Estilos de título
  titleColor?: 'yellow' | 'white'; // Color del título (amarillo por defecto para compatibilidad)
  titleSize?: 'small' | 'large'; // Tamaño del título
  // Botón
  buttonText: string;
  onButtonClick?: () => void;
  buttonVariant?: 'yellow' | 'outline';
  buttonSize?: 'sm' | 'md' | 'lg'; // Tamaño del botón
  buttonClassName?: string; // Clases adicionales para el botón
  buttonContainerClassName?: string; // Clases adicionales para el contenedor del botón
  // Altura personalizada
  customHeight?: string; // Altura personalizada del modal (ej: "h-[405px] lg:h-[405px]")
}

const InfoModal: React.FC<InfoModalProps> = ({
  open,
  onOpenChange,
  illustrationSrc,
  icon,
  title,
  message,
  titleColor = 'yellow',
  titleSize = 'large',
  buttonText,
  onButtonClick,
  buttonVariant = 'yellow',
  buttonSize = 'lg',
  buttonClassName = '',
  buttonContainerClassName = '',
  customHeight,
}) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onOpenChange(false);
    }
  };

  // Determinar qué mostrar: ilustración, icono personalizado, o icono por defecto
  const showIllustration = !!illustrationSrc;
  const showCustomIcon = !!icon && !showIllustration;
  const showDefaultIcon = !showIllustration && !showCustomIcon;

  // Clases de título según color y tamaño
  const titleClasses = [
    titleColor === 'yellow' ? 'text-[#FFF100]' : 'text-white',
    titleSize === 'small' ? 'text-[20px] sm:text-[24px]' : 'text-[28px] sm:text-[32px]',
    'font-bold',
    'leading-tight',
    'mb-2 sm:mb-3',
    'text-center',
    'px-2 w-full break-words overflow-wrap-anywhere'
  ].join(' ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 max-w-[500px] bg-transparent border-0 shadow-none sm:max-w-[500px] outline-none"
        aria-describedby="info-modal-description"
      >
        {/* Accesibilidad: Título y descripción ocultos para Radix */}
        <div className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="info-modal-description">{message}</DialogDescription>
        </div>

        <FoldedCard
          className={`w-full max-w-[500px] ${customHeight || 'h-[405px] lg:h-[405px]'}`}
          gradientColor="#FFF100"
          backgroundColor="#212020"
          variant="md"
        >
          {/* Contenido principal */}
          <div className="relative z-10 h-full flex flex-col items-center px-4 sm:px-8 py-10 w-full">

            {/* Icono / Ilustración */}
            <div className="mb-6 flex-shrink-0">
              {showIllustration ? (
                <img src={illustrationSrc} alt="" className="max-w-[200px] h-auto" />
              ) : showCustomIcon ? (
                icon
              ) : (
                <div className="w-14 h-14 relative">
                  <div className="absolute inset-0">
                    <YellowFoldedCardMinibackground width={56} height={56} className="w-full h-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <AlertIcon width={48} height={48} />
                  </div>
                </div>
              )}
            </div>

            {/* Título Visual */}
            <h2 className={`${titleClasses} mb-4`}>
              {title}
            </h2>

            {/* Mensaje / Cuerpo - Forzado Blanco y Normal */}
            <div className="flex-1 w-full overflow-y-auto mb-8 px-2 custom-scrollbar text-center">
              <p className="text-white !text-white text-sm sm:text-base font-normal !font-normal leading-relaxed opacity-100">
                {message}
              </p>
            </div>

            {/* Botón */}
            <div className={`w-full flex-shrink-0 ${buttonContainerClassName}`}>
              <Button
                variant={buttonVariant}
                size={buttonSize}
                className={`w-full rounded-xl font-semibold ${buttonClassName}`}
                onClick={handleButtonClick}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </FoldedCard>
      </DialogContent>
    </Dialog>
  );
};

export default InfoModal;

