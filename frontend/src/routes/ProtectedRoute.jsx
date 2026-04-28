import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, rol } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
