'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { FullscreenLoading } from '@/components/fullscreen-loading';
import { DocumentUploadDialog } from '@/components/documents/document-upload-dialog';
import { DocumentListPanel } from '@/components/documents/document-list-panel';
import { DocumentPreviewDialog } from '@/components/documents/document-preview-dialog';
import { CreatePublicLinkDialog } from '@/components/documents/create-public-link-dialog';
import { DocumentReplaceDialog } from '@/components/documents/document-replace-dialog';
import { DocumentDepartmentSidebar } from './components/document-department-sidebar';
import { FolderTreePanel } from '@/components/folders/folder-tree-panel';
import { DocumentDetailPanel } from '@/components/documents/document-detail-panel';
import { downloadDocument, getDocumentById, updateSecurityLevel } from '@/lib/documents-api';
import type { Document } from '@/types/document';
import { toast } from 'sonner';
import { PanelLeftOpen } from 'lucide-react';
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
import { ShieldAlert, ShieldOff } from 'lucide-react';

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-based folder state
  const currentFolderId = searchParams.get('folder') || null;

  // ── Sidebar state ──────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFolderTreeOpen, setIsFolderTreeOpen] = useState(true);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  // ── Department filter state ────────────────────
  /** null = Tất cả tài liệu, 'personal' = cá nhân, UUID = phòng ban cụ thể */
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string | null>(null);

  // ── Selected document state (for detail panel) ─
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // ── Upload state ───────────────────────────────
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [folderRefreshTrigger, setFolderRefreshTrigger] = useState(0);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | null>(null);

  // ── Share dialog state ─────────────────────────
  const [shareTarget, setShareTarget] = useState<{
    type: 'folder' | 'document';
    id: string;
    name: string;
  } | null>(null);

  // ── Preview dialog state ───────────────────────
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  // 'preview' = chỉ xem, 'edit' = chỉnh sửa
  const [previewMode, setPreviewMode] = useState<'preview' | 'edit'>('preview');

  // ── Public link dialog state ───────────────────
  const [publicLinkTarget, setPublicLinkTarget] = useState<{
    type: 'folder' | 'document';
    id: string;
    name: string;
    securityLevel?: 'NORMAL' | 'CONFIDENTIAL'; // Phase 62
  } | null>(null);

  // ── Replace file dialog state ──────────────────
  const [replaceDocument, setReplaceDocument] = useState<Document | null>(null);

  // ── Security level confirm dialog state ────────
  const [securityLevelTarget, setSecurityLevelTarget] = useState<Document | null>(null);

  // Navigate to folder helper
  const navigateToFolder = (folderId: string | null) => {
    if (folderId) {
      router.push(`/documents?folder=${folderId}`);
    } else {
      router.push('/documents');
    }
  };

  // Permission guard
  useEffect(() => {
    if (user && !hasPermission('documents:read')) {
      router.replace('/');
    }
  }, [user, hasPermission, router]);

  // Không có quyền → loading (đang redirect)
  if (!hasPermission('documents:read')) {
    return <FullscreenLoading message={t('title')} />;
  }

  // Handle upload success → refresh documents + sidebar badge counts
  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setSidebarRefreshKey((prev) => prev + 1); // Refresh badge counts
    setFolderRefreshTrigger((prev) => prev + 1);
  };

  // Handle "Tải lên tại đây" từ context menu
  const handleUploadAtFolder = (folderId: string) => {
    setUploadTargetFolderId(folderId);
    setIsUploadOpen(true);
  };

  // Handle close upload dialog
  const handleUploadDialogChange = (open: boolean) => {
    setIsUploadOpen(open);
    if (!open) {
      setUploadTargetFolderId(null);
    }
  };

  // Handle share document
  const handleShareDocument = (docId: string, docName: string) => {
    setShareTarget({ type: 'document', id: docId, name: docName });
  };

  // Handle share folder
  const handleShareFolder = (folderId: string, folderName: string) => {
    setShareTarget({ type: 'folder', id: folderId, name: folderName });
  };

  // Handle create public link for document
  const handleCreatePublicLink = (docId: string, docName: string, securityLevel?: 'NORMAL' | 'CONFIDENTIAL') => {
    setPublicLinkTarget({ type: 'document', id: docId, name: docName, securityLevel }); // Phase 62
  };

  // Handle create public link for folder
  const handleCreatePublicLinkFolder = (folderId: string, folderName: string) => {
    setPublicLinkTarget({ type: 'folder', id: folderId, name: folderName });
  };

  // Handle department selection — reset folder navigation
  const handleSelectDepartment = (departmentId: string | null, departmentName?: string) => {
    setSelectedDepartmentId(departmentId);
    setSelectedDepartmentName(departmentName ?? null);
    // Reset folder navigation khi chuyển phòng ban
    router.push('/documents');
    // Clear selected document
    setSelectedDocument(null);
  };

  // Handle đổi cấp độ bảo mật (OWNER only)
  const handleChangeSecurityLevel = (doc: Document) => {
    setSecurityLevelTarget(doc);
  };

  const handleConfirmSecurityLevel = async () => {
    if (!securityLevelTarget) return;
    const doc = securityLevelTarget;
    const newLevel = doc.securityLevel === 'CONFIDENTIAL' ? 'NORMAL' : 'CONFIDENTIAL';
    setSecurityLevelTarget(null);
    try {
      await updateSecurityLevel(doc.id, newLevel);
      toast.success('Đã cập nhật cấp độ bảo mật');
      setRefreshTrigger((prev) => prev + 1);
      if (selectedDocument?.id === doc.id) {
        setSelectedDocument({ ...selectedDocument, securityLevel: newLevel });
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Không thể cập nhật cấp độ bảo mật';
      toast.error(msg);
    }
  };

  // Handle document row click — toggle detail panel
  // Fetch fresh data từ API để tránh stale status (OCR/embedding có thể đã thay đổi)
  const handleSelectDocument = async (doc: Document | null) => {
    // Toggle off nếu click cùng document
    if (selectedDocument?.id === doc?.id) {
      setSelectedDocument(null);
      return;
    }
    if (!doc) {
      setSelectedDocument(null);
      return;
    }
    // Không mở detail panel nếu không có quyền xem
    if (!hasPermission('documents:read')) {
      return;
    }
    // Set ngay doc từ list để UI responsive (không chờ API)
    setSelectedDocument(doc);
    // Fetch fresh data từ API để cập nhật status mới nhất
    try {
      const fresh = await getDocumentById(doc.id);
      setSelectedDocument(fresh);
    } catch {
      // Nếu fetch lỗi, giữ nguyên doc từ list (acceptable fallback)
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-4">
      {/* Main 3-panel card */}
      <div className="flex-1 overflow-hidden flex border rounded-lg bg-background shadow-sm">

        {/* LEFT: Department sidebar */}
        <div
          className={`shrink-0 border-r flex flex-col overflow-hidden transition-all duration-200 ${
            isSidebarOpen ? 'w-52' : 'w-0 border-r-0'
          }`}
        >
          <DocumentDepartmentSidebar
            selectedDepartmentId={selectedDepartmentId}
            onSelectDepartment={handleSelectDepartment}
            refreshKey={sidebarRefreshKey}
          />
        </div>

        {/* LEFT-2: Folder tree panel */}
        {isFolderTreeOpen ? (
          <div className="shrink-0 w-52 border-r flex flex-col overflow-hidden transition-all duration-200">
            <FolderTreePanel
              selectedFolderId={currentFolderId}
              onSelectFolder={navigateToFolder}
              refreshTrigger={refreshTrigger + folderRefreshTrigger}
              departmentId={selectedDepartmentId}
              onUploadAtFolder={handleUploadAtFolder}
              onShare={handleShareFolder}
              onFolderTreeChange={() => {}}
              onToggle={() => setIsFolderTreeOpen(false)}
            />
          </div>
        ) : (
          <div
            className="shrink-0 w-8 border-r flex flex-col items-center py-3 bg-amber-50/40 hover:bg-amber-100/60 cursor-pointer transition-colors"
            onClick={() => setIsFolderTreeOpen(true)}
            title="Hiện cây thư mục"
          >
            <PanelLeftOpen className="h-4 w-4 text-amber-500" />
          </div>
        )}

        {/* CENTER: Document list */}
        <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            <DocumentListPanel
              folderId={currentFolderId}
              departmentId={selectedDepartmentId}
              departmentName={selectedDepartmentName}
              refreshTrigger={refreshTrigger}
              onUploadClick={() => setIsUploadOpen(true)}
              onNavigateToFolder={navigateToFolder}
              onShare={handleShareDocument}
              onShareFolder={handleShareFolder}
              onCreatePublicLink={handleCreatePublicLink}
              onCreatePublicLinkFolder={handleCreatePublicLinkFolder}
              onUploadAtFolder={handleUploadAtFolder}
              onPreview={(doc) => { setPreviewMode('preview'); setPreviewDocument(doc); }}
              onEdit={(doc) => { setPreviewMode('edit'); setPreviewDocument(doc); }}
              onReplaceFile={(doc) => setReplaceDocument(doc)}
              onChangeSecurityLevel={handleChangeSecurityLevel}
              onSelectDocument={handleSelectDocument}
              selectedDocumentId={selectedDocument?.id ?? null}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
            />
          </div>
        </div>

        {/* RIGHT: Detail panel */}
        {selectedDocument && (
          <div className="shrink-0 w-80 border-l overflow-hidden transition-all duration-200">
            <DocumentDetailPanel
              document={selectedDocument}
              onClose={() => setSelectedDocument(null)}
              onPreview={(doc) => { setPreviewMode('preview'); setPreviewDocument(doc); }}
              onEdit={(doc) => { setPreviewMode('edit'); setPreviewDocument(doc); }}
              onShare={(id, name) => setShareTarget({ type: 'document', id, name })}
              onDownload={(id, name) => downloadDocument(id, name)}
              onDocumentUpdate={(updated) => setSelectedDocument(updated)}
              onChangeSecurityLevel={handleChangeSecurityLevel}
            />
          </div>
        )}

      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={isUploadOpen}
        onOpenChange={handleUploadDialogChange}
        onSuccess={handleUploadSuccess}
        targetFolderId={uploadTargetFolderId ?? currentFolderId}
        departmentId={selectedDepartmentId}
        departmentName={selectedDepartmentName}
      />

      {/* Share Dialog — đã gỡ bỏ trong prototype Doanh nghiệp A (chỉ demo mock data) */}

      {/* Preview Dialog */}
      <DocumentPreviewDialog
        open={!!previewDocument}
        onOpenChange={(open) => { if (!open) setPreviewDocument(null); }}
        document={previewDocument}
        mode={previewMode}
        onDocumentUpdate={(updated) => {
          // Cập nhật previewDocument để dialog có data mới nhất
          setPreviewDocument(updated);
          // Cập nhật selectedDocument (detail panel) nếu cùng document — kích hoạt polling
          if (selectedDocument?.id === updated.id) {
            setSelectedDocument(updated);
          }
        }}
      />

      {/* Public Link Dialog */}
      {publicLinkTarget && (
        <CreatePublicLinkDialog
          open={!!publicLinkTarget}
          onOpenChange={(open) => !open && setPublicLinkTarget(null)}
          resourceType={publicLinkTarget.type === 'folder' ? 'FOLDER' : 'DOCUMENT'}
          resourceId={publicLinkTarget.id}
          isConfidential={publicLinkTarget.securityLevel === 'CONFIDENTIAL'}
        />
      )}

      {/* Replace File Dialog */}
      <DocumentReplaceDialog
        open={!!replaceDocument}
        onOpenChange={(open) => { if (!open) setReplaceDocument(null); }}
        document={replaceDocument}
        onSuccess={() => {
          setReplaceDocument(null);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      {/* Security Level Confirm Dialog */}
      {securityLevelTarget && (() => {
        const isConfidential = securityLevelTarget.securityLevel === 'CONFIDENTIAL';
        const toConfidential = !isConfidential;
        return (
          <AlertDialog open={!!securityLevelTarget} onOpenChange={(open) => !open && setSecurityLevelTarget(null)}>
            <AlertDialogContent className="overflow-hidden">
              <div className={`absolute inset-x-0 top-0 h-1 rounded-t-lg bg-gradient-to-r ${toConfidential ? 'from-orange-400 via-orange-500 to-amber-400' : 'from-emerald-400 via-emerald-500 to-teal-400'}`} />
              <AlertDialogHeader className="pt-2">
                <AlertDialogTitle className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${toConfidential ? 'bg-orange-100' : 'bg-emerald-100'}`}>
                    {toConfidential
                      ? <ShieldAlert className="h-4 w-4 text-orange-600" />
                      : <ShieldOff className="h-4 w-4 text-emerald-600" />
                    }
                  </div>
                  {toConfidential ? 'Đánh dấu là Nội bộ' : 'Chuyển về Thường'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {toConfidential
                    ? <>Tài liệu <strong className="text-foreground">{securityLevelTarget.fileName}</strong> sẽ được đánh dấu là <strong className="text-orange-600">Nội bộ</strong>. Liên kết công khai (nếu có) sẽ bị vô hiệu hóa.</>
                    : <>Tài liệu <strong className="text-foreground">{securityLevelTarget.fileName}</strong> sẽ được chuyển về cấp độ <strong className="text-emerald-600">Thường</strong>.</>
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmSecurityLevel}
                  className={toConfidential
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }
                >
                  {toConfidential ? 'Đánh dấu là Nội bộ' : 'Chuyển về Thường'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      })()}
    </div>
  );
}
