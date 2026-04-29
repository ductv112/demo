import dayjs from 'dayjs';
import type { CostPlanStatus, PaymentRequestStatus, CategoryType, AlertSeverity, BudgetRegistration } from '../types';

export const formatCurrency = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} tỷ`;
  }
  return `${value} tr`;
};

export const formatCurrencyFull = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' triệu đồng';
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const formatDate = (date: string): string => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const costPlanStatusConfig: Record<CostPlanStatus, { label: string; color: string }> = {
  draft: { label: 'Đang lập KH', color: 'default' },
  collecting: { label: 'Đang thu thập nhu cầu', color: 'processing' },
  consolidating: { label: 'Đang tổng hợp', color: 'processing' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
  approved: { label: 'Đã phê duyệt', color: 'success' },
  allocating: { label: 'Đang phân bổ', color: 'processing' },
  executing: { label: 'Đang thực hiện', color: 'success' },
  settling: { label: 'Đang quyết toán', color: 'warning' },
  settled: { label: 'Đã quyết toán', color: 'default' },
};

export const paymentStatusConfig: Record<PaymentRequestStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  submitted: { label: 'Đã gửi', color: 'processing' },
  reviewing: { label: 'Đang xem xét', color: 'warning' },
  approved: { label: 'Đã duyệt', color: 'success' },
  rejected: { label: 'Từ chối', color: 'error' },
  paid: { label: 'Đã thanh toán', color: 'success' },
  returned: { label: 'Trả lại', color: 'error' },
};

export const categoryTypeConfig: Record<CategoryType, { label: string; color: string; icon: string }> = {
  project: { label: 'Dự án', color: '#1B3A5C', icon: '🚢' },
  research: { label: 'Đề tài NCKH', color: '#7c3aed', icon: '🔬' },
  document: { label: 'BSTL', color: '#0891b2', icon: '📄' },
  standard: { label: 'TCQS', color: '#059669', icon: '📋' },
  training: { label: 'Đào tạo', color: '#d97706', icon: '🎓' },
  admin: { label: 'Hành chính', color: '#6b7280', icon: '🏢' },
};

// Backward compat alias
export const taskTypeConfig = categoryTypeConfig;

export const budgetRegistrationStatusConfig: Record<BudgetRegistration['status'], { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  submitted: { label: 'Đã gửi', color: 'processing' },
  reviewing: { label: 'Đang xem xét', color: 'warning' },
  approved: { label: 'Đã duyệt', color: 'success' },
  adjusted: { label: 'Đã điều chỉnh', color: 'orange' },
  rejected: { label: 'Từ chối', color: 'error' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning: { label: 'Cảnh báo', color: '#faad14' },
  info: { label: 'Thông tin', color: '#1890ff' },
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return '#ff4d4f';
  if (progress >= 75) return '#faad14';
  return '#52c41a';
};
