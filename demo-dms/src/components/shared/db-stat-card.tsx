'use client';

/**
 * DbStatCard — KPI card nền trắng + background icon xoay khi hover.
 *
 * Port từ pattern pkkq-taichinhketoan/src/App.css (.db-stat-card + .db-bg-icon)
 * sang Tailwind/React cho pkkq-dms.
 *
 * Khi nào dùng:
 *   - `StatCard` (gradient) → hero KPI, spotlight metric (3-4 card nổi bật)
 *   - `DbStatCard` (white) → dashboard nhiều metric phụ (6-12 card), báo cáo
 *
 * Đặc điểm:
 *   - Nền trắng, border slate 80% opacity, rounded-[14px], shadow Level-1
 *   - Decorative icon 64x64 top-right opacity 8%, xoay 15° + scale 1.15 khi hover
 *   - Icon badge 40x40 top-left, tint theo prop `iconColor`
 *   - Hover: -translate-y-1, shadow navy Level-2
 */

import type { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export type DbStatCardIconColor =
  | 'navy'
  | 'gold'
  | 'success'
  | 'danger'
  | 'info'
  | 'violet'
  | 'cyan'
  | 'emerald';

interface DbStatCardColorSet {
  /** Hex cho icon, badge border, giá trị chính (nếu muốn tint) */
  fg: string;
  /** Background badge/icon tint (alpha đã áp dụng) */
  badgeBg: string;
  badgeBorder: string;
}

const COLOR_MAP: Record<DbStatCardIconColor, DbStatCardColorSet> = {
  navy: { fg: '#1B3A5C', badgeBg: 'rgba(27,58,92,0.10)', badgeBorder: 'rgba(27,58,92,0.30)' },
  gold: { fg: '#D4A843', badgeBg: 'rgba(212,168,67,0.12)', badgeBorder: 'rgba(212,168,67,0.35)' },
  success: { fg: '#52c41a', badgeBg: 'rgba(82,196,26,0.12)', badgeBorder: 'rgba(82,196,26,0.35)' },
  danger: { fg: '#ff4d4f', badgeBg: 'rgba(255,77,79,0.12)', badgeBorder: 'rgba(255,77,79,0.35)' },
  info: { fg: '#1890ff', badgeBg: 'rgba(24,144,255,0.12)', badgeBorder: 'rgba(24,144,255,0.35)' },
  violet: { fg: '#7c3aed', badgeBg: 'rgba(124,58,237,0.12)', badgeBorder: 'rgba(124,58,237,0.35)' },
  cyan: { fg: '#0891b2', badgeBg: 'rgba(8,145,178,0.12)', badgeBorder: 'rgba(8,145,178,0.35)' },
  emerald: { fg: '#059669', badgeBg: 'rgba(5,150,105,0.12)', badgeBorder: 'rgba(5,150,105,0.35)' },
};

interface DbStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor?: DbStatCardIconColor;
  loading?: boolean;
}

export function DbStatCard({
  label,
  value,
  unit,
  delta,
  deltaType = 'neutral',
  icon: Icon,
  iconColor = 'navy',
  loading = false,
}: DbStatCardProps) {
  const c = COLOR_MAP[iconColor];

  if (loading) {
    return (
      <div
        className="relative min-h-[124px] overflow-hidden rounded-[14px] border p-5 animate-pulse"
        style={{
          borderColor: 'rgba(226,232,240,0.8)',
          background: '#ffffff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div className="mb-3 h-3 w-28 rounded bg-slate-100" />
        <div className="mb-2 h-8 w-32 rounded bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-100" />
      </div>
    );
  }

  const DeltaIcon = deltaType === 'up' ? ArrowUp : deltaType === 'down' ? ArrowDown : Minus;
  const deltaColor =
    deltaType === 'up' ? '#389e0d' : deltaType === 'down' ? '#cf1322' : '#5b6b7f';

  return (
    <div
      className="group relative overflow-hidden rounded-[14px] border bg-white p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1"
      style={{
        borderColor: 'rgba(226,232,240,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.18)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
      }}
    >
      {/* Decorative background icon — xoay 15° khi hover */}
      <Icon
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:rotate-[15deg] group-hover:scale-[1.15]"
        strokeWidth={1.5}
        style={{ color: c.fg, opacity: 0.08 }}
      />

      {/* Icon badge top-left */}
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border"
        style={{ background: c.badgeBg, borderColor: c.badgeBorder }}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} style={{ color: c.fg }} />
      </div>

      {/* Label */}
      <div className="relative mb-1 text-[12px] font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </div>

      {/* Value */}
      <div className="relative flex items-baseline gap-1.5">
        <span
          className="text-[26px] font-bold leading-none tracking-tight tabular-nums"
          style={{ color: '#1B3A5C' }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[13px] font-normal leading-none text-slate-500">{unit}</span>
        )}
      </div>

      {/* Delta */}
      {delta && (
        <div
          className="relative mt-2 flex items-center gap-1 text-[11px] font-medium"
          style={{ color: deltaColor }}
        >
          <DeltaIcon className="h-3 w-3" strokeWidth={2.5} />
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}

export default DbStatCard;
