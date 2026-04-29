'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFolderTree } from '@/lib/folders-api';
import { moveDocumentsBulk } from '@/lib/documents-api';
import type { FolderTreeNode } from '@/types/folder';
import { Folder, FolderInput } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MoveToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentIds: string[];
  onSuccess?: () => void;
}

/**
 * Helper: Flatten folder tree thành flat list với indentation
 */
function flattenFolderTree(
  nodes: FolderTreeNode[],
  depth = 0
): Array<{ id: string; name: string; depth: number }> {
  const result: Array<{ id: string; name: string; depth: number }> = [];
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, depth });
    if (node.children.length > 0) {
      result.push(...flattenFolderTree(node.children, depth + 1));
    }
  }
  return result;
}

/**
 * Dialog để chọn folder đích rồi move documents
 */
export function MoveToFolderDialog({
  open,
  onOpenChange,
  documentIds,
  onSuccess,
}: MoveToFolderDialogProps) {
  const t = useTranslations('documents');
  const [folders, setFolders] = useState<Array<{ id: string; name: string; depth: number }>>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('__root__');
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);

  const count = documentIds.length;

  // Fetch folders khi dialog mở
  useEffect(() => {
    if (open) {
      const fetchFolders = async () => {
        setLoading(true);
        try {
          const response = await getFolderTree();
          const flatList = flattenFolderTree(response.data);
          setFolders(flatList);
        } catch (error: any) {
          const msg = error?.response?.data?.error?.message || 'Không thể tải danh sách thư mục';
          toast.error(msg);
        } finally {
          setLoading(false);
        }
      };

      fetchFolders();
      setSelectedFolderId('__root__'); // Reset về root
    }
  }, [open]);

  // Handle move
  const handleMove = async () => {
    const targetFolderId = selectedFolderId === '__root__' ? null : selectedFolderId;

    setMoving(true);
    try {
      await moveDocumentsBulk(documentIds, targetFolderId);
      const folderName =
        targetFolderId === null
          ? t('allDocuments')
          : folders.find((f) => f.id === targetFolderId)?.name || 'Thư mục';
      toast.success(t('toast.moved', { count, folder: folderName }));
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || 'Di chuyển tài liệu thất bại';
      toast.error(msg);
    } finally {
      setMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden">
        {/* Colored header strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-400 rounded-t-lg" />

        <DialogHeader className="pt-2">
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-100">
              <FolderInput className="h-4 w-4 text-indigo-600" />
            </div>
            {t('move.title')}
          </DialogTitle>
          <DialogDescription>
            {t('move.description', { count })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedFolderId}
            onValueChange={setSelectedFolderId}
            disabled={loading}
          >
            <SelectTrigger className="border-indigo-200 focus:ring-indigo-400">
              <SelectValue placeholder={t('move.selectFolder')} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {/* Root folder */}
              <SelectItem value="__root__">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-amber-500" />
                  <span>{t('allDocuments')}</span>
                </div>
              </SelectItem>
              {/* Tree folders với indent */}
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <Folder className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <TooltipProvider delayDuration={400}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="truncate block max-w-[220px]"
                            style={{ marginLeft: `${folder.depth * 12}px` }}
                          >
                            {folder.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{folder.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moving}
          >
            {t('move.cancelButton')}
          </Button>
          <Button variant="ghost" onClick={handleMove} disabled={moving || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            {moving ? t('move.moving') : t('move.moveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
