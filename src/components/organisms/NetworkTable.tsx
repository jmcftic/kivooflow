import React from 'react';
import InfoBanner from '../atoms/InfoBanner';

interface NetworkTableProps {
  items: Array<{
    id: number;
    name: string;
    info: string;
  }>;
  activeTab: 'b2c' | 'b2b' | 'b2t';
  activeLevel: 1 | 2 | 3;
}

const NetworkTable: React.FC<NetworkTableProps> = ({ items, activeTab, activeLevel }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <InfoBanner key={item.id} className="w-full">
          <div className="w-full flex items-center justify-between px-6 py-4">
            <div className="flex-1">
              <h3 className="text-black text-lg font-semibold mb-1">
                {item.name}
              </h3>
              <p className="text-black/80 text-sm">
                {item.info} - {activeTab.toUpperCase()} - Nivel {activeLevel}
              </p>
            </div>
          </div>
        </InfoBanner>
      ))}
    </div>
  );
};

export default NetworkTable;

