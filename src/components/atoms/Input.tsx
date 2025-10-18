import React from "react";
import { KIVOO_DIAGONAL_CLASSES, KIVOO_COLORS } from "../../styles/kivoo-animations";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "glass" | "kivoo-glass";
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = "default",
  className = "",
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseInputClasses = "block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500";
  
  const backdropBlurClasses = `backdrop-blur-[30px] ${KIVOO_COLORS.glass.background} ${KIVOO_COLORS.glass.border} ${KIVOO_COLORS.glass.borderHover} ${KIVOO_COLORS.glass.borderFocus} ${KIVOO_COLORS.glass.text} ${KIVOO_COLORS.glass.placeholder} h-14 text-center ${KIVOO_DIAGONAL_CLASSES.complete}`;
  
  const getInputClasses = () => {
    if (variant === "glass" || variant === "kivoo-glass") {
      return error 
        ? `${backdropBlurClasses} border-red-400 focus:ring-0 focus:outline-none`
        : backdropBlurClasses;
    }
    return error 
      ? `${baseInputClasses} border-red-300 focus:ring-red-500 focus:border-red-500`
      : `${baseInputClasses} border-gray-300`;
  };
  
  const inputClasses = getInputClasses();
  
  const inputWithIcons = leftIcon || rightIcon;
  const paddingClasses = inputWithIcons 
    ? leftIcon && rightIcon 
      ? "pl-12 pr-12" 
      : leftIcon 
        ? "pl-12 pr-6" 
        : "pl-6 pr-12"
    : "px-6";
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative h-14">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={`${inputClasses} ${paddingClasses} h-full ${variant === "glass" || variant === "kivoo-glass" ? "kivoo-input-focus" : ""} ${className}`}
          {...props}
        />
        
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

export default Input;
