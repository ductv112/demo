'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { FolderTreeNode as FolderTreeNodeType } from '@/types/folder';
import { Badge } from '@/components/ui/badge';
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
import { FolderContextMenu } from './folder-context-menu';
import { deleteFolder, getFolderStats } from '@/lib/folders-api';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/react';

interface FolderTreeNodeProps {
  node: FolderTreeNodeType;
  level: number;
  selectedId: string | null;
  onSelect: (folderId: string) => void;
  onContextAction: (action: string, folder: FolderTreeNodeType, parent?: FolderTreeNodeType) => void;
  onRefreshTree: () => void;
  onUploadAtFolder?: (folderId: string) => void;
  parent?: FolderTreeNodeType;
}

/**
 * Recursive tree node component
 */
export function FolderTreeNode({
  node,
  level,
  selectedId,
  onSelect,
  onContextAction,
  onRefreshTree,
  onUploadAtFolder,
  parent,
}: FolderTreeNodeProps) {
  const t = useTranslations('folders');
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand 2 levels
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [folderStats, setFolderStats] = useState<{ subfolderCount: number; documentCount: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const hasChildren = node.children && node.children.length > 0;

  // Droppable — folder có thể nhận documents drop vào
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: node.id,
    data: { type: 'folder', folderId: node.id },
  });

  // Handle context menu action
  const handleContextAction = async (action: string, folder: FolderTreeNodeType) => {
    if (action === 'delete') {
      setIsDeleteDialogOpen(true);
      // Tải thống kê để hiển thị cảnh báo nếu folder có nội dung
      if ((folder.children && folder.children.length > 0) || folder.documentCount > 0) {
        setLoadingStats(true);
        try {
          const res = await getFolderStats(folder.id);
          setFolderStats(res.data);
        } catch {
          // Fallback: vẫn cho xóa, chỉ không hiển thị chi tiết
          setFolderStats(null);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setFolderStats(null);
      }
    } else if (action === 'upload') {
      onUploadAtFolder?.(folder.id);
    } else {
      // create-subfolder, rename → delegate to parent
      onContextAction(action, folder, parent);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFolder(node.id);
      toast.success(t('toast.deleted', { name: node.name }));
      setIsDeleteDialogOpen(false);
      onRefreshTree();
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || t('toast.deleteError');
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Node row */}
      <FolderContextMenu folder={node} onAction={handleContextAction} permissionLevel={node.permissionLevel}>
        <div
          ref={dropRef}
          className={cn(
            'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer',
            'hover:bg-muted/50 group transition-colors',
            selectedId === node.id && 'bg-accent',
            isDropTarget && 'ring-2 ring-primary bg-primary/10'
          )}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node.id);
          }}
          onPointerUp={(e) => {
            // Ensure click works even when useDroppable intercepts pointer events
            if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
              onSelect(node.id);
            }
          }}
        >
          {/* Expand toggle */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="shrink-0 p-0.5 hover:bg-muted rounded transition-colors"
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          ) : (
            <div className="w-5" /> // Spacer
          )}

          {/* Folder icon */}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-400" />
          )}

          {/* Folder name */}
          <span className="truncate flex-1 text-sm font-medium">{node.name}</span>

          {/* Document count badge */}
          {node.documentCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {node.documentCount}
            </Badge>
          )}
        </div>
      </FolderContextMenu>

      {/* Children (recursive) */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onContextAction={onContextAction}
              onRefreshTree={onRefreshTree}
              onUploadAtFolder={onUploadAtFolder}
              parent={node}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="break-words">
                {folderStats && (folderStats.subfolderCount > 0 || folderStats.documentCount > 0) ? (
                  <>
                    {t('delete.warningMessage', { name: node.name })}
                    <ul className="mt-2 list-disc list-inside text-sm">
                      {folderStats.subfolderCount > 0 && (
                        <li>{t('delete.subfolderCount', { count: folderStats.subfolderCount })}</li>
                      )}
                      {folderStats.documentCount > 0 && (
                        <li>{t('delete.documentCount', { count: folderStats.documentCount })}</li>
                      )}
                    </ul>
                  </>
                ) : loadingStats ? (
                  t('delete.loadingStats')
                ) : (
                  t('delete.message', { name: node.name })
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || loadingStats}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? t('delete.deleting') : t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
