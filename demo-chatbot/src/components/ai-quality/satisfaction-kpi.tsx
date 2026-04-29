'use client';

import { ThumbsUp, BarChart3, MessageSquareMore } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import type { AiQualityStats } from '@/types/ai-quality';

interface SatisfactionKpiProps {
  stats: AiQualityStats | null;
  isLoading: boolean;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  isLoading: boolean;
}

function KpiCard({ title, value, subtitle, icon, iconBg, borderColor, isLoading }: KpiCardProps) {
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
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    );
  }

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
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export function SatisfactionKpi({ stats, isLoading }: SatisfactionKpiProps) {
  const t = useTranslations('aiQuality');
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KpiCard
        title={t('kpi.satisfactionRate')}
        value={isLoading || !stats ? '—' : `${stats.satisfactionRate.toFixed(1)}%`}
        subtitle={stats ? t('kpi.satisfactionSubtitle', { likes: stats.likes, dislikes: stats.dislikes }) : undefined}
        icon={<ThumbsUp className="h-5 w-5" />}
        iconBg="bg-emerald-500"
        borderColor="#10b981"
        isLoading={isLoading}
      />
      <KpiCard
        title={t('kpi.totalRated')}
        value={isLoading || !stats ? '—' : stats.totalRated.toLocaleString('vi-VN')}
        subtitle={stats ? t('kpi.totalRatedSubtitle') : undefined}
        icon={<BarChart3 className="h-5 w-5" />}
        iconBg="bg-blue-500"
        borderColor="#3b82f6"
        isLoading={isLoading}
      />
      <KpiCard
        title={t('kpi.feedbackDetailRate')}
        value={isLoading || !stats ? '—' : `${stats.feedbackDetailRate.toFixed(1)}%`}
        subtitle={stats ? t('kpi.feedbackDetailSubtitle') : undefined}
        icon={<MessageSquareMore className="h-5 w-5" />}
        iconBg="bg-violet-500"
        borderColor="#8b5cf6"
        isLoading={isLoading}
      />
    </div>
  );
}
