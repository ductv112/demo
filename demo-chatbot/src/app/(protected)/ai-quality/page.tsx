'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Download, Loader2, BarChart3, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SatisfactionKpi } from '@/components/ai-quality/satisfaction-kpi';
import { TrendChart } from '@/components/ai-quality/trend-chart';
import { FeedbackTable } from '@/components/ai-quality/feedback-table';
import { UsageStatsTab } from '@/components/ai-quality/usage-stats-tab';
import {
  getAiQualityStats,
  getAiQualityTrend,
  getAiQualityFeedbacks,
  exportAiQualityReport,
} from '@/lib/ai-quality-api';
import { usePermissions } from '@/hooks/use-permissions';
import type {
  AiQualityStats,
  AiQualityTrendItem,
  AiQualityFeedback,
  AiQualityPeriod,
  ReportType,
} from '@/types/ai-quality';

export default function AiQualityPage() {
  const t = useTranslations('aiQuality');
  const tExport = useTranslations('aiQuality.export');
  const { hasPermission } = usePermissions();
  const hasExportPermission = hasPermission('chat:report');

  const AI_QUALITY_PERIODS: { value: AiQualityPeriod; label: string }[] = [
    { value: '7d', label: t('period7d') },
    { value: '30d', label: t('period30d') },
    { value: '3m', label: t('period3m') },
  ];
  const [period, setPeriod] = useState<AiQualityPeriod>('30d');
  const [activeTab, setActiveTab] = useState('quality');
  const [isExporting, setIsExporting] = useState(false);
  const [usageTabPeriod, setUsageTabPeriod] = useState<AiQualityPeriod>('30d');
  const usageControlsRef = useRef<HTMLDivElement>(null);

  // Period sync theo tab đang active
  const exportPeriod: AiQualityPeriod = activeTab === 'usage' ? usageTabPeriod : period;

  const handleExport = async (type: ReportType) => {
    setIsExporting(true);
    try {
      await exportAiQualityReport(exportPeriod, type);
    } catch (err) {
      console.error('[AI Quality] Export failed:', err);
      toast.error(tExport('error'));
    } finally {
      setIsExporting(false);
    }
  };

  // Stats + Trend state
  const [stats, setStats] = useState<AiQualityStats | null>(null);
  const [trendData, setTrendData] = useState<AiQualityTrendItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<AiQualityFeedback[]>([]);
  const [feedbackMeta, setFeedbackMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

  // Fetch stats + trend khi period thay đổi
  useEffect(() => {
    let cancelled = false;

    const fetchStatsAndTrend = async () => {
      setIsLoadingStats(true);
      setIsLoadingTrend(true);
      try {
        const [statsData, trend] = await Promise.all([
          getAiQualityStats(period),
          getAiQualityTrend(period),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setTrendData(trend);
        }
      } catch {
        // Graceful — giữ data cũ
      } finally {
        if (!cancelled) {
          setIsLoadingStats(false);
          setIsLoadingTrend(false);
        }
      }
    };

    fetchStatsAndTrend();
    return () => { cancelled = true; };
  }, [period]);

  // Fetch feedbacks khi page hoặc search thay đổi
  const fetchFeedbacks = useCallback(async (page: number, search: string) => {
    setIsLoadingFeedbacks(true);
    try {
      const result = await getAiQualityFeedbacks(page, 20, search || undefined);
      setFeedbacks(result.data);
      setFeedbackMeta(result.meta);
    } catch {
      // Graceful
    } finally {
      setIsLoadingFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks(feedbackPage, feedbackSearch);
  }, [feedbackPage, feedbackSearch, fetchFeedbacks]);

  const handleSearchChange = (search: string) => {
    setFeedbackSearch(search);
    setFeedbackPage(1); // Reset về trang 1 khi search
  };

  return (
    <div className="p-6 bg-slate-50 h-full overflow-y-auto space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">{t('pageTitle')}</h1>
            <p className="text-slate-400 text-xs mt-0.5">{t('pageSubtitle')}</p>
          </div>
        </div>

        {hasExportPermission && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-testid="export-report-btn"
                disabled={isExporting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm h-9 px-4 shadow-sm"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tExport('exporting')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {tExport('button')}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                data-testid="export-type-full"
                onClick={() => handleExport('full')}
                disabled={isExporting}
              >
                {tExport('typeFull')}
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid="export-type-quality"
                onClick={() => handleExport('quality')}
                disabled={isExporting}
              >
                {tExport('typeQuality')}
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid="export-type-usage"
                onClick={() => handleExport('usage')}
                disabled={isExporting}
              >
                {tExport('typeUsage')}
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid="export-type-feedback"
                onClick={() => handleExport('feedback')}
                disabled={isExporting}
              >
                {tExport('typeFeedback')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Tabs defaultValue="quality" onValueChange={setActiveTab}>
        {/* ── Tab bar + period filter ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="bg-slate-100 h-auto p-0.5 rounded-lg gap-0.5 border-0">
            <TabsTrigger
              value="quality"
              className="rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5 text-sm font-semibold text-slate-500 transition-all"
            >
              {t('usage.qualityTabLabel')}
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="rounded-md data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5 text-sm font-semibold text-slate-500 transition-all"
            >
              {t('usage.tabLabel')}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 flex-wrap">
            {activeTab === 'quality' ? (
              <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                {AI_QUALITY_PERIODS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPeriod(p.value)}
                    className={cn(
                      'px-4 py-1.5 text-sm font-semibold rounded-md transition-all',
                      period === p.value
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <div ref={usageControlsRef} className="flex items-center gap-4" />
            )}
          </div>
        </div>

        <TabsContent value="quality" className="space-y-5 mt-5">
          {/* KPI Cards */}
          <SatisfactionKpi stats={stats} isLoading={isLoadingStats} />

          {/* Trend Chart */}
          <TrendChart data={trendData} isLoading={isLoadingTrend} />

          {/* Feedback Table */}
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-white pb-2 pt-5 px-6">
              <CardTitle className="text-base font-bold text-slate-800">{t('table.title')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 px-6 pb-6">
              <FeedbackTable
                data={feedbacks}
                meta={feedbackMeta}
                page={feedbackPage}
                onPageChange={setFeedbackPage}
                search={feedbackSearch}
                onSearchChange={handleSearchChange}
                isLoading={isLoadingFeedbacks}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-5">
          <UsageStatsTab
            controlsRef={usageControlsRef}
            onPeriodChange={setUsageTabPeriod}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
