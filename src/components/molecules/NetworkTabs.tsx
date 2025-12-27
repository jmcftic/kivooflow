import React from 'react';
import { useTranslation } from 'react-i18next';
import FoldedTabCard from '../atoms/FoldedTabCard';
import { cn } from '@/lib/utils';

type NetworkTabId = 'b2c' | 'b2b' | 'b2t';

interface NetworkTabsProps {
  activeTab: NetworkTabId;
  onTabChange: (tab: NetworkTabId) => void;
  availableTabs?: Record<NetworkTabId, boolean>;
  tabHeight?: number;
  customLabels?: Partial<Record<NetworkTabId, string>>;
}

const NetworkTabs: React.FC<NetworkTabsProps> = ({ activeTab, onTabChange, availableTabs, tabHeight = 52, customLabels }) => {
  const { t } = useTranslation(['commissions', 'network', 'common']);
  const availability: Record<NetworkTabId, boolean> = availableTabs ?? {
    b2c: true,
    b2b: false,
    b2t: false,
  };

  const tabs: Array<{ id: NetworkTabId; label: string }> = [
    { id: 'b2c', label: customLabels?.b2c || t('commissions:tabs.b2c') },
    { id: 'b2b', label: customLabels?.b2b || t('commissions:tabs.b2b') },
    { id: 'b2t', label: customLabels?.b2t || t('commissions:tabs.b2t') },
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

