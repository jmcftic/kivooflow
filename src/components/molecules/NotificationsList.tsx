import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/network';
import { KfNotification } from '@/types/network';
import { Spinner } from '@/components/ui/spinner';
import NotificationDetailModal from './NotificationDetailModal';
import { translateNotificationKey } from '@/utils/notificationTranslator';

interface NotificationsListProps {
  onClose?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ onClose, onUnreadCountChange }) => {
  const { t, i18n } = useTranslation(['notifications', 'common']);
  const queryClient = useQueryClient();
  const [currentPage] = React.useState(1);
  const [pageSize] = React.useState(20);
  const [selectedNotification, setSelectedNotification] = React.useState<KfNotification | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const {
    data: notificationsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', currentPage, pageSize],
    queryFn: () => getUserNotifications({ page: currentPage, pageSize }),
    staleTime: 30 * 1000, // Cache por 30 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Siempre refetch cuando se monta el componente (al abrir popover)
  });

  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = notificationsData?.data?.unreadCount || 0;
  
  // Mostrar spinner si está cargando inicialmente (isLoading) o haciendo fetch sin datos previos válidos
  // También mostrar spinner si está haciendo refetch y aún no tenemos datos confirmados
  const hasData = notificationsData && notificationsData.data;
  const shouldShowLoading = isLoading || (isFetching && !hasData);

  // Notificar cambios en el contador de no leídas
  React.useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      // Invalidar la query para recargar las notificaciones
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const handleNotificationClick = async (notification: KfNotification) => {
    // Abrir el modal con la notificación seleccionada
    setSelectedNotification(notification);
    setIsModalOpen(true);
    
    // Si la notificación no está leída, marcarla como leída
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Invalidar la query para recargar las notificaciones
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t('notifications:time.fewSecondsAgo');
    if (diffInSeconds < 3600) return t('notifications:time.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('notifications:time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t('notifications:time.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
    
    // Usar locale según el idioma
    const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };


  // Mostrar spinner mientras está cargando inicialmente o haciendo fetch sin datos previos
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-8">
        <Spinner className="size-5 text-[#FFF100] animate-spin" />
        <div className="text-white/60 text-sm">{t('notifications:messages.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-white/60 text-sm mb-2">{t('notifications:messages.error')}</div>
        <div className="text-white/40 text-xs">{t('notifications:messages.tryAgain')}</div>
      </div>
    );
  }

  // Solo mostrar "no hay notificaciones" cuando la petición se completó completamente (!isLoading && !isFetching) 
  // y tenemos datos confirmados pero no hay notificaciones
  if (!isLoading && !isFetching && hasData && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-white/60 text-sm mb-2">{t('notifications:titles.noNotifications')}</div>
        <div className="text-white/40 text-xs">{t('notifications:messages.allNotificationsHere')}</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 w-full">
          <h3 className="text-lg font-semibold text-white truncate">{t('notifications:titles.notifications')}</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-[#FFF100] hover:text-[#FFF100]/80 transition-colors flex-shrink-0 ml-2"
            >
              {t('notifications:buttons.markAllRead')}
            </button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <div className="flex flex-col gap-2 w-full">
          {notifications.map((notification: KfNotification) => (
            <div
              key={notification.id}
              className={`relative p-3 rounded-lg border-l-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${
                notification.isRead ? 'opacity-60' : ''
              } ${getNotificationColor(notification.type)}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h4 className="text-sm font-semibold text-white mb-1 break-words">
                    {translateNotificationKey(notification.title)}
                  </h4>
                  <p className="text-xs text-white/70 mb-2 line-clamp-2 break-words">
                    {translateNotificationKey(notification.body || notification.message)}
                  </p>
                  <span className="text-xs text-white/50 break-words">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-[#FFF100] flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalle de notificación */}
      <NotificationDetailModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setSelectedNotification(null);
          }
        }}
        notification={selectedNotification}
      />
    </>
  );
};

export default NotificationsList;

