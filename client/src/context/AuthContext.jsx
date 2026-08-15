<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      // 401 just means no active session
=======
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
>>>>>>> upstream/main
      setUser(null);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
      return data.user;
    } catch (err) {
      setAuthError(err.message || 'Failed to login');
      throw err;
    }
  };

  // Signup handler
  const signup = async (name, email, password) => {
    setAuthError(null);
    try {
      const data = await api.signup({ name, email, password });
      setUser(data.user);
      return data.user;
    } catch (err) {
      setAuthError(err.message || 'Failed to sign up');
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
=======
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
>>>>>>> upstream/main
    } finally {
      setUser(null);
    }
  };

<<<<<<< HEAD
=======
  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

>>>>>>> upstream/main
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
<<<<<<< HEAD
        authError,
        login,
        signup,
        logout,
        checkAuth,
=======
        login,
        register,
        logout,
        checkAuth,
        updateUserState,
>>>>>>> upstream/main
      }}
    >
      {children}
    </AuthContext.Provider>
  );
<<<<<<< HEAD
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
=======
}

export const useAuth = () => useContext(AuthContext);
>>>>>>> upstream/main
