'use client';

import { createContext, useContext, useCallback } from 'react';
import type { UserPermission } from '@/types/permission';

/**
 * Stub auth context cho PKKQ DMS prototype.
 * User luôn được đăng nhập, permissions wildcard — không gọi Keycloak.
 */

interface AuthUser {
  keycloakId: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectPath?: string, rememberMe?: boolean) => void;
  logout: () => void;
  getAccessToken: () => string | null;
  permissions: UserPermission[];
}

const STUB_USER: AuthUser = {
  keycloakId: 'user-1',
  username: 'hoangmt',
  email: 'hmtuan@z119.mil.vn',
  roles: ['department_manager'],
};

// Wildcard permission — người dùng demo có toàn quyền
const STUB_PERMISSIONS: UserPermission[] = [{ resource: '*', action: '*' }];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = useCallback(async (redirectPath?: string, _rememberMe?: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pkkq_authenticated', 'true');
      window.location.href = redirectPath ?? '/';
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pkkq_authenticated');
      window.location.href = '/login';
    }
  }, []);

  const getAccessToken = useCallback((): string | null => 'mock.access.token', []);

  const value: AuthContextValue = {
    user: STUB_USER,
    isLoading: false,
    isAuthenticated: true,
    login,
    logout,
    getAccessToken,
    permissions: STUB_PERMISSIONS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
