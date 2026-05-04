'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * SectionCard — Container chuẩn Doanh nghiệp A cho chart/table.
 * Port từ pattern Tài chính-Kế toán (.db-chart-card) sang Tailwind.
 *
 * - border-radius 14px (rounded-2xl)
 * - shadow: 0 2px 12px rgba(0,0,0,0.05), hover: 0 8px 24px rgba(27,58,92,0.1)
 * - Header: 32x32 gradient icon badge + bold navy title + optional right slot
 * - transition 0.3s cubic-bezier(0.4, 0, 0.2, 1)
 */

export type SectionCardGradient = 'navy' | 'gold' | 'success' | 'danger' | 'info' | 'purple' | 'teal';

const GRADIENT_MAP: Record<SectionCardGradient, string> = {
  navy: 'bg-gradient-to-br from-[#1B3A5C] to-[#2d5a8e]',
  gold: 'bg-gradient-to-br from-[#B8891C] to-[#D4A843]',
  success: 'bg-gradient-to-br from-[#389e0d] to-[#52c41a]',
  danger: 'bg-gradient-to-br from-[#cf1322] to-[#ff4d4f]',
  info: 'bg-gradient-to-br from-[#096dd9] to-[#1890ff]',
  purple: 'bg-gradient-to-br from-[#7c3aed] to-[#a78bfa]',
  teal: 'bg-gradient-to-br from-[#0891b2] to-[#67e8f9]',
};

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  gradient?: SectionCardGradient;
  /** Right-aligned header slot (badge, legend, actions...) */
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Set true nếu muốn body không có padding (ví dụ: table fill full-width) */
  flush?: boolean;
}

export function SectionCard({
  title,
  icon: Icon,
  gradient = 'navy',
  extra,
  children,
  className = '',
  flush = false,
}: SectionCardProps) {
  const iconGradient = GRADIENT_MAP[gradient];

  return (
    <section
      className={`bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_8px_24px_rgba(27,58,92,0.1)] hover:-translate-y-0.5 overflow-hidden ${className}`}
    >
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        {Icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${iconGradient}`}
          >
            <Icon className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        )}
        <h3 className="text-sm font-bold text-[#1B3A5C] flex-1 tracking-tight">{title}</h3>
        {extra && <div className="flex-shrink-0">{extra}</div>}
      </header>
      <div className={flush ? '' : 'px-5 pb-5'}>{children}</div>
    </section>
  );
}
