'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { downloadDocument, deleteDocument, activateDocument, deactivateDocument } from '@/lib/documents-api';
import { DocumentDeactivateConfirmDialog } from './document-deactivate-confirm-dialog';
import { listFolderChildren } from '@/lib/folders-api';
import { type Document, isPreviewable as checkPreviewable, isEditable as checkEditable } from '@/types/document';
import type { FolderChildItem, FolderChildFolderItem, FolderChildDocumentItem, FolderTreeNode } from '@/types/folder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
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
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Download,
  FileText,
  Search,
  MoreVertical,
  Share2,
  FolderInput,
  Trash2,
  Folder,
  FolderPlus,
  Eye,
  Pencil,
  Link,
  Upload,
  ShieldAlert,
  Lock,
  Type,
  Power,
  PowerOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDraggable, useDroppable } from '@dnd-kit/react';
import { DocumentContextMenu } from './document-context-menu';
import { FolderContextMenu } from '@/components/folders/folder-context-menu';
import { DataPagination } from '@/components/ui/data-pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import { usePermissions } from '@/hooks/use-permissions';
import { FileTypeIcon } from '@/lib/file-icon';

interface DocumentListTableProps {
  refreshTrigger?: number;
  folderId?: string | null;
  onMoveToFolder?: (docIds: string[]) => void;
  onShare?: (docId: string, docName: string) => void;
  onCreatePublicLink?: (docId: string, docName: string, securityLevel?: 'NORMAL' | 'CONFIDENTIAL') => void;
  onDelete?: (deletedDocId: string) => void;
  onNavigateToFolder?: (folderId: string | null) => void;
  onPreview?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onReplaceFile?: (doc: Document) => void;
  onCompare?: (doc: Document) => void;
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
  /** Phase 30: callback khi click row → detail panel */
  onSelectDocument?: (doc: Document | null) => void;
  /** Phase 30: ID document đang selected để highlight */
  selectedDocumentId?: string | null;
  /** Search query từ header (controlled) — nếu có thì bỏ qua internal search state */
  externalSearch?: string;
  /** Phase 72.1: filter theo trạng thái kích hoạt (undefined = tất cả) */
  statusFilter?: 'ACTIVE' | 'INACTIVE';
}

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
 * Helper: Format date sang tiếng Việt
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Droppable folder row — nhận drag từ document rows
 * Wrap với FolderContextMenu để hỗ trợ right-click actions
 */
