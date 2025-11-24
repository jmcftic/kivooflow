import React, { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import FoldedCard from "../atoms/FoldedCard";
import TransactionItem from "../atoms/TransactionItem";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRecentTransactions } from "@/services/dashboard";
import { RecentTransaction } from "@/types/dashboard";

interface TransaccionesRecientesCardProps {
  className?: string;
  model?: string | null;
  initialTransactions?: RecentTransaction[];
}

// Mapear transacción de la API al formato esperado por TransactionItem
interface MappedTransaction {
  id: string;
  fecha: string;
  empresa: string;
  montoUSDT: number;
  montoCOP: number;
  tipo: "ingreso" | "egreso";
  cryptocurrency: string;
  localCurrency: string;
}

const mapTransaction = (tx: RecentTransaction): MappedTransaction => {
  // Las recargas siempre son ingresos
  return {
    id: tx.id,
    fecha: tx.createdAt,
    empresa: tx.userEmail, // Usar el email censurado como "empresa"
    montoUSDT: tx.cryptoAmount, // Monto en crypto (puede ser USDT, USDC, etc.)
    montoCOP: tx.localAmount, // Monto en moneda local (puede ser MXN, USD, etc.)
    tipo: "ingreso", // Las recargas siempre son ingresos
    cryptocurrency: tx.cryptocurrency,
    localCurrency: tx.localCurrency,
  };
};

// Función para obtener transacciones de la API con paginación
const fetchTransacciones = async ({ 
  pageParam = 1, 
  model 
}: { 
  pageParam: number;
  model: string;
}): Promise<{ data: MappedTransaction[], nextPage: number | null, totalPages: number }> => {
  const pageSize = 5;
  const response = await getRecentTransactions(model, pageParam, pageSize);
  
  const mappedData = response.transactions.map(mapTransaction);
  const hasMore = pageParam < response.totalPages;
  
  return {
    data: mappedData,
    nextPage: hasMore ? pageParam + 1 : null,
    totalPages: response.totalPages,
  };
};

const TransaccionesRecientesCard: React.FC<TransaccionesRecientesCardProps> = ({ 
  className = "",
  model,
  initialTransactions = []
}) => {
  // Mapear transacciones iniciales
  const initialMapped = useMemo(() => {
    return initialTransactions.map(mapTransaction);
  }, [initialTransactions]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['recent-transactions', model],
    queryFn: ({ pageParam = 1 }) => {
      if (!model) {
        return Promise.resolve({ data: [], nextPage: null, totalPages: 0 });
      }
      return fetchTransacciones({ pageParam: pageParam as number, model });
    },
    getNextPageParam: (lastPage: { data: MappedTransaction[], nextPage: number | null }) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: !!model, // Solo ejecutar si hay modelo
    // Usar las transacciones iniciales como primera página
    initialData: initialMapped.length > 0 ? {
      pages: [{ data: initialMapped, nextPage: initialMapped.length >= 5 ? 2 : null, totalPages: 0 }],
      pageParams: [1],
    } : undefined,
  });

  // Agrupar transacciones por fecha
  const groupedTransactions = useMemo(() => {
    if (!data) return { hoy: [], ayer: [], anteriores: [] };
    
    const allTransactions = data.pages.flatMap((page: { data: MappedTransaction[] }) => page.data);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hoy: MappedTransaction[] = [];
    const ayer: MappedTransaction[] = [];
    const anteriores: MappedTransaction[] = [];
    
    allTransactions.forEach((transaction: MappedTransaction) => {
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
          ) : !model ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm text-[#aaa]">Selecciona un modelo para ver las transacciones</span>
            </div>
          ) : (
            <>
              {/* Verificar si hay transacciones */}
              {groupedTransactions.hoy.length === 0 && 
               groupedTransactions.ayer.length === 0 && 
               groupedTransactions.anteriores.length === 0 ? (
                <div className="flex items-center justify-center h-full py-8">
                  <span className="text-sm text-[#aaa]">No hay transacciones recientes</span>
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
                          cryptocurrency={transaction.cryptocurrency}
                          localCurrency={transaction.localCurrency}
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
                          cryptocurrency={transaction.cryptocurrency}
                          localCurrency={transaction.localCurrency}
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
                          cryptocurrency={transaction.cryptocurrency}
                          localCurrency={transaction.localCurrency}
                        />
                      ))}
                    </div>
                  )}

                  {/* Botón cargar más / Spinner de carga */}
                  {hasNextPage && (
                    <div className="flex items-center justify-center py-4">
                      {isFetchingNextPage ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="size-4 text-[#FFF000]" />
                          <span className="text-sm text-[#aaa]">Cargando más transacciones...</span>
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
            </>
          )}
          </div>
        </ScrollArea>
      </div>
    </FoldedCard>
  );
};

export default TransaccionesRecientesCard;

