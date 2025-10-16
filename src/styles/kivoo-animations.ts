/**
 * Estilos centralizados para la animación diagonal de Kivoo
 * Basados en las medidas exactas del botón en Paint:
 * - Ancho: 1017px, Alto: 137px
 * - Diagonal: empieza en 85px (62% de altura), 55px horizontal (5.4% de ancho)
 */

export const KIVOO_DIAGONAL_CLASSES = {
  // Estilos base para elementos con animación diagonal
  base: "w-full rounded-tl-xl rounded-tr-xl rounded-bl-xl",
  
  // Clip-path para el estado normal (con diagonal)
  normal: "[clip-path:polygon(0_0,100%_0,100%_62%,calc(100%_-_5.4%)_100%,0_100%)]",
  
  // Clip-path para el estado hover (sin diagonal, esquina redondeada)
  hover: "hover:[clip-path:polygon(0_0,100%_0,100%_100%,100%_100%,0_100%)] hover:rounded-br-xl",
  
  // Transición suave sincronizada
  transition: "transition-all duration-700 ease-in-out",
  
  // Clase completa para aplicar a elementos con transición sincronizada
  complete: "w-full rounded-tl-xl rounded-tr-xl rounded-bl-xl [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%_-_5.4%)_100%,0_100%)] hover:[clip-path:polygon(0_0,100%_0,100%_100%,100%_100%,0_100%)] hover:rounded-br-xl transition-all duration-700 ease-in-out"
};

/**
 * Colores específicos de Kivoo
 */
export const KIVOO_COLORS = {
  yellow: {
    primary: "#FFF100",
    hover: "#E6D900",
    text: "text-gray-900"
  },
  blue: {
    primary: "#3B82F6",
    hover: "#2563EB",
    text: "text-white"
  },
  glass: {
    background: "bg-white/10",
    border: "border-white/20",
    borderHover: "hover:border-white",
    borderFocus: "focus:border-white focus:outline-none focus:shadow-none focus:ring-0 focus:!border-white",
    text: "text-white",
    placeholder: "placeholder-gray-300"
  }
};
