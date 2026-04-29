'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  iconBgColor: string;
  loading?: boolean;
  periodLabel?: string;
}

// Map iconBgColor class → accent hex for the top strip
const COLOR_MAP: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-purple-500': '#a855f7',
  'bg-violet-600': '#7c3aed',
  'bg-green-500': '#22c55e',
  'bg-amber-500': '#f59e0b',
  'bg-red-500': '#ef4444',
  'bg-teal-500': '#14b8a6',
};

export function KpiCard({
  title,
  value,
  change,
  icon,
  iconBgColor,
  loading = false,
  periodLabel = 'SO VỚI THÁNG TRƯỚC',
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm overflow-hidden">
        <div className="h-1 bg-slate-100" />
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    );
  }

  const accentColor = COLOR_MAP[iconBgColor] ?? '#6b7280';

  const changeColor =
    change > 0
      ? 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200/60'
      : change < 0
        ? 'text-red-600 bg-red-50 ring-1 ring-red-200/60'
        : 'text-slate-500 bg-slate-50 ring-1 ring-slate-200/60';

  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const changePrefix = change > 0 ? '+' : '';

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-200">
      {/* Colored top accent strip */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-5">
        {/* Title + Icon row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">
            {title}
          </p>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor} shadow-sm`}
          >
            <div className="text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
          </div>
        </div>

        {/* Big number */}
        <p className="text-3xl font-black text-slate-800 tracking-tight tabular-nums mb-3">
          {value}
        </p>

        {/* Change badge + period */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${changeColor}`}
          >
            <ChangeIcon className="h-3 w-3" />
            {changePrefix}{Math.abs(change)}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium">{periodLabel}</span>
        </div>
      </div>
    </div>
  );
}
