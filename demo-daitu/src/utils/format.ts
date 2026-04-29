import dayjs from 'dayjs';
import type {
  ReceptionStatus,
  OverhaulOrderStatus,
  DisassemblyStatus,
  ComponentStatus,
  AssemblyStatus,
  TestAcceptanceStatus,
  InspectionType,
  RestorationAction,
  DispositionAction,
  AlertSeverity,
  EquipmentCategory,
  MaterialRequestStatus,
  MaterialRequestPriority,
  MaterialCategory,
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

// ─── Status configs ──────────────────────────────────────────

export const receptionStatusConfig: Record<ReceptionStatus, { label: string; color: string }> = {
  pending_reception: { label: 'Chờ tiếp nhận', color: '#2563eb' },
  received: { label: 'Đã tiếp nhận', color: '#0891b2' },
  assessing: { label: 'Đang đánh giá', color: '#7c3aed' },
  assessed: { label: 'Đã đánh giá', color: '#16a34a' },
  pending_plan: { label: 'Chờ lập kế hoạch', color: '#d97706' },
};

export const overhaulOrderStatusConfig: Record<OverhaulOrderStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'volcano' },
  pending_approval: { label: 'Chờ duyệt', color: 'warning' },
  approved: { label: 'Đã duyệt', color: 'success' },
  in_progress: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
  closed: { label: 'Đã đóng', color: 'purple' },
};

export const disassemblyStatusConfig: Record<DisassemblyStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ thực hiện', color: 'geekblue' },
  in_progress: { label: 'Đang tháo rã', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
};

export const componentStatusConfig: Record<ComponentStatus, { label: string; color: string }> = {
  disassembled: { label: 'Đã tháo rã', color: 'lime' },
  pending_inspection: { label: 'Chờ kiểm tra', color: 'warning' },
  inspecting: { label: 'Đang kiểm tra', color: 'processing' },
  serviceable: { label: 'Đạt - Giữ lại', color: 'success' },
  repairable: { label: 'Cần phục hồi', color: 'orange' },
  beyond_repair: { label: 'Thay mới', color: 'error' },
  upgrade_required: { label: 'Cần nâng cấp', color: 'purple' },
  restored: { label: 'Đã phục hồi', color: 'cyan' },
  replaced: { label: 'Đã thay thế', color: 'blue' },
  upgraded: { label: 'Đã nâng cấp', color: 'geekblue' },
  ready_for_assembly: { label: 'Sẵn sàng lắp ráp', color: 'success' },
};

export const assemblyStatusConfig: Record<AssemblyStatus, { label: string; color: string }> = {
  preparing: { label: 'Chuẩn bị', color: 'gold' },
  assembling: { label: 'Đang lắp ráp', color: 'processing' },
  calibrating: { label: 'Đang hiệu chỉnh', color: 'processing' },
  pending_test: { label: 'Chờ thử nghiệm', color: 'warning' },
  completed: { label: 'Hoàn thành', color: 'success' },
};

export const testAcceptanceStatusConfig: Record<TestAcceptanceStatus, { label: string; color: string }> = {
  pending_test: { label: 'Chờ thử nghiệm', color: 'gold' },
  testing: { label: 'Đang thử nghiệm', color: 'processing' },
  passed: { label: 'Đạt', color: 'success' },
  failed: { label: 'Không đạt', color: 'error' },
  retesting: { label: 'Đang thử lại', color: 'warning' },
  accepted: { label: 'Đã nghiệm thu', color: 'success' },
  delivered: { label: 'Đã bàn giao', color: 'purple' },
};

export const inspectionTypeConfig: Record<InspectionType, { label: string; color: string }> = {
  visual: { label: 'Kiểm tra ngoại quan', color: 'blue' },
  dimensional: { label: 'Đo kích thước', color: 'cyan' },
  ndt: { label: 'Không phá hủy (NDT)', color: 'purple' },
  functional: { label: 'Kiểm tra chức năng', color: 'green' },
  surface: { label: 'Kiểm tra bề mặt', color: 'orange' },
};

