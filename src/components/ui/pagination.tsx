import * as React from "react";
import { cn } from "@/lib/utils";

export const Pagination: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, ...props }) => (
  <nav className={cn("", className)} {...props} />
);

export const PaginationContent: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({ className, ...props }) => (
  <ul className={cn("flex items-center gap-2", className)} {...props} />
);

export const PaginationItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({ className, ...props }) => (
  <li className={cn("", className)} {...props} />
);

interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
}

export const PaginationLink: React.FC<PaginationLinkProps> = ({ className, isActive, children, ...props }) => (
  <a
    className={cn(
      "px-3 py-1 rounded-md text-sm PaginationTextColor",
      isActive ? "bg-[#2e2d29] text-white" : "hover:bg-[#2e2d29] hover:text-white",
      className
    )}
    {...props}
  >
    {children}
  </a>
);

export const PaginationPrevious: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, ...props }) => (
  <a className={cn("p-2 rounded-md", className)} {...props}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 3.5L5 8l4.5 4.5" stroke="#858585" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </a>
);

export const PaginationNext: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, ...props }) => (
  <a className={cn("p-2 rounded-md", className)} {...props}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 3.5L11 8l-4.5 4.5" stroke="#858585" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </a>
);

export const PaginationEllipsis: React.FC = () => (
  <span className="px-2 PaginationTextColor">…</span>
);


