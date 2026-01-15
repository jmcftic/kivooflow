import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import { getOrderClaims, getAvailableMlmModels } from '@/services/network';
import { OrderClaimItem } from '@/types/network';
import { formatCurrencyWithThreeDecimals } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import InfoBanner from '../components/atoms/InfoBanner';
import { Badge } from '@/components/ui/badge';
import BackButtonPath from '../components/atoms/BackButtonPath';
import NetworkTabs from '../components/molecules/NetworkTabs';
import OrderClaimDetailModal from '../components/molecules/OrderClaimDetailModal';

const ClaimDetail: React.FC = () => {
  const { t, i18n } = useTranslation(['claims', 'commissions', 'common']);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [claimType, setClaimType] = useState<'B2C' | 'B2B' | null>(null);
  const [userModel, setUserModel] = useState<'B2C' | 'B2B' | 'B2T' | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<OrderClaimItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Obtener el modelo del usuario
  // staleTime Infinity ya que los datos se guardan en localStorage y solo cambian al login/logout
  // La función getAvailableMlmModels ya maneja su propio cache en localStorage
  const { data: availableModelsData } = useQuery({
    queryKey: ['availableMlmModels'],
    queryFn: () => getAvailableMlmModels(), // Envolver para compatibilidad con React Query
    staleTime: Infinity, // Los datos solo cambian en login/logout, así que nunca se consideran stale
  });

  useEffect(() => {
    if (availableModelsData?.my_model) {
      const normalizedModel = availableModelsData.my_model.trim().toUpperCase();
      if (normalizedModel === 'B2C' || normalizedModel === 'B2B' || normalizedModel === 'B2T') {
        setUserModel(normalizedModel);
      }
    }
  }, [availableModelsData]);

  // Cargar orderId desde localStorage al montar
  useEffect(() => {
    const savedOrderId = localStorage.getItem('claimDetailOrderId');
    const savedClaimType = localStorage.getItem('claimDetailClaimType');
    
    if (savedOrderId) {
      setOrderId(parseInt(savedOrderId, 10));
    } else {
      // Si no hay orderId, redirigir a claims
      navigate('/claims');
      return;
    }

    if (savedClaimType && (savedClaimType === 'B2C' || savedClaimType === 'B2B')) {
      setClaimType(savedClaimType);
    }
  }, [navigate]);

  // Obtener claims de la orden
  const { data: orderClaimsData, isLoading, isError } = useQuery({
    queryKey: ['orderClaims', orderId, claimType],
    queryFn: async () => {
      if (!orderId) return null;
      return await getOrderClaims({
        orderId,
        claimType: claimType || undefined,
      });
    },
    enabled: orderId !== null,
    staleTime: 1 * 60 * 1000,
  });

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      // Usar locale según el idioma
      const locale = i18n.language === 'en' ? 'en-US' : 'es-MX';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const formatted = formatCurrencyWithThreeDecimals(amount);
    const symbol = currency === 'USDT' ? 'USDT' : '$';
    return `${symbol} ${formatted}`;
  };

  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'claimed':
      case 'paid':
        return 'bg-[#32d74b]/20 text-[#32d74b] border-[#32d74b]/30';
      case 'requested':
        return 'bg-[#FFF100]/20 text-[#FFF100] border-[#FFF100]/30';
      case 'available':
        return 'bg-[#aaa]/20 text-[#aaa] border-[#aaa]/30';
      case 'cancelled':
        return 'bg-[#ff6d64]/20 text-[#ff6d64] border-[#ff6d64]/30';
      default:
        return 'bg-[#aaa]/20 text-[#aaa] border-[#aaa]/30';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'claimed':
        return t('claims:detail.statusLabels.received');
      case 'requested':
        return t('claims:detail.statusLabels.inProcess');
      case 'available':
        return t('claims:detail.statusLabels.available');
      case 'paid':
        return t('claims:detail.statusLabels.paid');
      case 'cancelled':
        return t('claims:detail.statusLabels.cancelled');
      default:
        return status;
    }
  };

  const getCommissionTypeLabel = (commissionType: string): string => {
    const typeLower = commissionType.toLowerCase();
    if (typeLower === 'papa' || typeLower === 'padre') return t('claims:detail.commissionTypes.level1');
    if (typeLower === 'abuelo') return t('claims:detail.commissionTypes.level2');
    if (typeLower === 'bis_abuelo' || typeLower === 'bisabuelo') return t('claims:detail.commissionTypes.level3');
    if (typeLower === 'leader_retention' || typeLower === 'leader_markup') return t('claims:detail.commissionTypes.companyCommission');
    if (typeLower === 'b2b_commission') return t('claims:detail.commissionTypes.b2bCommission');
    if (typeLower === 'retroactive') return t('claims:detail.commissionTypes.retroactive');
    return commissionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCommissionTypeBadgeVariant = (commissionType: string): 'yellow' | 'green' | 'blue' | 'red' | 'default' => {
    const typeLower = commissionType.toLowerCase();
    if (typeLower === 'papa' || typeLower === 'padre') return 'yellow'; // Nivel 1 - amarillo
    if (typeLower === 'abuelo') return 'green'; // Nivel 2 - verde
    if (typeLower === 'bis_abuelo' || typeLower === 'bisabuelo') return 'blue'; // Nivel 3 - azul
    if (typeLower === 'leader_markup' || typeLower === 'leader_retention') return 'yellow'; // Comisión Empresa - amarillo
    if (typeLower === 'b2b_commission') return 'yellow'; // Comisión B2B - amarillo
    if (typeLower === 'retroactive') return 'yellow'; // Retroactiva - amarillo
    return 'default';
  };

  const getConceptBadge = (concept?: 'fund' | 'card_selling', origin?: 'mlm_transaction' | 'b2c_from_b2b_commission') => {
    let badgeText = '';
    let badgeVariant: 'blue' | 'green' | 'default' = 'default';
    
    // Si hay un concepto explícito, usarlo
    if (concept === 'fund') {
      badgeText = t('claims:item.concepts.fund');
      badgeVariant = 'blue';
    } else if (concept === 'card_selling') {
      badgeText = t('claims:item.concepts.card_selling');
      badgeVariant = 'green';
    } 
    // Si no hay concepto pero el origin es b2c_from_b2b_commission, es una comisión por volumen empresa
    else if (!concept && origin === 'b2c_from_b2b_commission') {
      badgeText = t('claims:item.concepts.volume');
      badgeVariant = 'default';
    }
    
    if (!badgeText) return null;
    
    return (
      <Badge 
        variant={badgeVariant}
        className="text-xs"
      >
        {badgeText}
      </Badge>
    );
  };

  const censorEmail = (email: string): string => {
    if (!email) return 'N/A';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const censoredLocal = localPart.length > 2 
      ? `${localPart.substring(0, 2)}${'*'.repeat(Math.min(localPart.length - 2, 3))}`
      : '***';
    return `${censoredLocal}@${domain}`;
  };

  const handleBack = () => {
    // Limpiar localStorage al salir
    localStorage.removeItem('claimDetailOrderId');
    localStorage.removeItem('claimDetailClaimType');
    navigate('/claims');
  };

  const claims: OrderClaimItem[] = orderClaimsData?.data?.items || [];

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-8 pt-16 lg:pt-0">
        {/* Navbar responsivo */}
        <DashboardNavbar title={t('claims:detail.title')} />

        {/* Botón de regreso */}
        <div className="relative z-20 mt-6 mb-4">
          <button
            onClick={handleBack}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            aria-label={t('claims:detail.back')}
          >
            <BackButtonPath width={64} height={64} />
          </button>
        </div>

        {/* Tab de filtro (B2C o B2B) */}
        {claimType && (
          <div className="relative z-20 mb-4">
            <NetworkTabs
              activeTab={claimType.toLowerCase() as 'b2c' | 'b2b'}
              onTabChange={() => {}} // No permitir cambio de tab aquí
              availableTabs={{
                b2c: claimType === 'B2C',
                b2b: claimType === 'B2B',
                b2t: false,
              }}
              tabHeight={55}
            />
          </div>
        )}

        {/* Información de la orden */}
        {orderClaimsData?.data && (
          <div className="relative z-20 mb-6">
            <div className="bg-[#212020] rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[#FFF100] text-xl font-semibold mb-2">
                    {t('claims:detail.order')} #{orderClaimsData.data.orderId}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{t('claims:detail.status')}: <Badge variant="outline" className={getStatusColor(orderClaimsData.data.orderStatus)}>{getStatusLabel(orderClaimsData.data.orderStatus)}</Badge></span>
                    <span>{t('claims:detail.total')}: <span className="text-white font-semibold">{formatCurrencyWithThreeDecimals(orderClaimsData.data.orderTotalAmount)} <span className="text-[#FFF100]">USDT</span></span></span>
                    <span>{t('claims:detail.claims')}: <span className="text-white">{claims.length}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de claims */}
        <div className="relative z-20 flex flex-col gap-3">
          {/* Headers - Solo visible en pantallas medianas y grandes */}
          <div className="w-full mb-3 hidden md:block">
            <div className="w-full px-6 md:px-8 lg:px-10">
              <div className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1fr_1.2fr_1fr] gap-2 md:gap-4 h-10 items-center text-xs text-white">
                <div className="flex items-center justify-start min-w-0">{t('claims:item.labels.date')}</div>
                <div className="flex items-center justify-start min-w-0">
                  {/* Mostrar "Empresa" solo si el usuario es B2C y el tab es B2B */}
                  {userModel === 'B2C' && claimType === 'B2B' ? t('claims:item.labels.company') : t('claims:item.labels.user')}
                </div>
                <div className="flex items-center justify-start min-w-0">{t('claims:item.labels.concept')}</div>
                <div className="flex items-center justify-start min-w-0">{t('claims:item.labels.amount')}</div>
                <div className="flex items-center justify-start min-w-0">{t('claims:item.labels.status')}</div>
                <div className="flex items-center justify-start min-w-0">{t('claims:item.labels.type')}</div>
                <div className="flex items-center justify-start min-w-0">{t('claims:item.labels.actions')}</div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Spinner className="size-6 text-[#FFF100]" />
                <span className="text-sm text-[#aaa]">{t('claims:detail.loading')}</span>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-sm text-[#ff6d64]">{t('claims:detail.error')}</span>
            </div>
          ) : claims.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-sm text-[#aaa]">{t('claims:detail.noClaims')}</span>
            </div>
          ) : (
            <div className="w-full space-y-2">
              {claims.map((claim) => {
                const calcDetails = claim.calculationDetails;
                const isRetroactive = claim.commissionType?.toLowerCase() === 'retroactive';
                
                // Acceder a userEmail, user_email y teamName de forma segura según el tipo
                // Para retroactive, usar user_email que viene censurado del backend
                let userEmail = '';
                if (isRetroactive && calcDetails && 'user_email' in calcDetails) {
                  userEmail = (calcDetails as any).user_email || '';
                } else if (calcDetails && 'userEmail' in calcDetails) {
                  userEmail = (calcDetails as any).userEmail || '';
                }
                
                const teamName = (calcDetails && 'teamName' in calcDetails) 
                  ? (calcDetails as any).teamName || '' 
                  : '';
                const montoClaim = claim.commissionAmount + (claim.leaderMarkupAmount || 0);
                
                // Mostrar teamName solo si el usuario es B2C y el tab es B2B, si no mostrar correo
                // Para retroactive, usar userEmail directamente (ya viene censurado), sino censurar
                const usuarioValue = (userModel === 'B2C' && claimType === 'B2B' && teamName)
                  ? teamName 
                  : (isRetroactive && userEmail ? userEmail : censorEmail(userEmail));

                return (
                  <InfoBanner key={claim.id} className="w-full !h-auto min-h-[64px] py-3 md:!h-16 md:py-0" backgroundColor="#212020">
                    <div className="w-full h-full flex items-center md:items-center">
                      {/* Layout para pantallas grandes: grid horizontal */}
                      <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1fr_1.2fr_1fr] gap-2 md:gap-4 items-center text-sm text-white w-full">
                        {/* Fecha */}
                        <div className="flex items-center justify-start min-w-0">
                          <span className="text-white text-xs md:text-sm truncate">{formatDate(claim.createdAt)}</span>
                        </div>
                        {/* Usuario/Empresa */}
                        <div className="flex items-center justify-start min-w-0">
                          <span className="text-white text-xs md:text-sm truncate">{usuarioValue || 'N/A'}</span>
                        </div>
                        {/* Concepto */}
                        <div className="flex items-center justify-start min-w-0">
                          {getConceptBadge(claim.concept, claim.origin)}
                        </div>
                        {/* Monto de la claim */}
                        <div className="flex items-center justify-start min-w-0">
                          <span className="text-white font-semibold text-xs md:text-sm whitespace-nowrap">
                            {formatCurrency(montoClaim, claim.currency)}
                          </span>
                        </div>
                        {/* Estado */}
                        <div className="flex items-center justify-start min-w-0">
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(claim.status)}
                          >
                            {getStatusLabel(claim.status)}
                          </Badge>
                        </div>
                        {/* Tipo de comisión */}
                        <div className="flex items-center justify-start min-w-0">
                          <Badge 
                            variant={getCommissionTypeBadgeVariant(claim.commissionType)}
                            className="text-xs"
                          >
                            {getCommissionTypeLabel(claim.commissionType)}
                          </Badge>
                        </div>
                        {/* Acciones - Ver detalle */}
                        <div className="flex items-center justify-start min-w-0">
                          <button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setModalOpen(true);
                            }}
                            className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer text-xs md:text-sm whitespace-nowrap"
                          >
                            {t('claims:detail.details')}
                          </button>
                        </div>
                      </div>

                      {/* Layout para pantallas pequeñas: stack vertical */}
                      <div className="md:hidden flex flex-col gap-3 text-sm text-white w-full">
                        {/* Fecha */}
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white/60 text-xs flex-shrink-0">{t('claims:item.labels.date')}</span>
                          <span className="text-white text-xs text-right ml-2">{formatDate(claim.createdAt)}</span>
                        </div>
                        {/* Usuario/Empresa */}
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white/60 text-xs flex-shrink-0">
                            {userModel === 'B2C' && claimType === 'B2B' ? t('claims:item.labels.company') : t('claims:item.labels.user')}
                          </span>
                          <span className="text-white text-xs text-right truncate ml-2 max-w-[60%]">{usuarioValue || 'N/A'}</span>
                        </div>
                        {/* Concepto */}
                        {(claim.concept || claim.origin === 'b2c_from_b2b_commission') && (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-white/60 text-xs flex-shrink-0">{t('claims:item.labels.concept')}</span>
                            <div className="ml-2">
                              {getConceptBadge(claim.concept, claim.origin)}
                            </div>
                          </div>
                        )}
                        {/* Monto de la claim */}
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white/60 text-xs flex-shrink-0">{t('claims:item.labels.amount')}</span>
                          <span className="text-white font-semibold text-xs text-right whitespace-nowrap ml-2">
                            {formatCurrency(montoClaim, claim.currency)}
                          </span>
                        </div>
                        {/* Estado */}
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white/60 text-xs flex-shrink-0">{t('claims:item.labels.status')}</span>
                          <div className="ml-2">
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(claim.status)}
                            >
                              {getStatusLabel(claim.status)}
                            </Badge>
                          </div>
                        </div>
                        {/* Tipo de comisión */}
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white/60 text-xs flex-shrink-0">{t('claims:item.labels.type')}</span>
                          <div className="ml-2">
                            <Badge 
                              variant={getCommissionTypeBadgeVariant(claim.commissionType)}
                              className="text-xs"
                            >
                              {getCommissionTypeLabel(claim.commissionType)}
                            </Badge>
                          </div>
                        </div>
                        {/* Acciones - Ver detalle */}
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white/60 text-xs flex-shrink-0">{t('claims:item.labels.actions')}</span>
                          <button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setModalOpen(true);
                            }}
                            className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer text-xs whitespace-nowrap ml-2"
                          >
                            {t('claims:detail.details')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </InfoBanner>
                );
              })}
            </div>
          )}
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

      {/* Modal de detalle de claim individual */}
      <OrderClaimDetailModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setSelectedClaim(null);
          }
        }}
        claim={selectedClaim}
      />
    </div>
  );
};

export default ClaimDetail;

