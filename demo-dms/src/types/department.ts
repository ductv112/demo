export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  _count?: { userDepartments: number; children?: number };
}

export interface DepartmentTreeResponse {
  data: DepartmentTreeNode[];
}

export interface DepartmentResponse {
  data: Department;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
  parentId?: string | null;
  sortOrder?: number;
}

export interface DepartmentUser {
  id: string; // userDepartmentId
  userId: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  joinedAt: string;
  roles?: { id: string; name: string; displayName: string }[];
}

export interface DepartmentUsersResponse {
  data: DepartmentUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AssignUserPayload {
  userId: string;
}

export interface TransferUserPayload {
  userId: string;
  toDepartmentId: string;
}

// ── 2-panel departments page types ───────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Department item trả về từ GET /departments (list, không phải tree)
 * Bao gồm _count để hiển thị số nhân sự và số phòng ban con
 */
export interface DepartmentListItem extends Department {
  parent: { id: string; name: string; code: string } | null;
  _count: {
    userDepartments: number;
    children: number;
  };
}

export interface DepartmentListResponse {
  data: DepartmentListItem[];
  meta: PaginationMeta;
}

/**
 * Ancestor item dùng cho breadcrumb path
 */
export interface DepartmentAncestor {
  id: string;
  name: string;
}
