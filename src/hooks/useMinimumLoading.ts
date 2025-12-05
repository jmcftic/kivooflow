import { useState, useEffect, useRef } from 'react';

/**
 * Hook que garantiza que el loading se muestre al menos por un tiempo mínimo
 * @param isLoading - Estado de carga real
 * @param minimumTime - Tiempo mínimo en milisegundos (por defecto 3000ms = 3 segundos)
 * @returns Estado de loading que incluye el tiempo mínimo
 */
export function useMinimumLoading(isLoading: boolean, minimumTime: number = 3000): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Si empieza a cargar, guardar el tiempo de inicio
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
        setShowLoading(true);
      }
    } else {
      // Si terminó de cargar
      if (startTimeRef.current !== null) {
        const elapsedTime = Date.now() - startTimeRef.current;
        const remainingTime = minimumTime - elapsedTime;

        if (remainingTime > 0) {
          // Aún no ha pasado el tiempo mínimo, esperar el tiempo restante
          timeoutRef.current = setTimeout(() => {
            setShowLoading(false);
            startTimeRef.current = null;
          }, remainingTime);
        } else {
          // Ya pasó el tiempo mínimo, ocultar inmediatamente
          setShowLoading(false);
          startTimeRef.current = null;
        }
      }
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, minimumTime]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return showLoading;
}

