import { api } from './api';
import type {
  DashboardStats,
  DocumentsChartData,
  DataClassification,
  RecentDocument,
  ActivityItem,
  DashboardPeriod,
} from '@/types/dashboard';

// Raw API URL cho SSE fetch (không qua axios)
export const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getDashboardStats(
  period?: DashboardPeriod,
  departmentId?: string,
): Promise<DashboardStats> {
  const params = new URLSearchParams();
  if (period) params.set('period', period);
  if (departmentId) params.set('departmentId', departmentId);
  const response = await api.get<DashboardStats>(`/dashboard/stats?${params}`);
  return response.data;
}

export async function getDocumentsChart(
  period?: DashboardPeriod,
  departmentId?: string,
): Promise<DocumentsChartData> {
  const params = new URLSearchParams();
  if (period) params.set('period', period);
  if (departmentId) params.set('departmentId', departmentId);
  const response = await api.get<DocumentsChartData>(`/dashboard/charts/documents?${params}`);
  return response.data;
}

export async function getDataClassification(
  period?: DashboardPeriod,
  departmentId?: string,
): Promise<DataClassification> {
  const params = new URLSearchParams();
  if (period) params.set('period', period);
  if (departmentId) params.set('departmentId', departmentId);
  const response = await api.get<DataClassification>(
    `/dashboard/charts/classification?${params}`,
  );
  return response.data;
}

export async function getRecentDocuments(
  departmentId?: string,
): Promise<RecentDocument[]> {
  const params = new URLSearchParams();
  if (departmentId) params.set('departmentId', departmentId);
  const response = await api.get<RecentDocument[]>(`/dashboard/recent-documents?${params}`);
  return response.data;
}

export async function getActivityFeed(): Promise<ActivityItem[]> {
  const response = await api.get<ActivityItem[]>('/dashboard/activity');
  return response.data;
}

