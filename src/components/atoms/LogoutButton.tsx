import React, { useState } from "react";
import Button from "./Button";
import { authService } from "../../services/auth";

export interface LogoutButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "children"> {
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

  const mergedClassName = `${buttonProps.className || "rounded-xl font-semibold"} ${compact ? "h-6 px-2 text-xs" : ""}`;

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      variant={buttonProps.variant || "yellow"}
      size={buttonProps.size || "sm"}
      className={mergedClassName}
      disabled={loading || buttonProps.disabled}
    >
      {loading ? "Cerrando..." : (buttonProps.children || "Logout")}
    </Button>
  );
};

export default LogoutButton;


