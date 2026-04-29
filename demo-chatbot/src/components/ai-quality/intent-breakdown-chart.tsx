'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IntentBreakdownItem } from '@/types/ai-quality';

// Bảng màu per UI-SPEC — không trùng blue-500 (#3b82f6) của bar chart
const INTENT_COLORS: Record<string, string> = {
  rag:       '#8b5cf6',  // violet-500
  summarize: '#06b6d4',  // cyan-500
  diff:      '#f59e0b',  // amber-500
  compare:   '#10b981',  // emerald-500
  translate: '#f97316',  // orange-500
  explain:   '#6366f1',  // indigo-500
  example:   '#14b8a6',  // teal-500
  chat:      '#ec4899',  // pink-500
  help:      '#84cc16',  // lime-500
  unknown:   '#9ca3af',  // gray-400
};

interface IntentBreakdownChartProps {
  data: IntentBreakdownItem[];
  total: number;
  isLoading: boolean;
}

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, label, color } = props as {
    cx: number; cy: number; midAngle: number; outerRadius: number;
    percent: number; label: string; color: string;
  };
  const radius = outerRadius * 1.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.03) return null;
  return (
    <text
      x={x}
      y={y}
      fill={color}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${label} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, t }: {
  active?: boolean;
  payload?: Array<{ payload: IntentBreakdownItem & { label: string; color: string } }>;
  t: ReturnType<typeof useTranslations>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3.5 text-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
          <p className="font-semibold text-slate-700">{item.label}</p>
        </div>
        <p className="text-slate-500 text-xs">
          {item.count.toLocaleString('vi-VN')} {t('usage.intent.tooltipSuffix')} ({item.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export function IntentBreakdownChart({ data, total, isLoading }: IntentBreakdownChartProps) {
  const t = useTranslations('aiQuality');

  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      label: t(`usage.intent.${item.intent}` as Parameters<typeof t>[0]) || item.intent,
      color: INTENT_COLORS[item.intent] ?? '#9ca3af',
    }));

  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden" data-testid="usage-intent-chart">
      <CardHeader className="bg-white pb-2 pt-5 px-6">
        <CardTitle className="text-base font-bold text-slate-800">{t('usage.intent.title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-6 px-6">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm text-center px-4">
            {t('usage.intent.noData')}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Pie chart */}
            <div className="w-full md:w-1/2 h-[320px]" aria-label="Biểu đồ phân loại câu hỏi">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="intent"
                    outerRadius="70%"
                    paddingAngle={2}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                    label={renderCustomLabel}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.intent} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip t={t} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bảng số liệu */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2.5 font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                      {t('usage.intent.colType')}
                    </th>
                    <th className="text-right py-2.5 font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                      {t('usage.intent.colCount')}
                    </th>
                    <th className="text-right py-2.5 font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                      {t('usage.intent.colPercent')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item) => (
                    <tr key={item.intent} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-slate-700 font-medium">{item.label}</span>
                        </div>
                      </td>
                      <td className="text-right py-2.5 text-slate-600 font-semibold tabular-nums">
                        {item.count.toLocaleString('vi-VN')}
                      </td>
                      <td className="text-right py-2.5 tabular-nums">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ backgroundColor: `${item.color}18`, color: item.color }}
                        >
                          {item.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200">
                    <td className="py-3 font-bold text-slate-800">{t('usage.intent.total')}</td>
                    <td className="text-right py-3 font-bold text-slate-800 tabular-nums">
                      {total.toLocaleString('vi-VN')}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
