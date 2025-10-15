import React from "react";
import { KIVOO_DIAGONAL_CLASSES, KIVOO_COLORS } from "../../styles/kivoo-animations";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "yellow" | "kivoo-primary" | "kivoo-secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    yellow: `bg-[#FFF100] text-gray-900 hover:bg-[#E6D900] focus:ring-[#FFF100] ${KIVOO_DIAGONAL_CLASSES.complete}`,
    "kivoo-primary": `bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-[#3B82F6] ${KIVOO_DIAGONAL_CLASSES.complete}`,
    "kivoo-secondary": "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 " + KIVOO_DIAGONAL_CLASSES.complete
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm h-10",
    md: "px-4 py-2 text-base h-12",
    lg: "px-6 py-3 text-lg h-14"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
