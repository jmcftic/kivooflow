import React from 'react';
import { Input } from '../ui/input';
import SearchIconMini from '../atoms/SearchIconMini';
import LevelTabs from './LevelTabs';

interface NetworkFilterProps {
  searchFilter: string;
  activeLevel: 1 | 2 | 3;
  onSearchChange: (value: string) => void;
  onLevelChange: (level: 1 | 2 | 3) => void;
  showLevelTabs?: boolean;
}

const NetworkFilter: React.FC<NetworkFilterProps> = ({
  searchFilter,
  activeLevel,
  onSearchChange,
  onLevelChange,
  showLevelTabs = true,
}) => {
  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0 ${showLevelTabs ? 'md:justify-between' : 'md:justify-start'}`}>
      {/* Tabs de nivel - Primero en móvil, a la derecha en desktop */}
      {showLevelTabs && (
        <div className="order-1 md:order-2 flex items-center">
          <LevelTabs activeLevel={activeLevel} onLevelChange={onLevelChange} />
        </div>
      )}

      {/* Input de filtro - Segundo en móvil, a la izquierda en desktop */}
      <div className={`order-2 md:order-1 ${showLevelTabs ? 'flex-1' : ''} max-w-md w-full md:w-auto flex items-center`}>
        <div className="relative w-full">
          <SearchIconMini className="absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar usuario"
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[#2e2d29] border-[#333] text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#333] pl-9 w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default NetworkFilter;

