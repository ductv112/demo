'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { updateDocumentFile } from '@/lib/documents-api';

interface DocumentReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: { id: string; fileName: string; mimeType: string } | null;
  onSuccess: () => void;
}

/**
 * Helper: map MIME type → file input accept attribute string
 */
function mimeToAccept(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc,.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-excel': '.xls,.xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.ms-powerpoint': '.ppt,.pptx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'image/png': '.png',
    'image/jpeg': '.jpg,.jpeg',
    'image/gif': '.gif',
  };
  return mimeMap[mimeType] || '*/*';
}

/**
 * Helper: Format file size human-readable
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function DocumentReplaceDialog({
  open,
  onOpenChange,
  document,
  onSuccess,
}: DocumentReplaceDialogProps) {
  const t = useTranslations('documents');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeNote, setChangeNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const NOTE_MAX_LENGTH = 500;
  const isNoteOverLimit = changeNote.length > NOTE_MAX_LENGTH;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('replace.fileSizeExceeded'));
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleConfirm = async () => {
    if (!document) return;

    if (!selectedFile) {
      toast.error('Vui lòng chọn file để thay thế.');
      return;
    }

    if (isNoteOverLimit) {
      toast.error(`Ghi chú không vượt quá ${NOTE_MAX_LENGTH} ký tự.`);
      return;
    }

    setIsUploading(true);
    try {
      await updateDocumentFile(document.id, selectedFile, changeNote.trim() || undefined);
      toast.success(t('toast.replaced'));
      handleClose();
      onSuccess();
    } catch (error: any) {
      const errorCode = error?.response?.data?.error?.code;
      const errorMessage = error?.response?.data?.error?.message;

      if (errorCode === 'MIME_TYPE_MISMATCH') {
        toast.error(errorMessage || 'Loại file không khớp với tài liệu gốc');
      } else {
        toast.error('Không thể cập nhật phiên bản. Vui lòng thử lại.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setChangeNote('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  if (!document) return null;

  const acceptAttr = mimeToAccept(document.mimeType);

  return (
    <AlertDialog open={open} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <AlertDialogContent className="overflow-hidden [&>*]:min-w-0">
        {/* Colored header strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-violet-500 to-purple-400 rounded-t-lg" />

        <AlertDialogHeader className="pt-2">
          <AlertDialogTitle className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-violet-100">
              <Upload className="h-4 w-4 text-violet-600" />
            </div>
            {t('replace.title')}
          </AlertDialogTitle>
          <AlertDialogDescription title={document.fileName}>
            {t('replace.selectFile')} <strong className="text-foreground">{document.fileName.length > 30 ? document.fileName.slice(0, 30) + '…' : document.fileName}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* File picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('replace.selectFile')}
              <span className="text-destructive ml-1">*</span>
            </label>
            <div
              className="border-2 border-dashed border-violet-200 rounded-lg p-4 text-center cursor-pointer hover:bg-violet-50/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-violet-400" />
              <p className="text-sm text-muted-foreground">
                {t('replace.clickToSelect')} {acceptAttr !== '*/*' ? `(${acceptAttr})` : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('replace.maxSize')}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptAttr}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            {/* Selected file info */}
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-violet-50 border border-violet-200 rounded-md text-sm">
                <Upload className="h-4 w-4 text-violet-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-violet-800">{selectedFile.name}</p>
                  <p className="text-xs text-violet-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Change note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('replace.changeNote')}
            </label>
            <Textarea
              placeholder={t('replace.changePlaceholder')}
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              rows={3}
              disabled={isUploading}
            />
            <div className={`text-xs text-right ${isNoteOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {isNoteOverLimit && <span className="mr-1">Ghi chú không vượt quá {NOTE_MAX_LENGTH} ký tự.</span>}
              {changeNote.length}/{NOTE_MAX_LENGTH}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isUploading}>
            {t('replace.cancelButton')}
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={isUploading}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isUploading ? t('replace.replacing') : t('replace.replaceButton')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
