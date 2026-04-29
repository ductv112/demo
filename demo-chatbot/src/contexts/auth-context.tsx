'use client';

/**
 * Auth context stub — PKKQ prototype, không Keycloak, không phân quyền.
 * Luôn authenticated với user demo "Đại tá Phạm Quốc Hưng — Giám đốc Nhà máy".
 */

import { createContext, useContext } from 'react';

interface AuthUser {
  keycloakId: string;
  username: string;
  email: string;
  roles: string[];
}

interface UserPermission {
  resource: string;
  action: string;
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

const DEMO_USER: AuthUser = {
  keycloakId: 'user-director',
  username: 'pqhung',
  email: 'pqhung@z119.mil.vn',
  roles: ['Giám đốc Nhà máy'],
};

// Wildcard permissions — user có mọi quyền
const DEMO_PERMISSIONS: UserPermission[] = [{ resource: '*', action: '*' }];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextValue = {
    user: DEMO_USER,
    isLoading: false,
    isAuthenticated: true,
    login: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
        } catch {
          /* ignore */
        }
        window.location.href = '/login';
      }
    },
    getAccessToken: () => 'stub-access-token',
    permissions: DEMO_PERMISSIONS,
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
