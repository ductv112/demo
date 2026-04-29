'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ArrowLeft, FolderPlus, Grid3x3, PanelLeftClose, PanelLeftOpen, Search, Table2, Upload} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
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
import {DragDropProvider, DragOverlay} from '@dnd-kit/react';
import {DocumentListTable} from './document-list-table';
import {DocumentGridView} from './document-grid-view';
import {MoveToFolderDialog} from './move-to-folder-dialog';
import {FolderBreadcrumb} from '@/components/folders/folder-breadcrumb';
import {FolderFormDialog} from '@/components/folders/folder-form-dialog';
import {usePermissions} from '@/hooks/use-permissions';
import type {FolderTreeNode} from '@/types/folder';
import {deleteFolder, getFolderTree} from '@/lib/folders-api';
import {moveDocumentsBulk, uploadDocument} from '@/lib/documents-api';
import {RenameDocumentDialog} from './rename-document-dialog';
import {cn} from '@/lib/utils';
import {Input} from '@/components/ui/input';
import type {Document} from '@/types/document';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentListPanelProps {
  folderId: string | null;
  refreshTrigger: number;
  onUploadClick: () => void;
  onNavigateToFolder: (folderId: string | null) => void;
  onShare?: (docId: string, docName: string) => void;
  onShareFolder?: (folderId: string, folderName: string) => void;
  onCreatePublicLink?: (docId: string, docName: string, securityLevel?: 'NORMAL' | 'CONFIDENTIAL') => void;
  onCreatePublicLinkFolder?: (folderId: string, folderName: string) => void;
  onUploadAtFolder?: (folderId: string) => void;
  onPreview?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onReplaceFile?: (doc: Document) => void;
  onChangeSecurityLevel?: (doc: Document) => void;
  /** Phase 30: filter tài liệu + folders theo phòng ban (UUID | 'personal' | null = tất cả) */
  departmentId?: string | null;
  /** Tên phòng ban đang chọn (hiển thị trong breadcrumb root) */
  departmentName?: string | null;
  /** Phase 30: callback khi click document row → mở detail panel */
  onSelectDocument?: (doc: Document | null) => void;
  /** Phase 30: document đang được chọn (để highlight row) */
  selectedDocumentId?: string | null;
  /** Sidebar toggle: trạng thái sidebar phòng ban */
  isSidebarOpen?: boolean;
  /** Sidebar toggle: callback khi nhấn nút toggle */
  onToggleSidebar?: () => void;
}

type ViewMode = 'table' | 'grid';

/**
 * Tìm parent folder ID từ folder tree.
 * Trả về null nếu target ở root, undefined nếu không tìm thấy.
 */
