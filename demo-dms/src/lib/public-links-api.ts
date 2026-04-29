// API client cho Public Links operations

import { api } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PublicLink {
  id: string;
  token: string;
  resourceType: 'DOCUMENT' | 'FOLDER';
  resourceId: string;
  permissionLevel: 'VIEWER' | 'EDITOR';
  isActive: boolean;
  createdAt: string;
  url: string;
}

export interface PublicLinkAccess {
  type: 'DOCUMENT' | 'FOLDER';
  permissionLevel?: 'VIEWER' | 'EDITOR' | 'OWNER';
  document?: {
    id: string;
    title: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  };
  downloadUrl?: string;
  folder?: {
    id: string;
    name: string;
  };
  documents?: Array<{
    id: string;
    title: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }>;
}

/**
 * Tạo public link cho document hoặc folder (authenticated)
 * Idempotent — trả link cũ nếu đã tồn tại (per permissionLevel)
 */
export async function createPublicLink(
  resourceType: 'DOCUMENT' | 'FOLDER',
  resourceId: string,
  permissionLevel?: 'VIEWER' | 'EDITOR'
): Promise<PublicLink> {
  const res = await api.post('/public-links', {
    resourceType,
    resourceId,
    permissionLevel: permissionLevel || 'VIEWER',
  });
  return res.data.data;
}

/**
 * Lấy danh sách public links của user hiện tại (authenticated)
 */
export async function getMyPublicLinks(): Promise<PublicLink[]> {
  const res = await api.get('/public-links/my');
  return res.data.data;
}

/**
 * Thu hồi public link (authenticated)
 */
export async function revokePublicLink(id: string): Promise<void> {
  await api.delete(`/public-links/${id}`);
}

/**
 * Cập nhật permissionLevel của public link — URL KHÔNG đổi (authenticated)
 * Giống Google Drive: đổi quyền trên cùng 1 link
 */
export async function updatePublicLinkPermission(
  id: string,
  permissionLevel: 'VIEWER' | 'EDITOR'
): Promise<PublicLink> {
  const res = await api.patch(`/public-links/${id}`, { permissionLevel });
  return res.data.data;
}

/**
 * Truy cập public link (KHÔNG cần auth token)
 * Dùng fetch native vì api.ts Axios instance attach Bearer token
 */
export async function accessPublicLink(token: string): Promise<PublicLinkAccess> {
  const res = await fetch(`${API_URL}/public-links/access/${token}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Liên kết không hợp lệ' } }));
    throw new Error(error.error?.message || 'Liên kết không hợp lệ');
  }
  const json = await res.json();
  return json.data;
}

/**
 * Lấy URL download cho single document public link (KHÔNG cần auth)
 * Backend stream file với Content-Disposition: attachment → browser tự download
 */
export function getPublicDocumentSingleDownloadUrl(token: string): string {
  return `${API_URL}/public-links/access/${token}/download`;
}

/**
 * Lấy URL download cho document trong folder public link (KHÔNG cần auth)
 */
export function getPublicDocumentDownloadUrl(token: string, documentId: string): string {
  return `${API_URL}/public-links/access/${token}/download/${documentId}`;
}

/**
 * Fetch blob content của document qua public link (KHÔNG cần auth)
 * Dùng cho preview — trả Blob để tạo blob URL
 */
export async function fetchPublicDocumentBlob(token: string): Promise<Blob> {
  const res = await fetch(`${API_URL}/public-links/access/${token}/stream`);
  if (!res.ok) {
    throw new Error('Không thể tải nội dung file');
  }
  return res.blob();
}

/**
 * Fetch blob content của 1 document trong shared folder (KHÔNG cần auth)
 */
export async function fetchPublicFolderDocBlob(token: string, documentId: string): Promise<Blob> {
  const res = await fetch(`${API_URL}/public-links/access/${token}/stream/${documentId}`);
  if (!res.ok) {
    throw new Error('Không thể tải nội dung file');
  }
  return res.blob();
}

/**
 * Helper: lấy Authorization header nếu user đang đăng nhập
 * Trả {} nếu không có token (guest mode)
 */
function getOptionalAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Save binary file (DOCX/XLSX) qua public link — EDITOR only
 * Gửi Authorization header nếu user đang đăng nhập (để track account thực sự)
 * Vẫn hoạt động bình thường nếu không có token (guest mode)
 */
export async function publicSaveFile(token: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  // KHÔNG set Content-Type — browser tự thêm boundary cho FormData
  const res = await fetch(`${API_URL}/public-links/access/${token}/save-file`, {
    method: 'PUT',
    headers: { ...getOptionalAuthHeader() },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Lưu thất bại' } }));
    throw new Error(error.error?.message || 'Lưu thất bại');
  }
}

/**
 * Convert PPTX sang images qua backend proxy (KHÔNG cần auth)
 * Backend proxy request đến AI service nội bộ — tránh browser gọi trực tiếp AI service
 */
export async function fetchPublicPptxToImages(token: string): Promise<{ total: number; slides: { page: number; data: string }[] }> {
  const res = await fetch(`${API_URL}/public-links/access/${token}/pptx-to-images`, {
    method: 'POST',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Không thể convert file PowerPoint' }));
    throw new Error(error?.message || error?.error?.message || 'Không thể convert file PowerPoint');
  }
  return res.json();
}

/**
 * Save text content qua public link — EDITOR only
 * Gửi Authorization header nếu user đang đăng nhập (để track account thực sự)
 * Vẫn hoạt động bình thường nếu không có token (guest mode)
 */
export async function publicSaveContent(token: string, content: string): Promise<void> {
  const res = await fetch(`${API_URL}/public-links/access/${token}/save-content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getOptionalAuthHeader(),
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Lưu thất bại' } }));
    throw new Error(error.error?.message || 'Lưu thất bại');
  }
}
