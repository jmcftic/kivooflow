import React from 'react';
import { Input } from '../ui/input';
import LevelTabs from './LevelTabs';

interface NetworkFilterProps {
  searchFilter: string;
  activeLevel: 1 | 2 | 3;
  onSearchChange: (value: string) => void;
  onLevelChange: (level: 1 | 2 | 3) => void;
}

const NetworkFilter: React.FC<NetworkFilterProps> = ({
  searchFilter,
  activeLevel,
  onSearchChange,
  onLevelChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* Input de filtro a la izquierda */}
      <div className="flex-1 max-w-md">
        <Input
          type="text"
          placeholder="Buscar..."
          value={searchFilter}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-[#212020] border-[#333] text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#333]"
        />
      </div>

      {/* Tabs de nivel a la derecha */}
      <LevelTabs activeLevel={activeLevel} onLevelChange={onLevelChange} />
    </div>
  );
};

export default NetworkFilter;

