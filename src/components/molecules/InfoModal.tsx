import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
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
  buttonVariant?: 'yellow' | 'default';
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
    'mb-4',
    'text-center'
  ].join(' ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[500px] bg-transparent border-0 shadow-none sm:max-w-[500px]">
        <FoldedCard
          className="w-full max-w-[500px] h-[405px] lg:h-[405px]"
          gradientColor="#FFF100"
          backgroundColor="#212020"
          variant="md"
        >
          {/* Contenido centrado */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:pt-10 sm:pb-12">
            {/* Ilustración, icono personalizado o icono por defecto */}
            {showIllustration ? (
              <div className="mb-4 sm:mb-8 flex-shrink-0">
                <img 
                  src={illustrationSrc} 
                  alt="" 
                  className="w-full max-w-[250px] sm:max-w-[300px] h-auto"
                />
              </div>
            ) : showCustomIcon ? (
              <div className="mb-4 sm:mb-8 flex-shrink-0">
                {icon}
              </div>
            ) : showDefaultIcon ? (
              <div className="mb-4 sm:mb-8 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 relative">
                {/* Fondo amarillo con YellowFoldedCardMinibackground */}
                <div className="absolute inset-0">
                  <YellowFoldedCardMinibackground width={56} height={56} className="w-full h-full" />
                </div>
                
                {/* Icono de alerta centrado */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                  <AlertIcon width={48} height={48} />
                </div>
              </div>
            ) : null}

            {/* Texto principal */}
            <h2 className={`${titleClasses} px-2`}>
              {title}
            </h2>

            {/* Subtexto blanco */}
            <p className="text-white text-xs sm:text-sm mb-6 sm:mb-8 text-center px-2">
              {message}
            </p>

            {/* Botón con margen inferior responsive */}
            <div className="w-full px-2 pb-[10px] sm:pb-6">
              <Button
                variant={buttonVariant}
                size="lg"
                className="w-full rounded-xl font-semibold text-base sm:text-lg"
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

