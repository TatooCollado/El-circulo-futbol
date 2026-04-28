import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, rol } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

