import React, { FunctionComponent } from "react";
import MoneyIcon from "./MoneyIcon";
import SidebarBackgroundItemSecondary from "./SidebarBackgroundItemSecondary";
import ActionButton from "./ActionButton";
import FoldedCard from "./FoldedCard";

export type MiniBanerType = {
  className?: string;
  icon?: React.ReactNode;
  detail: string | React.ReactNode;
  subtitle?: string;
  showDollarSign?: boolean;
  backgroundColor?: string;
  textColor?: string;
  subtitleColor?: string;
  actionButton?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
};

const MiniBaner: FunctionComponent<MiniBanerType> = ({ 
  className = "",
  icon = <MoneyIcon size={24} />,
  detail,
  subtitle,
  showDollarSign = true,
  backgroundColor = "#212020",
  textColor,
  subtitleColor,
  actionButton,
  ...props 
}) => {
  // Determinar colores de texto basados en backgroundColor si no se especifican
  const isYellowBackground = backgroundColor === '#FFF100' || backgroundColor === '#fced00';
  const finalTextColor = textColor || (isYellowBackground ? 'text-black' : 'text-white');
  const finalSubtitleColor = subtitleColor || (isYellowBackground ? 'text-black/70' : 'text-[#CBCACA]');
  
  return (
    <FoldedCard 
      className={className}
      gradientColor="#FFF100"
      backgroundColor={backgroundColor}
      variant="md"
    >
      <div className="w-full flex items-center justify-between">
        {/* Lado izquierdo: Icono y texto */}
        <div className="flex items-center flex-1">
          {/* Icono con fondo gris - Solo se muestra si hay icono */}
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 relative mr-4">
              <SidebarBackgroundItemSecondary />
              
              {/* Icono principal */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-60">
                <div className="w-6 h-6 flex items-center justify-center">
                  {icon}
                </div>
              </div>
            </div>
          )}
          
          {/* Contenido de texto */}
          <div className="flex-1">
            {/* Texto principal con o sin símbolo $ */}
            <div className={`${finalTextColor} text-lg md:text-xl lg:text-2xl font-semibold mb-1`}>
              {typeof detail === 'string' 
                ? (showDollarSign && !detail.toLowerCase().includes('cargando') ? `$${detail}` : detail)
                : detail
              }
            </div>
            
            {/* Texto secundario */}
            {subtitle && (
              <div className={`${finalSubtitleColor} text-sm md:text-base`}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
      
        {/* Lado derecho: Botón de acción (opcional) */}
        {actionButton && (
          <div className="flex-shrink-0 ml-4">
            <ActionButton
              text={actionButton.text}
              onClick={actionButton.onClick}
              href={actionButton.href}
            />
          </div>
        )}
      </div>
    </FoldedCard>
  );
};

export default MiniBaner;