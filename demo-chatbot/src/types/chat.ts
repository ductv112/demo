export interface ChatSession {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  lastMessage?: {
    content: string;
    createdAt: string;
    role: 'USER' | 'ASSISTANT';
  };
  // Phase 49 — Multi-language support
  multiLanguageEnabled?: boolean;
  queryLanguage?: string | null;
  responseLanguage?: string | null;
  // Issue #122 — Giới hạn 50 tin nhắn/phiên
  messageCount?: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'SYSTEM_SUMMARY';
  content: string;
  sources: Citation[] | null;
  createdAt: string;
  messageType?: 'rag' | 'summarize' | 'diff' | 'compare' | 'mention' | 'translate' | 'help' | 'explain' | 'example'; // Phase 40/44/44.1/56/61/68.1/71 — phân biệt loại message
  // Phase 56 — @mention context documents
  contextDocumentIds?: string[] | null;
  contextDocumentNames?: string[] | null;
  // Phase 47 — feedback fields
  feedbackType?: 'like' | 'dislike' | null;
  feedbackTags?: string[] | null;
  feedbackText?: string | null;
  feedbackAt?: string | null;
  // Phase 59 — Chat file upload attachments
  uploadFiles?: ChatUploadFile[];
}

// ─── Phase 59: Chat File Upload ─────────────────────────────────────────────

/** Server-side upload file record (from Prisma ChatUploadFile) */
export interface ChatUploadFile {
  id: string;
  sessionId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  fileSize: number; // bytes (BigInt serialized as number from backend)
  storagePath: string;
  isImage: boolean;
  status: string; // 'processing' | 'ready' | 'error'
  expiresAt: string;
  createdAt: string;
}

/** Client-side pending file — tracking upload state trước khi gửi message */
export interface PendingFile {
  localId: string;
  file: File;
  /** Preview URL cho ảnh (từ URL.createObjectURL) */
  preview?: string;
  status: 'pending' | 'uploading' | 'ready' | 'error';
  /** Upload progress (0-100) */
  progress?: number;
  /** Server response sau khi upload thành công */
  uploadResult?: ChatUploadFile;
  /** Error message khi upload thất bại */
  errorMessage?: string;
}

export interface Citation {
  doc_id: string;
  file_name: string;
  chunk_text?: string;
  score: number;
  page_numbers?: number[];
  segment_number?: number;      // Cho Summarize inline [N]
  chunk_index?: number;         // Qdrant chunk_index (0-based) — dùng cho CitationTextDialog
  citation_type?: 'rag' | 'summarize' | 'diff' | 'mention' | 'translate';  // Phase 44/44.1/56/61: diff dùng cho cả version diff và cross-doc compare
}

export interface ChatSessionListResponse {
  data: ChatSession[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatMessageListResponse {
  data: ChatMessage[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Phase 72.1.1: Tab "Tài liệu đã dùng" ─────────────────────────────────

/** Tài liệu được tham chiếu trong 1 phiên chat (D-13..D-17) */
export interface ReferencedDocument {
  /** Document.id (UUID) */
  documentId: string;
  /** Tên tài liệu hiển thị — ưu tiên Document.title, fallback Document.fileName */
  documentName: string;
  /** Tên file gốc (có extension) — dùng để detect loại file icon */
  fileName: string;
  /** Số messages trong phiên có chứa documentId (dedup per-message, D-15) */
  referenceCount: number;
}
