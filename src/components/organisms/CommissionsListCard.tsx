import React, { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import ClaimItem from "../atoms/ClaimItem";
import ClaimDetailModal from "../molecules/ClaimDetailModal";
import { Spinner } from "@/components/ui/spinner";
import { getClaims } from "@/services/network";
import { Claim } from "@/types/network";

interface CommissionsListCardProps {
  className?: string;
}

// Mapear Claim del backend al formato esperado por ClaimItem
interface MappedClaim {
  id: string;
  fecha: string;
  tarjeta: string;
  estado: string;
  monto: number;
  originalClaim: Claim;
}

const mapClaim = (claim: Claim): MappedClaim => {
  // Mapear estado del backend a formato legible
  const mapStatus = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'processed' || statusLower === 'claimed') return 'Aprobado';
    if (statusLower === 'pending') return 'Pendiente';
    if (statusLower === 'available') return 'Disponible';
    if (statusLower === 'rejected' || statusLower === 'cancelled') return 'Rechazado';
    return status;
  };

  // Para tarjeta, usar cryptoTransactionId si existe, sino mostrar un placeholder
  const tarjeta = claim.cryptoTransactionId 
    ? `**** ${String(claim.cryptoTransactionId).slice(-4)}`
    : 'N/A';

  return {
    id: `CLM-${String(claim.id).padStart(3, '0')}`,
    fecha: claim.createdAt,
    tarjeta,
    estado: mapStatus(claim.status),
    monto: typeof claim.commissionAmount === 'number' 
      ? claim.commissionAmount 
      : parseFloat(String(claim.commissionAmount)) || 0,
    originalClaim: claim,
  };
};

// Función para obtener comisiones (claims disponibles) de la API con paginación
const fetchCommissions = async ({ 
  pageParam = 1 
}: { 
  pageParam: number;
}): Promise<{ data: MappedClaim[], nextPage: number | null, totalPages: number }> => {
  const pageSize = 10;
  // Filtrar solo por estado "available"
  const response = await getClaims({ page: pageParam, pageSize, status: 'available' });
  
  const mappedData = response.items.map(mapClaim);
  const hasMore = pageParam < response.pagination.totalPages;
  
  return {
    data: mappedData,
    nextPage: hasMore ? pageParam + 1 : null,
    totalPages: response.pagination.totalPages,
  };
};

const CommissionsListCard: React.FC<CommissionsListCardProps> = ({ className = "" }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<MappedClaim | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['commissions'],
    queryFn: ({ pageParam = 1 }) => fetchCommissions({ pageParam: pageParam as number }),
    getNextPageParam: (lastPage: { data: MappedClaim[], nextPage: number | null }) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const allCommissions = useMemo(() => {
    return data?.pages.flatMap((page: { data: MappedClaim[] }) => page.data) || [];
  }, [data]);

  const handleVerDetalle = (id: string) => {
    const claim = allCommissions.find((c: MappedClaim) => c.id === id);
    if (claim) {
      setSelectedClaim(claim);
      setModalOpen(true);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full flex flex-col">
        {/* Contenido scrolleable */}
        <div className="w-full space-y-4">
            {status === "pending" ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="size-6 text-[#FFF000]" />
                  <span className="text-sm text-[#aaa]">Cargando comisiones...</span>
                </div>
              </div>
            ) : status === "error" ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#ff6d64]">Error al cargar comisiones</span>
              </div>
            ) : allCommissions.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <span className="text-sm text-[#aaa]">No hay comisiones disponibles</span>
              </div>
            ) : (
              <>
                {/* Lista de comisiones */}
                {allCommissions.map((commission: MappedClaim) => (
                  <ClaimItem
                    key={commission.id}
                    id={commission.id}
                    fecha={commission.fecha}
                    tarjeta={commission.tarjeta}
                    estado={commission.estado}
                    monto={commission.monto}
                    onVerDetalle={() => handleVerDetalle(commission.id)}
                  />
                ))}

                {/* Botón cargar más / Spinner de carga */}
                {hasNextPage && (
                  <div className="flex items-center justify-center py-6">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2">
                        <Spinner className="size-4 text-[#FFF000]" />
                        <span className="text-sm text-[#aaa]">Cargando más comisiones...</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => fetchNextPage()}
                        className="action-text"
                      >
                        Cargar más comisiones
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedClaim && (
        <ClaimDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          claimId={selectedClaim.id}
          monto={selectedClaim.monto}
        />
      )}
    </div>
  );
};

export default CommissionsListCard;

