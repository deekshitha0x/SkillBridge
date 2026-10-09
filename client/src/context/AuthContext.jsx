import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sb_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await apiFetch('/api/auth/me');
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('sb_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sb_token', newToken);
    localStorage.setItem('sb_user', JSON.stringify(newUser));
  };

  const loginWithCredentials = async (email, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      return data.user;
    } catch (err) {
      console.error('Login credentials error:', err);
      throw err;
    }
  };

  const signup = async ({ email, password, name, role }) => {
    try {
      const data = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role }),
      });
      login(data.token, data.user);
      return data.user;
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
  };

  const updateRole = async (role) => {
    try {
      const res = await apiFetch('/api/auth/role', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      if (res.token && res.user) {
        login(res.token, res.user);
      }
      return res.user;
    } catch (err) {
      console.error('Failed to update role:', err);
      throw err;
    }
  };

  const verifyAadhaarSimulated = async () => {
    try {
      const res = await apiFetch('/api/auth/aadhaar', {
        method: 'POST',
      });
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('sb_user', JSON.stringify(res.user));
      }
      return res.user;
    } catch (err) {
      console.error('Failed Aadhaar simulation:', err);
      throw err;
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('sb_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        loginWithCredentials,
        signup,
        logout,
        updateRole,
        verifyAadhaarSimulated,
        refreshUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
