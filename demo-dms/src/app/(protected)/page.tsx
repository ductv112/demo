'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, HardDrive, Users, Brain } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { toast } from 'sonner';
import {
  getDashboardStats,
  getDocumentsChart,
  getDataClassification,
  getRecentDocuments,
  getActivityFeed,
} from '@/lib/dashboard-api';
import type {
  DashboardStats,
  DocumentsChartData,
  DataClassification,
  RecentDocument,
  ActivityItem,
  DashboardPeriod,
} from '@/types/dashboard';
import { TimeFilter } from '@/components/dashboard/time-filter';
import { DocumentsChart } from '@/components/dashboard/documents-chart';
import { DataClassification as DataClassificationWidget } from '@/components/dashboard/data-classification';
import { RecentDocuments } from '@/components/dashboard/recent-documents';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { UserDashboard } from '@/components/dashboard/user-dashboard';
import { StatCard } from '@/components/shared/stat-card';
import { useTranslations } from 'next-intl';

/** Build chuỗi delta kiểu "+12% so với tháng trước" cho StatCard */
function buildDelta(change: number, periodLabel: string): { text: string; type: 'up' | 'down' | 'neutral' } {
  if (change > 0) return { text: `+${change}% ${periodLabel.toLowerCase()}`, type: 'up' };
  if (change < 0) return { text: `${change}% ${periodLabel.toLowerCase()}`, type: 'down' };
  return { text: `Không đổi ${periodLabel.toLowerCase()}`, type: 'neutral' };
}

