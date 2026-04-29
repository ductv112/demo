'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  showing: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  label?: string;
}

/**
 * Shared pagination component với page number selector + page size selector
 * 
 * Layout:
 * [Hiển thị X / Y {label}] [Hiển thị: 10▾]     [◀ Trước] [1] [2] [3] ... [10] [Sau ▶]
 * 
 * Page number logic:
 * - Luôn hiển thị trang đầu (1), trang cuối (totalPages)
 * - Hiển thị 2 trang xung quanh trang hiện tại
 * - Dùng "..." (ellipsis) khi có khoảng trống
 * - Trang hiện tại highlight (variant="default")
 */
export function DataPagination({
  page,
  totalPages,
  total,
  limit,
  showing,
  onPageChange,
  onLimitChange,
  label = 'mục',
}: DataPaginationProps) {
  const t = useTranslations('common');

  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      // Hiển thị tất cả nếu <= 7 trang
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    
    // Luôn có trang 1
    pages.push(1);

    if (page <= 3) {
      // Gần đầu: [1] [2] [3] [4] ... [totalPages]
      pages.push(2, 3, 4);
      if (totalPages > 5) pages.push('ellipsis');
    } else if (page >= totalPages - 2) {
      // Gần cuối: [1] ... [totalPages-3] [totalPages-2] [totalPages-1] [totalPages]
      if (totalPages > 5) pages.push('ellipsis');
      pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      // Giữa: [1] ... [page-1] [page] [page+1] ... [totalPages]
      pages.push('ellipsis');
      pages.push(page - 1, page, page + 1);
      pages.push('ellipsis');
    }

    // Luôn có trang cuối (nếu chưa có)
    if (pages[pages.length - 1] !== totalPages) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between">
      {/* Left: Info + Page size selector */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          {t('pagination.showing', { showing, total, label })}
        </p>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('pagination.pageSize')}</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: Page navigation */}
      <div className="flex items-center gap-1.5">
        {/* Previous button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-40"
        >
          {t('pagination.previous')}
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((pageNum, index) =>
          pageNum === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground text-sm">
              ...
            </span>
          ) : (
            <Button
              key={pageNum}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-[36px]',
                pageNum === page
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm font-semibold'
                  : 'border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
              )}
            >
              {pageNum}
            </Button>
          )
        )}

        {/* Next button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-40"
        >
          {t('pagination.next')}
        </Button>
      </div>
    </div>
  );
}
