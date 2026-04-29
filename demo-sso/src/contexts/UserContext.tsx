import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SSOUser } from '../types';
import { checkAuth, getCurrentUser, login as ssoLogin, logout as ssoLogout } from '../utils/ssoAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: SSOUser | null;
  login: (username: string, password: string) => { success: boolean; user?: SSOUser; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuth());
  const [currentUser, setCurrentUser] = useState<SSOUser | null>(() => getCurrentUser());

  const login = useCallback((username: string, password: string) => {
    const result = ssoLogin(username, password);
    if (result.success && result.user) {
      setIsAuthenticated(true);
      setCurrentUser(result.user);
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(() => {
    ssoLogout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
