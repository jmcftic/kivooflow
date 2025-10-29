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
  const foldSize = 30

  return (
    <div className={cn("relative w-full overflow-hidden isolate", className)} style={{ height: `${height}px` }}>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="foldGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={`${gradientColor}00`} />
            <stop offset="100%" stopColor={`${gradientColor}47`} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Main shape with rounded fold corners */}
        <path
          d={`M 0 0 
              L calc(100% - ${foldSize}px) 0  
              Q calc(100% - ${foldSize - 16}px) ${foldSize - 16}px, calc(100% - ${foldSize - 32}px) ${foldSize}px
              L 100% ${foldSize}px 
              L 100% 100% 
              L 0 100% 
              Z`}
          fill={backgroundColor}
        />
        {/* Gradient overlay */}
        <path
          d={`M 0 0 
              L calc(100% - ${foldSize}px) 0 
              Q calc(100% - ${foldSize - 12}px) ${foldSize - 12}px, calc(100% - ${foldSize - 24}px) ${foldSize}px
              L 100% ${foldSize}px 
              L 100% 100% 
              L 0 100% 
              Z`}
          fill="url(#foldGradient)"
        />
      </svg>

      {/* Content container */}
      <div className="relative z-10 h-full flex items-center px-6">{children}</div>
    </div>
  )
}

export default FoldedTabCard
