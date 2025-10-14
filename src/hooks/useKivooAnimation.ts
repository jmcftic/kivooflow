import { KIVOO_DIAGONAL_CLASSES } from "../styles/kivoo-animations";

/**
 * Hook personalizado para aplicar la animación diagonal de Kivoo
 * Permite reutilizar la lógica de animación en cualquier componente
 */
export const useKivooAnimation = (enabled: boolean = true) => {
  if (!enabled) {
    return {
      baseClasses: "",
      normalClasses: "",
      hoverClasses: "",
      transitionClasses: "",
      completeClasses: ""
    };
  }

  return {
    baseClasses: KIVOO_DIAGONAL_CLASSES.base,
    normalClasses: KIVOO_DIAGONAL_CLASSES.normal,
    hoverClasses: KIVOO_DIAGONAL_CLASSES.hover,
    transitionClasses: KIVOO_DIAGONAL_CLASSES.transition,
    completeClasses: KIVOO_DIAGONAL_CLASSES.complete
  };
};

/**
 * Hook para obtener clases condicionales de animación
 * @param variant - La variante del componente
 * @returns Las clases apropiadas para la variante
 */
export const useKivooVariantClasses = (variant: string) => {
  const isKivooVariant = variant.startsWith('kivoo-');
  const { completeClasses } = useKivooAnimation(isKivooVariant);
  
  return {
    hasAnimation: isKivooVariant,
    animationClasses: completeClasses
  };
};
