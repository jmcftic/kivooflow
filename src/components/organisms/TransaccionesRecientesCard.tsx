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

// Función para censurar el correo electrónico
const censorEmail = (email: string): string => {
  if (!email || !email.includes('@')) {
    return email || 'N/A';
  }
  
  const [localPart, domain] = email.split('@');
  
  // Si el nombre de usuario tiene más de 2 caracteres, mostrar solo los primeros 2 y censurar el resto
  if (localPart.length > 2) {
    const visibleChars = localPart.substring(0, 2);
    const censoredChars = '*'.repeat(Math.min(localPart.length - 2, 4)); // Máximo 4 asteriscos
    return `${visibleChars}${censoredChars}@${domain}`;
  } else if (localPart.length === 2) {
    // Si tiene exactamente 2 caracteres, mostrar solo el primero
    return `${localPart[0]}*@${domain}`;
  } else {
    // Si tiene 1 carácter, mostrar asterisco
    return `*@${domain}`;
  }
};

const mapTransaction = (tx: RecentTransaction, userModel?: string | null, selectedModel?: string | null): MappedTransaction => {
  // Ocultar concepto de comisiones si el usuario es B2C viendo la pestaña B2B
  const isB2CViewingB2B = userModel?.toLowerCase() === 'b2c' && selectedModel?.toLowerCase() === 'b2b';
  const shouldHideCommission = isB2CViewingB2B && tx.cryptocurrency?.toUpperCase() === 'COMMISSION';
  const cryptocurrency = shouldHideCommission ? '' : tx.cryptocurrency;
  
  // Para B2C viendo B2B, si es una comisión (COMMISSION), usar userName en lugar de email censurado
  // porque las empresas no tienen email (viene como 'N/A')
  let empresa: string;
  if (isB2CViewingB2B && tx.cryptocurrency?.toUpperCase() === 'COMMISSION') {
    // Para comisiones, usar el nombre de la empresa (userName)
    empresa = tx.userName || 'Empresa';
  } else {
    // Para recargas normales, usar correo censurado
    empresa = censorEmail(tx.userEmail || '');
  }
  
  // Para B2C viendo B2B con comisiones:
  // - cryptoAmount es 0 (no aplica)
  // - localAmount es el monto de la comisión en USDT
  // - localCurrency es 'USDT'
  // Mostrar localAmount en montoUSDT cuando es comisión (porque está en USDT)
  const montoUSDT = isB2CViewingB2B && tx.cryptocurrency?.toUpperCase() === 'COMMISSION' 
    ? tx.localAmount  // Para comisiones, usar localAmount (está en USDT)
    : tx.cryptoAmount; // Para recargas, usar cryptoAmount
  
  const montoCOP = tx.localAmount; // Monto en moneda local (USDT para comisiones, MXN/COP para recargas)
  
  return {
    id: tx.id,
    fecha: tx.createdAt,
    empresa: empresa,
    montoUSDT: montoUSDT,
    montoCOP: montoCOP,
    tipo: "ingreso", // Las recargas y comisiones siempre son ingresos
    cryptocurrency: cryptocurrency,
    localCurrency: tx.localCurrency,
  };
};

// Función para obtener transacciones de la API con paginación
const fetchTransacciones = async ({ 
  pageParam = 1, 
  model,
  userModel
}: { 
  pageParam: number;
  model: string;
  userModel?: string | null;
}): Promise<{ data: MappedTransaction[], nextPage: number | null, totalPages: number }> => {
  const pageSize = 5;
  const response = await getRecentTransactions(model, pageParam, pageSize);
  
  const mappedData = response.transactions.map(tx => mapTransaction(tx, userModel, model));
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
  // Obtener el modelo del usuario desde localStorage
  const getUserModel = (): string | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData?.mlmModel || userData?.mlm_model || userData?.networkModel || userData?.network_model || null;
      }
    } catch (error) {
      console.error('Error obteniendo modelo del usuario:', error);
    }
    return null;
  };

  const userModel = getUserModel();

  // Mapear transacciones iniciales
  const initialMapped = useMemo(() => {
    return initialTransactions.map(tx => mapTransaction(tx, userModel, model));
  }, [initialTransactions, userModel, model]);

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
      return fetchTransacciones({ pageParam: pageParam as number, model, userModel });
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

