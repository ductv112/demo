'use client';

import {useTranslations} from 'next-intl';
import {CheckCircle, XCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {FolderUploadResult} from '@/lib/folder-upload-orchestrator';

interface BatchUploadSummaryProps {
  result: FolderUploadResult;
  onClose: () => void;
}

export function BatchUploadSummary({result, onClose}: BatchUploadSummaryProps) {
  const t = useTranslations('documents');
  const allSuccess = result.failedFiles.length === 0;
  const successCount = result.successFiles.length;
  const failedCount = result.failedFiles.length;

  if (allSuccess) {
    return (
      <div data-testid="folder-upload-summary" className="space-y-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
          <p className="text-lg font-semibold text-emerald-700 text-center">
            {t('upload_dialog.folder_success_all', {total: result.totalFiles})}
          </p>
          <p className="text-sm text-slate-500 text-center">
            {t('upload_dialog.folder_success_sub')}
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('upload_dialog.close_button')}
          </Button>
        </div>
      </div>
    );
  }

  // Partial failure
  return (
    <div data-testid="folder-upload-summary" className="space-y-3">
      {/* Summary counts */}
      <div className="space-y-1">
        {successCount > 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-sm text-emerald-700">
              {t('upload_dialog.folder_partial_success', {success: successCount})}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <span className="text-sm text-rose-700">
            {t('upload_dialog.folder_partial_failed', {failed: failedCount})}
          </span>
        </div>
      </div>

      {/* Danh sách file lỗi */}
      <div className="max-h-[160px] overflow-y-auto space-y-1">
        {result.failedFiles.map((f, idx) => (
          <div
            key={f.path + idx}
            className="bg-rose-50 border border-rose-200 rounded px-4 py-1 text-sm flex items-center gap-2"
          >
            <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="text-rose-800 font-medium truncate min-w-0" title={f.path}>{f.path}</span>
            <span className="text-rose-300 shrink-0">|</span>
            <span className="text-xs text-rose-600 shrink-0">{f.error}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          {t('upload_dialog.close_button')}
        </Button>
      </div>
    </div>
  );
}
