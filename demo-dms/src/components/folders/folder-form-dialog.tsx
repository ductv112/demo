'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createFolder, updateFolder } from '@/lib/folders-api';
import type { FolderTreeNode } from '@/types/folder';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus, Pencil } from 'lucide-react';

interface FolderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'rename';
  folder?: FolderTreeNode | null; // Folder cần rename (mode='rename')
  parentFolder?: FolderTreeNode | null; // Parent folder khi tạo subfolder
  onSuccess: () => void;
  /** Phase 30: gắn folder mới vào phòng ban đang chọn */
  departmentId?: string | null;
}

/**
 * Dialog tạo folder mới hoặc đổi tên folder
 */
const MAX_NAME_LENGTH = 255;

export function FolderFormDialog({
  open,
  onOpenChange,
  mode,
  folder,
  parentFolder,
  onSuccess,
  departmentId,
}: FolderFormDialogProps) {
  const t = useTranslations('folders');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill name khi rename
  useEffect(() => {
    if (open) {
      if (mode === 'rename' && folder) {
        setName(folder.name);
      } else {
        setName('');
      }
      setNameError('');
    }
  }, [open, mode, folder]);

  const validateName = (value: string): string => {
    if (!value.trim()) return t('form.nameRequired');
    if (value.trim().length > MAX_NAME_LENGTH) return t('form.nameTooLong');
    return '';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (nameError) setNameError(validateName(value));
  };

  const handleSubmit = async () => {
    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        await createFolder({
          name: name.trim(),
          parentId: parentFolder?.id,
          // Phase 30: gắn departmentId nếu đang trong context phòng ban (không phải 'personal')
          departmentId: departmentId && departmentId !== 'personal' ? departmentId : undefined,
        });
        toast.success(t('toast.created'));
      } else if (mode === 'rename' && folder) {
        await updateFolder(folder.id, { name: name.trim() });
        toast.success(t('toast.renamed'));
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const serverMsg = error?.response?.data?.message
        || error?.response?.data?.error?.message;
      const fallbackKey = mode === 'create' ? 'toast.createError' : 'toast.renameError';
      toast.error(serverMsg || t(fallbackKey));
    } finally {
      setLoading(false);
    }
  };

  const truncName = (n: string, max = 15) => n.length > max ? n.slice(0, max) + '…' : n;

  const title = mode === 'create'
    ? (parentFolder ? t('form.createSubTitle', { parent: truncName(parentFolder.name) }) : t('form.createTitle'))
    : t('form.editTitle');

  const fullDescription = mode === 'create'
    ? t('form.createDesc')
    : t('form.editDesc', { name: folder?.name ?? '' });
  const description = mode === 'create'
    ? t('form.createDesc')
    : t('form.editDesc', { name: truncName(folder?.name ?? '') });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] overflow-hidden [&>*]:min-w-0">
        {/* Colored header strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 rounded-t-lg" />

        <DialogHeader className="pt-2">
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-100">
              {mode === 'create' ? (
                <FolderPlus className="h-4 w-4 text-amber-600" />
              ) : (
                <Pencil className="h-4 w-4 text-amber-600" />
              )}
            </div>
            {title}
          </DialogTitle>
          <DialogDescription title={fullDescription}>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">{t('form.nameLabel')}</Label>
            <Input
              id="folder-name"
              placeholder={t('form.namePlaceholder')}
              value={name}
              onChange={handleNameChange}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              autoFocus
              className={nameError ? 'border-red-500 focus-visible:ring-red-400' : 'border-amber-200 focus-visible:ring-amber-400'}
            />
            {nameError && (
              <p className="text-sm text-red-500">{nameError}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('form.cancelButton')}
          </Button>
          <Button variant="ghost" onClick={handleSubmit} disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
            {loading ? t('form.processing') : mode === 'create' ? t('form.createButton') : t('form.renameButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
