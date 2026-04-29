'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { downloadDocument, deleteDocument } from '@/lib/documents-api';
import { listFolderChildren } from '@/lib/folders-api';
import { type Document, isPreviewable as checkPreviewable, isEditable as checkEditable } from '@/types/document';
import type { FolderChildItem, FolderChildFolderItem, FolderChildDocumentItem, FolderTreeNode } from '@/types/folder';
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
import {
  File,
  Download,
  Search,
  Folder,
  FolderPlus,
  MoreVertical,
  Pencil,
  Share2,
  Link,
  Upload,
  Trash2,
  Eye,
  Type,
  ShieldAlert,
  FolderInput,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDraggable, useDroppable } from '@dnd-kit/react';
import { DocumentContextMenu } from './document-context-menu';
import { FolderContextMenu } from '@/components/folders/folder-context-menu';
import { DataPagination } from '@/components/ui/data-pagination';
import { usePermissions } from '@/hooks/use-permissions';
import { FileTypeIcon } from '@/lib/file-icon';

/**
 * Helper: Convert FolderChildFolderItem → FolderTreeNode để tương thích với FolderContextMenu
 */
function folderItemToTreeNode(item: FolderChildFolderItem): FolderTreeNode {
  return {
    ...item,
    children: [],
    departmentId: null,
  } as unknown as FolderTreeNode;
}

/**
 * Helper: Format file size human-readable
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Droppable folder card — nhận drag từ document cards
 * Wrap với FolderContextMenu để hỗ trợ right-click actions
 */
