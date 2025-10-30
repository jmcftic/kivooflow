import * as React from "react";
import { cn } from "@/lib/utils";

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-9 px-3 pr-8 rounded-md bg-[#2e2d29] text-white text-sm PaginationTextColor",
          "border PaginationSelectBorder focus:outline-none focus:ring-0",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

export interface NativeSelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

export const NativeSelectOption: React.FC<NativeSelectOptionProps> = ({ children, ...props }) => (
  <option {...props}>{children}</option>
);


