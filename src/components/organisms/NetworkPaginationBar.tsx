import React from 'react';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface NetworkPaginationBarProps {
  totalItems: number;
  currentPage: number;
  usersLimit: number;
  onChangePage: (page: number) => void;
  onChangeLimit: (limit: number) => void;
  totalPages?: number; // Prop opcional para usar totalPages del backend cuando esté disponible
}

const allowedLimits = [10, 20, 50] as const;

const NetworkPaginationBar: React.FC<NetworkPaginationBarProps> = ({ totalItems, currentPage, usersLimit, onChangePage, onChangeLimit, totalPages: backendTotalPages }) => {
  const effectiveLimit = allowedLimits.includes(usersLimit as (typeof allowedLimits)[number]) ? usersLimit : allowedLimits[0];
  // Usar totalPages del backend si está disponible, sino calcularlo basado en totalItems
  const totalPages = backendTotalPages !== undefined && backendTotalPages > 0 
    ? backendTotalPages 
    : Math.max(1, Math.ceil(totalItems / Math.max(1, effectiveLimit)));
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
    if (!Number.isNaN(v) && allowedLimits.includes(v as (typeof allowedLimits)[number])) {
      onChangeLimit(v);
    }
  };
  return (
    <div className="w-full h-[84px] flex items-center">
      <div className="h-9 flex items-center justify-between w-full">
        {/* Left: Showing select */}
        <div className="flex items-center PaginationTextColor">
          <NativeSelect value={String(effectiveLimit)} onChange={handleLimit}>
            {allowedLimits.map((option) => (
              <NativeSelectOption key={option} value={`${option}`}>
                {option}
              </NativeSelectOption>
            ))}
          </NativeSelect>
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


