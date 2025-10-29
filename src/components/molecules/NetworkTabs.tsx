import React from 'react';
import FoldedTabCard from '../atoms/FoldedTabCard';
import { cn } from '@/lib/utils';

interface NetworkTabsProps {
  activeTab: 'b2c' | 'b2b' | 'b2t';
  onTabChange: (tab: 'b2c' | 'b2b' | 'b2t') => void;
}

const NetworkTabs: React.FC<NetworkTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'b2c' as const, label: 'B2C' },
    { id: 'b2b' as const, label: 'B2B' },
    { id: 'b2t' as const, label: 'B2T' },
  ];

  return (
    <div className="flex items-start">
      <div className="flex" style={{ gap: '1px' }}>
        {tabs.map((tab) => (
          <div key={tab.id} onClick={() => onTabChange(tab.id)} className="cursor-pointer">
            <FoldedTabCard
              height={52}
              gradientColor={activeTab === tab.id ? '#FFF100' : '#fff000'}
              backgroundColor={activeTab === tab.id ? '#FFF100' : '#2d2d2d'}
            >
              <span className={cn(
                "text-sm font-medium",
                activeTab === tab.id ? 'text-black' : 'text-white'
              )}>
                {tab.label}
              </span>
            </FoldedTabCard>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkTabs;

