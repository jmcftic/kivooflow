import React from 'react';
import FoldedTabCard from '../atoms/FoldedTabCard';
import { cn } from '@/lib/utils';

type NetworkTabId = 'b2c' | 'b2b' | 'b2t';

interface NetworkTabsProps {
  activeTab: NetworkTabId;
  onTabChange: (tab: NetworkTabId) => void;
  availableTabs?: Record<NetworkTabId, boolean>;
}

const NetworkTabs: React.FC<NetworkTabsProps> = ({ activeTab, onTabChange, availableTabs }) => {
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

  return (
    <div className="flex items-start">
      <div className="flex" style={{ gap: '1px' }}>
        {tabs.map((tab) => {
          const disabled = !availability[tab.id];
          return (
            <div 
              key={tab.id} 
              onClick={() => !disabled && onTabChange(tab.id)} 
              className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} 
              style={{ width: '158px' }}
            >
              <FoldedTabCard
                height={52}
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

