import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/auth";
import { User } from "../../types/auth";

export interface ProtectedRouteProps {
  children: React.ReactElement;
  redirectTo?: string;
  allowed?: boolean;
  userCheck?: (user: User | null) => boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = "/", allowed = true, userCheck }) => {
  const location = useLocation();
  const { t } = useTranslation('navigation');
  const isAuthed = authService.isAuthenticated();

  if (!isAuthed) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace state={{ from: location, message: t('messages.moduleComingSoon') }} />;
  }

  // Si hay una función de verificación de usuario, verificar
  if (userCheck) {
    const user = authService.getStoredUser();
    if (!userCheck(user)) {
      return <Navigate to="/dashboard" replace state={{ from: location, message: t('messages.noPermission') }} />;
    }
  }

  return children;
};

export default ProtectedRoute;