function DroppableFolderRow({
  folder,
  onDoubleClick,
  onAction,
  compact,
}: {
  folder: FolderChildFolderItem;
  onDoubleClick: () => void;
  onAction: (action: string, folder: FolderTreeNode) => void;
  compact?: boolean;
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
  const isOwnerLevel = folder.permissionLevel === 'OWNER';

  const treeNode = folderItemToTreeNode(folder);

  return (
    <FolderContextMenu folder={treeNode} onAction={onAction} permissionLevel={folder.permissionLevel}>
      <TableRow
        ref={ref}
        className={cn(
          'cursor-pointer bg-amber-50/30 hover:bg-amber-50/70 border-l-2 border-l-amber-200/60',
          isDropTarget && 'ring-2 ring-primary bg-primary/10'
        )}
        onDoubleClick={onDoubleClick}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2 min-w-0">
            <Folder className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[220px]">{folder.name}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs break-words">
                {folder.name}
              </TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {folder.documentCount > 0 ? `${folder.documentCount} tài liệu` : 'Thư mục'}
        </TableCell>
        <TableCell className={cn('hidden lg:table-cell text-muted-foreground', compact && 'xl:hidden')}>
          {folder.createdByUser?.fullName ?? '—'}
        </TableCell>
        <TableCell className="hidden lg:table-cell text-muted-foreground">
          {formatDate(folder.createdAt)}
        </TableCell>
        <TableCell className={cn('hidden md:table-cell text-center', compact && 'xl:hidden')}>
          <span className="text-muted-foreground text-xs">—</span>
        </TableCell>
        <TableCell className={cn('hidden md:table-cell text-center', compact && 'xl:hidden')}>
          <span className="text-muted-foreground text-xs">—</span>
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Thao tác" data-testid="action-menu-trigger">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canCreateFolder && (
                <DropdownMenuItem onClick={() => onAction('create-subfolder', treeNode)}>
                  <FolderPlus className="mr-2 h-4 w-4 text-indigo-500" />
                  {tFolders('contextMenu.newFolder')}
                </DropdownMenuItem>
              )}
              {canUpdateFolder && folder.permissionLevel !== 'VIEWER' && (
                <DropdownMenuItem onClick={() => onAction('rename', treeNode)}>
                  <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                  {tFolders('contextMenu.rename')}
                </DropdownMenuItem>
              )}
              {isOwnerLevel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction('share', treeNode)}>
                    <Share2 className="mr-2 h-4 w-4 text-sky-500" />
                    {tFolders('contextMenu.share')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction('create-public-link', treeNode)}>
                    <Link className="mr-2 h-4 w-4 text-cyan-600" />
                    {tFolders('contextMenu.createPublicLink')}
                  </DropdownMenuItem>
                </>
              )}
              {canUploadDoc && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction('upload', treeNode)}>
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
                    onClick={() => onAction('delete', treeNode)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {tFolders('contextMenu.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </FolderContextMenu>
  );
}

/**
 * Draggable document row — mỗi row có thể drag vào folder
 */
function DraggableDocumentRow({
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
  onCompare,
  onChangeSecurityLevel,
  onRename,
  onRequestStatusChange,
  isSelected,
  compact,
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
  onCompare?: (doc: Document) => void;
  onChangeSecurityLevel?: (doc: Document) => void;
  onRename?: (doc: Document) => void;
  onRequestStatusChange?: (doc: Document, mode: 'activate' | 'deactivate') => void;
  isSelected?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations('documents');
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('documents:read');
  const canDownload = hasPermission('documents:download');
  const canDelete = hasPermission('documents:delete');
  const canViewConfidential = hasPermission('documents:view_confidential');
  const isConfidentialBlocked = doc.securityLevel === 'CONFIDENTIAL' && !canViewConfidential;

  const { ref, isDragSource } = useDraggable({
    id: doc.id,
    data: {
      type: 'document',
      documentIds: [doc.id],
    },
  });

  const handleContextAction = (action: string) => {
    if (action === 'preview') {
      if (doc.status === 'INACTIVE') {
        toast.error(t('previewBlocked.inactiveToast'));
        return;
      }
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
    } else if (action === 'compare') {
      if (onCompare) {
        onCompare(doc);
      } else {
        router.push(`/chat?compare=${doc.id}&compareName=${encodeURIComponent(doc.fileName)}`);
      }
    } else if (action === 'change-security-level') {
      onChangeSecurityLevel?.(doc);
    } else if (action === 'rename') {
      onRename?.(doc);
    } else if (action === 'deactivate') {
      onRequestStatusChange?.(doc, 'deactivate');
    } else if (action === 'activate') {
      onRequestStatusChange?.(doc, 'activate');
    } else if (action === 'delete') {
      onRequestDelete?.(doc);
    }
  };

  const isPreviewable = checkPreviewable(doc.mimeType);
  const isEditable = checkEditable(doc.mimeType);

  const permLevel = doc.permissionLevel ?? 'VIEWER';
  const isEditorOrAbove = permLevel === 'EDITOR' || permLevel === 'OWNER';
  const isOwnerLevel = permLevel === 'OWNER';

  const handleDoubleClick = () => {
    if (canRead && isPreviewable && onPreview) {
      if (doc.status === 'INACTIVE') {
        toast.error(t('previewBlocked.inactiveToast'));
        return;
      }
      onPreview(doc);
    }
  };

  return (
    <DocumentContextMenu docIds={[doc.id]} onAction={handleContextAction} mimeType={doc.mimeType} documents={[doc]} permissionLevel={doc.permissionLevel}>
      <TableRow
        ref={ref}
        className={cn(
          'hover:bg-blue-50/40 cursor-grab active:cursor-grabbing transition-colors',
          isDragSource && 'opacity-50',
          isSelected && 'bg-blue-50 border-l-2 border-l-primary',
        )}
        onClick={() => onSelectDocument?.(doc)}
        onDoubleClick={handleDoubleClick}
      >
        <TableCell>
          <div className="flex items-center gap-2 min-w-0">
            <FileTypeIcon mimeType={doc.mimeType} fileName={doc.fileName} className="h-5 w-5 flex-shrink-0" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium max-w-[220px] truncate">
                  {doc.title}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs break-words">
                {doc.title}
              </TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatFileSize(doc.fileSize)}
        </TableCell>
        <TableCell className={cn('hidden lg:table-cell text-muted-foreground', compact && 'xl:hidden')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{doc.uploader.fullName}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{doc.uploader.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {doc.uploader.username} • {doc.uploader.email}
              </p>
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="hidden lg:table-cell text-muted-foreground">
          {formatDate(doc.createdAt)}
        </TableCell>
        <TableCell className={cn('hidden md:table-cell text-center', compact && 'xl:hidden')}>
          {doc.securityLevel === 'CONFIDENTIAL' ? (
            <Badge variant="outline" className="gap-1 text-xs bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400">
              <Lock className="h-3 w-3" />
              MẬT
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">Thường</Badge>
          )}
        </TableCell>
        <TableCell className={cn('hidden md:table-cell text-center', compact && 'xl:hidden')}>
          {doc.status === 'INACTIVE' ? (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-gray-200">
              {t('status.inactive')}
            </Badge>
          ) : (
            <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
              {t('status.active')}
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title={t('columns.actions')} data-testid="action-menu-trigger">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canRead && isPreviewable && onPreview && !isConfidentialBlocked && (
                <DropdownMenuItem onClick={() => onPreview(doc)} data-testid="action-preview">
                  <Eye className="mr-2 h-4 w-4 text-blue-500" />
                  {t('contextMenu.preview')}
                </DropdownMenuItem>
              )}
              {isEditable && onEdit && isEditorOrAbove && (
                <DropdownMenuItem onClick={() => onEdit(doc)} data-testid="action-edit">
                  <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                  {t('contextMenu.edit')}
                </DropdownMenuItem>
              )}
              {onReplaceFile && isEditorOrAbove && (
                <DropdownMenuItem onClick={() => onReplaceFile(doc)} data-testid="action-replace-file">
                  <Upload className="mr-2 h-4 w-4 text-violet-500" />
                  {t('contextMenu.replaceFile')}
                </DropdownMenuItem>
              )}
              {isEditorOrAbove && (
                <DropdownMenuItem onClick={() => onRename?.(doc)} data-testid="action-rename">
                  <Type className="mr-2 h-4 w-4 text-blue-600" />
                  {t('contextMenu.rename')}
                </DropdownMenuItem>
              )}
              {(isPreviewable || isEditable) && <DropdownMenuSeparator />}
              {!isConfidentialBlocked && canDownload && (
                <DropdownMenuItem
                  onClick={() => onDownload(doc)}
                  disabled={downloadingId === doc.id}
                  data-testid="action-download"
                >
                  <Download className="mr-2 h-4 w-4 text-emerald-500" />
                  {t('contextMenu.download')}
                </DropdownMenuItem>
              )}
              {isOwnerLevel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onShare?.(doc.id, doc.fileName)} data-testid="action-share">
                    <Share2 className="mr-2 h-4 w-4 text-sky-500" />
                    {t('contextMenu.share')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreatePublicLink?.(doc.id, doc.fileName, doc.securityLevel)} data-testid="action-create-public-link">
                    <Link className="mr-2 h-4 w-4 text-cyan-600" />
                    {t('contextMenu.createPublicLink')}
                  </DropdownMenuItem>
                </>
              )}
              {isOwnerLevel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onChangeSecurityLevel?.(doc)}
                    data-testid="action-change-security-level"
                  >
                    <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" />
                    {doc.securityLevel === 'CONFIDENTIAL'
                      ? t('contextMenu.setNormal')
                      : t('contextMenu.setConfidential')}
                  </DropdownMenuItem>
                </>
              )}
              {isEditorOrAbove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onMoveToFolder?.([doc.id])} data-testid="action-move">
                    <FolderInput className="mr-2 h-4 w-4 text-amber-600" />
                    {t('contextMenu.moveTo')}
                  </DropdownMenuItem>
                </>
              )}
              {/* Kích hoạt / Vô hiệu hóa — chỉ EDITOR+ */}
              {isEditorOrAbove && (
                <>
                  <DropdownMenuSeparator />
                  {doc.status === 'ACTIVE' ? (
                    <DropdownMenuItem
                      onClick={() => onRequestStatusChange?.(doc, 'deactivate')}
                      data-testid="action-deactivate"
                    >
                      <PowerOff className="mr-2 h-4 w-4 text-gray-500" />
                      {t('contextMenu.deactivate')}
                    </DropdownMenuItem>
                  ) : doc.status === 'INACTIVE' ? (
                    <DropdownMenuItem
                      onClick={() => onRequestStatusChange?.(doc, 'activate')}
                      data-testid="action-activate"
                    >
                      <Power className="mr-2 h-4 w-4 text-green-500" />
                      {t('contextMenu.activate')}
                    </DropdownMenuItem>
                  ) : null}
                </>
              )}
              {canDelete && isOwnerLevel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRequestDelete?.(doc)}
                    className="text-destructive focus:text-destructive"
                    data-testid="action-delete"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('contextMenu.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </DocumentContextMenu>
  );
}

