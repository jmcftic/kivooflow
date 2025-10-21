import React, { useState } from "react";
import { authService } from "../../services/auth";
import { KIVOO_DIAGONAL_COMPACT } from "../../styles/kivoo-animations";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface LogoutButtonProps {
  children?: React.ReactNode;
  onLoggedOut?: () => void;
  compact?: boolean;
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onLoggedOut, 
  compact = true, 
  className = "",
  children,
  ...props 
}) => {
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

  return (
    <Button
      onClick={handleClick}
      variant="yellow"
      size={compact ? "sm" : "default"}
      className={cn(
        KIVOO_DIAGONAL_COMPACT.complete,
        "font-semibold relative z-50 min-w-fit",
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && <Spinner className="mr-2 text-black" />}
      {loading ? "Cerrando..." : (children || "Logout")}
    </Button>
  );
};

export default LogoutButton;


