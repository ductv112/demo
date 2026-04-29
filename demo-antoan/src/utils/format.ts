import dayjs from 'dayjs';
import type {
  SafetyStandardStatus,
  SafetyStandardScope,
  HazardCategory,
  RiskLevel,
  RiskStatus,
  RiskDataSource,
  RiskProbability,
  RiskImpact,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
  ViolationStatus,
  ViolationSeverity,
  ViolationSource,
  ForwardedToModule,
  AlertSeverity,
  ControlSheetStatus,
  CheckItemResult,
  ShiftType,
  ImprovementStatus,
  ImprovementSource,
  ImprovementPriority,
} from '../types';

export const formatDate = (date: string): string =>
  dayjs(date).format('DD/MM/YYYY');

export const formatDateTime = (date: string): string =>
  dayjs(date).format('DD/MM/YYYY HH:mm');

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('vi-VN').format(value);

// ─── Tính mức rủi ro từ xác suất × tác động ────────────────────
export const calcRiskLevel = (probability: number, impact: number): RiskLevel => {
  const score = probability * impact;
  if (score >= 15) return 'very_high';
  if (score >= 8)  return 'high';
  if (score >= 4)  return 'medium';
  if (score >= 2)  return 'low';
  return 'very_low';
};

// ─── Status configs ─────────────────────────────────────────────

export const standardStatusConfig: Record<SafetyStandardStatus, { label: string; color: string }> = {
  draft:            { label: 'Nháp',             color: 'default'  },
  pending_approval: { label: 'Chờ phê duyệt',    color: 'warning'  },
  active:           { label: 'Đang áp dụng',     color: 'success'  },
  superseded:       { label: 'Đã thay thế',       color: 'default'  },
  retired:          { label: 'Ngừng áp dụng',    color: 'error'    },
};

export const standardScopeConfig: Record<SafetyStandardScope, { label: string; color: string }> = {
  chung:       { label: 'Chung',           color: '#1B3A5C'    },
  san_xuat:    { label: 'Sản xuất',        color: '#0891b2'    },
  sua_chua:    { label: 'Sửa chữa',        color: '#7c3aed'    },
  dai_tu:      { label: 'Đại tu',          color: '#d97706'    },
  thu_nghiem:  { label: 'Thử nghiệm',      color: '#059669'    },
};

export const hazardCategoryConfig: Record<HazardCategory, { label: string; color: string }> = {
  dien_ap_cao: { label: 'Điện áp cao',     color: '#ff4d4f'    },
  ap_suat_cao: { label: 'Áp suất cao',     color: '#fa8c16'    },
  chay_no:     { label: 'Cháy nổ',         color: '#f5222d'    },
  buc_xa:      { label: 'Bức xạ',          color: '#722ed1'    },
  hoa_chat:    { label: 'Hóa chất',        color: '#d97706'    },
  co_hoc:      { label: 'Cơ học',          color: '#1890ff'    },
  nhiet_do:    { label: 'Nhiệt độ',        color: '#fa541c'    },
  khac:        { label: 'Khác',            color: '#8c8c8c'    },
};

export const riskLevelConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  very_high: { label: 'Rất cao',   color: '#fff', bg: '#cf1322'  },
  high:      { label: 'Cao',       color: '#fff', bg: '#ff4d4f'  },
  medium:    { label: 'Trung bình',color: '#fff', bg: '#fa8c16'  },
  low:       { label: 'Thấp',      color: '#fff', bg: '#faad14'  },
  very_low:  { label: 'Rất thấp', color: '#1a1a2e', bg: '#52c41a' },
};

