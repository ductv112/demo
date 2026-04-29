'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getRetryStats } from '@/lib/ai-quality-api';
import type { RetryStats } from '@/types/ai-quality';

interface RetryRateKpiProps {
  period: string;   // '7d' | '30d' | '3m'
}

interface TrendBadgeProps {
  change: number;
  compareLabel: string;
}

function TrendBadge({ change, compareLabel }: TrendBadgeProps) {
  if (change > 0) {
    // retry tăng = XẤU → đỏ
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{change}%
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{compareLabel}</span>
      </div>
    );
  }
  // retry giảm = TỐT → xanh
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
        <TrendingDown className="w-3 h-3 mr-1" />
        {change}%
      </span>
      <span className="text-xs text-slate-400 uppercase tracking-wider">{compareLabel}</span>
    </div>
  );
}

export function RetryRateKpi({ period }: RetryRateKpiProps) {
  const t = useTranslations('aiQuality.usage.retry');
  const [stats, setStats] = useState<RetryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getRetryStats(period)
      .then((result) => {
        setStats(result);
      })
      .catch(() => {
        setStats(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [period]);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      data-testid="retry-rate-kpi"
    >
      <div className="h-1 w-full" style={{ backgroundColor: '#f97316' }} />
      <div className="p-5">
        {isLoading ? (
          <>
            <Skeleton className="h-3 w-32 mb-3" />
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-5 w-28" />
          </>
        ) : (
          <>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('kpiTitle')}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(249, 115, 22, 0.12)' }}
              >
                <RotateCcw className="w-5 h-5" style={{ color: '#f97316' }} />
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {stats ? `${stats.retryRate}%` : '—'}
              </div>
            </div>
            {stats && Number.isFinite(stats.retryRateChange) && stats.retryRateChange !== 0 ? (
              <TrendBadge change={stats.retryRateChange} compareLabel={t('compareLabel')} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
