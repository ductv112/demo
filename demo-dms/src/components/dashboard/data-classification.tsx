'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { DataClassification as DataClassificationType } from '@/types/dashboard';
import { useTranslations } from 'next-intl';
import { Tags } from 'lucide-react';
import { SectionCard } from '@/components/shared/section-card';

interface DataClassificationProps {
  data: DataClassificationType;
  loading?: boolean;
}

// Bảng màu theo palette Doanh nghiệp A — navy, gold, success, warning, danger, info
const BAR_COLORS = ['#1B3A5C', '#D4A843', '#52c41a', '#faad14', '#ff4d4f', '#1890ff'];

export function DataClassification({ data, loading = false }: DataClassificationProps) {
  const t = useTranslations('dashboard');

  if (loading) {
    return (
      <SectionCard title={t('dataClassification')} icon={Tags} gradient="gold" className="h-full">
        <div className="flex-1 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={t('dataClassification')} icon={Tags} gradient="gold" className="h-full">
      {data.items.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-slate-400 text-sm">
          {t('dataClassificationEmpty')}
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {data.items.map((item, idx) => {
              const color = BAR_COLORS[idx % BAR_COLORS.length];
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-700 tabular-nums">{item.count}</span>
                  </div>
                  {/* Custom progress bar thay vì shadcn Progress */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">{item.percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">{t('dataClassificationTotal')}</span>
              <span className="text-base font-black text-[#1B3A5C] tabular-nums">{data.total}</span>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
