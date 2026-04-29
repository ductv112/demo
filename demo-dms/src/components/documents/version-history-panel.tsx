'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, MoreVertical, Download, RotateCcw, Trash2, GitCompareArrows, History } from 'lucide-react';
import { toast } from 'sonner';
import {
  listDocumentVersions,
  downloadDocumentVersion,
  restoreDocumentVersion,
  deleteDocumentVersion,
} from '@/lib/documents-api';
import type { DocumentVersion } from '@/types/document';

interface VersionHistoryPanelProps {
  documentId: string;
  permissionLevel: string | null; // 'VIEWER' | 'EDITOR' | 'OWNER' | null
  onClose: () => void;
  onCompare?: (oldVersionNumber: number) => void; // Phase 44: so sánh version cũ với version hiện tại
  onVersionRestored?: () => void; // Callback sau khi restore thành công — trigger re-fetch preview
}

/**
 * Format file size: < 1024 → B, < 1MB → KB, else MB — 1 decimal
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * Tính relative time không dùng date-fns — locale-aware version sẽ được inject qua prop
 */
function formatRelativeTimeIntl(dateString: string, locale: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (locale === 'ja') {
    if (diffSec < 60) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    if (diffHour < 24) return `${diffHour}時間前`;
    if (diffDay < 7) return `${diffDay}日前`;
  } else {
    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
  }
  return (
    date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'vi-VN') +
    ' ' +
    date.toLocaleTimeString(locale === 'ja' ? 'ja-JP' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
}

/**
 * Format full datetime cho tooltip — locale-aware
 */
function formatFullDateTimeIntl(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const loc = locale === 'ja' ? 'ja-JP' : 'vi-VN';
  return (
    date.toLocaleDateString(loc) +
    ' ' +
    date.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
}

/**
 * Lấy extension từ fileName
 */
function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Version History Panel — sidebar timeline dọc kiểu Git log
 */
export function VersionHistoryPanel({
  documentId,
  permissionLevel,
  onClose,
  onCompare,
  onVersionRestored,
}: VersionHistoryPanelProps) {
  const t = useTranslations('documents');
  const locale = useLocale();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<DocumentVersion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentVersion | null>(null);

  const fetchVersions = async () => {
    try {
      const data = await listDocumentVersions(documentId);
      setVersions(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err?.message || t('version.loadError');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const refreshVersions = async () => {
    setLoading(true);
    await fetchVersions();
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setActionLoading(restoreTarget.id);
    try {
      await restoreDocumentVersion(documentId, restoreTarget.id);
      toast.success(t('version.restored', { version: restoreTarget.versionNumber }));
      setRestoreTarget(null);
      await refreshVersions();
      onVersionRestored?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err?.message || t('version.restoreError');
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      await deleteDocumentVersion(documentId, deleteTarget.id);
      toast.success(t('version.deleted', { version: deleteTarget.versionNumber }));
      setDeleteTarget(null);
      await refreshVersions();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err?.message || t('version.deleteError');
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (version: DocumentVersion) => {
    const ext = getFileExtension(version.fileName);
    const downloadName = ext
      ? `${version.fileName.replace(`.${ext}`, '')}_v${version.versionNumber}.${ext}`
      : `${version.fileName}_v${version.versionNumber}`;
    toast.info(t('version.downloadStarting'));
    try {
      await downloadDocumentVersion(documentId, version.id, downloadName);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err?.message || t('version.downloadError');
      toast.error(msg);
    }
  };

  const { hasPermission } = usePermissions();
  const canDownload = hasPermission('documents:download');
  const canRestore = permissionLevel === 'EDITOR' || permissionLevel === 'OWNER';
  const canDelete = permissionLevel === 'OWNER';

  return (
    <div className="flex flex-col h-full bg-slate-50/40">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 bg-gradient-to-r from-violet-50 to-purple-50/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-violet-100">
            <History className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">{t('version.history')}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {!loading && versions.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground px-4 text-center">
            {t('version.noVersions')}
          </div>
        )}

        {!loading && versions.length > 0 && (
          <div className="py-4">
            {versions.map((version, index) => {
              const isCurrentVersion = index === 0;
              const isActionInProgress = actionLoading === version.id;

              return (
                <div key={version.id} className="relative flex gap-3 px-4 pb-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center shrink-0 mt-1">
                    <div className={`h-3 w-3 rounded-full border-2 shrink-0 z-10 ${
                      isCurrentVersion
                        ? 'border-violet-500 bg-violet-500'
                        : 'border-slate-300 bg-white'
                    }`} />
                    {index < versions.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[40px]" />
                    )}
                  </div>

                  {/* Version card */}
                  <div className={`flex-1 rounded-lg border p-3 min-w-0 shadow-sm ${
                    isCurrentVersion
                      ? 'border-violet-200 bg-white ring-1 ring-violet-100'
                      : 'border-slate-200 bg-white/70'
                  }`}>
                    {/* Row 1: version number + badge + dropdown */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-sm font-bold shrink-0 ${isCurrentVersion ? 'text-violet-700' : 'text-slate-600'}`}>
                          v{version.versionNumber}
                        </span>
                        {isCurrentVersion && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-violet-100 border-violet-300 text-violet-700 shrink-0">
                            {t('version.current')}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            disabled={isActionInProgress}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onCompare && !isCurrentVersion && (
                            <DropdownMenuItem onClick={() => onCompare(parseInt(version.versionNumber, 10))}>
                              <GitCompareArrows className="h-4 w-4 mr-2 text-sky-500" />
                              {t('version.compareWithCurrent')}
                            </DropdownMenuItem>
                          )}
                          {canDownload && (
                            <DropdownMenuItem onClick={() => handleDownload(version)}>
                              <Download className="h-4 w-4 mr-2 text-emerald-500" />
                              {t('version.download')}
                            </DropdownMenuItem>
                          )}
                          {canRestore && !isCurrentVersion && (
                            <DropdownMenuItem onClick={() => setRestoreTarget(version)}>
                              <RotateCcw className="h-4 w-4 mr-2 text-amber-500" />
                              {t('version.restore')}
                            </DropdownMenuItem>
                          )}
                          {canDelete && !isCurrentVersion && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(version)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('version.delete')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Row 2: avatar + name */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isCurrentVersion ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {(version.editorDisplayName || version.creator.fullName).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-600 truncate font-medium">
                        {version.editorDisplayName || version.creator.fullName}
                      </span>
                    </div>

                    {/* Row 3: timestamp */}
                    <div
                      className="text-[11px] text-slate-400 mb-1"
                      title={formatFullDateTimeIntl(version.createdAt, locale)}
                    >
                      {formatRelativeTimeIntl(version.createdAt, locale)}
                    </div>

                    {/* Row 4: change note */}
                    {version.changeNote && (
                      <div
                        className="text-[11px] italic text-slate-500 mb-1 line-clamp-2 bg-slate-50 rounded px-1.5 py-1 border border-slate-100"
                        title={version.changeNote}
                      >
                        "{version.changeNote}"
                      </div>
                    )}

                    {/* Row 5: file size */}
                    <div className="text-[11px] text-slate-400">
                      {formatFileSize(version.fileSize)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AlertDialog: Khôi phục */}
      <AlertDialog open={!!restoreTarget} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <AlertDialogContent className="overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 rounded-t-lg" />
          <AlertDialogHeader className="pt-2">
            <AlertDialogTitle className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-amber-100">
                <RotateCcw className="h-4 w-4 text-amber-600" />
              </div>
              {t('version.restoreTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('version.restoreConfirm', { version: restoreTarget?.versionNumber ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoading}>{t('version.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={!!actionLoading}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              {actionLoading ? t('version.restoring') : t('version.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Xóa */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-red-400 rounded-t-lg" />
          <AlertDialogHeader className="pt-2">
            <AlertDialogTitle className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-rose-100">
                <Trash2 className="h-4 w-4 text-rose-600" />
              </div>
              {t('version.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('version.deleteConfirm', { version: deleteTarget?.versionNumber ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoading}>{t('version.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {actionLoading ? t('version.deleting') : t('version.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
