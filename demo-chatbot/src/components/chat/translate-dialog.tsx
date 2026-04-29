'use client';

import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getGlossaryCategories } from '@/lib/glossary-api';
import type { GlossaryCategory } from '@/lib/glossary-api';

// ─── Danh sách ngôn ngữ đích ─────────────────────────────────────────────────

const TARGET_LANGUAGE_CODES = [
  'vi', 'en', 'ja', 'ru', 'zh', 'ko', 'fr', 'de', 'hi', 'tr',
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface TranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (sourceText: string, targetLanguage: string, categoryId?: string) => void;
  isStreaming: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TranslateDialog({
  open,
  onOpenChange,
  onConfirm,
  isStreaming,
}: TranslateDialogProps) {
  const t = useTranslations('chat');
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('vi');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [categories, setCategories] = useState<GlossaryCategory[]>([]);

  // Load categories khi dialog mở
  useEffect(() => {
    if (open && categories.length === 0) {
      getGlossaryCategories().then((r) => setCategories(r.data)).catch(() => {});
    }
  }, [open, categories.length]);

  const handleConfirm = () => {
    const trimmed = sourceText.trim();
    if (!trimmed || isStreaming) return;
    onConfirm(trimmed, targetLang, categoryId === 'all' ? undefined : categoryId);
    onOpenChange(false);
    setSourceText('');
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSourceText('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-green-600" />
            {t('translate.title')}
          </DialogTitle>
          <DialogDescription>{t('translate.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Textarea nhập văn bản cần dịch */}
          <Textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={t('translate.placeholder')}
            rows={6}
            className="resize-none"
            disabled={isStreaming}
          />

          {/* Select ngôn ngữ đích */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {t('translate.targetLanguage')}
            </label>
            <Select
              value={targetLang}
              onValueChange={setTargetLang}
              disabled={isStreaming}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_LANGUAGE_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {t(`translate.languages.${code}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select danh mục thuật ngữ */}
          {categories.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {t('translate.category')}
              </label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={isStreaming}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('translate.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('translate.allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isStreaming}
          >
            {t('translate.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!sourceText.trim() || isStreaming}
            className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border-0"
          >
            <Languages className="h-4 w-4" />
            {t('translate.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
