import type React from "react"
import type { FunctionComponent } from "react"

export type ReferredLinkGapType = {
  className?: string
  children?: React.ReactNode
}

const ReferredLinkGap: FunctionComponent<ReferredLinkGapType> = ({ className = "", children, ...props }) => (
  <div className={`relative w-full h-10 md:h-[49px] overflow-hidden max-w-full ${className}`} {...props}>
    {/* Fondo y borde con CSS en lugar de SVG */}
    <div
      className="absolute inset-0 rounded-xl"
      style={{
        backgroundColor: "rgba(254, 241, 0, 0.05)",
        border: "1px dashed #FEF100",
        borderRadius: "12px",
      }}
    />

    {/* Contenido del gap */}
    {children && <div className="absolute inset-0 flex items-center justify-start pl-2 pr-2 sm:pl-4 sm:pr-4 overflow-hidden max-w-full">{children}</div>}
  </div>
)

export default ReferredLinkGap
