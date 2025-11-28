import React, { useEffect, useState, useRef } from 'react';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import CommissionsListCard from '../components/organisms/CommissionsListCard';
import NetworkTabs from '../components/molecules/NetworkTabs';
import { getAvailableMlmModels } from '@/services/network';

type CommissionTabId = 'b2c' | 'b2b';

const Commissions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CommissionTabId>('b2c');
  const [tabAvailability, setTabAvailability] = useState<Record<CommissionTabId, boolean>>({
    b2c: true,
    b2b: false,
  });
  const hasFetchedAvailableModelsRef = useRef(false);

  // Cargar modelos disponibles al montar
  useEffect(() => {
    if (hasFetchedAvailableModelsRef.current) {
      return;
    }

    const fetchAvailableModels = async () => {
      try {
        const data = await getAvailableMlmModels();
        
        // Establecer qué tabs están disponibles
        setTabAvailability({
          b2c: data.show_b2c_tab,
          b2b: data.show_b2b_tab,
        });

        // Establecer el tab activo inicial
        if (data.show_b2c_tab) {
          setActiveTab('b2c');
        } else if (data.show_b2b_tab) {
          setActiveTab('b2b');
        }

        hasFetchedAvailableModelsRef.current = true;
      } catch (error) {
        console.error('Error obteniendo modelos disponibles:', error);
      }
    };

    void fetchAvailableModels();
  }, []);

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-8 pt-16 lg:pt-0">
        {/* Navbar responsivo */}
        <DashboardNavbar title="Comisiones" />

        {/* Tabs */}
        <div className="relative z-20 mt-6 mb-4">
          <NetworkTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === 'b2c' || tab === 'b2b') {
                setActiveTab(tab);
              }
            }}
            availableTabs={{
              b2c: tabAvailability.b2c,
              b2b: tabAvailability.b2b,
              b2t: false, // No mostrar B2T en Commissions
            }}
          />
        </div>

        {/* Contenido de Comisiones */}
        <div className="relative z-20 mt-6 mb-8">
          <CommissionsListCard activeTab={activeTab} />
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

export default Commissions;

