'use client';

/**
 * DocumentPreviewDialog — rút gọn cho prototype chatbot Doanh nghiệp A.
 * Không load viewer nặng (PDF/DOCX/XLSX); hiển thị placeholder demo + excerpt.
 */

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';
import type { Document } from '@/types/document';

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  mode?: 'preview' | 'edit';
  highlightText?: string | null;
  onDocumentUpdate?: (doc: Document) => void;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
  highlightText,
}: DocumentPreviewDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-3xl w-full h-auto max-h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Gradient strip */}
        <div className="absolute inset-x-0 top-0 h-1 z-10 bg-gradient-to-r from-[#1B3A5C] via-[#2d5a8e] to-[#D4A843]" />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3 border-b shrink-0 bg-gradient-to-r from-slate-50 to-slate-50/40">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-md bg-[#1B3A5C]/10 shrink-0">
              <FileText className="h-4 w-4 text-[#1B3A5C]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold truncate text-slate-800">
                {document.title || document.fileName}
              </DialogTitle>
              <p className="text-[11px] text-slate-500 truncate">{document.fileName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body — demo placeholder */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">
              Xem trước không khả dụng — chế độ demo
            </p>
            <p className="text-[12px] text-slate-400 mt-1">
              Doanh nghiệp A — Hệ thống phần mềm nội bộ
            </p>
          </div>

          {document.description && (
            <section className="space-y-2">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#1B3A5C]">
                Trích đoạn tài liệu
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">{document.description}</p>
            </section>
          )}

          {highlightText && (
            <section className="space-y-2">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#D4A843]">
                Đoạn trích dẫn
              </h4>
              <blockquote className="border-l-4 border-[#D4A843] bg-[#D4A843]/5 px-4 py-3 text-sm text-slate-800 rounded">
                {highlightText}
              </blockquote>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
