'use client';
/* Phase 47 — Feedback table: user query + AI answer columns */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ThumbsUp, ThumbsDown, Eye, Loader2 } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getMessageDetail } from '@/lib/ai-quality-api';
import type { AiQualityFeedback } from '@/types/ai-quality';

interface FeedbackTableProps {
  data: AiQualityFeedback[];
  meta: { page: number; limit: number; total: number; totalPages: number } | null;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Text bị truncate nếu kết thúc bằng "..." (backend cắt ở 200 chars) */
function isTruncated(text: string | null | undefined): boolean {
  return !!text && text.endsWith('...');
}

/** Cell hiển thị nội dung cắt ngắn + nút "Xem" khi đã bị backend truncate */
function ContentCell({
  text,
  onViewDetail,
  viewDetailTitle,
}: {
  text: string | null | undefined;
  onViewDetail: () => void;
  viewDetailTitle: string;
}) {
  if (!text) {
    return <span className="text-slate-300 italic">—</span>;
  }

  return (
    <div className="flex items-start gap-1">
      <p className="text-sm line-clamp-2 flex-1 min-w-0 text-slate-600">{text}</p>
      {isTruncated(text) && (
        <button
          type="button"
          onClick={onViewDetail}
          className="shrink-0 mt-0.5 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title={viewDetailTitle}
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function FeedbackTable({
  data,
  meta,
  page,
  onPageChange,
  search,
  onSearchChange,
  isLoading,
}: FeedbackTableProps) {
  const t = useTranslations('aiQuality');
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* State cho dialog xem chi tiết — gọi API lấy full content */
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    loading: boolean;
  }>({ open: false, title: '', content: '', loading: false });

  /** Mở dialog + gọi API lấy full content theo messageId */
  const openDetail = useCallback(
    async (messageId: string, field: 'userQuery' | 'content') => {
      const title = field === 'userQuery' ? t('table.detailQuestion') : t('table.detailAnswer');
      setDetailDialog({ open: true, title, content: '', loading: true });
      try {
        const detail = await getMessageDetail(messageId);
        setDetailDialog({
          open: true,
          title,
          content: (field === 'userQuery' ? detail.userQuery : detail.content) || '',
          loading: false,
        });
      } catch {
        setDetailDialog({
          open: true,
          title,
          content: t('table.cannotLoad'),
          loading: false,
        });
      }
    },
    [t],
  );

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('table.searchPlaceholder')}
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-center font-semibold text-[11px] uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  {t('table.colTime')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  {t('table.colUser')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[11px] uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  {t('table.colType')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                  {t('table.colQuestion')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                  {t('table.colAnswer')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                  {t('table.colTags')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                  {t('table.colFeedback')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Search className="h-8 w-8 opacity-30" />
                      <p className="text-sm">{t('table.noFeedback')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-center whitespace-nowrap text-xs text-slate-400 tabular-nums">
                      {formatDateTime(item.feedbackAt)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-700">
                        {item.user?.fullName || item.user?.email || 'N/A'}
                      </div>
                      {item.user?.fullName && item.user?.email && (
                        <div className="text-xs text-slate-400">{item.user.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.feedbackType === 'like' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <ThumbsUp className="h-3 w-3" />
                          {t('table.typeLike')}
                        </span>
                      ) : item.feedbackType === 'dislike' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600">
                          <ThumbsDown className="h-3 w-3" />
                          {t('table.typeDislike')}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <ContentCell
                        text={item.userQuery}
                        onViewDetail={() => openDetail(item.id, 'userQuery')}
                        viewDetailTitle={t('table.viewDetail')}
                      />
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <ContentCell
                        text={item.content}
                        onViewDetail={() => openDetail(item.id, 'content')}
                        viewDetailTitle={t('table.viewDetail')}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      {item.feedbackTags && item.feedbackTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.feedbackTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-[180px]">
                      {item.feedbackText ? (
                        <div className="flex items-start gap-1">
                          <p className="text-sm line-clamp-2 flex-1 min-w-0 text-slate-600">{item.feedbackText}</p>
                          {item.feedbackText.length > 80 && (
                            <button
                              type="button"
                              onClick={() =>
                                setDetailDialog({
                                  open: true,
                                  title: t('table.detailFeedback'),
                                  content: item.feedbackText!,
                                  loading: false,
                                })
                              }
                              className="shrink-0 mt-0.5 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                              title={t('table.viewDetail')}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-slate-400 text-xs">
              {t('table.total', { total: meta.total })}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                const totalPages = meta.totalPages;
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= meta.totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog xem chi tiết nội dung — gọi API lấy full content, render Markdown */}
      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) =>
          setDetailDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-2xl">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-slate-800">{detailDialog.title}</DialogTitle>
            <DialogDescription>{t('table.detailFullContent')}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto pr-2">
            {detailDialog.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-slate-400">{t('table.detailLoading')}</span>
              </div>
            ) : (
              <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                <MarkdownRenderer>
                  {detailDialog.content}
                </MarkdownRenderer>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