export const restorationActionConfig: Record<RestorationAction, { label: string; color: string }> = {
  restore: { label: 'Phục hồi', color: 'cyan' },
  replace: { label: 'Thay thế', color: 'blue' },
  upgrade: { label: 'Nâng cấp', color: 'purple' },
  retain: { label: 'Giữ nguyên', color: 'success' },
};

export const dispositionActionConfig: Record<DispositionAction, { label: string; color: string }> = {
  serviceable: { label: 'Đạt - Giữ lại', color: 'success' },
  restore: { label: 'Phục hồi', color: 'cyan' },
  replace: { label: 'Thay mới', color: 'error' },
  upgrade: { label: 'Nâng cấp', color: 'purple' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning: { label: 'Cảnh báo', color: '#faad14' },
  info: { label: 'Thông tin', color: '#1890ff' },
};

export const equipmentCategoryConfig: Record<EquipmentCategory, { label: string; color: string }> = {
  radar: { label: 'Radar', color: '#1B3A5C' },
  missile: { label: 'Tên lửa', color: '#7c3aed' },
  communication: { label: 'Thông tin liên lạc', color: '#0891b2' },
  electronic: { label: 'Điện tử', color: '#059669' },
  mechanical: { label: 'Cơ khí', color: '#d97706' },
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return '#52c41a';
  if (progress >= 50) return '#1890ff';
  if (progress >= 25) return '#faad14';
  return '#ff4d4f';
};

export const wearLevelConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nhẹ', color: 'success' },
  medium: { label: 'Trung bình', color: 'warning' },
  high: { label: 'Nặng', color: 'orange' },
  critical: { label: 'Nghiêm trọng', color: 'error' },
};

export const materialRequestStatusConfig: Record<MaterialRequestStatus, { label: string; color: string; step: number }> = {
  draft:             { label: 'Nháp',              color: 'volcano',    step: 1 },
  pending_approval:  { label: 'Chờ duyệt',         color: 'warning',    step: 2 },
  approved:          { label: 'Đã duyệt',           color: 'success',    step: 3 },
  rejected:          { label: 'Từ chối',            color: 'error',      step: 3 },
  partially_issued:  { label: 'Cấp phát một phần', color: 'processing', step: 4 },
  issued:            { label: 'Đã cấp phát',        color: 'cyan',       step: 4 },
  completed:         { label: 'Hoàn thành',         color: 'success',    step: 5 },
};

export const materialRequestPriorityConfig: Record<MaterialRequestPriority, { label: string; color: string }> = {
  normal:   { label: 'Bình thường', color: 'blue' },
  urgent:   { label: 'Khẩn',        color: 'warning' },
  critical: { label: 'Ưu tiên cao', color: 'error' },
};

export const materialCategoryConfig: Record<MaterialCategory, { label: string; color: string }> = {
  spare_part:  { label: 'Linh kiện thay thế', color: 'blue' },
  consumable:  { label: 'Vật tư tiêu hao',    color: 'cyan' },
  chemical:    { label: 'Hóa chất / Dầu mỡ', color: 'green' },
  tool:        { label: 'Dụng cụ',            color: 'purple' },
};

export const traceabilityStatusConfig: Record<string, { label: string; color: string; step: number }> = {
  collecting:  { label: 'Tổng hợp dữ liệu',    color: 'processing', step: 1 },
  updating:    { label: 'Cập nhật lịch sử',     color: 'blue',       step: 2 },
  configuring: { label: 'Cập nhật cấu hình',    color: 'purple',     step: 3 },
  recording:   { label: 'Ghi nhận thay đổi KT', color: 'orange',     step: 4 },
  tracing:     { label: 'Thiết lập truy vết',   color: 'cyan',       step: 5 },
  syncing:     { label: 'Đồng bộ hệ thống',     color: 'gold',       step: 6 },
  completed:   { label: 'Hoàn thành',           color: 'success',    step: 6 },
};
