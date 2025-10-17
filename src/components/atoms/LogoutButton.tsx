import React, { useState } from "react";
import { authService } from "../../services/auth";
import { KIVOO_DIAGONAL_COMPACT } from "../../styles/kivoo-animations";

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
      // Clear any remaining tokens manually
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Clear tokens even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  const buttonClasses = compact 
    ? `bg-[#FFF100] text-gray-900 hover:bg-[#E6D900] focus:ring-[#FFF100] ${KIVOO_DIAGONAL_COMPACT.complete} font-semibold h-6 px-4 text-base whitespace-nowrap flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-fit max-w-xs relative z-50`
    : `bg-[#FFF100] text-gray-900 hover:bg-[#E6D900] focus:ring-[#FFF100] ${KIVOO_DIAGONAL_COMPACT.complete} font-semibold h-6 px-4 text-base flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-fit max-w-xs relative z-50`;

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


