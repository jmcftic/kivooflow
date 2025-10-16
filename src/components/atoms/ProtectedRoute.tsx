import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../services/auth";

export interface ProtectedRouteProps {
  children: React.ReactElement;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = "/" }) => {
  const location = useLocation();
  const isAuthed = authService.isAuthenticated();

  if (!isAuthed) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;


