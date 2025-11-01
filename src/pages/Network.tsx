import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import NetworkTabs from '../components/molecules/NetworkTabs';
import NetworkFilter from '../components/molecules/NetworkFilter';
import NetworkTable from '../components/organisms/NetworkTable';
import NetworkPaginationBar from '../components/organisms/NetworkPaginationBar';
import NetworkTableHeader from '../components/organisms/NetworkTableHeader';
import MiniBaner from '../components/atoms/MiniBaner';
import SingleArrowHistory from '../components/atoms/SingleArrowHistory';
import MoneyIcon from '../components/atoms/MoneyIcon';
import { Spinner } from '@/components/ui/spinner';
import { getNetwork, getDescendantSubtree } from '@/services/network';
import { NetworkLevel } from '@/types/network';

const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b' | 'b2t'>('b2c');
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [searchFilter, setSearchFilter] = useState('');

  const [levels, setLevels] = useState<NetworkLevel[]>([]);
  const [totalDescendants, setTotalDescendants] = useState(0);
  const [usersLimit, setUsersLimit] = useState(5);
  const [usersOffset, setUsersOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [childrenByParent, setChildrenByParent] = useState<Record<number, any[]>>({});
  const [subtreeMode, setSubtreeMode] = useState(false);
  const [subtreeUsers, setSubtreeUsers] = useState<Array<{ id: number; name: string; email?: string; createdAt?: string; levelInSubtree: number; authLevel: number; totalDescendants: number }>>([]);
  const [subtreeRootId, setSubtreeRootId] = useState<number | null>(null);
  const [subtreeTotal, setSubtreeTotal] = useState(0);
  const [subtreePage, setSubtreePage] = useState(1);
  const [subtreeRootName, setSubtreeRootName] = useState<string>('');
  const [subtreeRootLevel, setSubtreeRootLevel] = useState<number>(1);
  const [parentOffsets, setParentOffsets] = useState<Record<number, number>>({});
  const [parentHasMore, setParentHasMore] = useState<Record<number, boolean>>({});
  const [parentLoading, setParentLoading] = useState<Record<number, boolean>>({});
  const [parentExhausted, setParentExhausted] = useState<Record<number, boolean>>({});
  const [parentErrors, setParentErrors] = useState<Record<number, string>>({});
  const [loadingTreeUserId, setLoadingTreeUserId] = useState<number | null>(null);
  const [pendingTreeUserId, setPendingTreeUserId] = useState<number | null>(null);
  const historyReadyRef = useRef(false);
  const suppressHistoryPushRef = useRef(false);
  const skipNextSubtreeFetchRef = useRef(false);

  useEffect(() => {
    setUsersOffset((currentPage - 1) * usersLimit);
  }, [currentPage, usersLimit]);

  useEffect(() => {
    if (!subtreeMode && searchFilter.trim().length > 0) {
      setChildrenByParent({});
      setParentOffsets({});
      setParentHasMore({});
      setParentLoading({});
      setParentExhausted({});
      setParentErrors({});
    }
  }, [searchFilter, subtreeMode]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNetwork({
          levelStart: 1,
          levelEnd: 3,
          usersLimit,
          usersOffset,
        });
        const data = (res as any)?.data ?? res?.data; // compatibilidad apiService
        if (data) {
          setLevels(data.levels || []);
          setTotalDescendants(data.total_descendants || 0);
          setSubtreeMode(false);
          setSubtreeUsers([]);
          setSubtreeRootId(null);
          setSubtreeTotal(0);
          setSubtreePage(1);
          setParentExhausted({});
          setParentErrors({});
        }
      } catch (e) {
        console.error('Error cargando red', e);
        setLevels([]);
        setTotalDescendants(0);
      }
    };
    load();
  }, [activeLevel, usersLimit, usersOffset]);

  // Paginación del subárbol
  useEffect(() => {
    const loadSubtree = async () => {
      if (!subtreeMode || !subtreeRootId) return;
      if (skipNextSubtreeFetchRef.current) {
        skipNextSubtreeFetchRef.current = false;
        return;
      }
      try {
        const offset = (subtreePage - 1) * usersLimit;
        const res = await getDescendantSubtree({ descendantId: subtreeRootId, maxDepth: 3, limit: usersLimit, offset });
        const sdata: any = (res as any)?.data ?? res;
        const users = (sdata?.users || []).map((u: any) => {
          const levelInSubtree = u.levelInSubtree ?? 1;
          const authLevel = Math.min(3, subtreeRootLevel + levelInSubtree - 1);
          return {
            id: u.userId,
            name: u.fullName || u.email,
            email: u.email,
            createdAt: u.createdAt,
            levelInSubtree,
            authLevel,
            totalDescendants: u.totalDescendants || 0,
          };
        });
        setSubtreeUsers(users);
        setSubtreeTotal(sdata?.totalDescendants || users.length || 0);
      } catch (e) {
        console.error('Error cargando sub-árbol (paginación)', e);
        setSubtreeUsers([]);
      }
    };
    loadSubtree();
  }, [subtreeMode, subtreeRootId, subtreePage, usersLimit, subtreeRootLevel]);

  const allLevelItems = useMemo(() => {
    return levels.flatMap((levelGroup) =>
      (levelGroup.users || []).map((u) => ({
        id: u.user_id,
        name: u.user_full_name || u.user_email,
        email: u.user_email,
        createdAt: u.user_created_at,
        level: levelGroup.level,
        authLevel: levelGroup.level,
        totalDescendants: u.total_descendants_of_user || 0,
      }))
    );
  }, [levels]);

  const baseItems = useMemo(() => {
    if (subtreeMode) {
      return subtreeUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        levelInSubtree: u.levelInSubtree,
        level: u.levelInSubtree,
        authLevel: u.authLevel,
        totalDescendants: u.totalDescendants || 0,
      }));
    }

    return allLevelItems.filter((item) => item.level === activeLevel);
  }, [subtreeMode, subtreeUsers, allLevelItems, activeLevel]);

  const displayedItems = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    if (!query) {
      return baseItems;
    }

    const dataset = subtreeMode ? baseItems : allLevelItems;
    return dataset.filter((item) => {
      const valuesToSearch = [item.email, item.name];
      return valuesToSearch.some((value) => value?.toLowerCase().includes(query));
    });
  }, [baseItems, allLevelItems, searchFilter, subtreeMode]);

  const hasSearch = searchFilter.trim().length > 0;

  const handleToggleExpand = async (parentUserId: number, level: number) => {
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
    const parentDataset = subtreeMode ? baseItems : allLevelItems;
    const parentItem = parentDataset.find(item => item.id === parentUserId);
    const parentAuthLevel = (parentItem as any)?.authLevel ?? (parentItem as any)?.level ?? level;
    if (parentAuthLevel >= 3) {
      return;
    }

    setParentLoading(prev => ({ ...prev, [parentUserId]: true }));
    try {
      const subtree = await getDescendantSubtree({ descendantId: parentUserId, maxDepth: 3, limit: usersLimit, offset: 0 });
      const sdata = (subtree as any)?.data ?? subtree;
      const directUsers = (sdata?.users || []).filter((u: any) => (u.levelInSubtree ?? 1) === 1);
      const users = directUsers.map((u: any) => {
        const authLevel = Math.min(3, parentAuthLevel + 1);
        return {
          id: u.userId,
          name: u.fullName || u.email,
          email: u.email,
          createdAt: u.createdAt,
          levelInSubtree: 1,
          level: authLevel,
          authLevel,
          totalDescendants: u.totalDescendants || 0,
        };
      });
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: users }));
      const totalDirect = sdata?.totalDescendants ?? users.length;
      const hasMore = users.length < totalDirect;
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
          ? 'No hay más usuarios por mostrar.'
          : 'No se pudieron cargar los usuarios de este nivel.'
      }));
    } finally {
      setParentLoading(prev => ({ ...prev, [parentUserId]: false }));
    }
  };

  const handleLoadMoreChildren = async (parentId: number, parentLevel: number) => {
    try {
      const currentOffset = parentOffsets[parentId] ?? 0;
      setParentLoading(prev => ({ ...prev, [parentId]: true }));
      const subtree = await getDescendantSubtree({ descendantId: parentId, maxDepth: 3, limit: usersLimit, offset: currentOffset });
      const sdata = (subtree as any)?.data ?? subtree;
      const directUsers = (sdata?.users || []).filter((u: any) => (u.levelInSubtree ?? 1) === 1);
      const newChildren = directUsers.map((u: any) => {
        const authLevel = Math.min(3, parentLevel + 1);
        return {
          id: u.userId,
          name: u.fullName || u.email,
          email: u.email,
          createdAt: u.createdAt,
          levelInSubtree: 1,
          level: authLevel,
          authLevel,
          totalDescendants: u.totalDescendants || 0,
        };
      });
      setChildrenByParent(prev => {
        const existing = prev[parentId] || [];
        const existingIds = new Set(existing.map((c: any) => c.id));
        const merged = [...existing];
        newChildren.forEach((c: any) => { if (!existingIds.has(c.id)) merged.push(c); });
        return { ...prev, [parentId]: merged };
      });
      const totalDirect = sdata?.totalDescendants ?? 0;
      const noNewUsers = newChildren.length === 0;
      const nextOffset = currentOffset + usersLimit;
      setParentOffsets(prev => ({ ...prev, [parentId]: nextOffset }));
      setParentHasMore(prev => ({ ...prev, [parentId]: !noNewUsers && nextOffset < totalDirect }));
      setParentExhausted(prev => ({ ...prev, [parentId]: noNewUsers }));
      if (noNewUsers) {
        setParentErrors(prev => {
          const next = { ...prev };
          delete next[parentId];
          return next;
        });
      } else {
        setParentErrors(prev => {
          const next = { ...prev };
          delete next[parentId];
          return next;
        });
      }
    } catch (e) {
      console.error('Error cargando más hijos', e);
      const status = (e as any)?.status;
      if (status === 403) {
        setParentHasMore(prev => ({ ...prev, [parentId]: false }));
        setParentExhausted(prev => ({ ...prev, [parentId]: true }));
        setParentErrors(prev => ({ ...prev, [parentId]: 'No hay más usuarios por mostrar.' }));
      } else {
        setParentErrors(prev => ({ ...prev, [parentId]: 'Error al cargar más usuarios. Intenta nuevamente.' }));
      }
    } finally {
      setParentLoading(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const loadTreeForUser = useCallback(async (userId: number) => {
    setLoadingTreeUserId(userId);
    try {
      // Buscar el usuario en la lista actual para obtener su información
      const lookupDataset = subtreeMode ? baseItems : allLevelItems;
      const userItem = lookupDataset.find(item => item.id === userId);
      if (!userItem) {
        return;
      }
      const userLevel = (userItem as any)?.authLevel ?? (userItem as any)?.level ?? activeLevel;
      const userName = userItem?.name || 'Usuario';

      if (userLevel >= 3) {
        return;
      }
      
      const res = await getDescendantSubtree({ descendantId: userId, maxDepth: 3, limit: usersLimit, offset: 0 });
      const data: any = (res as any)?.data ?? res;
      const requesterLevel = typeof data?.requesterLevelToDescendant === 'number' && data.requesterLevelToDescendant > 0
        ? data.requesterLevelToDescendant
        : userLevel;
      const rootLevel = Math.min(3, requesterLevel);
      const users = (data?.users || []).map((u: any) => {
        const levelInSubtree = u.levelInSubtree ?? 1;
        const authLevel = Math.min(3, rootLevel + levelInSubtree);
        return {
          id: u.userId,
          name: u.fullName || u.email,
          email: u.email,
          createdAt: u.createdAt,
          levelInSubtree,
          authLevel,
          totalDescendants: u.totalDescendants || 0,
        };
      });
      skipNextSubtreeFetchRef.current = true;
      setSubtreeMode(true);
      setSubtreeRootId(userId);
      setSubtreeRootName(userName);
      setSubtreeRootLevel(rootLevel);
      setSubtreeUsers(users);
      setSubtreeTotal(data?.totalDescendants || users.length || 0);
      setSubtreePage(1);
      setChildrenByParent({});
      setParentExhausted({});
    } catch (e) {
      console.error('Error cargando sub-árbol', e);
      const lookupDatasetFallback = subtreeMode ? baseItems : allLevelItems;
      const userItem = lookupDatasetFallback.find(item => item.id === userId);
      setSubtreeMode(true);
      setSubtreeRootId(userId);
      setSubtreeRootName(userItem?.name || 'Usuario');
      setSubtreeRootLevel((userItem as any)?.authLevel ?? (userItem as any)?.level ?? activeLevel);
      setSubtreeUsers([]);
      setSubtreeTotal(0);
      setSubtreePage(1);
      setChildrenByParent({});
    } finally {
      setLoadingTreeUserId(null);
    }
  }, [activeLevel, allLevelItems, baseItems, subtreeMode, usersLimit]);

  const handleViewTree = (userId: number) => {
    const lookupDataset = subtreeMode ? baseItems : allLevelItems;
    const userItem = lookupDataset.find(item => item.id === userId);
    if (!userItem) {
      return;
    }
    const userLevel = (userItem as any)?.authLevel ?? (userItem as any)?.level ?? activeLevel;

    if (userLevel >= 3) {
      return;
    }

    if (searchFilter.trim()) {
      setSearchFilter('');
      setPendingTreeUserId(userId);
      return;
    }

    void loadTreeForUser(userId);
  };

  useEffect(() => {
    if (pendingTreeUserId === null) return;
    if (searchFilter.trim()) return;

    const userId = pendingTreeUserId;
    setPendingTreeUserId(null);
    void loadTreeForUser(userId);
  }, [pendingTreeUserId, searchFilter, loadTreeForUser]);

  useEffect(() => {
    const state = {
      app: 'network',
      tab: activeTab,
      level: activeLevel,
      mode: subtreeMode ? 'subtree' : 'list',
      subtreeRootId,
      subtreeRootName,
      subtreeRootLevel,
      subtreePage,
    } as const;

    if (!historyReadyRef.current) {
      window.history.replaceState(state, '');
      historyReadyRef.current = true;
      return;
    }

    if (suppressHistoryPushRef.current) {
      window.history.replaceState(state, '');
      window.setTimeout(() => {
        suppressHistoryPushRef.current = false;
      }, 0);
      return;
    }

    window.history.pushState(state, '');
  }, [activeTab, activeLevel, subtreeMode, subtreeRootId, subtreeRootName, subtreeRootLevel, subtreePage]);

  const handleBackToNetwork = useCallback(() => {
    setSubtreeMode(false);
    setSubtreeUsers([]);
    setSubtreeRootId(null);
    setSubtreeRootName('');
    setSubtreeRootLevel(1);
    setSubtreeTotal(0);
    setSubtreePage(1);
    setChildrenByParent({});
    setParentExhausted({});
    setParentErrors({});
      setParentErrors({});
  }, []);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state || state.app !== 'network') {
        return;
      }

      suppressHistoryPushRef.current = true;

      const targetLevel = state.level ?? 1;
      const targetTab = state.tab ?? 'b2c';
      const mode = state.mode ?? 'list';
      const targetSubtreeId = state.subtreeRootId as number | null | undefined;

      if (activeTab !== targetTab) {
        setActiveTab(targetTab);
      }

      if (activeLevel !== targetLevel) {
        setActiveLevel(targetLevel);
      }

      if (mode === 'subtree' && targetSubtreeId) {
        setSearchFilter('');
        setPendingTreeUserId(null);
        void loadTreeForUser(targetSubtreeId);
      } else {
        setPendingTreeUserId(null);
        if (subtreeMode) {
          handleBackToNetwork();
        }
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeLevel, activeTab, handleBackToNetwork, loadTreeForUser, subtreeMode]);

  const totalItemsLevel1 = useMemo(() => {
    const lvl1 = levels.find(l => l.level === 1);
    if (!lvl1) return 0;
    
    // Si has_more es true, sabemos que hay más usuarios
    if (lvl1.has_more_users_in_level) {
      // Estimamos: usuarios mostrados + al menos una página completa más
      const estimated = lvl1.users.length + usersLimit;
      // Usamos el máximo entre el total reportado y nuestra estimación
      return Math.max(lvl1.total_users_in_level || 0, estimated);
    }
    
    // Si no hay más (has_more = false) pero el total reportado es menor que usuarios mostrados,
    // o si usuarios mostrados alcanzan exactamente el límite, puede haber más usuarios
    // En ese caso, estimamos que hay al menos una página más
    if (lvl1.users.length >= usersLimit) {
      // Si mostramos el límite completo, podría haber más aunque has_more sea false
      // Estimamos conservadoramente: usuarios mostrados + 1 página más
      const estimated = lvl1.users.length + usersLimit;
      return Math.max(lvl1.total_users_in_level || 0, estimated);
    }
    
    // Si no hay más y no alcanzamos el límite, usamos el máximo entre usuarios mostrados y total reportado
    return Math.max(lvl1.users.length, lvl1.total_users_in_level || lvl1.users.length);
  }, [levels, usersLimit]);

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-hidden pb-0 pt-16 lg:pt-0">
        {/* Navbar responsivo */}
        <DashboardNavbar title={subtreeMode && subtreeRootName ? `Red de ${subtreeRootName}` : "Red"} />

        {/* Contenido de Red */}
        <div className="relative z-20 mt-4 mb-0 flex flex-col flex-1 min-h-0">
          {/* Breadcrumb cuando está en modo subárbol - debajo del título amarillo */}
          {subtreeMode && (
            <div className="mb-0 flex items-center text-white text-sm">
              <button 
                onClick={handleBackToNetwork}
                className="text-white hover:opacity-80 transition-opacity"
              >
                Red {activeTab.toUpperCase()} General
              </button>
              <SingleArrowHistory className="mx-2" />
              <span className="font-bold">Nivel {subtreeRootLevel}</span>
              <SingleArrowHistory className="mx-2" />
              <span className="font-bold">{subtreeRootName}</span>
            </div>
          )}

          {/* Navbar con tabs B2C, B2B, B2T - solo mostrar cuando NO está en modo subárbol */}
          {!subtreeMode && <NetworkTabs activeTab={activeTab} onTabChange={setActiveTab} />}

          {/* Línea divisoria debajo de los tabs - solo cuando NO está en modo subárbol */}
          {!subtreeMode && (
            <div className="mt-4">
              <div 
                className="w-full h-[1px] flex-none"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              />
            </div>
          )}

          {/* Mini Banners cuando está en modo subárbol - 20px de separación desde el breadcrumb */}
          {subtreeMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6" style={{ marginTop: '20px' }}>
              <MiniBaner 
                className="h-[90px] md:h-[100px] lg:h-[110px]"
                icon={<MoneyIcon size={24} />}
                detail="0"
                subtitle="Referidos activos"
                showDollarSign={false}
              />
              <MiniBaner 
                className="h-[90px] md:h-[100px] lg:h-[110px]"
                icon={<MoneyIcon size={24} />}
                detail="0.00"
                subtitle="Comisiones último mes"
              />
              <MiniBaner 
                className="h-[90px] md:h-[100px] lg:h-[110px]"
                icon={<MoneyIcon size={24} />}
                detail="0.00"
                subtitle="Claims pendientes"
              />
            </div>
          )}

          {/* Sección de filtro y tabs de nivel */}
          <div className="mt-4 mb-3">
            <NetworkFilter
              searchFilter={searchFilter}
              activeLevel={activeLevel}
              onSearchChange={setSearchFilter}
              onLevelChange={setActiveLevel}
              showLevelTabs={!subtreeMode}
            />
          </div>

          {/* Contenido scrollable de la tabla */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Header de columnas */}
            <NetworkTableHeader />

            {/* Tabla con filas */}
            {displayedItems.length > 0 ? (
              <NetworkTable 
                items={displayedItems} 
                activeTab={activeTab}
                activeLevel={activeLevel}
                onToggleExpand={handleToggleExpand}
                childrenByParent={hasSearch ? {} : childrenByParent}
                childIndentPx={30}
                onViewTree={handleViewTree}
                disableExpand={subtreeMode || hasSearch}
                onLoadMoreChildren={handleLoadMoreChildren}
                parentHasMore={parentHasMore}
                parentLoading={parentLoading}
                loadingTreeUserId={loadingTreeUserId}
                parentExhausted={parentExhausted}
                parentErrors={parentErrors}
              />
            ) : (
              <div className="py-10 text-center text-sm text-white/60">
                {hasSearch ? 'Sin resultados para tu búsqueda.' : 'No hay usuarios disponibles.'}
              </div>
            )}
          </div>

          {/* Paginación al fondo fija dentro del área de contenido */}
          <div className="pt-3 pb-6">
            {subtreeMode ? (
              <NetworkPaginationBar 
                totalItems={subtreeTotal} 
                currentPage={subtreePage}
                usersLimit={usersLimit}
                onChangePage={setSubtreePage}
                onChangeLimit={(n) => { setUsersLimit(n); setSubtreePage(1); }}
              />
            ) : (
              <NetworkPaginationBar 
                totalItems={hasSearch ? displayedItems.length : totalItemsLevel1} 
                currentPage={currentPage}
                usersLimit={usersLimit}
                onChangePage={setCurrentPage}
                onChangeLimit={(n) => { setUsersLimit(n); setCurrentPage(1); }}
              />
            )}
          </div>
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

export default Network;

