export interface UserRole {
  id: string;
  name: string;
  displayName: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  roles: UserRole[];
  userDepartments?: { id: string }[]; // Để check user đã có department chưa
  // Phase 27: Department info từ API
  department?: { id: string; name: string; code: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  department: { id: string; name: string; code: string } | null;
  roles: { id: string; name: string; displayName: string }[];
  createdAt: string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  data: User;
}
