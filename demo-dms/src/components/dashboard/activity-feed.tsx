'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityItem } from '@/types/dashboard';
import { getStoredTokens } from '@/lib/auth';
import { useTranslations } from 'next-intl';
import { ACTION_LABELS, RESOURCE_LABELS } from '@/lib/audit-labels';

const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  enableSSE?: boolean;
  title?: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}

function getActionLabel(action: string): string {
  return (ACTION_LABELS[action] || action).toLowerCase();
}

function getResourceLabel(resource: string): string {
  return (RESOURCE_LABELS[resource] || resource).toLowerCase();
}

function getUserInitials(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-violet-500', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
];

function getAvatarColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ActivityFeed({
  activities: initialActivities,
  loading = false,
  enableSSE = false,
  title,
}: ActivityFeedProps) {
  const t = useTranslations('dashboard');
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [isConnected, setIsConnected] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initial activities khi prop thay đổi (lần đầu load), giới hạn 20 items
  useEffect(() => {
    const unique = initialActivities.filter(
      (a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx,
    );
    if (!enableSSE) {
      setActivities(unique.slice(0, 20));
    } else {
      // Khi SSE bật, initialActivities chỉ dùng một lần khi mount
      setActivities((prev) => (prev.length === 0 ? unique.slice(0, 20) : prev));
    }
  }, [initialActivities, enableSSE]);

  const connectSSE = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const fetchSSE = async () => {
      try {
        const tokens = getStoredTokens();
        if (!tokens?.accessToken) return;

        const response = await fetch(`${DASHBOARD_API_URL}/dashboard/activity/stream`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            Accept: 'text/event-stream',
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        setIsConnected(true);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          let eventType = '';
          let dataLine = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLine = line.slice(5).trim();
            } else if (line === '') {
              if (eventType === 'activity' && dataLine) {
                try {
                  const newItem: ActivityItem = JSON.parse(dataLine);
                  setActivities((prev) => {
                    if (prev.some((a) => a.id === newItem.id)) return prev;
                    return [newItem, ...prev].slice(0, 20);
                  });
                } catch {
                  // Ignore parse errors
                }
              }
              eventType = '';
              dataLine = '';
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setIsConnected(false);
        retryTimeoutRef.current = setTimeout(() => {
          if (!controller.signal.aborted) {
            connectSSE();
          }
        }, 5000);
      }

      setIsConnected(false);
      if (!controller.signal.aborted) {
        retryTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 5000);
      }
    };

    fetchSSE();
  }, []);

  useEffect(() => {
    if (!enableSSE) return;
    connectSSE();
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [enableSSE, connectSSE]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-5 space-y-4">
        <Skeleton className="h-4 w-40" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayTitle = title || t('activityFeed');

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-5 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {displayTitle}
        </p>
        {enableSSE && (
          <span className={`text-[11px] flex items-center gap-1.5 font-medium ${isConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`}
            />
            {isConnected ? t('connected') : t('disconnected')}
          </span>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
          {t('activityEmpty')}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-2.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36">
                  Thời gian
                </th>
                <th className="text-left pb-2.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Người dùng
                </th>
                <th className="text-left pb-2.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32">
                  Hành động
                </th>
                <th className="text-left pb-2.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32">
                  Tài nguyên
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activities.map((activity) => {
                const initials = getUserInitials(activity.user.fullName);
                const { bg, text } = getAvatarColor(activity.user.username);
                return (
                  <tr key={activity.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-2.5 px-2 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                      {timeAgo(activity.createdAt)}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${bg} ${text}`}
                        >
                          {initials}
                        </div>
                        <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                          {activity.user.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                        {getActionLabel(activity.action)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="text-blue-600 font-medium text-xs">
                        {getResourceLabel(activity.resource)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