function DroppableFolderCard({
  folder,
  onDoubleClick,
  onAction,
  permissionLevel,
}: {
  folder: FolderTreeNode;
  onDoubleClick: () => void;
  onAction: (action: string, folder: FolderTreeNode) => void;
  permissionLevel?: 'VIEWER' | 'EDITOR' | 'OWNER';
}) {
  const tFolders = useTranslations('folders');
  const { ref, isDropTarget } = useDroppable({
    id: folder.id,
    data: { type: 'folder', folderId: folder.id },
  });
  const { hasPermission } = usePermissions();
  const canCreateFolder = hasPermission('folders:create');
  const canUpdateFolder = hasPermission('folders:update');
  const canDeleteFolder = hasPermission('folders:delete');
  const canUploadDoc = hasPermission('documents:upload');

  // ACL ownership — sharing chỉ dành cho OWNER (giống DocumentContextMenu)
  const isOwnerLevel = permissionLevel === 'OWNER';

  return (
    <FolderContextMenu folder={folder} onAction={onAction} permissionLevel={permissionLevel}>
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center gap-2 p-4 rounded-lg border border-amber-200/60 bg-amber-50/30 hover:bg-amber-50/70 cursor-pointer transition-colors relative group',
          isDropTarget && 'ring-2 ring-primary bg-primary/10'
        )}
        onDoubleClick={onDoubleClick}
      >
        {/* Dot menu */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Thao tác">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canCreateFolder && (
                <DropdownMenuItem onClick={() => onAction('create-subfolder', folder)}>
                  <FolderPlus className="mr-2 h-4 w-4 text-indigo-500" />
                  {tFolders('contextMenu.newFolder')}
                </DropdownMenuItem>
              )}
              {canUpdateFolder && (
                <DropdownMenuItem onClick={() => onAction('rename', folder)}>
                  <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                  {tFolders('contextMenu.rename')}
                </DropdownMenuItem>
              )}
              {isOwnerLevel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction('share', folder)}>
                    <Share2 className="mr-2 h-4 w-4 text-sky-500" />
                    {tFolders('contextMenu.share')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction('create-public-link', folder)}>
                    <Link className="mr-2 h-4 w-4 text-cyan-600" />
                    {tFolders('contextMenu.createPublicLink')}
                  </DropdownMenuItem>
                </>
              )}
              {canUploadDoc && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction('upload', folder)}>
                    <Upload className="mr-2 h-4 w-4 text-violet-500" />
                    {tFolders('contextMenu.uploadHere')}
                  </DropdownMenuItem>
                </>
              )}
              {canDeleteFolder && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onAction('delete', folder)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {tFolders('contextMenu.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Folder className="h-12 w-12 text-amber-500" />
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm font-medium text-center truncate w-full">{folder.name}</p>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs break-words">
            {folder.name}
          </TooltipContent>
        </Tooltip>
        <p className="text-xs text-muted-foreground">{folder.documentCount}</p>
      </div>
    </FolderContextMenu>
  );
}

/**
 * Draggable grid card component
 */
function DraggableGridCard({
  doc,
  onDownload,
  downloadingId,
  onMoveToFolder,
  onShare,
  onCreatePublicLink,
  onRequestDelete,
  onPreview,
  onEdit,
  onReplaceFile,
  onSelectDocument,
  onChangeSecurityLevel,
  onRename,
  isSelected,
}: {
  doc: Document;
  onDownload: (doc: Document) => void;
  downloadingId: string | null;
  onMoveToFolder?: (docIds: string[]) => void;
  onShare?: (docId: string, docName: string) => void;
  onCreatePublicLink?: (docId: string, docName: string, securityLevel?: 'NORMAL' | 'CONFIDENTIAL') => void;
  onRequestDelete?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onReplaceFile?: (doc: Document) => void;
  onSelectDocument?: (doc: Document | null) => void;
  onChangeSecurityLevel?: (doc: Document) => void;
  onRename?: (doc: Document) => void;
  isSelected?: boolean;
}) {
  const t = useTranslations('documents');
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('documents:read');
  const canDownload = hasPermission('documents:download');
  const canUpdate = hasPermission('documents:update');
  const canDelete = hasPermission('documents:delete');
  const canViewConfidential = hasPermission('documents:view_confidential');

  // ACL resource-level permission
  const permLevel = doc.permissionLevel ?? 'VIEWER';
  const isEditorOrAbove = permLevel === 'EDITOR' || permLevel === 'OWNER';
  const isOwnerLevel = permLevel === 'OWNER';

  // Confidential blocking
  const isConfidentialBlocked = doc.securityLevel === 'CONFIDENTIAL' && !canViewConfidential;

  // Editable check
  const isEditableFile = checkEditable(doc.mimeType);

  const { ref, isDragSource } = useDraggable({
    id: doc.id,
    data: {
      type: 'document',
      documentIds: [doc.id],
    },
  });

  const handleContextAction = (action: string) => {
    if (action === 'preview') {
      onPreview?.(doc);
    } else if (action === 'edit') {
      onEdit?.(doc);
    } else if (action === 'replace-file') {
      onReplaceFile?.(doc);
    } else if (action === 'download') {
      onDownload(doc);
    } else if (action === 'share') {
      onShare?.(doc.id, doc.fileName);
    } else if (action === 'create-public-link') {
      onCreatePublicLink?.(doc.id, doc.fileName, doc.securityLevel);
    } else if (action === 'move-to') {
      onMoveToFolder?.([doc.id]);
    } else if (action === 'change-security-level') {
      onChangeSecurityLevel?.(doc);
    } else if (action === 'rename') {
      onRename?.(doc);
    } else if (action === 'delete') {
      onRequestDelete?.(doc);
    }
  };

  const isPreviewable = checkPreviewable(doc.mimeType);

  const handleDoubleClick = () => {
    if (canRead && isPreviewable && onPreview) {
      onPreview(doc);
    }
  };

  return (
    <DocumentContextMenu docIds={[doc.id]} onAction={handleContextAction} mimeType={doc.mimeType} documents={[doc]} permissionLevel={doc.permissionLevel}>
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center p-4 rounded-lg border cursor-grab active:cursor-grabbing',
          'hover:bg-blue-50/50 transition-colors group relative',
          isDragSource && 'opacity-50',
          isSelected && 'bg-blue-50 ring-2 ring-primary'
        )}
        onClick={() => onSelectDocument?.(doc)}
        onDoubleClick={handleDoubleClick}
      >
        <FileTypeIcon mimeType={doc.mimeType} fileName={doc.fileName} className="h-16 w-16 mb-3" />
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm font-medium text-center line-clamp-2 max-w-full">
              {doc.title}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs break-words">
            {doc.title}
          </TooltipContent>
        </Tooltip>
        <span className="text-xs text-muted-foreground mt-1">
          {formatFileSize(doc.fileSize)}
        </span>
        <span
          className="text-xs text-muted-foreground/70 mt-0.5 truncate max-w-full"
          title={`${doc.uploader.fullName} (${doc.uploader.username}) — ${doc.uploader.email}`}
        >
          {doc.uploader.fullName}
        </span>
        {canDownload && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(doc);
            }}
            disabled={downloadingId === doc.id}
            title={`Tải về: ${doc.fileName}`}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
        {/* Action menu — mirror DocumentContextMenu */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Thao tác">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Preview */}
              {canRead && isPreviewable && !isConfidentialBlocked && (
                <DropdownMenuItem onClick={() => handleContextAction('preview')}>
                  <Eye className="mr-2 h-4 w-4 text-blue-500" />
                  {t('contextMenu.preview')}
                </DropdownMenuItem>
              )}
              {/* Edit */}
              {isEditableFile && canUpdate && isEditorOrAbove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleContextAction('edit')}>
                    <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                    {t('contextMenu.edit')}
                  </DropdownMenuItem>
                </>
              )}
              {/* Replace file */}
              {canUpdate && isEditorOrAbove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleContextAction('replace-file')}>
                    <Upload className="mr-2 h-4 w-4 text-violet-500" />
                    {t('contextMenu.replaceFile')}
                  </DropdownMenuItem>
                </>
              )}
              {/* Rename */}
              {canUpdate && isEditorOrAbove && (
                <DropdownMenuItem onClick={() => handleContextAction('rename')}>
                  <Type className="mr-2 h-4 w-4 text-blue-600" />
                  {t('contextMenu.rename')}
                </DropdownMenuItem>
              )}
              {/* Download */}
              {canDownload && !isConfidentialBlocked && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleContextAction('download')}>
                    <Download className="mr-2 h-4 w-4 text-emerald-500" />
                    {t('contextMenu.download')}
                  </DropdownMenuItem>
                </>
              )}
              {/* Share + Public Link — OWNER only */}
              {canUpdate && isOwnerLevel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleContextAction('share')}>
                    <Share2 className="mr-2 h-4 w-4 text-sky-500" />
                    {t('contextMenu.share')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={doc.securityLevel === 'CONFIDENTIAL'}
                    onClick={() => doc.securityLevel !== 'CONFIDENTIAL' && handleContextAction('create-public-link')}
                    title={doc.securityLevel === 'CONFIDENTIAL' ? 'Tài liệu mật không hỗ trợ chia sẻ công khai' : undefined}
                  >
                    <Link className="mr-2 h-4 w-4 text-cyan-600" />
                    {t('contextMenu.createPublicLink')}
                  </DropdownMenuItem>
                </>
              )}
              {/* Change security level — OWNER only */}
              {canUpdate && isOwnerLevel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleContextAction('change-security-level')}>
                    <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" />
                    {doc.securityLevel === 'CONFIDENTIAL'
                      ? t('contextMenu.setNormal')
                      : t('contextMenu.setConfidential')}
                  </DropdownMenuItem>
                </>
              )}
              {/* Move to — EDITOR+ */}
              {canUpdate && isEditorOrAbove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleContextAction('move-to')}>
                    <FolderInput className="mr-2 h-4 w-4 text-amber-600" />
                    {t('contextMenu.moveTo')}
                  </DropdownMenuItem>
                </>
              )}
              {/* Delete — OWNER only */}
              {canDelete && isOwnerLevel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleContextAction('delete')}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('contextMenu.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </DocumentContextMenu>
  );
}

