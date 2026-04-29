'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useProfileContext } from '@/contexts/profile-context';
import { getDashboardStats, getRecentDocuments, getActivityFeed } from '@/lib/dashboard-api';
import type { DashboardStats, RecentDocument, ActivityItem, DashboardPeriod } from '@/types/dashboard';
import { QuickAccess } from '@/components/dashboard/quick-access';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { StatCard } from '@/components/shared/stat-card';
import { useTranslations } from 'next-intl';

function buildUserDelta(change: number, periodLabel: string): { text: string; type: 'up' | 'down' | 'neutral' } {
  if (change > 0) return { text: `+${change}% ${periodLabel.toLowerCase()}`, type: 'up' };
  if (change < 0) return { text: `${change}% ${periodLabel.toLowerCase()}`, type: 'down' };
  return { text: `Không đổi ${periodLabel.toLowerCase()}`, type: 'neutral' };
}

const EMPTY_STATS: DashboardStats = {
  totalDocuments: { value: 0, change: 0 },
  storageUsed: { value: 0, change: 0 },
  onlineUsers: { value: 0, change: 0 },
  aiRequests: { value: 0, change: 0 },
};

interface UserDashboardProps {
  period: DashboardPeriod;
}

export function UserDashboard({ period }: UserDashboardProps) {
  const { user } = useAuth();
  const { fullName } = useProfileContext();
  const t = useTranslations('dashboard');

  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const PERIOD_LABELS: Record<DashboardPeriod, string> = {
    day: t('periodDay'),
    week: t('periodWeek'),
    month: t('periodMonth'),
    quarter: t('periodQuarter'),
  };

  const fetchData = useCallback(
    async (p: DashboardPeriod) => {
      setLoadingStats(true);
      setLoadingDocs(true);
      setLoadingActivity(true);

      const results = await Promise.allSettled([
        getDashboardStats(p),
        getRecentDocuments(),
        getActivityFeed(),
      ]);

      if (results[0].status === 'fulfilled') setStats(results[0].value);
      else toast.error(t('personalStatsError'));
      setLoadingStats(false);

      if (results[1].status === 'fulfilled') setRecentDocs(results[1].value);
      setLoadingDocs(false);

      if (results[2].status === 'fulfilled') setActivities(results[2].value);
      setLoadingActivity(false);
    },
    [t],
  );

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const periodLabel = PERIOD_LABELS[period];
  const displayName = fullName || user?.username || 'Bạn';

  // Lấy giờ để hiển thị lời chào phù hợp
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="p-6 bg-slate-50 h-full overflow-y-auto space-y-6">
      {/* Welcome Header — PKKQ navy gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1B3A5C] to-[#2d5a8e] rounded-2xl p-6 text-white shadow-[0_2px_12px_rgba(27,58,92,0.15)]">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          aria-hidden
        />
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">{greeting},</p>
        <h1 className="text-2xl font-bold tracking-tight relative">{displayName}</h1>
        <p className="text-sm text-white/70 mt-2 relative">
          {t('userSubtitle')}
        </p>
      </div>

      {/* Row 1: 2 Gradient StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(() => {
          const docDelta = buildUserDelta(stats.totalDocuments.change, periodLabel);
          const aiDelta = buildUserDelta(stats.aiRequests.change, periodLabel);
          return (
            <>
              <StatCard
                label={t('myDocuments')}
                value={stats.totalDocuments.value.toLocaleString('vi-VN')}
                unit="tài liệu"
                delta={docDelta.text}
                deltaType={docDelta.type}
                icon={FileText}
                gradient="navy"
                loading={loadingStats}
              />
              <StatCard
                label={t('myAiRequests')}
                value={stats.aiRequests.value.toLocaleString('vi-VN')}
                unit="yêu cầu"
                delta={aiDelta.text}
                deltaType={aiDelta.type}
                icon={Sparkles}
                gradient="gold"
                loading={loadingStats}
              />
            </>
          );
        })()}
      </div>

      {/* Row 2: 10 Tài liệu gần nhất (full width) */}
      <QuickAccess documents={recentDocs.slice(0, 10)} loading={loadingDocs} />

      {/* Row 3: Activity Feed — activities của bản thân */}
      <ActivityFeed activities={activities} loading={loadingActivity} title={t('myActivity')} />
    </div>
  );
}
