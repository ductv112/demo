// API client cho Documents operations

import { api } from './api';
import type { Document, DocumentListResponse, DocumentExtractedText, DocumentVersion } from '@/types/document';

/**
 * Lấy danh sách tài liệu với pagination, search, filter
 */
export async function getDocuments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  folderId?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  departmentId?: string | null; // UUID | 'personal' | 'all' — Phase 30
  extractionStatus?: string; // Filter theo trạng thái số hóa — quick-36
  status?: 'ACTIVE' | 'INACTIVE'; // Phase 72.1: filter theo trạng thái kích hoạt
}): Promise<DocumentListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.search?.trim()) queryParams.set('search', params.search.trim());
  if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);
  // folderId: null = root (chỉ file không thuộc folder), string = specific folder, undefined = không filter
  if (params?.folderId !== undefined) {
    queryParams.set('folderId', params.folderId === null ? 'root' : params.folderId);
  }
  // departmentId: UUID = specific dept, 'personal' = no dept, 'all' = không filter — Phase 30
  if (params?.departmentId !== undefined && params.departmentId !== null) {
    queryParams.set('departmentId', params.departmentId);
  }
  // extractionStatus: filter server-side — quick-36
  if (params?.extractionStatus) queryParams.set('extractionStatus', params.extractionStatus);
  // status: filter theo trạng thái kích hoạt — Phase 72.1
  if (params?.status) queryParams.set('status', params.status);

  const queryString = queryParams.toString();
  const url = queryString ? `/documents?${queryString}` : '/documents';
  const response = await api.get<DocumentListResponse>(url);
  return response.data;
}

/**
 * Upload tài liệu lên server với progress tracking
 */
export interface UploadDocumentResult {
  data: Document;
  autoSharedWithDepartment: { id: string; name: string } | null;
}

export async function uploadDocument(
  file: File,
  title?: string,
  description?: string,
  folderId?: string | null,
  onProgress?: (percent: number) => void,
  departmentId?: string | null,   // Phase 30: gắn phòng ban khi upload
  referenceNumber?: string,       // Phase 30: ký hiệu tài liệu
  securityLevel?: 'NORMAL' | 'CONFIDENTIAL', // Phase 62: cấp độ bảo mật
): Promise<UploadDocumentResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  if (description?.trim()) {
    formData.append('description', description.trim());
  }
  if (folderId !== undefined && folderId !== null) {
    formData.append('folderId', folderId);
  }
  if (departmentId !== undefined && departmentId !== null) {
    formData.append('departmentId', departmentId);
  }
  if (referenceNumber?.trim()) {
    formData.append('referenceNumber', referenceNumber.trim());
  }
  if (securityLevel) {
    formData.append('securityLevel', securityLevel);
  }

  const response = await api.post<UploadDocumentResult>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 phút cho file lớn
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    },
  });

  return response.data;
}

/**
 * Download tài liệu — tải về browser qua temporary anchor element
 * Dùng responseType: 'blob' để tải binary data với auth header
 */
