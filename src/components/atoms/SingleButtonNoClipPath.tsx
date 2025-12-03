import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const singleButtonNoClipPathVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF100] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#FFF100] text-black hover:bg-[#E6D900]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SingleButtonNoClipPathProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof singleButtonNoClipPathVariants> {
  asChild?: boolean
}

const SingleButtonNoClipPath = React.forwardRef<HTMLButtonElement, SingleButtonNoClipPathProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(singleButtonNoClipPathVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
SingleButtonNoClipPath.displayName = "SingleButtonNoClipPath"

export { SingleButtonNoClipPath, singleButtonNoClipPathVariants }

