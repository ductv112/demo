import dayjs from 'dayjs';
import type {
  MissionStatus, MissionType, MissionPriority, MissionComplexity, ExecutionScope,
  ProposalStatus, ContractStatus, WorkItemStatus,
  AcceptanceStatus, SettlementStatus, AlertSeverity,
  WorkItemType, DefectSeverity, DefectStatus, ReworkStatus,
  HandoverStatus, HandoverType, HandoverDocType, QualityResult,
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

export const missionStatusConfig: Record<MissionStatus, { label: string; color: string }> = {
  draft: { label: 'Đang xử lý', color: 'blue' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'orange' },
  approved: { label: 'Đã phê duyệt', color: 'green' },
  executing: { label: 'Đang thực hiện', color: 'cyan' },
  completed: { label: 'Hoàn thành', color: 'green' },
  cancelled: { label: 'Hủy', color: 'red' },
};

export const missionTypeConfig: Record<MissionType, { label: string; color: string }> = {
  repair: { label: 'Sửa chữa', color: '#1890ff' },
  overhaul: { label: 'Đại tu', color: '#7c3aed' },
  manufacturing: { label: 'Sản xuất', color: '#059669' },
  research: { label: 'Nghiên cứu', color: '#d97706' },
};

export const missionPriorityConfig: Record<MissionPriority, { label: string; color: string }> = {
  urgent: { label: 'Khẩn cấp', color: 'red' },
  periodic: { label: 'Định kỳ', color: 'orange' },
  planned: { label: 'Kế hoạch', color: 'blue' },
};

export const missionComplexityConfig: Record<MissionComplexity, { label: string; color: string }> = {
  low: { label: 'Đơn giản', color: 'green' },
  medium: { label: 'Trung bình', color: 'blue' },
  high: { label: 'Phức tạp', color: 'orange' },
  critical: { label: 'Rất phức tạp', color: 'red' },
};

export const executionScopeConfig: Record<ExecutionScope, { label: string; color: string }> = {
  internal: { label: 'Nội bộ doanh nghiệp', color: 'blue' },
  collaborative: { label: 'Phối hợp liên đơn vị', color: 'purple' },
  outsourced: { label: 'Thuê ngoài một phần', color: 'orange' },
};

export const proposalStatusConfig: Record<ProposalStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'blue' },
  submitted: { label: 'Đã trình', color: 'cyan' },
  pending_cost_review: { label: 'Chờ thẩm định TC', color: 'orange' },
  cost_reviewing: { label: 'Đang thẩm định', color: 'geekblue' },
  cost_reviewed: { label: 'Đã thẩm định', color: 'cyan' },
  cost_rejected: { label: 'TC từ chối', color: 'red' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'orange' },
  approved: { label: 'Đã phê duyệt', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
  revision: { label: 'Yêu cầu chỉnh sửa', color: 'orange' },
  negotiating: { label: 'Đang đàm phán', color: 'purple' },
  contract_created: { label: 'Đã tạo HĐ', color: 'cyan' },
  contract_signed: { label: 'Đã ký HĐ', color: 'green' },
};

export const contractStatusConfig: Record<ContractStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'blue' },
  negotiating: { label: 'Đang đàm phán', color: 'cyan' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'orange' },
  approved: { label: 'Đã phê duyệt', color: 'green' },
  signed: { label: 'Đã ký kết', color: 'purple' },
  executing: { label: 'Đang thực hiện', color: 'cyan' },
  acceptance: { label: 'Đang nghiệm thu', color: 'geekblue' },
  settling: { label: 'Đang quyết toán', color: 'orange' },
  completed: { label: 'Hoàn thành', color: 'green' },
  cancelled: { label: 'Đã hủy', color: 'red' },
};

export const workItemStatusConfig: Record<WorkItemStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ thực hiện', color: 'blue' },
  in_progress: { label: 'Đang thực hiện', color: 'cyan' },
  completed: { label: 'Hoàn thành', color: 'green' },
  on_hold: { label: 'Tạm dừng', color: 'orange' },
  cancelled: { label: 'Hủy', color: 'red' },
};

export const workItemTypeConfig: Record<WorkItemType, { label: string; color: string }> = {
  manufacturing: { label: 'Sản xuất', color: '#059669' },
  repair: { label: 'Sửa chữa', color: '#1890ff' },
  overhaul: { label: 'Đại tu', color: '#7c3aed' },
  testing: { label: 'Thử nghiệm', color: '#d97706' },
  assembly: { label: 'Lắp ráp', color: '#0891b2' },
};

