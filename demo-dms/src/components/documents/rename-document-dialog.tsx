'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { renameDocument } from '@/lib/documents-api';
import type { Document } from '@/types/document';

interface RenameDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: { id: string; title: string } | null;
  onSuccess: () => void;
}

/**
 * Dialog đổi tên tài liệu — cập nhật title hiển thị (không đổi fileName trên MinIO)
 */
export function RenameDocumentDialog({
  open,
  onOpenChange,
  document,
  onSuccess,
}: RenameDocumentDialogProps) {
  const t = useTranslations('documents');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill khi dialog mở hoặc document thay đổi
  useEffect(() => {
    if (open && document) {
      setTitle(document.title);
      setError(null);
    }
  }, [open, document]);

  // Auto-focus input khi dialog mở
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const trimmedTitle = title.trim();
  const charsLeft = 255 - title.length;
  const isValid = trimmedTitle.length > 0 && title.length <= 255;

  const handleSave = async () => {
    if (!document) return;

    if (!trimmedTitle) {
      setError(t('rename.required'));
      return;
    }
    if (title.length > 255) {
      setError(t('rename.maxLength'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await renameDocument(document.id, trimmedTitle);
      toast.success(t('rename.success'));
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Đổi tên thất bại';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !saving) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="form-dialog" className="sm:max-w-md overflow-hidden [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>{t('rename.dialogTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="rename-title">{t('rename.label')}</Label>
          <Input
            id="rename-title"
            ref={inputRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.length > 255) {
                setError(t('rename.maxLength'));
              } else {
                setError(null);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('rename.placeholder')}
            disabled={saving}
          />
          <div className="flex justify-between items-center text-xs">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-muted-foreground">&nbsp;</span>
            )}
            <span className={charsLeft < 20 ? 'text-amber-500' : 'text-muted-foreground'}>
              {title.length}/255
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? t('rename.saving') : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
