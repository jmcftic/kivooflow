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

  return (
    <div className={cn("relative w-full rounded-lg overflow-hidden isolate", sizeClasses[variant], className)}>
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          backgroundColor: backgroundColor,
          clipPath: `polygon(0 0, calc(100% - ${foldSize}px) 0, 100% ${foldSize}px, 100% 100%, 0 100%)`,
          transform: "translateZ(0)", // Force GPU acceleration for smoother rendering
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
      <div className="relative z-10 h-full flex items-center px-6 md:px-8 lg:px-10">{children}</div>
    </div>
  );
}

export default FoldedCard;