export async function downloadDocument(documentId: string, fileName: string): Promise<void> {
  const response = await api.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
    timeout: 300000, // 5 phút cho file lớn
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Di chuyển một tài liệu vào folder
 */
export async function moveDocument(documentId: string, folderId: string | null): Promise<any> {
  const response = await api.put(`/documents/${documentId}/move`, { folderId });
  return response.data;
}

/**
 * Di chuyển nhiều tài liệu vào folder (bulk move)
 */
export async function moveDocumentsBulk(
  documentIds: string[],
  folderId: string | null
): Promise<{ data: { movedCount: number; previousFolders: Record<string, string | null> } }> {
  const response = await api.put('/documents/move-bulk', { documentIds, folderId });
  return response.data;
}

/**
 * Xóa tài liệu — hard delete (MinIO file + DB record + permissions)
 */
export async function deleteDocument(documentId: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/documents/${documentId}`);
  return response.data;
}

/**
 * Đổi tên tài liệu — chỉ cập nhật title hiển thị, không đổi fileName trên MinIO
 */
export async function renameDocument(id: string, title: string): Promise<Document> {
  const response = await api.patch<{ data: Document }>(`/documents/${id}/rename`, { title });
  return response.data.data ?? (response.data as unknown as Document);
}

/**
 * Get preview metadata for document (permission level, file info)
 */
export async function getDocumentPreviewUrl(documentId: string): Promise<{
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  title: string;
  permissionLevel: string | null;
}> {
  const response = await api.get(`/documents/${documentId}/preview`);
  return response.data;
}

/**
 * Get document stream URL (full URL with auth token for preview)
 * Backend proxy stream qua /documents/:id/stream (tránh CORS với MinIO)
 */
export function getDocumentStreamUrl(documentId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseUrl}/documents/${documentId}/stream`;
}

/**
 * Fetch document content as blob (for viewers that need fetch + auth header)
 */
export async function fetchDocumentBlob(documentId: string): Promise<Blob> {
  const response = await api.get(`/documents/${documentId}/stream`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Save text file content (EDITOR+ only)
 */
export async function saveDocumentContent(documentId: string, content: string, changeNote?: string): Promise<void> {
  await api.put(`/documents/${documentId}/content`, { content, changeNote });
}

/**
 * Update binary file (DOCX/XLSX overwrite, EDITOR+ only)
 * Dùng cho DOCX editor save và XLSX editor save
 */
export async function updateDocumentFile(
  documentId: string,
  file: File,
  changeNote?: string,
): Promise<{ success: boolean; fileSize: number }> {
  const formData = new FormData();
  formData.append('file', file);
  if (changeNote) formData.append('changeNote', changeNote);
  const response = await api.put(`/documents/${documentId}/file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 1 phút cho file binary
  });
  return response.data;
}

/**
 * Lấy nội dung số hóa của tài liệu
 * GET /documents/:id/text
 */
export async function getDocumentExtractedText(id: string): Promise<DocumentExtractedText> {
  const res = await api.get(`/documents/${id}/text`);
  return res.data;
}

/**
 * Lấy original_text đầy đủ từ Qdrant theo doc_id + chunk_index
 * GET /documents/chunk-text?doc_id=X&chunk_index=Y
 */
export async function getChunkOriginalText(
  docId: string,
  chunkIndex: number,
): Promise<{ original_text: string | null }> {
  const res = await api.get(`/documents/chunk-text?doc_id=${encodeURIComponent(docId)}&chunk_index=${chunkIndex}`);
  return res.data;
}

/**
 * Gửi yêu cầu trích xuất lại văn bản (retry)
 * POST /documents/:id/re-extract
 */
export async function reExtractDocument(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/documents/${id}/re-extract`);
  return res.data;
}

/**
 * Hủy trích xuất văn bản đang chạy
 * POST /documents/:id/cancel-extract
 */
export async function cancelExtraction(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/documents/${id}/cancel-extract`);
  return res.data;
}

/**
 * Lấy thông tin tài liệu theo ID (dùng cho polling trạng thái extraction)
 * GET /documents/:id
 */
export async function getDocumentById(id: string): Promise<Document> {
  const res = await api.get(`/documents/${id}`);
  return res.data.data ?? res.data;
}

/**
 * Hủy nhúng vector đang chờ/đang chạy (chỉ sysadmin)
 * POST /documents/:id/cancel-embed
 */
export async function cancelEmbedding(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/documents/${id}/cancel-embed`);
  return res.data;
}

/**
 * Thử lại nhúng vector (chỉ sysadmin)
 * POST /documents/:id/re-embed
 */
export async function reEmbedDocument(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/documents/${id}/re-embed`);
  return res.data;
}

/**
 * Lấy số lượng tài liệu per phòng ban — cho sidebar badge (Phase 30)
 * @param departmentIds - mảng các UUID phòng ban cần đếm
 * @returns Record<departmentId, count>
 */
export async function getDocumentCountByDepartment(
  departmentIds: string[]
): Promise<Record<string, number>> {
  if (departmentIds.length === 0) return {};
  const response = await api.get<{ data: Record<string, number> }>(
    `/documents/count-by-department?departmentIds=${departmentIds.join(',')}`
  );
  return response.data.data;
}

/**
 * Lấy danh sách phiên bản của tài liệu
 * GET /documents/:id/versions
 */
export async function listDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const res = await api.get<DocumentVersion[]>(`/documents/${documentId}/versions`);
  return res.data;
}

/**
 * Tải xuống phiên bản cụ thể
 * GET /documents/:id/versions/:versionId/download
 */
export async function downloadDocumentVersion(
  documentId: string,
  versionId: string,
  fileName: string,
): Promise<void> {
  const res = await api.get(`/documents/${documentId}/versions/${versionId}/download`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Khôi phục phiên bản cũ (tạo version mới từ nội dung cũ)
 * POST /documents/:id/versions/:versionId/restore
 */
export async function restoreDocumentVersion(
  documentId: string,
  versionId: string,
): Promise<DocumentVersion> {
  const res = await api.post<DocumentVersion>(`/documents/${documentId}/versions/${versionId}/restore`);
  return res.data;
}

/**
 * Xóa phiên bản (chỉ OWNER)
 * DELETE /documents/:id/versions/:versionId
 */
export async function deleteDocumentVersion(
  documentId: string,
  versionId: string,
): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/documents/${documentId}/versions/${versionId}`);
  return res.data;
}

/**
 * Đổi cấp độ bảo mật tài liệu (OWNER only)
 * PATCH /documents/:id/security-level
 */
export async function updateSecurityLevel(
  documentId: string,
  securityLevel: 'NORMAL' | 'CONFIDENTIAL',
): Promise<Document> {
  const response = await api.patch<{ data: Document }>(`/documents/${documentId}/security-level`, { securityLevel });
  return response.data.data ?? (response.data as unknown as Document);
}

/**
 * Lấy extracted text của một version cụ thể — dùng cho Monaco DiffEditor
 * GET /documents/:id/versions/:vNumber/text
 * Trả về null nếu version chưa có nội dung số hóa
 */
export async function getVersionText(
  documentId: string,
  versionNumber: number,
): Promise<string | null> {
  try {
    const response = await api.get(`/documents/${documentId}/versions/${versionNumber}/text`);
    return response.data?.text || null;
  } catch {
    return null;
  }
}

/**
 * Kích hoạt tài liệu (ACTIVE) — Phase 72.1
 * PATCH /documents/:id/activate
 * Yêu cầu quyền EDITOR trở lên
 */
export async function activateDocument(id: string): Promise<{ data: Document }> {
  const res = await api.patch<{ data: Document }>(`/documents/${id}/activate`);
  return res.data;
}

/**
 * Vô hiệu hóa tài liệu (INACTIVE) — Phase 72.1
 * PATCH /documents/:id/deactivate
 * Yêu cầu quyền EDITOR trở lên
 */
export async function deactivateDocument(id: string): Promise<{ data: Document }> {
  const res = await api.patch<{ data: Document }>(`/documents/${id}/deactivate`);
  return res.data;
}
