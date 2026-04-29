'use client';

import { MessageSquare, Users, Calculator, Building2 } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import type { UsageStats } from '@/types/ai-quality';

interface UsageKpiCardsProps {
  stats: UsageStats | null;
  isLoading: boolean;
  children?: React.ReactNode;
}

interface UsageKpiCardProps {
  title: string;
  value: string;
  change: number | null;
  icon: React.ReactNode;
  borderColor: string;
  isLoading: boolean;
  periodLabel: string;
}

function UsageKpiCard({ title, value, change, icon, borderColor, isLoading, periodLabel }: UsageKpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: borderColor }} />
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
      </div>
    );
  }

  const isPositive = change !== null && change > 0;
  const isNegative = change !== null && change < 0;
  const ChangeIcon = change === null ? null : isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const changeBadgeClass = isPositive
    ? 'bg-emerald-50 text-emerald-600'
    : isNegative
      ? 'bg-red-50 text-red-500'
      : 'bg-slate-50 text-slate-500';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: borderColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-tight pt-1">
            {title}
          </p>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
            style={{ backgroundColor: borderColor }}
          >
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-800 mb-2">{value}</p>
        {ChangeIcon !== null && change !== null && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${changeBadgeClass}`}>
              <ChangeIcon className="h-3 w-3" />
              {change > 0 ? '+' : ''}{Math.abs(change)}%
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">{periodLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function UsageKpiCards({ stats, isLoading, children }: UsageKpiCardsProps) {
  const t = useTranslations('aiQuality');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" data-testid="usage-kpi-grid">
      <UsageKpiCard
        title={t('usage.kpi.totalQuestions')}
        value={isLoading || !stats ? '—' : stats.totalQuestions.value.toLocaleString('vi-VN')}
        change={stats ? stats.totalQuestions.change : null}
        icon={<MessageSquare className="h-5 w-5" />}
        borderColor="#3b82f6"
        isLoading={isLoading}
        periodLabel={t('usage.periodCompare')}
      />
      <UsageKpiCard
        title={t('usage.kpi.activeUsers')}
        value={isLoading || !stats ? '—' : stats.activeUsers.value.toLocaleString('vi-VN')}
        change={stats ? stats.activeUsers.change : null}
        icon={<Users className="h-5 w-5" />}
        borderColor="#10b981"
        isLoading={isLoading}
        periodLabel={t('usage.periodCompare')}
      />
      <UsageKpiCard
        title={t('usage.kpi.avgQuestionsPerUser')}
        value={isLoading || !stats ? '—' : stats.avgQuestionsPerUser.toFixed(1)}
        change={null}
        icon={<Calculator className="h-5 w-5" />}
        borderColor="#8b5cf6"
        isLoading={isLoading}
        periodLabel={t('usage.periodCompare')}
      />
      <UsageKpiCard
        title={t('usage.kpi.activeDepartments')}
        value={isLoading || !stats ? '—' : stats.activeDepartments.value.toLocaleString('vi-VN')}
        change={stats ? stats.activeDepartments.change : null}
        icon={<Building2 className="h-5 w-5" />}
        borderColor="#10b981"
        isLoading={isLoading}
        periodLabel={t('usage.periodCompare')}
      />
      {children}
    </div>
  );
}
