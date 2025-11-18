import { useState, useEffect } from 'react';
import { getDashboardMetrics } from '@/services/dashboard';
import { DashboardMetrics } from '@/types/dashboard';

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardMetrics();
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
  }, []);

  return { metrics, loading, error };
};

