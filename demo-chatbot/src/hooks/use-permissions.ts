'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

export function usePermissions() {
  const { permissions } = useAuth();

  const hasPermission = useCallback(
    (permission: string): boolean => {
      const hasWildcard = permissions.some(
        (p) => (p.resource === '*' && p.action === '*')
      );
      if (hasWildcard) return true;

      const [resource, action] = permission.split(':');
      return permissions.some(
        (p) => p.resource === resource && p.action === action
      );
    },
    [permissions]
  );

  // Kiểm tra user có phải system_admin không (wildcard permissions)
  const isSystemAdmin = permissions.some(
    (p) => p.resource === '*' && p.action === '*'
  );

  // Kiểm tra user có BẤT KỲ quyền nào trên resource không
  const hasAnyResourcePermission = useCallback(
    (resource: string): boolean => {
      if (isSystemAdmin) return true;
      return permissions.some((p) => p.resource === resource);
    },
    [isSystemAdmin, permissions]
  );

  return { hasPermission, hasAnyResourcePermission, isSystemAdmin, permissions };
}
