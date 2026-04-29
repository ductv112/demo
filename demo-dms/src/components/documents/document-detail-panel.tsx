'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import rehypeRaw from 'rehype-raw';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import {
  X,
  Eye,
  Download,
  Pencil,
  Share2,
  Loader2,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  XCircle,
  AlertCircle,
  Maximize2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type Document, type DocumentVersion, isEditable, isExtractionSupported, isPreviewable } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  getDocumentExtractedText,
  reExtractDocument,
  cancelExtraction,
  cancelEmbedding,
  reEmbedDocument,
  getDocumentById,
  listDocumentVersions,
} from '@/lib/documents-api';
import { FileTypeIcon } from '@/lib/file-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format dung lượng file thành chuỗi dễ đọc (B / KB / MB / GB)
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
}

/**
 * Format ngày sang tiếng Việt — không dùng date-fns (theo AGENTS.md)
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Map MIME type sang tên thân thiện tiếng Việt
 */
function getMimeTypeName(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') return 'Word';
  if (mimeType.includes('spreadsheetml') || mimeType === 'application/vnd.ms-excel') return 'Excel';
  if (mimeType === 'text/csv') return 'CSV';
  if (mimeType.includes('presentationml') || mimeType === 'application/vnd.ms-powerpoint') return 'PowerPoint';
  if (mimeType === 'image/png') return 'Ảnh PNG';
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'Ảnh JPEG';
  if (mimeType === 'image/gif') return 'Ảnh GIF';
  if (mimeType === 'image/webp') return 'Ảnh WebP';
  if (mimeType.startsWith('image/')) return 'Ảnh';
  if (mimeType === 'text/plain') return 'Văn bản thuần';
  if (mimeType === 'application/json') return 'JSON';
  if (mimeType === 'text/html') return 'HTML';
  if (mimeType === 'application/x-autocad' || mimeType.includes('dwg') || mimeType.includes('dxf')) return 'CAD/DWG';
  if (mimeType.startsWith('text/')) return 'Văn bản';
  return mimeType;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface DocumentDetailPanelProps {
  document: Document | null;
  onClose: () => void;
  onPreview?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onShare?: (docId: string, docName: string) => void;
  onDownload?: (docId: string, fileName: string) => void;
  /** Callback để cập nhật selectedDocument ở parent khi extraction status thay đổi */
  onDocumentUpdate?: (doc: Document) => void;
  /** Callback để đổi cấp độ bảo mật (chỉ OWNER) */
  onChangeSecurityLevel?: (doc: Document) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * DocumentDetailPanel — panel chi tiết tài liệu (phần phải trong 3-panel layout)
 *
 * Hiển thị đầy đủ thông tin tài liệu: tên, ký hiệu, người tạo, phòng ban,
 * dung lượng, loại file, ngày tạo/cập nhật, mô tả + action buttons.
 */
export function DocumentDetailPanel({
  document,
  onClose,
  onPreview,
  onEdit,
  onShare,
  onDownload,
  onDocumentUpdate,
  onChangeSecurityLevel,
}: DocumentDetailPanelProps) {
  const t = useTranslations('documents');
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('documents:read');
  const canViewConfidential = hasPermission('documents:view_confidential');
  const isConfidentialBlocked = document?.securityLevel === 'CONFIDENTIAL' && !canViewConfidential;
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Embedding action states
  const [cancellingEmbed, setCancellingEmbed] = useState(false);
  const [retryingEmbed, setRetryingEmbed] = useState(false);

  // Chỉ system_admin hoặc owner mới thấy nút retry/cancel extraction
  const isAdmin = user?.roles?.includes('system_admin') ?? false;
  const isOwner = !!(user?.username && document?.uploader?.username && user.username === document.uploader.username);
  const canManageExtraction = isAdmin || isOwner;

  // ACL-based permission level — fallback về VIEWER nếu không có (backward compat)
  const permLevel = document?.permissionLevel ?? 'VIEWER';
  const isEditorOrAbove = permLevel === 'EDITOR' || permLevel === 'OWNER';
  const isOwnerLevel = permLevel === 'OWNER';

  // Chỉ hiển thị nút Tải xuống khi có system permission documents:download
  const canDownload = hasPermission('documents:download');

  // State phiên bản hiện tại
  const [currentVersion, setCurrentVersion] = useState<DocumentVersion | null>(null);

  // Fetch phiên bản hiện tại khi document thay đổi
  useEffect(() => {
    if (!document?.id) {
      setCurrentVersion(null);
      return;
    }
    listDocumentVersions(document.id)
      .then((versions) => setCurrentVersion(versions[0] ?? null))
      .catch(() => setCurrentVersion(null));
  }, [document?.id]);

  // Fetch extracted text khi status là COMPLETED hoặc PARTIAL
  useEffect(() => {
    if (
      (document?.extractionStatus === 'COMPLETED' ||
        document?.extractionStatus === 'PARTIAL') &&
      document?.id
    ) {
      setLoadingText(true);
      getDocumentExtractedText(document.id)
        .then((res) => setExtractedText(res.extractedText))
        .catch(() => setExtractedText(null))
        .finally(() => setLoadingText(false));
    } else {
      setExtractedText(null);
    }
  }, [document?.id, document?.extractionStatus]);

  // Polling: auto-refresh extraction status khi PENDING/PROCESSING
  useEffect(() => {
    if (!document?.id) return;
    if (
      document.extractionStatus !== 'PENDING' &&
      document.extractionStatus !== 'PROCESSING'
    )
      return;

    const intervalId = setInterval(async () => {
      try {
        const updated = await getDocumentById(document.id);
        if (updated.extractionStatus !== document.extractionStatus) {
          onDocumentUpdate?.(updated);
          if (updated.extractionStatus === 'COMPLETED') {
              toast.success(t('detail.extractionComplete'));
            } else if (updated.extractionStatus === 'PARTIAL') {
              toast.success(t('detail.extractionPartialComplete'));
            } else if (updated.extractionStatus === 'FAILED') {
              toast.error(t('detail.extractionFailed'));
            }
        }
      } catch {
        // Silent fail — polling sẽ thử lại lần sau
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [document?.id, document?.extractionStatus, onDocumentUpdate]);

  // Handler: retry extraction (cho FAILED docs)
  const handleRetry = async () => {
    if (!document?.id) return;
    setRetrying(true);
    try {
      await reExtractDocument(document.id);
      toast.success(t('detail.reExtractSuccess'));
      const updated = await getDocumentById(document.id);
      onDocumentUpdate?.(updated);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        t('detail.reExtractError');
      toast.error(msg);
    } finally {
      setRetrying(false);
    }
  };

  // Handler: cancel extraction (cho PENDING/PROCESSING docs)
  const handleCancel = async () => {
    if (!document?.id) return;
    setCancelling(true);
    try {
      await cancelExtraction(document.id);
      toast.success(t('detail.cancelExtractionSuccess'));
      const updated = await getDocumentById(document.id);
      onDocumentUpdate?.(updated);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        t('detail.cancelExtractionError');
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  // Polling: auto-refresh embedding status khi PENDING/PROCESSING
  useEffect(() => {
    if (!document?.id) return;
    if (
      document.embeddingStatus !== 'PENDING' &&
      document.embeddingStatus !== 'PROCESSING'
    )
      return;

    const intervalId = setInterval(async () => {
      try {
        const updated = await getDocumentById(document.id);
        if (updated.embeddingStatus !== document.embeddingStatus) {
          onDocumentUpdate?.(updated);
          if (updated.embeddingStatus === 'COMPLETED') {
            toast.success(t('detail.embeddingComplete'));
          } else if (updated.embeddingStatus === 'FAILED') {
            toast.error(t('detail.embeddingFailed'));
          }
        }
      } catch {
        // Silent fail — polling sẽ thử lại lần sau
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [document?.id, document?.embeddingStatus, onDocumentUpdate]);

  // Handler: cancel embedding (PENDING/PROCESSING → FAILED)
  const handleCancelEmbed = async () => {
    if (!document?.id) return;
    setCancellingEmbed(true);
    try {
      await cancelEmbedding(document.id);
      toast.success(t('detail.cancelEmbeddingSuccess'));
      const updated = await getDocumentById(document.id);
      onDocumentUpdate?.(updated);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        t('detail.cancelEmbeddingError');
      toast.error(msg);
    } finally {
      setCancellingEmbed(false);
    }
  };

  // Handler: retry embedding (FAILED/PENDING/SKIPPED → re-queue)
  const handleRetryEmbed = async () => {
    if (!document?.id) return;
    setRetryingEmbed(true);
    try {
      await reEmbedDocument(document.id);
      toast.success(t('detail.reEmbedSuccess'));
      const updated = await getDocumentById(document.id);
      onDocumentUpdate?.(updated);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        t('detail.reEmbedError');
      toast.error(msg);
    } finally {
      setRetryingEmbed(false);
    }
  };

  // Handler: manual refresh status
  const handleRefreshStatus = async () => {
    if (!document?.id) return;
    try {
      const updated = await getDocumentById(document.id);
      onDocumentUpdate?.(updated);
      if (updated.extractionStatus === 'COMPLETED') {
        toast.success(t('detail.extractionComplete'));
      }
    } catch {
      toast.error(t('detail.refreshStatusError'));
    }
  };

  if (!document) return null;

  const uploaderName = document.uploader?.fullName || document.uploader?.username || 'Không rõ';

  // Guard OCR section theo MIME type — chỉ hiện cho PDF/DOCX/XLSX/PPTX/Text/Image
  const ocrMimeSupported = isExtractionSupported(document.mimeType);

  // Pipeline logic: Tài liệu cần số hóa trước khi nhúng vector
  // - UNSUPPORTED = file text/code, không cần OCR → embed bình thường
  // - COMPLETED/PARTIAL = đã có text → embed bình thường
  // - Các trạng thái khác (PENDING/PROCESSING/FAILED) = cần hoàn thành OCR trước
  const needsOcrFirst = !!(
    document?.extractionStatus &&
    document.extractionStatus !== 'UNSUPPORTED' &&
    document.extractionStatus !== 'COMPLETED' &&
    document.extractionStatus !== 'PARTIAL'
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b shrink-0 flex items-start justify-between gap-2 bg-gradient-to-r from-slate-50 to-blue-50/40">
        <span
          className="text-sm font-semibold leading-tight line-clamp-2 flex-1 text-slate-800"
          title={document.title}
        >
          {document.title}
        </span>
        <button
          onClick={onClose}
          className="shrink-0 mt-0.5 rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          title={t('detail.close')}
          aria-label={t('detail.close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Thumbnail / Icon area ── */}
      <div className="px-4 py-5 border-b shrink-0 flex flex-col items-center gap-2 bg-gradient-to-b from-blue-50/60 to-slate-50/30">
        <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
          <FileTypeIcon mimeType={document.mimeType} fileName={document.fileName} className="h-14 w-14" />
        </div>
        <span className="text-xs font-medium text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
          {getMimeTypeName(document.mimeType)}
        </span>
      </div>

      {/* ── Thông tin ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3.5 w-1 rounded-full bg-blue-500" />
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {t('detail.info')}
            </p>
          </div>

          <dl className="space-y-2.5">
            {/* Ký hiệu — ẩn nếu null */}
            {document.referenceNumber && (
              <div className="flex justify-between items-start gap-2 py-1.5 px-2 rounded-md bg-blue-50/50 border border-blue-100/60">
                <dt className="text-xs text-blue-600/80 shrink-0">{t('detail.referenceNumber')}</dt>
                <dd className="text-xs font-semibold text-slate-800 text-right break-words">
                  {document.referenceNumber}
                </dd>
              </div>
            )}

            {/* Người tải lên */}
            <div className="flex justify-between items-center gap-2 py-1 px-1">
              <dt className="text-xs text-slate-400 shrink-0">{t('detail.uploadedBy')}</dt>
              <dd
                className="text-xs font-medium text-slate-700 truncate max-w-[60%] text-right"
                title={`${document.uploader?.fullName} (${document.uploader?.username})`}
              >
                {uploaderName}
              </dd>
            </div>

            {/* Phòng ban — ẩn nếu null (tài liệu cá nhân) */}
            {document.department && (
              <div className="flex justify-between items-center gap-2 py-1 px-1">
                <dt className="text-xs text-slate-400 shrink-0">{t('detail.department')}</dt>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <dd className="text-xs font-medium text-slate-700 text-right truncate max-w-[60%]">{document.department.name}</dd>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{document.department.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Dung lượng */}
            <div className="flex justify-between items-center gap-2 py-1 px-1">
              <dt className="text-xs text-slate-400 shrink-0">{t('detail.fileSize')}</dt>
              <dd className="text-xs font-medium text-slate-700">{formatFileSize(document.fileSize)}</dd>
            </div>

            {/* Loại file */}
            <div className="flex justify-between items-center gap-2 py-1 px-1">
              <dt className="text-xs text-slate-400 shrink-0">{t('detail.fileType')}</dt>
              <dd className="text-xs font-medium text-slate-700">{getMimeTypeName(document.mimeType)}</dd>
            </div>

            {/* Ngày tải lên */}
            <div className="flex justify-between items-center gap-2 py-1 px-1">
              <dt className="text-xs text-slate-400 shrink-0">{t('detail.uploadedAt')}</dt>
              <dd className="text-xs font-medium text-slate-700">{formatDate(document.createdAt)}</dd>
            </div>

            {/* Cập nhật lần cuối */}
            <div className="flex justify-between items-center gap-2 py-1 px-1">
              <dt className="text-xs text-slate-400 shrink-0">{t('detail.updatedAt')}</dt>
              <dd className="text-xs font-medium text-slate-700">{formatDate(document.updatedAt)}</dd>
            </div>

            {/* Cấp độ bảo mật — Phase 62 */}
            <div className={`flex justify-between items-center gap-2 py-1.5 px-2 rounded-md border mt-1 ${
              document.securityLevel === 'CONFIDENTIAL'
                ? 'bg-rose-50/60 border-rose-200/60'
                : 'bg-emerald-50/60 border-emerald-200/60'
            }`}>
              <dt className={`text-xs shrink-0 font-medium ${document.securityLevel === 'CONFIDENTIAL' ? 'text-rose-600/80' : 'text-emerald-600/80'}`}>
                Bảo mật
              </dt>
              <dd className="flex items-center gap-1">
                {document.securityLevel === 'CONFIDENTIAL' ? (
                  <Badge variant="outline" className="gap-1 bg-rose-100 border-rose-300 text-rose-700 text-xs h-5 px-1.5">
                    <Lock className="h-2.5 w-2.5" />
                    Mật
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-100 border-emerald-300 text-emerald-700 text-xs h-5 px-1.5">Thường</Badge>
                )}
                {/* Nút đổi cấp độ bảo mật — chỉ OWNER */}
                {isOwnerLevel && onChangeSecurityLevel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600"
                    onClick={() => onChangeSecurityLevel(document)}
                    title="Đổi cấp độ bảo mật"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </Button>
                )}
              </dd>
            </div>
          </dl>

          {/* Trạng thái kích hoạt — Phase 72.1 */}
          <div className={`flex justify-between items-center gap-2 py-1.5 px-2 rounded-md border mt-2 ${
            document.status === 'INACTIVE'
              ? 'bg-gray-50/60 border-gray-200/60'
              : 'bg-green-50/60 border-green-200/60'
          }`}>
            <dt className={`text-xs shrink-0 font-medium ${document.status === 'INACTIVE' ? 'text-gray-500' : 'text-green-600/80'}`}>
              Trạng thái
            </dt>
            <dd>
              {document.status === 'INACTIVE' ? (
                <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-gray-100 text-gray-600 border-gray-200">
                  Vô hiệu hóa
                </Badge>
              ) : (
                <Badge variant="default" className="text-xs h-5 px-1.5 bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                  Kích hoạt
                </Badge>
              )}
            </dd>
          </div>
        </div>

        {/* ── Phiên bản hiện tại ── */}
        {currentVersion && (
          <div className="px-4 pb-4 border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3.5 w-1 rounded-full bg-indigo-400" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Phiên bản hiện tại
              </p>
            </div>

            <dl className="space-y-2">
              {/* Số phiên bản */}
              <div className="flex justify-between items-center gap-2 py-1.5 px-2 rounded-md bg-indigo-50/50 border border-indigo-100/60">
                <dt className="text-xs text-indigo-600/80 shrink-0">Phiên bản</dt>
                <dd className="text-xs font-semibold text-slate-800">
                  v{currentVersion.versionNumber}
                </dd>
              </div>

              {/* Người cập nhật */}
              <div className="flex justify-between items-center gap-2 py-1 px-1">
                <dt className="text-xs text-slate-400 shrink-0">Người cập nhật</dt>
                <dd
                  className="text-xs font-medium text-slate-700 truncate max-w-[60%] text-right"
                  title={`${currentVersion.creator.fullName} (${currentVersion.creator.username})`}
                >
                  {currentVersion.editorDisplayName || currentVersion.creator.fullName || currentVersion.creator.username}
                </dd>
              </div>

              {/* Ngày cập nhật */}
              <div className="flex justify-between items-center gap-2 py-1 px-1">
                <dt className="text-xs text-slate-400 shrink-0">Ngày cập nhật</dt>
                <dd className="text-xs font-medium text-slate-700">
                  {formatDate(currentVersion.createdAt)}
                </dd>
              </div>

              {/* Dung lượng */}
              <div className="flex justify-between items-center gap-2 py-1 px-1">
                <dt className="text-xs text-slate-400 shrink-0">Dung lượng</dt>
                <dd className="text-xs font-medium text-slate-700">
                  {formatFileSize(currentVersion.fileSize)}
                </dd>
              </div>

              {/* Ghi chú thay đổi — chỉ hiện khi có */}
              {currentVersion.changeNote && (
                <div className="flex justify-between items-start gap-2 py-1 px-1">
                  <dt className="text-xs text-slate-400 shrink-0">Ghi chú</dt>
                  <dd className="text-xs font-medium text-slate-700 text-right break-words max-w-[65%]">
                    {currentVersion.changeNote}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* ── Mô tả — ẩn nếu null ── */}
        {document.description && (
          <div className="px-4 pb-4 border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3.5 w-1 rounded-full bg-violet-400" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('detail.description')}
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed break-words bg-slate-50/60 rounded-md px-3 py-2 border border-slate-100">
              {document.description}
            </p>
          </div>
        )}

        {/* ── Nội dung số hóa ── chỉ hiển thị cho MIME type được hỗ trợ (PDF/DOCX/XLSX/PPTX/Text/Image) */}
        {ocrMimeSupported && document.extractionStatus && document.extractionStatus !== 'UNSUPPORTED' && (
          <div className="px-4 pb-4 border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3.5 w-1 rounded-full bg-amber-400" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('detail.extractedContent')}
              </p>
            </div>

            {/* Trạng thái số hóa */}
            <div className="flex justify-between items-center gap-2 py-1 px-1">
              <span className="text-xs text-slate-400 shrink-0">{t('detail.extractionStatus')}</span>
              <div className="flex items-center gap-1">
                {(document.extractionStatus === 'PENDING' || document.extractionStatus === 'PROCESSING') && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      {t('detail.extracting')}
                    </span>
                    <button onClick={handleRefreshStatus} className="p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors" title={t('detail.refreshStatus')}>
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </>
                )}
                {document.extractionStatus === 'COMPLETED' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    {t('detail.extracted')}
                  </span>
                )}
                {document.extractionStatus === 'PARTIAL' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <AlertCircle className="h-2.5 w-2.5" />
                    {t('detail.extractionPartial')}
                  </span>
                )}
                {document.extractionStatus === 'FAILED' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
                    <AlertCircle className="h-2.5 w-2.5" />
                    {t('detail.extractionFailed')}
                  </span>
                )}
              </div>
            </div>

            {document.ocrPagesAiVl != null && document.ocrPagesAiVl > 0 && (
              <div className="flex justify-between items-center gap-2 py-1 px-1">
                <span className="text-xs text-slate-400 shrink-0">Trang xử lý</span>
                <span className="text-xs font-medium text-slate-700">{document.ocrPagesStandard} OCR + {document.ocrPagesAiVl} AI</span>
              </div>
            )}

            {/* Nội dung trích xuất — COMPLETED hoặc PARTIAL */}
            {(document.extractionStatus === 'COMPLETED' || document.extractionStatus === 'PARTIAL') && (
              <div className="mt-2">
                {document.extractionStatus === 'PARTIAL' && (
                  <p className="text-xs text-yellow-700 mb-1.5 bg-yellow-50 rounded px-2 py-1 border border-yellow-200">
                    {t('detail.partialPages')}
                  </p>
                )}
                {loadingText ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t('detail.loadingContent')}
                  </div>
                ) : extractedText ? (
                  <>
                    <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap break-words line-clamp-3 bg-slate-50 rounded-md px-2 py-1.5 border border-slate-100">
                      {extractedText.slice(0, 300)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs h-7 w-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
                      onClick={() => setShowFullText(true)}
                    >
                      <Maximize2 className="h-3 w-3 mr-1.5" />
                      {t('detail.viewMore')}
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">{t('detail.noContent')}</p>
                )}
              </div>
            )}

            {/* Hành động — PENDING/PROCESSING: Hủy */}
            {canManageExtraction && (document.extractionStatus === 'PENDING' || document.extractionStatus === 'PROCESSING') && (
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs h-7 w-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                  {t('detail.cancelExtraction')}
                </Button>
              </div>
            )}

            {/* FAILED: Thử lại */}
            {document.extractionStatus === 'FAILED' && (
              <div className="mt-2 flex flex-col gap-1.5">
                <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 border border-red-100">
                  {canManageExtraction ? t('detail.extractionFailedRetry') : t('detail.extractionFailedMsg')}
                </p>
                {canManageExtraction && (
                  <Button variant="ghost" size="sm" className="text-xs h-7 w-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100" onClick={handleRetry} disabled={retrying}>
                    {retrying ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                    {t('detail.retry')}
                  </Button>
                )}
              </div>
            )}

            {/* Số hóa lại — chỉ admin, khi COMPLETED hoặc PARTIAL */}
            {isAdmin && (document.extractionStatus === 'COMPLETED' || document.extractionStatus === 'PARTIAL') && (
              <div className="mt-2">
                <Button variant="ghost" size="sm" className="text-xs h-7 w-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200" onClick={handleRetry} disabled={retrying}>
                  {retrying ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                  {t('detail.forceReExtract')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Nhúng vector (Embedding) ── */}
        {document.embeddingStatus && (
          <div className="px-4 pb-4 border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3.5 w-1 rounded-full bg-sky-400" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('detail.embedding')}
              </p>
            </div>

            {/* Cảnh báo pipeline: cần số hóa trước khi nhúng */}
            {needsOcrFirst && (
              <div className="mb-3 flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  {t('detail.needOcrFirst')}
                </p>
              </div>
            )}

            {/* Trạng thái nhúng */}
            <div className="flex justify-between items-center gap-2 py-1 px-1">
              <span className="text-xs text-slate-400 shrink-0">{t('detail.extractionStatus')}</span>
              <div className="flex items-center gap-1">
                {document.embeddingStatus === 'PENDING' && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />{t('detail.embeddingPending')}
                    </span>
                    <button onClick={handleRefreshStatus} className="p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors" title={t('detail.refreshStatus')}>
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </>
                )}
                {document.embeddingStatus === 'PROCESSING' && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />{t('detail.embeddingProcessing')}
                    </span>
                    <button onClick={handleRefreshStatus} className="p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors" title={t('detail.refreshStatus')}>
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </>
                )}
                {document.embeddingStatus === 'COMPLETED' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-2.5 w-2.5" />{t('detail.embeddingDone')}
                  </span>
                )}
                {document.embeddingStatus === 'FAILED' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
                    <AlertCircle className="h-2.5 w-2.5" />{t('detail.embeddingFailedStatus')}
                  </span>
                )}
                {document.embeddingStatus === 'SKIPPED' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 border border-slate-200">
                    {t('detail.embeddingSkipped')}
                  </span>
                )}
              </div>
            </div>

            {/* Số đoạn — COMPLETED */}
            {document.embeddingStatus === 'COMPLETED' && document.chunkCount != null && (
              <div className="flex justify-between items-center gap-2 py-1 px-1">
                <span className="text-xs text-slate-400 shrink-0">{t('detail.chunkCount')}</span>
                <span className="text-xs font-medium text-slate-700">{document.chunkCount} {t('detail.chunks')}</span>
              </div>
            )}

            {/* Ngày nhúng — COMPLETED */}
            {document.embeddingStatus === 'COMPLETED' && document.embeddedAt && (
              <div className="flex justify-between items-center gap-2 py-1 px-1">
                <span className="text-xs text-slate-400 shrink-0">{t('detail.embeddedAt')}</span>
                <span className="text-xs font-medium text-slate-700">{formatDate(document.embeddedAt)}</span>
              </div>
            )}

            {/* Ghi chú SKIPPED */}
            {document.embeddingStatus === 'SKIPPED' && (
              <p className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-1 border border-slate-100 mt-1">
                {t('detail.noTextToEmbed')}
              </p>
            )}

            {/* Nút hành động — chỉ admin */}
            {isAdmin && (
              <div className="mt-2 flex flex-col gap-1.5">
                {(document.embeddingStatus === 'PENDING' || document.embeddingStatus === 'PROCESSING') && (
                  <Button variant="ghost" size="sm" className="text-xs h-7 w-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100" onClick={handleCancelEmbed} disabled={cancellingEmbed}>
                    {cancellingEmbed ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    {t('detail.cancelEmbedding')}
                  </Button>
                )}
                {(document.embeddingStatus === 'FAILED' || (document.embeddingStatus === 'SKIPPED' && document.extractionStatus === 'COMPLETED')) && (
                  <Button variant="ghost" size="sm" className="text-xs h-7 w-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100" onClick={handleRetryEmbed} disabled={retryingEmbed || needsOcrFirst} title={needsOcrFirst ? t('detail.needOcrFirst') : t('detail.retryEmbedding')}>
                    {retryingEmbed ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                    {t('detail.retryEmbedding')}
                  </Button>
                )}
                {document.embeddingStatus === 'COMPLETED' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 w-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200"
                    onClick={handleRetryEmbed}
                    disabled={retryingEmbed}
                  >
                    {retryingEmbed ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RotateCcw className="h-3 w-3 mr-1" />
                    )}
                    {t('detail.forceReEmbed')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div className="px-4 py-3 border-t shrink-0 bg-gradient-to-b from-white to-slate-50/60">
        <div className="grid grid-cols-2 gap-2">
          {canRead && !isConfidentialBlocked && isPreviewable(document.mimeType) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 transition-colors"
              onClick={() => onPreview?.(document)}
              title={t('detail.preview')}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              {t('detail.preview')}
            </Button>
          )}
          {canDownload && !isConfidentialBlocked && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 transition-colors"
              onClick={() => onDownload?.(document.id, document.fileName)}
              title={t('detail.download')}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {t('detail.download')}
            </Button>
          )}
          {isEditable(document.mimeType) && isEditorOrAbove && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300 transition-colors"
              onClick={() => onEdit?.(document)}
              title={t('detail.editDoc')}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              {t('detail.editDoc')}
            </Button>
          )}
          {isOwnerLevel && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 hover:border-sky-300 transition-colors"
              onClick={() => onShare?.(document.id, document.fileName)}
              title={t('detail.shareDoc')}
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              {t('detail.shareDoc')}
            </Button>
          )}
        </div>
      </div>

      {/* ── Modal xem toàn bộ nội dung số hóa ── */}
      <Dialog open={showFullText} onOpenChange={setShowFullText}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold line-clamp-1">
              {t('detail.extractedContent')} — {document?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {extractedText ? (
              <div
                className="
                  text-sm leading-relaxed
                  [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
                  [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2
                  [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
                  [&_p]:mb-2 [&_p]:text-sm [&_p]:text-foreground
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                  [&_li]:text-sm [&_li]:mb-0.5
                  [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:mb-3
                  [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:font-medium [&_th]:text-left
                  [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1
                  [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                  [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-xs
                  [&_code]:text-xs [&_code]:font-mono
                  [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded
                  [&_hr]:my-3 [&_hr]:border-border
                  [&_strong]:font-semibold
                  p-1
                "
              >
                <MarkdownRenderer rehypePlugins={[rehypeRaw]}>
                  {extractedText}
                </MarkdownRenderer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('detail.noContent')}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
