export type DashboardPeriod = 'day' | 'week' | 'month' | 'quarter';

export interface DashboardKpi {
  value: number;
  change: number;
}

export interface DashboardStats {
  totalDocuments: DashboardKpi;
  storageUsed: DashboardKpi;
  onlineUsers: DashboardKpi;
  aiRequests: DashboardKpi;
}

export interface DocumentsChartData {
  labels: string[];
  total: number[];
  completed: number[];
  processing: number[];
  failed: number[];
}

export interface DataClassificationItem {
  key: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface DataClassification {
  items: DataClassificationItem[];
  total: number;
}

export interface RecentDocument {
  id: string;
  fileName: string;
  title?: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  uploader?: { id: string; fullName: string };
}

export interface ActivityItem {
  id: string;
  action: string;
  actorName: string;
  targetName: string;
  createdAt: string;
  icon?: string;
}
