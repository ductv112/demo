/**
 * AI Quality API — mock cho PKKQ prototype.
 */

import { toast } from 'sonner';
import type {
  AiQualityStats,
  AiQualityTrendItem,
  AiQualityFeedbackResponse,
  AiQualityMessageDetail,
  UsageStats,
  UsageTrendItem,
  UsageByDeptItem,
  IntentBreakdownResponse,
  RetryStats,
  UserStatsResponse,
  UserStatsSortBy,
  ReportType,
} from '@/types/ai-quality';
import {
  buildAiQualityStats,
  buildAiQualityTrend,
  buildAiQualityFeedbacks,
  buildUsageStats,
  buildUsageTrend,
  buildUsageByDept,
  buildIntentBreakdown,
  buildRetryStats,
  buildUserStats,
  DEMO_REPLY,
} from '@/lib/mock-data';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getAiQualityStats(_period: string = '30d'): Promise<AiQualityStats> {
  await delay(200);
  return buildAiQualityStats();
}

export async function getAiQualityTrend(period: string = '30d'): Promise<AiQualityTrendItem[]> {
  await delay(220);
  return buildAiQualityTrend(period);
}

export async function getAiQualityFeedbacks(
  page: number = 1,
  limit: number = 20,
  search?: string,
): Promise<AiQualityFeedbackResponse> {
  await delay(180);
  return buildAiQualityFeedbacks(page, limit, search);
}

export async function getMessageDetail(messageId: string): Promise<AiQualityMessageDetail> {
  await delay(120);
  return {
    id: messageId,
    content: `Nội dung chi tiết phản hồi. ${DEMO_REPLY}`,
    userQuery: 'Câu hỏi demo của người dùng',
    feedbackType: 'like',
    feedbackTags: ['Chính xác'],
    feedbackText: null,
    feedbackAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    user: {
      id: 'user-director',
      fullName: 'Đại tá Phạm Quốc Hưng',
      email: 'pqhung@z119.mil.vn',
    },
  };
}

export async function getUsageStats(
  _period: string = '30d',
  _departmentId?: string,
): Promise<UsageStats> {
  await delay(200);
  return buildUsageStats();
}

export async function getUsageTrend(
  period: string = '30d',
  _departmentId?: string,
): Promise<UsageTrendItem[]> {
  await delay(220);
  return buildUsageTrend(period);
}

export async function getUsageByDepartment(_period: string = '30d'): Promise<UsageByDeptItem[]> {
  await delay(180);
  return buildUsageByDept();
}

export async function getUsageByIntent(
  _period: string = '30d',
  _departmentId?: string,
): Promise<IntentBreakdownResponse> {
  await delay(160);
  return buildIntentBreakdown();
}

export async function getRetryStats(_period: string = '30d'): Promise<RetryStats> {
  await delay(140);
  return buildRetryStats();
}

export async function getUserStats(
  _period: string = '30d',
  page: number = 1,
  limit: number = 20,
  _sortBy: UserStatsSortBy = 'totalMessages',
  _sortOrder: 'asc' | 'desc' = 'desc',
): Promise<UserStatsResponse> {
  await delay(200);
  return buildUserStats(page, limit);
}

export async function exportAiQualityReport(
  period: string = '30d',
  type: ReportType = 'full',
): Promise<void> {
  await delay(400);
  toast.info(
    `Đã tạo báo cáo ${type.toUpperCase()} (${period}) — chế độ demo, không xuất file.`,
  );
}
