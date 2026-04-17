import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setUnauthorizedHandler } from "../api/axios";
import { loginRequest, registerRequest } from "../services";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const isAuthenticated = Boolean(token);

  const setAuthToken = useCallback((newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }, []);

  const clearAuthToken = useCallback(() => {
    setToken("");
    localStorage.removeItem("token");
  }, []);

  const login = useCallback(
    async (email, password) => {
      const response = await loginRequest(email, password);
      const receivedToken = response?.data?.token;

      if (!receivedToken) {
        throw new Error("Login succeeded but token was not returned.");
      }

      setAuthToken(receivedToken);
      return response.data;
    },
    [setAuthToken]
  );

  const register = useCallback(async (name, email, password) => {
    const response = await registerRequest(name, email, password);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
  }, [clearAuthToken]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthToken();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearAuthToken]);

  const authValue = useMemo(
    () => ({
      token,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [token, isAuthenticated, login, register, logout]
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
