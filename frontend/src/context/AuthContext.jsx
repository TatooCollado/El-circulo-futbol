import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

const storedUser = () => {
  const rawUser = localStorage.getItem("user");
  return rawUser ? JSON.parse(rawUser) : null;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(storedUser);

  const saveSession = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    saveSession(data);
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleExpiredSession = () => {
      setToken(null);
      setUser(null);
      window.location.assign("/login?session=expired");
    };

    window.addEventListener("auth:expired", handleExpiredSession);

    return () => {
      window.removeEventListener("auth:expired", handleExpiredSession);
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      rol: user?.rol,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
