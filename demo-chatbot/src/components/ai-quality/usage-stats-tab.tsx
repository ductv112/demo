'use client';

import { useState, useEffect, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UsageKpiCards } from '@/components/ai-quality/usage-kpi-cards';
import { UsageTrendChart } from '@/components/ai-quality/usage-trend-chart';
import { DepartmentBarChart } from '@/components/ai-quality/department-bar-chart';
import { IntentBreakdownChart } from '@/components/ai-quality/intent-breakdown-chart';
import { RetryRateKpi } from '@/components/ai-quality/retry-rate-kpi';
import { UserStatsTable } from '@/components/ai-quality/user-stats-table';
import { getUsageStats, getUsageTrend, getUsageByDepartment, getUsageByIntent } from '@/lib/ai-quality-api';
import { getDepartmentTree } from '@/lib/departments-api';
import type {
  UsageStats,
  UsageTrendItem,
  UsageByDeptItem,
  IntentBreakdownItem,  // Phase 20.1.1
  AiQualityPeriod,
} from '@/types/ai-quality';
import type { DepartmentTreeNode } from '@/types/department';

interface FlatDept {
  id: string;
  name: string;
  depth: number;
}

function flattenTree(nodes: DepartmentTreeNode[], depth = 0): FlatDept[] {
  const result: FlatDept[] = [];
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, depth });
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

interface UsageStatsTabProps {
  controlsRef?: RefObject<HTMLDivElement | null>;
  onPeriodChange?: (period: AiQualityPeriod) => void;
}

