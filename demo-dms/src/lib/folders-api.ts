// API client cho Folders operations

import { api } from './api';
import type { FolderTreeResponse, Folder, FolderChildrenResponse } from '@/types/folder';

/**
 * Lấy folder tree với documentCount per folder
 * @param departmentId - optional: UUID | 'personal' | 'all' để filter folders theo phòng ban (Phase 30)
 */
export async function getFolderTree(departmentId?: string): Promise<FolderTreeResponse> {
  const url = departmentId
    ? `/folders/tree?departmentId=${encodeURIComponent(departmentId)}`
    : '/folders/tree';
  const response = await api.get<FolderTreeResponse>(url);
  return response.data;
}

/**
 * Tạo folder mới
 * @param data.departmentId - optional: gắn folder vào phòng ban (Phase 30)
 */
export async function createFolder(data: { name: string; parentId?: string; departmentId?: string | null }): Promise<{ data: Folder }> {
  const response = await api.post<{ data: Folder }>('/folders', data);
  return response.data;
}

/**
 * Cập nhật folder (rename)
 */
export async function updateFolder(id: string, data: { name: string }): Promise<{ data: Folder }> {
  const response = await api.put<{ data: Folder }>(`/folders/${id}`, data);
  return response.data;
}

/**
 * Xóa folder
 */
export async function deleteFolder(id: string): Promise<{ data: { success: boolean } }> {
  const response = await api.delete<{ data: { success: boolean } }>(`/folders/${id}`);
  return response.data;
}

/**
 * Lấy thông tin số subfolder và tài liệu trong folder (phục vụ confirm dialog xóa)
 */
export async function getFolderStats(id: string): Promise<{ data: { subfolderCount: number; documentCount: number } }> {
  const response = await api.get<{ data: { subfolderCount: number; documentCount: number } }>(`/folders/${id}/stats`);
  return response.data;
}

/**
 * Lấy danh sách unified (folders + documents) phân trang server-side cho 1 level
 * Folders luôn xuất hiện trước documents trong cùng trang.
 */
export async function listFolderChildren(params: {
  parentId?: string | null;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'ACTIVE' | 'INACTIVE'; // Phase 72.1: filter tài liệu theo trạng thái
}): Promise<FolderChildrenResponse> {
  const searchParams = new URLSearchParams();
  if (params.parentId !== undefined) {
    searchParams.set('parentId', params.parentId ?? 'root');
  }
  if (params.departmentId) searchParams.set('departmentId', params.departmentId);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.status) searchParams.set('status', params.status);

  const qs = searchParams.toString();
  const url = `/folders/children${qs ? `?${qs}` : ''}`;
  const response = await api.get<FolderChildrenResponse>(url);
  return response.data;
}
