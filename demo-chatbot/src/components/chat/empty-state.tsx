'use client';

import { Search, FileText, Languages, GitCompareArrows, MessageSquare, CircleHelp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SuggestionCard {
  icon: LucideIcon;
  label: string;
  sample: string;
  colorClass: string;
}

const SUGGESTION_CARDS: SuggestionCard[] = [
  { icon: Search, label: 'Tìm tài liệu', sample: 'Tìm tài liệu về quy trình nghiệm thu', colorClass: 'text-blue-500' },
  { icon: FileText, label: 'Tóm tắt', sample: 'Tóm tắt tài liệu đang xem cho tôi', colorClass: 'text-amber-500' },
  { icon: Languages, label: 'Dịch thuật', sample: 'Dịch sang tiếng Anh đoạn văn bản sau:', colorClass: 'text-green-500' },
  { icon: GitCompareArrows, label: 'So sánh phiên bản', sample: 'So sánh phiên bản v1 và v2 của tài liệu', colorClass: 'text-purple-500' },
  { icon: MessageSquare, label: 'Hỏi về tài liệu', sample: 'Tài liệu này nói về nội dung gì?', colorClass: 'text-indigo-500' },
  { icon: CircleHelp, label: 'Hướng dẫn sử dụng', sample: 'Bạn có thể làm những gì?', colorClass: 'text-rose-500' },
];

interface EmptyStateProps {
  onSuggestionSelect: (text: string) => void;
  isStreaming?: boolean;
}

export function EmptyState({ onSuggestionSelect, isStreaming = false }: EmptyStateProps) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background via-amber-50/20 to-indigo-50/20 dark:from-background dark:via-zinc-900 dark:to-zinc-900">
      {/* Icon hero */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 to-indigo-200 dark:from-amber-900/40 dark:to-indigo-900/40 blur-xl scale-150 opacity-60" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-indigo-100 dark:from-amber-900/50 dark:to-indigo-900/50 flex items-center justify-center shadow-lg border border-amber-200/60 dark:border-amber-700/40">
          <MessageSquare className="h-9 w-9 text-indigo-500 dark:text-indigo-400" />
        </div>
      </div>

      {/* Heading + subtext */}
      <p className="text-base font-semibold text-foreground/70 mb-1">
        Chào mừng bạn đến với DMS Chatbot
      </p>
      <p className="text-sm text-muted-foreground/60 max-w-xs mb-6">
        Chọn một gợi ý bên dưới hoặc nhập câu hỏi của bạn
      </p>

      {/* Suggestion cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {SUGGESTION_CARDS.map((card, index) => (
          <button
            key={card.label}
            data-testid={`suggestion-card-${index}`}
            onClick={() => onSuggestionSelect(card.sample)}
            disabled={isStreaming}
            className="text-left p-4 rounded-xl border border-border hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20 transition-all duration-150 w-full min-h-[44px] group disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <card.icon className={`h-4 w-4 ${card.colorClass}`} aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground/80">{card.label}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-snug mt-1">{card.sample}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
