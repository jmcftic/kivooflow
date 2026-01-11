import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrencyWithThreeDecimals } from '@/lib/utils';
import InfoBanner from '../atoms/InfoBanner';
import DropDownTringle from '../atoms/DropDownTringle';
import LevelOneTag from '../atoms/LevelOneTag';
import LevelTwoTag from '../atoms/LevelTwoTag';
import LevelThreeTag from '../atoms/LevelThreeTag';
import LevelFourPlusTag from '../atoms/LevelFourPlusTag';
import { Spinner } from '@/components/ui/spinner';
import DescendantCardStatusModal from '../molecules/DescendantCardStatusModal';
import { checkDescendantActiveCard } from '@/services/cards';
import HelpIcon from '../atoms/HelpIcon';

// Función para truncar a 3 decimales sin redondear y mostrar con coma
// Si los 3 decimales son 0, no mostrar decimales
const truncateTo3Decimals = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return '0';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';
  const valueStr = numValue.toString();
  const [integerPart, decimalPart = ''] = valueStr.split('.');
  const truncatedDecimals = decimalPart.slice(0, 3).padEnd(3, '0');
  
  // Si los 3 decimales son todos ceros, retornar solo la parte entera
  if (truncatedDecimals === '000') {
    return integerPart;
  }
  
  // Si hay decimales diferentes de cero, mostrarlos con coma
  return `${integerPart},${truncatedDecimals}`;
};

interface NetworkTableProps {
  items: Array<{
    id: number;
    name: string;
    email?: string;
    createdAt?: string;
    totalDescendants?: number;
    hasDescendants?: boolean;
    authLevel?: number;
    levelInSubtree?: number;
    level?: number;
    profileIconUrl?: string; // Para mostrar icono en líderes B2B
    comisionesGeneradas?: number;
    volumen?: number;
  }>;
  activeTab: 'b2c' | 'b2b' | 'b2t';
  activeLevel: 1 | 2 | 3;
  onToggleExpand?: (userId: number, level: number) => void;
  childrenByParent?: Record<number, Array<{ id: number; name: string; email?: string; createdAt?: string; totalDescendants?: number; hasDescendants?: boolean; comisionesGeneradas?: number; volumen?: number }>>;
  childIndentPx?: number;
  onViewTree?: (userId: number) => void;
  onViewDetail?: (userId: number) => void;
  disableExpand?: boolean;
  disableViewTree?: boolean;
  isLeaderTab?: boolean;
  onLoadMoreChildren?: (parentId: number, parentLevel: number) => void;
  parentHasMore?: Record<number, boolean>;
  parentLoading?: Record<number, boolean>;
  loadingTreeUserId?: number | null;
  parentExhausted?: Record<number, boolean>;
  parentErrors?: Record<number, string>;
  hasDepthLimit?: boolean;
  maxDepth?: number;
  userModel?: string | null; // Para determinar si es B2C viendo B2B
}

