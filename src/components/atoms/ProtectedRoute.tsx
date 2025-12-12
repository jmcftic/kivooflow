import React from "react";
import { Navigate, useLocation } from "react-router-dom";
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
  const isAuthed = authService.isAuthenticated();

  if (!isAuthed) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace state={{ from: location, message: "El módulo estará próximamente disponible" }} />;
  }

  // Si hay una función de verificación de usuario, verificar
  if (userCheck) {
    const user = authService.getStoredUser();
    if (!userCheck(user)) {
      return <Navigate to="/dashboard" replace state={{ from: location, message: "No tienes permisos para acceder a esta sección" }} />;
    }
  }

  return children;
};

export default ProtectedRoute;


