'use client';

import { useRef, useEffect, useState } from 'react';
import { FileText, MessageSquareText, ChevronDown, ChevronUp, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Citation } from '@/types/chat';
import { getFileIconByExtension } from '@/lib/file-icon';

interface CitationCardProps {
  citation: Citation;
  /** Số thứ tự (1-based) — khớp với badge trong chat */
  index?: number;
  /** true khi card này đang được highlight (sau khi click badge) */
  isHighlighted?: boolean;
  /** Callback khi click card để mở preview tài liệu */
  onDocumentOpen?: (docId: string) => void;
}

/** Trả về class màu thanh progress theo mức độ liên quan — muted, không chói */
function getRelevanceBarClass(percent: number): string {
  if (percent >= 85) return 'bg-emerald-500/80';
  if (percent >= 70) return 'bg-teal-500/80';
  if (percent >= 55) return 'bg-amber-400/80';
  return 'bg-rose-400/80';
}

/** Màu chữ phần trăm theo mức độ liên quan */
function getRelevanceTextClass(percent: number): string {
  if (percent >= 85) return 'text-emerald-700 dark:text-emerald-400';
  if (percent >= 70) return 'text-teal-700 dark:text-teal-400';
  if (percent >= 55) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export function CitationCard({ citation, index, isHighlighted = false, onDocumentOpen }: CitationCardProps) {
  const t = useTranslations('chat');
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-scroll card vào view khi được highlight
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isHighlighted]);

  const { icon: Icon, color } = getFileIconByExtension(citation.file_name);
  const relevancePercent = Math.round(citation.score * 100);
  const isSummarize = citation.citation_type === 'summarize';
  const isTranslate = citation.citation_type === 'translate';
  const hasLongText = citation.chunk_text && citation.chunk_text.length > 200;

  const handleCardClick = () => {
    if (citation.chunk_text) {
      setIsExpanded(!isExpanded);
    } else {
      onDocumentOpen?.(citation.doc_id);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      className={`border rounded-lg p-3 space-y-2 transition-all duration-300 ${citation.chunk_text ? 'cursor-pointer' : 'cursor-pointer'}
        ${
          isHighlighted
            ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-400 ring-2 ring-indigo-300/40 shadow-md'
            : 'bg-background hover:bg-slate-50 dark:hover:bg-zinc-800/50'
        }`}
    >
      {/* Row 1: Index badge + Icon + tên file + type badge */}
      <div className="flex items-center gap-2 min-w-0">
        {index !== undefined && (
          <span
            className="text-[10px] font-bold bg-gradient-to-br from-indigo-600 to-violet-600 text-white
              rounded-full w-4 h-4 inline-flex items-center justify-center shrink-0"
          >
            {index}
          </span>
        )}
        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
        <span className="font-medium text-sm truncate flex-1" title={citation.file_name}>
          {citation.file_name}
        </span>
        {/* Badge phân biệt loại citation */}
        {isSummarize ? (
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
            <FileText className="h-2.5 w-2.5" />
            {t('citations.summary')}
          </span>
        ) : isTranslate ? (
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
            <Languages className="h-2.5 w-2.5" />
            {t('citations.glossary')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
            <MessageSquareText className="h-2.5 w-2.5" />
            {t('citations.reference')}
          </span>
        )}
      </div>

      {/* Row 2: Đoạn trích nguyên văn (chunk_text) — expand/collapse khi click */}
      {citation.chunk_text && (
        <div className="bg-muted/50 rounded-r-md px-3 py-2 text-xs leading-relaxed text-muted-foreground italic border-l-2 border-amber-400/60 transition-all duration-200">
          <p className={isExpanded ? '' : 'line-clamp-4'} style={{ wordBreak: 'break-word' }}>
            &ldquo;{citation.chunk_text}&rdquo;
          </p>
          {hasLongText && (
            <div className="flex items-center justify-center mt-1">
              {isExpanded
                ? <ChevronUp className="h-3 w-3 text-muted-foreground" />
                : <ChevronDown className="h-3 w-3 text-muted-foreground" />
              }
            </div>
          )}
        </div>
      )}

      {/* Row 3: Số trang (nếu có) */}
      {citation.page_numbers && citation.page_numbers.length > 0 && (
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {t('citations.page', { pages: citation.page_numbers.join(', ') })}
        </p>
      )}

      {/* Row 4: Progress bar độ liên quan — ẩn cho glossary (translate) vì score luôn = 1.0 */}
      {!isTranslate && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {t('citations.relevance')}
            </span>
            <span className={`text-xs font-semibold ${getRelevanceTextClass(relevancePercent)}`}>{relevancePercent}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getRelevanceBarClass(relevancePercent)}`}
              style={{ width: `${relevancePercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Nút xem tài liệu gốc — ẩn cho glossary (translate) vì không phải tài liệu DMS */}
      {onDocumentOpen && !isTranslate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDocumentOpen(citation.doc_id);
          }}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline text-left w-full font-medium"
        >
          {t('citations.viewDocument')}
        </button>
      )}
    </div>
  );
}
