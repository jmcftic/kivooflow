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
import { getNetwork } from '@/services/network';
import { NetworkLevel } from '@/types/network';

const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b' | 'b2t'>('b2c');
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [searchFilter, setSearchFilter] = useState('');

  const [levels, setLevels] = useState<NetworkLevel[]>([]);
  const [totalDescendants, setTotalDescendants] = useState(0);
  const [usersLimit, setUsersLimit] = useState(5);
  const [usersOffset, setUsersOffset] = useState(0);
  const [childrenByParent, setChildrenByParent] = useState<Record<number, any[]>>({});

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
        }
      } catch (e) {
        console.error('Error cargando red', e);
        setLevels([]);
        setTotalDescendants(0);
      }
    };
    load();
  }, [activeLevel, usersLimit, usersOffset]);

  const tableItems = useMemo(() => {
    const lvl = levels.find(l => l.level === activeLevel);
    const users = lvl?.users || [];
    return users.map(u => ({ id: u.user_id, name: u.user_full_name || u.user_email, email: u.user_email, createdAt: u.user_created_at }));
  }, [levels, activeLevel]);

  const handleToggleExpand = async (parentUserId: number) => {
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
    const nextLevelNum = (activeLevel + 1) as 1 | 2 | 3;
    const nextLevelData = levels.find(l => l.level === nextLevelNum);
    if (nextLevelData && nextLevelData.users?.length) {
      const users = nextLevelData.users
        .filter(u => u.direct_parent_id === parentUserId)
        .map(u => ({ id: u.user_id, name: u.user_full_name || u.user_email, email: u.user_email, createdAt: u.user_created_at }));
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: users }));
      return;
    }
    // Si no está cargado el siguiente nivel, solicitarlo
    try {
      const res = await getNetwork({ levelStart: nextLevelNum, levelEnd: nextLevelNum, usersLimit, usersOffset });
      const data = (res as any)?.data ?? res?.data;
      const lvl = data?.levels?.find((l: NetworkLevel) => l.level === nextLevelNum);
      const users = (lvl?.users || [])
        .filter((u: any) => u.direct_parent_id === parentUserId)
        .map((u: any) => ({ id: u.user_id, name: u.user_full_name || u.user_email, email: u.user_email, createdAt: u.user_created_at }));
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: users }));
    } catch (e) {
      console.error('Error cargando hijos', e);
      setChildrenByParent(prev => ({ ...prev, [parentUserId]: [] }));
    }
  };

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
            />
          </div>

          {/* Paginación al fondo fija dentro del área de contenido */}
          <div className="pt-3 pb-6">
            <NetworkPaginationBar totalItems={tableItems.length} />
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

