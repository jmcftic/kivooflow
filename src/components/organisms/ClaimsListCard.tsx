import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { getOrders } from "@/services/network";
import { Order } from "@/types/network";
import InfoBanner from "../atoms/InfoBanner";
import OrderArrows from "../atoms/OrderArrows";
import { formatCurrencyWithThreeDecimals } from "@/lib/utils";

interface ClaimsListCardProps {
  className?: string;
  activeTab?: 'b2c' | 'b2b' | 'b2t' | null;
  pageSize?: number; // Agregar prop opcional para pageSize
}

// Mapear Order del backend al formato esperado
interface MappedOrder {
  id: string;
  fecha: string;
  estado: string;
  monto: number;
  originalOrder: Order;
  itemsCount: number;
}

const mapOrder = (order: Order): MappedOrder => {
  return {
    id: `ORD-${String(order.id).padStart(3, '0')}`,
    fecha: order.createdAt,
    estado: order.status, // Mantener el estado original del backend
    monto: order.totalAmount,
    originalOrder: order,
    itemsCount: order.itemsCount,
  };
};

const ClaimsListCard: React.FC<ClaimsListCardProps> = ({ className = "", activeTab = null, pageSize = 50 }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['claims', 'common']);

  // Convertir activeTab a claimType (b2c -> B2C, b2b -> B2B)
  // Nota: B2T no está soportado en órdenes según la documentación
  const claimType = activeTab && activeTab !== 'b2t' ? (activeTab.toUpperCase() as 'B2C' | 'B2B') : undefined;

  // Función para obtener órdenes de la API con paginación
  const fetchOrders = async ({ 
    pageParam = 1,
    claimType
  }: { 
    pageParam: number;
    claimType?: 'B2C' | 'B2B';
  }): Promise<{ data: MappedOrder[], nextPage: number | null, totalPages: number }> => {
    // Usar el pageSize del prop, con valor por defecto de 50
    // Filtrar por estados "pending" y "paid" (órdenes pendientes y pagadas)
    const response = await getOrders({ 
      page: pageParam, 
      pageSize, 
      status: ['pending', 'paid'],
      claimType
    });
    
    const mappedData = response.data.items.map(mapOrder);
    const hasMore = pageParam < response.data.totalPages;
    
    return {
      data: mappedData,
      nextPage: hasMore ? pageParam + 1 : null,
      totalPages: response.data.totalPages,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['orders', activeTab, pageSize], // Incluir pageSize en la queryKey para que se actualice cuando cambie
    queryFn: ({ pageParam = 1 }) => fetchOrders({ 
      pageParam: pageParam as number,
      claimType
    }),
    getNextPageParam: (lastPage: { data: MappedOrder[], nextPage: number | null }) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: activeTab !== null && activeTab !== 'b2t', // B2T no está soportado en órdenes
  });

  const allOrders = useMemo(() => {
    return data?.pages.flatMap((page: { data: MappedOrder[] }) => page.data) || [];
  }, [data]);

  const handleVerDetalle = (id: string) => {
    const order = allOrders.find((o: MappedOrder) => o.id === id);
    if (order) {
      // Guardar orderId y claimType en localStorage
      localStorage.setItem('claimDetailOrderId', order.originalOrder.id.toString());
      if (claimType) {
        localStorage.setItem('claimDetailClaimType', claimType);
      }
      // Navegar a la página de detalle
      navigate('/claim/detail');
    }
  };

  const formatFecha = (fecha: string): string => {
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return 'N/A';
      // Usar locale según el idioma
      const locale = i18n.language === 'en' ? 'en-US' : 'es-MX';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatMonto = (monto: number): string => {
    return `USDT ${formatCurrencyWithThreeDecimals(monto)}`;
  };

  const getEstadoLabel = (estado: string): string => {
    switch(estado.toLowerCase()) {
      case 'paid':
        return t('claims:table.status.paid');
      case 'pending':
        return t('claims:table.status.pending');
      case 'cancelled':
        return t('claims:table.status.cancelled');
      default:
        return estado;
    }
  };

  const getEstadoBadgeVariant = (estado: string): 'yellow' | 'green' | 'red' | 'default' => {
    switch(estado.toLowerCase()) {
      case 'paid':
        return 'green'; // Pagada - verde
      case 'pending':
        return 'yellow'; // Pendiente - amarillo
      case 'cancelled':
        return 'red'; // Cancelada - rojo
      default:
        return 'default';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full flex flex-col">
        {/* Headers de tabla - estilo Network - Solo visible en desktop */}
        <div className="w-full mb-3 hidden md:block">
          <div className="w-full flex items-center px-4 md:px-6">
            <div className="flex-1 grid grid-cols-4 gap-4 h-10 items-center text-xs text-white">
              <div className="flex items-center justify-center gap-1">{t('claims:table.headers.date')} <OrderArrows /></div>
              <div className="flex items-center justify-center gap-1">{t('claims:table.headers.amount')} <OrderArrows /></div>
              <div className="flex items-center justify-center gap-1">{t('claims:table.headers.status')} <OrderArrows /></div>
              <div className="flex items-center justify-center gap-1">{t('claims:table.headers.actions')}</div>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="w-full space-y-2">
            {status === "pending" || isLoading || isFetching ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="size-6 text-[#FFF000]" />
                  <span className="text-sm text-[#aaa]">{t('claims:table.messages.loading')}</span>
                </div>
              </div>
            ) : status === "error" ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#ff6d64]">{t('claims:table.messages.error')}</span>
              </div>
            ) : allOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#aaa]">{t('claims:table.messages.noOrders')}</span>
              </div>
            ) : (
              <>
                {/* Tabla de órdenes - estilo Network */}
                {allOrders.map((order: MappedOrder) => (
                  <InfoBanner key={order.id} className="w-full h-auto md:h-16 md:min-h-[64px]" backgroundColor="#212020">
                    {/* Layout móvil: cada campo en su propia row */}
                    <div className="flex flex-col md:hidden gap-2 w-full px-4 py-4">
                      {/* Fecha */}
                      <div className="flex flex-row items-center justify-between w-full py-1.5">
                        <span className="text-[#CBCACA] text-xs">{t('claims:table.headers.date')}</span>
                        <span className="text-white text-sm font-medium">{formatFecha(order.fecha)}</span>
                      </div>
                      {/* Monto */}
                      <div className="flex flex-row items-center justify-between w-full py-1.5">
                        <span className="text-[#CBCACA] text-xs">{t('claims:table.headers.amount')}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-white text-sm font-medium">{formatMonto(order.monto)}</span>
                          {order.originalOrder.netAmount !== null && order.originalOrder.netAmount !== undefined && (
                            <span className="text-xs text-white/60 mt-1">
                              {t('claims:cards.net')}: {formatCurrencyWithThreeDecimals(order.originalOrder.netAmount)} USDT
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Estado con badge */}
                      <div className="flex flex-row items-center justify-between w-full py-1.5">
                        <span className="text-[#CBCACA] text-xs">{t('claims:table.headers.status')}</span>
                        <Badge 
                          variant={getEstadoBadgeVariant(order.estado)}
                          className="text-xs"
                        >
                          {getEstadoLabel(order.estado)}
                        </Badge>
                      </div>
                      {/* Acciones */}
                      <div className="flex flex-row items-center justify-center w-full py-1.5">
                        <button
                          onClick={() => handleVerDetalle(order.id)}
                          className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer text-sm"
                        >
                          {t('claims:table.labels.details')}
                        </button>
                      </div>
                    </div>
                    
                    {/* Layout desktop: grid de 4 columnas - misma estructura que headers */}
                    <div className="hidden md:flex w-full items-center px-4 md:px-6 py-2">
                      <div className="flex-1 grid grid-cols-4 gap-4 items-center text-sm text-white">
                        {/* Fecha */}
                        <div className="flex items-center justify-center">
                          <span className="text-white">{formatFecha(order.fecha)}</span>
                        </div>
                        {/* Monto */}
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-white">{formatMonto(order.monto)}</span>
                            {order.originalOrder.netAmount !== null && order.originalOrder.netAmount !== undefined && (
                              <span className="text-xs text-white/60">
                                {t('claims:cards.net')}: {formatCurrencyWithThreeDecimals(order.originalOrder.netAmount)} USDT
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Estado con badge */}
                        <div className="flex items-center justify-center">
                          <Badge 
                            variant={getEstadoBadgeVariant(order.estado)}
                            className="text-xs"
                          >
                            {getEstadoLabel(order.estado)}
                          </Badge>
                        </div>
                        {/* Acciones */}
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleVerDetalle(order.id)}
                            className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer text-sm"
                          >
                            {t('claims:table.labels.details')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </InfoBanner>
                ))}

                {/* Botón cargar más / Spinner de carga */}
                {hasNextPage && (
                  <div className="flex items-center justify-center py-6">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2">
                        <Spinner className="size-4 text-[#FFF000]" />
                        <span className="text-sm text-[#aaa]">{t('claims:table.messages.loadingMore')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => fetchNextPage()}
                        className="action-text"
                      >
                        {t('claims:table.messages.loadMore')}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
        </div>
      </div>

    </div>
  );
};

export default ClaimsListCard;

