import React, { useState, useMemo } from "react";
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

// Función para obtener órdenes de la API con paginación
const fetchOrders = async ({ 
  pageParam = 1,
  claimType
}: { 
  pageParam: number;
  claimType?: 'B2C' | 'B2B';
}): Promise<{ data: MappedOrder[], nextPage: number | null, totalPages: number }> => {
  const pageSize = 10;
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

const ClaimsListCard: React.FC<ClaimsListCardProps> = ({ className = "", activeTab = null }) => {
  const navigate = useNavigate();

  // Convertir activeTab a claimType (b2c -> B2C, b2b -> B2B)
  // Nota: B2T no está soportado en órdenes según la documentación
  const claimType = activeTab && activeTab !== 'b2t' ? (activeTab.toUpperCase() as 'B2C' | 'B2B') : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['orders', activeTab],
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
      return date.toLocaleDateString('es-MX', {
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
        return 'Pagada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
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
        {/* Headers de tabla - estilo Network */}
        <div className="w-full mb-3">
          <div className="w-full flex items-center px-6">
            <div className="flex-1 grid grid-cols-4 gap-4 h-10 items-center text-xs text-white">
              <div className="flex items-center justify-center gap-1">Fecha <OrderArrows /></div>
              <div className="flex items-center justify-center gap-1">Monto <OrderArrows /></div>
              <div className="flex items-center justify-center gap-1">Estado <OrderArrows /></div>
              <div className="flex items-center justify-center gap-1">Acciones</div>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="w-full space-y-2">
            {status === "pending" || isLoading || isFetching ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="size-6 text-[#FFF000]" />
                  <span className="text-sm text-[#aaa]">Cargando órdenes...</span>
                </div>
              </div>
            ) : status === "error" ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#ff6d64]">Error al cargar órdenes</span>
              </div>
            ) : allOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#aaa]">No hay órdenes disponibles</span>
              </div>
            ) : (
              <>
                {/* Tabla de órdenes - estilo Network */}
                {allOrders.map((order: MappedOrder) => (
                  <InfoBanner key={order.id} className="w-full h-16" backgroundColor="#212020">
                    <div className="w-full flex items-center px-6 py-2">
                      <div className="flex-1 grid grid-cols-4 gap-4 items-center text-sm text-white">
                        {/* Fecha */}
                        <div className="flex items-center justify-center">
                          <span className="text-white">{formatFecha(order.fecha)}</span>
                        </div>
                        {/* Monto */}
                        <div className="flex items-center justify-center">
                          <span className="text-white">{formatMonto(order.monto)}</span>
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
                            detalles
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
                        <span className="text-sm text-[#aaa]">Cargando más órdenes...</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => fetchNextPage()}
                        className="action-text"
                      >
                        Cargar más órdenes
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

