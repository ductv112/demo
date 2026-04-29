'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

/**
 * StatCard — Gradient KPI card chuẩn PKKQ.
 * Port từ pattern pkkq-taichinhketoan (.db-stat-card) sang Tailwind.
 *
 * - Full-card gradient background theo prop `gradient`
 * - Decorative background icon (64px) top-right, opacity 10%, xoay khi hover
 * - Icon badge top-left 32x32, bg white/20
 * - Hover: translateY(-4px) + shadow enhance
 */

export type StatCardGradient = 'navy' | 'gold' | 'success' | 'danger' | 'info';

const GRADIENT_MAP: Record<StatCardGradient, string> = {
  navy: 'from-[#1B3A5C] to-[#2d5a8e]',
  gold: 'from-[#B8891C] to-[#D4A843]',
  success: 'from-[#389e0d] to-[#52c41a]',
  danger: 'from-[#cf1322] to-[#ff4d4f]',
  info: 'from-[#096dd9] to-[#1890ff]',
};

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  /** Text hiển thị dưới value (ví dụ: "+12% so với tháng trước") */
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  gradient?: StatCardGradient;
  /** Skeleton state khi đang loading */
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaType = 'neutral',
  icon: Icon,
  gradient = 'navy',
  loading = false,
}: StatCardProps) {
  const gradientClass = GRADIENT_MAP[gradient];

  if (loading) {
    return (
      <div
        className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradientClass} text-white shadow-[0_2px_12px_rgba(27,58,92,0.12)] min-h-[128px] animate-pulse`}
      >
        <div className="h-3 w-24 bg-white/20 rounded mb-4" />
        <div className="h-8 w-32 bg-white/30 rounded mb-3" />
        <div className="h-3 w-28 bg-white/15 rounded" />
      </div>
    );
  }

  const DeltaIcon = deltaType === 'up' ? ArrowUp : deltaType === 'down' ? ArrowDown : Minus;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradientClass} text-white shadow-[0_2px_12px_rgba(27,58,92,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(27,58,92,0.25)] cursor-default`}
    >
      {/* Decorative background icon — xoay khi hover */}
      <Icon
        className="absolute -top-2 -right-2 w-16 h-16 text-white opacity-10 transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110 pointer-events-none"
        strokeWidth={1.5}
        aria-hidden
      />

      {/* Row 1: icon badge + label */}
      <div className="flex items-center gap-2.5 mb-3 relative">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
          <Icon className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="relative flex items-baseline gap-1.5 mb-1.5">
        <span className="text-[26px] font-bold leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[13px] font-normal text-white/70 leading-none">{unit}</span>
        )}
      </div>

      {/* Delta */}
      {delta && (
        <div className="relative flex items-center gap-1.5 text-[11px] text-white/75 font-medium">
          <DeltaIcon className="w-3 h-3" strokeWidth={2.5} />
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}
