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
      setUser(null);
    } finally {
      setLoading(false);
    }
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
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
