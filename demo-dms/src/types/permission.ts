export interface PermissionAction {
  key: string;
  displayName: string;
}

export interface PermissionResource {
  key: string;
  displayName: string;
  actions: PermissionAction[];
}

export interface UserPermission {
  resource: string;
  action: string;
}

export interface DepartmentPermissionInfo {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  roleName: string | null;
  roleDisplayName: string | null;
  permissions: string[];
}

export interface MyPermissionsResponse {
  userId: string;
  username: string;
  permissions: UserPermission[];           // backward compatible
  systemPermissions: UserPermission[];     // mới
  departmentPermissions: DepartmentPermissionInfo[];  // mới
}

export interface RolePermissionsResponse {
  roleName: string;
  roleDisplayName: string;
  permissions: UserPermission[];
}

// Resource Permission types (Phase 18 ACL)
export type ResourceType = 'FOLDER' | 'DOCUMENT';
export type GranteeType = 'USER' | 'DEPARTMENT';
export type PermissionLevel = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface ResourcePermission {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  granteeType: GranteeType;
  granteeId: string;
  level: PermissionLevel;
  inherited: boolean;
  createdAt: string;
  createdBy: string;
}

export interface EnrichedPermission extends ResourcePermission {
  granteeName: string;
  granteeDisplayName?: string;
  granteeEmail?: string;
  memberCount?: number; // số thành viên cho DEPARTMENT rows
}

export interface ShareResourceParams {
  resourceType: ResourceType;
  resourceId: string;
  granteeType: GranteeType;
  granteeId: string;
  level: PermissionLevel;
}
