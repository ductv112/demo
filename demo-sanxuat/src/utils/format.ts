import dayjs from 'dayjs';
import type {
  BOMStatus, RoutingStatus, ProductionPlanStatus, ProductionOrderStatus,
  ProductionOrderType, StepExecutionStatus, CompletionStatus,
  ECRStatus, ECRType, WIPStatus, AlertSeverity,
} from '../types';

export const formatDate = (date: string): string => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// --- Status configs ---

export const bomStatusConfig: Record<BOMStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
  active: { label: 'Đang sử dụng', color: 'success' },
  deprecated: { label: 'Ngừng sử dụng', color: 'error' },
};

export const routingStatusConfig: Record<RoutingStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  approved: { label: 'Đã duyệt', color: 'processing' },
  active: { label: 'Đang sử dụng', color: 'success' },
  deprecated: { label: 'Ngừng sử dụng', color: 'error' },
};

export const planStatusConfig: Record<ProductionPlanStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  approved: { label: 'Đã duyệt', color: 'processing' },
  in_progress: { label: 'Đang thực hiện', color: 'success' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const orderStatusConfig: Record<ProductionOrderStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  pending_material: { label: 'Chờ vật tư', color: 'warning' },
  ready: { label: 'Sẵn sàng', color: 'processing' },
  in_progress: { label: 'Đang sản xuất', color: 'success' },
  paused: { label: 'Tạm dừng', color: 'warning' },
  completed: { label: 'Hoàn thành', color: 'success' },
  closed: { label: 'Đã đóng', color: 'default' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const orderTypeConfig: Record<ProductionOrderType, { label: string; color: string }> = {
  new_product: { label: 'Sản xuất mới', color: '#1B3A5C' },
  spare_part: { label: 'Phụ tùng', color: '#0891b2' },
  semi_finished: { label: 'Bán thành phẩm', color: '#7c3aed' },
  repair_support: { label: 'Phục vụ sửa chữa', color: '#d97706' },
};

export const stepStatusConfig: Record<StepExecutionStatus, { label: string; color: string }> = {
  pending: { label: 'Chưa thực hiện', color: 'default' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
  failed: { label: 'Không đạt', color: 'error' },
  skipped: { label: 'Bỏ qua', color: 'default' },
};

export const completionStatusConfig: Record<CompletionStatus, { label: string; color: string }> = {
  pending_inspection: { label: 'Chờ kiểm tra', color: 'warning' },
  inspected: { label: 'Chờ nhập kho', color: 'warning' },
  warehouse_received: { label: 'Đã nhập kho', color: 'success' },
  closed: { label: 'Đã đóng', color: 'default' },
};

export const ecrStatusConfig: Record<ECRStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  evaluating: { label: 'Đang đánh giá', color: 'processing' },
  approved: { label: 'Đã duyệt', color: 'success' },
  implementing: { label: 'Đang triển khai', color: 'warning' },
  completed: { label: 'Hoàn thành', color: 'success' },
  rejected: { label: 'Từ chối', color: 'error' },
};

export const ecrTypeConfig: Record<ECRType, { label: string; color: string }> = {
  design_change: { label: 'Thay đổi thiết kế', color: '#1B3A5C' },
  material_change: { label: 'Thay đổi vật tư', color: '#d97706' },
  process_change: { label: 'Thay đổi quy trình', color: '#7c3aed' },
};

export const wipStatusConfig: Record<WIPStatus, { label: string; color: string }> = {
  not_started: { label: 'Chưa bắt đầu', color: 'default' },
  in_progress: { label: 'Đang xử lý', color: 'processing' },
  waiting: { label: 'Chờ chuyển', color: 'warning' },
  completed: { label: 'Hoàn thành', color: 'success' },
  blocked: { label: 'Tắc nghẽn', color: 'error' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning: { label: 'Cảnh báo', color: '#faad14' },
  info: { label: 'Thông tin', color: '#1890ff' },
};

export const priorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: 'Khẩn cấp', color: '#ff4d4f' },
  high: { label: 'Cao', color: '#fa8c16' },
  normal: { label: 'Bình thường', color: '#1890ff' },
  low: { label: 'Thấp', color: '#8c8c8c' },
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return '#ff4d4f';
  if (progress >= 75) return '#faad14';
  return '#52c41a';
};

export const getUtilizationColor = (rate: number): string => {
  if (rate >= 95) return '#ff4d4f';
  if (rate >= 80) return '#faad14';
  if (rate >= 50) return '#52c41a';
  return '#8c8c8c';
};
