import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

interface User {
  joinDate: string | number | Date;
  id: string;
  email: string;
  name: string;
  preferredLanguage: string;
  currentDay: number;
  streak: number;
  mfaEnabled: boolean;
  totalProblemsCompleted: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, mfaToken?: string) => Promise<{ requiresMFA?: boolean }>;
  register: (email: string, password: string, name: string, preferredLanguage: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await authService.getCurrentUser(savedToken);
          setUser(response.user);
          setToken(savedToken);
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, mfaToken?: string) => {
    try {
      const response = await authService.login(email, password, mfaToken);
      
      if (response.requiresMFA) {
        return { requiresMFA: true };
      }
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      toast.success('Welcome back, warrior! Ready to conquer today\'s challenge?');
      return {};
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, preferredLanguage: string) => {
    try {
      const response = await authService.register(email, password, name, preferredLanguage);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      toast.success('Account created! Your 12-week transformation begins now.');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Session ended. Come back stronger tomorrow.');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};