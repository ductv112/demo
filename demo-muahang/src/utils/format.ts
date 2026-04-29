import dayjs from 'dayjs';
import type {
  MaterialRequestSource,
  SourceSystem,
  SupplyPlanStatus,
  SupplyItemStatus,
  ProcurementPlanStatus,
  BiddingStatus,
  BiddingType,
  BiddingMethod,
  ContractType,
  BiddingScope,
  ContractStatus,
  DeliveryTrackingStatus,
  DefectRequestStatus,
  PaymentStatus,
  AlertSeverity,
  PriorityLevel,
  MaterialCategory,
  SupplierStatus,
  SupplierRating,
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

// ─── Status Configs ─────────────────────────────────────────

export const materialRequestSourceConfig: Record<MaterialRequestSource, { label: string; color: string }> = {
  technical_plan: { label: 'Kế hoạch kỹ thuật', color: '#1B3A5C' },
  replenishment: { label: 'Bổ sung kho', color: '#0891b2' },
};

export const sourceSystemConfig: Record<SourceSystem, { label: string; shortLabel: string }> = {
  'pkkq-suachua': { label: 'Quản lý Sửa chữa', shortLabel: 'Sửa chữa' },
  'pkkq-daitu': { label: 'Quản lý Đại tu', shortLabel: 'Đại tu' },
  'pkkq-baotri': { label: 'Quản lý Bảo trì', shortLabel: 'Bảo trì' },
  'pkkq-sanxuat': { label: 'Quản lý Sản xuất', shortLabel: 'Sản xuất' },
  'pkkq-kho': { label: 'Quản lý Kho tàng', shortLabel: 'Kho' },
};

export const supplyPlanStatusConfig: Record<SupplyPlanStatus, { label: string; color: string }> = {
  draft: { label: 'Đang lập', color: 'default' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
  approved: { label: 'Đã phê duyệt', color: 'success' },
  executing: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
};

export const supplyItemStatusConfig: Record<SupplyItemStatus, { label: string; color: string }> = {
  pending: { label: 'Chưa đặt hàng', color: 'default' },
  ordered: { label: 'Đã đặt hàng', color: 'processing' },
  delivering: { label: 'Đang giao', color: 'warning' },
  received: { label: 'Đã nhận', color: 'cyan' },
  issued: { label: 'Đã cấp phát', color: 'success' },
  completed: { label: 'Hoàn thành', color: 'success' },
};

export const procurementPlanStatusConfig: Record<ProcurementPlanStatus, { label: string; color: string }> = {
  draft: { label: 'Đang lập', color: 'default' },
  estimating: { label: 'Đang dự toán', color: 'processing' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
  approved: { label: 'Đã phê duyệt', color: 'success' },
  locked: { label: 'Đã khóa', color: 'default' },
  executing: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
};

export const biddingStatusConfig: Record<BiddingStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  published: { label: 'Đã đăng tải', color: 'blue' },
  receiving: { label: 'Đang nhận HSDT', color: 'cyan' },
  evaluating: { label: 'Đang đánh giá', color: 'orange' },
  approved: { label: 'Đã phê duyệt', color: 'success' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Hủy', color: 'error' },
};

export const biddingTypeConfig: Record<BiddingType, { label: string; color: string }> = {
  open: { label: 'Đấu thầu rộng rãi', color: '#1B3A5C' },
  quotation: { label: 'Chào giá cạnh tranh', color: '#0891b2' },
  direct: { label: 'Chỉ định thầu', color: '#7c3aed' },
};

export const biddingMethodConfig: Record<BiddingMethod, { label: string }> = {
  one_stage_one_envelope: { label: 'Một giai đoạn một túi hồ sơ' },
  one_stage_two_envelope: { label: 'Một giai đoạn hai túi hồ sơ' },
  two_stage_two_envelope: { label: 'Hai giai đoạn hai túi hồ sơ' },
};

export const contractTypeConfig: Record<ContractType, { label: string }> = {
  lump_sum: { label: 'Trọn gói' },
  unit_price: { label: 'Đơn giá' },
  time_based: { label: 'Theo thời gian' },
  mixed: { label: 'Hỗn hợp' },
};

export const biddingScopeConfig: Record<BiddingScope, { label: string }> = {
  domestic: { label: 'Trong nước' },
  international: { label: 'Quốc tế' },
};

export const contractStatusConfig: Record<ContractStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  pending_sign: { label: 'Chờ ký', color: 'warning' },
  signed: { label: 'Đã ký', color: 'blue' },
  executing: { label: 'Đang thực hiện', color: 'processing' },
  completed: { label: 'Hoàn thành', color: 'success' },
  terminated: { label: 'Chấm dứt', color: 'error' },
};

export const deliveryTrackingStatusConfig: Record<DeliveryTrackingStatus, { label: string; color: string }> = {
  waiting: { label: 'Chờ giao hàng', color: 'default' },
  delivered: { label: 'Đã giao', color: 'blue' },
  inspecting: { label: 'Đang kiểm tra', color: 'warning' },
  accepted: { label: 'Đã nghiệm thu', color: 'cyan' },
  rejected: { label: 'Từ chối', color: 'error' },
  stored: { label: 'Đã nhập kho', color: 'success' },
};

export const defectRequestStatusConfig: Record<DefectRequestStatus, { label: string; color: string }> = {
  received: { label: 'Đã tiếp nhận', color: 'default' },
  notified: { label: 'Đã thông báo NCC', color: 'blue' },
  processing: { label: 'Đang xử lý', color: 'warning' },
  resolved: { label: 'Đã giải quyết', color: 'success' },
  closed: { label: 'Đã đóng', color: 'default' },
};

export const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  verifying: { label: 'Đang đối soát', color: 'processing' },
  verified: { label: 'Đã đối soát', color: 'blue' },
  requested: { label: 'Đã gửi đề nghị', color: 'warning' },
  approved: { label: 'Đã duyệt TT', color: 'cyan' },
  paid: { label: 'Đã thanh toán', color: 'success' },
  rejected: { label: 'Từ chối', color: 'error' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning: { label: 'Cảnh báo', color: '#faad14' },
  info: { label: 'Thông tin', color: '#1890ff' },
};

export const priorityConfig: Record<PriorityLevel, { label: string; color: string }> = {
  high: { label: 'Cao', color: 'error' },
  medium: { label: 'Trung bình', color: 'warning' },
  low: { label: 'Thấp', color: 'default' },
};

export const materialCategoryConfig: Record<MaterialCategory, { label: string; color: string }> = {
  spare_part: { label: 'Linh kiện thay thế', color: '#1B3A5C' },
  consumable: { label: 'Vật tư tiêu hao', color: '#1890ff' },
  equipment: { label: 'Thiết bị', color: '#7c3aed' },
  raw_material: { label: 'Nguyên vật liệu', color: '#0891b2' },
  component: { label: 'Cụm linh kiện', color: '#059669' },
};

export const supplierStatusConfig: Record<SupplierStatus, { label: string; color: string }> = {
  active: { label: 'Đang hoạt động', color: 'success' },
  inactive: { label: 'Ngừng hoạt động', color: 'default' },
  blacklisted: { label: 'Cấm giao dịch', color: 'error' },
};

export const supplierRatingConfig: Record<SupplierRating, { label: string; color: string }> = {
  A: { label: 'Xuất sắc', color: '#52c41a' },
  B: { label: 'Tốt', color: '#1890ff' },
  C: { label: 'Trung bình', color: '#faad14' },
  D: { label: 'Yếu', color: '#ff4d4f' },
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return '#ff4d4f';
  if (progress >= 75) return '#faad14';
  return '#52c41a';
};
