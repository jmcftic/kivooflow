import React, { useState } from 'react';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import NetworkTabs from '../components/molecules/NetworkTabs';
import NetworkFilter from '../components/molecules/NetworkFilter';
import NetworkTable from '../components/organisms/NetworkTable';

const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b' | 'b2t'>('b2c');
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [searchFilter, setSearchFilter] = useState('');

  // Datos de ejemplo para la tabla
  const tableItems = [
    { id: 1, name: 'Usuario 1', info: 'Información del usuario 1' },
    { id: 2, name: 'Usuario 2', info: 'Información del usuario 2' },
    { id: 3, name: 'Usuario 3', info: 'Información del usuario 3' },
    { id: 4, name: 'Usuario 4', info: 'Información del usuario 4' },
    { id: 5, name: 'Usuario 5', info: 'Información del usuario 5' },
  ];

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-8 pt-16 lg:pt-0">
        {/* Navbar responsivo */}
        <DashboardNavbar title="Red" />

        {/* Contenido de Red */}
        <div className="relative z-20 mt-6 mb-8">
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
          <div className="mt-6 mb-4">
            <NetworkFilter
              searchFilter={searchFilter}
              activeLevel={activeLevel}
              onSearchChange={setSearchFilter}
              onLevelChange={setActiveLevel}
            />
          </div>

          {/* Tabla con filas */}
          <NetworkTable 
            items={tableItems} 
            activeTab={activeTab}
            activeLevel={activeLevel}
          />
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

