import React from "react";
import { KIVOO_DIAGONAL_CLASSES, KIVOO_COLORS } from "../../styles/kivoo-animations";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "glass" | "kivoo-glass";
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = "default",
  options,
  className = "",
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const baseSelectClasses = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 appearance-none bg-white";

  const backdropBlurClasses = `backdrop-blur-[30px] ${KIVOO_COLORS.glass.background} ${KIVOO_COLORS.glass.border} ${KIVOO_COLORS.glass.text} focus:ring-yellow-400 focus:border-yellow-400 h-14 ${KIVOO_DIAGONAL_CLASSES.complete}`;

  const getSelectClasses = () => {
    if (variant === "glass" || variant === "kivoo-glass") {
      return error 
        ? `${backdropBlurClasses} border-red-400 focus:ring-red-400`
        : backdropBlurClasses;
    }
    return error 
      ? `${baseSelectClasses} border-red-300 focus:ring-red-500 focus:border-red-500`
      : `${baseSelectClasses} border-gray-300`;
  };

  const selectClasses = getSelectClasses();

  const selectWithIcons = leftIcon || rightIcon;
  const paddingClasses = selectWithIcons
    ? leftIcon && rightIcon
      ? "pl-12 pr-12"
      : leftIcon
        ? "pl-12"
        : "pr-12"
    : "px-6";

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative h-14">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}

        <select
          id={selectId}
          className={`${selectClasses} ${paddingClasses} h-full ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
