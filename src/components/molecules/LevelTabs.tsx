import React from 'react';
import FoldedTabCard from '../atoms/FoldedTabCard';
import { cn } from '@/lib/utils';

interface LevelTabsProps {
  activeLevel: 1 | 2 | 3;
  onLevelChange: (level: 1 | 2 | 3) => void;
}

const LevelTabs: React.FC<LevelTabsProps> = ({ activeLevel, onLevelChange }) => {
  const levels = [
    { id: 1 as const, label: 'Nivel 1' },
    { id: 2 as const, label: 'Nivel 2' },
    { id: 3 as const, label: 'Nivel 3' },
  ];

  return (
    <div className="flex" style={{ gap: '3px' }}>
      {levels.map((level) => (
        <div key={level.id} onClick={() => onLevelChange(level.id)} className="cursor-pointer">
          <FoldedTabCard
            height={40}
            gradientColor={activeLevel === level.id ? '#FFF100' : '#fff000'}
            backgroundColor={activeLevel === level.id ? '#FFF100' : '#2d2d2d'}
          >
            <span className={cn(
              "text-xs font-medium",
              activeLevel === level.id ? 'text-black' : 'text-white'
            )}>
              {level.label}
            </span>
          </FoldedTabCard>
        </div>
      ))}
    </div>
  );
};

export default LevelTabs;

