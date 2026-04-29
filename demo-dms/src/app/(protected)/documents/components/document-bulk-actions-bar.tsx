'use client';

import { X, Download, Trash2, FolderInput } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DocumentBulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onBulkMove: () => void;
  canDelete: boolean;
  canMove: boolean;
}

/**
 * DocumentBulkActionsBar — Thanh thao tác hàng loạt cho tài liệu.
 *
 * Hiển thị khi selectedCount > 0:
 * [Badge "N đã chọn"] [Tải xuống] [Di chuyển?] [Xóa?] [x Bỏ chọn]
 *
 * Follow pattern từ /users/components/bulk-actions-bar.tsx
 */
export function DocumentBulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkDownload,
  onBulkDelete,
  onBulkMove,
  canDelete,
  canMove,
}: DocumentBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="px-4 py-2 bg-muted/50 border-b shrink-0 flex items-center gap-2 flex-wrap">
      {/* Badge đếm số đã chọn */}
      <Badge variant="default" className="text-xs shrink-0">
        {selectedCount} đã chọn
      </Badge>

      {/* Tải xuống — luôn hiển thị */}
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={onBulkDownload}
      >
        <Download className="h-3 w-3 mr-1.5" />
        Tải xuống
      </Button>

      {/* Di chuyển — chỉ hiển thị khi có quyền update */}
      {canMove && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={onBulkMove}
        >
          <FolderInput className="h-3 w-3 mr-1.5" />
          Di chuyển
        </Button>
      )}

      {/* Xóa — chỉ hiển thị khi có quyền delete */}
      {canDelete && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs text-destructive hover:text-destructive"
          onClick={onBulkDelete}
        >
          <Trash2 className="h-3 w-3 mr-1.5" />
          Xóa
        </Button>
      )}

      {/* Bỏ chọn */}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs text-muted-foreground hover:text-foreground ml-auto"
        onClick={onClearSelection}
      >
        <X className="h-3 w-3 mr-1" />
        Bỏ chọn
      </Button>
    </div>
  );
}
