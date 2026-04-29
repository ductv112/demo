'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UsageTrendItem } from '@/types/ai-quality';

interface UsageTrendChartProps {
  data: UsageTrendItem[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3.5 text-sm min-w-[140px]">
        <p className="font-semibold text-slate-500 mb-2 text-[11px] uppercase tracking-wider">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-slate-600 text-xs">{p.name}</span>
            </div>
            <span className="font-bold text-slate-800">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

export function UsageTrendChart({ data, isLoading }: UsageTrendChartProps) {
  const t = useTranslations('aiQuality');
  const chartData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden" data-testid="usage-trend-chart">
      <CardHeader className="bg-white pb-2 pt-5 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800">{t('usage.trend.title')}</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-[3px] rounded-full bg-blue-500" />
            <span>{t('usage.trend.questions')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 pb-5 px-4">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 gap-3">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-25">
              <path d="M6 36L18 24L26 32L36 18L42 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm">{t('usage.trend.noData')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="questionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={30}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="total"
                name={t('usage.trend.questions')}
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#questionGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
