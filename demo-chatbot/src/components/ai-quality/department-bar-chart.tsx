'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UsageByDeptItem } from '@/types/ai-quality';

interface DepartmentBarChartProps {
  data: UsageByDeptItem[];
  isLoading: boolean;
  highlightDeptId?: string;
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: { departmentName: string; totalQuestions: number } }>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3.5 text-sm">
        <p className="font-semibold text-slate-700 mb-1.5">{item.departmentName}</p>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-slate-600 text-xs">{item.totalQuestions.toLocaleString('vi-VN')} câu hỏi</span>
        </div>
      </div>
    );
  }
  return null;
};

export function DepartmentBarChart({ data, isLoading, highlightDeptId }: DepartmentBarChartProps) {
  const t = useTranslations('aiQuality');

  const chartData = [...data]
    .sort((a, b) => b.totalQuestions - a.totalQuestions)
    .map((item) => ({
      ...item,
      departmentName:
        item.departmentName.length > 20
          ? item.departmentName.slice(0, 18) + '...'
          : item.departmentName,
    }));

  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden" data-testid="usage-department-chart">
      <CardHeader className="bg-white pb-2 pt-5 px-6">
        <CardTitle className="text-base font-bold text-slate-800">{t('usage.byDept.title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-5 px-4">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 gap-3">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-25">
              <rect x="6" y="28" width="8" height="14" rx="2" fill="currentColor"/>
              <rect x="20" y="18" width="8" height="24" rx="2" fill="currentColor"/>
              <rect x="34" y="10" width="8" height="32" rx="2" fill="currentColor"/>
            </svg>
            <p className="text-sm">{t('usage.byDept.noData')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="barGradientHighlight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis
                type="category"
                dataKey="departmentName"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="totalQuestions" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.departmentId}
                    fill={
                      highlightDeptId && entry.departmentId === highlightDeptId
                        ? 'url(#barGradientHighlight)'
                        : 'url(#barGradient)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