interface DocumentGridViewProps {
  folderId?: string | null;
  refreshTrigger?: number;
  onMoveToFolder?: (docIds: string[]) => void;
  onShare?: (docId: string, docName: string) => void;
  onCreatePublicLink?: (docId: string, docName: string, securityLevel?: 'NORMAL' | 'CONFIDENTIAL') => void;
  onDelete?: (deletedDocId: string) => void;
  onNavigateToFolder?: (folderId: string | null) => void;
  onPreview?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onReplaceFile?: (doc: Document) => void;
  onChangeSecurityLevel?: (doc: Document) => void;
  onRename?: (doc: Document) => void;
  onFolderAction?: (action: string, folder: FolderTreeNode) => void;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  /** Phase 30: filter theo phòng ban */
  departmentId?: string | null;
  /** Callback khi click document card → detail panel */
  onSelectDocument?: (doc: Document | null) => void;
  /** ID document đang selected để highlight */
  selectedDocumentId?: string | null;
  /** Search query từ header (controlled) */
  externalSearch?: string;
  /** Phase 72.1: filter theo trạng thái kích hoạt (undefined = tất cả) */
  statusFilter?: 'ACTIVE' | 'INACTIVE';
}

/**
 * Grid view component: 4 cols lg, 3 md, 2 sm
 * Tự fetch unified data từ /folders/children endpoint
 */
