import React from 'react';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface NetworkPaginationBarProps {
  totalItems: number;
  currentPage: number;
  usersLimit: number;
  onChangePage: (page: number) => void;
  onChangeLimit: (limit: number) => void;
}

const NetworkPaginationBar: React.FC<NetworkPaginationBarProps> = ({ totalItems, currentPage, usersLimit, onChangePage, onChangeLimit }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, usersLimit)));
  const shownSoFar = (currentPage - 1) * usersLimit;
  const remaining = Math.max(0, totalItems - shownSoFar);
  const showingCount = Math.min(usersLimit, remaining);
  const displayCount = Math.max(1, showingCount);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canPrev) onChangePage(currentPage - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canNext) onChangePage(currentPage + 1);
  };

  const handleLimit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!Number.isNaN(v)) onChangeLimit(v);
  };
  return (
    <div className="w-full h-[84px] flex items-center">
      <div className="h-9 flex items-center justify-between w-full">
        {/* Left: Showing select */}
        <div className="flex items-center gap-2 PaginationTextColor">
          <span>Showing</span>
          <NativeSelect value={String(displayCount)} onChange={handleLimit}>
            {Array.from({ length: 10 }).map((_, i) => (
              <NativeSelectOption key={i + 1} value={`${i + 1}`}>{i + 1}</NativeSelectOption>
            ))}
          </NativeSelect>
          <span>out of {totalItems}</span>
        </div>

        {/* Right: Pagination */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={handlePrev} />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              const isActive = page === currentPage;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={isActive}
                    onClick={(e) => { e.preventDefault(); onChangePage(page); }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext href="#" onClick={handleNext} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default NetworkPaginationBar;


