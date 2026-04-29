'use client';

import { useTranslations } from 'next-intl';
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
import type { Document } from '@/types/document';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  mode: 'activate' | 'deactivate';
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function DocumentDeactivateConfirmDialog({
  open,
  onOpenChange,
  document,
  mode,
  onConfirm,
  loading,
}: Props) {
  const t = useTranslations('documents');
  if (!document) return null;
  const section = mode === 'deactivate' ? 'deactivateDialog' : 'activateDialog';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="deactivate-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{t(`${section}.title`)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(`${section}.description`, { name: document.title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t(`${section}.cancel`)}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            data-testid={
              mode === 'deactivate' ? 'action-deactivate-confirm' : 'action-activate-confirm'
            }
          >
            {t(`${section}.confirm`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
