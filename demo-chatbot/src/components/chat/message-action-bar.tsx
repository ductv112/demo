'use client';

import { Copy, ThumbsUp, ThumbsDown, MessageSquareMore, RefreshCw, BookOpen, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { FeedbackPopover } from './feedback-popover';

interface MessageActionBarProps {
  messageId: string;
  content: string;
  feedbackType: 'like' | 'dislike' | null;
  feedbackTags?: string[] | null;
  feedbackText?: string | null;
  onFeedbackChange: (messageId: string, feedbackType: 'like' | 'dislike' | null) => void;
  onFeedbackSubmit: (messageId: string, tags: string[], text: string) => Promise<void>;
  onRetry?: () => void;
  isStreaming?: boolean;
  /** Phase 71 — doc_ids extract từ message.sources, pass từ MessageBubble */
  sourceDocIds: string[];
  /** Phase 71 — tên file tương ứng với sourceDocIds (để citation hiển thị đúng tên) */
  sourceDocNames: string[];
  /** Phase 71 — documentIds + documentNames lấy từ message.sources của AI message trước đó */
  onExplainMore: (documentIds: string[], documentNames: string[]) => void;
  onShowExample: (documentIds: string[], documentNames: string[]) => void;
}

export function MessageActionBar({
  messageId,
  content,
  feedbackType,
  feedbackTags,
  feedbackText,
  onFeedbackChange,
  onFeedbackSubmit,
  onRetry,
  isStreaming = false,
  sourceDocIds,
  sourceDocNames,
  onExplainMore,
  onShowExample,
}: MessageActionBarProps) {
  const t = useTranslations('chat');
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(t('actions.copySuccess'));
    } catch {
      toast.error(t('actions.copyError'));
    }
  };

  const handleLike = () => {
    if (feedbackType === 'like') {
      // Toggle off
      onFeedbackChange(messageId, null);
    } else {
      // like (from null or dislike)
      onFeedbackChange(messageId, 'like');
    }
  };

  const handleDislike = () => {
    if (feedbackType === 'dislike') {
      // Toggle off
      onFeedbackChange(messageId, null);
    } else {
      // dislike (from null or like)
      onFeedbackChange(messageId, 'dislike');
    }
  };

  const hasFeedbackDetail = !!(feedbackText || (feedbackTags && feedbackTags.length > 0));

  return (
    <div className="flex items-center gap-0.5 mt-2">
      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        title={t('actions.copy')}
        className="rounded-md p-1.5 transition-colors text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/40"
      >
        <Copy size={15} />
      </button>

      {/* Like */}
      <button
        type="button"
        onClick={handleLike}
        title={t('actions.like')}
        className={cn(
          'rounded-md p-1.5 transition-colors',
          feedbackType === 'like'
            ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:text-zinc-500 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/40',
        )}
      >
        <ThumbsUp size={15} className={feedbackType === 'like' ? 'fill-current' : ''} />
      </button>

      {/* Dislike */}
      <button
        type="button"
        onClick={handleDislike}
        title={t('actions.dislike')}
        className={cn(
          'rounded-md p-1.5 transition-colors',
          feedbackType === 'dislike'
            ? 'text-rose-500 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40'
            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/40',
        )}
      >
        <ThumbsDown size={15} className={feedbackType === 'dislike' ? 'fill-current' : ''} />
      </button>

      {/* Feedback Popover */}
      <FeedbackPopover
        messageId={messageId}
        existingTags={feedbackTags}
        existingText={feedbackText}
        onSubmit={onFeedbackSubmit}
        trigger={
          <button
            type="button"
            title={t('actions.feedback')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              hasFeedbackDetail
                ? 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40'
                : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:text-zinc-500 dark:hover:text-violet-400 dark:hover:bg-violet-950/40',
            )}
          >
            <MessageSquareMore size={15} />
          </button>
        }
      />

      {/* Giải thích thêm */}
      <button
        type="button"
        onClick={() => onExplainMore(sourceDocIds, sourceDocNames)}
        title={t('actions.explainMore')}
        aria-label={t('actions.explainMore')}
        disabled={isStreaming}
        className="rounded-md p-1.5 transition-colors text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:text-zinc-500 dark:hover:text-sky-400 dark:hover:bg-sky-950/40 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <BookOpen size={15} />
      </button>

      {/* Xem ví dụ */}
      <button
        type="button"
        onClick={() => onShowExample(sourceDocIds, sourceDocNames)}
        title={t('actions.showExample')}
        aria-label={t('actions.showExample')}
        disabled={isStreaming}
        className="rounded-md p-1.5 transition-colors text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:text-zinc-500 dark:hover:text-amber-400 dark:hover:bg-amber-950/40 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Lightbulb size={15} />
      </button>

      {/* Retry — chỉ hiện ở message cuối */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          title={t('actions.retry')}
          disabled={isStreaming}
          className="rounded-md p-1.5 transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RefreshCw size={15} />
        </button>
      )}
    </div>
  );
}
