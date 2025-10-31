import React, { useEffect, useMemo, useState } from 'react';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import NetworkTabs from '../components/molecules/NetworkTabs';
import NetworkFilter from '../components/molecules/NetworkFilter';
import NetworkTable from '../components/organisms/NetworkTable';
import NetworkPaginationBar from '../components/organisms/NetworkPaginationBar';
import NetworkTableHeader from '../components/organisms/NetworkTableHeader';
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
  const [subtreeUsers, setSubtreeUsers] = useState<Array<{ id: number; name: string; email?: string; createdAt?: string; levelInSubtree: number }>>([]);
  const [subtreeRootId, setSubtreeRootId] = useState<number | null>(null);
  const [subtreeTotal, setSubtreeTotal] = useState(0);
  const [subtreePage, setSubtreePage] = useState(1);
  const [parentOffsets, setParentOffsets] = useState<Record<number, number>>({});
  const [parentHasMore, setParentHasMore] = useState<Record<number, boolean>>({});
  const [parentLoading, setParentLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setUsersOffset((currentPage - 1) * usersLimit);
  }, [currentPage, usersLimit]);

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
      try {
        const offset = (subtreePage - 1) * usersLimit;
        const res = await getDescendantSubtree({ descendantId: subtreeRootId, maxDepth: 3, limit: usersLimit, offset });
        const sdata: any = (res as any)?.data ?? res;
        const users = (sdata?.users || []).map((u: any) => ({
          id: u.userId,
          name: u.fullName || u.email,
          email: u.email,
          createdAt: u.createdAt,
          levelInSubtree: u.levelInSubtree,
        }));
        setSubtreeUsers(users);
        setSubtreeTotal(sdata?.totalDescendants || users.length || 0);
      } catch (e) {
        console.error('Error cargando sub-árbol (paginación)', e);
        setSubtreeUsers([]);
      }
    };
    loadSubtree();
  }, [subtreeMode, subtreeRootId, subtreePage, usersLimit]);

  const tableItems = useMemo(() => {
    if (subtreeMode) {
      return subtreeUsers.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, levelInSubtree: u.levelInSubtree }));
    }
    const lvl = levels.find(l => l.level === activeLevel);
    const users = lvl?.users || [];
    return users.map(u => ({ id: u.user_id, name: u.user_full_name || u.user_email, email: u.user_email, createdAt: u.user_created_at }));
  }, [levels, activeLevel, subtreeMode, subtreeUsers]);

  const handleToggleExpand = async (parentUserId: number, level: number) => {
    // Toggle: si existe array -> colapsar (eliminar), si no -> expandir
    if (Array.isArray(childrenByParent[parentUserId])) {
      setChildrenByParent(prev => {
        const next = { ...prev };
        delete next[parentUserId];
        return next;
      });
      return;
    }
    // Encontrar siguiente nivel ya cargado y filtrar por direct_parent_id
    const nextLevelNum = (level + 1) as 1 | 2 | 3;
    const nextLevelData = levels.find(l => l.level === nextLevelNum);
    if (nextLevelData && nextLevelData.users?.length) {
      const users = nextLevelData.users
        .filter(u => u.direct_parent_id === parentUserId)
        .map(u => ({ id: u.user_id, name: u.user_full_name || u.user_email, email: u.user_email, createdAt: u.user_created_at }));
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: users }));
      // No consultar subtree en la primera expansión para optimizar
      // Heurística: si alcanzó el límite por página o el nivel reporta más, mostrar "Cargar más"
      const levelHasMore = !!nextLevelData?.has_more_users_in_level;
      setParentHasMore(prev => ({ ...prev, [parentUserId]: levelHasMore || users.length >= usersLimit }));
      setParentOffsets(prev => ({ ...prev, [parentUserId]: prev[parentUserId] ?? users.length }));
      return;
    }
    // Si no está cargado el siguiente nivel, solicitarlo
    try {
      // Optimizado: usar /network (nivel) para la primera carga cuando no existe el siguiente nivel aún
      const res = await getNetwork({ levelStart: nextLevelNum, levelEnd: nextLevelNum, usersLimit, usersOffset: 0 });
      const data = (res as any)?.data ?? res;
      const lvl = data?.levels?.find((l: NetworkLevel) => l.level === nextLevelNum);
      const users = (lvl?.users || [])
        .filter((u: any) => u.direct_parent_id === parentUserId)
        .map((u: any) => ({ id: u.user_id, name: u.user_full_name || u.user_email, email: u.user_email, createdAt: u.user_created_at }));
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: users }));
      const levelHasMore = !!lvl?.has_more_users_in_level;
      setParentHasMore(prev => ({ ...prev, [parentUserId]: levelHasMore || users.length >= usersLimit }));
      setParentOffsets(prev => ({ ...prev, [parentUserId]: users.length }));
    } catch (e) {
      console.error('Error cargando hijos', e);
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: [] }));
    }
  };

  const handleLoadMoreChildren = async (parentId: number, parentLevel: number) => {
    try {
      const nextOffset = (parentOffsets[parentId] ?? 0);
      setParentLoading(prev => ({ ...prev, [parentId]: true }));
      const subtree = await getDescendantSubtree({ descendantId: parentId, maxDepth: 1, limit: usersLimit, offset: nextOffset });
      const sdata = (subtree as any)?.data ?? subtree;
      const newChildren = (sdata?.users || []).map((u: any) => ({ id: u.userId, name: u.fullName || u.email, email: u.email, createdAt: u.createdAt }));
      setChildrenByParent(prev => {
        const existing = prev[parentId] || [];
        const existingIds = new Set(existing.map((c: any) => c.id));
        const merged = [...existing];
        newChildren.forEach((c: any) => { if (!existingIds.has(c.id)) merged.push(c); });
        return { ...prev, [parentId]: merged };
      });
      const totalDirect = sdata?.totalDescendants ?? 0;
      const newOffset = nextOffset + newChildren.length;
      setParentOffsets(prev => ({ ...prev, [parentId]: newOffset }));
      setParentHasMore(prev => ({ ...prev, [parentId]: newOffset < totalDirect }));
    } catch (e) {
      console.error('Error cargando más hijos', e);
    } finally {
      setParentLoading(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleViewTree = async (userId: number) => {
    try {
      const res = await getDescendantSubtree({ descendantId: userId, maxDepth: 3, limit: usersLimit, offset: 0 });
      const data: any = (res as any)?.data ?? res;
      const users = (data?.users || []).map((u: any) => ({
        id: u.userId,
        name: u.fullName || u.email,
        email: u.email,
        createdAt: u.createdAt,
        levelInSubtree: u.levelInSubtree,
      }));
      setSubtreeMode(true);
      setSubtreeRootId(userId);
      setSubtreeUsers(users);
      setSubtreeTotal(data?.totalDescendants || users.length || 0);
      setSubtreePage(1);
      setChildrenByParent({});
    } catch (e) {
      console.error('Error cargando sub-árbol', e);
      setSubtreeMode(true);
      setSubtreeRootId(userId);
      setSubtreeUsers([]);
      setSubtreeTotal(0);
      setSubtreePage(1);
      setChildrenByParent({});
    }
  };

  const totalItemsLevel1 = useMemo(() => {
    const lvl1 = levels.find(l => l.level === 1);
    return lvl1?.total_users_in_level || 0;
  }, [levels]);

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-hidden pb-0 pt-16 lg:pt-0">
        {/* Navbar responsivo */}
        <DashboardNavbar title="Red" />

        {/* Contenido de Red */}
        <div className="relative z-20 mt-4 mb-0 flex flex-col flex-1 min-h-0">
          {/* Navbar con tabs B2C, B2B, B2T */}
          <NetworkTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Línea divisoria debajo de los tabs */}
          <div className="mt-4">
            <div 
              className="w-full h-[1px] flex-none"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            />
          </div>

          {/* Sección de filtro y tabs de nivel */}
          <div className="mt-4 mb-3">
            <NetworkFilter
              searchFilter={searchFilter}
              activeLevel={activeLevel}
              onSearchChange={setSearchFilter}
              onLevelChange={setActiveLevel}
            />
          </div>

          {/* Contenido scrollable de la tabla */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Header de columnas */}
            <NetworkTableHeader />

            {/* Tabla con filas */}
            <NetworkTable 
              items={tableItems} 
              activeTab={activeTab}
              activeLevel={activeLevel}
              onToggleExpand={handleToggleExpand}
              childrenByParent={childrenByParent}
              childIndentPx={30}
              onViewTree={handleViewTree}
              disableExpand={subtreeMode}
              onLoadMoreChildren={handleLoadMoreChildren}
              parentHasMore={parentHasMore}
              parentLoading={parentLoading}
            />
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
                totalItems={totalItemsLevel1} 
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