const NetworkTable: React.FC<NetworkTableProps> = ({ items, activeTab, activeLevel, onToggleExpand, childrenByParent = {}, childIndentPx = 30, onViewTree, onViewDetail, disableExpand = false, disableViewTree = false, isLeaderTab = false, onLoadMoreChildren, parentHasMore = {}, parentLoading = {}, loadingTreeUserId = null, parentExhausted = {}, parentErrors = {}, hasDepthLimit = true, maxDepth = 3, userModel = null }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['network', 'common']);
  const [cardStatusModalOpen, setCardStatusModalOpen] = useState(false);
  const [hasActiveCard, setHasActiveCard] = useState<boolean | null>(null);
  const [checkingUserId, setCheckingUserId] = useState<number | null>(null);
  const [cardStatusError, setCardStatusError] = useState<string | null>(null);

  // Ocultar columna Actividad cuando es B2C viendo tab B2B (empresas)
  const showActivityColumn = !(activeTab === 'b2b' && userModel?.toLowerCase() !== 'b2b');
  const gridCols = showActivityColumn ? 'grid-cols-6' : 'grid-cols-5';
  
  // Determinar el label de la columna de email/usuario/empresa
  const getEmailColumnLabel = () => {
    if (activeTab === 'b2b') {
      return userModel?.toLowerCase() === 'b2b' ? t('network:table.headers.user') : t('network:table.headers.company');
    }
    return t('network:table.headers.email');
  };

  const handleViewTree = (userId: number) => {
    if (onViewTree) {
      // Si se pasa onViewTree como prop, usarlo (para compatibilidad con Network.tsx)
      onViewTree(userId);
    } else {
      // Guardar el ID del árbol en sessionStorage antes de navegar
      sessionStorage.setItem('networkTreeUserId', userId.toString());
      // Navegar a la ruta del árbol (sin parámetro en la URL)
      navigate('/network/tree');
    }
  };

  const handleCheckCardStatus = async (userId: number) => {
    setCheckingUserId(userId);
    setHasActiveCard(null);
    setCardStatusError(null);
    setCardStatusModalOpen(false);

    try {
      const result = await checkDescendantActiveCard(userId);
      setHasActiveCard(result);
      setCardStatusModalOpen(true);
    } catch (error: any) {
      console.error('Error al verificar tarjeta activa:', error);
      let errorMsg = t('network:cardStatus.error');
      
      if (error?.response?.status === 403) {
        errorMsg = t('network:cardStatus.errorForbidden');
      } else if (error?.response?.status === 401) {
        errorMsg = t('network:cardStatus.errorUnauthorized');
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      setCardStatusError(errorMsg);
      setCardStatusModalOpen(true);
    } finally {
      setCheckingUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemLevel = (item as any).levelInSubtree ?? (item as any).level ?? activeLevel;
        const authLevel = (item as any).authLevel ?? (item as any).level ?? activeLevel;
        // Si no hay límite de profundidad (usuario B2B en tab B2B), permitir expandir si tiene descendientes (sin importar el nivel)
        // Si hay límite de profundidad, solo permitir expandir si authLevel < 3
        const hasDescendants = item.hasDescendants ?? (item.totalDescendants ?? 0) > 0;
        // Para usuarios B2B en tab B2B (hasDepthLimit = false), permitir expandir si tiene descendientes sin importar el nivel
        // Para otros casos, solo permitir si authLevel < 3
        const canExpand = !disableExpand && hasDescendants && (hasDepthLimit ? authLevel < 3 : true);
        const isExpanded = Array.isArray(childrenByParent[item.id]);
        const isLoading = loadingTreeUserId === item.id;
        // Si no hay límite de profundidad, permitir ver árbol si tiene descendientes
        const canViewTree = !disableViewTree && (!hasDepthLimit || authLevel < 3) && hasDescendants;
        const itemError = parentErrors[item.id];

        return (
        <div key={item.id} className="space-y-2">
          {/** Determinar si el padre está expandido para resaltar su red */}
          <InfoBanner className="w-full h-auto min-h-[200px] md:h-16 md:min-h-[64px]" backgroundColor={isExpanded ? "#3c3c3c" : "#212020"}>
            {/* Layout móvil: cada campo en su propia row */}
            <div className="flex flex-col md:hidden gap-2 w-full">
              {/* Email/Usuario/Empresa */}
              <div className="flex flex-row items-center justify-between w-full py-1.5">
                <span className="text-[#CBCACA] text-xs">{getEmailColumnLabel()}</span>
                <div className="flex items-center gap-2">
                  {canExpand && (
                    <DropDownTringle 
                      className="cursor-pointer" 
                      isExpanded={isExpanded}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand && onToggleExpand(item.id, authLevel as 1 | 2 | 3);
                      }}
                    />
                  )}
                  {activeTab === 'b2b' && item.profileIconUrl && (
                    <div className="flex-shrink-0 relative" style={{ width: '24px', height: '24px', overflow: 'hidden', borderRadius: '50%' }}>
                      <img 
                        src={item.profileIconUrl}
                        alt=""
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: 'none',
                          maxHeight: 'none',
                          objectFit: 'none'
                        }}
                      />
                    </div>
                  )}
                  <span className="text-white text-sm font-medium truncate" title={item.email || item.name}>
                    {item.email || item.name}
                  </span>
                </div>
              </div>
              {/* Fecha de unión */}
              <div className="flex flex-row items-center justify-between w-full py-1.5">
                <span className="text-[#CBCACA] text-xs">{t('network:table.headers.joinDate')}</span>
                <span className="text-white text-sm font-medium">{item.createdAt ? new Date(item.createdAt).toISOString().slice(0,10) : '—'}</span>
              </div>
              {/* Nivel */}
              <div className="flex flex-row items-center justify-between w-full py-1.5">
                <span className="text-[#CBCACA] text-xs">{t('network:table.headers.level')}</span>
                <div className="flex items-center justify-center">
                  {(() => {
                    if (authLevel === 1) return <LevelOneTag />;
                    if (authLevel === 2) return <LevelTwoTag />;
                    if (authLevel === 3) return <LevelThreeTag />;
                    return <LevelFourPlusTag level={authLevel} />;
                  })()}
                </div>
              </div>
              {/* Volumen */}
              <div className="flex flex-row items-center justify-between w-full py-1.5">
                <span className="text-[#CBCACA] text-xs">{t('network:table.headers.volume')}</span>
                <span className="text-white text-sm font-medium">
                  {typeof item.volumen === 'number' || (typeof item.volumen === 'string' && item.volumen !== '')
                    ? `USDT ${truncateTo3Decimals(item.volumen)}`
                    : (typeof item.comisionesGeneradas === 'number' 
                        ? `USDT ${formatCurrencyWithThreeDecimals(item.comisionesGeneradas)}` 
                        : 'USDT 0.00')}
                </span>
              </div>
              {/* Actividad */}
              {showActivityColumn && (
                <div className="flex flex-row items-center justify-between w-full py-1.5">
                  <span className="text-[#CBCACA] text-xs">{t('network:table.headers.activity')}</span>
                  <div className="flex items-center justify-center">
                    {checkingUserId === item.id ? (
                      <Spinner className="size-4 text-[#FFF100]" />
                    ) : (
                      <button
                        onClick={() => handleCheckCardStatus(item.id)}
                        className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                        title={t('network:table.actions.checkCard')}
                        disabled={checkingUserId !== null}
                      >
                        <HelpIcon />
                      </button>
                    )}
                  </div>
                </div>
              )}
              {/* Acciones */}
              <div className="flex flex-row items-center justify-center w-full py-1.5">
                {isLeaderTab && onViewDetail ? (
                  <span 
                    className="text-[#FFF100] cursor-pointer hover:text-[#E6D900] transition-colors text-sm" 
                    onClick={() => onViewDetail(item.id)}
                  >
                    {t('network:table.actions.viewDetail')}
                  </span>
                ) : canViewTree ? (
                  <div className="flex items-center gap-2">
                    <span className={`text-[#FFF100] ${isLoading ? 'cursor-default opacity-70' : 'cursor-pointer'} text-sm`} onClick={() => !isLoading && handleViewTree(item.id)}>
                      {t('network:table.actions.viewTree')}
                    </span>
                    {isLoading && <Spinner className="size-4 text-[#FFF100]" />}
                  </div>
                ) : null}
              </div>
            </div>
            
            {/* Layout desktop: grid */}
            <div className="hidden md:flex w-full items-center h-full px-4 md:px-6 py-2">
              <div className={`flex-1 grid ${gridCols} gap-2 md:gap-4 items-center text-sm text-white h-full`}>
                <div className="relative flex items-center justify-center h-full pl-6 gap-2">
                  {canExpand && (
                    <DropDownTringle 
                      className="absolute left-0 cursor-pointer" 
                      isExpanded={isExpanded}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand && onToggleExpand(item.id, authLevel as 1 | 2 | 3);
                      }}
                    />
                  )}
                  {/* Mostrar icono si es tab B2B y tiene profileIconUrl */}
                  {activeTab === 'b2b' && item.profileIconUrl && (
                    <div className="flex-shrink-0 relative" style={{ width: '32px', height: '32px', overflow: 'hidden', borderRadius: '50%' }}>
                      <svg 
                        width="32" 
                        height="32" 
                        viewBox="0 0 32 32" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute inset-0 pointer-events-none"
                      >
                        <defs>
                          <clipPath id={`clip-circle-icon-${item.id}`}>
                            <rect width="32" height="32" rx="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <img 
                        src={item.profileIconUrl}
                        alt=""
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: 'none',
                          maxHeight: 'none',
                          objectFit: 'none'
                        }}
                      />
                    </div>
                  )}
                  <span
                    className="block w-full text-center truncate"
                    title={item.email || item.name}
                  >
                    {item.email || item.name}
                  </span>
                </div>
                <div className="text-center flex items-center justify-center h-full">
                  {item.createdAt ? new Date(item.createdAt).toISOString().slice(0,10) : '—'}
                </div>
                <div className="flex items-center justify-center h-full">
                  {(() => {
                    if (authLevel === 1) return <LevelOneTag />;
                    if (authLevel === 2) return <LevelTwoTag />;
                    if (authLevel === 3) return <LevelThreeTag />;
                    return <LevelFourPlusTag level={authLevel} />;
                  })()}
                </div>
                <div className="text-center flex items-center justify-center h-full">
                  {typeof item.volumen === 'number' || (typeof item.volumen === 'string' && item.volumen !== '')
                    ? `USDT ${truncateTo3Decimals(item.volumen)}`
                    : (typeof item.comisionesGeneradas === 'number' 
                        ? `USDT ${formatCurrencyWithThreeDecimals(item.comisionesGeneradas)}` 
                        : 'USDT 0.00')}
                </div>
                {showActivityColumn && (
                  <div className="flex items-center justify-center h-full">
                    {checkingUserId === item.id ? (
                      <Spinner className="size-4 text-[#FFF100]" />
                    ) : (
                      <button
                        onClick={() => handleCheckCardStatus(item.id)}
                        className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                        title={t('network:table.actions.checkCard')}
                        disabled={checkingUserId !== null}
                      >
                        <HelpIcon />
                      </button>
                    )}
                  </div>
                )}
                <div className="text-right pr-6 flex items-center justify-end h-full">
                  {isLeaderTab && onViewDetail ? (
                    <div className="flex items-center justify-end gap-2">
                      <span 
                        className="text-[#FFF100] cursor-pointer hover:text-[#E6D900] transition-colors" 
                        onClick={() => onViewDetail(item.id)}
                      >
                        {t('network:table.actions.viewDetail')}
                      </span>
                    </div>
                  ) : canViewTree ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[#FFF100] ${isLoading ? 'cursor-default opacity-70' : 'cursor-pointer'}`} onClick={() => !isLoading && handleViewTree(item.id)}>
                        {t('network:table.actions.viewTree')}
                      </span>
                      {isLoading && <Spinner className="size-4 text-[#FFF100]" />}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </InfoBanner>
          {Array.isArray(childrenByParent[item.id]) && (() => {
            return (
              <div className="space-y-2" style={{ marginLeft: `${childIndentPx}px` }}>
                {childrenByParent[item.id].map((child) => {
                const childLevel = (child as any).levelInSubtree ?? (child as any).level ?? (hasDepthLimit ? Math.min(itemLevel + 1, 3) : itemLevel + 1);
                const childAuthLevel = (child as any).authLevel ?? (child as any).level ?? (hasDepthLimit ? Math.min(authLevel + 1, 3) : authLevel + 1);
                // Si no hay límite de profundidad (usuario B2B en tab B2B), permitir expandir si tiene descendientes (sin importar el nivel)
                const childHasDescendants = (child as any).hasDescendants ?? (child.totalDescendants ?? 0) > 0;
                const childCanExpand = !disableExpand && childHasDescendants && (hasDepthLimit ? childAuthLevel < 3 : true);
                const childExpanded = Array.isArray(childrenByParent[child.id]);
                const childIsLoading = loadingTreeUserId === child.id;
                // Si no hay límite de profundidad, permitir ver árbol si tiene descendientes
                const childCanViewTree = !disableViewTree && (!hasDepthLimit || childAuthLevel < 3) && childHasDescendants;
                const childError = parentErrors[child.id];

                return (
                <div key={child.id} className="space-y-2">
                  <InfoBanner className="w-full h-auto min-h-[200px] md:h-16 md:min-h-[64px]" backgroundColor="#3c3c3c">
                    {/* Layout móvil */}
                    <div className="flex flex-col md:hidden gap-2 w-full">
                      <div className="flex flex-row items-center justify-between w-full py-1.5">
                        <span className="text-[#CBCACA] text-xs">{getEmailColumnLabel()}</span>
                        <div className="flex items-center gap-2">
                          {childCanExpand && (
                            <DropDownTringle 
                              className="cursor-pointer" 
                              isExpanded={childExpanded}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand && onToggleExpand(child.id, childAuthLevel as 1 | 2 | 3);
                              }}
                            />
                          )}
                          <span className="text-white text-sm font-medium truncate" title={child.email || `${child.name}@email.com`}>
                            {child.email || `${child.name}@email.com`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-between w-full py-1.5">
                        <span className="text-[#CBCACA] text-xs">{t('network:table.headers.joinDate')}</span>
                        <span className="text-white text-sm font-medium">{child.createdAt ? new Date(child.createdAt).toISOString().slice(0,10) : '—'}</span>
                      </div>
                      <div className="flex flex-row items-center justify-between w-full py-1.5">
                        <span className="text-[#CBCACA] text-xs">{t('network:table.headers.level')}</span>
                        <div className="flex items-center justify-center">
                          {childAuthLevel === 1 && <LevelOneTag />}
                          {childAuthLevel === 2 && <LevelTwoTag />}
                          {childAuthLevel === 3 && <LevelThreeTag />}
                          {childAuthLevel > 3 && <LevelFourPlusTag level={childAuthLevel} />}
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-between w-full py-1.5">
                        <span className="text-[#CBCACA] text-xs">{t('network:table.headers.volume')}</span>
                        <span className="text-white text-sm font-medium">
                          {typeof (child as any).volumen === 'number' || (typeof (child as any).volumen === 'string' && (child as any).volumen !== '')
                            ? `USDT ${truncateTo3Decimals((child as any).volumen)}`
                            : (typeof child.comisionesGeneradas === 'number' 
                                ? `USDT ${formatCurrencyWithThreeDecimals(child.comisionesGeneradas)}` 
                                : 'USDT 0.00')}
                        </span>
                      </div>
                      {showActivityColumn && (
                        <div className="flex flex-row items-center justify-between w-full py-1.5">
                          <span className="text-[#CBCACA] text-xs">{t('network:table.headers.activity')}</span>
                          <div className="flex items-center justify-center">
                            {checkingUserId === child.id ? (
                              <Spinner className="size-4 text-[#FFF100]" />
                            ) : (
                              <button
                                onClick={() => handleCheckCardStatus(child.id)}
                                className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                                title={t('network:table.actions.checkCard')}
                                disabled={checkingUserId !== null}
                              >
                                <HelpIcon />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-row items-center justify-center w-full py-1.5">
                        {childCanViewTree ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-[#FFF100] ${childIsLoading ? 'cursor-default opacity-70' : 'cursor-pointer'} text-sm`} onClick={() => !childIsLoading && handleViewTree(child.id)}>
                              {t('network:table.actions.viewTree')}
                            </span>
                            {childIsLoading && <Spinner className="size-4 text-[#FFF100]" />}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    
                    {/* Layout desktop */}
                    <div className="hidden md:flex w-full items-center h-full px-4 md:px-6 py-2">
                      <div className={`flex-1 grid ${gridCols} gap-2 md:gap-4 items-center text-sm text-white h-full`}>
                        <div className="relative flex items-center justify-center h-full pl-6">
                          {childCanExpand && (
                            <DropDownTringle 
                              className="absolute left-0 cursor-pointer" 
                              isExpanded={childExpanded}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand && onToggleExpand(child.id, childAuthLevel as 1 | 2 | 3);
                              }}
                            />
                          )}
                          <span
                            className="block w-full text-center truncate"
                            title={child.email || `${child.name}@email.com`}
                          >
                            {child.email || `${child.name}@email.com`}
                          </span>
                        </div>
                        <div className="text-center flex items-center justify-center h-full">{child.createdAt ? new Date(child.createdAt).toISOString().slice(0,10) : '—'}</div>
                        <div className="flex items-center justify-center h-full">
                          {childAuthLevel === 1 && <LevelOneTag />}
                          {childAuthLevel === 2 && <LevelTwoTag />}
                          {childAuthLevel === 3 && <LevelThreeTag />}
                          {childAuthLevel > 3 && <LevelFourPlusTag level={childAuthLevel} />}
                        </div>
                        <div className="text-center flex items-center justify-center h-full">
                          {typeof (child as any).volumen === 'number' || (typeof (child as any).volumen === 'string' && (child as any).volumen !== '')
                            ? `$${truncateTo3Decimals((child as any).volumen)}`
                            : (typeof child.comisionesGeneradas === 'number' 
                                ? `$${child.comisionesGeneradas.toFixed(2)}` 
                                : '$0.00')}
                        </div>
                        {showActivityColumn && (
                          <div className="flex items-center justify-center h-full">
                            {checkingUserId === child.id ? (
                              <Spinner className="size-4 text-[#FFF100]" />
                            ) : (
                              <button
                                onClick={() => handleCheckCardStatus(child.id)}
                                className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                                title={t('network:table.actions.checkCard')}
                                disabled={checkingUserId !== null}
                              >
                                <HelpIcon />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="text-right pr-6 flex items-center justify-end h-full">
                          {childCanViewTree ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-[#FFF100] ${childIsLoading ? 'cursor-default opacity-70' : 'cursor-pointer'}`} onClick={() => !childIsLoading && handleViewTree(child.id)}>
                                {t('network:table.actions.viewTree')}
                              </span>
                              {childIsLoading && <Spinner className="size-4 text-[#FFF100]" />}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </InfoBanner>
                  {Array.isArray(childrenByParent[child.id]) && (() => {
                    return (
                      <div className="space-y-2" style={{ marginLeft: `${Math.round(childIndentPx * 1.2)}px` }}>
                        {childrenByParent[child.id].map(grand => {
                          // Calcular si el nieto puede expandir (para usuarios B2B en tab B2B sin límite de profundidad)
                          const grandLevel = (grand as any).levelInSubtree ?? (grand as any).level ?? (grand as any).authLevel ?? 3;
                          const grandAuthLevel = (grand as any).authLevel ?? (grand as any).level ?? grandLevel;
                          const grandHasDescendants = (grand as any).hasDescendants ?? (grand.totalDescendants ?? 0) > 0;
                          const grandCanExpand = !disableExpand && grandHasDescendants && (hasDepthLimit ? grandAuthLevel < 3 : true);
                          const grandExpanded = Array.isArray(childrenByParent[grand.id]);
                          const grandIsLoading = loadingTreeUserId === grand.id;
                          const grandCanViewTree = !disableViewTree && (!hasDepthLimit || grandAuthLevel < 3) && grandHasDescendants;
                          const grandError = parentErrors[grand.id];
                          
                          return (
                            <div key={grand.id} className="space-y-2">
                              <InfoBanner className="w-full h-auto min-h-[200px] md:h-16 md:min-h-[64px]" backgroundColor="#3c3c3c">
                                {/* Layout móvil */}
                                <div className="flex flex-col md:hidden gap-2 w-full">
                                  <div className="flex flex-row items-center justify-between w-full py-1.5">
                                    <span className="text-[#CBCACA] text-xs">{getEmailColumnLabel()}</span>
                                    <div className="flex items-center gap-2">
                                      {grandCanExpand && (
                                        <DropDownTringle 
                                          className="cursor-pointer" 
                                          isExpanded={grandExpanded}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleExpand && onToggleExpand(grand.id, grandAuthLevel as 1 | 2 | 3);
                                          }}
                                        />
                                      )}
                                      <span className="text-white text-sm font-medium truncate" title={grand.email || `${grand.name}@email.com`}>
                                        {grand.email || `${grand.name}@email.com`}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-row items-center justify-between w-full py-1.5">
                                    <span className="text-[#CBCACA] text-xs">{t('network:table.headers.joinDate')}</span>
                                    <span className="text-white text-sm font-medium">{grand.createdAt ? new Date(grand.createdAt).toISOString().slice(0,10) : '—'}</span>
                                  </div>
                                  <div className="flex flex-row items-center justify-between w-full py-1.5">
                                    <span className="text-[#CBCACA] text-xs">{t('network:table.headers.level')}</span>
                                    <div className="flex items-center justify-center">
                                      {grandAuthLevel === 1 && <LevelOneTag />}
                                      {grandAuthLevel === 2 && <LevelTwoTag />}
                                      {grandAuthLevel === 3 && <LevelThreeTag />}
                                      {grandAuthLevel > 3 && <LevelFourPlusTag level={grandAuthLevel} />}
                                    </div>
                                  </div>
                                  <div className="flex flex-row items-center justify-between w-full py-1.5">
                                    <span className="text-[#CBCACA] text-xs">{t('network:table.headers.volume')}</span>
                                    <span className="text-white text-sm font-medium">
                                      {typeof (grand as any).volumen === 'number' || (typeof (grand as any).volumen === 'string' && (grand as any).volumen !== '')
                                        ? `USDT ${truncateTo3Decimals((grand as any).volumen)}`
                                        : (typeof (grand as any).comisionesGeneradas === 'number' 
                                            ? `USDT ${formatCurrencyWithThreeDecimals((grand as any).comisionesGeneradas)}` 
                                            : 'USDT 0.00')}
                                    </span>
                                  </div>
                                  {showActivityColumn && (
                                    <div className="flex flex-row items-center justify-between w-full py-1.5">
                                      <span className="text-[#CBCACA] text-xs">{t('network:table.headers.activity')}</span>
                                      <div className="flex items-center justify-center">
                                        {checkingUserId === grand.id ? (
                                          <Spinner className="size-4 text-[#FFF100]" />
                                        ) : (
                                          <button
                                            onClick={() => handleCheckCardStatus(grand.id)}
                                            className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                                            title={t('network:table.actions.checkCard')}
                                            disabled={checkingUserId !== null}
                                          >
                                            <HelpIcon />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex flex-row items-center justify-center w-full py-1.5">
                                    {grandCanViewTree ? (
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[#FFF100] ${grandIsLoading ? 'cursor-default opacity-70' : 'cursor-pointer'} text-sm`} onClick={() => !grandIsLoading && handleViewTree(grand.id)}>
                                          {t('network:table.actions.viewTree')}
                                        </span>
                                        {grandIsLoading && <Spinner className="size-4 text-[#FFF100]" />}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                
                                {/* Layout desktop */}
                                <div className="hidden md:flex w-full items-center h-full px-4 md:px-6 py-2">
                                  <div className={`flex-1 grid ${gridCols} gap-2 md:gap-4 items-center text-sm text-white h-full`}>
                                    <div className="relative flex items-center justify-center h-full pl-6">
                                      {grandCanExpand && (
                                        <DropDownTringle 
                                          className="absolute left-0 cursor-pointer" 
                                          isExpanded={grandExpanded}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleExpand && onToggleExpand(grand.id, grandAuthLevel as 1 | 2 | 3);
                                          }}
                                        />
                                      )}
                                      <span
                                        className="block w-full text-center truncate"
                                        title={grand.email || `${grand.name}@email.com`}
                                      >
                                        {grand.email || `${grand.name}@email.com`}
                                      </span>
                                    </div>
                                    <div className="text-center flex items-center justify-center h-full">{grand.createdAt ? new Date(grand.createdAt).toISOString().slice(0,10) : '—'}</div>
                                    <div className="flex items-center justify-center h-full">
                                      {grandAuthLevel === 1 && <LevelOneTag />}
                                      {grandAuthLevel === 2 && <LevelTwoTag />}
                                      {grandAuthLevel === 3 && <LevelThreeTag />}
                                      {grandAuthLevel > 3 && <LevelFourPlusTag level={grandAuthLevel} />}
                                    </div>
                                    <div className="text-center flex items-center justify-center h-full">
                                      {typeof (grand as any).volumen === 'number' || (typeof (grand as any).volumen === 'string' && (grand as any).volumen !== '')
                                        ? `$${truncateTo3Decimals((grand as any).volumen)}`
                                        : (typeof (grand as any).comisionesGeneradas === 'number' 
                                            ? `$${(grand as any).comisionesGeneradas.toFixed(2)}` 
                                            : '$0.00')}
                                    </div>
                                    {showActivityColumn && (
                                      <div className="flex items-center justify-center h-full">
                                        {checkingUserId === grand.id ? (
                                          <Spinner className="size-4 text-[#FFF100]" />
                                        ) : (
                                          <button
                                            onClick={() => handleCheckCardStatus(grand.id)}
                                            className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                                            title={t('network:table.actions.checkCard')}
                                            disabled={checkingUserId !== null}
                                          >
                                            <HelpIcon />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    <div className="text-right pr-6 flex items-center justify-end h-full">
                                      {grandCanViewTree ? (
                                        <div className="flex items-center justify-end gap-2">
                                          <span className={`text-[#FFF100] ${grandIsLoading ? 'cursor-default opacity-70' : 'cursor-pointer'}`} onClick={() => !grandIsLoading && handleViewTree(grand.id)}>
                                            {t('network:table.actions.viewTree')}
                                          </span>
                                          {grandIsLoading && <Spinner className="size-4 text-[#FFF100]" />}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </InfoBanner>
                              {Array.isArray(childrenByParent[grand.id]) && (
                                <div className="space-y-2" style={{ marginLeft: `${Math.round(childIndentPx * 1.4)}px` }}>
                                  {childrenByParent[grand.id].map(greatGrand => {
                                    // Calcular si el bisnieto puede expandir (para usuarios B2B en tab B2B sin límite de profundidad)
                                    const greatGrandLevel = (greatGrand as any).levelInSubtree ?? (greatGrand as any).level ?? (greatGrand as any).authLevel ?? 4;
                                    const greatGrandAuthLevel = (greatGrand as any).authLevel ?? (greatGrand as any).level ?? greatGrandLevel;
                                    const greatGrandHasDescendants = (greatGrand as any).hasDescendants ?? (greatGrand.totalDescendants ?? 0) > 0;
                                    const greatGrandCanExpand = !disableExpand && greatGrandHasDescendants && (hasDepthLimit ? greatGrandAuthLevel < 3 : true);
                                    const greatGrandExpanded = Array.isArray(childrenByParent[greatGrand.id]);
                                    const greatGrandIsLoading = loadingTreeUserId === greatGrand.id;
                                    const greatGrandCanViewTree = !disableViewTree && (!hasDepthLimit || greatGrandAuthLevel < 3) && greatGrandHasDescendants;
                                    
                                    return (
                                      <div key={greatGrand.id} className="space-y-2">
                                        <InfoBanner className="w-full h-auto min-h-[200px] md:h-16 md:min-h-[64px]" backgroundColor="#3c3c3c">
                                          {/* Layout móvil */}
                                          <div className="flex flex-col md:hidden gap-2 w-full">
                                            <div className="flex flex-row items-center justify-between w-full py-1.5">
                                              <span className="text-[#CBCACA] text-xs">{getEmailColumnLabel()}</span>
                                              <div className="flex items-center gap-2">
                                                {greatGrandCanExpand && (
                                                  <DropDownTringle 
                                                    className="cursor-pointer" 
                                                    isExpanded={greatGrandExpanded}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      onToggleExpand && onToggleExpand(greatGrand.id, greatGrandAuthLevel as 1 | 2 | 3);
                                                    }}
                                                  />
                                                )}
                                                <span className="text-white text-sm font-medium truncate" title={greatGrand.email || `${greatGrand.name}@email.com`}>
                                                  {greatGrand.email || `${greatGrand.name}@email.com`}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex flex-row items-center justify-between w-full py-1.5">
                                              <span className="text-[#CBCACA] text-xs">{t('network:table.headers.joinDate')}</span>
                                              <span className="text-white text-sm font-medium">{greatGrand.createdAt ? new Date(greatGrand.createdAt).toISOString().slice(0,10) : '—'}</span>
                                            </div>
                                            <div className="flex flex-row items-center justify-between w-full py-1.5">
                                              <span className="text-[#CBCACA] text-xs">{t('network:table.headers.level')}</span>
                                              <div className="flex items-center justify-center">
                                                {greatGrandAuthLevel === 1 && <LevelOneTag />}
                                                {greatGrandAuthLevel === 2 && <LevelTwoTag />}
                                                {greatGrandAuthLevel === 3 && <LevelThreeTag />}
                                                {greatGrandAuthLevel > 3 && <LevelFourPlusTag level={greatGrandAuthLevel} />}
                                              </div>
                                            </div>
                                            <div className="flex flex-row items-center justify-between w-full py-1.5">
                                              <span className="text-[#CBCACA] text-xs">{t('network:table.headers.volume')}</span>
                                              <span className="text-white text-sm font-medium">
                                                {typeof (greatGrand as any).volumen === 'number' || (typeof (greatGrand as any).volumen === 'string' && (greatGrand as any).volumen !== '')
                                                  ? `USDT ${truncateTo3Decimals((greatGrand as any).volumen)}`
                                                  : (typeof (greatGrand as any).comisionesGeneradas === 'number' 
                                                      ? `USDT ${formatCurrencyWithThreeDecimals((greatGrand as any).comisionesGeneradas)}` 
                                                      : 'USDT 0.00')}
                                              </span>
                                            </div>
                                            {showActivityColumn && (
                                              <div className="flex flex-row items-center justify-between w-full py-1.5">
                                                <span className="text-[#CBCACA] text-xs">{t('network:table.headers.activity')}</span>
                                                <div className="flex items-center justify-center">
                                                  {checkingUserId === greatGrand.id ? (
                                                    <Spinner className="size-4 text-[#FFF100]" />
                                                  ) : (
                                                    <button
                                                      onClick={() => handleCheckCardStatus(greatGrand.id)}
                                                      className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                                                      title={t('network:table.actions.checkCard')}
                                                      disabled={checkingUserId !== null}
                                                    >
                                                      <HelpIcon />
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            <div className="flex flex-row items-center justify-center w-full py-1.5">
                                              {greatGrandCanViewTree ? (
                                                <div className="flex items-center gap-2">
                                                  <span className={`text-[#FFF100] ${greatGrandIsLoading ? 'cursor-default opacity-70' : 'cursor-pointer'} text-sm`} onClick={() => !greatGrandIsLoading && handleViewTree(greatGrand.id)}>
                                                    {t('network:table.actions.viewTree')}
                                                  </span>
                                                  {greatGrandIsLoading && <Spinner className="size-4 text-[#FFF100]" />}
                                                </div>
                                              ) : null}
                                            </div>
                                          </div>
                                          
                                          {/* Layout desktop */}
                                          <div className="hidden md:flex w-full items-center h-full px-4 md:px-6 py-2">
                                            <div className={`flex-1 grid ${gridCols} gap-2 md:gap-4 items-center text-sm text-white h-full`}>
                                              <div className="relative flex items-center justify-center h-full pl-6">
                                                {greatGrandCanExpand && (
                                                  <DropDownTringle 
                                                    className="absolute left-0 cursor-pointer" 
                                                    isExpanded={greatGrandExpanded}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      onToggleExpand && onToggleExpand(greatGrand.id, greatGrandAuthLevel as 1 | 2 | 3);
                                                    }}
                                                  />
                                                )}
                                                <span
                                                  className="block w-full text-center truncate"
                                                  title={greatGrand.email || `${greatGrand.name}@email.com`}
                                                >
                                                  {greatGrand.email || `${greatGrand.name}@email.com`}
                                                </span>
                                              </div>
                                              <div className="text-center flex items-center justify-center h-full">{greatGrand.createdAt ? new Date(greatGrand.createdAt).toISOString().slice(0,10) : '—'}</div>
                                              <div className="flex items-center justify-center h-full">
                                                {greatGrandAuthLevel === 1 && <LevelOneTag />}
                                                {greatGrandAuthLevel === 2 && <LevelTwoTag />}
                                                {greatGrandAuthLevel === 3 && <LevelThreeTag />}
                                                {greatGrandAuthLevel > 3 && <LevelFourPlusTag level={greatGrandAuthLevel} />}
                                              </div>
                                              <div className="text-center flex items-center justify-center h-full">
                                                {typeof (greatGrand as any).volumen === 'number' || (typeof (greatGrand as any).volumen === 'string' && (greatGrand as any).volumen !== '')
                                                  ? `$${truncateTo3Decimals((greatGrand as any).volumen)}`
                                                  : (typeof (greatGrand as any).comisionesGeneradas === 'number' 
                                                      ? `$${(greatGrand as any).comisionesGeneradas.toFixed(2)}` 
                                                      : '$0.00')}
                                              </div>
                                              {showActivityColumn && (
                                                <div className="flex items-center justify-center h-full">
                                                  {checkingUserId === greatGrand.id ? (
                                                    <Spinner className="size-4 text-[#FFF100]" />
                                                  ) : (
                                                    <button
                                                      onClick={() => handleCheckCardStatus(greatGrand.id)}
                                                      className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                                                      title={t('network:table.actions.checkCard')}
                                                      disabled={checkingUserId !== null}
                                                    >
                                                      <HelpIcon />
                                                    </button>
                                                  )}
                                                </div>
                                              )}
                                              <div className="text-right pr-6 flex items-center justify-end h-full">
                                                {greatGrandCanViewTree ? (
                                                  <div className="flex items-center justify-end gap-2">
                                                    <span className={`text-[#FFF100] ${greatGrandIsLoading ? 'cursor-default opacity-70' : 'cursor-pointer'}`} onClick={() => !greatGrandIsLoading && handleViewTree(greatGrand.id)}>
                                                      {t('network:table.actions.viewTree')}
                                                    </span>
                                                    {greatGrandIsLoading && <Spinner className="size-4 text-[#FFF100]" />}
                                                  </div>
                                                ) : null}
                                              </div>
                                            </div>
                                          </div>
                                        </InfoBanner>
                                        {/* A partir del nivel 5, no se incrementa más la indentación */}
                                        {Array.isArray(childrenByParent[greatGrand.id]) && (
                                          <div className="space-y-2" style={{ marginLeft: `${Math.round(childIndentPx * 1.4)}px` }}>
                                            {childrenByParent[greatGrand.id].map(greatGreatGrand => {
                                              const greatGreatGrandLevel = (greatGreatGrand as any).authLevel ?? (greatGreatGrand as any).level ?? 5;
                                              return (
                                                <InfoBanner key={greatGreatGrand.id} className="w-full h-auto min-h-[200px] md:h-16 md:min-h-[64px]" backgroundColor="#3c3c3c">
                                                  {/* Layout móvil */}
                                                  <div className="flex flex-col md:hidden gap-2 w-full">
                                                    <div className="flex flex-row items-center justify-between w-full py-1.5">
                                                      <span className="text-[#CBCACA] text-xs">{getEmailColumnLabel()}</span>
                                                      <span className="text-white text-sm font-medium truncate" title={greatGreatGrand.email || `${greatGreatGrand.name}@email.com`}>
                                                        {greatGreatGrand.email || `${greatGreatGrand.name}@email.com`}
                                                      </span>
                                                    </div>
                                                    <div className="flex flex-row items-center justify-between w-full py-1.5">
                                                      <span className="text-[#CBCACA] text-xs">{t('network:table.headers.joinDate')}</span>
                                                      <span className="text-white text-sm font-medium">{greatGreatGrand.createdAt ? new Date(greatGreatGrand.createdAt).toISOString().slice(0,10) : '—'}</span>
                                                    </div>
                                                    <div className="flex flex-row items-center justify-between w-full py-1.5">
                                                      <span className="text-[#CBCACA] text-xs">{t('network:table.headers.level')}</span>
                                                      <div className="flex items-center justify-center">
                                                        {greatGreatGrandLevel === 1 && <LevelOneTag />}
                                                        {greatGreatGrandLevel === 2 && <LevelTwoTag />}
                                                        {greatGreatGrandLevel === 3 && <LevelThreeTag />}
                                                        {greatGreatGrandLevel > 3 && <LevelFourPlusTag level={greatGreatGrandLevel} />}
                                                      </div>
                                                    </div>
                                                    <div className="flex flex-row items-center justify-between w-full py-1.5">
                                                      <span className="text-[#CBCACA] text-xs">{t('network:table.headers.volume')}</span>
                                                      <span className="text-white text-sm font-medium">
                                                        {typeof (greatGreatGrand as any).volumen === 'number' || (typeof (greatGreatGrand as any).volumen === 'string' && (greatGreatGrand as any).volumen !== '')
                                                          ? `USDT ${truncateTo3Decimals((greatGreatGrand as any).volumen)}`
                                                          : (typeof (greatGreatGrand as any).comisionesGeneradas === 'number' 
                                                              ? `USDT ${formatCurrencyWithThreeDecimals((greatGreatGrand as any).comisionesGeneradas)}` 
                                                              : 'USDT 0.00')}
                                                      </span>
                                                    </div>
                                                    {showActivityColumn && (
                                                      <div className="flex flex-row items-center justify-between w-full py-1.5">
                                                        <span className="text-[#CBCACA] text-xs">{t('network:table.headers.activity')}</span>
                                                        <div className="flex items-center justify-center">
                                                          {checkingUserId === greatGreatGrand.id ? (
                                                            <Spinner className="size-4 text-[#FFF100]" />
                                                          ) : (
                                                            <button
                                                              onClick={() => handleCheckCardStatus(greatGreatGrand.id)}
                                                              className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                                                              title={t('network:table.actions.checkCard')}
                                                              disabled={checkingUserId !== null}
                                                            >
                                                              <HelpIcon />
                                                            </button>
                                                          )}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  {/* Layout desktop */}
                                                  <div className="hidden md:flex w-full items-center h-full px-4 md:px-6 py-2">
                                                    <div className={`flex-1 grid ${gridCols} gap-2 md:gap-4 items-center text-sm text-white h-full`}>
                                                      <div className="relative pl-10 text-left truncate flex items-center h-full" title={greatGreatGrand.email || `${greatGreatGrand.name}@email.com`}>{greatGreatGrand.email || `${greatGreatGrand.name}@email.com`}</div>
                                                      <div className="text-center flex items-center justify-center h-full">{greatGreatGrand.createdAt ? new Date(greatGreatGrand.createdAt).toISOString().slice(0,10) : '—'}</div>
                                                      <div className="flex items-center justify-center h-full">
                                                        {greatGreatGrandLevel === 1 && <LevelOneTag />}
                                                        {greatGreatGrandLevel === 2 && <LevelTwoTag />}
                                                        {greatGreatGrandLevel === 3 && <LevelThreeTag />}
                                                        {greatGreatGrandLevel > 3 && <LevelFourPlusTag level={greatGreatGrandLevel} />}
                                                      </div>
                                                      <div className="text-center flex items-center justify-center h-full">
                                                        {typeof (greatGreatGrand as any).volumen === 'number' || (typeof (greatGreatGrand as any).volumen === 'string' && (greatGreatGrand as any).volumen !== '')
                                                          ? `$${truncateTo3Decimals((greatGreatGrand as any).volumen)}`
                                                          : (typeof (greatGreatGrand as any).comisionesGeneradas === 'number' 
                                                              ? `$${(greatGreatGrand as any).comisionesGeneradas.toFixed(2)}` 
                                                              : '$0.00')}
                                                      </div>
                                                      {showActivityColumn && (
                                                        <div className="flex items-center justify-center h-full">
                                                          {checkingUserId === greatGreatGrand.id ? (
                                                            <Spinner className="size-4 text-[#FFF100]" />
                                                          ) : (
                                                            <button
                                                              onClick={() => handleCheckCardStatus(greatGreatGrand.id)}
                                                              className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
                                                              title={t('network:table.actions.checkCard')}
                                                              disabled={checkingUserId !== null}
                                                            >
                                                              <HelpIcon />
                                                            </button>
                                                          )}
                                                        </div>
                                                      )}
                                                      <div className="text-right flex items-center justify-end h-full">{/* Nivel 5+ no tiene "Ver red" */}</div>
                                                    </div>
                                                  </div>
                                                </InfoBanner>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {!disableExpand && (
                        childError ? (
                          <div className="w-full flex items-center justify-center py-2 text-[#FF7A7A] text-sm text-center px-4">
                            {childError}
                          </div>
                        ) : parentExhausted[child.id] ? (
                          <div className="w-full flex items-center justify-center py-2 text-[#FFF000] text-sm">
                            {t('network:messages.noMoreUsers')}
                          </div>
                        ) : parentHasMore[child.id] ? (
                          <div className="w-full flex items-center justify-center py-2">
                            <button
                              className="text-[#FFF000] text-sm hover:text-[#E6D900] transition-colors flex items-center gap-2"
                              onClick={() => onLoadMoreChildren && onLoadMoreChildren(child.id, childAuthLevel as 1 | 2 | 3)}
                              disabled={!!parentLoading[child.id]}
                            >
                              {parentLoading[child.id] ? t('network:table.actions.loading') : t('network:table.actions.loadMore')}
                              {parentLoading[child.id] && <Spinner className="size-4 text-[#FFF100]" />}
                            </button>
                          </div>
                        ) : null
                        )}
                      </div>
                    );
                  })()}
                </div>
                );
              })}
              {!disableExpand && (
                itemError ? (
                  <div className="w-full flex items-center justify-center py-2 text-[#FF7A7A] text-sm text-center px-4">
                    {itemError}
                  </div>
                ) : parentExhausted[item.id] ? (
                  <div className="w-full flex items-center justify-center py-2 text-[#FFF000] text-sm">
                    {t('network:messages.noMoreUsers')}
                  </div>
                ) : parentHasMore[item.id] ? (
                  <div className="w-full flex items-center justify-center py-2">
                    <button
                      className="text-[#FFF000] text-sm hover:text-[#E6D900] transition-colors flex items-center gap-2"
                      onClick={() => onLoadMoreChildren && onLoadMoreChildren(item.id, authLevel as 1 | 2 | 3)}
                      disabled={!!parentLoading[item.id]}
                    >
                      {parentLoading[item.id] ? t('network:table.actions.loading') : t('network:table.actions.loadMore')}
                      {parentLoading[item.id] && <Spinner className="size-4 text-[#FFF100]" />}
                    </button>
                  </div>
                ) : null
              )}
            </div>
            );
          })()}
        </div>
        );
      })}
      {/* Modal de estado de tarjeta */}
      <DescendantCardStatusModal
        open={cardStatusModalOpen}
        onOpenChange={setCardStatusModalOpen}
        hasActiveCard={hasActiveCard}
        error={cardStatusError}
      />
    </div>
  );
};

export default NetworkTable;

