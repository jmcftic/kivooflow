import React from 'react';
import FoldedTabCard from '../atoms/FoldedTabCard';
import { cn } from '@/lib/utils';

type NetworkTabId = 'b2c' | 'b2b' | 'b2t';

interface NetworkTabsProps {
  activeTab: NetworkTabId;
  onTabChange: (tab: NetworkTabId) => void;
  availableTabs?: Record<NetworkTabId, boolean>;
  tabHeight?: number;
}

const NetworkTabs: React.FC<NetworkTabsProps> = ({ activeTab, onTabChange, availableTabs, tabHeight = 52 }) => {
  const availability: Record<NetworkTabId, boolean> = availableTabs ?? {
    b2c: true,
    b2b: false,
    b2t: false,
  };

  const tabs: Array<{ id: NetworkTabId; label: string }> = [
    { id: 'b2c', label: 'B2C' },
    { id: 'b2b', label: 'B2B' },
    { id: 'b2t', label: 'B2T' },
  ];

  // Filtrar solo las tabs disponibles
  const availableTabsList = tabs.filter((tab) => availability[tab.id]);

  return (
    <div className="flex items-start w-full">
      <div className="flex" style={{ gap: '1px' }}>
        {availableTabsList.map((tab) => {
          return (
            <div 
              key={tab.id} 
              onClick={() => onTabChange(tab.id)} 
              className="cursor-pointer" 
              style={{ width: '158px' }}
            >
              <FoldedTabCard
                height={tabHeight}
                gradientColor={activeTab === tab.id ? '#FFF100' : '#333333'}
                backgroundColor={activeTab === tab.id ? '#FFF100' : '#2d2d2d'}
              >
                <span className={cn(
                  "text-sm text-center",
                  activeTab === tab.id ? 'text-black' : 'text-white'
                )}>
                  {tab.label}
                </span>
              </FoldedTabCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkTabs;

