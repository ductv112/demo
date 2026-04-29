export type UserRole = 'admin' | 'manager' | 'director';

export interface SSOUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  rank: string;
  position: string;
  departmentId: string;
  departmentName: string;
  email: string;
  phone: string;
  avatar?: string;
  roleId: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  level: number;
  userCount: number;
  color: string;
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
}

export interface AppInfo {
  id: string;
  code: string;
  name: string;
  group: string;
  url: string;
  icon: string;
  badge: string;
}

export type PermissionLevel = 'none' | 'view' | 'edit' | 'approve' | 'full';

export interface UserPermission {
  userId: string;
  appId: string;
  permission: PermissionLevel;
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  department: string;
  ip: string;
  browser: string;
  loginTime: string;
  lastActivity: string;
  status: 'active' | 'expired' | 'revoked';
  currentApp?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: 'login' | 'logout' | 'switch_app' | 'failed_login' | 'password_change' | 'role_change' | 'lock_account';
  detail: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'failure';
}

export interface SystemSettings {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockDuration: number;
  twoFactorEnabled: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  totalApps: number;
  loginToday: number;
  failedLoginToday: number;
}
