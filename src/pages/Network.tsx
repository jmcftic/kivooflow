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
import {
  getNetwork,
  getDescendantSubtree,
  getSingleLevelNetwork,
  getB2CNetworkExcludingB2BB2T,
  getAvailableMlmModels,
  getB2BLeadersOwnedToB2C,
  getB2TLeadersOwnedToB2C,
} from '@/services/network';
import authService from '@/services/auth';
import {
  NetworkLevel,
  NetworkLeaderOwnedToB2C,
  NetworkLeadersPagination,
} from '@/types/network';

type NetworkTabId = 'b2c' | 'b2b' | 'b2t';

const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NetworkTabId>('b2c');
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [tabAvailability, setTabAvailability] = useState<Record<NetworkTabId, boolean>>({
    b2c: true,
    b2b: false,
    b2t: false,
  });
  const [userModel, setUserModel] = useState<NetworkTabId | null>(null);

  const [levels, setLevels] = useState<NetworkLevel[]>([]);
  const [totalDescendants, setTotalDescendants] = useState(0);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersOffset, setUsersOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [childrenByParent, setChildrenByParent] = useState<Record<number, any[]>>({});
  const [allChildrenByParent, setAllChildrenByParent] = useState<Record<number, any[]>>({});
  const [allSubtreeUsers, setAllSubtreeUsers] = useState<any[]>([]); // Para B2C en modo subtree
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
  const [b2cPagination, setB2cPagination] = useState<{ totalPages: number; currentPage: number; totalUsers: number } | null>(null);
  const hasSetInitialTabRef = useRef(false);
  const hasFetchedAvailableModelsRef = useRef(false);
  type LeaderTab = 'b2b' | 'b2t';
  type LeadersTabState = {
    leaders: NetworkLeaderOwnedToB2C[];
    total: number;
    pagination: NetworkLeadersPagination;
    limit: number;
    offset: number;
  };
  const [leadersByTab, setLeadersByTab] = useState<Partial<Record<LeaderTab, LeadersTabState>>>({});
  const [leadersLoading, setLeadersLoading] = useState(false);
  const [leadersError, setLeadersError] = useState<string | null>(null);
  const historyReadyRef = useRef(false);
  const suppressHistoryPushRef = useRef(false);
  const skipNextSubtreeFetchRef = useRef(false);
  const isLeaderTab = userModel === 'b2c' && (activeTab === 'b2b' || activeTab === 'b2t');
  
  // Usuario B2B en tab B2B no tiene límite de profundidad
  const hasDepthLimit = useMemo(() => {
    return !(userModel === 'b2b' && activeTab === 'b2b');
  }, [userModel, activeTab]);
  
  const maxDepth = useMemo(() => {
    return hasDepthLimit ? 3 : 999; // 999 como valor alto para representar sin límite
  }, [hasDepthLimit]);

  // Inicializar userModel desde localStorage como fallback (el endpoint lo actualizará)
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const rawModel = ((storedUser as any)?.mlm_model ??
      (storedUser as any)?.mlmModel ??
      (storedUser as any)?.network_model ??
      (storedUser as any)?.networkModel ??
      (storedUser as any)?.mlm?.data?.mlmCode) as string | undefined;

    const normalized = typeof rawModel === 'string' ? rawModel.trim().toLowerCase() : undefined;

    let resolvedModel: NetworkTabId | null = null;
    if (normalized === 'b2c') {
      resolvedModel = 'b2c';
    } else if (normalized === 'b2b' || normalized === 'btb') {
      resolvedModel = 'b2b';
    } else if (normalized === 'b2t') {
      resolvedModel = 'b2t';
    }

    // Solo establecer como fallback inicial una vez, el endpoint lo actualizará
    if (resolvedModel) {
      setUserModel(resolvedModel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  useEffect(() => {
    setUsersOffset((currentPage - 1) * usersLimit);
  }, [currentPage, usersLimit]);

  // Usar el endpoint available-model para TODOS los tipos de usuarios
  useEffect(() => {
    if (hasFetchedAvailableModelsRef.current) {
      return;
    }

    const fetchAvailableModels = async () => {
      try {
        const data = await getAvailableMlmModels();
        
        // Establecer el modelo del usuario desde el endpoint
        const normalizedModel = data.my_model?.trim().toLowerCase();
        if (normalizedModel === 'b2c' || normalizedModel === 'b2b' || normalizedModel === 'b2t') {
          setUserModel(normalizedModel as NetworkTabId);
        }
        
        // Establecer qué tabs están disponibles basándose en la respuesta del endpoint
        setTabAvailability({
          b2c: data.show_b2c_tab,
          b2b: data.show_b2b_tab,
          b2t: data.show_b2t_tab,
        });

        // Establecer el tab activo inicial si no se ha establecido aún
        if (!hasSetInitialTabRef.current) {
          const initialTab = 
            (data.show_b2c_tab && 'b2c') ||
            (data.show_b2b_tab && 'b2b') ||
            (data.show_b2t_tab && 'b2t') ||
            'b2c';
          setActiveTab(initialTab);
          hasSetInitialTabRef.current = true;
        }
      } catch (error) {
        console.error('Error obteniendo modelos disponibles', error);
      } finally {
        hasFetchedAvailableModelsRef.current = true;
      }
    };

    void fetchAvailableModels();
  }, []);

  useEffect(() => {
    if (tabAvailability[activeTab]) {
      return;
    }

    const fallbackTab = (tabAvailability.b2c && 'b2c') ||
      (tabAvailability.b2b && 'b2b') ||
      (tabAvailability.b2t && 'b2t') ||
      null;

    if (fallbackTab && fallbackTab !== activeTab) {
      setActiveTab(fallbackTab);
    }
  }, [tabAvailability, activeTab]);

  // Resetear página cuando cambia el nivel o el tab
  useEffect(() => { 
    setCurrentPage(1);
    setB2cPagination(null);
  }, [activeLevel, activeTab]);

  useEffect(() => {
    if (!subtreeMode && searchFilter.trim().length > 0) {
      setChildrenByParent({});
      setAllChildrenByParent({});
      setParentOffsets({});
      setParentHasMore({});
      setParentLoading({});
      setParentExhausted({});
      setParentErrors({});
    }
  }, [searchFilter, subtreeMode]);

  useEffect(() => {
    const load = async () => {
      // No cargar la red principal si estamos en modo subtree
      if (subtreeMode) {
        return;
      }
      
      // Esperar a que se haya obtenido el modelo del usuario desde el endpoint available-model
      // para evitar ejecutar el endpoint incorrecto (getNetwork) antes de saber el tipo de usuario
      if (!hasFetchedAvailableModelsRef.current || !userModel) {
        return;
      }
      
      try {
        // Lógica según tipo de usuario y tab activo
        // Usuario B2C: tab B2C usa excluding, tabs B2B/B2T usan owned
        // Usuario B2B: tab B2B usa single-level
        // Usuario B2T: tab B2T usa single-level
        
        // Usuario B2C en tab B2C: usar excluding
        if (userModel === 'b2c' && activeTab === 'b2c') {
          setLeadersLoading(false);
          setLeadersError(null);
          const res = await getB2CNetworkExcludingB2BB2T({
            level: activeLevel,
            limit: usersLimit,
            offset: usersOffset,
          });
          const data = res?.data;
          if (data) {
            // Convertir la respuesta B2C al formato NetworkLevel[]
            const b2cLevel: NetworkLevel = {
              level: data.level.level,
              total_users_in_level: data.level.totalUsers,
              active_users_in_level: data.level.activeUsers,
              has_more_users_in_level: data.pagination.hasNextPage,
              users: data.users.map(u => ({
                user_id: u.user_id,
                user_email: u.user_email,
                user_full_name: u.user_full_name,
                user_phone: u.user_phone,
                user_status: u.user_status,
                user_created_at: u.user_created_at,
                user_referral_code: u.user_referral_code,
                direct_parent_id: u.direct_parent_id,
                direct_parent_email: u.direct_parent_email,
                direct_parent_full_name: u.direct_parent_full_name,
                direct_parent_referral_code: u.direct_parent_referral_code,
                direct_referrals: u.direct_referrals,
                total_descendants_of_user: u.total_descendants_of_user,
                has_descendants: u.has_descendants,
              })),
            };
            setLevels([b2cLevel]);
            setTotalDescendants(data.summary.totalDescendants);
            setB2cPagination({
              totalPages: data.pagination.totalPages,
              currentPage: data.pagination.currentPage,
              totalUsers: data.level.totalUsers,
            });
            setSubtreeMode(false);
            setSubtreeUsers([]);
            setSubtreeRootId(null);
            setSubtreeTotal(0);
            setSubtreePage(1);
            setParentExhausted({});
            setParentErrors({});
          }
        } 
        // Usuario B2C en tabs B2B/B2T: usar owned
        else if (isLeaderTab && tabAvailability[activeTab]) {
          const leaderTab = activeTab as LeaderTab;
          setLevels([]);
          setTotalDescendants(0);
          setB2cPagination(null);
          setSubtreeMode(false);
          setSubtreeUsers([]);
          setSubtreeRootId(null);
          setSubtreeTotal(0);
          setSubtreePage(1);
          setChildrenByParent({});
          setAllChildrenByParent({});
          setParentExhausted({});
          setParentErrors({});

          setLeadersLoading(true);
          setLeadersError(null);

          const fetchFn = leaderTab === 'b2b' ? getB2BLeadersOwnedToB2C : getB2TLeadersOwnedToB2C;
          const result = await fetchFn({
            limit: usersLimit,
            offset: usersOffset,
          });

          setLeadersByTab(prev => ({
            ...prev,
            [leaderTab]: {
              leaders: result.leaders,
              total: result.total,
              pagination: result.pagination,
              limit: result.limit,
              offset: result.offset,
            },
          }));
          setLeadersLoading(false);
        } 
        // Usuario B2B en tab B2B o Usuario B2T en tab B2T: usar single-level
        else if ((userModel === 'b2b' && activeTab === 'b2b') || (userModel === 'b2t' && activeTab === 'b2t')) {
          setLeadersLoading(false);
          setLeadersError(null);
          const res = await getSingleLevelNetwork({
            level: activeLevel,
            limit: usersLimit,
            offset: usersOffset,
          });
          const data = res?.data;
          if (data) {
            // Convertir la respuesta al formato NetworkLevel[]
            const singleLevel: NetworkLevel = {
              level: data.level.level,
              total_users_in_level: data.level.totalUsers,
              active_users_in_level: data.level.activeUsers,
              has_more_users_in_level: data.pagination.hasNextPage,
              users: data.users.map(u => ({
                user_id: u.user_id,
                user_email: u.user_email,
                user_full_name: u.user_full_name,
                user_phone: u.user_phone,
                user_status: u.user_status,
                user_created_at: u.user_created_at,
                user_referral_code: u.user_referral_code,
                direct_parent_id: u.direct_parent_id,
                direct_parent_email: u.direct_parent_email,
                direct_parent_full_name: u.direct_parent_full_name,
                direct_parent_referral_code: u.direct_parent_referral_code,
                direct_referrals: u.direct_referrals,
                total_descendants_of_user: u.total_descendants_of_user,
                has_descendants: u.has_descendants,
              })),
            };
            setLevels([singleLevel]);
            setTotalDescendants(data.summary.totalDescendants);
            setB2cPagination({
              totalPages: data.pagination.totalPages,
              currentPage: data.pagination.currentPage,
              totalUsers: data.level.totalUsers,
            });
            setSubtreeMode(false);
            setSubtreeUsers([]);
            setSubtreeRootId(null);
            setSubtreeTotal(0);
            setSubtreePage(1);
            setParentExhausted({});
            setParentErrors({});
          }
        } 
        // Fallback: usar el endpoint original para otros casos (no debería ejecutarse normalmente)
        else {
          console.warn('Usando endpoint fallback getNetwork - esto no debería ocurrir si userModel está establecido correctamente', { userModel, activeTab });
          setLeadersLoading(false);
          setLeadersError(null);
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
            setB2cPagination(null);
            setSubtreeMode(false);
            setSubtreeUsers([]);
            setSubtreeRootId(null);
            setSubtreeTotal(0);
            setSubtreePage(1);
            setParentExhausted({});
            setParentErrors({});
          }
        }
      } catch (e) {
        console.error('Error cargando red', e);
        setLevels([]);
        setTotalDescendants(0);
        setB2cPagination(null);
        if (isLeaderTab) {
          const message = (e as any)?.message ?? 'No se pudieron obtener los líderes.';
          setLeadersError(typeof message === 'string' ? message : 'No se pudieron obtener los líderes.');
          setLeadersLoading(false);
        }
      }
    };
    load();
  }, [activeTab, activeLevel, usersLimit, usersOffset, subtreeMode, isLeaderTab, tabAvailability, userModel]);

  // Paginación del subárbol
  useEffect(() => {
    const loadSubtree = async () => {
      if (!subtreeMode || !subtreeRootId) return;
      if (skipNextSubtreeFetchRef.current) {
        skipNextSubtreeFetchRef.current = false;
        return;
      }
      try {
        // Usuario B2C en tab B2C: usar excluding
        // Usuario B2B en tab B2B o Usuario B2T en tab B2T: usar single-level
        if ((userModel === 'b2c' && activeTab === 'b2c') || (userModel === 'b2b' && activeTab === 'b2b') || (userModel === 'b2t' && activeTab === 'b2t')) {
          // subtreeRootLevel es el nivel del usuario cuya red estamos viendo
          // Los hijos están en el nivel siguiente
          const childrenLevel = subtreeRootLevel + 1;
          if (hasDepthLimit && childrenLevel > 3) {
            setSubtreeUsers([]);
            setAllSubtreeUsers([]);
            return;
          }
          
          // Si es la primera página o no tenemos todos los usuarios cargados, cargar todos
          let allDirectUsers = allSubtreeUsers;
          if (subtreePage === 1 || allSubtreeUsers.length === 0) {
            allDirectUsers = [];
            let offset = 0;
            const limit = 100;
            
            // Cargar todas las páginas para obtener todos los hijos directos
            while (true) {
              // Usar excluding para B2C, single-level para B2B/B2T
              const fetchFn = (userModel === 'b2c' && activeTab === 'b2c') 
                ? getB2CNetworkExcludingB2BB2T 
                : getSingleLevelNetwork;
              const res = await fetchFn({
                level: childrenLevel,
                limit,
                offset,
              });
              const data = res?.data;
              if (!data || data.users.length === 0) break;
              
              // Filtrar solo los hijos directos del usuario raíz
              const directChildren = data.users.filter((u: any) => u.direct_parent_id === subtreeRootId);
              allDirectUsers.push(...directChildren);
              
              if (!data.pagination.hasNextPage) break;
              offset += limit;
            }
            
            setAllSubtreeUsers(allDirectUsers);
          }
          
          // Paginar client-side
          const startIndex = (subtreePage - 1) * usersLimit;
          const endIndex = startIndex + usersLimit;
          const pageUsers = allDirectUsers.slice(startIndex, endIndex);
          
          const users = pageUsers.map((u: any) => ({
            id: u.user_id,
            name: u.user_full_name || u.user_email,
            email: u.user_email,
            createdAt: u.user_created_at,
            levelInSubtree: 1,
            level: childrenLevel,
            authLevel: childrenLevel,
            totalDescendants: u.total_descendants_of_user || 0,
            hasDescendants: u.has_descendants ?? (u.total_descendants_of_user || 0) > 0,
          }));
          
          setSubtreeUsers(users);
          setSubtreeTotal(allDirectUsers.length);
        } else {
          // Para otros tabs, usar subtree
          // Acumular usuarios de nivel 1 de múltiples páginas del backend si es necesario
          const allDirectUsers: any[] = [];
          let backendOffset = 0;
          const backendLimit = usersLimit * 3; // Pedir más usuarios del backend para asegurar obtener suficientes de nivel 1
          
          // Calcular el rango de usuarios que necesitamos para esta página del frontend
          const startIndex = (subtreePage - 1) * usersLimit;
          const endIndex = startIndex + usersLimit;
          
          // Hacer llamadas al backend hasta que tengamos suficientes usuarios de nivel 1
          while (allDirectUsers.length < endIndex) {
            const res = await getDescendantSubtree({ 
              descendantId: subtreeRootId, 
              maxDepth: 3, 
              limit: backendLimit, 
              offset: backendOffset 
            });
            const sdata: any = (res as any)?.data ?? res;
            const users = sdata?.users || [];
            
            if (users.length === 0) break; // No hay más usuarios en el backend
            
            // Filtrar solo usuarios de nivel 1 y agregar a la lista acumulada
            const directUsers = users.filter((u: any) => (u.levelInSubtree ?? 1) === 1);
            allDirectUsers.push(...directUsers);
            
            // Si recibimos menos usuarios que el límite solicitado, no hay más
            if (users.length < backendLimit) break;
            
            backendOffset += backendLimit;
          }
          
          // Extraer solo los usuarios de nivel 1 para esta página del frontend
          const pageDirectUsers = allDirectUsers.slice(startIndex, endIndex);
          const users = pageDirectUsers.map((u: any) => {
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
              hasDescendants: u.hasDescendants ?? (u.totalDescendants || 0) > 0,
            };
          });
          
          setSubtreeUsers(users);
          // El total es el número real de usuarios de nivel 1 que encontramos
          setSubtreeTotal(allDirectUsers.length);
        }
      } catch (e) {
        console.error('Error cargando sub-árbol (paginación)', e);
        setSubtreeUsers([]);
      }
    };
    loadSubtree();
  }, [subtreeMode, subtreeRootId, subtreePage, usersLimit, subtreeRootLevel, activeTab, hasDepthLimit, maxDepth, userModel]);

  const leaderState = isLeaderTab ? leadersByTab[activeTab as LeaderTab] : undefined;

  const leaderItems = useMemo(() => {
    if (!isLeaderTab || !leaderState) {
      return [];
    }

    return leaderState.leaders.map((leader) => {
      const depth = Math.min(leader.depth || 1, 3);
      return {
        id: leader.userId,
        name: leader.fullName || leader.email,
        email: leader.email,
        createdAt: leader.createdAt,
        level: depth,
        authLevel: depth,
        totalDescendants: 0,
        leader,
      };
    });
  }, [isLeaderTab, leaderState]);

  const allLevelItems = useMemo(() => {
    if (isLeaderTab) {
      return leaderItems;
    }

    return levels.flatMap((levelGroup) =>
      (levelGroup.users || []).map((u) => ({
        id: u.user_id,
        name: u.user_full_name || u.user_email,
        email: u.user_email,
        createdAt: u.user_created_at,
        level: levelGroup.level,
        authLevel: levelGroup.level,
        totalDescendants: u.total_descendants_of_user || 0,
        hasDescendants: u.has_descendants ?? (u.total_descendants_of_user || 0) > 0,
      }))
    );
  }, [isLeaderTab, leaderItems, levels]);

  const baseItems = useMemo(() => {
    if (isLeaderTab) {
      return leaderItems;
    }

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
        hasDescendants: (u as any).hasDescendants ?? (u.totalDescendants || 0) > 0,
      }));
    }

    return allLevelItems.filter((item) => item.level === activeLevel);
  }, [isLeaderTab, leaderItems, subtreeMode, subtreeUsers, allLevelItems, activeLevel]);

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

  const handleToggleExpand = useCallback(async (parentUserId: number, level: number) => {
    // Toggle: si existe array -> colapsar (eliminar), si no -> expandir
    if (Array.isArray(childrenByParent[parentUserId])) {
      setChildrenByParent(prev => {
        const next = { ...prev };
        delete next[parentUserId];
        return next;
      });
      setAllChildrenByParent(prev => {
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
    if (hasDepthLimit && parentAuthLevel >= 3) {
      return;
    }

    setParentLoading(prev => ({ ...prev, [parentUserId]: true }));
    try {
      // Usuario B2C en tab B2C: usar excluding
      // Usuario B2B en tab B2B o Usuario B2T en tab B2T: usar single-level
      if ((userModel === 'b2c' && activeTab === 'b2c') || (userModel === 'b2b' && activeTab === 'b2b') || (userModel === 'b2t' && activeTab === 'b2t')) {
        const nextLevel = parentAuthLevel + 1;
        if (hasDepthLimit && nextLevel > 3) {
          return;
        }
        
        // Cargar usuarios del nivel siguiente
        const allChildren: any[] = [];
        let offset = 0;
        const limit = 100; // Cargar en lotes grandes para encontrar todos los hijos
        
        // Hacer múltiples llamadas hasta encontrar todos los hijos o no haya más usuarios
        while (true) {
          // Usar excluding para B2C, single-level para B2B/B2T
          const fetchFn = (userModel === 'b2c' && activeTab === 'b2c') 
            ? getB2CNetworkExcludingB2BB2T 
            : getSingleLevelNetwork;
          const res = await fetchFn({
            level: nextLevel,
            limit,
            offset,
          });
          const data = res?.data;
          if (!data || data.users.length === 0) break;
          
          // Filtrar solo los hijos directos del usuario padre
          const directChildren = data.users.filter((u: any) => u.direct_parent_id === parentUserId);
          allChildren.push(...directChildren);
          
          // Si no hay más páginas o ya encontramos suficientes, salir
          if (!data.pagination.hasNextPage || allChildren.length >= usersLimit) break;
          
          offset += limit;
        }
        
        // Guardar todos los hijos encontrados
        setAllChildrenByParent(prev => ({ ...prev, [parentUserId]: allChildren }));
        
        // Tomar solo los primeros usuarios según el límite
        const pageChildren = allChildren.slice(0, usersLimit);
        const users = pageChildren.map((u: any) => ({
          id: u.user_id,
          name: u.user_full_name || u.user_email,
          email: u.user_email,
          createdAt: u.user_created_at,
          levelInSubtree: 1,
          level: nextLevel,
          authLevel: nextLevel,
          totalDescendants: u.total_descendants_of_user || 0,
          hasDescendants: u.has_descendants ?? (u.total_descendants_of_user || 0) > 0,
        }));
        
        setChildrenByParent(prev => ({ ...prev, [parentUserId]: users }));
        const hasMore = allChildren.length > usersLimit;
        setParentOffsets(prev => ({ ...prev, [parentUserId]: users.length }));
        setParentHasMore(prev => ({ ...prev, [parentUserId]: hasMore }));
        setParentExhausted(prev => ({ ...prev, [parentUserId]: users.length === 0 && !hasMore }));
        setParentErrors(prev => {
          const next = { ...prev };
          delete next[parentUserId];
          return next;
        });
      } else {
        // Usar subtree para otros tabs
        const subtree = await getDescendantSubtree({ descendantId: parentUserId, maxDepth: maxDepth, limit: usersLimit, offset: 0 });
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
      }
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
  }, [hasDepthLimit, maxDepth, userModel, activeTab, usersLimit, subtreeMode, allLevelItems, baseItems, parentOffsets, allChildrenByParent, childrenByParent, setChildrenByParent, setAllChildrenByParent, setParentExhausted, setParentLoading, setParentOffsets, setParentHasMore, setParentErrors]);

  const handleLoadMoreChildren = useCallback(async (parentId: number, parentLevel: number) => {
    try {
      const currentOffset = parentOffsets[parentId] ?? 0;
      setParentLoading(prev => ({ ...prev, [parentId]: true }));
      
      // Usuario B2C en tab B2C: usar excluding
      // Usuario B2B en tab B2B o Usuario B2T en tab B2T: usar single-level
      if ((userModel === 'b2c' && activeTab === 'b2c') || (userModel === 'b2b' && activeTab === 'b2b') || (userModel === 'b2t' && activeTab === 'b2t')) {
        const nextLevel = parentLevel + 1;
        if (hasDepthLimit && nextLevel > 3) {
          return;
        }
        
        // Verificar si ya tenemos todos los hijos cargados en caché
        const cachedAllChildren = allChildrenByParent[parentId];
        const existing = childrenByParent[parentId] || [];
        
        if (cachedAllChildren && cachedAllChildren.length > 0) {
          // Ya tenemos todos los hijos cargados, solo mostrar más
          const nextBatch = cachedAllChildren.slice(existing.length, existing.length + usersLimit);
          const newChildren = nextBatch.map((u: any) => ({
            id: u.user_id,
            name: u.user_full_name || u.user_email,
            email: u.user_email,
            createdAt: u.user_created_at,
            levelInSubtree: 1,
            level: nextLevel,
            authLevel: nextLevel,
            totalDescendants: u.total_descendants_of_user || 0,
            hasDescendants: u.has_descendants ?? (u.total_descendants_of_user || 0) > 0,
          }));
          
          setChildrenByParent(prev => {
            const existing = prev[parentId] || [];
            const existingIds = new Set(existing.map((c: any) => c.id));
            const merged = [...existing];
            newChildren.forEach((c: any) => { if (!existingIds.has(c.id)) merged.push(c); });
            return { ...prev, [parentId]: merged };
          });
          
          const noNewUsers = newChildren.length === 0;
          const hasMore = existing.length + newChildren.length < cachedAllChildren.length;
          setParentOffsets(prev => ({ ...prev, [parentId]: existing.length + newChildren.length }));
          setParentHasMore(prev => ({ ...prev, [parentId]: hasMore }));
          setParentExhausted(prev => ({ ...prev, [parentId]: noNewUsers }));
          setParentErrors(prev => {
            const next = { ...prev };
            delete next[parentId];
            return next;
          });
        } else {
          // Cargar usuarios del nivel siguiente usando B2C
          const allChildren: any[] = [];
          let offset = 0;
          const limit = 100; // Cargar en lotes grandes para encontrar todos los hijos
          
          // Hacer múltiples llamadas hasta encontrar todos los hijos
          while (true) {
            // Usar excluding para B2C, single-level para B2B/B2T
            const fetchFn = (userModel === 'b2c' && activeTab === 'b2c') 
              ? getB2CNetworkExcludingB2BB2T 
              : getSingleLevelNetwork;
            const res = await fetchFn({
              level: nextLevel,
              limit,
              offset,
            });
            const data = res?.data;
            if (!data || data.users.length === 0) break;
            
            // Filtrar solo los hijos directos del usuario padre
            const directChildren = data.users.filter((u: any) => u.direct_parent_id === parentId);
            allChildren.push(...directChildren);
            
            // Si no hay más páginas, salir
            if (!data.pagination.hasNextPage) break;
            
            offset += limit;
          }
          
          // Guardar todos los hijos encontrados en caché
          setAllChildrenByParent(prev => ({ ...prev, [parentId]: allChildren }));
          
          // Tomar los siguientes usuarios que aún no están cargados
          const remainingChildren = allChildren.filter((u: any) => {
            const existingIds = new Set(existing.map((c: any) => c.id));
            return !existingIds.has(u.user_id);
          });
          const pageChildren = remainingChildren.slice(0, usersLimit);
          
          const newChildren = pageChildren.map((u: any) => ({
            id: u.user_id,
            name: u.user_full_name || u.user_email,
            email: u.user_email,
            createdAt: u.user_created_at,
            levelInSubtree: 1,
            level: nextLevel,
            authLevel: nextLevel,
            totalDescendants: u.total_descendants_of_user || 0,
            hasDescendants: u.has_descendants ?? (u.total_descendants_of_user || 0) > 0,
          }));
          
          setChildrenByParent(prev => {
            const existing = prev[parentId] || [];
            const existingIds = new Set(existing.map((c: any) => c.id));
            const merged = [...existing];
            newChildren.forEach((c: any) => { if (!existingIds.has(c.id)) merged.push(c); });
            return { ...prev, [parentId]: merged };
          });
          
          const noNewUsers = newChildren.length === 0;
          const hasMore = existing.length + newChildren.length < allChildren.length;
          setParentOffsets(prev => ({ ...prev, [parentId]: existing.length + newChildren.length }));
          setParentHasMore(prev => ({ ...prev, [parentId]: hasMore }));
          setParentExhausted(prev => ({ ...prev, [parentId]: noNewUsers }));
          setParentErrors(prev => {
            const next = { ...prev };
            delete next[parentId];
            return next;
          });
        }
      } else {
        // Usar subtree para otros tabs
        const subtree = await getDescendantSubtree({ descendantId: parentId, maxDepth: maxDepth, limit: usersLimit, offset: currentOffset });
        const sdata = (subtree as any)?.data ?? subtree;
        const directUsers = (sdata?.users || []).filter((u: any) => (u.levelInSubtree ?? 1) === 1);
        const newChildren = directUsers.map((u: any) => {
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
  }, [hasDepthLimit, maxDepth, userModel, activeTab, usersLimit, allChildrenByParent, childrenByParent, parentOffsets, setParentLoading, setChildrenByParent, setAllChildrenByParent, setParentOffsets, setParentHasMore, setParentExhausted, setParentErrors]);

  const loadTreeForUser = useCallback(async (userId: number) => {
    console.log('loadTreeForUser llamado para userId:', userId);
    setLoadingTreeUserId(userId);
    try {
      // Buscar el usuario en la lista actual para obtener su información
      const lookupDataset = subtreeMode ? baseItems : allLevelItems;
      let userItem = lookupDataset.find(item => item.id === userId);
      
      // Si no se encuentra en el dataset principal, buscar en childrenByParent
      if (!userItem) {
        const allChildren = Object.values(childrenByParent).flat();
        userItem = allChildren.find(item => item.id === userId);
      }
      
      console.log('loadTreeForUser - userItem encontrado:', userItem);
      if (!userItem) {
        console.log('loadTreeForUser - No se encontró userItem, retornando');
        return;
      }
      const userLevel = (userItem as any)?.authLevel ?? (userItem as any)?.level ?? activeLevel;
      const userName = userItem?.name || 'Usuario';
      const hasDescendants = (userItem as any)?.hasDescendants ?? ((userItem as any)?.totalDescendants ?? 0) > 0;
      console.log('loadTreeForUser - userLevel:', userLevel, 'hasDescendants:', hasDescendants, 'userModel:', userModel, 'activeTab:', activeTab);

      // Solo bloquear si no hay descendientes
      if (!hasDescendants) {
        console.log('loadTreeForUser - No tiene descendientes, retornando');
        return;
      }
      
      // Usuario B2C en tab B2C: usar excluding
      // Usuario B2B en tab B2B o Usuario B2T en tab B2T: usar single-level
      let loadedWithSingleLevel = false;
      
      if ((userModel === 'b2c' && activeTab === 'b2c') || (userModel === 'b2b' && activeTab === 'b2b') || (userModel === 'b2t' && activeTab === 'b2t')) {
        console.log('loadTreeForUser - Entrando al bloque de single-level/excluding');
        const nextLevel = userLevel + 1;
        
        // Si hay límite de profundidad y el siguiente nivel excede el límite, aún así intentar cargar
        // pero mostrar los usuarios como nivel 3 (limitado)
        const levelToFetch = nextLevel;
        const displayLevel = hasDepthLimit && nextLevel > 3 ? 3 : nextLevel;
        console.log('loadTreeForUser - nextLevel:', nextLevel, 'levelToFetch:', levelToFetch, 'displayLevel:', displayLevel);
        
        // Usar excluding para B2C, single-level para B2B/B2T
        const fetchFn = (userModel === 'b2c' && activeTab === 'b2c') 
          ? getB2CNetworkExcludingB2BB2T 
          : getSingleLevelNetwork;
        
        try {
          console.log('loadTreeForUser - Iniciando llamadas al API con level:', levelToFetch);
          // Cargar usuarios del nivel siguiente - hacer múltiples llamadas para encontrar todos los hijos
          const allDirectUsers: any[] = [];
          let offset = 0;
          const limit = 100; // Cargar en lotes grandes para encontrar todos los hijos
          
          // Hacer múltiples llamadas hasta encontrar todos los hijos o no haya más usuarios
          while (true) {
            console.log('loadTreeForUser - Llamando API con offset:', offset);
            const res = await fetchFn({
              level: levelToFetch,
              limit,
              offset,
            });
            const data = res?.data;
            console.log('loadTreeForUser - Respuesta del API:', data);
            if (!data || data.users.length === 0) break;
            
            // Filtrar solo los hijos directos del usuario
            const directChildren = data.users.filter((u: any) => u.direct_parent_id === userId);
            console.log('loadTreeForUser - Hijos directos encontrados:', directChildren.length);
            allDirectUsers.push(...directChildren);
            
            // Si no hay más páginas, salir
            if (!data.pagination.hasNextPage) break;
            
            offset += limit;
          }
          
          console.log('loadTreeForUser - Total hijos directos encontrados:', allDirectUsers.length);
          if (allDirectUsers.length > 0) {
            const users = allDirectUsers.map((u: any) => ({
              id: u.user_id,
              name: u.user_full_name || u.user_email,
              email: u.user_email,
              createdAt: u.user_created_at,
              levelInSubtree: 1,
              level: displayLevel,
              authLevel: displayLevel,
              totalDescendants: u.total_descendants_of_user || 0,
              hasDescendants: u.has_descendants ?? (u.total_descendants_of_user || 0) > 0,
            }));
            
            // Tomar solo los primeros usuarios según el límite para la primera página
            const pageUsers = users.slice(0, usersLimit);
            
            skipNextSubtreeFetchRef.current = true;
            setSubtreeMode(true);
            setSubtreeRootId(userId);
            setSubtreeRootName(userName);
            setSubtreeRootLevel(userLevel); // Nivel del usuario cuya red estamos viendo
            setSubtreeUsers(pageUsers);
            setSubtreeTotal(allDirectUsers.length);
            setSubtreePage(1);
            setAllSubtreeUsers(allDirectUsers); // Guardar todos los usuarios para paginación
            setChildrenByParent({});
            setAllChildrenByParent({});
            setParentExhausted({});
            loadedWithSingleLevel = true;
          }
        } catch (error) {
          // Si falla al obtener el nivel, continuar al bloque else para usar subtree
          console.error('Error obteniendo nivel, intentando con subtree:', error);
        }
      }
      
      // Si no se pudo cargar con single-level o es otro caso, usar subtree
      if (!loadedWithSingleLevel) {
        // Para otros tabs, usar subtree
        // Acumular usuarios de nivel 1 de múltiples páginas del backend si es necesario
        const allDirectUsers: any[] = [];
        let backendOffset = 0;
        const backendLimit = usersLimit * 3; // Pedir más usuarios del backend para asegurar obtener suficientes de nivel 1
        let firstData: any = null;
        
        // Hacer llamadas al backend hasta que tengamos suficientes usuarios de nivel 1 para la primera página
        while (allDirectUsers.length < usersLimit) {
          const res = await getDescendantSubtree({ 
            descendantId: userId, 
            maxDepth: maxDepth, 
            limit: backendLimit, 
            offset: backendOffset 
          });
          const data: any = (res as any)?.data ?? res;
          const users = data?.users || [];
          
          // Guardar la primera respuesta para obtener información del nivel
          if (!firstData) {
            firstData = data;
          }
          
          if (users.length === 0) break; // No hay más usuarios en el backend
          
          // Filtrar solo usuarios de nivel 1 y agregar a la lista acumulada
          const directUsers = users.filter((u: any) => (u.levelInSubtree ?? 1) === 1);
          allDirectUsers.push(...directUsers);
          
          // Si recibimos menos usuarios que el límite solicitado, no hay más
          if (users.length < backendLimit) break;
          
          backendOffset += backendLimit;
        }
        
        const requesterLevel = typeof firstData?.requesterLevelToDescendant === 'number' && firstData?.requesterLevelToDescendant > 0
          ? firstData?.requesterLevelToDescendant
          : userLevel;
        const rootLevel = hasDepthLimit ? Math.min(3, requesterLevel) : requesterLevel;
        
        // Tomar solo los primeros usuarios de nivel 1 para la primera página
        const pageUsers = allDirectUsers.slice(0, usersLimit);
        const users = pageUsers.map((u: any) => {
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
          };
        });
        
        skipNextSubtreeFetchRef.current = true;
        setSubtreeMode(true);
        setSubtreeRootId(userId);
        setSubtreeRootName(userName);
        setSubtreeRootLevel(rootLevel);
        setSubtreeUsers(users);
        // El total es el número real de usuarios de nivel 1 que encontramos
        setSubtreeTotal(allDirectUsers.length);
        setSubtreePage(1);
        setChildrenByParent({});
        setAllChildrenByParent({});
        setParentExhausted({});
      }
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
      setAllSubtreeUsers([]);
      setChildrenByParent({});
      setAllChildrenByParent({});
    } finally {
      setLoadingTreeUserId(null);
    }
  }, [activeLevel, activeTab, allLevelItems, baseItems, subtreeMode, usersLimit, hasDepthLimit, maxDepth, childrenByParent]);

  const handleViewTree = (userId: number) => {
    console.log('handleViewTree llamado para userId:', userId);
    const lookupDataset = subtreeMode ? baseItems : allLevelItems;
    let userItem = lookupDataset.find(item => item.id === userId);
    
    // Si no se encuentra en el dataset principal, buscar en childrenByParent
    if (!userItem) {
      const allChildren = Object.values(childrenByParent).flat();
      userItem = allChildren.find(item => item.id === userId);
    }
    
    console.log('userItem encontrado:', userItem);
    if (!userItem) {
      console.log('No se encontró userItem, retornando');
      return;
    }
    const userLevel = (userItem as any)?.authLevel ?? (userItem as any)?.level ?? activeLevel;
    const hasDescendants = (userItem as any)?.hasDescendants ?? ((userItem as any)?.totalDescendants ?? 0) > 0;
    console.log('userLevel:', userLevel, 'hasDescendants:', hasDescendants);

    // Permitir ver árbol si tiene descendientes, incluso en nivel 3
    // Solo bloquear si no hay descendientes
    if (!hasDescendants) {
      console.log('No tiene descendientes, retornando');
      return;
    }

    if (searchFilter.trim()) {
      setSearchFilter('');
      setPendingTreeUserId(userId);
      return;
    }

    console.log('Llamando a loadTreeForUser');
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
    setAllSubtreeUsers([]);
    setChildrenByParent({});
    setAllChildrenByParent({});
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
    if (isLeaderTab) {
      return leaderState?.total ?? leaderItems.length;
    }

    // Si estamos usando single-level o excluding, usar la información de paginación
    if (((userModel === 'b2c' && activeTab === 'b2c') || (userModel === 'b2b' && activeTab === 'b2b') || (userModel === 'b2t' && activeTab === 'b2t')) && b2cPagination) {
      return b2cPagination.totalUsers;
    }
    
    // Para otros tabs, usar la lógica original
    const lvl1 = levels.find(l => l.level === activeLevel);
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
  }, [isLeaderTab, leaderState, leaderItems, levels, usersLimit, activeTab, activeLevel, b2cPagination]);

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
          {!subtreeMode && (
            <NetworkTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              availableTabs={tabAvailability} 
            />
          )}

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
                subtitle="Volumen total"
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
              showLevelTabs={!subtreeMode && !isLeaderTab}
            />
          </div>

          {/* Contenido scrollable de la tabla */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Header de columnas */}
            <NetworkTableHeader />

            {/* Tabla con filas */}
            {isLeaderTab && leadersError ? (
              <div className="py-10 text-center text-sm text-[#FF7A7A] px-4">
                {leadersError}
              </div>
            ) : isLeaderTab && leadersLoading ? (
              <div className="py-10 text-center text-sm text-white/60">
                Cargando líderes...
              </div>
            ) : displayedItems.length > 0 ? (
              <NetworkTable 
                items={displayedItems} 
                activeTab={activeTab}
                activeLevel={activeLevel}
                onToggleExpand={handleToggleExpand}
                childrenByParent={(isLeaderTab || hasSearch) ? {} : childrenByParent}
                childIndentPx={30}
                onViewTree={handleViewTree}
                disableExpand={hasSearch || isLeaderTab}
                disableViewTree={isLeaderTab}
                hasDepthLimit={hasDepthLimit}
                maxDepth={maxDepth}
                onLoadMoreChildren={isLeaderTab ? undefined : handleLoadMoreChildren}
                parentHasMore={isLeaderTab ? {} : parentHasMore}
                parentLoading={isLeaderTab ? {} : parentLoading}
                loadingTreeUserId={loadingTreeUserId}
                parentExhausted={isLeaderTab ? {} : parentExhausted}
                parentErrors={isLeaderTab ? {} : parentErrors}
              />
            ) : (
              <div className="py-10 text-center text-sm text-white/60">
                {hasSearch
                  ? 'Sin resultados para tu búsqueda.'
                  : isLeaderTab
                    ? 'No hay líderes disponibles.'
                    : 'No hay usuarios disponibles.'}
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

