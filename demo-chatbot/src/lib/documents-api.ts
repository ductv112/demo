/**
 * Documents API — mock rút gọn cho prototype chatbot Doanh nghiệp A.
 * Chỉ giữ những function được chat module dùng cho citations + mention + preview.
 */

import type {
  Document,
  DocumentExtractedText,
  DocumentListResponse,
  DocumentVersion,
} from '@/types/document';
import { MOCK_DOCUMENTS } from '@/lib/mock-data';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function toDocument(d: (typeof MOCK_DOCUMENTS)[number]): Document {
  const now = new Date().toISOString();
  return {
    id: d.id,
    title: d.title,
    description: d.excerpt,
    fileName: d.fileName,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    storagePath: `mock://${d.id}`,
    uploadedBy: 'user-director',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    uploader: {
      id: 'user-director',
      username: 'pqhung',
      fullName: 'Phạm Quốc Hưng',
      email: 'pqhung@doanhnghiepa.vn',
    },
    departmentId: null,
    referenceNumber: null,
    department: null,
    extractionStatus: 'COMPLETED',
    extractedAt: now,
    embeddingStatus: 'COMPLETED',
    embeddedAt: now,
    chunkCount: 12,
    securityLevel: 'NORMAL',
    permissionLevel: 'VIEWER',
  };
}

export async function getDocumentById(id: string): Promise<Document> {
  await delay(80);
  const match = MOCK_DOCUMENTS.find((d) => d.id === id);
  if (!match) {
    // Fallback placeholder
    return toDocument({
      id,
      fileName: 'Tài liệu.pdf',
      title: 'Tài liệu',
      mimeType: 'application/pdf',
      fileSize: 0,
      department: 'Doanh nghiệp A',
      excerpt: 'Xem trước không khả dụng — chế độ demo.',
    });
  }
  return toDocument(match);
}

export async function getDocumentExtractedText(id: string): Promise<DocumentExtractedText> {
  await delay(100);
  const match = MOCK_DOCUMENTS.find((d) => d.id === id);
  const text = match
    ? `${match.title}\n\n${match.excerpt}\n\nNội dung chi tiết (bản demo) — Trung tâm phần mềm Alpha, Doanh nghiệp A.`
    : 'Xem trước không khả dụng — chế độ demo.';
  return {
    extractedText: text,
    extractionStatus: 'COMPLETED',
    extractedAt: new Date().toISOString(),
  };
}

export async function getChunkOriginalText(
  docId: string,
  _chunkIndex: number,
): Promise<{ original_text: string | null }> {
  await delay(80);
  const match = MOCK_DOCUMENTS.find((d) => d.id === docId);
  return { original_text: match?.excerpt ?? null };
}

export async function getMentionableDocuments(params?: {
  search?: string;
  limit?: number;
}): Promise<{
  data: { id: string; fileName: string; mimeType: string }[];
  meta: { total: number };
}> {
  await delay(60);
  const search = params?.search?.trim().toLowerCase();
  const filtered = search
    ? MOCK_DOCUMENTS.filter(
        (d) =>
          d.fileName.toLowerCase().includes(search) ||
          d.title.toLowerCase().includes(search),
      )
    : MOCK_DOCUMENTS;
  const limit = params?.limit ?? 20;
  return {
    data: filtered.slice(0, limit).map((d) => ({
      id: d.id,
      fileName: d.fileName,
      mimeType: d.mimeType,
    })),
    meta: { total: filtered.length },
  };
}

// ── Stubs để giữ type-compat cho document-preview-dialog & chat-layout ─────

export async function getDocumentPreviewUrl(
  id: string,
): Promise<{
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  title: string;
  permissionLevel: string | null;
}> {
  await delay(60);
  const doc = await getDocumentById(id);
  return {
    url: `mock://${id}`,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    title: doc.title,
    permissionLevel: 'VIEWER',
  };
}

export async function fetchDocumentBlob(_id: string): Promise<Blob> {
  await delay(40);
  return new Blob(['Demo content'], { type: 'text/plain' });
}

export async function listDocumentVersions(id: string): Promise<DocumentVersion[]> {
  await delay(60);
  const now = new Date().toISOString();
  return [
    {
      id: `${id}-v1`,
      documentId: id,
      versionNumber: '1',
      fileName: 'v1.pdf',
      fileSize: 0,
      mimeType: 'application/pdf',
      storagePath: 'mock://v1',
      fileHash: 'mock-hash-v1',
      changeNote: 'Bản đầu tiên',
      createdBy: 'user-director',
      createdAt: now,
      editorDisplayName: 'Phạm Quốc Hưng — Tổng giám đốc',
      creator: {
        id: 'user-director',
        username: 'pqhung',
        fullName: 'Phạm Quốc Hưng',
        email: 'pqhung@doanhnghiepa.vn',
      },
    },
  ];
}

export async function downloadDocument(_documentId: string, _fileName: string): Promise<void> {
  await delay(80);
  // No-op in demo
}

// ── Listing (used by chat dialogs: summarize/diff/compare) ────────────────

export async function getDocuments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  folderId?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  departmentId?: string | null;
  extractionStatus?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}): Promise<DocumentListResponse> {
  await delay(80);
  const search = params?.search?.trim().toLowerCase();
  const filtered = search
    ? MOCK_DOCUMENTS.filter(
        (d) =>
          d.fileName.toLowerCase().includes(search) ||
          d.title.toLowerCase().includes(search),
      )
    : MOCK_DOCUMENTS;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit).map(toDocument),
    meta: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  };
}
