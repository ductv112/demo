import dayjs from 'dayjs';
import type {
  PlanStatus,
  WorkOrderStatus,
  RepairRequestStatus,
  RepairSeverity,
  PlanPriority,
  StaffStatus,
  SkillLevel,
  ProcedureStatus,
  EquipmentStatus,
  SparePartRequestStatus,
  AlertSeverity,
  TeamType,
  WorkItemStatus,
  POStatus,
  EvaluationResult,
  MaterialRequestStatus,
  MaterialRequestType,
} from '../types';

// ─── Currency & Number Formatting ───────────────────────────────
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

// ─── Date Formatting ────────────────────────────────────────────
export const formatDate = (date: string): string => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

// ─── Status Configs ─────────────────────────────────────────────

export const planStatusConfig: Record<PlanStatus, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'default' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
  approved: { label: 'Đã phê duyệt', color: 'success' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const workOrderStatusConfig: Record<WorkOrderStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ thực hiện', color: 'default' },
  preparing: { label: 'Đang chuẩn bị', color: 'processing' },
  locked: { label: 'Đã khóa thiết bị', color: 'warning' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  checking: { label: 'Đang kiểm tra', color: 'warning' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const repairStatusConfig: Record<RepairRequestStatus, { label: string; color: string }> = {
  new: { label: 'Mới tiếp nhận', color: 'default' },
  evaluating: { label: 'Đang đánh giá', color: 'processing' },
  assigned: { label: 'Đã phân công', color: 'processing' },
  in_progress: { label: 'Đang sửa chữa', color: 'processing' },
  checking: { label: 'Đang kiểm tra', color: 'warning' },
  completed: { label: 'Hoàn thành', color: 'success' },
  escalated: { label: 'Chuyển sửa chữa lớn', color: 'error' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const severityConfig: Record<RepairSeverity, { label: string; color: string }> = {
  low: { label: 'Thấp', color: '#52c41a' },
  medium: { label: 'Trung bình', color: '#faad14' },
  high: { label: 'Cao', color: '#ff7a45' },
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
};

export const priorityConfig: Record<PlanPriority, { label: string; color: string }> = {
  low: { label: 'Thấp', color: 'default' },
  medium: { label: 'Trung bình', color: 'processing' },
  high: { label: 'Cao', color: 'warning' },
  critical: { label: 'Khẩn cấp', color: 'error' },
};

export const staffStatusConfig: Record<StaffStatus, { label: string; color: string }> = {
  active: { label: 'Đang làm việc', color: 'success' },
  on_leave: { label: 'Nghỉ phép', color: 'warning' },
  transferred: { label: 'Điều động', color: 'processing' },
  inactive: { label: 'Nghỉ việc', color: 'default' },
};

export const skillLevelConfig: Record<SkillLevel, { label: string; color: string }> = {
  basic: { label: 'Cơ bản', color: 'default' },
  intermediate: { label: 'Trung cấp', color: 'processing' },
  advanced: { label: 'Nâng cao', color: 'success' },
};

export const procedureStatusConfig: Record<ProcedureStatus, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'default' },
  active: { label: 'Đang áp dụng', color: 'success' },
  archived: { label: 'Lưu trữ', color: 'default' },
};

export const equipmentStatusConfig: Record<EquipmentStatus, { label: string; color: string }> = {
  operational: { label: 'Đang vận hành', color: 'success' },
  maintenance: { label: 'Đang bảo trì', color: 'warning' },
  faulty: { label: 'Hỏng hóc', color: 'error' },
  decommissioned: { label: 'Ngừng sử dụng', color: 'default' },
};

export const sparePartStatusConfig: Record<SparePartRequestStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'default' },
  approved: { label: 'Đã duyệt', color: 'processing' },
  issued: { label: 'Đã xuất kho', color: 'success' },
  used: { label: 'Đã sử dụng', color: 'success' },
  returned: { label: 'Đã hoàn trả', color: 'warning' },
  reconciled: { label: 'Đã đối soát', color: 'default' },
};

export const workItemStatusConfig: Record<WorkItemStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ thực hiện', color: 'default' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
  skipped: { label: 'Bỏ qua', color: 'warning' },
};

export const poStatusConfig: Record<POStatus, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'default' },
  assigned: { label: 'Đã phân công', color: 'processing' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  checking: { label: 'Chờ kiểm tra', color: 'warning' },
  evaluated: { label: 'Đã đánh giá', color: 'cyan' },
  accepted: { label: 'Nghiệm thu', color: 'success' },
  rejected: { label: 'Không đạt', color: 'error' },
  cancelled: { label: 'Đã hủy', color: 'default' },
};

export const evaluationResultConfig: Record<EvaluationResult, { label: string; color: string }> = {
  pass: { label: 'Đạt', color: 'success' },
  pass_with_conditions: { label: 'Đạt có điều kiện', color: 'warning' },
  fail: { label: 'Không đạt', color: 'error' },
};

export const materialRequestStatusConfig: Record<MaterialRequestStatus, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'default' },
  submitted: { label: 'Đã gửi', color: 'processing' },
  warehouse_processing: { label: 'Kho đang xử lý', color: 'warning' },
  issued: { label: 'Đã xuất kho', color: 'cyan' },
  received: { label: 'Đã nhận hàng', color: 'success' },
  returning: { label: 'Đang trả kho', color: 'warning' },
  returned: { label: 'Đã trả kho', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'default' },
};

export const materialRequestTypeConfig: Record<MaterialRequestType, { label: string; color: string }> = {
  issue: { label: 'Cấp phát', color: 'processing' },
  return: { label: 'Trả kho', color: 'warning' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning: { label: 'Cảnh báo', color: '#faad14' },
  info: { label: 'Thông tin', color: '#1890ff' },
};

export const teamTypeConfig: Record<TeamType, { label: string; color: string }> = {
  fixed: { label: 'Cố định', color: 'processing' },
  flexible: { label: 'Linh hoạt', color: 'warning' },
};

// ─── Utilities ──────────────────────────────────────────────────

export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return '#ff4d4f';
  if (progress >= 75) return '#faad14';
  return '#52c41a';
};
