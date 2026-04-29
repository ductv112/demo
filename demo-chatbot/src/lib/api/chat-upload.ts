/**
 * Chat upload — mock (PKKQ prototype).
 * Không upload thực; trả về metadata giả cho phép UI hiển thị bubble card.
 */

import type { ChatUploadFile } from '@/types/chat';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function uploadChatFiles(
  sessionId: string,
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<ChatUploadFile[]> {
  // Giả lập progress 0-100
  for (let p = 20; p <= 100; p += 20) {
    await delay(80);
    onProgress?.(p);
  }
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return files.map((f, idx) => ({
    id: `upload-${Date.now()}-${idx}`,
    sessionId,
    userId: 'user-director',
    fileName: f.name,
    mimeType: f.type || 'application/octet-stream',
    fileSize: f.size,
    storagePath: `mock://uploads/${f.name}`,
    isImage: (f.type || '').startsWith('image/'),
    status: 'ready',
    expiresAt: expires,
    createdAt: now,
  }));
}

export function getUploadDownloadUrl(id: string): string {
  return `#mock-upload-${id}`;
}

export async function deleteChatUpload(_id: string): Promise<void> {
  await delay(40);
}

export async function saveChatUploadToDms(id: string): Promise<{
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  folderId: string;
  folderName: string;
}> {
  await delay(120);
  return {
    id,
    title: 'Tài liệu đã lưu (demo)',
    fileName: 'demo.pdf',
    fileSize: 0,
    mimeType: 'application/pdf',
    folderId: 'root',
    folderName: 'Z119 DMS',
  };
}

export async function getSessionUploads(_sessionId: string): Promise<ChatUploadFile[]> {
  await delay(40);
  return [];
}
