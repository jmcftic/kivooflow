import React from 'react';
import FoldedTabCard from '../atoms/FoldedTabCard';
import { cn } from '@/lib/utils';

interface NetworkTabsProps {
  activeTab: 'b2c' | 'b2b' | 'b2t';
  onTabChange: (tab: 'b2c' | 'b2b' | 'b2t') => void;
}

const NetworkTabs: React.FC<NetworkTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'b2c' as const, label: 'B2C', disabled: false },
    { id: 'b2b' as const, label: 'B2B', disabled: true },
    { id: 'b2t' as const, label: 'B2T', disabled: true },
  ];

  return (
    <div className="flex items-start">
      <div className="flex" style={{ gap: '1px' }}>
        {tabs.map((tab) => (
          <div 
            key={tab.id} 
            onClick={() => !tab.disabled && onTabChange(tab.id)} 
            className={tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} 
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
        ))}
      </div>
    </div>
  );
};

export default NetworkTabs;

