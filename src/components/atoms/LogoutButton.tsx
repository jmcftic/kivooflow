import React, { useState } from "react";
import { authService } from "../../services/auth";
import { KIVOO_DIAGONAL_CLASSES } from "../../styles/kivoo-animations";

export interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  onLoggedOut?: () => void;
  compact?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLoggedOut, compact = true, ...buttonProps }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await authService.logout();
      if (onLoggedOut) onLoggedOut();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  const buttonClasses = compact 
    ? `bg-[#FFF100] text-gray-900 hover:bg-[#E6D900] focus:ring-[#FFF100] ${KIVOO_DIAGONAL_CLASSES.complete} rounded-xl font-semibold h-8 px-3 text-xs whitespace-nowrap flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 max-w-fit min-w-fit w-fit`
    : `bg-[#FFF100] text-gray-900 hover:bg-[#E6D900] focus:ring-[#FFF100] ${KIVOO_DIAGONAL_CLASSES.complete} rounded-xl font-semibold px-4 py-2 text-base h-12 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 max-w-fit min-w-fit w-fit`;

  return (
    <button
      onClick={handleClick}
      className={`${buttonClasses} ${buttonProps.className || ""}`}
      disabled={loading || buttonProps.disabled}
      {...buttonProps}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {loading ? "Cerrando..." : (buttonProps.children || "Logout")}
    </button>
  );
};

export default LogoutButton;