export function DocumentListTable({
  refreshTrigger,
  folderId,
  onMoveToFolder,
  onShare,
  onCreatePublicLink,
  onDelete,
  onNavigateToFolder,
  onPreview,
  onEdit,
  onReplaceFile,
  onCompare,
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
}: DocumentListTableProps) {
  const t = useTranslations('documents');

  // Unified items state
  const [items, setItems] = useState<FolderChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search state — dùng externalSearch nếu có (controlled từ header)
  const [internalSearch, setInternalSearch] = useState('');
  const searchQuery = externalSearch !== undefined ? externalSearch : internalSearch;
  const setSearchQuery = externalSearch !== undefined ? () => {} : setInternalSearch;
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Download loading state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status change (activate/deactivate) state — Phase 72.1
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    mode: 'activate' | 'deactivate';
    document: Document | null;
  }>({ open: false, mode: 'deactivate', document: null });
  const [statusLoading, setStatusLoading] = useState(false);

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Unified fetch từ /folders/children endpoint
  // Không chặn bằng canListFolders — backend ACL tự filter folders/docs theo resource_permissions.
  // User được share document trực tiếp (không có folders:list Casbin) vẫn thấy documents của mình.
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
        // 403 = user không có quyền Casbin — show empty list, không toast
        if (error?.response?.status !== 403) {
          console.error('[DocumentListTable] Failed to fetch children:', error);
          const msg = error?.response?.data?.error?.message || 'Không thể tải danh sách';
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [page, limit, debouncedSearch, folderId, refreshTrigger, sortBy, sortOrder, departmentId, statusFilter]);

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

  // Handle status change request từ row context menu — Phase 72.1
  const handleRequestStatusChange = (doc: Document, mode: 'activate' | 'deactivate') => {
    setStatusDialog({ open: true, mode, document: doc });
  };

  // Handle status confirm — gọi API + update local items state (không reload)
  const handleStatusConfirm = async () => {
    if (!statusDialog.document) return;
    setStatusLoading(true);
    try {
      const fn = statusDialog.mode === 'deactivate' ? deactivateDocument : activateDocument;
      await fn(statusDialog.document.id);
      const newStatus = statusDialog.mode === 'deactivate' ? 'INACTIVE' : 'ACTIVE';
      // Update items state local — không reload trang
      setItems(prev => prev.map(item => {
        if (item.type === 'DOCUMENT' && item.id === statusDialog.document!.id) {
          return { ...item, status: newStatus } as typeof item;
        }
        return item;
      }));
      const section = statusDialog.mode === 'deactivate' ? 'deactivateDialog' : 'activateDialog';
      toast.success(t(`${section}.successToast`, { name: statusDialog.document.title }));
      setStatusDialog({ open: false, mode: 'deactivate', document: null });
    } catch (err: any) {
      const errorCode = err?.response?.data?.error?.code;
      if (errorCode === 'DOCUMENT_DEACTIVATE_DENIED' || errorCode === 'DOCUMENT_ACTIVATE_DENIED') {
        toast.error(t('common.permissionDenied') as string || 'Không có quyền thực hiện thao tác này');
      } else {
        const section = statusDialog.mode === 'deactivate' ? 'deactivateDialog' : 'activateDialog';
        toast.error(t(`${section}.errorToast`));
      }
    } finally {
      setStatusLoading(false);
    }
  };

  const isEmpty = folderItems.length === 0 && documentItems.length === 0;

  return (
    <TooltipProvider>
      <div className="flex flex-col flex-1 min-h-0 gap-4">
        {/* Filter bar — ẩn hoàn toàn nếu externalSearch đã được cung cấp từ header */}
        {externalSearch === undefined && (
          <div className="flex items-center gap-4 flex-wrap shrink-0">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchByTitle')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

      {/* Table — flex-1 + overflow-auto để scroll bên trong, không đẩy pagination ra ngoài */}
      <div className="flex-1 overflow-auto min-h-0">
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          {searchQuery ? (
            <>
              <p>{t('noResults')}</p>
              <p className="text-sm mt-2">{t('noResultsHint')}</p>
            </>
          ) : (
            <>
              <p>{t('empty')}</p>
              <p className="text-sm mt-2">{t('emptyDrop')}</p>
            </>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <SortableHeader
                  label={t('columns.name')}
                  sortKey="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  label={t('columns.size')}
                  sortKey="fileSize"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
                <TableHead className={cn('hidden lg:table-cell', selectedDocumentId && 'xl:hidden')}>{t('columns.uploadedBy')}</TableHead>
                <SortableHeader
                  label={t('columns.uploadedAt')}
                  sortKey="createdAt"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
                <TableHead className={cn('hidden md:table-cell text-center', selectedDocumentId && 'xl:hidden')}>Cấp độ</TableHead>
                <TableHead className={cn('hidden md:table-cell text-center', selectedDocumentId && 'xl:hidden')}>Trạng thái</TableHead>
                <TableHead className="text-right w-20">{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Folder rows */}
              {folderItems.map((folderItem) => (
                <DroppableFolderRow
                  key={`folder-${folderItem.id}`}
                  folder={folderItem}
                  onDoubleClick={() => onNavigateToFolder?.(folderItem.id)}
                  onAction={onFolderAction ?? (() => {})}
                  compact={!!selectedDocumentId}
                />
              ))}

              {/* Document rows */}
              {documentItems.map((docItem) => (
                <DraggableDocumentRow
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
                  onCompare={onCompare}
                  onChangeSecurityLevel={onChangeSecurityLevel}
                  onRename={onRename}
                  onRequestStatusChange={handleRequestStatusChange}
                  onSelectDocument={onSelectDocument}
                  isSelected={selectedDocumentId === docItem.id}
                  compact={!!selectedDocumentId}
                />
              ))}
            </TableBody>
          </Table>
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
        <AlertDialogContent className="overflow-hidden [&>*]:min-w-0">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-red-400 rounded-t-lg" />
          <AlertDialogHeader className="pt-2">
            <AlertDialogTitle className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-rose-100">
                <Trash2 className="h-4 w-4 text-rose-600" />
              </div>
              {t('delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription title={deleteTarget?.title ?? ''}>
              {t('delete.message', { name: (deleteTarget?.title ?? '').length > 30 ? (deleteTarget?.title ?? '').slice(0, 30) + '…' : deleteTarget?.title ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleting ? t('delete.deleting') : t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate/Deactivate Confirmation Dialog — Phase 72.1 */}
      <DocumentDeactivateConfirmDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
        document={statusDialog.document}
        mode={statusDialog.mode}
        onConfirm={handleStatusConfirm}
        loading={statusLoading}
      />
      </div>
    </TooltipProvider>
  );
}
