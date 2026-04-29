'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePermissions } from '@/hooks/use-permissions';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Download, History, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { getDocumentPreviewUrl, fetchDocumentBlob, downloadDocument, listDocumentVersions, getDocumentById } from '@/lib/documents-api';
import { getPreviewType, isEditable } from '@/types/document';
import type { Document } from '@/types/document';
import { ImageViewer } from './image-viewer';
import { VersionHistoryPanel } from './version-history-panel';

// Dynamic import các viewer nặng — giảm initial bundle, compile nhanh hơn
// Mỗi viewer chứa thư viện lớn (Monaco ~5MB, Handsontable ~2MB, TipTap ~1MB)
// → chỉ load khi user thực sự mở preview loại file tương ứng
const PdfViewer = dynamic(
  () => import('./pdf-viewer').then(mod => mod.PdfViewer),
  { ssr: false }
);
const DocxEditorViewer = dynamic(
  () => import('./docx-editor-viewer').then(mod => mod.DocxEditorViewer),
  { ssr: false }
);
const SpreadsheetEditorViewer = dynamic(
  () => import('./spreadsheet-editor-viewer').then(mod => mod.SpreadsheetEditorViewer),
  { ssr: false }
);
const TextEditorViewer = dynamic(
  () => import('./text-editor-viewer').then(mod => mod.TextEditorViewer),
  { ssr: false }
);
const PowerpointViewer = dynamic(
  () => import('./powerpoint-viewer').then(mod => mod.PowerpointViewer),
  { ssr: false }
);
const VersionDiffViewer = dynamic(
  () => import('./version-diff-viewer').then(mod => mod.VersionDiffViewer),
  { ssr: false }
);

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  /** 'preview' = chỉ xem (canEdit luôn false); 'edit' = cho phép chỉnh sửa nếu có quyền */
  mode?: 'preview' | 'edit';
  /** Text cần highlight trong viewer (substring match) — dùng cho citation preview */
  highlightText?: string | null;
  /** Callback khi document được cập nhật (sau save) — dùng để cập nhật state ở parent, trigger polling */
  onDocumentUpdate?: (doc: Document) => void;
}

/**
 * Document preview dialog — fullscreen-like với routing theo mimeType
 * mode='preview': luôn read-only dù user có quyền EDITOR/OWNER
 * mode='edit': cho phép edit nếu permissionLevel === EDITOR hoặc OWNER
 */