function formatStorageValue(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const EMPTY_STATS: DashboardStats = {
  totalDocuments: { value: 0, change: 0 },
  storageUsed: { value: 0, change: 0 },
  onlineUsers: { value: 0, change: 0 },
  aiRequests: { value: 0, change: 0 },
};

const EMPTY_CHART: DocumentsChartData = { labels: [], total: [], completed: [], processing: [], failed: [] };
const EMPTY_CLASSIFICATION: DataClassification = { items: [], total: 0 };

// ============================================================
// Admin Dashboard
// ============================================================
function AdminDashboard({
  period,
  departmentId,
  onPeriodChange,
  onDepartmentChange,
}: {
  period: DashboardPeriod;
  departmentId: string | undefined;
  onPeriodChange: (p: DashboardPeriod) => void;
  onDepartmentChange: (d: string | undefined) => void;
}) {
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [chartData, setChartData] = useState<DocumentsChartData>(EMPTY_CHART);
  const [classification, setClassification] = useState<DataClassification>(EMPTY_CLASSIFICATION);
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingClassification, setLoadingClassification] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // KPI polling interval ref
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PERIOD_LABELS: Record<DashboardPeriod, string> = {
    day: t('periodDay'),
    week: t('periodWeek'),
    month: t('periodMonth'),
    quarter: t('periodQuarter'),
  };

  const fetchAllData = useCallback(
    async (p: DashboardPeriod, deptId?: string, silentStats = false) => {
      if (!silentStats) {
        setLoadingStats(true);
        setLoadingChart(true);
        setLoadingClassification(true);
        setLoadingRecent(true);
        setLoadingActivity(true);
      }

      try {
        const promises: Promise<any>[] = [
          getDashboardStats(p, deptId),
          getDocumentsChart(p, deptId),
          getDataClassification(p, deptId),
          getRecentDocuments(deptId),
          getActivityFeed(),
        ];

        const results = await Promise.allSettled(promises);

        if (results[0].status === 'fulfilled') setStats(results[0].value);
        else if (!silentStats) toast.error(t('statsError'));
        setLoadingStats(false);

        if (results[1].status === 'fulfilled') setChartData(results[1].value);
        else if (!silentStats) toast.error(t('chartError'));
        setLoadingChart(false);

        if (results[2].status === 'fulfilled') setClassification(results[2].value);
        setLoadingClassification(false);

        if (results[3].status === 'fulfilled') setRecentDocs(results[3].value);
        setLoadingRecent(false);

        if (results[4].status === 'fulfilled') setActivities(results[4].value);
        setLoadingActivity(false);
      } catch {
        if (!silentStats) toast.error(t('serverError'));
        setLoadingStats(false);
        setLoadingChart(false);
        setLoadingClassification(false);
        setLoadingRecent(false);
        setLoadingActivity(false);
      }
    },
    [t],
  );

  // Initial + filter change fetch
  useEffect(() => {
    fetchAllData(period, departmentId, false);

    // Reset polling interval khi filter thay đổi
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      // Silent KPI update mỗi 60 giây (không loading spinner)
      getDashboardStats(period, departmentId)
        .then((newStats) => setStats(newStats))
        .catch(() => {
          // Silent fail — không hiển thị toast khi polling
        });
    }, 60000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [period, departmentId, fetchAllData]);

  const periodLabel = PERIOD_LABELS[period];

  return (
    <div className="p-6 bg-slate-50 h-full overflow-y-auto space-y-6">
      {/* Header + Time Filter — navy accent */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5C] tracking-tight">{t('adminTitle')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('adminSubtitle')}
          </p>
        </div>
        <TimeFilter
          period={period}
          onPeriodChange={onPeriodChange}
          departmentId={departmentId}
          onDepartmentChange={onDepartmentChange}
          showDepartmentFilter={true}
        />
      </div>

      {/* Row 1: 4 Gradient StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const totalDocsDelta = buildDelta(stats.totalDocuments.change, periodLabel);
          const storageDelta = buildDelta(stats.storageUsed.change, periodLabel);
          const onlineDelta = buildDelta(stats.onlineUsers.change, periodLabel);
          const aiDelta = buildDelta(stats.aiRequests.change, periodLabel);
          const storageFormatted = formatStorageValue(stats.storageUsed.value);
          const [storageVal, storageUnit] = storageFormatted.split(' ');
          return (
            <>
              <StatCard
                label={t('totalDocuments')}
                value={stats.totalDocuments.value.toLocaleString('vi-VN')}
                unit="tài liệu"
                delta={totalDocsDelta.text}
                deltaType={totalDocsDelta.type}
                icon={FileText}
                gradient="navy"
                loading={loadingStats}
              />
              <StatCard
                label={t('storageUsed')}
                value={storageVal}
                unit={storageUnit}
                delta={storageDelta.text}
                deltaType={storageDelta.type}
                icon={HardDrive}
                gradient="gold"
                loading={loadingStats}
              />
              <StatCard
                label={t('onlineUsers')}
                value={stats.onlineUsers.value.toLocaleString('vi-VN')}
                unit="người"
                delta={onlineDelta.text}
                deltaType={onlineDelta.type}
                icon={Users}
                gradient="success"
                loading={loadingStats}
              />
              <StatCard
                label={t('aiRequests')}
                value={stats.aiRequests.value.toLocaleString('vi-VN')}
                unit="yêu cầu"
                delta={aiDelta.text}
                deltaType={aiDelta.type}
                icon={Brain}
                gradient="info"
                loading={loadingStats}
              />
            </>
          );
        })()}
      </div>

      {/* Row 2: Bar chart (3/5) + Classification (2/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <DocumentsChart data={chartData} loading={loadingChart} />
        </div>
        <div className="lg:col-span-2">
          <DataClassificationWidget data={classification} loading={loadingClassification} />
        </div>
      </div>

      {/* Row 3: Recent Documents */}
      <RecentDocuments documents={recentDocs} loading={loadingRecent} />

      {/* Row 4: Activity Feed — full width */}
      <ActivityFeed
        activities={activities}
        loading={loadingActivity}
        enableSSE={true}
        title={t('activityFeed')}
      />
    </div>
  );
}

// ============================================================
// Dashboard Page (router: Admin vs User)
// ============================================================
export default function DashboardPage() {
  const { isSystemAdmin, hasPermission } = usePermissions();
  const isAdmin = isSystemAdmin || hasPermission('dashboard:admin');

  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);

  if (isAdmin) {
    return (
      <AdminDashboard
        period={period}
        departmentId={departmentId}
        onPeriodChange={setPeriod}
        onDepartmentChange={setDepartmentId}
      />
    );
  }

  return <UserDashboard period={period} />;
}