export function DocumentGridView({
  folderId,
  refreshTrigger,
  onMoveToFolder,
  onShare,
  onCreatePublicLink,
  onDelete,
  onNavigateToFolder,
  onPreview,
  onEdit,
  onReplaceFile,
  onChangeSecurityLevel,
  onRename,
  onFolderAction,
  page,
  limit,
  sortBy,
  sortOrder,
  onPageChange,
  onLimitChange,
  onSort,
  departmentId,
  onSelectDocument,
  selectedDocumentId,
  externalSearch,
  statusFilter,
}: DocumentGridViewProps) {
  const t = useTranslations('documents');

  // Unified items state
  const [items, setItems] = useState<FolderChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [internalSearch, setInternalSearch] = useState('');
  const searchQuery = externalSearch !== undefined ? externalSearch : internalSearch;
  const setSearchQuery = externalSearch !== undefined ? () => {} : setInternalSearch;
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Unified fetch từ /folders/children endpoint
  // Không chặn bằng canListFolders — backend ACL tự filter theo resource_permissions.
  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      try {
        const response = await listFolderChildren({
          parentId: folderId,
          departmentId: departmentId ?? undefined,
          search: debouncedSearch || undefined,
          page,
          limit,
          sortBy,
          sortOrder,
          status: statusFilter,
        });
        setItems(response.data);
        setTotal(response.meta.total);
        setTotalPages(response.meta.totalPages);
      } catch (error: any) {
        if (error?.response?.status !== 403) {
          const msg = error?.response?.data?.error?.message || 'Không thể tải danh sách';
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [page, limit, folderId, refreshTrigger, debouncedSearch, sortBy, sortOrder, departmentId, statusFilter]);

  // Split items cho rendering
  const folderItems = items.filter((item): item is FolderChildFolderItem => item.type === 'FOLDER');
  const documentItems = items.filter((item): item is FolderChildDocumentItem => item.type === 'DOCUMENT');

  // Handle download
  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      await downloadDocument(doc.id, doc.fileName);
      toast.success(t('toast.downloaded', { name: doc.fileName }));
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Tải về thất bại';
      toast.error(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTarget.id);
      toast.success(t('toast.deleted', { name: deleteTarget.title }));
      const deletedId = deleteTarget.id;
      setDeleteTarget(null);
      onDelete?.(deletedId);
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Xóa tài liệu thất bại';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Sort dropdown handler
  const handleSortChange = (value: string) => {
    if (value === 'default') {
      onSort('', 'asc');
    } else {
      const [sortByValue, sortOrderValue] = value.split('-') as [string, 'asc' | 'desc'];
      onSort(sortByValue, sortOrderValue);
    }
  };

  const getCurrentSortValue = () => {
    if (!sortBy || !sortOrder) return 'default';
    return `${sortBy}-${sortOrder}`;
  };

  const isEmpty = folderItems.length === 0 && documentItems.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Filter bar — ẩn search nếu externalSearch đã được cung cấp từ header */}
      <div className="flex items-center gap-4 flex-wrap shrink-0">
        {externalSearch === undefined && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchByTitle')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('sortBy')}</span>
          <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t('sortDefault')}</SelectItem>
              <SelectItem value="createdAt-desc">{t('sortNewest')}</SelectItem>
              <SelectItem value="createdAt-asc">{t('sortOldest')}</SelectItem>
              <SelectItem value="name-asc">{t('sortNameAsc')}</SelectItem>
              <SelectItem value="name-desc">{t('sortNameDesc')}</SelectItem>
              <SelectItem value="fileSize-desc">{t('sortSizeLarge')}</SelectItem>
              <SelectItem value="fileSize-asc">{t('sortSizeSmall')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid — flex-1 + overflow-auto để scroll bên trong */}
      <div className="flex-1 overflow-auto min-h-0">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('empty')}</p>
            <p className="text-sm mt-2">{t('emptyDrop')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Folder cards — trước documents */}
            {folderItems.map((folderItem) => (
              <DroppableFolderCard
                key={`folder-${folderItem.id}`}
                folder={folderItemToTreeNode(folderItem)}
                onDoubleClick={() => onNavigateToFolder?.(folderItem.id)}
                onAction={onFolderAction ?? (() => {})}
                permissionLevel={folderItem.permissionLevel}
              />
            ))}
            {/* Document cards */}
            {documentItems.map((docItem) => (
              <DraggableGridCard
                key={docItem.id}
                doc={docItem as unknown as Document}
                onDownload={handleDownload}
                downloadingId={downloadingId}
                onMoveToFolder={onMoveToFolder}
                onShare={onShare}
                onCreatePublicLink={onCreatePublicLink}
                onRequestDelete={(doc) => setDeleteTarget(doc)}
                onPreview={onPreview}
                onEdit={onEdit}
                onReplaceFile={onReplaceFile}
                onChangeSecurityLevel={onChangeSecurityLevel}
                onRename={onRename}
                onSelectDocument={onSelectDocument}
                isSelected={selectedDocumentId === docItem.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination — shrink-0 để không bị đẩy ra ngoài viewport */}
      {!loading && total > 0 && (
        <div className="px-4 py-3 border-t shrink-0">
          <DataPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            showing={items.length}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            label={t('paginationLabel')}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.message', { name: deleteTarget?.title ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t('delete.deleting') : t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
