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
        <InfoBanner key={item.id} className="w-full h-16" backgroundColor="#212020">
          <div className="w-full flex items-center px-6 py-2">
            <div className="flex-1 grid grid-cols-6 gap-4">
              <div className="text-white text-sm">{item.name}@email.com</div>
              <div className="text-white text-sm">2024-01-15</div>
              <div className="text-white text-sm">{activeLevel}</div>
              <div className="text-white text-sm">Resumen</div>
              <div className="text-white text-sm">$0.00</div>
              <div className="text-white text-sm">Ver más</div>
            </div>
          </div>
        </InfoBanner>
      ))}
    </div>
  );
};

export default NetworkTable;

