'use client';

import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {useTranslations} from 'next-intl';
import {uploadDocument} from '@/lib/documents-api';
import {hasBlockedExtension, type ParsedFolderResult} from '@/lib/folder-upload-utils';
import {
  executeFolderUpload,
  type FolderUploadResult,
  type FolderUploadProgress,
} from '@/lib/folder-upload-orchestrator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Progress} from '@/components/ui/progress';
import {
  CheckCircle,
  FileText,
  Loader2,
  Upload,
  Shield,
  XCircle,
  Folder as FolderIcon,
  AlertTriangle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {FolderTreePreview} from './folder-tree-preview';
import {BatchUploadSummary} from './batch-upload-summary';
import {parseFolderFiles} from '@/lib/folder-upload-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  targetFolderId?: string | null; // Folder đích khi upload từ context menu "Tải lên tại đây"
  /** Phase 30: auto-fill departmentId khi đang trong context phòng ban */
  departmentId?: string | null;
  /** Phase 30: tên phòng ban để hiển thị info text */
  departmentName?: string | null;
}

/**
 * Helper: Format file size human-readable
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

interface UploadResult {
  file: File;
  success: boolean;
  error?: string;
}

export function DocumentUploadDialog({ open, onOpenChange, onSuccess, targetFolderId, departmentId, departmentName }: DocumentUploadDialogProps) {
  const t = useTranslations('documents');
  const tPerm = useTranslations('permissions');

  // ---------------------------------------------------------------------------
  // Tab state
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'file' | 'folder'>('file');

  // ---------------------------------------------------------------------------
  // File tab state
  // ---------------------------------------------------------------------------
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [securityLevel, setSecurityLevel] = useState<'NORMAL' | 'CONFIDENTIAL'>('NORMAL');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Folder tab state
  // ---------------------------------------------------------------------------
  const [folderResult, setFolderResult] = useState<ParsedFolderResult | null>(null);
  const [folderDescription, setFolderDescription] = useState('');
  const [folderReferenceNumber, setFolderReferenceNumber] = useState('');
  const [folderSecurityLevel, setFolderSecurityLevel] = useState<'NORMAL' | 'CONFIDENTIAL'>('NORMAL');
  const [folderUploading, setFolderUploading] = useState(false);
  const [folderProgress, setFolderProgress] = useState<FolderUploadProgress | null>(null);
  const [folderUploadResult, setFolderUploadResult] = useState<FolderUploadResult | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const cancelRef = useRef({ current: false });
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Reset helpers
  // ---------------------------------------------------------------------------
  const resetFileTabState = () => {
    setDescription('');
    setReferenceNumber('');
    setSelectedFiles([]);
    setUploading(false);
    setProgress(0);
    setSecurityLevel('NORMAL');
    setUploadResults([]);
    setCurrentFileIndex(null);
  };

  const resetFolderTabState = () => {
    setFolderResult(null);
    setFolderDescription('');
    setFolderReferenceNumber('');
    setFolderSecurityLevel('NORMAL');
    setFolderUploading(false);
    setFolderProgress(null);
    setFolderUploadResult(null);
    setShowCancelConfirm(false);
    cancelRef.current = { current: false };
  };

  // Reset form khi dialog đóng
  useEffect(() => {
    if (!open) {
      resetFileTabState();
      resetFolderTabState();
      setActiveTab('file');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Tab switching
  // ---------------------------------------------------------------------------
  const handleTabChange = (value: 'file' | 'folder') => {
    if (value === 'file') {
      resetFolderTabState();
    } else {
      resetFileTabState();
    }
    setActiveTab(value);
  };

  // ---------------------------------------------------------------------------
  // File tab handlers
  // ---------------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);

    const blocked = incoming.filter(f => hasBlockedExtension(f.name));
    if (blocked.length > 0) {
      toast.error(t('upload_dialog.fileInvalidError'));
    }
    const validType = incoming.filter(f => !hasBlockedExtension(f.name));

    const oversized = validType.filter(f => f.size > 52428800);
    if (oversized.length > 0) {
      toast.error(t('upload_dialog.fileSizeError'));
    }
    const allowed = validType.filter(f => f.size <= 52428800);
    if (allowed.length === 0) {
      e.target.value = '';
      return;
    }

    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles = allowed.filter(f => !existingNames.has(f.name));
      return [...prev, ...newFiles];
    });
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error(t('upload_dialog.noFile'));
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadResults([]);

    const results: UploadResult[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentFileIndex(i);
      setProgress(Math.round((i / selectedFiles.length) * 100));

      try {
        const actualDeptId = departmentId === 'personal' ? undefined : departmentId;
        const result = await uploadDocument(
          selectedFiles[i],
          undefined,
          description.trim() || undefined,
          targetFolderId,
          (percent) => {
            setProgress(Math.round(((i + percent / 100) / selectedFiles.length) * 100));
          },
          actualDeptId,
          referenceNumber.trim() || undefined,
          securityLevel,
        );
        results.push({ file: selectedFiles[i], success: true });

        if (result?.autoSharedWithDepartment) {
          toast.success(
            tPerm('share.autoSharedWithDept', {
              name: result.autoSharedWithDepartment.name,
            })
          );
        }
      } catch (error: any) {
        const msg = error?.response?.data?.message || error?.response?.data?.error?.message || 'Tải lên thất bại';
        results.push({ file: selectedFiles[i], success: false, error: msg });
      }

      setUploadResults([...results]);
    }

    setProgress(100);
    setUploading(false);
    setCurrentFileIndex(null);

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    const total = selectedFiles.length;

    if (successCount > 0) {
      toast.success(t('upload_dialog.uploadComplete', { success: successCount, total }));
    }
    if (failedCount > 0) {
      toast.error(t('upload_dialog.uploadPartialFail', { failed: failedCount }));
    }

    if (successCount > 0) {
      onSuccess();
    }

    if (failedCount === 0) {
      onOpenChange(false);
    }
  };

  const canSubmit = !uploading && description.length <= 2000 && referenceNumber.length <= 100;

  // ---------------------------------------------------------------------------
  // Folder tab handlers
  // ---------------------------------------------------------------------------
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const result = parseFolderFiles(files);
    setFolderResult(result);
    e.target.value = '';
  };

  const handleFolderUpload = async () => {
    if (!folderResult) {
      toast.error(t('upload_dialog.noFolder'));
      return;
    }
    setFolderUploading(true);
    cancelRef.current = { current: false };
    setFolderProgress(null);
    setFolderUploadResult(null);

    const actualDeptId = departmentId === 'personal' ? undefined : departmentId;

    const result = await executeFolderUpload({
      tree: folderResult.tree,
      targetFolderId: targetFolderId,
      departmentId: actualDeptId ?? null,
      metadata: {
        description: folderDescription.trim() || undefined,
        referenceNumber: folderReferenceNumber.trim() || undefined,
        securityLevel: folderSecurityLevel,
      },
      onProgress: (prog) => setFolderProgress(prog),
      cancelRef: cancelRef.current,
    });

    setFolderUploading(false);
    setFolderUploadResult(result);

    // Nếu cancel và có file thành công, gọi onSuccess ngay
    if (result.cancelled && result.successFiles.length > 0) {
      onSuccess();
      onOpenChange(false);
    }
  };

  const handleConfirmCancel = () => {
    cancelRef.current.current = true;
    setShowCancelConfirm(false);
  };

  const handleFolderClose = () => {
    if (folderUploadResult && folderUploadResult.successFiles.length > 0) {
      onSuccess();
    }
    onOpenChange(false);
  };

  // Intercept Dialog close khi đang folder uploading
  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && folderUploading) {
      setShowCancelConfirm(true);
      return;
    }
    onOpenChange(nextOpen);
  };

  // ---------------------------------------------------------------------------
  // Dialog description theo active tab
  // ---------------------------------------------------------------------------
  const dialogDescription = activeTab === 'folder'
    ? t('upload_dialog.folder_description')
    : t('upload_dialog.description');

  // ---------------------------------------------------------------------------
  // Folder tab content
  // ---------------------------------------------------------------------------
  const folderTabContent = () => {
    // State 4: batch complete
    if (folderUploadResult !== null) {
      return <BatchUploadSummary result={folderUploadResult} onClose={handleFolderClose} />;
    }

    const isIdle = folderResult === null && !folderUploading;

    return (
      <div className="space-y-4">
        {/* Nút chọn / đổi folder */}
        {isIdle ? (
          <Button
            variant="outline"
            className="w-full border-blue-200 text-blue-600"
            onClick={() => folderInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('upload_dialog.choose_folder_button')}
          </Button>
        ) : folderResult !== null && !folderUploading ? (
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={() => folderInputRef.current?.click()}
          >
            {t('upload_dialog.change_folder_button')}
          </Button>
        ) : null}

        {/* Hidden folder input */}
        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          {...({ webkitdirectory: '', directory: '' } as any)}
          onChange={handleFolderSelect}
        />

        {/* Warning banner > 200 files */}
        {folderResult !== null && folderResult.totalFiles > 200 && (
          <div
            className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-sm text-amber-800 flex items-center gap-2"
            data-testid="large-folder-warning"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            {t('upload_dialog.large_folder_warning', { count: folderResult.totalFiles })}
          </div>
        )}

        {/* Tree preview */}
        {folderResult !== null && (
          <div className={folderUploading ? 'pointer-events-none opacity-75' : ''}>
            <FolderTreePreview
              tree={folderResult.tree}
              totalFiles={folderResult.totalFiles}
              totalFolders={folderResult.totalFolders}
            />
          </div>
        )}

        {/* Progress section (State 3) */}
        {folderUploading && folderProgress !== null && (
          <div className="space-y-2" data-testid="folder-upload-progress">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 truncate max-w-[320px]">
                {t('upload_dialog.folder_progress', {
                  current: (folderProgress.completedFiles ?? 0) + 1,
                  total: folderProgress.totalFiles ?? 0,
                  path: folderProgress.currentFilePath ?? '',
                })}
              </span>
              <span className="font-medium text-blue-700">
                {Math.round(((folderProgress.completedFiles ?? 0) / (folderProgress.totalFiles || 1)) * 100)}%
              </span>
            </div>
            <Progress
              value={((folderProgress.completedFiles ?? 0) / (folderProgress.totalFiles || 1)) * 100}
              className="[&>div]:bg-blue-500"
            />
          </div>
        )}

        {/* Metadata form */}
        <div className="space-y-2">
          <Label htmlFor="folder-description-input">{t('upload_dialog.descriptionLabel')}</Label>
          <Textarea
            id="folder-description-input"
            placeholder={t('upload_dialog.descriptionPlaceholder')}
            value={folderDescription}
            onChange={(e) => setFolderDescription(e.target.value)}
            disabled={folderUploading}
            rows={3}
            className={folderDescription.length > 2000 ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {folderDescription.length > 2000 && (
            <p className="text-sm text-destructive">{t('upload_dialog.descriptionMaxError')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="folder-reference-number-input">{t('upload_dialog.referenceLabel')}</Label>
          <Input
            id="folder-reference-number-input"
            placeholder={t('upload_dialog.referencePlaceholder')}
            value={folderReferenceNumber}
            onChange={(e) => setFolderReferenceNumber(e.target.value)}
            disabled={folderUploading}
            className={folderReferenceNumber.length > 100 ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {folderReferenceNumber.length > 100 && (
            <p className="text-sm text-destructive">{t('upload_dialog.referenceMaxError')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            Cấp độ bảo mật
          </Label>
          <Select
            value={folderSecurityLevel}
            onValueChange={(v) => setFolderSecurityLevel(v as 'NORMAL' | 'CONFIDENTIAL')}
            disabled={folderUploading}
          >
            <SelectTrigger className={folderSecurityLevel === 'CONFIDENTIAL' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">
                <span className="flex items-center gap-2 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Thường
                </span>
              </SelectItem>
              <SelectItem value="CONFIDENTIAL">
                <span className="flex items-center gap-2 text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  Mật
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department info */}
        {departmentId && departmentId !== 'personal' && (
          <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
            {t('upload_dialog.departmentInfo')}{' '}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-semibold text-blue-800 truncate max-w-[300px] inline-block align-bottom">
                    {departmentName || t('upload_dialog.departmentDefault')}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{departmentName || t('upload_dialog.departmentDefault')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[550px] overflow-hidden [&>*]:min-w-0">
          {/* Colored header strip */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400 rounded-t-lg" />

          <DialogHeader className="pt-2">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-blue-100">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
              {t('upload_dialog.title')}
            </DialogTitle>
            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => handleTabChange(v as 'file' | 'folder')}
          >
            <TabsList
              className={`grid w-full grid-cols-2 mb-4 ${(uploading || folderUploading) ? 'pointer-events-none opacity-60' : ''}`}
            >
              <TabsTrigger value="file">
                <Upload className="h-4 w-4 mr-2" />
                {t('upload_dialog.tab_file')}
              </TabsTrigger>
              <TabsTrigger value="folder">
                <FolderIcon className="h-4 w-4 mr-2" />
                {t('upload_dialog.tab_folder')}
              </TabsTrigger>
            </TabsList>

            {/* ----------------------------------------------------------------
                Tab: Tải lên File (existing flow — giữ nguyên 100%)
            ---------------------------------------------------------------- */}
            <TabsContent value="file">
              <div className="space-y-4">
                {/* File picker */}
                <div className="space-y-2">
                  <Label htmlFor="file-input">{t('upload_dialog.fileLabel')}</Label>
                  <Input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.dwg,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="border-blue-200 focus-visible:ring-blue-400"
                  />

                  {selectedFiles.length > 0 && (
                    <div className="max-h-[200px] overflow-y-auto space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={file.name + file.size}
                          className="flex items-center gap-2 text-sm bg-emerald-50 border border-emerald-200 rounded-md px-3 py-1.5 overflow-hidden"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate flex-1 min-w-0 text-emerald-800 font-medium cursor-default">{file.name}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-[400px] break-all">{file.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="shrink-0 whitespace-nowrap text-xs text-emerald-600">
                            ({formatFileSize(file.size)})
                          </span>
                          {!uploading && (
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-xs text-red-500 hover:text-red-700 shrink-0"
                            >
                              {t('upload_dialog.removeFile')}
                            </button>
                          )}
                          {uploadResults[index] && (
                            uploadResults[index].success
                              ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                              : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                          )}
                          {uploading && currentFileIndex === index && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description-input">{t('upload_dialog.descriptionLabel')}</Label>
                  <Textarea
                    id="description-input"
                    placeholder={t('upload_dialog.descriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={uploading}
                    rows={3}
                    className={description.length > 2000 ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {description.length > 2000 && (
                    <p className="text-sm text-destructive">{t('upload_dialog.descriptionMaxError')}</p>
                  )}
                </div>

                {/* Reference Number */}
                <div className="space-y-2">
                  <Label htmlFor="reference-number-input">{t('upload_dialog.referenceLabel')}</Label>
                  <Input
                    id="reference-number-input"
                    placeholder={t('upload_dialog.referencePlaceholder')}
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    disabled={uploading}
                    className={referenceNumber.length > 100 ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {referenceNumber.length > 100 && (
                    <p className="text-sm text-destructive">{t('upload_dialog.referenceMaxError')}</p>
                  )}
                </div>

                {/* Cấp độ bảo mật */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-slate-500" />
                    Cấp độ bảo mật
                  </Label>
                  <Select value={securityLevel} onValueChange={(v) => setSecurityLevel(v as 'NORMAL' | 'CONFIDENTIAL')}>
                    <SelectTrigger disabled={uploading} className={securityLevel === 'CONFIDENTIAL' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">
                        <span className="flex items-center gap-2 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          Thường
                        </span>
                      </SelectItem>
                      <SelectItem value="CONFIDENTIAL">
                        <span className="flex items-center gap-2 text-rose-700">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          Mật
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department info */}
                {departmentId && departmentId !== 'personal' && (
                  <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
                    {t('upload_dialog.departmentInfo')}{' '}
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-semibold text-blue-800 truncate max-w-[300px] inline-block align-bottom">
                            {departmentName || t('upload_dialog.departmentDefault')}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{departmentName || t('upload_dialog.departmentDefault')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {/* Progress bar */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600">
                        {currentFileIndex !== null
                          ? t('upload_dialog.uploadingProgress', {
                              current: currentFileIndex + 1,
                              total: selectedFiles.length,
                            })
                          : t('upload_dialog.uploading')}
                      </span>
                      <span className="font-semibold text-blue-700">{progress}%</span>
                    </div>
                    <Progress value={progress} className="[&>div]:bg-blue-500" />
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
                  {t('upload_dialog.cancelButton')}
                </Button>
                <Button variant="ghost" onClick={handleUpload} disabled={!canSubmit} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  {uploading ? t('upload_dialog.uploading') : t('upload_dialog.uploadButton')}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* ----------------------------------------------------------------
                Tab: Tải lên Folder (new flow)
            ---------------------------------------------------------------- */}
            <TabsContent value="folder">
              {folderTabContent()}

              {/* Footer chỉ hiện khi chưa có kết quả (BatchUploadSummary tự có footer) */}
              {folderUploadResult === null && (
                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (folderUploading) {
                        setShowCancelConfirm(true);
                      } else {
                        onOpenChange(false);
                      }
                    }}
                  >
                    {t('upload_dialog.cancelButton')}
                  </Button>
                  <Button
                    onClick={handleFolderUpload}
                    disabled={folderUploading || folderDescription.length > 2000 || folderReferenceNumber.length > 100}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    {folderUploading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {t('upload_dialog.folder_upload_button')}
                  </Button>
                </DialogFooter>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Cancel confirm AlertDialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent data-testid="cancel-upload-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('upload_dialog.cancel_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('upload_dialog.cancel_confirm_body', { uploaded: folderProgress?.completedFiles ?? 0 })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="resume-upload">
              {t('upload_dialog.cancel_confirm_resume')}
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-cancel-upload"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmCancel}
            >
              {t('upload_dialog.cancel_confirm_abort')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
