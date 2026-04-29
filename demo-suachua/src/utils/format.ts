import dayjs from 'dayjs';
import type {
  RepairRequestStatus,
  WorkOrderStatus,
  RepairTaskStatus,
  InspectionStatus,
  AlertSeverity,
  RepairType,
  RepairStage,
  RepairMethod,
  Priority,
  EquipmentType,
  ReceptionSource,
  DiagnosticStatus,
  MaterialRequestStatus,
} from '../types';

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

export const repairRequestStatusConfig: Record<RepairRequestStatus, { label: string; color: string }> = {
  received: { label: 'Đã tiếp nhận', color: 'processing' },
  diagnosing: { label: 'Đang chẩn đoán', color: 'warning' },
  diagnosed: { label: 'Đã chẩn đoán', color: 'cyan' },
  planning: { label: 'Đang lập kế hoạch', color: 'orange' },
  ready: { label: 'Sẵn sàng sửa chữa', color: 'success' },
};

export const workOrderStatusConfig: Record<WorkOrderStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
  approved: { label: 'Đã phê duyệt', color: 'cyan' },
  rejected: { label: 'Từ chối', color: 'error' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  quality_check: { label: 'Kiểm tra CL', color: 'orange' },
  testing: { label: 'Thử nghiệm', color: 'purple' },
  accepted: { label: 'Nghiệm thu', color: 'success' },
  handed_over: { label: 'Đã bàn giao', color: 'success' },
  closed: { label: 'Đóng', color: 'default' },
};

export const repairTaskStatusConfig: Record<RepairTaskStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ thực hiện', color: 'default' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
  failed: { label: 'Thất bại', color: 'error' },
};

export const inspectionStatusConfig: Record<InspectionStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ kiểm tra', color: 'default' },
  passed: { label: 'Đạt', color: 'success' },
  failed: { label: 'Không đạt', color: 'error' },
  retesting: { label: 'Kiểm tra lại', color: 'warning' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning: { label: 'Cảnh báo', color: '#faad14' },
  info: { label: 'Thông tin', color: '#1890ff' },
};

export const repairTypeConfig: Record<RepairType, { label: string; color: string }> = {
  small: { label: 'Sửa chữa nhỏ', color: 'green' },
  medium: { label: 'Sửa chữa vừa', color: 'orange' },
  field: { label: 'Sửa chữa hiện trường', color: 'blue' },
};

export const repairStageConfig: Record<RepairStage, { label: string; color: string }> = {
  electronic: { label: 'Điện tử', color: 'blue' },
  mechanical: { label: 'Cơ khí', color: 'orange' },
  optical: { label: 'Quang học', color: 'purple' },
  assembly: { label: 'Lắp ráp', color: 'cyan' },
  testing: { label: 'Thử nghiệm', color: 'green' },
};

export const repairMethodConfig: Record<RepairMethod, { label: string; color: string }> = {
  in_place: { label: 'Sửa tại chỗ', color: 'green' },
  replacement: { label: 'Thay thế', color: 'blue' },
  restoration: { label: 'Phục hồi', color: 'orange' },
  overhaul_transfer: { label: 'Chuyển đại tu', color: 'red' },
};

export const priorityConfig: Record<Priority, { label: string; color: string }> = {
  critical: { label: 'Khẩn cấp', color: 'red' },
  high: { label: 'Cao', color: 'orange' },
  medium: { label: 'Trung bình', color: 'blue' },
  low: { label: 'Thấp', color: 'default' },
};

export const materialRequestStatusConfig: Record<MaterialRequestStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  submitted: { label: 'Đã gửi kho', color: 'processing' },
  approved: { label: 'Kho đã duyệt', color: 'cyan' },
  issuing: { label: 'Đang cấp phát', color: 'orange' },
  received: { label: 'Đã nhận', color: 'success' },
  rejected: { label: 'Từ chối', color: 'error' },
};

export const diagnosticStatusConfig: Record<DiagnosticStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ chẩn đoán', color: 'default' },
  received: { label: 'Đã có kết quả', color: 'processing' },
  confirmed: { label: 'Đã xác nhận', color: 'success' },
  recheck: { label: 'Yêu cầu CĐ lại', color: 'warning' },
};

export const receptionSourceConfig: Record<ReceptionSource, { label: string; color: string }> = {
  unit: { label: 'Đơn vị gửi sửa', color: 'blue' },
  maintenance: { label: 'Phát hiện qua bảo trì', color: 'orange' },
  inspection: { label: 'Kiểm tra định kỳ', color: 'green' },
};

export const equipmentTypeConfig: Record<EquipmentType, { label: string; color: string }> = {
  radar: { label: 'Radar', color: 'blue' },
  missile: { label: 'Tên lửa', color: 'red' },
  communication: { label: 'Thông tin liên lạc', color: 'green' },
  electronic: { label: 'Điện tử', color: 'purple' },
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return '#52c41a';
  if (progress >= 60) return '#1890ff';
  if (progress >= 30) return '#faad14';
  return '#ff4d4f';
};
