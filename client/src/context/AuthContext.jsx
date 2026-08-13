import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await API.get("/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await API.post("/auth/login", credentials);
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await API.post("/auth/register", userData);
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
