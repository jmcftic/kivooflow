import React from 'react';
import InfoBanner from '../atoms/InfoBanner';
import DropDownTringle from '../atoms/DropDownTringle';
import LevelOneTag from '../atoms/LevelOneTag';
import LevelTwoTag from '../atoms/LevelTwoTag';
import LevelThreeTag from '../atoms/LevelThreeTag';

interface NetworkTableProps {
  items: Array<{
    id: number;
    name: string;
    email?: string;
    createdAt?: string;
  }>;
  activeTab: 'b2c' | 'b2b' | 'b2t';
  activeLevel: 1 | 2 | 3;
  onToggleExpand?: (userId: number, level: number) => void;
  childrenByParent?: Record<number, Array<{ id: number; name: string; email?: string; createdAt?: string }>>;
  childIndentPx?: number;
  onViewTree?: (userId: number) => void;
  disableExpand?: boolean;
  onLoadMoreChildren?: (parentId: number, parentLevel: number) => void;
  parentHasMore?: Record<number, boolean>;
  parentLoading?: Record<number, boolean>;
}



const NetworkTable: React.FC<NetworkTableProps> = ({ items, activeTab, activeLevel, onToggleExpand, childrenByParent = {}, childIndentPx = 30, onViewTree, disableExpand = false, onLoadMoreChildren, parentHasMore = {}, parentLoading = {} }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="space-y-2">
          {/** Determinar si el padre está expandido para resaltar su red */}
          <InfoBanner className="w-full h-16" backgroundColor={Array.isArray(childrenByParent[item.id]) ? "#3c3c3c" : "#212020"}>
            <div className="w-full flex items-center px-6 py-2">
              <div className="flex-1 grid grid-cols-6 gap-4">
                <div className={`text-white text-sm relative flex items-center justify-center pl-6 ${disableExpand ? '' : 'cursor-pointer'}`} onClick={() => !disableExpand && onToggleExpand && onToggleExpand(item.id, activeLevel)}>
                  {!disableExpand && <DropDownTringle className="absolute left-0" />}
                <span className="block w-full text-center">{item.email || `${item.name}@email.com`}</span>
                </div>
                <div className="text-white text-sm text-center">{item.createdAt ? new Date(item.createdAt).toISOString().slice(0,10) : '—'}</div>
                <div className="flex items-center justify-center">
                  {(() => {
                    const levelForTag = (item as any).levelInSubtree ?? activeLevel;
                    if (levelForTag === 1) return <LevelOneTag />;
                    if (levelForTag === 2) return <LevelTwoTag />;
                    return <LevelThreeTag />;
                  })()}
                </div>
                <div className="text-white text-sm text-center">Resumen</div>
                <div className="text-white text-sm text-center">$0.00</div>
                <div className="text-[#FFF100] text-sm text-right cursor-pointer" onClick={() => onViewTree && onViewTree(item.id)}>Ver arbol</div>
              </div>
            </div>
          </InfoBanner>
          {Array.isArray(childrenByParent[item.id]) && (
            <div className="space-y-2" style={{ marginLeft: `${childIndentPx}px` }}>
              {childrenByParent[item.id].map(child => (
                <div key={child.id} className="space-y-2">
                  <InfoBanner className="w-full h-16" backgroundColor="#3c3c3c">
                    <div className="w-full flex items-center px-6 py-2">
                      <div className="flex-1 grid grid-cols-6 gap-4">
                        <div className={`text-white text-sm relative flex items-center justify-center pl-6 ${disableExpand ? '' : 'cursor-pointer'}`} onClick={() => !disableExpand && onToggleExpand && onToggleExpand(child.id, (activeLevel + 1) as 1 | 2 | 3)}>
                          {!disableExpand && <DropDownTringle className="absolute left-0" />}
                          <span className="block w-full text-center">{child.email || `${child.name}@email.com`}</span>
                        </div>
                        <div className="text-white text-sm text-center">{child.createdAt ? new Date(child.createdAt).toISOString().slice(0,10) : '—'}</div>
                        <div className="flex items-center justify-center">
                          {activeLevel + 1 === 1 && <LevelOneTag />}
                          {activeLevel + 1 === 2 && <LevelTwoTag />}
                          {activeLevel + 1 === 3 && <LevelThreeTag />}
                        </div>
                        <div className="text-white text-sm text-center">Resumen</div>
                        <div className="text-white text-sm text-center">$0.00</div>
                        <div className="text-[#FFF100] text-sm text-right cursor-pointer" onClick={() => onViewTree && onViewTree(child.id)}>Ver arbol</div>
                      </div>
                    </div>
                  </InfoBanner>
                  {Array.isArray(childrenByParent[child.id]) && (
                    <div className="space-y-2" style={{ marginLeft: `${Math.round(childIndentPx * 1.2)}px` }}>
                      {childrenByParent[child.id].map(grand => (
                        <InfoBanner key={grand.id} className="w-full h-16" backgroundColor="#3c3c3c">
                          <div className="w-full flex items-center px-6 py-2">
                            <div className="flex-1 grid grid-cols-6 gap-4">
                              <div className="text-white text-sm relative pl-10 text-left">{grand.email || `${grand.name}@email.com`}</div>
                              <div className="text-white text-sm text-center">{grand.createdAt ? new Date(grand.createdAt).toISOString().slice(0,10) : '—'}</div>
                              <div className="flex items-center justify-center">
                                <LevelThreeTag />
                              </div>
                              <div className="text-white text-sm text-center">Resumen</div>
                              <div className="text-white text-sm text-center">$0.00</div>
                              <div className="text-[#FFF100] text-sm text-right">Ver arbol</div>
                            </div>
                          </div>
                        </InfoBanner>
                      ))}
                      {!disableExpand && parentHasMore[child.id] && (
                        <div className="w-full flex items-center justify-center py-2">
                          <button
                            className="text-[#FFF000] text-sm hover:text-[#E6D900] transition-colors"
                            onClick={() => onLoadMoreChildren && onLoadMoreChildren(child.id, (activeLevel + 1) as 1 | 2 | 3)}
                            disabled={!!parentLoading[child.id]}
                          >
                            {parentLoading[child.id] ? 'Cargando...' : 'Cargar más'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {!disableExpand && parentHasMore[item.id] && (
                <div className="w-full flex items-center justify-center py-2">
                  <button
                    className="text-[#FFF000] text-sm hover:text-[#E6D900] transition-colors"
                    onClick={() => onLoadMoreChildren && onLoadMoreChildren(item.id, activeLevel)}
                    disabled={!!parentLoading[item.id]}
                  >
                    {parentLoading[item.id] ? 'Cargando...' : 'Cargar más'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NetworkTable;

