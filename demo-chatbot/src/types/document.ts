// Document types cho API integration

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  fileHash: string;
  changeNote: string | null;
  createdBy: string;
  createdAt: string;
  editorDisplayName: string | null;
  creator: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  };
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  uploadedBy: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'PROCESSING' | 'ERROR';
  createdAt: string;
  updatedAt: string;
  uploader: { id: string; username: string; fullName: string; email: string };
  // Phase 30: Department + reference number
  departmentId: string | null;
  referenceNumber: string | null;
  department?: { id: string; name: string; code: string } | null;
  // Phase 21: Text extraction
  extractionStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'UNSUPPORTED';
  extractedAt?: string | null;
  // Phase 21.1: OCR metadata (optional, backward compatible)
  ocrStrategy?: string;
  ocrConfidence?: number;
  ocrPagesStandard?: number;
  ocrPagesAiVl?: number;
  // Phase 22: Embedding / vector indexing
  embeddingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  embeddedAt?: string | null;
  chunkCount?: number | null;
  // Phase 62: Security level
  securityLevel?: 'NORMAL' | 'CONFIDENTIAL';
  // ACL permission level — dùng để ẩn/hiện nút hành động theo quyền
  permissionLevel?: 'VIEWER' | 'EDITOR' | 'OWNER' | null;
}

export interface DocumentExtractedText {
  extractedText: string | null;
  extractionStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'UNSUPPORTED';
  extractedAt: string | null;
}

export interface DocumentListResponse {
  data: Document[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface UploadDocumentParams {
  file: File;
  title: string;
  description?: string;
  folderId?: string | null;
  securityLevel?: 'NORMAL' | 'CONFIDENTIAL';
}

export type PreviewableType =
  | 'pdf'
  | 'image'
  | 'office-doc'
  | 'office-sheet'
  | 'office-slide'
  | 'text'
  | 'unsupported';

/**
 * Xác định loại preview dựa trên MIME type
 * Chỉ hỗ trợ: PDF, Image, DOCX, XLSX/CSV, PPTX, Text (text/plain)
 */
export function getPreviewType(mimeType: string): PreviewableType {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (
    mimeType.includes('wordprocessingml') ||
    mimeType === 'application/msword'
  )
    return 'office-doc';
  if (
    mimeType.includes('spreadsheetml') ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'text/csv'
  )
    return 'office-sheet';
  if (
    mimeType.includes('presentationml') ||
    mimeType === 'application/vnd.ms-powerpoint'
  )
    return 'office-slide';
  // Chỉ hỗ trợ text/plain — không hỗ trợ markdown, html, code, yaml, v.v.
  if (mimeType === 'text/plain') return 'text';
  return 'unsupported';
}

/**
 * Check xem file có hỗ trợ preview không
 */
export function isPreviewable(mimeType: string): boolean {
  return getPreviewType(mimeType) !== 'unsupported';
}

/**
 * Check xem file có hỗ trợ chỉnh sửa trực tiếp trên browser không
 * (office-doc DOCX, office-sheet XLSX/CSV, text/code files)
 * PDF, Image, PowerPoint chỉ xem — không edit
 */
export function isEditable(mimeType: string): boolean {
  const type = getPreviewType(mimeType);
  return type === 'office-doc' || type === 'office-sheet' || type === 'text';
}

/**
 * Check xem file có hỗ trợ trích xuất văn bản (OCR/extraction) không
 * Chỉ hỗ trợ: PDF, DOCX, XLSX, PPTX, Text (text/plain), Image
 * Không hỗ trợ: markdown, html, code, yaml, json, v.v.
 */
export function isExtractionSupported(mimeType: string): boolean {
  const type = getPreviewType(mimeType);
  // getPreviewType đã lọc đúng các MIME được hỗ trợ
  return type !== 'unsupported';
}
