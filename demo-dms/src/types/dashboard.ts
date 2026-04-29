export interface KpiValue {
  value: number;
  change: number; // % change vs previous period
}

export interface DashboardStats {
  totalDocuments: KpiValue;
  storageUsed: KpiValue;
  onlineUsers: KpiValue;
  aiRequests: KpiValue;
}

export interface DocumentsChartData {
  labels: string[];
  total: number[];
  completed: number[];
  processing: number[];
  failed: number[];
}

export interface ClassificationItem {
  label: string;
  count: number;
  percentage: number;
}

export interface DataClassification {
  items: ClassificationItem[];
  total: number;
}

export interface RecentDocument {
  id: string;
  title: string;
  fileName?: string;
  mimeType: string;
  fileSize: string | number | bigint;
  createdAt: string;
  folderId?: string | null;
  uploader: { id: string; fullName: string };
  department?: { id: string; name: string } | null;
}

export interface ActivityItem {
  id: string | number;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
  user: { id: string; fullName: string; username: string };
}

export type DashboardPeriod = 'day' | 'week' | 'month' | 'quarter';
