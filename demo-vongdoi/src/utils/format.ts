import dayjs from 'dayjs';
import type {
  EquipmentStatus,
  EquipmentType,
  TechnicalCondition,
  LifecyclePhase,
  LifecyclePlanStatus,
  ConfigChangeType,
  OperationEventType,
  AlertSeverity,
  AlertType,
} from '../types';

export const formatDate = (date: string): string => dayjs(date).format('DD/MM/YYYY');
export const formatDateTime = (date: string): string => dayjs(date).format('DD/MM/YYYY HH:mm');

export const formatCurrency = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} tỷ`;
  return `${value} tr`;
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('vi-VN').format(value);

export const formatHours = (hours: number): string => {
  if (hours >= 10000) return `${(hours / 1000).toFixed(1)}k giờ`;
  return `${formatNumber(hours)} giờ`;
};

// ─── Status Configs ──────────────────────────────────────────────────────────

export const equipmentStatusConfig: Record<EquipmentStatus, { label: string; color: string }> = {
  in_service:   { label: 'Đang vận hành', color: 'success' },
  maintenance:  { label: 'Đang bảo trì', color: 'processing' },
  repair:       { label: 'Đang khắc phục', color: 'warning' },
  overhaul:     { label: 'Đang nâng cấp lớn', color: 'purple' },
  storage:      { label: 'Dự trữ / Lưu kho', color: 'default' },
  decommission: { label: 'Đã loại bỏ', color: 'error' },
  new:          { label: 'Tiếp nhận mới', color: 'cyan' },
};

export const equipmentTypeConfig: Record<EquipmentType, { label: string; color: string }> = {
  radar:         { label: 'Monitoring', color: '#1B3A5C' },
  missile:       { label: 'Sản phẩm', color: '#7c3aed' },
  electronics:   { label: 'Điện tử', color: '#0891b2' },
  communication: { label: 'Truyền thông', color: '#059669' },
  mechanical:    { label: 'Hạ tầng', color: '#d97706' },
  measurement:   { label: 'Đo lường', color: '#c0392b' },
};

export const technicalConditionConfig: Record<TechnicalCondition, { label: string; color: string }> = {
  excellent: { label: 'Rất tốt', color: '#52c41a' },
  good:      { label: 'Tốt', color: '#73d13d' },
  fair:      { label: 'Trung bình', color: '#faad14' },
  poor:      { label: 'Kém', color: '#ff7a45' },
  critical:  { label: 'Nghiêm trọng', color: '#ff4d4f' },
};

export const lifecyclePhaseConfig: Record<LifecyclePhase, { label: string; color: string }> = {
  procurement:          { label: 'Phát triển', color: 'cyan' },
  in_service:           { label: 'Triển khai', color: 'success' },
  periodic_maintenance: { label: 'Bảo trì định kỳ', color: 'processing' },
  repair:               { label: 'Khắc phục sự cố', color: 'warning' },
  overhaul:             { label: 'Nâng cấp lớn', color: 'purple' },
  upgrade:              { label: 'Nâng cấp', color: 'magenta' },
  storage:              { label: 'Lưu trữ', color: 'default' },
  decommission:         { label: 'EOL / Loại bỏ', color: 'error' },
};

export const lifecyclePlanStatusConfig: Record<LifecyclePlanStatus, { label: string; color: string }> = {
  draft:            { label: 'Đang lập', color: 'default' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
  approved:         { label: 'Đã duyệt', color: 'success' },
  in_progress:      { label: 'Đang thực hiện', color: 'processing' },
  completed:        { label: 'Hoàn thành', color: 'success' },
  cancelled:        { label: 'Hủy bỏ', color: 'error' },
};

export const configChangeTypeConfig: Record<ConfigChangeType, { label: string; color: string }> = {
  initial_setup:          { label: 'Thiết lập ban đầu', color: 'cyan' },
  hardware_upgrade:       { label: 'Nâng cấp phần cứng', color: 'blue' },
  software_update:        { label: 'Cập nhật phần mềm', color: 'geekblue' },
  component_replacement:  { label: 'Thay thế linh kiện', color: 'orange' },
  parameter_change:       { label: 'Thay đổi thông số', color: 'gold' },
  structural_modification:{ label: 'Cải tạo kết cấu', color: 'purple' },
};

export const operationEventTypeConfig: Record<OperationEventType, { label: string; color: string }> = {
  transfer_in:   { label: 'Tiếp nhận', color: 'cyan' },
  transfer_out:  { label: 'Bàn giao', color: 'orange' },
  operation_log: { label: 'Vận hành', color: 'success' },
  inspection:    { label: 'Kiểm tra', color: 'processing' },
  calibration:   { label: 'Hiệu chuẩn', color: 'purple' },
  test_run:      { label: 'Chạy thử', color: 'gold' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning:  { label: 'Cảnh báo', color: '#faad14' },
  info:     { label: 'Thông tin', color: '#1890ff' },
};

export const alertTypeConfig: Record<AlertType, { label: string }> = {
  overhaul_due:     { label: 'Đến kỳ nâng cấp' },
  maintenance_due:  { label: 'Đến kỳ bảo trì' },
  end_of_life:      { label: 'Gần hết tuổi thọ' },
  hours_limit:      { label: 'Vượt giới hạn giờ' },
  lifecycle_overdue:{ label: 'Kế hoạch quá hạn' },
  config_pending:   { label: 'Cấu hình chờ duyệt' },
};

export const getLifespanPercent = (yearReceived: number, designLifespan: number): number => {
  const age = 2026 - yearReceived;
  return Math.min(Math.round((age / designLifespan) * 100), 100);
};

export const getHoursPercent = (operatingHours: number, maxOperatingHours: number): number => {
  return Math.min(Math.round((operatingHours / maxOperatingHours) * 100), 100);
};

export const getProgressColor = (percent: number): string => {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 75) return '#faad14';
  return '#52c41a';
};
