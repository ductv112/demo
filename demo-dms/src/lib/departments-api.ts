// API client cho departments CRUD operations

import { api } from './api';
import type {
  DepartmentTreeNode,
  DepartmentTreeResponse,
  DepartmentResponse,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentUsersResponse,
  AssignUserPayload,
  TransferUserPayload,
  DepartmentListResponse,
} from '@/types/department';

/**
 * Fetch danh sách departments dạng flat (có pagination + filter)
 * Dùng cho 2-panel layout: hiển thị children của 1 node
 */
export async function getDepartments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null; // null = root-level departments
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<DepartmentListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.search?.trim()) queryParams.set('search', params.search.trim());
  if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);
  // parentId: truyền 'root' nếu null (root level), string nếu có parent
  if (params?.parentId !== undefined) {
    queryParams.set('parentId', params.parentId ?? 'root');
  }
  const response = await api.get<DepartmentListResponse>(
    `/departments?${queryParams}`
  );
  return response.data;
}

/**
 * Fetch department tree (hierarchical structure)
 */
export async function getDepartmentTree(): Promise<DepartmentTreeResponse> {
  const response = await api.get<DepartmentTreeResponse>('/departments/tree');
  return response.data;
}


/**
 * Fetch chi tiết 1 department (includes children, parent, _count)
 */
export async function getDepartment(id: string): Promise<{ data: DepartmentTreeNode }> {
  const response = await api.get<{ data: DepartmentTreeNode }>(`/departments/${id}`);
  return response.data;
}

/**
 * Tạo department mới
 */
export async function createDepartment(
  payload: CreateDepartmentPayload
): Promise<DepartmentResponse> {
  const response = await api.post<DepartmentResponse>('/departments', payload);
  return response.data;
}

/**
 * Cập nhật department
 */
export async function updateDepartment(
  id: string,
  payload: UpdateDepartmentPayload
): Promise<DepartmentResponse> {
  const response = await api.put<DepartmentResponse>(`/departments/${id}`, payload);
  return response.data;
}

/**
 * Xóa department
 */
export async function deleteDepartment(id: string): Promise<{ data: { success: boolean } }> {
  const response = await api.delete<{ data: { success: boolean } }>(`/departments/${id}`);
  return response.data;
}

/**
 * Lấy danh sách users trong department với pagination và search
 */
export async function getDepartmentUsers(
  departmentId: string,
  params?: { page?: number; limit?: number; search?: string }
): Promise<DepartmentUsersResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.search?.trim()) queryParams.set('search', params.search.trim());
  const response = await api.get<DepartmentUsersResponse>(
    `/departments/${departmentId}/users?${queryParams}`
  );
  return response.data;
}

/**
 * Gán user vào department
 */
export async function assignUserToDepartment(
  departmentId: string,
  payload: AssignUserPayload
): Promise<DepartmentResponse> {
  const response = await api.post<DepartmentResponse>(
    `/departments/${departmentId}/users`,
    payload
  );
  return response.data;
}

/**
 * Gỡ user khỏi department
 */
export async function removeUserFromDepartment(
  departmentId: string,
  userId: string
): Promise<{ data: { success: boolean } }> {
  const response = await api.delete<{ data: { success: boolean } }>(
    `/departments/${departmentId}/users/${userId}`
  );
  return response.data;
}

/**
 * Chuyển user giữa departments
 */
export async function transferUser(
  fromDepartmentId: string,
  payload: TransferUserPayload
): Promise<{ data: { success: boolean } }> {
  const response = await api.post<{ data: { success: boolean } }>(
    `/departments/${fromDepartmentId}/users/transfer`,
    payload
  );
  return response.data;
}

