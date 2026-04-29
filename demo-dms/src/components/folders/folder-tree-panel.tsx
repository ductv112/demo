'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { FolderPlus, Folder, PanelLeftClose } from 'lucide-react';
import { getFolderTree } from '@/lib/folders-api';
import type { FolderTreeNode } from '@/types/folder';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderTreeNode as TreeNode } from './folder-tree-node';
import { FolderFormDialog } from './folder-form-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { useDroppable } from '@dnd-kit/react';
import { cn } from '@/lib/utils';

interface FolderTreePanelProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  refreshTrigger: number;
  departmentId?: string | null;
  onFolderTreeChange?: (tree: FolderTreeNode[]) => void;
  onUploadAtFolder?: (folderId: string) => void;
  onShare?: (folderId: string, folderName: string) => void;
  onToggle?: () => void;
}

/**
 * Panel trái: Folder tree với action buttons
 */
export function FolderTreePanel({
  selectedFolderId,
  onSelectFolder,
  refreshTrigger,
  departmentId,
  onFolderTreeChange,
  onUploadAtFolder,
  onShare,
  onToggle,
}: FolderTreePanelProps) {
  const t = useTranslations('folders');
  const { hasPermission } = usePermissions();
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'rename'>('create');
  const [targetFolder, setTargetFolder] = useState<FolderTreeNode | null>(null);
  const [parentFolder, setParentFolder] = useState<FolderTreeNode | null>(null);

  // Fetch folder tree
  useEffect(() => {
    const fetchTree = async () => {
      setLoading(true);
      try {
        const response = await getFolderTree(departmentId ?? undefined);
        setFolderTree(response.data);
        onFolderTreeChange?.(response.data);
      } catch (error: any) {
        // 403 PERMISSION_DENIED — user không có quyền folder, show empty tree silently
        if (error?.response?.status !== 403) {
          const msg = error?.response?.data?.error?.message || 'Không thể tải danh sách thư mục';
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [refreshTrigger, departmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch tree
  const refetchTree = () => {
    const fetchTree = async () => {
      try {
        const response = await getFolderTree(departmentId ?? undefined);
        setFolderTree(response.data);
        onFolderTreeChange?.(response.data);
      } catch (error: any) {
        if (error?.response?.status !== 403) {
          const msg = error?.response?.data?.error?.message || 'Không thể tải danh sách thư mục';
          toast.error(msg);
        }
      }
    };
    fetchTree();
  };

  // Handle create root folder
  const handleCreateRoot = () => {
    setDialogMode('create');
    setTargetFolder(null);
    setParentFolder(null);
    setIsCreateDialogOpen(true);
  };

  // Handle context menu actions from TreeNode
  const handleContextAction = (action: string, folder: FolderTreeNode, parent?: FolderTreeNode) => {
    if (action === 'create-subfolder') {
      setDialogMode('create');
      setTargetFolder(null);
      setParentFolder(folder);
      setIsCreateDialogOpen(true);
    } else if (action === 'rename') {
      setDialogMode('rename');
      setTargetFolder(folder);
      setParentFolder(parent || null);
      setIsCreateDialogOpen(true);
    } else if (action === 'share') {
      onShare?.(folder.id, folder.name);
    }
    // 'delete', 'upload' sẽ được handle trong TreeNode trực tiếp
  };

  const canCreate = hasPermission('folders:create');

  // Root droppable — "Tất cả tài liệu" có thể nhận documents drop (folderId = null)
  const { ref: rootDropRef, isDropTarget: isRootDropTarget } = useDroppable({
    id: '__root__',
    data: { type: 'folder', folderId: null },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 border-b shrink-0 bg-white h-[52px] flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('header')}
        </p>
        <div className="flex items-center gap-0.5">
          {canCreate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCreateRoot}
              title={t('newFolder')}
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              onClick={onToggle}
              title="Ẩn cây thư mục"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto px-2 py-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {/* "Tất cả tài liệu" item — cũng droppable */}
            <div
              ref={rootDropRef}
              className={cn(
                'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors',
                selectedFolderId === null && 'bg-accent',
                isRootDropTarget && 'ring-2 ring-primary bg-primary/10'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelectFolder(null);
              }}
              onPointerUp={(e) => {
                if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                  onSelectFolder(null);
                }
              }}
            >
              <Folder className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="flex-1 truncate text-sm font-medium">{t('allDocuments')}</span>
            </div>

            {/* Folder tree */}
            {folderTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                selectedId={selectedFolderId}
                onSelect={onSelectFolder}
                onContextAction={handleContextAction}
                onRefreshTree={refetchTree}
                onUploadAtFolder={onUploadAtFolder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Rename Dialog */}
      <FolderFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode={dialogMode}
        folder={targetFolder}
        parentFolder={parentFolder}
        onSuccess={refetchTree}
      />
    </div>
  );
}