export const acceptanceStatusConfig: Record<AcceptanceStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ nghiệm thu', color: 'blue' },
  inspecting: { label: 'Đang kiểm tra', color: 'cyan' },
  passed: { label: 'Đạt', color: 'green' },
  failed: { label: 'Không đạt', color: 'red' },
  remediation: { label: 'Đang khắc phục', color: 'orange' },
  handed_over: { label: 'Đã bàn giao', color: 'green' },
};

export const settlementStatusConfig: Record<SettlementStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'blue' },
  compiling: { label: 'Đang tổng hợp', color: 'cyan' },
  submitted: { label: 'Đã gửi', color: 'geekblue' },
  reviewing: { label: 'Đang xem xét', color: 'orange' },
  approved: { label: 'Đã duyệt', color: 'green' },
  closed: { label: 'Đã đóng', color: 'purple' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning: { label: 'Cảnh báo', color: '#faad14' },
  info: { label: 'Thông tin', color: '#1890ff' },
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return '#52c41a';
  if (progress >= 60) return '#1890ff';
  if (progress >= 30) return '#faad14';
  return '#ff4d4f';
};

export const qualityResultConfig: Record<QualityResult, { label: string; color: string; bg: string }> = {
  passed:      { label: 'ĐẠT',              color: '#059669', bg: '#f0fff4' },
  conditional: { label: 'ĐẠT CÓ ĐIỀU KIỆN', color: '#d97706', bg: '#fffbeb' },
  failed:      { label: 'KHÔNG ĐẠT',        color: '#dc2626', bg: '#fff2f0' },
  pending:     { label: 'Chờ kết quả',       color: '#6b7280', bg: '#f9fafb' },
};

export const defectSeverityConfig: Record<DefectSeverity, { label: string; color: string; antColor: string }> = {
  critical:    { label: 'Nghiêm trọng', color: '#dc2626', antColor: 'red' },
  major:       { label: 'Nghiêm trọng vừa', color: '#d97706', antColor: 'orange' },
  minor:       { label: 'Nhỏ',          color: '#0891b2', antColor: 'blue' },
  observation: { label: 'Quan sát',     color: '#6b7280', antColor: 'default' },
};

export const defectStatusConfig: Record<DefectStatus, { label: string; color: string }> = {
  open:      { label: 'Chưa xử lý', color: 'red' },
  reworking: { label: 'Đang khắc phục', color: 'orange' },
  verified:  { label: 'Đã xác nhận', color: 'green' },
  waived:    { label: 'Bỏ qua (có lý do)', color: 'purple' },
};

export const reworkStatusConfig: Record<ReworkStatus, { label: string; color: string }> = {
  pending:     { label: 'Chờ thực hiện', color: 'blue' },
  in_progress: { label: 'Đang khắc phục', color: 'cyan' },
  completed:   { label: 'Hoàn thành', color: 'orange' },
  verified:    { label: 'Đã xác nhận', color: 'green' },
};

export const handoverStatusConfig: Record<HandoverStatus, { label: string; color: string }> = {
  draft:     { label: 'Nháp', color: 'blue' },
  signed:    { label: 'Đã ký', color: 'green' },
  completed: { label: 'Hoàn tất', color: 'purple' },
};

export const handoverTypeConfig: Record<HandoverType, { label: string; color: string }> = {
  partial: { label: 'Bàn giao từng phần', color: 'blue' },
  final:   { label: 'Bàn giao toàn bộ', color: 'purple' },
};

export const handoverDocTypeConfig: Record<HandoverDocType, { label: string }> = {
  technical_doc: { label: 'Tài liệu kỹ thuật' },
  test_report:   { label: 'Biên bản thử nghiệm' },
  warranty:      { label: 'Phiếu bảo hành' },
  manual:        { label: 'Tài liệu hướng dẫn' },
  other:         { label: 'Khác' },
};

export const inspectionResultConfig: Record<'pass' | 'fail' | 'na', { label: string; color: string }> = {
  pass: { label: 'Đạt', color: 'green' },
  fail: { label: 'Không đạt', color: 'red' },
  na:   { label: 'Đang KT', color: 'default' },
};
