import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface FoldedTabCardProps {
  children?: ReactNode
  className?: string
  gradientColor?: string
  backgroundColor?: string
  height?: number
}

export function FoldedTabCard({
  children,
  className,
  gradientColor = "#fff000",
  backgroundColor = "#2d2d2d",
  height = 52,
}: FoldedTabCardProps) {
  // Ajustar foldSize proporcional a la altura - 30% de la altura
  const foldSize = Math.floor(height * 0.3)
  
  // Reducir padding para tabs pequeños (menos de 35px de altura)
  const paddingX = height < 35 ? 'px-2' : 'px-6'
  
  return (
    <div 
      className={cn("relative w-full overflow-hidden isolate", className)} 
      style={{ height: `${height}px` }}
    >
      {/* Background with clip-path */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: backgroundColor,
          clipPath: `polygon(0 0, calc(100% - ${foldSize}px) 0, 100% ${foldSize}px, 100% 100%, 0 100%)`,
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
      <div className={cn("relative z-10 h-full flex items-center justify-center whitespace-nowrap", paddingX)}>{children}</div>
    </div>
  )
}

export default FoldedTabCard
