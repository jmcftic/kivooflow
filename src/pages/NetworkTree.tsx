import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import NetworkTable from '../components/organisms/NetworkTable';
import NetworkPaginationBar from '../components/organisms/NetworkPaginationBar';
import NetworkTableHeader from '../components/organisms/NetworkTableHeader';
import MiniBaner from '../components/atoms/MiniBaner';
import SingleArrowHistory from '../components/atoms/SingleArrowHistory';
import MoneyIcon from '../components/atoms/MoneyIcon';
import { Spinner } from '@/components/ui/spinner';
import { LottieLoader } from '@/components/ui/lottie-loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMinimumLoading } from '@/hooks/useMinimumLoading';
import { formatCurrencyWithThreeDecimals } from '@/lib/utils';
import {
  getDescendantSubtree,
  getSingleLevelNetwork,
  getB2CNetworkExcludingB2BB2T,
  getAvailableMlmModels,
} from '@/services/network';
import authService from '@/services/auth';

const NetworkTree: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['network', 'common']);
  
  // Obtener el ID del árbol desde sessionStorage
  const getTreeUserId = (): number | null => {
    const storedId = sessionStorage.getItem('networkTreeUserId');
    if (storedId) {
      const parsedId = parseInt(storedId, 10);
      if (!isNaN(parsedId)) {
        return parsedId;
      }
    }
    return null;
  };

  const [userId, setUserId] = useState<number | null>(getTreeUserId());

  const [userModel, setUserModel] = useState<'b2c' | 'b2b' | 'b2t' | null>(null);
  const [subtreeUsers, setSubtreeUsers] = useState<Array<{ id: number; name: string; email?: string; createdAt?: string; levelInSubtree: number; authLevel: number; totalDescendants: number; hasDescendants?: boolean }>>([]);
  const [allSubtreeUsers, setAllSubtreeUsers] = useState<Array<{ id: number; name: string; email?: string; createdAt?: string; levelInSubtree: number; authLevel: number; totalDescendants: number; hasDescendants?: boolean }>>([]);
  const [subtreeRootId, setSubtreeRootId] = useState<number | null>(null);
  const [subtreeTotal, setSubtreeTotal] = useState(0);
  const [subtreePage, setSubtreePage] = useState(1);
  const [subtreeRootName, setSubtreeRootName] = useState<string>('');
  const [subtreeRootEmail, setSubtreeRootEmail] = useState<string>('');
  const [subtreeRootLevel, setSubtreeRootLevel] = useState<number>(1);
  const [subtreeSummary, setSubtreeSummary] = useState<{ activeReferrals: number; lastMonthCommissions: number; totalVolume: number } | null>(null);
  const [childrenByParent, setChildrenByParent] = useState<Record<number, any[]>>({});
  const [parentOffsets, setParentOffsets] = useState<Record<number, number>>({});
  const [parentHasMore, setParentHasMore] = useState<Record<number, boolean>>({});
  const [parentLoading, setParentLoading] = useState<Record<number, boolean>>({});
  const [parentExhausted, setParentExhausted] = useState<Record<number, boolean>>({});
  const [parentErrors, setParentErrors] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showLoader = useMinimumLoading(loading, 3000);
  const [subtreeMode, setSubtreeMode] = useState(false);
  const [usersLimit, setUsersLimit] = useState(50);

  // Usuario B2B en tab B2B no tiene límite de profundidad
  const hasDepthLimit = useMemo(() => {
    return !(userModel === 'b2b');
  }, [userModel]);

  const maxDepth = useMemo(() => {
    return hasDepthLimit ? 3 : 999;
  }, [hasDepthLimit]);

  // Obtener modelo del usuario
  useEffect(() => {
    const fetchModel = async () => {
      try {
        const data = await getAvailableMlmModels();
        const model = data.my_model?.trim().toLowerCase() || '';
        if (model === 'b2c' || model === 'b2b' || model === 'b2t') {
          setUserModel(model as 'b2c' | 'b2b' | 'b2t');
        } else {
          // Fallback a localStorage
          const storedUser = authService.getStoredUser();
          const rawModel = ((storedUser as any)?.mlm_model ??
            (storedUser as any)?.mlmModel ??
            (storedUser as any)?.network_model ??
            (storedUser as any)?.networkModel ?? '').trim().toLowerCase();
          if (rawModel === 'b2c' || rawModel === 'b2b' || rawModel === 'b2t') {
            setUserModel(rawModel as 'b2c' | 'b2b' | 'b2t');
          }
        }
      } catch (error) {
        console.error('Error obteniendo modelo:', error);
        // Fallback a localStorage
        const storedUser = authService.getStoredUser();
        const rawModel = ((storedUser as any)?.mlm_model ??
          (storedUser as any)?.mlmModel ??
          (storedUser as any)?.network_model ??
          (storedUser as any)?.networkModel ?? '').trim().toLowerCase();
        if (rawModel === 'b2c' || rawModel === 'b2b' || rawModel === 'b2t') {
          setUserModel(rawModel as 'b2c' | 'b2b' | 'b2t');
        }
      }
    };
    void fetchModel();
  }, []);

  // Cargar árbol del usuario
  const loadTree = useCallback(async (targetUserId: number) => {
    if (!userModel) return;

    setLoading(true);
    setError(null);
    try {
      // Usar getDescendantSubtree que funciona para todos los modelos (B2C, B2B, B2T)
      const allDirectUsers: any[] = [];
      let backendOffset = 0;
      const backendLimit = 100; // Usar un límite fijo para cargar todos los usuarios inicialmente
      let firstData: any = null;
      let rootUserName = 'Usuario';

      // Hacer múltiples llamadas para obtener todos los hijos directos
      while (true) {
        const res = await getDescendantSubtree({
          descendantId: targetUserId,
          maxDepth: maxDepth,
          limit: backendLimit,
          offset: backendOffset
        });
        const data: any = (res as any)?.data ?? res;
        const users = data?.users || [];

        if (!firstData) {
          firstData = data;
          // Guardar el summary si está disponible
          if (data?.summary) {
            setSubtreeSummary({
              activeReferrals: data.summary.activeReferrals || 0,
              lastMonthCommissions: data.summary.lastMonthCommissions || 0,
              totalVolume: data.summary.totalVolume || 0,
            });
          }
          // Intentar obtener el nombre y correo del usuario raíz desde los hijos directos
          // Los hijos tienen directParentFullName y directParentEmail que es el nombre y correo del usuario raíz
          if (users.length > 0) {
            const firstChild = users.find((u: any) => (u.levelInSubtree ?? 1) === 1);
            if (firstChild) {
              if (firstChild.directParentFullName) {
                rootUserName = firstChild.directParentFullName;
              } else if (firstChild.directParentEmail) {
                rootUserName = firstChild.directParentEmail;
              }
              if (firstChild.directParentEmail) {
                setSubtreeRootEmail(firstChild.directParentEmail);
              }
            }
          }
        }

        if (users.length === 0) break;

        // Filtrar solo usuarios de nivel 1 (hijos directos)
        const directUsers = users.filter((u: any) => (u.levelInSubtree ?? 1) === 1);
        allDirectUsers.push(...directUsers);

        // Si recibimos menos usuarios que el límite solicitado, no hay más
        if (users.length < backendLimit) break;
        backendOffset += backendLimit;
      }

      // Calcular el nivel del usuario raíz
      const requesterLevel = typeof firstData?.requesterLevelToDescendant === 'number' && firstData?.requesterLevelToDescendant > 0
        ? firstData?.requesterLevelToDescendant
        : 1;
      const rootLevel = hasDepthLimit ? Math.min(3, requesterLevel) : requesterLevel;

      // Mapear todos los usuarios para la visualización
      const allUsers = allDirectUsers.map((u: any) => {
        const levelInSubtree = u.levelInSubtree ?? 1;
        const authLevel = hasDepthLimit ? Math.min(3, rootLevel + levelInSubtree) : rootLevel + levelInSubtree;
        return {
          id: u.userId,
          name: u.fullName || u.email,
          email: u.email,
          createdAt: u.createdAt,
          levelInSubtree,
          authLevel,
          totalDescendants: u.totalDescendants || 0,
          hasDescendants: u.hasDescendants ?? (u.totalDescendants || 0) > 0,
          comisionesGeneradas: u.comisiones_generadas,
          volumen: typeof u.volumen === 'number' 
            ? u.volumen 
            : (typeof u.volumen === 'string' 
                ? parseFloat(u.volumen) || 0 
                : (u.volumen ?? 0)),
          // Si levelInSubtree === 1, incluir información del padre directo
          directParentFullName: levelInSubtree === 1 ? (u.directParentFullName || null) : null,
          directParentEmail: levelInSubtree === 1 ? (u.directParentEmail || null) : null,
        };
      });

      // Obtener usuarios de la primera página usando el límite actual
      const initialLimit = usersLimit;
      const pageUsers = allUsers.slice(0, initialLimit);

      setSubtreeMode(true);
      setSubtreeRootId(targetUserId);
      setSubtreeRootName(rootUserName);
      setSubtreeRootLevel(rootLevel);
      setSubtreeUsers(pageUsers);
      setAllSubtreeUsers(allUsers);
      setSubtreeTotal(allDirectUsers.length);
      setSubtreePage(1);
      setChildrenByParent({});
      setParentExhausted({});
      
      // Si no hay summary en la primera respuesta, inicializar con valores por defecto
      if (!firstData?.summary) {
        setSubtreeSummary({
          activeReferrals: 0,
          lastMonthCommissions: 0,
          totalVolume: 0,
        });
      }
    } catch (e) {
      console.error('Error cargando árbol', e);
      setError(t('network:errors.loadError'));
      setSubtreeUsers([]);
      setSubtreeTotal(0);
    } finally {
      setLoading(false);
    }
  }, [userModel, hasDepthLimit, maxDepth]);

  // Verificar si hay un ID válido al montar o cuando cambie
  useEffect(() => {
    const currentUserId = getTreeUserId();
    if (currentUserId !== userId) {
      setUserId(currentUserId);
    }
  }, []);

  useEffect(() => {
    if (userId && userModel) {
      void loadTree(userId);
    } else if (!userId) {
      // Si no hay ID, redirigir a /network
      navigate('/network');
    }
  }, [userId, userModel, loadTree, navigate]);

  // Función para expandir/colapsar hijos
  const handleToggleExpand = useCallback(async (parentUserId: number, level: number) => {
    // Toggle: si existe array -> colapsar (eliminar), si no -> expandir
    if (Array.isArray(childrenByParent[parentUserId])) {
      setChildrenByParent(prev => {
        const next = { ...prev };
        delete next[parentUserId];
        return next;
      });
      setParentExhausted(prev => {
        const next = { ...prev };
        delete next[parentUserId];
        return next;
      });
      return;
    }

    const parentItem = subtreeUsers.find(item => item.id === parentUserId) || 
                       allSubtreeUsers.find(item => item.id === parentUserId);
    const parentAuthLevel = (parentItem as any)?.authLevel ?? (parentItem as any)?.level ?? level;
    
    // Solo bloquear si hay límite de profundidad Y el nivel es >= 3
    if (hasDepthLimit && parentAuthLevel >= 3) {
      return;
    }

    setParentLoading(prev => ({ ...prev, [parentUserId]: true }));
    try {
      // Usar subtree para cargar los hijos
      const subtree = await getDescendantSubtree({ 
        descendantId: parentUserId, 
        maxDepth: maxDepth, 
        limit: usersLimit, 
        offset: 0 
      });
      const sdata = (subtree as any)?.data ?? subtree;
      const directUsers = (sdata?.users || []).filter((u: any) => (u.levelInSubtree ?? 1) === 1);
      const users = directUsers.map((u: any) => {
        const authLevel = hasDepthLimit ? Math.min(3, parentAuthLevel + 1) : parentAuthLevel + 1;
        return {
          id: u.userId,
          name: u.fullName || u.email,
          email: u.email,
          createdAt: u.createdAt,
          levelInSubtree: 1,
          level: authLevel,
          authLevel,
          totalDescendants: u.totalDescendants || 0,
          hasDescendants: u.hasDescendants ?? (u.totalDescendants || 0) > 0,
          comisionesGeneradas: u.comisiones_generadas,
          volumen: typeof u.volumen === 'number' 
            ? u.volumen 
            : (typeof u.volumen === 'string' 
                ? parseFloat(u.volumen) || 0 
                : (u.volumen ?? 0)),
        };
      });
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: users }));
      // Usar hasMore del API si está disponible, sino calcular basándose en totalDescendants
      const apiHasMore = sdata?.hasMore !== undefined ? sdata.hasMore : null;
      const totalDirect = sdata?.totalDescendants ?? users.length;
      // Si el API dice hasMore: false, no hay más. Si es true o null, calcular
      const hasMore = apiHasMore === false ? false : (apiHasMore === true ? true : (users.length < totalDirect));
      setParentOffsets(prev => ({ ...prev, [parentUserId]: users.length }));
      setParentHasMore(prev => ({ ...prev, [parentUserId]: hasMore }));
      setParentExhausted(prev => ({ ...prev, [parentUserId]: users.length === 0 && !hasMore }));
      setParentErrors(prev => {
        const next = { ...prev };
        delete next[parentUserId];
        return next;
      });
    } catch (e) {
      console.error('Error cargando hijos', e);
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: [] }));
      setParentOffsets(prev => {
        const next = { ...prev };
        delete next[parentUserId];
        return next;
      });
      setParentHasMore(prev => ({ ...prev, [parentUserId]: false }));
      setParentExhausted(prev => {
        const next = { ...prev };
        delete next[parentUserId];
        return next;
      });
      const status = (e as any)?.status;
      setParentErrors(prev => ({
        ...prev,
        [parentUserId]: status === 403
          ? t('network:messages.noMoreUsers')
          : t('network:errors.loadError')
      }));
    } finally {
      setParentLoading(prev => {
        const next = { ...prev };
        delete next[parentUserId];
        return next;
      });
    }
  }, [subtreeUsers, allSubtreeUsers, hasDepthLimit, maxDepth, usersLimit, childrenByParent]);

  // Función para cargar más hijos
  const handleLoadMoreChildren = useCallback(async (parentId: number, parentLevel: number) => {
    if (parentExhausted[parentId] || parentLoading[parentId]) return;

    const currentOffset = parentOffsets[parentId] || 0;
    setParentLoading(prev => ({ ...prev, [parentId]: true }));

    try {
      const subtree = await getDescendantSubtree({ 
        descendantId: parentId, 
        maxDepth: maxDepth, 
        limit: usersLimit, 
        offset: currentOffset 
      });
      const sdata = (subtree as any)?.data ?? subtree;
      const directUsers = (sdata?.users || []).filter((u: any) => (u.levelInSubtree ?? 1) === 1);
      const users = directUsers.map((u: any) => {
        const authLevel = hasDepthLimit ? Math.min(3, parentLevel + 1) : parentLevel + 1;
        return {
          id: u.userId,
          name: u.fullName || u.email,
          email: u.email,
          createdAt: u.createdAt,
          levelInSubtree: 1,
          level: authLevel,
          authLevel,
          totalDescendants: u.totalDescendants || 0,
          hasDescendants: u.hasDescendants ?? (u.totalDescendants || 0) > 0,
          comisionesGeneradas: u.comisiones_generadas,
          volumen: typeof u.volumen === 'number' 
            ? u.volumen 
            : (typeof u.volumen === 'string' 
                ? parseFloat(u.volumen) || 0 
                : (u.volumen ?? 0)),
        };
      });

      setChildrenByParent(prev => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), ...users]
      }));
      // Usar hasMore del API si está disponible, sino calcular basándose en totalDescendants
      const apiHasMore = sdata?.hasMore !== undefined ? sdata.hasMore : null;
      const totalDirect = sdata?.totalDescendants ?? 0;
      const newOffset = currentOffset + users.length;
      // Si el API dice hasMore: false, no hay más. Si es true o null, calcular
      const hasMore = apiHasMore === false ? false : (apiHasMore === true ? true : (newOffset < totalDirect));
      setParentOffsets(prev => ({ ...prev, [parentId]: newOffset }));
      setParentHasMore(prev => ({ ...prev, [parentId]: hasMore }));
      setParentExhausted(prev => ({ ...prev, [parentId]: !hasMore }));
      setParentErrors(prev => {
        const next = { ...prev };
        delete next[parentId];
        return next;
      });
    } catch (e) {
      console.error('Error cargando más hijos', e);
      setParentErrors(prev => ({
        ...prev,
        [parentId]: t('network:errors.loadError')
      }));
    } finally {
      setParentLoading(prev => {
        const next = { ...prev };
        delete next[parentId];
        return next;
      });
    }
  }, [hasDepthLimit, maxDepth, usersLimit, parentOffsets, parentExhausted, parentLoading, childrenByParent]);

  const handleBack = () => {
    // Limpiar el ID del árbol al volver
    sessionStorage.removeItem('networkTreeUserId');
    navigate('/network');
  };

  const activeTab = userModel || 'b2c';

  if (!userId) {
    return (
      <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
        <KivoMainBg className="absolute inset-0 z-0" />
        <SidebarApp />
        <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-8 pt-16 lg:pt-0">
          <DashboardNavbar title={t('network:networkTree.title')} />
          <div className="flex items-center justify-center h-full">
            <span className="text-[#ff6d64]">{t('network:errors.invalidUserId')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      <KivoMainBg className="absolute inset-0 z-0" />
      <SidebarApp />

      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-hidden pb-0 pt-16 lg:pt-0">
        <DashboardNavbar 
          title={subtreeRootName ? t('network:networkOf', { name: subtreeRootName }) : t('network:title')}
        />

        {/* Overlay con animación Lottie cuando está cargando */}
        {showLoader && (
          <div className="absolute inset-0 bg-[#2a2a2a] z-[9999] flex items-center justify-center">
            <LottieLoader className="w-32 h-32 lg:w-48 lg:h-48" />
          </div>
        )}
        {loading ? null : error ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[#ff6d64]">{error}</span>
          </div>
        ) : (
          <div className="relative z-20 mt-4 mb-0 flex flex-col flex-1 min-h-0">
            {/* Breadcrumb con nivel - alineado a la izquierda, y nombre/correo a la derecha */}
            {subtreeRootName && (
              <div className="mt-2 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 text-white text-sm">
                {/* History alineado a la izquierda - 2 elementos por fila en móvil */}
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  {/* Fila 1: B2B Network General → Level X */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleBack}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {t('network:networkGeneral', { tab: activeTab.toUpperCase() })}
                    </button>
                    <SingleArrowHistory className="mx-2" />
                    <span className="font-bold">{t('network:level')} {subtreeRootLevel}</span>
                  </div>
                  {/* Fila 2: Level X → Nombre (solo en móvil) */}
                  <div className="flex items-center gap-2 md:hidden">
                    <span className="font-bold">{t('network:level')} {subtreeRootLevel}</span>
                    <SingleArrowHistory className="mx-2" />
                    <span className="font-normal">{subtreeRootName}</span>
                  </div>
                  {/* Nombre en desktop */}
                  <div className="hidden md:flex items-center gap-2">
                    <SingleArrowHistory className="mx-2" />
                    <span className="font-normal">{subtreeRootName}</span>
                  </div>
                </div>
                
                {/* Email alineado a la derecha */}
                {subtreeRootEmail && (
                  <div className="flex items-start md:items-end">
                    <span className="text-gray-400 text-sm">{subtreeRootEmail}</span>
                  </div>
                )}
              </div>
            )}

            {/* MiniBaners con estadísticas */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MiniBaner 
                className="h-[90px] md:h-[100px] lg:h-[110px]"
                icon={<MoneyIcon size={24} />}
                detail={subtreeSummary ? subtreeSummary.activeReferrals.toString() : "0"}
                subtitle={t('network:stats.activeReferrals')}
                showDollarSign={false}
              />
              <MiniBaner 
                className="h-[90px] md:h-[100px] lg:h-[110px]"
                icon={<MoneyIcon size={24} />}
                detail={subtreeSummary ? formatCurrencyWithThreeDecimals(subtreeSummary.lastMonthCommissions) : "0"}
                subtitle={t('network:stats.lastMonthCommissions')}
              />
              <MiniBaner 
                className="h-[90px] md:h-[100px] lg:h-[110px]"
                icon={<MoneyIcon size={24} />}
                detail={subtreeSummary ? formatCurrencyWithThreeDecimals(subtreeSummary.totalVolume) : "0"}
                subtitle={t('network:stats.totalVolume')}
              />
            </div>

            {/* Header de la tabla */}
            <div className="mb-4">
              <NetworkTableHeader activeTab={activeTab} />
            </div>

            {/* Contenido scrollable de la tabla */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="pr-4">
                <NetworkTable
                  items={subtreeUsers}
                  activeTab={activeTab}
                  activeLevel={subtreeRootLevel as 1 | 2 | 3}
                  onToggleExpand={handleToggleExpand}
                  childrenByParent={childrenByParent}
                  onViewTree={(id) => {
                    sessionStorage.setItem('networkTreeUserId', id.toString());
                    // Forzar recarga del componente navegando primero a /network y luego a /network/tree
                    // O simplemente recargar la página actual
                    window.location.href = '/network/tree';
                  }}
                  disableViewTree={false}
                  hasDepthLimit={hasDepthLimit}
                  maxDepth={maxDepth}
                  onLoadMoreChildren={handleLoadMoreChildren}
                  parentHasMore={parentHasMore}
                  parentLoading={parentLoading}
                  loadingTreeUserId={null}
                  parentExhausted={parentExhausted}
                  parentErrors={parentErrors}
                />
              </div>
            </ScrollArea>

            {/* Paginación al fondo fija dentro del área de contenido */}
            {subtreeTotal > 0 && (
              <div className="pt-3 pb-6">
                <NetworkPaginationBar
                  currentPage={subtreePage}
                  totalItems={subtreeTotal}
                  usersLimit={usersLimit}
                  onChangePage={(page: number) => {
                    setSubtreePage(page);
                    const offset = (page - 1) * usersLimit;
                    const pageUsers = allSubtreeUsers.slice(offset, offset + usersLimit);
                    setSubtreeUsers(pageUsers);
                  }}
                  onChangeLimit={(limit: number) => {
                    setUsersLimit(limit);
                    setSubtreePage(1);
                    // Recalcular la primera página con el nuevo límite
                    const pageUsers = allSubtreeUsers.slice(0, limit);
                    setSubtreeUsers(pageUsers);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* SVG de esquina */}
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

export default NetworkTree;

