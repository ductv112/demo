'use client';

// NOTE (Phase 17.4): Folders permissions (folders:create, folders:update, folders:delete)
// là system permissions (Casbin-based). Không cần department permission check ở frontend.
// Backend FoldersService đã refactor sang CasbinService admin check (Phase 17.3-02),
// nhưng non-admin vẫn có folders permissions qua Casbin policies.

import { useTranslations } from 'next-intl';
import { FolderPlus, Link, Pencil, Share2, Trash2, Upload } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { FolderTreeNode } from '@/types/folder';
import { usePermissions } from '@/hooks/use-permissions';

interface FolderContextMenuProps {
  folder: FolderTreeNode;
  onAction: (action: string, folder: FolderTreeNode) => void;
  children: React.ReactNode;
  permissionLevel?: 'VIEWER' | 'EDITOR' | 'OWNER';
}

/**
 * Right-click context menu cho folder
 */
export function FolderContextMenu({ folder, onAction, children, permissionLevel }: FolderContextMenuProps) {
  const t = useTranslations('folders');
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('folders:create');
  const canUpdate = hasPermission('folders:update');
  const canDelete = hasPermission('folders:delete');
  const canUpload = hasPermission('documents:upload');

  // ACL ownership — sharing chỉ dành cho OWNER (giống DocumentContextMenu)
  const isOwnerLevel = permissionLevel === 'OWNER';
  // Ẩn rename nếu chỉ có VIEWER (permissionLevel undefined = chưa biết → cho phép)
  const canRename = canUpdate && permissionLevel !== 'VIEWER';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {canCreate && (
          <ContextMenuItem onClick={() => onAction('create-subfolder', folder)}>
            <FolderPlus className="h-4 w-4 mr-2 text-indigo-500" />
            {t('contextMenu.newFolder')}
          </ContextMenuItem>
        )}
        {canRename && (
          <ContextMenuItem onClick={() => onAction('rename', folder)}>
            <Pencil className="h-4 w-4 mr-2 text-amber-500" />
            {t('contextMenu.rename')}
          </ContextMenuItem>
        )}
        {isOwnerLevel && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onAction('share', folder)}>
              <Share2 className="h-4 w-4 mr-2 text-sky-500" />
              {t('contextMenu.share')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAction('create-public-link', folder)}>
              <Link className="h-4 w-4 mr-2 text-cyan-600" />
              {t('contextMenu.createPublicLink')}
            </ContextMenuItem>
          </>
        )}
        {canUpload && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onAction('upload', folder)}>
              <Upload className="h-4 w-4 mr-2 text-violet-500" />
              {t('contextMenu.uploadHere')}
            </ContextMenuItem>
          </>
        )}
        {canDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onAction('delete', folder)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('contextMenu.delete')}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
