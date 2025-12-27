import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import NotificationsList from './NotificationsList';
import { getUserNotifications } from '@/services/network';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Obtener el contador de notificaciones no leídas
  // Usamos la misma query key que NotificationsList para compartir el cache
  // NotificationsList usa page=1 y pageSize=20 por defecto
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 1, 20],
    queryFn: async () => {
      const response = await getUserNotifications({ page: 1, pageSize: 20 });
      return response.data.unreadCount;
    },
    staleTime: 30 * 1000, // Cache por 30 segundos
    refetchOnWindowFocus: true,
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors ${className}`}
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-[#FFF100] rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 max-w-[90vw] max-h-[500px] overflow-y-auto">
        {isOpen && <NotificationsList onClose={() => setIsOpen(false)} />}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

