import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

interface FoldedCardProps {
  children?: ReactNode;
  className?: string;
  gradientColor?: string;
  backgroundColor?: string;
  foldColor?: string;
  variant?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function FoldedCard({
  children,
  className,
  gradientColor = "#FFF100",
  backgroundColor = "#212020",
  foldColor = "#2a2929",
  variant = "md",
}: FoldedCardProps) {
  const sizeClasses = {
    sm: "h-20 text-sm",
    md: "h-24 text-base",
    lg: "h-32 text-lg",
    xl: "h-40 text-xl",
    "2xl": "h-[480px] text-xl",
  };

  const foldSize = 30;
  
  // Detectar si className tiene h-auto o min-h para ajustar el comportamiento
  const hasAutoHeight = className?.includes('h-auto') || className?.includes('min-h-');
  const overflowClass = hasAutoHeight ? 'overflow-visible md:overflow-hidden' : 'overflow-hidden';
  
  // Si tiene altura automática, usar las clases pasadas directamente, sino usar las del variant
  const heightClasses = hasAutoHeight ? className : cn(sizeClasses[variant], className);

  return (
    <div className={cn("relative w-full rounded-lg isolate", overflowClass, heightClasses)} style={{ willChange: 'contents' }}>
      {/* Background layer - siempre debe tener altura completa */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          backgroundColor: backgroundColor,
          clipPath: `polygon(0 0, calc(100% - ${foldSize}px) 0, 100% ${foldSize}px, 100% 100%, 0 100%)`,
          transform: "translateZ(0)", // Force GPU acceleration for smoother rendering
          willChange: "transform", // Hint to browser for optimization
          backfaceVisibility: "hidden", // Prevent flickering during scroll
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(to top, ${gradientColor}00 0%, ${gradientColor}47 100%)`,
          }}
        />
      </div>

      {/* Content container */}
      <div className={`relative z-10 ${hasAutoHeight ? 'min-h-full md:h-full w-full' : 'h-full'} flex ${hasAutoHeight ? 'flex-col md:flex-row md:items-center' : 'items-center'} px-6 md:px-8 lg:px-10`} style={{ isolation: 'isolate' }}>{children}</div>
    </div>
  );
}

export default FoldedCard;

