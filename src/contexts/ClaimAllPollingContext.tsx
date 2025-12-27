import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getUserNotifications } from '@/services/network';

interface ClaimAllPollingContextType {
  startPolling: () => void;
  stopPolling: () => void;
}

const ClaimAllPollingContext = createContext<ClaimAllPollingContextType | undefined>(undefined);

export const useClaimAllPollingContext = () => {
  const context = useContext(ClaimAllPollingContext);
  if (!context) {
    throw new Error('useClaimAllPollingContext must be used within ClaimAllPollingProvider');
  }
  return context;
};

interface ClaimAllPollingProviderProps {
  children: ReactNode;
}

export const ClaimAllPollingProvider: React.FC<ClaimAllPollingProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [claimAllInProgress, setClaimAllInProgress] = useState(false);
  const initialUnreadCountRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!claimAllInProgress) {
      // Resetear el contador inicial cuando se detiene el polling
      initialUnreadCountRef.current = null;
      return;
    }
    
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
        const currentUnreadCount = response.data.unreadCount;
        
        // Establecer el contador inicial en el primer poll si no está establecido
        if (initialUnreadCountRef.current === null) {
          initialUnreadCountRef.current = currentUnreadCount;
          return; // No hacer nada más en el primer poll
        }
        
        // Si hay nuevas notificaciones (aumentó el contador), detener polling
        if (currentUnreadCount > initialUnreadCountRef.current) {
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
  
  return (
    <ClaimAllPollingContext.Provider value={{ startPolling, stopPolling }}>
      {children}
    </ClaimAllPollingContext.Provider>
  );
};

