'use client';

import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './message-bubble';
import { EmptyState } from './empty-state';
import type { ChatMessage, Citation } from '@/types/chat';

interface ChatAreaProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  /** Callback khi người dùng click vào citation badge trong message */
  onCitationClick?: (docId: string) => void;
  /** Map doc_id → số thứ tự (1-based) — dùng cho Citations Panel (không dùng cho inline) */
  citationIndexMap?: Map<string, number>;
  /** SSE real-time citations — chỉ dùng cho message cuối đang stream */
  sseCitations?: Citation[];
  /** Phase 47 — Callback khi user thay đổi like/dislike */
  onFeedbackChange?: (messageId: string, feedbackType: 'like' | 'dislike' | null) => void;
  /** Phase 47 — Callback khi user submit feedback chi tiết */
  onFeedbackSubmit?: (messageId: string, tags: string[], text: string) => Promise<void>;
  /** Phase 47 — Callback khi user click retry */
  onRetry?: (assistantMessageId: string) => void;
  /** Callback khi user click vào message AI để xem citations của message đó */
  onMessageSelect?: (messageId: string | null) => void;
  /** ID của message AI đang được chọn — dùng để highlight */
  selectedMessageId?: string | null;
  /** Phase 65 — Callback khi user click suggestion card trong EmptyState */
  onSuggestionSelect?: (text: string) => void;
  /** Phase 70 — Đang generate session summary */
  isGeneratingSummary?: boolean;
  /** Phase 71 — Callback khi user click "Giải thích thêm" */
  onExplainMore?: (documentIds: string[], documentNames: string[]) => void;
  /** Phase 71 — Callback khi user click "Xem ví dụ" */
  onShowExample?: (documentIds: string[], documentNames: string[]) => void;
}

export function ChatArea({
  messages,
  isStreaming,
  isLoading,
  onCitationClick,
  citationIndexMap,
  sseCitations = [],
  onFeedbackChange,
  onFeedbackSubmit,
  onRetry,
  onMessageSelect,
  selectedMessageId,
  onSuggestionSelect,
  isGeneratingSummary,
  onExplainMore,
  onShowExample,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll xuống dưới khi có message mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        onSuggestionSelect={onSuggestionSelect ?? (() => {})}
        isStreaming={isStreaming}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0 bg-gradient-to-b from-background to-slate-50/50 dark:to-zinc-900/50">
      {(() => {
        // Index của ASSISTANT message cuối cùng — chỉ message này mới có nút Retry
        const lastAssistantIndex = messages.reduce(
          (last, m, i) => (m.role === 'ASSISTANT' ? i : last),
          -1,
        );
        return messages.map((message, index) => {
        // Message cuối cùng là ASSISTANT và đang stream → dùng plain text mode
        const isLastMessage = index === messages.length - 1;
        const isStreamingThisMessage =
          isStreaming && isLastMessage && message.role === 'ASSISTANT';

        // Citations per-message: mỗi message dùng sources riêng CỦA CHÍNH NÓ
        // SSE citations chỉ dùng cho message cuối khi đang stream (chưa lưu vào message.sources)
        const messageCitations: Citation[] = (() => {
          if (message.role !== 'ASSISTANT') return [];
          // Ưu tiên sources đã lưu trong message (from DB)
          if (message.sources && message.sources.length > 0) return message.sources;
          // Fallback: nếu đây là message cuối đang stream, dùng SSE citations
          if (isLastMessage && sseCitations.length > 0) return sseCitations;
          return [];
        })();

        // citationIndexMap per-message: tính từ citations riêng của message
        const msgCitationIndexMap = new Map<string, number>();
        messageCitations.forEach((c, i) => msgCitationIndexMap.set(c.doc_id, i + 1));

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreamingThisMessage}
            onCitationClick={onCitationClick}
            citationIndexMap={msgCitationIndexMap}
            citations={messageCitations}
            allMessages={messages}
            messageIndex={index}
            onFeedbackChange={onFeedbackChange}
            onFeedbackSubmit={onFeedbackSubmit}
            onRetry={
              onRetry && index === lastAssistantIndex
                ? () => onRetry(message.id)
                : undefined
            }
            globalIsStreaming={isStreaming}
            onMessageSelect={onMessageSelect}
            isSelected={selectedMessageId === message.id}
            onSuggestionSelect={onSuggestionSelect}
            onExplainMore={onExplainMore}
            onShowExample={onShowExample}
          />
        );
        });
      })()}
      {/* Phase 70 — Skeleton loading khi đang generate summary */}
      {isGeneratingSummary && (
        <div className="flex justify-start min-w-0">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-zinc-800 dark:to-zinc-800/80 border-l-4 border-l-amber-300 dark:border-l-amber-600">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
