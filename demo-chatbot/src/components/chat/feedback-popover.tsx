'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FeedbackPopoverProps {
  messageId: string;
  existingTags?: string[] | null;
  existingText?: string | null;
  onSubmit: (messageId: string, tags: string[], text: string) => Promise<void>;
  trigger: React.ReactNode;
}

export function FeedbackPopover({
  messageId,
  existingTags,
  existingText,
  onSubmit,
  trigger,
}: FeedbackPopoverProps) {
  const t = useTranslations('chat');
  const QUICK_TAGS = [
    t('feedback.tags.inaccurate'),
    t('feedback.tags.irrelevant'),
    t('feedback.tags.tooLong'),
    t('feedback.tags.unclear'),
    t('feedback.tags.missingInfo'),
  ];
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTags ?? []);
  const [text, setText] = useState(existingText ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(messageId, selectedTags, text);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form về giá trị ban đầu
    setSelectedTags(existingTags ?? []);
    setText(existingText ?? '');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-3">
          <p className="text-sm font-medium">{t('feedback.title')}</p>

          {/* Quick tags */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-primary/10',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('feedback.placeholder')}
            rows={3}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
            >
              {t('feedback.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('feedback.submitting') : t('feedback.submit')}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