function findParentFolderId(
  tree: FolderTreeNode[],
  targetId: string,
  parentId: string | null = null
): string | null | undefined {
  for (const node of tree) {
    if (node.id === targetId) return parentId;
    if (node.children.length > 0) {
      const found = findParentFolderId(node.children, targetId, node.id);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/**
 * Panel phải: Document list với header, breadcrumb, upload button, view toggle
 */
export function DocumentListPanel({
  folderId,
  refreshTrigger,
  onUploadClick,
  onNavigateToFolder,
  onShare,
  onShareFolder,
  onCreatePublicLink,
  onCreatePublicLinkFolder,
  onUploadAtFolder,
  onPreview,
  onEdit,
  onReplaceFile,
  onChangeSecurityLevel,
  departmentId,
  departmentName,
  onSelectDocument,
  selectedDocumentId,
  isSidebarOpen,
  onToggleSidebar,
}: DocumentListPanelProps) {
  const t = useTranslations('documents');
  const tFolders = useTranslations('folders');
  const { hasPermission } = usePermissions();

  // Tính rootLabel cho breadcrumb: hiển thị tên phòng ban / cá nhân / tất cả tài liệu
  const rootLabel = departmentId === 'personal'
    ? t('personalDocuments')
    : departmentName
      ? departmentName
      : t('allDocuments');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveDocIds, setMoveDocIds] = useState<string[]>([]);
  const [deleteRefreshTrigger, setDeleteRefreshTrigger] = useState(0);

  // Pagination + Sort state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);

  // Folder tree state
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([]);
  const [folderRefreshCounter, setFolderRefreshCounter] = useState(0);

  // Folder CRUD dialogs
  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [folderFormMode, setFolderFormMode] = useState<'create' | 'rename'>('create');
  const [folderFormTarget, setFolderFormTarget] = useState<FolderTreeNode | null>(null);
  const [parentFolderForCreate, setParentFolderForCreate] = useState<FolderTreeNode | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<FolderTreeNode | null>(null);

  // Rename document state
  const [renameTarget, setRenameTarget] = useState<Document | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  // Drag-drop file upload state
  const [isDragOver, setIsDragOver] = useState(false);

  // Status filter state — Phase 72.1
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Search state — controlled ở header, truyền xuống table/grid
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const dragCounterRef = useRef(0);
  const canUpload = hasPermission('documents:upload');

  // Fetch folder tree — truyền departmentId để filter folders theo phòng ban (Phase 30)
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const deptParam = departmentId !== undefined && departmentId !== null
          ? departmentId
          : undefined;
        const response = await getFolderTree(deptParam);
        setFolderTree(response.data);
      } catch {
        // Silent — breadcrumb/back button vẫn hoạt động với tree cũ
      }
    };
    fetchTree();
  }, [refreshTrigger, folderRefreshCounter, departmentId]);

  // Reset page + sort khi folder hoặc departmentId thay đổi
  useEffect(() => {
    setPage(1);
    setSortBy(undefined);
    setSortOrder(undefined);
  }, [folderId, departmentId]);

  // Sort handler
  const handleSort = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    if (newSortBy === '') {
      // Clear sort
      setSortBy(undefined);
      setSortOrder(undefined);
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    }
    setPage(1); // Reset về trang 1 khi sort thay đổi
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset về trang 1 khi limit thay đổi
  };

  // Handle move to folder dialog
  const handleMoveToFolder = (docIds: string[]) => {
    setMoveDocIds(docIds);
    setMoveDialogOpen(true);
  };

  // Handle delete success callback — nhận ID tài liệu vừa xóa để đóng detail panel nếu đang mở
  const handleDeleteSuccess = (deletedDocId: string) => {
    setDeleteRefreshTrigger((prev) => prev + 1);
    // Nếu tài liệu đang được chọn trong detail panel vừa bị xóa → đóng panel
    if (onSelectDocument && selectedDocumentId === deletedDocId) {
      onSelectDocument(null);
    }
  };

  // Handle rename document
  const handleRename = (doc: Document) => {
    setRenameTarget(doc);
    setRenameDialogOpen(true);
  };

  // Handle create new folder (from header button)
  const handleCreateFolder = () => {
    setFolderFormMode('create');
    // Find current folder in tree for parent
    const findFolderNode = (nodes: FolderTreeNode[], id: string): FolderTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = findFolderNode(node.children, id);
        if (found) return found;
      }
      return null;
    };
    const parentNode = folderId ? findFolderNode(folderTree, folderId) : null;
    setParentFolderForCreate(parentNode);
    setFolderFormTarget(null);
    setFolderFormOpen(true);
  };

  // Handle folder actions from context menu
  const handleFolderAction = (action: string, folder: FolderTreeNode) => {
    switch (action) {
      case 'create-subfolder':
        setFolderFormMode('create');
        setParentFolderForCreate(folder);
        setFolderFormTarget(null);
        setFolderFormOpen(true);
        break;
      case 'rename':
        setFolderFormMode('rename');
        setFolderFormTarget(folder);
        setParentFolderForCreate(null);
        setFolderFormOpen(true);
        break;
      case 'delete':
        setDeleteFolderTarget(folder);
        break;
      case 'share':
        if (onShareFolder) {
          onShareFolder(folder.id, folder.name);
        }
        break;
      case 'upload':
        if (onUploadAtFolder) {
          onUploadAtFolder(folder.id);
        }
        break;
      case 'create-public-link':
        if (onCreatePublicLinkFolder) {
          onCreatePublicLinkFolder(folder.id, folder.name);
        }
        break;
    }
  };

  // Confirm delete folder
  const handleConfirmDeleteFolder = async () => {
    if (!deleteFolderTarget) return;

    try {
      await deleteFolder(deleteFolderTarget.id);
      toast.success(tFolders('toast.deleted', { name: deleteFolderTarget.name }));
      setFolderRefreshCounter((prev) => prev + 1);   // refresh breadcrumb
      setDeleteRefreshTrigger((prev) => prev + 1);   // refresh table/grid
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || tFolders('toast.deleteError');
      toast.error(msg);
    } finally {
      setDeleteFolderTarget(null);
    }
  };

  // Handle folder CRUD success
  const handleFolderFormSuccess = () => {
    setFolderRefreshCounter((prev) => prev + 1);   // refresh folder tree (sidebar/breadcrumb)
    setDeleteRefreshTrigger((prev) => prev + 1);   // refresh document list (table/grid) để hiện folder mới
  };

  // Handle DnD drop event
  const handleDragEnd = async (event: any) => {
    // Check both spellings
    if (event.canceled || event.cancelled) {
      return;
    }

    const source = event.operation?.source;
    const target = event.operation?.target;

    if (!source || !target) {
      return;
    }

    const docIds: string[] = source.data?.documentIds || [source.id];
    const targetFolderId: string | null = target.id === '__root__' ? null : target.id;

    // Tìm tên folder đích
    const findFolderName = (tree: FolderTreeNode[], id: string): string => {
      for (const node of tree) {
        if (node.id === id) return node.name;
        const found = findFolderName(node.children, id);
        if (found) return found;
      }
      return 'Thư mục';
    };
          const folderName = targetFolderId
          ? findFolderName(folderTree, targetFolderId)
          : t('allDocuments');

    try {
      const result = await moveDocumentsBulk(docIds, targetFolderId);
      const movedCount = result.data.movedCount;
      const previousFolders = result.data.previousFolders;

      // Refresh
      setFolderRefreshCounter((prev) => prev + 1);
      setDeleteRefreshTrigger((prev) => prev + 1);

      // Undo toast
      toast.success(t('toast.moved', { count: movedCount, folder: folderName }), {
        action: {
          label: t('movedUndo'),
          onClick: async () => {
            try {
              const undoPromises = Object.entries(previousFolders).map(
                ([docId, oldFolderId]) => moveDocumentsBulk([docId], oldFolderId as string | null)
              );
              await Promise.all(undoPromises);
              setFolderRefreshCounter((prev) => prev + 1);
              setDeleteRefreshTrigger((prev) => prev + 1);
              toast.success(t('undone'));
            } catch {
              toast.error(t('undoFailed'));
            }
          },
        },
        duration: 5000,
      });
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Di chuyển tài liệu thất bại';
      toast.error(msg);
    }
  };

  // Native file drag-drop handlers (OS → browser)
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Chỉ handle file drag từ OS, KHÔNG handle @dnd-kit internal drag
    if (!e.dataTransfer.types.includes('Files') || !canUpload) return;
    dragCounterRef.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Cần thiết để cho phép drop
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    if (!canUpload) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Validate files (Max 50MB)
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    const validFiles: File[] = [];
    const errors: string[] = [];

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        errors.push(`"${file.name}" vượt quá 50MB`);
      } else if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
        errors.push(`"${file.name}" — loại file không được hỗ trợ`);
      } else {
        validFiles.push(file);
      }
    }

    // Show errors
    if (errors.length > 0) {
      toast.error(`Không thể tải lên ${errors.length} file`, {
        description: errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n...và ${errors.length - 3} file khác` : ''),
      });
    }

    // Upload valid files
    if (validFiles.length === 0) return;

    // Upload sequentially (tránh overwhelm server)
    let successCount = 0;
    for (const file of validFiles) {
      try {
          // 'personal' là sentinel value cho sidebar filter, không phải departmentId thực
          const actualDeptId = departmentId === 'personal' ? undefined : departmentId;
          await uploadDocument(file, undefined, undefined, folderId || undefined, undefined, actualDeptId);
        successCount++;
      } catch (err: any) {
        toast.error(`Lỗi tải "${file.name}"`, {
          description: err?.response?.data?.error?.message || 'Đã xảy ra lỗi',
        });
      }
    }

    if (successCount > 0) {
      toast.success(t('toast.uploaded'));
      // Trigger refresh
      setFolderRefreshCounter((prev) => prev + 1);
      setDeleteRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div
        className={cn("flex flex-col h-full relative", isDragOver && "bg-primary/5")}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0 bg-muted/30 h-[52px]">
          {/* Sidebar toggle button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1 rounded-md text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 mr-2"
              title={isSidebarOpen ? tFolders('hideSidebar') : tFolders('showSidebar')}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          )}

          {/* Nút quay lại thư mục cha */}
          {folderId && (
            <button
              onClick={() => {
                const parentId = findParentFolderId(folderTree, folderId);
                onNavigateToFolder(parentId === undefined ? null : parentId);
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 mr-1"
              title="Quay lại thư mục cha"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <FolderBreadcrumb
            folderTree={folderTree}
            selectedFolderId={folderId}
            onNavigateToFolder={onNavigateToFolder}
            rootLabel={rootLabel}
          />

          {/* Spacer */}
          <div className="flex-1" />

          <div className="flex items-center gap-2 shrink-0">
            {/* Search input */}
            <div className="relative w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t('searchByTitle')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                className="pl-8 h-8 text-sm"
              />
            </div>
            {/* Status filter — Phase 72.1 */}
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            >
              <SelectTrigger className="w-[160px] h-8 text-sm" data-testid="status-filter-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('status.filterAll')}</SelectItem>
                <SelectItem value="ACTIVE">{t('status.filterActive')}</SelectItem>
                <SelectItem value="INACTIVE">{t('status.filterInactive')}</SelectItem>
              </SelectContent>
            </Select>
            {/* View mode toggle */}
            <div className="flex items-center gap-1 border border-slate-200 rounded-md p-1 bg-slate-50">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 transition-all',
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                    : 'text-muted-foreground hover:text-indigo-600'
                )}
                onClick={() => setViewMode('table')}
                title={t('tableMode')}
              >
                <Table2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 transition-all',
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                    : 'text-muted-foreground hover:text-indigo-600'
                )}
                onClick={() => setViewMode('grid')}
                title={t('gridMode')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>

            {/* New folder button */}
            {hasPermission('folders:create') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCreateFolder}
                className="h-8 border border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 bg-amber-50/60 font-medium"
              >
                <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
                {tFolders('newFolder')}
              </Button>
            )}

            {/* Upload button */}
            {hasPermission('documents:upload') && (
              <Button
                size="sm"
                onClick={onUploadClick}
                className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {t('upload')}
              </Button>
            )}
          </div>
        </div>

        {/* Document list — flex flex-col để DocumentListTable có thể dùng flex-1 */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Documents list/grid */}
          {viewMode === 'table' ? (
            <DocumentListTable
              folderId={folderId}
              refreshTrigger={refreshTrigger + deleteRefreshTrigger}
              onMoveToFolder={handleMoveToFolder}
              onShare={onShare}
              onCreatePublicLink={onCreatePublicLink}
              onDelete={handleDeleteSuccess}
              onNavigateToFolder={onNavigateToFolder}
              onPreview={onPreview}
              onEdit={onEdit}
              onReplaceFile={onReplaceFile}
              onChangeSecurityLevel={onChangeSecurityLevel}
              onRename={handleRename}
              onFolderAction={handleFolderAction}
              page={page}
              limit={limit}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onSort={handleSort}
              departmentId={departmentId}
              onSelectDocument={onSelectDocument}
              selectedDocumentId={selectedDocumentId}
              externalSearch={debouncedSearch}
              statusFilter={statusFilter === 'ALL' ? undefined : statusFilter}
            />
          ) : (
            <DocumentGridView
              folderId={folderId}
              refreshTrigger={refreshTrigger + deleteRefreshTrigger}
              onMoveToFolder={handleMoveToFolder}
              onShare={onShare}
              onCreatePublicLink={onCreatePublicLink}
              onDelete={handleDeleteSuccess}
              onNavigateToFolder={onNavigateToFolder}
              onPreview={onPreview}
              onEdit={onEdit}
              onReplaceFile={onReplaceFile}
              onChangeSecurityLevel={onChangeSecurityLevel}
              onRename={handleRename}
              onFolderAction={handleFolderAction}
              page={page}
              limit={limit}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onSort={handleSort}
              departmentId={departmentId}
              onSelectDocument={onSelectDocument}
              selectedDocumentId={selectedDocumentId}
              externalSearch={debouncedSearch}
              statusFilter={statusFilter === 'ALL' ? undefined : statusFilter}
            />
          )}
        </div>

        {/* Move to Folder Dialog */}
        <MoveToFolderDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          documentIds={moveDocIds}
          onSuccess={() => {
            // Refresh không cần gọi ở đây vì MoveToFolderDialog đã gọi toast
          }}
        />

        {/* Folder Form Dialog (Create/Rename) */}
        <FolderFormDialog
          open={folderFormOpen}
          onOpenChange={setFolderFormOpen}
          mode={folderFormMode}
          folder={folderFormTarget}
          parentFolder={parentFolderForCreate}
          onSuccess={handleFolderFormSuccess}
          departmentId={departmentId}
        />

        {/* Rename Document Dialog */}
        <RenameDocumentDialog
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          document={renameTarget}
          onSuccess={() => setDeleteRefreshTrigger((prev) => prev + 1)}
        />

        {/* Delete Folder AlertDialog */}
        <AlertDialog
          open={!!deleteFolderTarget}
          onOpenChange={(open) => !open && setDeleteFolderTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
          <AlertDialogTitle>{tFolders('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              {tFolders('delete.message', {
                name: (deleteFolderTarget?.name ?? '').length > 30
                  ? (deleteFolderTarget?.name ?? '').slice(0, 30) + '…'
                  : (deleteFolderTarget?.name ?? ''),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tFolders('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteFolder} className="bg-destructive hover:bg-destructive/90">
              {tFolders('delete.confirm')}
            </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Drop Zone Overlay */}
        {isDragOver && canUpload && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary rounded-lg pointer-events-none">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto text-primary mb-2" />
              <p className="text-lg font-medium text-primary">{t('dragDropUpload')}</p>
              <p className="text-sm text-muted-foreground">
                {folderId ? t('dragDropCurrentFolder') : t('dragDropRootFolder')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DragOverlay */}
      <DragOverlay>
        <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow-lg text-sm font-medium opacity-90">
          <span>📄</span>
          <span>{t('movingDocument')}</span>
        </div>
      </DragOverlay>
    </DragDropProvider>
  );
}