export function UsageStatsTab({ controlsRef, onPeriodChange }: UsageStatsTabProps) {
  const t = useTranslations('aiQuality');


  const AI_QUALITY_PERIODS: { value: AiQualityPeriod; label: string }[] = [
    { value: '7d', label: t('period7d') },
    { value: '30d', label: t('period30d') },
    { value: '3m', label: t('period3m') },
  ];

  // Filter state
  const [period, setPeriod] = useState<AiQualityPeriod>('30d');
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);

  // Data state
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [trendData, setTrendData] = useState<UsageTrendItem[]>([]);
  const [deptData, setDeptData] = useState<UsageByDeptItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);
  const [isLoadingDept, setIsLoadingDept] = useState(false);

  // Phase 20.1.1 — Intent breakdown
  const [intentData, setIntentData] = useState<IntentBreakdownItem[]>([]);
  const [intentTotal, setIntentTotal] = useState<number>(0);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);

  // Departments list for dropdown
  const [departments, setDepartments] = useState<FlatDept[]>([]);
  const [deptOpen, setDeptOpen] = useState(false);

  // Phase 72 — Notify parent khi period thay đổi (để sync exportPeriod)
  useEffect(() => {
    if (onPeriodChange) onPeriodChange(period);
  }, [period, onPeriodChange]);

  // Fetch department tree once on mount
  useEffect(() => {
    let cancelled = false;
    getDepartmentTree()
      .then((res) => { if (!cancelled) setDepartments(flattenTree(res.data)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Fetch stats + trend + dept data khi period hoặc departmentId thay đổi
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoadingStats(true);
      setIsLoadingTrend(true);
      setIsLoadingIntent(true);
      if (!departmentId) {
        setIsLoadingDept(true);
      }

      try {
        if (departmentId) {
          // Khi có departmentId: không fetch by-department (bar chart ẩn)
          // Dùng Promise.allSettled để lỗi 1 endpoint không làm hỏng các endpoint khác
          const results = await Promise.allSettled([
            getUsageStats(period, departmentId),
            getUsageTrend(period, departmentId),
            getUsageByIntent(period, departmentId),  // Phase 20.1.1
          ]);
          if (!cancelled) {
            if (results[0].status === 'fulfilled') setStats(results[0].value);
            if (results[1].status === 'fulfilled') setTrendData(results[1].value);
            if (results[2].status === 'fulfilled') {
              setIntentData(results[2].value.items);
              setIntentTotal(results[2].value.total);
            } else {
              // getUsageByIntent failed — reset to empty, không crash
              setIntentData([]);
              setIntentTotal(0);
            }
          }
        } else {
          // Khi không có departmentId: fetch cả 4
          // Dùng Promise.allSettled để lỗi 1 endpoint không làm hỏng các endpoint khác
          const results = await Promise.allSettled([
            getUsageStats(period),
            getUsageTrend(period),
            getUsageByDepartment(period),
            getUsageByIntent(period),  // Phase 20.1.1
          ]);
          if (!cancelled) {
            if (results[0].status === 'fulfilled') setStats(results[0].value);
            if (results[1].status === 'fulfilled') setTrendData(results[1].value);
            if (results[2].status === 'fulfilled') setDeptData(results[2].value);
            if (results[3].status === 'fulfilled') {
              setIntentData(results[3].value.items);
              setIntentTotal(results[3].value.total);
            } else {
              // getUsageByIntent failed — reset to empty, không crash
              setIntentData([]);
              setIntentTotal(0);
            }
          }
        }
      } catch {
        // Graceful — giữ data cũ
      } finally {
        if (!cancelled) {
          setIsLoadingStats(false);
          setIsLoadingTrend(false);
          setIsLoadingDept(false);
          setIsLoadingIntent(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [period, departmentId]);

  const controls = (
    <>
      <div
        className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 w-fit"
        data-testid="usage-period-filter"
      >
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
      <Popover open={deptOpen} onOpenChange={setDeptOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={deptOpen}
            className="w-[240px] justify-between font-normal text-sm"
            data-testid="usage-department-select"
          >
            <span className="truncate">
              {departmentId
                ? (departments.find((d) => d.id === departmentId)?.name ?? t('usage.filter.allDepartments'))
                : t('usage.filter.allDepartments')}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="end">
          <Command>
            <CommandInput placeholder="Tìm phòng ban..." className="h-9 text-xs" />
            <CommandList className="max-h-64 overflow-y-auto">
              <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
                Không tìm thấy phòng ban.
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__all__"
                  onSelect={() => { setDepartmentId(undefined); setDeptOpen(false); }}
                  className="text-xs"
                >
                  <Check className={cn('mr-2 h-3.5 w-3.5', !departmentId ? 'opacity-100' : 'opacity-0')} />
                  {t('usage.filter.allDepartments')}
                </CommandItem>
                {departments.map((d) => (
                  <CommandItem
                    key={d.id}
                    value={d.name}
                    onSelect={() => { setDepartmentId(d.id); setDeptOpen(false); }}
                    className="text-xs"
                  >
                    <Check className={cn('mr-2 h-3.5 w-3.5 shrink-0', departmentId === d.id ? 'opacity-100' : 'opacity-0')} />
                    <span style={{ paddingLeft: `${d.depth * 12}px` }}>
                      {d.depth > 0 && <span className="text-muted-foreground mr-1">└</span>}
                      {d.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );

  return (
    <div className="space-y-6">
      {controlsRef?.current && createPortal(controls, controlsRef.current)}

      {/* KPI Grid — 4 main KPIs + Retry rate card cùng hàng */}
      <UsageKpiCards stats={stats} isLoading={isLoadingStats}>
        <RetryRateKpi period={period} />
      </UsageKpiCards>

      {/* Charts */}
      {departmentId ? (
        // Khi chọn phòng ban: chỉ hiện trend chart (full width)
        <UsageTrendChart data={trendData} isLoading={isLoadingTrend} />
      ) : (
        // Khi chọn tất cả: hiện cả 2 charts song song
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageTrendChart data={trendData} isLoading={isLoadingTrend} />
          <DepartmentBarChart data={deptData} isLoading={isLoadingDept} />
        </div>
      )}

      {/* Phase 20.1.1 — Phân loại câu hỏi per D-08: full width dưới 2 charts */}
      <IntentBreakdownChart
        data={intentData}
        total={intentTotal}
        isLoading={isLoadingIntent}
      />

      {/* Phase 72 — User stats table */}
      <div>
        <UserStatsTable period={period} />
      </div>
    </div>
  );
}
