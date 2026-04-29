'use client';

import { X, AlertCircle } from 'lucide-react';
import { getFileIconConfig } from '@/lib/file-icon';
import { Progress } from '@/components/ui/progress';
import type { PendingFile } from '@/types/chat';

interface FileUploadPreviewProps {
  files: PendingFile[];
  onRemove: (localId: string) => void;
}

/** Format file size (bytes) thành KB/MB */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Truncate tên file nếu dài quá */
function truncateName(name: string, max = 20): string {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf('.');
  if (ext > 0 && name.length - ext <= 6) {
    // Giữ extension: "very-long-name...pdf"
    const extStr = name.slice(ext);
    return name.slice(0, max - extStr.length - 1) + '…' + extStr;
  }
  return name.slice(0, max - 1) + '…';
}

export function FileUploadPreview({ files, onRemove }: FileUploadPreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
      {files.map((pf) => {
        const isImage = pf.file.type.startsWith('image/');
        const hasError = pf.status === 'error';
        const isUploading = pf.status === 'uploading';
        const { icon: FileIcon, color } = getFileIconConfig(pf.file.type, pf.file.name);

        return (
          <div
            key={pf.localId}
            className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-2 max-w-[180px] min-w-[120px] transition-colors ${
              hasError
                ? 'border-destructive/60 bg-destructive/5'
                : 'border-border bg-background'
            }`}
          >
            {/* Thumbnail ảnh hoặc icon loại file */}
            <div className="shrink-0 w-10 h-10 rounded overflow-hidden flex items-center justify-center bg-muted">
              {isImage && pf.preview ? (
                <img
                  src={pf.preview}
                  alt={pf.file.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : hasError ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <FileIcon className={`h-5 w-5 ${color}`} />
              )}
            </div>

            {/* Tên file + dung lượng */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-medium truncate leading-tight" title={pf.file.name}>
                {truncateName(pf.file.name)}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {hasError ? (pf.errorMessage || 'Lỗi tải lên') : formatFileSize(pf.file.size)}
              </p>

              {/* Progress bar khi đang upload */}
              {isUploading && (
                <Progress
                  value={pf.progress ?? 0}
                  className="h-1 mt-1"
                />
              )}
            </div>

            {/* Nút X xóa */}
            <button
              type="button"
              onClick={() => onRemove(pf.localId)}
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center
                w-5 h-5 rounded-full bg-muted-foreground/80 text-background
                hover:bg-destructive transition-colors z-10"
              aria-label="Xóa file"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
