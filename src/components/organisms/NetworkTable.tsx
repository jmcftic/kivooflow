import React from 'react';
import InfoBanner from '../atoms/InfoBanner';
import DropDownTringle from '../atoms/DropDownTringle';
import LevelOneTag from '../atoms/LevelOneTag';
import LevelTwoTag from '../atoms/LevelTwoTag';
import LevelThreeTag from '../atoms/LevelThreeTag';
import { Spinner } from '@/components/ui/spinner';

interface NetworkTableProps {
  items: Array<{
    id: number;
    name: string;
    email?: string;
    createdAt?: string;
    totalDescendants?: number;
  }>;
  activeTab: 'b2c' | 'b2b' | 'b2t';
  activeLevel: 1 | 2 | 3;
  onToggleExpand?: (userId: number, level: number) => void;
  childrenByParent?: Record<number, Array<{ id: number; name: string; email?: string; createdAt?: string; totalDescendants?: number }>>;
  childIndentPx?: number;
  onViewTree?: (userId: number) => void;
  disableExpand?: boolean;
  onLoadMoreChildren?: (parentId: number, parentLevel: number) => void;
  parentHasMore?: Record<number, boolean>;
  parentLoading?: Record<number, boolean>;
  loadingTreeUserId?: number | null;
}



const NetworkTable: React.FC<NetworkTableProps> = ({ items, activeTab, activeLevel, onToggleExpand, childrenByParent = {}, childIndentPx = 30, onViewTree, disableExpand = false, onLoadMoreChildren, parentHasMore = {}, parentLoading = {}, loadingTreeUserId = null }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemLevel = (item as any).levelInSubtree ?? (item as any).level ?? activeLevel;
        const canExpand = !disableExpand && (item.totalDescendants ?? 0) > 0;
        const isExpanded = Array.isArray(childrenByParent[item.id]);
        const isLoading = loadingTreeUserId === item.id;

        return (
        <div key={item.id} className="space-y-2">
          {/** Determinar si el padre está expandido para resaltar su red */}
          <InfoBanner className="w-full h-16" backgroundColor={isExpanded ? "#3c3c3c" : "#212020"}>
            <div className="w-full flex items-center px-6 py-2">
              <div className="flex-1 grid grid-cols-6 gap-4">
                <div className="text-white text-sm relative flex items-center justify-center pl-6">
                  {canExpand && (
                    <DropDownTringle 
                      className="absolute left-0 cursor-pointer" 
                      isExpanded={isExpanded}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand && onToggleExpand(item.id, itemLevel as 1 | 2 | 3);
                      }}
                    />
                  )}
                  <span className="block w-full text-center">{item.email || `${item.name}@email.com`}</span>
                </div>
                <div className="text-white text-sm text-center">{item.createdAt ? new Date(item.createdAt).toISOString().slice(0,10) : '—'}</div>
                <div className="flex items-center justify-center">
                  {(() => {
                    if (itemLevel === 1) return <LevelOneTag />;
                    if (itemLevel === 2) return <LevelTwoTag />;
                    return <LevelThreeTag />;
                  })()}
                </div>
                <div className="text-white text-sm text-center">Resumen</div>
                <div className="text-white text-sm text-center">$0.00</div>
                <div className="text-sm text-right">
                  {itemLevel !== 3 ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[#FFF100] ${isLoading ? 'cursor-default opacity-70' : 'cursor-pointer'}`} onClick={() => !isLoading && onViewTree && onViewTree(item.id)}>
                        Ver arbol
                      </span>
                      {isLoading && <Spinner className="size-4 text-[#FFF100]" />}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </InfoBanner>
          {Array.isArray(childrenByParent[item.id]) && (
            <div className="space-y-2" style={{ marginLeft: `${childIndentPx}px` }}>
              {childrenByParent[item.id].map((child) => {
                const childLevel = (child as any).levelInSubtree ?? (child as any).level ?? Math.min(itemLevel + 1, 3);
                const childCanExpand = !disableExpand && (child.totalDescendants ?? 0) > 0;
                const childExpanded = Array.isArray(childrenByParent[child.id]);
                const childIsLoading = loadingTreeUserId === child.id;

                return (
                <div key={child.id} className="space-y-2">
                  <InfoBanner className="w-full h-16" backgroundColor="#3c3c3c">
                    <div className="w-full flex items-center px-6 py-2">
                      <div className="flex-1 grid grid-cols-6 gap-4">
                        <div className="text-white text-sm relative flex items-center justify-center pl-6">
                          {childCanExpand && (
                            <DropDownTringle 
                              className="absolute left-0 cursor-pointer" 
                              isExpanded={childExpanded}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand && onToggleExpand(child.id, childLevel as 1 | 2 | 3);
                              }}
                            />
                          )}
                          <span className="block w-full text-center">{child.email || `${child.name}@email.com`}</span>
                        </div>
                        <div className="text-white text-sm text-center">{child.createdAt ? new Date(child.createdAt).toISOString().slice(0,10) : '—'}</div>
                        <div className="flex items-center justify-center">
                          {childLevel === 1 && <LevelOneTag />}
                          {childLevel === 2 && <LevelTwoTag />}
                          {childLevel === 3 && <LevelThreeTag />}
                        </div>
                        <div className="text-white text-sm text-center">Resumen</div>
                        <div className="text-white text-sm text-center">$0.00</div>
                        <div className="text-sm text-right">
                          {childLevel !== 3 ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-[#FFF100] ${childIsLoading ? 'cursor-default opacity-70' : 'cursor-pointer'}`} onClick={() => !childIsLoading && onViewTree && onViewTree(child.id)}>
                                Ver arbol
                              </span>
                              {childIsLoading && <Spinner className="size-4 text-[#FFF100]" />}
                            </div>
                          ) : null}
                        </div>
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
                              <div className="text-sm text-right">{/* Nivel 3 no tiene "Ver arbol" */}</div>
                            </div>
                          </div>
                        </InfoBanner>
                      ))}
                      {!disableExpand && parentHasMore[child.id] && (
                        <div className="w-full flex items-center justify-center py-2">
                          <button
                            className="text-[#FFF000] text-sm hover:text-[#E6D900] transition-colors flex items-center gap-2"
                            onClick={() => onLoadMoreChildren && onLoadMoreChildren(child.id, childLevel as 1 | 2 | 3)}
                            disabled={!!parentLoading[child.id]}
                          >
                            {parentLoading[child.id] ? 'Cargando...' : 'Cargar más'}
                            {parentLoading[child.id] && <Spinner className="size-4 text-[#FFF100]" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
              {!disableExpand && parentHasMore[item.id] && (
                <div className="w-full flex items-center justify-center py-2">
                  <button
                    className="text-[#FFF000] text-sm hover:text-[#E6D900] transition-colors flex items-center gap-2"
                    onClick={() => onLoadMoreChildren && onLoadMoreChildren(item.id, itemLevel as 1 | 2 | 3)}
                    disabled={!!parentLoading[item.id]}
                  >
                    {parentLoading[item.id] ? 'Cargando...' : 'Cargar más'}
                    {parentLoading[item.id] && <Spinner className="size-4 text-[#FFF100]" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};

export default NetworkTable;

