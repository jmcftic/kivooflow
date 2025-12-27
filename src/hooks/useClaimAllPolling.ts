import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getUserNotifications } from '@/services/network';

export const useClaimAllPolling = () => {
  const queryClient = useQueryClient();
  const [claimAllInProgress, setClaimAllInProgress] = useState(false);
  
  useEffect(() => {
    if (!claimAllInProgress) return;
    
    const startTime = Date.now();
    const MAX_POLLING_TIME = 30000; // 30 segundos máximo
    
    const intervalId = setInterval(async () => {
      // Verificar timeout máximo
      if (Date.now() - startTime > MAX_POLLING_TIME) {
        setClaimAllInProgress(false);
        return;
      }
      
      try {
        const response = await getUserNotifications({ page: 1, pageSize: 1 });
        // Si hay notificaciones no leídas, detener polling
        if (response.data.unreadCount > 0) {
          setClaimAllInProgress(false);
          // Invalidar queries de notificaciones para actualizar badge
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      } catch (error) {
        console.error('Error en polling de notificaciones:', error);
      }
    }, 2000); // Polling cada 2 segundos
    
    return () => clearInterval(intervalId);
  }, [claimAllInProgress, queryClient]);
  
  const startPolling = () => setClaimAllInProgress(true);
  const stopPolling = () => setClaimAllInProgress(false);
  
  return { startPolling, stopPolling };
};

