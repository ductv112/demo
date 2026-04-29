/**
 * Phase 47 — AI Quality types cho trang báo cáo chất lượng AI
 */

export interface AiQualityStats {
  totalRated: number;
  likes: number;
  dislikes: number;
  satisfactionRate: number;  // percentage
  feedbackDetailRate: number; // percentage
}

export interface AiQualityTrendItem {
  date: string;
  likes: number;
  dislikes: number;
  total: number;
}

export interface AiQualityFeedback {
  id: string;
  content: string;          // câu trả lời AI (truncated 200 chars trong list)
  userQuery: string | null;  // câu hỏi người dùng (truncated 200 chars trong list)
  feedbackType: 'like' | 'dislike' | null;
  feedbackTags: string[] | null;
  feedbackText: string | null;
  feedbackAt: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string } | null;
}

/** Chi tiết message — full content, không truncate */
export interface AiQualityMessageDetail extends AiQualityFeedback {
  // content và userQuery ở đây là FULL, không bị cắt
}

export interface AiQualityFeedbackResponse {
  data: AiQualityFeedback[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export type AiQualityPeriod = '7d' | '30d' | '3m';

/** Phase 20.1 — Usage statistics types */

export interface UsageStats {
  totalQuestions: { value: number; change: number };
  activeUsers: { value: number; change: number };
  avgQuestionsPerUser: number;
  activeDepartments: { value: number; change: number };
  period: string;
}

export interface UsageTrendItem {
  date: string;   // "2026-03-24"
  total: number;  // số câu hỏi trong ngày
}

export interface UsageByDeptItem {
  departmentId: string;
  departmentName: string;
  totalQuestions: number;
  activeUsers: number;
}

/** Phase 20.1.1 — Intent breakdown types */

export interface IntentBreakdownItem {
  intent: string;     // 'rag' | 'summarize' | 'diff' | 'compare' | 'translate' | 'chat'
  count: number;      // số tuyệt đối
  percentage: number;  // % làm tròn 1 chữ số thập phân
}

export interface IntentBreakdownResponse {
  items: IntentBreakdownItem[];
  total: number;  // tổng tất cả ASSISTANT messages (kể cả unclassified)
}

/** Phase 72 — Retry rate tracking */
export interface RetryStats {
  retryCount: number;
  totalMessages: number;
  retryRate: number;        // % 1 decimal
  retryRateChange: number;  // % thay đổi so với period trước
  period: string;
}

/** Phase 72 — Top users stats table */
export type UserStatsSortBy = 'totalMessages' | 'totalSessions' | 'feedbackRate' | 'retryRate';

export interface UserStatsItem {
  userId: string;
  userName: string;
  email: string;
  totalMessages: number;
  totalSessions: number;
  feedbackRate: number;  // %
  retryRate: number;     // %
}

export interface UserStatsResponse {
  data: UserStatsItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/** Phase 72 — 4 loại báo cáo export (D-05) */
export type ReportType = 'full' | 'quality' | 'usage' | 'feedback';
