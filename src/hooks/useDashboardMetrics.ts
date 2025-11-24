import { useState, useEffect, useCallback } from 'react';
import { getDashboardMetrics, getDashboardResume } from '@/services/dashboard';
import { DashboardMetrics, DateFilter } from '@/types/dashboard';

export const useDashboardMetrics = (model: string | null) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // No hacer la petición si no hay modelo seleccionado
    if (!model) {
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        // Carga inicial: obtener todas las métricas (por defecto last_2_months)
        const data = await getDashboardMetrics(model, 'last_2_months');
        setMetrics(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Error desconocido al obtener métricas');
        setError(errorMessage);
        setMetrics(null);
        console.error('Error obteniendo métricas del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchMetrics();
  }, [model]); // Recargar cuando cambie el modelo

  // Función para actualizar solo el resume cuando cambia el filtro de fecha
  const updateResume = useCallback(async (newDateFilter: DateFilter) => {
    if (!model) {
      return;
    }

    try {
      setError(null);
      // Usar el endpoint específico para solo actualizar el resume
      const resumeData = await getDashboardResume(model, newDateFilter);
      
      // Actualizar solo el campo resume, manteniendo las demás métricas
      setMetrics((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          resume: resumeData,
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Error al actualizar el resumen');
      setError(errorMessage);
      console.error('Error actualizando el resumen:', err);
    }
  }, [model]);

  return { metrics, loading, error, updateResume };
};

