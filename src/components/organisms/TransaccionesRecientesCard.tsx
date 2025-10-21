import React, { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import FoldedCard from "../atoms/FoldedCard";
import TransactionItem from "../atoms/TransactionItem";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import transaccionesData from "../../data/transacciones.json";

interface TransaccionesRecientesCardProps {
  className?: string;
}

interface Transaccion {
  id: string;
  fecha: string;
  empresa: string;
  montoUSDT: number;
  montoCOP: number;
  tipo: "ingreso" | "egreso";
}

// Función para simular una API con paginación
const fetchTransacciones = async ({ pageParam = 0 }: { pageParam: number }): Promise<{ data: Transaccion[], nextPage: number | null }> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const pageSize = 5;
  const start = pageParam * pageSize;
  const end = start + pageSize;
  const allTransactions = transaccionesData.transacciones as Transaccion[];
  const data = allTransactions.slice(start, end);
  const hasMore = end < allTransactions.length;
  
  return {
    data,
    nextPage: hasMore ? pageParam + 1 : null
  };
};

const TransaccionesRecientesCard: React.FC<TransaccionesRecientesCardProps> = ({ className = "" }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['transacciones'],
    queryFn: fetchTransacciones,
    getNextPageParam: (lastPage: { data: Transaccion[], nextPage: number | null }) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Agrupar transacciones por fecha
  const groupedTransactions = useMemo(() => {
    if (!data) return { hoy: [], ayer: [], anteriores: [] };
    
    const allTransactions = data.pages.flatMap((page: { data: Transaccion[] }) => page.data);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hoy: Transaccion[] = [];
    const ayer: Transaccion[] = [];
    const anteriores: Transaccion[] = [];
    
    allTransactions.forEach((transaction: Transaccion) => {
      const transactionDate = new Date(transaction.fecha);
      const transactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
      
      if (transactionDay.getTime() === today.getTime()) {
        hoy.push(transaction);
      } else if (transactionDay.getTime() === yesterday.getTime()) {
        ayer.push(transaction);
      } else {
        anteriores.push(transaction);
      }
    });
    
    return { hoy, ayer, anteriores };
  }, [data]);

  return (
    <FoldedCard
      className={className}
      gradientColor="#FFF100"
      backgroundColor="#212020"
      variant="2xl"
    >
      <div className="w-full h-full flex flex-col pt-10">
        {/* Header con título */}
        <div className="mb-6">
          <h3 className="text-[#FFF000] text-xl font-bold uppercase">TRANSACCIONES RECIENTES</h3>
        </div>

        {/* Contenido scrolleable */}
        <ScrollArea className="flex-1">
          <div className="pr-4">
          {status === "pending" ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Spinner className="size-6 text-[#FFF000]" />
                <span className="text-sm text-[#aaa]">Cargando transacciones...</span>
              </div>
            </div>
          ) : status === "error" ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm text-[#ff6d64]">Error al cargar transacciones</span>
            </div>
          ) : (
            <>
              {/* Sección HOY */}
              {groupedTransactions.hoy.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white text-xl mb-3">Hoy</h4>
                  {groupedTransactions.hoy.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      empresa={transaction.empresa}
                      montoUSDT={transaction.montoUSDT}
                      montoCOP={transaction.montoCOP}
                      tipo={transaction.tipo}
                    />
                  ))}
                </div>
              )}

              {/* Sección AYER */}
              {groupedTransactions.ayer.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white text-xl mb-3">Ayer</h4>
                  {groupedTransactions.ayer.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      empresa={transaction.empresa}
                      montoUSDT={transaction.montoUSDT}
                      montoCOP={transaction.montoCOP}
                      tipo={transaction.tipo}
                    />
                  ))}
                </div>
              )}

              {/* Sección ANTERIORES (sin label específico) */}
              {groupedTransactions.anteriores.length > 0 && (
                <div className="mb-4">
                  {groupedTransactions.anteriores.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      empresa={transaction.empresa}
                      montoUSDT={transaction.montoUSDT}
                      montoCOP={transaction.montoCOP}
                      tipo={transaction.tipo}
                    />
                  ))}
                </div>
              )}

              {/* Botón cargar más / Spinner de carga */}
              {hasNextPage && (
                <div className="flex items-center justify-center py-4">
                  {isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Spinner className="size-5 text-[#FFF000]" />
                      <span className="text-xs text-[#aaa]">Cargando más transacciones...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchNextPage()}
                      className="text-[#FFF000] text-sm hover:text-[#E6D900] transition-colors"
                    >
                      Cargar más transacciones
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          </div>
        </ScrollArea>
      </div>
    </FoldedCard>
  );
};

export default TransaccionesRecientesCard;

