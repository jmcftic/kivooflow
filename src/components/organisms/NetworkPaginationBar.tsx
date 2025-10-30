import React from 'react';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface NetworkPaginationBarProps {
  totalItems: number;
  currentPage?: number;
}

const NetworkPaginationBar: React.FC<NetworkPaginationBarProps> = ({ totalItems, currentPage = 1 }) => {
  return (
    <div className="w-full h-[84px] flex items-center">
      <div className="h-9 flex items-center justify-between w-full">
        {/* Left: Showing select */}
        <div className="flex items-center gap-2 PaginationTextColor">
          <span>Showing</span>
          <NativeSelect defaultValue="10">
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
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default NetworkPaginationBar;


