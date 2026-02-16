import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
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
import { useClaimAllPollingContext } from '@/contexts/ClaimAllPollingContext';
import { getMisTarjetas } from '@/services/cards';
import { formatCurrencyWithThreeDecimals } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { LottieLoader } from '@/components/ui/lottie-loader';
import ErrorModal from '@/components/atoms/ErrorModal';
import ClaimSuccessModal from '@/components/molecules/ClaimSuccessModal';
import NoCardsModal from '@/components/molecules/NoCardsModal';
import NoClaimsModal from '@/components/molecules/NoClaimsModal';
import NoDefaultCardModal from '@/components/molecules/NoDefaultCardModal';
import InsufficientAmountModal from '@/components/molecules/InsufficientAmountModal';
import ClaimAllInProgressModal from '@/components/molecules/ClaimAllInProgressModal';
import ClaimAllScreen from '@/components/organisms/ClaimAllScreen';
import { useMinimumLoading } from '../hooks/useMinimumLoading';

type CommissionTabId = 'b2c' | 'b2b' | 'b2t';

// Opciones válidas para pageSize (deben coincidir con NetworkPaginationBar)
const ALLOWED_PAGE_SIZES = [50, 100] as const;
const DEFAULT_PAGE_SIZE = 50;

const Commissions: React.FC = () => {
  const { t } = useTranslation(['commissions', 'common']);
  const queryClient = useQueryClient();
  const { startPolling, claimAllInProgress } = useClaimAllPollingContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Usar la misma query de React Query que CommissionsListCard para evitar duplicados
  // staleTime Infinity ya que los datos se guardan en localStorage y solo cambian al login/logout
  // La función getAvailableMlmModels ya maneja su propio cache en localStorage
  const { data: availableModelsData, isLoading: isLoadingModels } = useQuery({
    queryKey: ['availableMlmModels'],
    queryFn: () => getAvailableMlmModels(), // Envolver para compatibilidad con React Query
    staleTime: Infinity, // Los datos solo cambian en login/logout, así que nunca se consideran stale
  });

  // Leer parámetros de la URL al inicializar y validar pageSize
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlPageSizeRaw = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);
  // Validar que el pageSize esté en las opciones permitidas, si no, usar el valor por defecto
  const urlPageSize = ALLOWED_PAGE_SIZES.includes(urlPageSizeRaw as typeof ALLOWED_PAGE_SIZES[number])
    ? urlPageSizeRaw
    : DEFAULT_PAGE_SIZE;
  const urlStatus = searchParams.get('status') || 'available';
  const urlClaimType = searchParams.get('claimType') as 'B2C' | 'B2B' | 'B2T' | null;

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
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [pageSize, setPageSize] = useState(urlPageSize);
  const [paginationData, setPaginationData] = useState<{ totalItems: number; totalPages: number }>({ totalItems: 0, totalPages: 0 });
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
  const [noClaimableModalOpen, setNoClaimableModalOpen] = useState(false);
  const [noDefaultCardModalOpen, setNoDefaultCardModalOpen] = useState(false);
  const [insufficientAmountModalOpen, setInsufficientAmountModalOpen] = useState(false);
  const [insufficientAmountMessage, setInsufficientAmountMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [claimAllInProgressModalOpen, setClaimAllInProgressModalOpen] = useState(false);

  // Referencia para evitar loops infinitos entre URL y estado
  const isUpdatingFromStateRef = useRef(false);
  const hasInitializedRef = useRef(false);

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

  // Inicializar desde URL solo una vez al montar el componente
  useEffect(() => {
    if (hasInitializedRef.current) return;

    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlPageSizeRaw = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);
    const urlPageSize = ALLOWED_PAGE_SIZES.includes(urlPageSizeRaw as typeof ALLOWED_PAGE_SIZES[number])
      ? urlPageSizeRaw
      : DEFAULT_PAGE_SIZE;

    // Actualizar el estado con los valores de la URL
    setCurrentPage(urlPage);
    setPageSize(urlPageSize);

    // Si el pageSize de la URL es inválido, corregir la URL
    if (!ALLOWED_PAGE_SIZES.includes(urlPageSizeRaw as typeof ALLOWED_PAGE_SIZES[number])) {
      isUpdatingFromStateRef.current = true;
      const newSearchParams = new URLSearchParams(window.location.search);
      newSearchParams.set('page', urlPage.toString());
      newSearchParams.set('pageSize', String(DEFAULT_PAGE_SIZE));
      newSearchParams.set('status', 'available');
      if (activeTab) {
        const claimTypeMap: Record<CommissionTabId, string> = {
          b2c: 'B2C',
          b2b: 'B2B',
          b2t: 'B2T',
        };
        newSearchParams.set('claimType', claimTypeMap[activeTab]);
      }
      setSearchParams(newSearchParams, { replace: true });
    }

    hasInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // Actualizar URL cuando cambien currentPage o pageSize (solo cuando el usuario cambia el estado)
  useEffect(() => {
    // No hacer nada si aún no se ha inicializado
    if (!hasInitializedRef.current) {
      return;
    }

    // Si estamos actualizando desde el estado, resetear el flag y salir
    if (isUpdatingFromStateRef.current) {
      isUpdatingFromStateRef.current = false;
      return;
    }

    // Crear nuevos searchParams desde la URL actual
    const currentSearchParams = new URLSearchParams(window.location.search);
    const currentUrlPage = parseInt(currentSearchParams.get('page') || '1', 10);
    const currentUrlPageSizeRaw = parseInt(currentSearchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);
    const currentUrlPageSize = ALLOWED_PAGE_SIZES.includes(currentUrlPageSizeRaw as typeof ALLOWED_PAGE_SIZES[number])
      ? currentUrlPageSizeRaw
      : DEFAULT_PAGE_SIZE;

    // Solo actualizar si hay diferencia entre estado y URL
    if (currentPage !== currentUrlPage || pageSize !== currentUrlPageSize) {
      isUpdatingFromStateRef.current = true;
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('page', currentPage.toString());
      newSearchParams.set('pageSize', pageSize.toString());
      newSearchParams.set('status', 'available');

      // Agregar claimType según el tab activo
      if (activeTab) {
        const claimTypeMap: Record<CommissionTabId, string> = {
          b2c: 'B2C',
          b2b: 'B2B',
          b2t: 'B2T',
        };
        newSearchParams.set('claimType', claimTypeMap[activeTab]);
      }

      setSearchParams(newSearchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, activeTab]); // Solo depender del estado, no de setSearchParams

  // Resetear página cuando cambie el tab activo
  useEffect(() => {
    if (activeTab) {
      setCurrentPage(1);
      // Resetear paginación a valores por defecto en lugar de null
      // para evitar que NetworkPaginationBar calcule incorrectamente totalPages
      setPaginationData({ totalItems: 0, totalPages: 0 });
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
      const tarjetas = tarjetasResponse.cards || [];

      const tarjetasActivas = tarjetas.filter(
        (card) => card.cardStatus === "ACTIVA"
      );

      // 1. Existencia de Tarjetas: Debe tener al menos una tarjeta registrada.
      if (tarjetas.length === 0) {
        setNoCardsModalOpen(true);
        setIsLoadingTotal(false);
        return;
      }

      // 2. Tarjeta Predeterminada: Debe tener una tarjeta marcada como favorita/default.
      const hasDefaultCard = tarjetas.some(card => card.isDefault);
      if (!hasDefaultCard) {
        setNoDefaultCardModalOpen(true);
        setIsLoadingTotal(false);
        return;
      }

      // Si no hay tarjetas activas (pero hay registradas), mostrar el modal de soporte
      if (tarjetasActivas.length === 0) {
        try {
          // Obtener el email del usuario para el mensaje de WhatsApp
          const response = await getTotalToClaimInUSDT(claimType);
          setUserEmail(response.data.userEmail);
        } catch (emailError) {
          console.warn('No se pudo obtener el email del usuario:', emailError);
        }
        setNoCardsModalOpen(true);
        setIsLoadingTotal(false);
        return;
      }

      // 3. Monto Mínimo: La suma total debe ser >= 1 USDT.
      const response = await getTotalToClaimInUSDT(claimType);

      // Validar monto mínimo de 1 USDT
      if (response.data.totalInUSDT < 1) {
        setInsufficientAmountModalOpen(true);
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
      const errorMessage = error?.message || error?.response?.data?.message || 'Ocurrió un error al obtener el total a reclamar. Por favor, intenta nuevamente.';
      const messageLower = errorMessage.toLowerCase();

      // Verificar si el error es porque el monto es insuficiente o no hay comisiones
      if (
        messageLower.includes('total es 0') ||
        messageLower.includes('no hay comisiones disponibles') ||
        messageLower.includes('no puedes reclamar comisiones porque el total es 0') ||
        messageLower.includes('monto mínimo') ||
        messageLower.includes('1 usdt')
      ) {
        // Si el mensaje es específicamente sobre el monto mínimo de 1 USDT
        if (messageLower.includes('monto mínimo') || messageLower.includes('1 usdt')) {
          setInsufficientAmountMessage(errorMessage);
          setInsufficientAmountModalOpen(true);
        } else {
          setNoClaimableModalOpen(true);
        }
      } else {
        setErrorModalMessage(errorMessage);
        setErrorModalOpen(true);
      }
    } finally {
      setIsLoadingTotal(false);
    }
  };

  const handleBackFromClaimAllScreen = () => {
    setShowClaimAllScreen(false);
  };

  const handleClaimAllStarted = () => {
    // Iniciar polling de notificaciones cuando la solicitud tarda más de 1 segundo
    startPolling();
    // El modal se mostrará cuando el usuario salga de la pantalla final
  };

  const handleFinalContinue = (shouldShowModal: boolean) => {
    // Mostrar el modal solo si el polling aún está activo (no se ha recibido respuesta)
    if (shouldShowModal) {
      setClaimAllInProgressModalOpen(true);
    }
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
            title={t('commissions:title')}
            rightAction={
              /* Botón visible solo en móviles/tablets pequeños junto al título, en desktop se muestra junto a las tabs */
              <div className="lg:hidden">
                <SingleButtonNoClipPath
                  size="default"
                  className="rounded-xl font-urbanist-medium h-[42px] px-4 text-base leading-[20px]"
                  onClick={handleRequestAllClaims}
                  disabled={isRequestingClaims || isLoadingTotal}
                >
                  {isRequestingClaims || isLoadingTotal ? (
                    <>
                      <Spinner className="size-4 text-black" />
                      <span>{isLoadingTotal ? t('commissions:button.loading') : t('commissions:button.requesting')}</span>
                    </>
                  ) : (
                    t('commissions:button.requestEarnings')
                  )}
                </SingleButtonNoClipPath>
              </div>
            }
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
              {/* Botón Solicitar ganancias - Solo visible en desktop, alineado a la derecha y justo sobre la línea */}
              <div className="hidden lg:block absolute bottom-0 right-0" style={{ marginBottom: '-1px' }}>
                <SingleButtonNoClipPath
                  size="default"
                  className="rounded-xl font-urbanist-medium h-[42px] px-4 text-base leading-[20px]"
                  onClick={handleRequestAllClaims}
                  disabled={isRequestingClaims || isLoadingTotal}
                >
                  {isRequestingClaims || isLoadingTotal ? (
                    <>
                      <Spinner className="size-4 text-black" />
                      <span>{isLoadingTotal ? t('commissions:button.loading') : t('commissions:button.requesting')}</span>
                    </>
                  ) : (
                    t('commissions:button.requestEarnings')
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
                      secondaryText={t('commissions:cards.totalCommissions')}
                      height={129}
                      className="w-full"
                      percentageChange={summary?.totalCommissionsPercentageChange}
                      forceSmallFont={forceSmallFont}
                    />
                  </div>
                  <div className="w-full md:flex-1 min-w-0">
                    <SuperiorClaimCard
                      primaryText={summary && typeof summary.gainsFromRecharges === 'number' ? `USDT ${formatCurrencyWithThreeDecimals(summary.gainsFromRecharges)}` : 'USDT 0'}
                      secondaryText={t('commissions:cards.commissionsFromRecharges')}
                      height={129}
                      className="w-full"
                      percentageChange={summary?.gainsFromRechargesPercentageChange}
                      forceSmallFont={forceSmallFont}
                    />
                  </div>
                  <div className="w-full md:flex-1 min-w-0">
                    <SuperiorClaimCard
                      primaryText={summary && typeof summary.gainsFromCards === 'number' ? `USDT ${formatCurrencyWithThreeDecimals(summary.gainsFromCards)}` : 'USDT 0'}
                      secondaryText={t('commissions:cards.commissionsFromCardSales')}
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
                totalPages={paginationData?.totalPages}
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

      {/* Modal de no hay nada por reclamar */}
      <NoClaimsModal
        open={noClaimableModalOpen}
        onOpenChange={setNoClaimableModalOpen}
      />

      {/* Modal de no hay tarjeta predeterminada */}
      <NoDefaultCardModal
        open={noDefaultCardModalOpen}
        onOpenChange={setNoDefaultCardModalOpen}
      />

      {/* Modal de monto insuficiente */}
      <InsufficientAmountModal
        open={insufficientAmountModalOpen}
        onOpenChange={(open) => {
          setInsufficientAmountModalOpen(open);
          if (!open) setInsufficientAmountMessage('');
        }}
        message={insufficientAmountMessage}
      />

      {/* Modal de error */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
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

      {/* Modal de claim all en progreso */}
      <ClaimAllInProgressModal
        open={claimAllInProgressModalOpen}
        onOpenChange={setClaimAllInProgressModalOpen}
      />

      {/* Pantalla completa de Claim All */}
      {showClaimAllScreen && (
        <ClaimAllScreen
          onBack={handleBackFromClaimAllScreen}
          totalInUSDT={totalToClaimData?.totalInUSDT || 0}
          onError={(message: string) => {
            const messageLower = message.toLowerCase();
            // Verificar si el error es porque el total es 0 o no hay comisiones disponibles
            if (
              messageLower.includes('total es 0') ||
              messageLower.includes('no hay comisiones disponibles') ||
              messageLower.includes('no puedes reclamar comisiones porque el total es 0')
            ) {
              setShowClaimAllScreen(false);
              setNoClaimableModalOpen(true);
            } else {
              setErrorModalMessage(message);
              setErrorModalOpen(true);
            }
          }}
          onRequestStarted={handleClaimAllStarted}
          onFinalContinue={handleFinalContinue}
          claimType={claimType}
          isPollingActive={claimAllInProgress}
        />
      )}
    </div>
  );
};

export default Commissions;