export const riskDataSourceConfig: Record<RiskDataSource, { label: string; color: string }> = {
  san_xuat:      { label: 'Sản xuất',         color: '#0891b2' },
  sua_chua:      { label: 'Sửa chữa',         color: '#7c3aed' },
  dai_tu:        { label: 'Đại tu',           color: '#d97706' },
  thu_nghiem:    { label: 'Thử nghiệm',       color: '#059669' },
  kiem_tra:      { label: 'Kiểm tra định kỳ', color: '#1890ff' },
  bao_cao_noi_bo:{ label: 'Báo cáo nội bộ',  color: '#8c8c8c' },
};

export const riskStatusConfig: Record<RiskStatus, { label: string; color: string }> = {
  identified: { label: 'Đã nhận diện',    color: 'processing' },
  assessed:   { label: 'Đã đánh giá',     color: 'warning'    },
  controlled: { label: 'Đã kiểm soát',    color: 'success'    },
  accepted:   { label: 'Chấp nhận',       color: 'default'    },
  closed:     { label: 'Đã đóng',         color: 'default'    },
};

export const probabilityLabels: Record<RiskProbability, string> = {
  1: 'Hiếm khi',
  2: 'Ít có khả năng',
  3: 'Có thể',
  4: 'Có khả năng cao',
  5: 'Gần như chắc chắn',
};

export const impactLabels: Record<RiskImpact, string> = {
  1: 'Không đáng kể',
  2: 'Nhẹ',
  3: 'Trung bình',
  4: 'Nghiêm trọng',
  5: 'Thảm khốc',
};

export const incidentStatusConfig: Record<IncidentStatus, { label: string; color: string; step: number }> = {
  new:           { label: 'Mới ghi nhận',     color: 'processing', step: 0 },
  classifying:   { label: 'Đang phân loại',   color: 'warning',    step: 1 },
  investigating: { label: 'Đang điều tra',    color: 'warning',    step: 2 },
  handling:      { label: 'Đang xử lý',       color: 'success',    step: 3 },
  closed:        { label: 'Đã đóng',          color: 'default',    step: 4 },
};

export const incidentSeverityConfig: Record<IncidentSeverity, { label: string; color: string }> = {
  nghiem_trong: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  trung_binh:   { label: 'Trung bình',   color: '#faad14' },
  nhe:          { label: 'Nhẹ',          color: '#52c41a' },
};

export const incidentTypeConfig: Record<IncidentType, { label: string; color: string }> = {
  su_co_thiet_bi: { label: 'Sự cố thiết bị',    color: '#1890ff' },
  tai_nan_lao_dong:{ label: 'Tai nạn lao động',  color: '#ff4d4f' },
  chay_no:        { label: 'Cháy nổ',            color: '#f5222d' },
  ro_ri:          { label: 'Rò rỉ',              color: '#fa8c16' },
  qua_nguong:     { label: 'Vượt ngưỡng',        color: '#faad14' },
  khac:           { label: 'Khác',               color: '#8c8c8c' },
};

export const violationStatusConfig: Record<ViolationStatus, { label: string; color: string }> = {
  new:      { label: 'Mới phát hiện', color: 'processing' },
  handling: { label: 'Đang xử lý',   color: 'warning'    },
  resolved: { label: 'Đã xử lý',     color: 'success'    },
  closed:   { label: 'Đã đóng',      color: 'default'    },
};

export const violationSeverityConfig: Record<ViolationSeverity, { label: string; color: string }> = {
  nghiem_trong: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  nang:         { label: 'Nặng',         color: '#fa8c16' },
  nhe:          { label: 'Nhẹ',          color: '#faad14' },
};

export const forwardedToConfig: Record<ForwardedToModule, { label: string; color: string }> = {
  san_xuat:  { label: 'Quản lý Sản xuất',  color: '#0891b2' },
  sua_chua:  { label: 'Quản lý Sửa chữa',  color: '#7c3aed' },
  dai_tu:    { label: 'Quản lý Đại tu',    color: '#d97706' },
  thu_nghiem:{ label: 'Quản lý Thử nghiệm', color: '#059669' },
};

