'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { FileBarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DocumentsChartData } from '@/types/dashboard';
import { useTranslations } from 'next-intl';
import { SectionCard } from '@/components/shared/section-card';
import { AXIS_PROPS, GRID_PROPS, LEGEND_STYLE, BAR_RADIUS, BAR_MAX_SIZE, PKKQ_CHART_COLORS } from '@/components/shared/chart-theme';

interface DocumentsChartProps {
  data: DocumentsChartData;
  loading?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  const t = useTranslations('dashboard');
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
    return (
      <div
        style={{
          background: '#ffffff',
          borderLeft: '3px solid #1B3A5C',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '12px 14px',
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          minWidth: 176,
        }}
      >
        <p style={{ color: '#1B3A5C', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p className="flex justify-between gap-4">
            <span style={{ color: PKKQ_CHART_COLORS.success, fontWeight: 500 }}>{t('chartTooltipCompleted')}</span>
            <span style={{ color: '#1B3A5C', fontWeight: 700 }}>{payload.find((p: any) => p.dataKey === 'completed')?.value || 0}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span style={{ color: PKKQ_CHART_COLORS.warning, fontWeight: 500 }}>{t('chartTooltipProcessing')}</span>
            <span style={{ color: '#1B3A5C', fontWeight: 700 }}>{payload.find((p: any) => p.dataKey === 'processing')?.value || 0}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span style={{ color: PKKQ_CHART_COLORS.danger, fontWeight: 500 }}>{t('chartTooltipFailed')}</span>
            <span style={{ color: '#1B3A5C', fontWeight: 700 }}>{payload.find((p: any) => p.dataKey === 'failed')?.value || 0}</span>
          </p>
        </div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: PKKQ_CHART_COLORS.muted }}>{t('chartTooltipTotal')}</span>
          <span style={{ color: '#1B3A5C', fontWeight: 700 }}>{total}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function DocumentsChart({ data, loading = false }: DocumentsChartProps) {
  const t = useTranslations('dashboard');

  if (loading) {
    return (
      <SectionCard title={t('documentsChart')} icon={FileBarChart} gradient="navy" className="h-full">
        <Skeleton className="w-full rounded-xl min-h-[280px]" />
      </SectionCard>
    );
  }

  const chartData = data.labels.map((label, i) => ({
    label,
    completed: data.completed[i] || 0,
    processing: data.processing[i] || 0,
    failed: data.failed[i] || 0,
  }));

  return (
    <SectionCard title={t('documentsChart')} icon={FileBarChart} gradient="navy" className="h-full">
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm min-h-[280px]">
          {t('documentsChartEmpty')}
        </div>
      ) : (
        <div className="min-h-[280px] h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} width={32} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(27,58,92,0.04)' }} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={LEGEND_STYLE}
              />
              <Bar dataKey="completed" name={t('chartCompleted')} stackId="status" fill={PKKQ_CHART_COLORS.success} radius={[0, 0, 0, 0]} maxBarSize={BAR_MAX_SIZE} />
              <Bar dataKey="processing" name={t('chartProcessing')} stackId="status" fill={PKKQ_CHART_COLORS.gold} maxBarSize={BAR_MAX_SIZE} />
              <Bar dataKey="failed" name={t('chartFailed')} stackId="status" fill={PKKQ_CHART_COLORS.danger} radius={BAR_RADIUS} maxBarSize={BAR_MAX_SIZE} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
