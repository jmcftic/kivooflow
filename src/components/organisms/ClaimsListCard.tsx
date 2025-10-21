import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import ClaimItem from "../atoms/ClaimItem";
import ClaimDetailModal from "../molecules/ClaimDetailModal";
import { Spinner } from "@/components/ui/spinner";
import comisionesData from "../../data/comisiones.json";

interface ClaimsListCardProps {
  className?: string;
}

interface Comision {
  id: string;
  fecha: string;
  tarjeta: string;
  estado: string;
  monto: number;
}

// Función para simular una API con paginación
const fetchComisiones = async ({ pageParam = 0 }: { pageParam: number }): Promise<{ data: Comision[], nextPage: number | null }> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const pageSize = 5;
  const start = pageParam * pageSize;
  const end = start + pageSize;
  const allComisiones = comisionesData.comisiones as Comision[];
  const data = allComisiones.slice(start, end);
  const hasMore = end < allComisiones.length;
  
  return {
    data,
    nextPage: hasMore ? pageParam + 1 : null
  };
};

const ClaimsListCard: React.FC<ClaimsListCardProps> = ({ className = "" }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Comision | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['comisiones'],
    queryFn: fetchComisiones,
    getNextPageParam: (lastPage: { data: Comision[], nextPage: number | null }) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const allComisiones = data?.pages.flatMap((page: { data: Comision[] }) => page.data) || [];

  // Obtener tarjetas únicas del listado
  const tarjetasUnicas: string[] = Array.from(new Set(allComisiones.map((c: Comision) => c.tarjeta)));

  const handleVerDetalle = (id: string) => {
    const claim = allComisiones.find((c: Comision) => c.id === id);
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
            ) : (
              <>
                {/* Lista de comisiones */}
                {allComisiones.map((comision: Comision) => (
                  <ClaimItem
                    key={comision.id}
                    id={comision.id}
                    fecha={comision.fecha}
                    tarjeta={comision.tarjeta}
                    estado={comision.estado}
                    monto={comision.monto}
                    onVerDetalle={() => handleVerDetalle(comision.id)}
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
          tarjetasDisponibles={tarjetasUnicas}
        />
      )}
    </div>
  );
};

export default ClaimsListCard;

