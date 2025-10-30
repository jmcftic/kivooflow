import React from 'react';
import InfoBanner from '../atoms/InfoBanner';
import DropDownTringle from '../atoms/DropDownTringle';

interface NetworkTableProps {
  items: Array<{
    id: number;
    name: string;
    email?: string;
    createdAt?: string;
  }>;
  activeTab: 'b2c' | 'b2b' | 'b2t';
  activeLevel: 1 | 2 | 3;
  onToggleExpand?: (userId: number) => void;
  childrenByParent?: Record<number, Array<{ id: number; name: string; email?: string; createdAt?: string }>>;
  childIndentPx?: number;
}

const NetworkTable: React.FC<NetworkTableProps> = ({ items, activeTab, activeLevel, onToggleExpand, childrenByParent = {}, childIndentPx = 30 }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="space-y-2">
          {/** Determinar si el padre está expandido para resaltar su red */}
          <InfoBanner className="w-full h-16" backgroundColor={Array.isArray(childrenByParent[item.id]) ? "#3c3c3c" : "#212020"}>
            <div className="w-full flex items-center px-6 py-2">
              <div className="flex-1 grid grid-cols-6 gap-4">
                <div className="text-white text-sm relative flex items-center justify-center pl-6 cursor-pointer" onClick={() => onToggleExpand && onToggleExpand(item.id)}>
                  <DropDownTringle className="absolute left-0" />
                <span className="block w-full text-center">{item.email || `${item.name}@email.com`}</span>
                </div>
                <div className="text-white text-sm text-center">{item.createdAt ? new Date(item.createdAt).toISOString().slice(0,10) : '—'}</div>
                <div className="text-white text-sm text-center">{activeLevel}</div>
                <div className="text-white text-sm text-center">Resumen</div>
                <div className="text-white text-sm text-center">$0.00</div>
                <div className="text-[#FFF100] text-sm text-right">Ver arbol</div>
              </div>
            </div>
          </InfoBanner>
          {Array.isArray(childrenByParent[item.id]) && (
            <div className="space-y-2" style={{ marginLeft: `${childIndentPx}px` }}>
              {childrenByParent[item.id].map(child => (
                <InfoBanner key={child.id} className="w-full h-16" backgroundColor="#3c3c3c">
                  <div className="w-full flex items-center px-6 py-2">
                    <div className="flex-1 grid grid-cols-6 gap-4">
                      <div className="text-white text-sm text-center">{child.email || `${child.name}@email.com`}</div>
                      <div className="text-white text-sm text-center">{child.createdAt ? new Date(child.createdAt).toISOString().slice(0,10) : '—'}</div>
                      <div className="text-white text-sm text-center">{(activeLevel + 1)}</div>
                      <div className="text-white text-sm text-center">Resumen</div>
                      <div className="text-white text-sm text-center">$0.00</div>
                      <div className="text-[#FFF100] text-sm text-right">Ver arbol</div>
                    </div>
                  </div>
                </InfoBanner>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NetworkTable;

