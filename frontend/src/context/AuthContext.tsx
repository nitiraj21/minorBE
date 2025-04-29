import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { loginUser, registerUser, loginAdmin, registerAdmin } from '../api/auth';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminRegister: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (token) {
      try {
        // Decode token to get user info
        const decoded: any = jwtDecode(token);
        
        setAuthState({
          isAuthenticated: true,
          isAdmin,
          user: { _id: decoded.id, name: '', email: '' }, // Basic user info
          token,
          loading: false,
          error: null,
        });
      } catch (error) {
        // Invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          token: null,
          loading: false,
          error: null,
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAdmin', 'false');
      
      // Decode token to get user info
      const decoded: any = jwtDecode(data.token);
      
      setAuthState({
        isAuthenticated: true,
        isAdmin: false,
        user: { _id: decoded.id, name: '', email: '' }, // Basic user info
        token: data.token,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Failed to log in',
      }));
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await registerUser(name, email, password);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Failed to register',
      }));
      throw error;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const data = await loginAdmin(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAdmin', 'true');
      
      // Decode token to get user info
      const decoded: any = jwtDecode(data.token);
      
      setAuthState({
        isAuthenticated: true,
        isAdmin: true,
        user: { _id: decoded.id, name: '', email: '' },
        token: data.token,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Failed to log in as admin',
      }));
      throw error;
    }
  };

  const adminRegister = async (name: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await registerAdmin(name, email, password);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Failed to register as admin',
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setAuthState({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        adminLogin,
        adminRegister,
        logout,
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