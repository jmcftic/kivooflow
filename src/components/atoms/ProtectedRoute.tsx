import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../services/auth";

export interface ProtectedRouteProps {
  children: React.ReactElement;
  redirectTo?: string;
  allowed?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = "/", allowed = true }) => {
  const location = useLocation();
  const isAuthed = authService.isAuthenticated();

  if (!isAuthed) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace state={{ from: location, message: "El módulo estará próximamente disponible" }} />;
  }

  return children;
};

export default ProtectedRoute;


