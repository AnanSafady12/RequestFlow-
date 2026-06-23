import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on boot to restore session
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch current user details
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Session restore failed:', error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.error || 'Invalid email or password.';
    }
  };

  // Registration handler
  const register = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      return response.data; // returns { message, user }
    } catch (error) {
      throw error.response?.data?.error || 'Failed to register account.';
    }
  };

  // Verify email code handler
  const verifyCode = async (email, code) => {
    try {
      const response = await api.post('/auth/verify-code', { email, code });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Verification code failed.';
    }
  };

  // Resend verification code handler
  const resendCode = async (email) => {
    try {
      const response = await api.post('/auth/resend-code', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to resend verification code.';
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyCode,
    resendCode,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
