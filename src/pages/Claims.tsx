import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import { LottieLoader } from '@/components/ui/lottie-loader';
import ClaimsListCard from '../components/organisms/ClaimsListCard';
import EnterpriseInfoCardSmall from '../components/atoms/EnterpriseInfoCardSmall';
import SuperiorClaimCard from '../components/atoms/SuperiorClaimCard';
import MiniBaner from '../components/atoms/MiniBaner';
import NetworkTabs from '../components/molecules/NetworkTabs';
import { getAvailableMlmModels, getOrders } from '@/services/network';
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import { formatCurrencyWithThreeDecimals } from '@/lib/utils';

type ClaimTabId = 'b2c' | 'b2b' | 'b2t';

const Claims: React.FC = () => {
  const { t, i18n } = useTranslation(['claims', 'navigation']);
  // staleTime Infinity ya que los datos se guardan en localStorage y solo cambian al login/logout
  // La función getAvailableMlmModels ya maneja su propio cache en localStorage
  const { data: availableModelsData, isLoading: isLoadingModels } = useQuery({
    queryKey: ['availableMlmModels'],
    queryFn: () => getAvailableMlmModels(), // Envolver para compatibilidad con React Query
    staleTime: Infinity, // Los datos solo cambian en login/logout, así que nunca se consideran stale
  });

  const [activeTab, setActiveTab] = useState<ClaimTabId | null>(null);
  const [tabAvailability, setTabAvailability] = useState<Record<ClaimTabId, boolean>>({
    b2c: false,
    b2b: false,
    b2t: false,
  });
  const [hasSetInitialTab, setHasSetInitialTab] = useState(false);
  const [isChangingTab, setIsChangingTab] = useState(false);
  const [pageSize, setPageSize] = useState(50); // Inicializar con 50 para mantener consistencia con Network

  // Obtener el summary calculado desde las órdenes con status pending y paid en una sola petición
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['ordersSummary', activeTab],
    queryFn: async () => {
      // Convertir activeTab a claimType (b2c -> B2C, b2b -> B2B, b2t -> B2T)
      const claimType = activeTab ? (activeTab.toUpperCase() as 'B2C' | 'B2B') : undefined;
      
      // Obtener órdenes pendientes y pagadas en una sola petición para calcular ambos totales
      const allOrders = await getOrders({ 
        page: 1, 
        pageSize: 100, // Obtener más órdenes para calcular los totales
        status: ['pending', 'paid'],
        claimType
      });
      
      // Separar órdenes pendientes y pagadas
      const pendingOrders = allOrders.data.items.filter(order => order.status === 'pending');
      const paidOrders = allOrders.data.items.filter(order => order.status === 'paid');
      
      // Calcular totalGananciasPorReclamar sumando los totalAmount de órdenes pendientes
      const totalGananciasPorReclamar = pendingOrders.reduce(
        (sum, order) => sum + order.totalAmount, 
        0
      );
      
      // Filtrar órdenes pagadas del último mes y sumar
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const claimedUltimoMes = paidOrders
        .filter(order => {
          const paidAt = order.paidAt ? new Date(order.paidAt) : null;
          return paidAt && paidAt >= lastMonth;
        })
        .reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        totalGananciasPorReclamar,
        claimedUltimoMes,
      };
    },
    enabled: activeTab !== null, // Solo ejecutar cuando hay un tab activo
    staleTime: 1 * 60 * 1000, // Cache por 1 minuto
  });

  useEffect(() => {
    if (availableModelsData && !hasSetInitialTab) {
      setTabAvailability({
        b2c: availableModelsData.show_b2c_tab,
        b2b: availableModelsData.show_b2b_tab,
        b2t: availableModelsData.show_b2t_tab,
      });

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

  const isLoading = isLoadingModels || isLoadingSummary || isChangingTab || !hasSetInitialTab;
  const showLoader = useMinimumLoading(isLoading, 3000);

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-8 pt-16 lg:pt-0">
        {/* Overlay con animación Lottie cuando está cargando */}
        {showLoader && (
          <div className="fixed inset-0 bg-[#2a2a2a] z-[9999] flex items-center justify-center">
            <LottieLoader className="w-32 h-32 lg:w-48 lg:h-48" />
          </div>
        )}
        {/* Navbar responsivo */}
        <DashboardNavbar title={t('claims:title')} />

        {/* 2 Cards mini */}
        <div className="relative z-20 mt-6 mb-6 flex flex-col md:flex-row gap-3 max-w-full">
          {/* Primera card - Amarilla con totalGananciasPorReclamar */}
          <div className="w-full md:flex-1 min-w-0">
            <SuperiorClaimCard
              primaryText={summaryData && typeof summaryData.totalGananciasPorReclamar === 'number' ? `USDT ${formatCurrencyWithThreeDecimals(summaryData.totalGananciasPorReclamar)}` : 'USDT 0'}
              secondaryText={t('claims:cards.earningsToClaim')}
              height={129}
              className="w-full"
              backgroundColor="#FFF100"
              gradientColor="#FFF100"
              secondaryTextColor="black"
            />
          </div>
          
          {/* Segunda card - Claimed último mes */}
          <div className="w-full md:flex-1 min-w-0">
            <SuperiorClaimCard
              primaryText={summaryData && typeof summaryData.claimedUltimoMes === 'number' ? `USDT ${formatCurrencyWithThreeDecimals(summaryData.claimedUltimoMes)}` : 'USDT 0'}
              secondaryText={t('claims:cards.claimedLastMonth')}
              height={129}
              className="w-full"
              secondaryTextColor="white"
            />
          </div>
        </div>

        {/* Tabs de modelos disponibles */}
        <div className="relative z-20 mb-4">
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

        {/* Contenido de Claims */}
        <div className="relative z-20 mt-6 mb-8">
          <ClaimsListCard activeTab={activeTab} pageSize={pageSize} />
        </div>

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
    </div>
  );
};

export default Claims;

