'use client';

import { useState } from 'react';
import { Download, FolderInput, Check, Loader2 } from 'lucide-react';
import { getFileIconConfig } from '@/lib/file-icon';
import { getUploadDownloadUrl, saveChatUploadToDms } from '@/lib/api/chat-upload';
import { toast } from 'sonner';
import type { ChatUploadFile } from '@/types/chat';

interface FileCardBubbleProps {
  file: ChatUploadFile;
}

/** Format file size (bytes) thành KB/MB */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Truncate tên file (max 30 chars) */
function truncateName(name: string, max = 30): string {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf('.');
  if (ext > 0 && name.length - ext <= 6) {
    const extStr = name.slice(ext);
    return name.slice(0, max - extStr.length - 1) + '…' + extStr;
  }
  return name.slice(0, max - 1) + '…';
}

/**
 * Card hiển thị file (non-image) trong chat bubble.
 * Icon loại file + tên + dung lượng. Nút download + lưu vào DMS.
 */
export function FileCardBubble({ file }: FileCardBubbleProps) {
  const { icon: FileIcon, color, bg } = getFileIconConfig(file.mimeType, file.fileName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = getUploadDownloadUrl(file.id);
      const token = localStorage.getItem('dms_access_token');
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.fileName;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Không thể tải file');
    }
  };

  const handleSaveToDms = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saving || saved) return;
    setSaving(true);
    try {
      const result = await saveChatUploadToDms(file.id);
      setSaved(true);
      toast.success(`Đã lưu "${result.fileName}" vào ${result.folderName}`);
    } catch {
      toast.error('Không thể lưu file vào DMS');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-lg px-3 py-2.5
        ${bg} border border-border/50 max-w-[320px]`}
      title={file.fileName}
    >
      <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded ${bg}`}>
        <FileIcon className={`h-4.5 w-4.5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-medium truncate leading-tight">
          {truncateName(file.fileName)}
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight">
          {formatFileSize(file.fileSize)}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleDownload}
          className="p-1 rounded hover:bg-background/50 transition-colors cursor-pointer"
          title="Tải về"
        >
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={handleSaveToDms}
          disabled={saving || saved}
          className={`p-1 rounded transition-colors cursor-pointer ${
            saved
              ? 'text-green-600'
              : 'hover:bg-background/50 text-muted-foreground'
          }`}
          title={saved ? 'Đã lưu vào DMS' : 'Lưu vào DMS'}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <FolderInput className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
