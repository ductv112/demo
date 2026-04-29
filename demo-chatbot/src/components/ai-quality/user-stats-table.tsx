'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserStats } from '@/lib/ai-quality-api';
import type { UserStatsItem, UserStatsSortBy } from '@/types/ai-quality';

interface UserStatsTableProps {
  period: string;
}

const COLUMNS: Array<{
  key: 'userName' | UserStatsSortBy;
  labelKey: string;
  sortable: boolean;
  align: 'left' | 'right' | 'center';
  sortValue?: UserStatsSortBy;
}> = [
  { key: 'userName',       labelKey: 'colUser',         sortable: false, align: 'left'   },
  { key: 'totalMessages',  labelKey: 'colMessages',      sortable: true,  align: 'right',  sortValue: 'totalMessages' },
  { key: 'totalSessions',  labelKey: 'colSessions',      sortable: true,  align: 'right',  sortValue: 'totalSessions' },
  { key: 'feedbackRate',   labelKey: 'colFeedbackRate',  sortable: true,  align: 'center', sortValue: 'feedbackRate' },
  { key: 'retryRate',      labelKey: 'colRetryRate',     sortable: true,  align: 'center', sortValue: 'retryRate' },
];

function feedbackBadgeClass(rate: number): string {
  if (rate >= 70) return 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50';
  if (rate >= 30) return 'bg-amber-50 text-amber-600 hover:bg-amber-50';
  return 'bg-slate-50 text-slate-500 hover:bg-slate-50';
}

function retryBadgeClass(rate: number): string {
  if (rate < 10) return 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50';
  if (rate <= 30) return 'bg-amber-50 text-amber-600 hover:bg-amber-50';
  return 'bg-red-50 text-red-500 hover:bg-red-50';
}

export function UserStatsTable({ period }: UserStatsTableProps) {
  const t = useTranslations('aiQuality.usage.userStats');
  const [data, setData] = useState<UserStatsItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<UserStatsSortBy>('totalMessages');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [period, sortBy, sortOrder]);

  useEffect(() => {
    setIsLoading(true);
    getUserStats(period, page, 20, sortBy, sortOrder)
      .then((result) => {
        setData(result.data);
        setMeta(result.meta);
      })
      .catch(() => {
        setData([]);
        setMeta({ page: 1, limit: 20, total: 0, totalPages: 1 });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [period, page, sortBy, sortOrder]);

  function handleSortClick(columnKey: UserStatsSortBy) {
    if (columnKey === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder('desc');
    }
  }

  function SortIcon({ colSortValue }: { colSortValue: UserStatsSortBy }) {
    if (colSortValue !== sortBy) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400 ml-1" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="h-3 w-3 text-slate-400 ml-1" />
      : <ArrowDown className="h-3 w-3 text-slate-400 ml-1" />;
  }

  return (
    <Card
      className="border-0 shadow-md rounded-2xl overflow-hidden"
      data-testid="user-stats-table"
    >
      <CardHeader className="bg-white pb-2 pt-5 px-6">
        <CardTitle className="text-base font-bold text-slate-800">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }
                >
                  {col.sortable && col.sortValue ? (
                    <button
                      className="inline-flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
                      data-testid={`sort-${col.sortValue}`}
                      onClick={() => handleSortClick(col.sortValue!)}
                    >
                      {t(col.labelKey as Parameters<typeof t>[0])}
                      <SortIcon colSortValue={col.sortValue} />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t(col.labelKey as Parameters<typeof t>[0])}
                    </span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  {t('noData')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((u) => (
                <TableRow key={u.userId} className="hover:bg-slate-50">
                  <TableCell className="text-left">
                    <div className="max-w-[200px] truncate text-slate-800 font-medium">
                      {u.userName}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-800">
                    {Number(u.totalMessages).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-800">
                    {Number(u.totalSessions).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={feedbackBadgeClass(u.feedbackRate)}>
                      {u.feedbackRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={retryBadgeClass(u.retryRate)}>
                      {u.retryRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {meta.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('prev')}
            </Button>
            <span className="text-slate-500">
              {page} / {meta.totalPages} · {t('total', { total: meta.total })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            >
              {t('next')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