export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
  mode = 'preview',
  highlightText,
  onDocumentUpdate,
}: DocumentPreviewDialogProps) {
  const t = useTranslations('documents');
  const { hasPermission } = usePermissions();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);
  // internalMode cho phép toggle preview↔edit ngay trong dialog mà không cần parent đổi prop
  const [internalMode, setInternalMode] = useState<'preview' | 'edit'>(mode);

  // Phase 44: Diff mode state
  const [diffMode, setDiffMode] = useState<boolean>(false);
  const [diffOldVersion, setDiffOldVersion] = useState<number | null>(null);
  const [latestVersionNumber, setLatestVersionNumber] = useState<number>(1);

  // Fetch preview metadata + blob khi dialog open với document
  useEffect(() => {
    if (open && document) {
      setLoading(true);
      setError(null);
      setPreviewUrl(null);
      setPermissionLevel(null);
      setInternalMode(mode);

      // Step 1: Get metadata (permission level)
      // Step 2: Fetch file blob qua backend stream (tránh CORS với MinIO)
      Promise.all([
        getDocumentPreviewUrl(document.id),
        fetchDocumentBlob(document.id),
      ])
        .then(([metadata, blob]) => {
          const blobUrl = URL.createObjectURL(blob);
          setPreviewUrl(blobUrl);
          setPermissionLevel(metadata.permissionLevel);
          setLoading(false);
        })
        .catch((err: any) => {
          const msg =
            err?.response?.data?.error?.message || t('preview.loadError');
          setError(msg);
          setLoading(false);
          toast.error(msg);
        });

      // Phase 44: Lấy version mới nhất để dùng trong diff
      listDocumentVersions(document.id)
        .then((versions) => {
          if (versions.length > 0) {
            setLatestVersionNumber(parseInt(versions[0].versionNumber, 10));
          }
        })
        .catch(() => {});
    }

    // Reset version history sidebar, diff mode, và internalMode khi dialog đóng
    if (!open) {
      setShowVersionHistory(false);
      setDiffMode(false);
      setDiffOldVersion(null);
      setInternalMode(mode);
    }

    // Cleanup blob URL khi dialog đóng hoặc document thay đổi
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open, document, mode]);

  // Callback sau khi restore version — re-fetch blob URL + permissionLevel + latestVersionNumber
  const handleVersionRestored = useCallback(async () => {
    if (!document?.id) return;
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLoading(true);
    try {
      const [metadata, blob] = await Promise.all([
        getDocumentPreviewUrl(document.id),
        fetchDocumentBlob(document.id),
      ]);
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
      setPermissionLevel(metadata.permissionLevel);
      const versions = await listDocumentVersions(document.id);
      if (versions.length > 0) {
        setLatestVersionNumber(parseInt(versions[0].versionNumber, 10));
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [document?.id, previewUrl]);

  // Phase 44: Diff mode handlers
  const handleCompare = useCallback((oldVersionNumber: number) => {
    setDiffOldVersion(oldVersionNumber);
    setDiffMode(true);
  }, []);

  const handleCloseDiff = useCallback(() => {
    setDiffMode(false);
    setDiffOldVersion(null);
  }, []);

  // Callback sau khi editor save — re-fetch document để lấy extractionStatus mới (PROCESSING)
  // Notify parent (document-detail-panel) để kích hoạt polling
  const handleDocumentSaved = useCallback(async () => {
    if (!document?.id || !onDocumentUpdate) return;
    try {
      const updated = await getDocumentById(document.id);
      onDocumentUpdate(updated);
    } catch {
      // Silent fail — trạng thái sẽ được cập nhật khi polling ở document-detail-panel chạy
    }
  }, [document?.id, onDocumentUpdate]);

  const handleDownload = async () => {
    if (!document) return;
    setDownloading(true);
    try {
      await downloadDocument(document.id, document.fileName);
      toast.success(t('toast.downloaded', { name: document.fileName }));
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || t('preview.downloadError');
      toast.error(msg);
    } finally {
      setDownloading(false);
    }
  };

  if (!document) return null;

  const previewType = getPreviewType(document.mimeType);

  // canEdit: chỉ true khi internalMode='edit' VÀ user có quyền EDITOR/OWNER
  const canEdit =
    internalMode === 'edit' &&
    (permissionLevel === 'EDITOR' || permissionLevel === 'OWNER');

  // userHasEditPermission: user thực sự có quyền chỉnh sửa (không phụ thuộc internalMode).
  // Dùng để 3 viewer phân biệt "preview mode (có quyền)" vs "truly no permission".
  // refs bug #143
  const userHasEditPermission =
    permissionLevel === 'EDITOR' || permissionLevel === 'OWNER';

  // canSwitchToEdit: hiển thị button "Chỉnh sửa" khi đang preview, file hỗ trợ edit, user có quyền
  const canSwitchToEdit =
    internalMode === 'preview' &&
    isEditable(document.mimeType) &&
    (permissionLevel === 'EDITOR' || permissionLevel === 'OWNER');

  // canDownload: chỉ true khi có system permission documents:download
  const canDownload = hasPermission('documents:download');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-[95vw] w-full h-[95vh] p-0 gap-0 overflow-hidden [&>button.absolute]:hidden">
        {/* Gradient strip */}
        <div className={`absolute inset-x-0 top-0 h-1 z-10 ${canEdit ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500' : 'bg-gradient-to-r from-blue-500 via-sky-400 to-blue-400'}`} />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-3 border-b shrink-0 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className={`p-1.5 rounded-md shrink-0 ${canEdit ? 'bg-amber-100' : 'bg-blue-100'}`}>
              {canEdit
                ? <Pencil className="h-4 w-4 text-amber-600" />
                : <Eye className="h-4 w-4 text-blue-600" />
              }
            </div>
            <DialogTitle className="text-base font-semibold truncate text-slate-800">{document.fileName}</DialogTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canSwitchToEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                onClick={() => setInternalMode('edit')}
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                {t('preview.edit')}
              </Button>
            )}
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                onClick={() => setInternalMode('preview')}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                {t('preview.viewOnly')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={`border transition-colors ${showVersionHistory
                ? 'bg-violet-100 border-violet-300 text-violet-700 hover:bg-violet-200'
                : 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100 hover:border-violet-300'
              }`}
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              <History className="h-4 w-4 mr-1.5" />
              {t('preview.history')}
            </Button>
            {canDownload && (
              <Button
                variant="ghost"
                size="sm"
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="h-4 w-4 mr-1.5" />
                {t('preview.download')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Preview content */}
          <div className="flex-1 min-w-0 overflow-hidden">
          {/* Phase 44: Diff mode — render VersionDiffViewer thay vì viewer bình thường */}
          {diffMode && diffOldVersion !== null && document ? (
            <VersionDiffViewer
              documentId={document.id}
              documentName={document.fileName}
              oldVersionNumber={diffOldVersion}
              newVersionNumber={latestVersionNumber}
              onClose={handleCloseDiff}
            />
          ) : (
            <>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full max-w-4xl p-8">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-[600px] w-full" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-destructive">{error}</p>
                {canDownload && (
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t('preview.downloadToView')}
                  </Button>
                )}
              </div>
            </div>
          )}

          {!loading && !error && previewUrl && (
            <>
              {previewType === 'pdf' && (
                <PdfViewer url={previewUrl} fileName={document.fileName} highlightText={highlightText} />
              )}

              {previewType === 'image' && (
                <ImageViewer url={previewUrl} fileName={document.fileName} />
              )}

              {previewType === 'office-doc' && (
                <DocxEditorViewer
                  url={previewUrl}
                  fileName={document.fileName}
                  documentId={document.id}
                  canEdit={canEdit}
                  userHasEditPermission={userHasEditPermission}
                  highlightText={highlightText}
                  onDocumentSaved={onDocumentUpdate ? handleDocumentSaved : undefined}
                />
              )}

              {previewType === 'office-sheet' && (
                <SpreadsheetEditorViewer
                  url={previewUrl}
                  fileName={document.fileName}
                  mimeType={document.mimeType}
                  documentId={document.id}
                  canEdit={canEdit}
                  userHasEditPermission={userHasEditPermission}
                  onDocumentSaved={onDocumentUpdate ? handleDocumentSaved : undefined}
                />
              )}

              {previewType === 'office-slide' && (
                <PowerpointViewer
                  url={previewUrl}
                  fileName={document.fileName}
                  documentId={document.id}
                />
              )}

              {previewType === 'text' && (
                <TextEditorViewer
                  url={previewUrl}
                  fileName={document.fileName}
                  mimeType={document.mimeType}
                  documentId={document.id}
                  canEdit={canEdit}
                  userHasEditPermission={userHasEditPermission}
                  highlightText={highlightText}
                  onDocumentSaved={onDocumentUpdate ? handleDocumentSaved : undefined}
                />
              )}

              {previewType === 'unsupported' && (
                <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
                  <div className="text-center space-y-4">
                    <p className="text-lg">
                      {t('preview.unsupported')}
                    </p>
                    {canDownload && (
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        {t('preview.downloadToView')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
            </>
          )}
          </div>

          {/* Version History Sidebar */}
          {showVersionHistory && document && (
            <div className="w-80 border-l shrink-0 overflow-y-auto">
              <VersionHistoryPanel
                documentId={document.id}
                permissionLevel={permissionLevel}
                onClose={() => setShowVersionHistory(false)}
                onCompare={handleCompare}
                onVersionRestored={handleVersionRestored}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