export const violationSourceConfig: Record<ViolationSource, { label: string }> = {
  quan_ly_san_xuat:   { label: 'Quản lý Sản xuất'         },
  quan_ly_sua_chua:   { label: 'Quản lý Sửa chữa'         },
  quan_ly_dai_tu:     { label: 'Quản lý Đại tu'           },
  quan_ly_thu_nghiem: { label: 'Quản lý Thử nghiệm'       },
  quan_ly_chat_luong: { label: 'Quản lý Chất lượng'       },
  kiem_tra_dinh_ky:   { label: 'Kiểm tra định kỳ'         },
  bao_cao_noi_bo:     { label: 'Báo cáo nội bộ'           },
};

// ─── QT3 — Kiểm soát điều kiện vận hành ────────────────────────
export const controlSheetStatusConfig: Record<ControlSheetStatus, { label: string; color: string }> = {
  pending:     { label: 'Chờ kiểm tra',    color: 'default'    },
  in_progress: { label: 'Đang thực hiện',  color: 'processing' },
  passed:      { label: 'Đạt yêu cầu',     color: 'success'    },
  failed:      { label: 'Không đạt',       color: 'error'      },
};

export const checkItemResultConfig: Record<CheckItemResult, { label: string; color: string }> = {
  pass:    { label: 'Đạt',         color: '#52c41a' },
  fail:    { label: 'Không đạt',   color: '#ff4d4f' },
  na:      { label: 'Không áp dụng', color: '#8c8c8c' },
  pending: { label: 'Chưa kiểm',   color: '#faad14' },
};

export const shiftConfig: Record<ShiftType, { label: string }> = {
  ca1: { label: 'Ca 1 (06:00–14:00)' },
  ca2: { label: 'Ca 2 (14:00–22:00)' },
  ca3: { label: 'Ca 3 (22:00–06:00)' },
};

// ─── QT7 — Cải tiến & Phòng ngừa ────────────────────────────────
export const improvementStatusConfig: Record<ImprovementStatus, { label: string; color: string; step: number }> = {
  proposed:     { label: 'Đề xuất',       color: 'processing', step: 0 },
  approved:     { label: 'Đã phê duyệt',  color: 'warning',    step: 1 },
  implementing: { label: 'Đang triển khai', color: 'processing', step: 2 },
  evaluating:   { label: 'Đang đánh giá', color: 'warning',    step: 3 },
  closed:       { label: 'Đã đóng',       color: 'success',    step: 4 },
  rejected:     { label: 'Từ chối',       color: 'error',      step: 0 },
};

export const improvementSourceConfig: Record<ImprovementSource, { label: string; color: string }> = {
  su_co:    { label: 'Từ sự cố',         color: '#ff4d4f' },
  rui_ro:   { label: 'Từ rủi ro',        color: '#fa8c16' },
  vi_pham:  { label: 'Từ vi phạm',       color: '#faad14' },
  phan_tich:{ label: 'Phân tích xu hướng', color: '#1890ff' },
  kien_nghi:{ label: 'Kiến nghị',        color: '#52c41a' },
};

export const improvementPriorityConfig: Record<ImprovementPriority, { label: string; color: string }> = {
  cao:       { label: 'Cao',        color: '#ff4d4f' },
  trung_binh:{ label: 'Trung bình', color: '#faad14' },
  thap:      { label: 'Thấp',       color: '#52c41a' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning:  { label: 'Cảnh báo',     color: '#faad14' },
  info:     { label: 'Thông tin',    color: '#1890ff' },
};

// ─── Ma trận rủi ro — màu nền ô ────────────────────────────────
export const getRiskMatrixColor = (probability: number, impact: number): string => {
  const score = probability * impact;
  if (score >= 15) return '#cf1322';
  if (score >= 8)  return '#ff4d4f';
  if (score >= 4)  return '#fa8c16';
  if (score >= 2)  return '#faad14';
  return '#52c41a';
};
