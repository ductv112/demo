'use client';

// NOTE (Phase 17.4): Documents permissions (documents:upload, documents:download, documents:update, documents:delete)
// là system permissions (Casbin-based). Không cần department permission check ở frontend.
// Backend DocumentsService đã refactor sang CasbinService admin check (Phase 17.3-02),
// nhưng non-admin vẫn có documents permissions qua Casbin policies.

import { useTranslations } from 'next-intl';
import { usePermissions } from '@/hooks/use-permissions';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Download, FolderInput, Share2, Trash2, Eye, Pencil, Link, Upload, ArrowLeftRight, ShieldAlert, Type, Power, PowerOff } from 'lucide-react';
import { ReactNode } from 'react';
import { isPreviewable as checkPreviewable, isEditable as checkEditable, type Document } from '@/types/document';

interface DocumentContextMenuProps {
  docIds: string[];
  onAction: (action: string) => void;
  children: ReactNode;
  mimeType?: string; // MIME type cho single document (check previewable)
  documents?: Document[]; // Phase 62: de biet securityLevel cua selected docs
  permissionLevel?: string | null; // ACL permission level của document trong context
}

/**
 * Right-click context menu cho documents
 */
export function DocumentContextMenu({
  docIds,
  onAction,
  children,
  mimeType,
  documents,
  permissionLevel,
}: DocumentContextMenuProps) {
  const t = useTranslations('documents');
  const { hasPermission } = usePermissions();

  // Phase 62: disable public link cho tai lieu mat
  const hasConfidentialDoc = documents?.some(d => d.securityLevel === 'CONFIDENTIAL') ?? false;

  const canRead = hasPermission('documents:read');
  const canViewConfidential = hasPermission('documents:view_confidential');
  const canDownload = hasPermission('documents:download');
  const canUpdate = hasPermission('documents:update');
  const canDelete = hasPermission('documents:delete');

  // ACL resource-level permission (lớp thứ 2 sau system permission)
  // Fallback VIEWER nếu không có (backward compat)
  const permLevel = permissionLevel ?? 'VIEWER';
  const isEditorOrAbove = permLevel === 'EDITOR' || permLevel === 'OWNER';
  const isOwnerLevel = permLevel === 'OWNER';

  const count = docIds.length;
  const isSingle = count === 1;

  // Tài liệu mật mà không có quyền view_confidential → block preview + download
  const isConfidentialBlocked = hasConfidentialDoc && !canViewConfidential;

  // Check previewable: chỉ hiện khi single document + có mimeType + previewable
  const isPreviewableFile =
    isSingle && mimeType && checkPreviewable(mimeType);

  // Check editable: chỉ hiện khi single document + có mimeType + editable (DOCX, XLSX, CSV, text)
  const isEditableFile =
    isSingle && mimeType && checkEditable(mimeType) && canUpdate;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {canRead && isPreviewableFile && !isConfidentialBlocked && (
          <ContextMenuItem onClick={() => onAction('preview')}>
            <Eye className="h-4 w-4 mr-2 text-blue-500" />
            {t('contextMenu.preview')}
          </ContextMenuItem>
        )}

        {/* Chỉnh sửa — chỉ EDITOR+ */}
        {isEditableFile && isEditorOrAbove && (
          <>
            {isPreviewableFile && <ContextMenuSeparator />}
            <ContextMenuItem onClick={() => onAction('edit')}>
              <Pencil className="h-4 w-4 mr-2 text-amber-500" />
              {t('contextMenu.edit')}
            </ContextMenuItem>
          </>
        )}

        {/* Cập nhật phiên bản — chỉ EDITOR+ */}
        {canUpdate && isSingle && isEditorOrAbove && (
          <>
            {(isPreviewableFile || isEditableFile) && <ContextMenuSeparator />}
            <ContextMenuItem onClick={() => onAction('replace-file')}>
              <Upload className="h-4 w-4 mr-2 text-violet-500" />
              {t('contextMenu.replaceFile')}
            </ContextMenuItem>
          </>
        )}

        {/* Đổi tên — chỉ EDITOR+ */}
        {canUpdate && isSingle && isEditorOrAbove && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onAction('rename')}>
              <Type className="h-4 w-4 mr-2 text-blue-600" />
              {t('contextMenu.rename')}
            </ContextMenuItem>
          </>
        )}

        {canDownload && !isConfidentialBlocked && (
          <>
            {(isPreviewableFile || (isEditableFile && isEditorOrAbove) || (canUpdate && isSingle && isEditorOrAbove)) && <ContextMenuSeparator />}
            <ContextMenuItem onClick={() => onAction('download')}>
              <Download className="h-4 w-4 mr-2 text-emerald-500" />
              {t('contextMenu.download')}
            </ContextMenuItem>
          </>
        )}

        {/* Chia sẻ + Tạo link công khai — chỉ OWNER */}
        {isSingle && isOwnerLevel && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onAction('share')}>
              <Share2 className="h-4 w-4 mr-2 text-sky-500" />
              {t('contextMenu.share')}
            </ContextMenuItem>
            <ContextMenuItem
              disabled={hasConfidentialDoc}
              onClick={() => !hasConfidentialDoc && onAction('create-public-link')}
              title={hasConfidentialDoc ? 'Tài liệu mật không hỗ trợ chia sẻ công khai' : undefined}
            >
              <Link className="h-4 w-4 mr-2 text-cyan-600" />
              {t('contextMenu.createPublicLink')}
            </ContextMenuItem>
          </>
        )}

        {/* Đổi cấp độ bảo mật — chỉ OWNER, single document */}
        {canUpdate && isSingle && isOwnerLevel && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onAction('change-security-level')}>
              <ShieldAlert className="h-4 w-4 mr-2 text-orange-500" />
              {documents?.[0]?.securityLevel === 'CONFIDENTIAL'
                ? t('contextMenu.setNormal')
                : t('contextMenu.setConfidential')}
            </ContextMenuItem>
          </>
        )}

        {/* Di chuyển — chỉ EDITOR+ */}
        {canUpdate && isEditorOrAbove && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onAction('move-to')}>
              <FolderInput className="h-4 w-4 mr-2 text-amber-600" />
              {t('contextMenu.moveTo')}
            </ContextMenuItem>
          </>
        )}

        {/* Kích hoạt / Vô hiệu hóa — chỉ EDITOR+ */}
        {canUpdate && isSingle && isEditorOrAbove && (
          <>
            <ContextMenuSeparator />
            {documents?.[0]?.status === 'ACTIVE' ? (
              <ContextMenuItem
                onClick={() => onAction('deactivate')}
                data-testid="action-deactivate"
              >
                <PowerOff className="h-4 w-4 mr-2 text-gray-500" />
                {t('contextMenu.deactivate')}
              </ContextMenuItem>
            ) : documents?.[0]?.status === 'INACTIVE' ? (
              <ContextMenuItem
                onClick={() => onAction('activate')}
                data-testid="action-activate"
              >
                <Power className="h-4 w-4 mr-2 text-green-500" />
                {t('contextMenu.activate')}
              </ContextMenuItem>
            ) : null}
          </>
        )}

        {/* Xóa — chỉ OWNER */}
        {canDelete && isOwnerLevel && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onAction('delete')}
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
