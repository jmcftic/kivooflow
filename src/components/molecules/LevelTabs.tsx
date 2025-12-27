import React from 'react';
import { useTranslation } from 'react-i18next';
import FoldedTabCard from '../atoms/FoldedTabCard';
import { cn } from '@/lib/utils';

interface LevelTabsProps {
  activeLevel: 1 | 2 | 3;
  onLevelChange: (level: 1 | 2 | 3) => void;
}

const LevelTabs: React.FC<LevelTabsProps> = ({ activeLevel, onLevelChange }) => {
  const { t } = useTranslation(['network', 'common']);
  
  const levels = [
    { id: 1 as const, label: t('network:levels.level1') },
    { id: 2 as const, label: t('network:levels.level2') },
    { id: 3 as const, label: t('network:levels.level3') },
  ];

  return (
    <div className="flex" style={{ gap: '3px' }}>
      {levels.map((level) => (
        <div key={level.id} onClick={() => onLevelChange(level.id)} className="cursor-pointer" style={{ width: '74.27px' }}>
          <FoldedTabCard
            height={33.14}
            gradientColor={activeLevel === level.id ? '#FFF100' : '#333333'}
            backgroundColor={activeLevel === level.id ? '#FFF100' : '#2d2d2d'}
          >
            <span className={cn(
              "text-xs text-center",
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

