import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import CommissionsListCard from '../components/organisms/CommissionsListCard';
import NetworkTabs from '../components/molecules/NetworkTabs';
import SidebarDivider from '../components/atoms/SidebarDivider';
import { SingleButtonNoClipPath } from '../components/atoms/SingleButtonNoClipPath';
import EnterpriseInfoCardSmall from '../components/atoms/EnterpriseInfoCardSmall';
import SuperiorClaimCard from '../components/atoms/SuperiorClaimCard';
import NetworkPaginationBar from '../components/organisms/NetworkPaginationBar';
import { getAvailableMlmModels, requestAllClaims, getTotalToClaimInUSDT } from '@/services/network';
import { getMisTarjetas } from '@/services/cards';
import { formatCurrencyWithThreeDecimals } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { LottieLoader } from '@/components/ui/lottie-loader';
import ErrorModal from '@/components/atoms/ErrorModal';
import ClaimSuccessModal from '@/components/molecules/ClaimSuccessModal';
import NoCardsModal from '@/components/molecules/NoCardsModal';
import ClaimAllScreen from '@/components/organisms/ClaimAllScreen';
import { useMinimumLoading } from '../hooks/useMinimumLoading';

type CommissionTabId = 'b2c' | 'b2b' | 'b2t';

const Commissions: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Usar la misma query de React Query que CommissionsListCard para evitar duplicados
  const { data: availableModelsData, isLoading: isLoadingModels } = useQuery({
    queryKey: ['availableMlmModels'],
    queryFn: getAvailableMlmModels,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const [activeTab, setActiveTab] = useState<CommissionTabId | null>(null);
  const [tabAvailability, setTabAvailability] = useState<Record<CommissionTabId, boolean>>({
    b2c: false,
    b2b: false,
    b2t: false,
  });
  const [hasSetInitialTab, setHasSetInitialTab] = useState(false);
  const [isChangingTab, setIsChangingTab] = useState(false);
  const [summary, setSummary] = useState<{
    totalCommissions: number;
    gainsFromRecharges: number;
    gainsFromCards: number;
    totalCommissionsPercentageChange?: number;
    gainsFromRechargesPercentageChange?: number;
    gainsFromCardsPercentageChange?: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginationData, setPaginationData] = useState<{ totalItems: number; totalPages: number } | null>(null);
  const [isRequestingClaims, setIsRequestingClaims] = useState(false);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);
  const [showClaimAllScreen, setShowClaimAllScreen] = useState(false);
  const [totalToClaimData, setTotalToClaimData] = useState<{
    totalInUSDT: number;
    mlmTransactionsTotal: number;
    b2cCommissionsTotalMXN: number;
    b2cCommissionsTotalUSDT: number;
    mlmTransactionsCount: number;
    b2cCommissionsCount: number;
    exchangeRateMXNToUSDT: number;
    userEmail?: string;
  } | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [claimType, setClaimType] = useState<'mlm_transactions' | 'b2c_commissions' | undefined>(undefined);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [noCardsModalOpen, setNoCardsModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Establecer tabs disponibles cuando se carguen los datos
  useEffect(() => {
    if (availableModelsData && !hasSetInitialTab) {
      setTabAvailability({
        b2c: availableModelsData.show_b2c_tab,
        b2b: availableModelsData.show_b2b_tab,
        b2t: availableModelsData.show_b2t_tab,
      });

      // Establecer el tab activo inicial solo una vez cuando se cargan los datos
      if (availableModelsData.show_b2c_tab) {
        setActiveTab('b2c');
      } else if (availableModelsData.show_b2b_tab) {
        setActiveTab('b2b');
      } else if (availableModelsData.show_b2t_tab) {
        setActiveTab('b2t');
      }
      setHasSetInitialTab(true);
    }
  }, [availableModelsData, hasSetInitialTab]);

  // Resetear página cuando cambie el tab activo
  useEffect(() => {
    if (activeTab) {
      setCurrentPage(1);
      setPaginationData(null);
    }
  }, [activeTab]);

  // Detectar cuando cambia el tab para mostrar loader
  useEffect(() => {
    if (activeTab !== null) {
      setIsChangingTab(true);
      const timer = setTimeout(() => {
        setIsChangingTab(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const isLoading = isLoadingModels || isChangingTab || !hasSetInitialTab;
  const showLoader = useMinimumLoading(isLoading, 3000);

  const handleRequestAllClaims = async () => {
    setIsLoadingTotal(true);
    try {
      // Determinar el claimType según las reglas:
      // - Si usuario es B2C:
      //   - Tab B2C: claimType='mlm_transactions'
      //   - Tab B2B: claimType='b2c_commissions'
      // - Si usuario es B2B:
      //   - Solo tiene tab B2B: claimType='mlm_transactions'
      let claimType: 'mlm_transactions' | 'b2c_commissions' | undefined = undefined;
      
      if (availableModelsData) {
        const userModel = availableModelsData.my_model?.trim().toUpperCase();
        
        if (userModel === 'B2C') {
          // Usuario B2C
          if (activeTab === 'b2c') {
            claimType = 'mlm_transactions';
          } else if (activeTab === 'b2b') {
            claimType = 'b2c_commissions';
          }
        } else if (userModel === 'B2B') {
          // Usuario B2B solo tiene tab B2B, enviar mlm_transactions
          claimType = 'mlm_transactions';
        }
      }
      
      // Primero verificar que hay tarjetas disponibles
      const tarjetasResponse = await getMisTarjetas();
      const tarjetasActivas = tarjetasResponse.cards.filter(
        (card) => card.cardStatus === "ACTIVA"
      );
      
      // Si no hay tarjetas activas, obtener el email del usuario antes de mostrar el modal
      if (tarjetasActivas.length === 0) {
        try {
          // Obtener el email del usuario para el mensaje de WhatsApp (con claimType si está disponible)
          const response = await getTotalToClaimInUSDT(claimType);
          setUserEmail(response.data.userEmail);
        } catch (emailError) {
          // Si falla obtener el email, continuar sin él
          console.warn('No se pudo obtener el email del usuario:', emailError);
        }
        setNoCardsModalOpen(true);
        setIsLoadingTotal(false);
        return;
      }
      
      // Si hay tarjetas, obtener el total a reclamar en USDT (con claimType si está disponible)
      const response = await getTotalToClaimInUSDT(claimType);
      
      // Validar que el total no sea 0
      if (response.data.totalInUSDT === 0) {
        setErrorModalMessage('No puedes reclamar comisiones porque el total es 0. No hay comisiones disponibles para reclamar.');
        setErrorModalOpen(true);
        setIsLoadingTotal(false);
        return;
      }
      
      // Guardar los datos del total
      setTotalToClaimData(response.data);
      // Guardar el email del usuario para el mensaje de WhatsApp
      setUserEmail(response.data.userEmail);
      
      // Guardar el claimType para pasarlo a ClaimAllScreen
      setClaimType(claimType);
      
      // Mostrar la pantalla completa con el SVG
      setShowClaimAllScreen(true);
    } catch (error: any) {
      console.error('Error obteniendo total a reclamar:', error);
      const errorMessage = error?.message || 'Ocurrió un error al obtener el total a reclamar. Por favor, intenta nuevamente.';
      setErrorModalMessage(errorMessage);
      setErrorModalOpen(true);
    } finally {
      setIsLoadingTotal(false);
    }
  };

  const handleBackFromClaimAllScreen = () => {
    setShowClaimAllScreen(false);
  };

  const handleFinalContinue = async () => {
    // Cerrar la pantalla
    setShowClaimAllScreen(false);
    
    // Invalidar todas las queries relacionadas con comisiones para recargar los datos
    await queryClient.invalidateQueries({ queryKey: ['commissions'] });
    await queryClient.invalidateQueries({ queryKey: ['claims'] });
    await queryClient.invalidateQueries({ queryKey: ['availableMlmModels'] });
    
    // Recargar la página para asegurar que todos los datos se actualicen
    window.location.reload();
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pt-16 lg:pt-0 overflow-hidden">
        {/* Overlay con animación Lottie cuando está cargando */}
        {showLoader && (
          <div className="absolute inset-0 bg-[#2a2a2a] z-[9999] flex items-center justify-center">
            <LottieLoader className="w-32 h-32 lg:w-48 lg:h-48" />
          </div>
        )}
        {/* Área scrolleable con padding */}
        <div className="flex-1 min-h-0 overflow-y-auto pl-6 pr-6 pb-8" style={{ paddingBottom: '84px' }}>
          {/* Navbar responsivo */}
          <DashboardNavbar 
            title="Comisiones" 
          />

          {/* Tabs - Debajo del label Comisiones */}
          <div className="relative z-20 mt-4 mb-4">
            <div className="relative flex items-end justify-between pb-0">
              <div className="flex-1 min-w-0">
                <NetworkTabs
                  activeTab={activeTab || 'b2c'}
                  onTabChange={(tab) => {
                    if (tab === 'b2c' || tab === 'b2b' || tab === 'b2t') {
                      setActiveTab(tab);
                    }
                  }}
                  availableTabs={{
                    b2c: tabAvailability.b2c,
                    b2b: tabAvailability.b2b,
                    b2t: tabAvailability.b2t,
                  }}
                  tabHeight={55}
                />
              </div>
              {/* Botón Solicitar ganancias - Alineado a la derecha y justo sobre la línea */}
              <div className="absolute bottom-0 right-0" style={{ marginBottom: '-1px' }}>
                <SingleButtonNoClipPath
                  size="default"
                  className="rounded-xl font-urbanist-medium h-[42px] px-4 text-base leading-[20px]"
                  onClick={handleRequestAllClaims}
                  disabled={isRequestingClaims || isLoadingTotal}
                >
                  {isRequestingClaims || isLoadingTotal ? (
                    <>
                      <Spinner className="size-4 text-black" />
                      <span>{isLoadingTotal ? 'Cargando...' : 'Solicitando...'}</span>
                    </>
                  ) : (
                    'Solicitar ganancias'
                  )}
                </SingleButtonNoClipPath>
              </div>
              {/* Línea divisoria pegada al bottom del div de las tabs */}
              <div className="absolute bottom-0 left-0 right-0">
                <div 
                  className="w-full h-[1px]"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                />
              </div>
            </div>
          </div>

          {/* 3 Cards de comisiones - Debajo de la línea con 15px de separación */}
          <div className="relative z-20 mt-[15px] mb-6 flex flex-col md:flex-row gap-3">
            {(() => {
              // Función para contar dígitos en un número
              const countDigits = (num: number): number => {
                return Math.floor(num).toString().replace(/\./g, '').length;
              };
              
              // Calcular si alguna de las 3 cards tiene más de 6 cifras
              const totalCommissions = summary && typeof summary.totalCommissions === 'number' ? summary.totalCommissions : 0;
              const gainsFromRecharges = summary && typeof summary.gainsFromRecharges === 'number' ? summary.gainsFromRecharges : 0;
              const gainsFromCards = summary && typeof summary.gainsFromCards === 'number' ? summary.gainsFromCards : 0;
              
              const hasMoreThan6Digits = 
                countDigits(totalCommissions) > 6 || 
                countDigits(gainsFromRecharges) > 6 || 
                countDigits(gainsFromCards) > 6;
              
              // Forzar tamaño pequeño si alguna tiene más de 6 cifras
              const forceSmallFont = hasMoreThan6Digits;
              
              return (
                <>
                  <div className="w-full md:flex-1 min-w-0">
                    <SuperiorClaimCard
                      primaryText={summary && typeof summary.totalCommissions === 'number' ? `USDT ${formatCurrencyWithThreeDecimals(summary.totalCommissions)}` : 'USDT 0'}
                      secondaryText="Comisiones totales"
                      height={129}
                      className="w-full"
                      percentageChange={summary?.totalCommissionsPercentageChange}
                      forceSmallFont={forceSmallFont}
                    />
                  </div>
                  <div className="w-full md:flex-1 min-w-0">
                    <SuperiorClaimCard
                      primaryText={summary && typeof summary.gainsFromRecharges === 'number' ? `USDT ${formatCurrencyWithThreeDecimals(summary.gainsFromRecharges)}` : 'USDT 0'}
                      secondaryText="Comisiones por recargas"
                      height={129}
                      className="w-full"
                      percentageChange={summary?.gainsFromRechargesPercentageChange}
                      forceSmallFont={forceSmallFont}
                    />
                  </div>
                  <div className="w-full md:flex-1 min-w-0">
                    <SuperiorClaimCard
                      primaryText={summary && typeof summary.gainsFromCards === 'number' ? `USDT ${formatCurrencyWithThreeDecimals(summary.gainsFromCards)}` : 'USDT 0'}
                      secondaryText="Comisiones por venta de tarjetas"
                      height={129}
                      className="w-full"
                      percentageChange={summary?.gainsFromCardsPercentageChange}
                      forceSmallFont={forceSmallFont}
                    />
                  </div>
                </>
              );
            })()}
          </div>

          {/* Contenido de Comisiones */}
          {activeTab && (
            <div className="relative z-20 mt-6">
              <CommissionsListCard 
                activeTab={activeTab} 
                currentPage={currentPage}
                pageSize={pageSize}
                onSummaryChange={setSummary}
                onPaginationChange={setPaginationData}
              />
            </div>
          )}
        </div>

        {/* Div de paginación al fondo - 84px de altura, fijo, pegado al sidebar */}
        {activeTab && (
          <div className="absolute bottom-0 left-0 right-0 z-30 h-[84px] bg-[#212020] flex items-center justify-center">
            <div className="w-full px-6">
              <NetworkPaginationBar
                totalItems={paginationData?.totalItems || 0}
                currentPage={currentPage}
                usersLimit={pageSize}
                onChangePage={(page) => setCurrentPage(page)}
                onChangeLimit={(limit) => {
                  setPageSize(limit);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}

        {/* SVG de esquina en inferior derecha */}
        <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden z-0">
          <Ki6SvgIcon
            width={2850.92}
            height={940.08}
            rotation={0}
            className="w-[80vw] sm:w-[60vw] lg:w-[50vw] h-auto border-0 outline-none"
          />
        </div>
      </div>

      {/* Modal de no tarjetas */}
      <NoCardsModal
        open={noCardsModalOpen}
        onOpenChange={setNoCardsModalOpen}
        onRequestCard={() => {
          // Aquí puedes agregar la lógica para redirigir a la página de solicitud de tarjeta
          console.log('Solicitar tarjeta');
        }}
        userEmail={userEmail}
      />

      {/* Modal de error */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Error"
        message={errorModalMessage}
      />

      {/* Modal de éxito */}
      <ClaimSuccessModal
        open={successModalOpen}
        onOpenChange={(open) => {
          setSuccessModalOpen(open);
          if (!open) {
            setSuccessMessage('');
          }
        }}
        message={successMessage}
        showSubtext={true}
      />

      {/* Pantalla completa de Claim All */}
      {showClaimAllScreen && (
        <ClaimAllScreen 
          onBack={handleBackFromClaimAllScreen}
          totalInUSDT={totalToClaimData?.totalInUSDT || 0}
          onError={(message: string) => {
            setErrorModalMessage(message);
            setErrorModalOpen(true);
          }}
          onFinalContinue={handleFinalContinue}
          claimType={claimType}
        />
      )}
    </div>
  );
};

export default Commissions;

