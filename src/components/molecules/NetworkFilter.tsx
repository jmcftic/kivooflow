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
    <div className={`flex items-center ${showLevelTabs ? 'justify-between' : 'justify-start'}`}>
      {/* Input de filtro a la izquierda */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <SearchIconMini className="absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar usuario"
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[#2e2d29] border-[#333] text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#333] pl-9"
          />
        </div>
      </div>

      {/* Tabs de nivel a la derecha */}
      {showLevelTabs && (
        <LevelTabs activeLevel={activeLevel} onLevelChange={onLevelChange} />
      )}
    </div>
  );
};

export default NetworkFilter;

