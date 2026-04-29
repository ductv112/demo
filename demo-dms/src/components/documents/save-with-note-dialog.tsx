'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface SaveWithNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (changeNote?: string) => Promise<void>;
  isSaving?: boolean;
}

export function SaveWithNoteDialog({
  open,
  onOpenChange,
  onConfirm,
  isSaving = false,
}: SaveWithNoteDialogProps) {
  const t = useTranslations('documents');
  const [note, setNote] = useState('');

  const handleConfirm = async () => {
    await onConfirm(note.trim() || undefined);
    setNote('');
  };

  const handleCancel = () => {
    setNote('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('saveWithNote.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('saveWithNote.noteDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder={t('saveWithNote.notePlaceholder')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={isSaving}
        />
        <div className="text-xs text-muted-foreground text-right">
          {note.length}/500
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSaving}>
            {t('saveWithNote.cancelButton')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('saveWithNote.saveButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
