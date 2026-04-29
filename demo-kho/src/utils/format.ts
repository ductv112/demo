import dayjs from 'dayjs';
import type {
  InboundStatus, OutboundStatus, TransferStatus, StockCountStatus,
  ReplenishmentStatus, ProductStatus, ProductType, TrackingType,
  AlertSeverity, AlertType, LocationType, AdjustmentType, RequestStatus,
  ClassificationStatus, ManagementAttributes, StockParameterStatus,
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

// ─── Status Configs ──────────────────────────────────────

export const inboundStatusConfig: Record<InboundStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  waiting: { label: 'Chờ nhận hàng', color: 'blue' },
  receiving: { label: 'Đang nhận', color: 'blue' },
  quality_check: { label: 'Kiểm tra CL', color: 'warning' },
  done: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const outboundStatusConfig: Record<OutboundStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  submitted: { label: 'Đã gửi', color: 'blue' },
  approved: { label: 'Đã duyệt', color: 'success' },
  picking: { label: 'Đang lấy hàng', color: 'blue' },
  packing: { label: 'Đóng gói', color: 'warning' },
  done: { label: 'Đã xuất', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const transferStatusConfig: Record<TransferStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  submitted: { label: 'Đã gửi', color: 'blue' },
  approved: { label: 'Đã duyệt', color: 'success' },
  in_transit: { label: 'Đang vận chuyển', color: 'warning' },
  done: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const stockCountStatusConfig: Record<StockCountStatus, { label: string; color: string }> = {
  planned: { label: 'Đã lên lịch', color: 'default' },
  in_progress: { label: 'Đang kiểm kê', color: 'blue' },
  done: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export const replenishmentStatusConfig: Record<ReplenishmentStatus, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'default' },
  submitted: { label: 'Đã gửi', color: 'blue' },
  approved: { label: 'Đã duyệt', color: 'success' },
  in_progress: { label: 'Đang thực hiện', color: 'blue' },
  done: { label: 'Hoàn thành', color: 'success' },
  rejected: { label: 'Từ chối', color: 'error' },
};

export const productStatusConfig: Record<ProductStatus, { label: string; color: string }> = {
  active: { label: 'Đang sử dụng', color: 'success' },
  inactive: { label: 'Ngừng sử dụng', color: 'default' },
  pending_approval: { label: 'Chờ phê duyệt', color: 'warning' },
};

export const productTypeConfig: Record<ProductType, { label: string; color: string }> = {
  consumable: { label: 'Vật tư tiêu hao', color: '#1890ff' },
  spare_part: { label: 'Linh kiện thay thế', color: '#52c41a' },
  equipment: { label: 'Thiết bị', color: '#722ed1' },
};

export const trackingTypeConfig: Record<TrackingType, { label: string; color: string }> = {
  none: { label: 'Không theo dõi', color: 'default' },
  lot: { label: 'Theo lô', color: 'blue' },
  serial: { label: 'Theo serial', color: 'purple' },
};

export const locationTypeConfig: Record<LocationType, { label: string; color: string }> = {
  internal: { label: 'Nội bộ', color: 'blue' },
  supplier: { label: 'Nhà cung cấp', color: 'green' },
  customer: { label: 'Khách hàng', color: 'orange' },
  transit: { label: 'Trung chuyển', color: 'cyan' },
  production: { label: 'Sản xuất', color: 'purple' },
  scrap: { label: 'Thất thoát', color: 'red' },
  virtual: { label: 'Ảo', color: 'default' },
};

export const adjustmentTypeConfig: Record<AdjustmentType, { label: string; color: string }> = {
  count: { label: 'Kiểm kê', color: 'blue' },
  correction: { label: 'Điều chỉnh', color: 'orange' },
  scrap: { label: 'Loại bỏ', color: 'red' },
};

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: 'Nghiêm trọng', color: '#ff4d4f' },
  warning: { label: 'Cảnh báo', color: '#faad14' },
  info: { label: 'Thông tin', color: '#1890ff' },
};

export const alertTypeConfig: Record<AlertType, { label: string; color: string }> = {
  low_stock: { label: 'Dưới mức tối thiểu', color: '#ff4d4f' },
  expired: { label: 'Đã hết hạn', color: '#ff4d4f' },
  near_expiry: { label: 'Sắp hết hạn', color: '#faad14' },
  overstock: { label: 'Vượt mức tối đa', color: '#faad14' },
  slow_moving: { label: 'Chậm luân chuyển', color: '#1890ff' },
  pending_receipt: { label: 'Chờ nhận hàng', color: '#1890ff' },
  pending_dispatch: { label: 'Chờ xuất hàng', color: '#1890ff' },
};

export const requestStatusConfig: Record<RequestStatus, { label: string; color: string; description: string }> = {
  draft:                { label: 'Nháp',           color: 'default',    description: 'Đang soạn thảo, chưa nộp' },
  submitted:            { label: 'Đã nộp',          color: 'blue', description: 'Đã nộp, chờ kiểm tra trùng lặp' },
  checking_duplicate:   { label: 'Kiểm tra trùng',  color: 'blue', description: 'Đang so sánh với danh mục hiện có' },
  duplicate_found:      { label: 'Phát hiện trùng', color: 'warning',    description: 'Có sản phẩm tương tự, chờ xử lý' },
  unique_confirmed:     { label: 'Không trùng',     color: 'success',    description: 'Xác nhận không trùng, chờ chuẩn hóa' },
  pending_normalization:{ label: 'Chờ chuẩn hóa',  color: 'warning',    description: 'P.KT đang chuẩn hóa thông tin' },
  pending_approval:     { label: 'Chờ phê duyệt',   color: 'warning',    description: 'Chờ Ban Giám đốc phê duyệt' },
  approved:             { label: 'Đã phê duyệt',    color: 'success',    description: 'BGĐ đã phê duyệt, chờ khởi tạo mã' },
  rejected:             { label: 'Từ chối',          color: 'error',      description: 'BGĐ từ chối yêu cầu' },
  returned_for_edit:    { label: 'Trả về sửa',      color: 'orange',     description: 'Trả về để bổ sung/chỉnh sửa thông tin' },
  initializing:         { label: 'Đang khởi tạo',   color: 'blue', description: 'Hệ thống đang tạo mã và khởi tạo sản phẩm' },
  initialized:          { label: 'Đã khởi tạo',     color: 'cyan',       description: 'Sản phẩm đã có mã, chờ ban hành' },
  published:            { label: 'Đã ban hành',      color: 'success',    description: 'Sản phẩm sẵn sàng sử dụng trong hệ thống' },
  closed_duplicate:     { label: 'Đóng (Trùng)',    color: 'default',    description: 'Đã chọn dùng sản phẩm hiện có, yêu cầu đóng' },
};

export const getStockLevelColor = (current: number, min: number, max: number): string => {
  if (current <= 0) return '#ff4d4f';
  if (current < min) return '#ff4d4f';
  if (current < min * 1.5) return '#faad14';
  if (current > max) return '#722ed1';
  return '#52c41a';
};

// ─── Classification Status Config ────────────────────────

export const classificationStatusConfig: Record<ClassificationStatus, { label: string; color: string; description: string }> = {
  not_classified:   { label: 'Chưa phân loại',   color: 'default',    description: 'Vật tư chưa được phân loại và gán thuộc tính' },
  draft:            { label: 'Đang soạn',          color: 'blue', description: 'Đang soạn thảo thông tin phân loại' },
  pending_approval: { label: 'Chờ phê duyệt',      color: 'warning',    description: 'Đã trình Ban Giám đốc phê duyệt' },
  approved:         { label: 'Đã phê duyệt',        color: 'success',    description: 'BGĐ đã phê duyệt, đang áp dụng vào hệ thống' },
  applied:          { label: 'Đã áp dụng',          color: '#1B3A5C',   description: 'Phân loại đã được áp dụng vào danh mục vật tư' },
  rejected:         { label: 'Bị từ chối',          color: 'error',      description: 'BGĐ từ chối, cần chỉnh sửa và trình lại' },
  returned_for_edit:{ label: 'Trả lại sửa',         color: 'orange',     description: 'Trả về để bổ sung hoặc chỉnh sửa thông tin' },
};

// ─── Attribute rules per product type ────────────────────

export interface AttributeRule {
  field: keyof ManagementAttributes;
  rule: 'required' | 'allowed' | 'forbidden';
  defaultValue?: unknown;
}

export const productTypeAttributeRules: Record<ProductType, AttributeRule[]> = {
  consumable: [
    { field: 'trackExpiry',              rule: 'allowed',   defaultValue: false },
    { field: 'shelfLife',                rule: 'allowed',   defaultValue: null },
    { field: 'requiresMaintenance',      rule: 'forbidden', defaultValue: false },
    { field: 'maintenanceIntervalDays',  rule: 'forbidden', defaultValue: null },
    { field: 'qcRequiredOnReceipt',      rule: 'allowed',   defaultValue: false },
    { field: 'qcRequiredOnDispatch',     rule: 'allowed',   defaultValue: false },
    { field: 'criticalPart',             rule: 'allowed',   defaultValue: false },
  ],
  spare_part: [
    { field: 'trackExpiry',              rule: 'allowed',   defaultValue: false },
    { field: 'shelfLife',                rule: 'allowed',   defaultValue: null },
    { field: 'requiresMaintenance',      rule: 'allowed',   defaultValue: false },
    { field: 'maintenanceIntervalDays',  rule: 'allowed',   defaultValue: null },
    { field: 'qcRequiredOnReceipt',      rule: 'required',  defaultValue: true },
    { field: 'qcRequiredOnDispatch',     rule: 'allowed',   defaultValue: true },
    { field: 'criticalPart',             rule: 'allowed',   defaultValue: false },
  ],
  equipment: [
    { field: 'trackExpiry',              rule: 'allowed',   defaultValue: false },
    { field: 'shelfLife',                rule: 'allowed',   defaultValue: null },
    { field: 'requiresMaintenance',      rule: 'required',  defaultValue: true },
    { field: 'maintenanceIntervalDays',  rule: 'required',  defaultValue: 365 },
    { field: 'qcRequiredOnReceipt',      rule: 'required',  defaultValue: true },
    { field: 'qcRequiredOnDispatch',     rule: 'required',  defaultValue: true },
    { field: 'criticalPart',             rule: 'allowed',   defaultValue: false },
  ],
};

// ─── Validate classification attributes ──────────────────

export interface ValidationError { field: string; message: string; type: 'error' | 'warning' }

export const validateClassification = (
  productType: ProductType,
  trackingType: TrackingType,
  attrs: Partial<ManagementAttributes>,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // R01 — Equipment must use serial tracking
  if (productType === 'equipment' && trackingType !== 'serial') {
    errors.push({ field: 'trackingType', message: 'Thiết bị bắt buộc phải theo dõi theo serial', type: 'error' });
  }

  // R02 — Equipment must have maintenance
  if (productType === 'equipment' && !attrs.requiresMaintenance) {
    errors.push({ field: 'requiresMaintenance', message: 'Thiết bị bắt buộc phải có yêu cầu bảo trì', type: 'error' });
  }
  if (productType === 'equipment' && attrs.requiresMaintenance && !attrs.maintenanceIntervalDays) {
    errors.push({ field: 'maintenanceIntervalDays', message: 'Phải nhập chu kỳ bảo trì cho thiết bị', type: 'error' });
  }

  // R03 — Consumable cannot have maintenance
  if (productType === 'consumable' && attrs.requiresMaintenance) {
    errors.push({ field: 'requiresMaintenance', message: 'Vật tư tiêu hao không được gán yêu cầu bảo trì', type: 'error' });
  }

  // R04 — trackExpiry requires shelfLife
  if (attrs.trackExpiry && !attrs.shelfLife) {
    errors.push({ field: 'shelfLife', message: 'Phải nhập hạn sử dụng khi bật theo dõi hạn sử dụng', type: 'error' });
  }

  // Warnings
  if (productType === 'spare_part' && !attrs.qcRequiredOnReceipt) {
    errors.push({ field: 'qcRequiredOnReceipt', message: 'Linh kiện thay thế thường yêu cầu QC khi nhập kho', type: 'warning' });
  }

  return errors;
};

// ─── Stock Parameter validation ───────────────────────────

export const validateStockParameters = (
  minStock: number,
  maxStock: number,
  reorderPoint: number,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // SP-R01 — maxStock > minStock
  if (maxStock <= minStock) {
    errors.push({ field: 'maxStock', message: 'Mức tồn tối đa phải lớn hơn mức tồn tối thiểu', type: 'error' });
  }

  // SP-R02 — reorderPoint between min and max
  if (reorderPoint < minStock) {
    errors.push({ field: 'reorderPoint', message: `Điểm tái đặt hàng (${reorderPoint}) phải ≥ mức tối thiểu (${minStock})`, type: 'error' });
  }
  if (reorderPoint > maxStock) {
    errors.push({ field: 'reorderPoint', message: `Điểm tái đặt hàng (${reorderPoint}) phải ≤ mức tối đa (${maxStock})`, type: 'error' });
  }

  return errors;
};

// ─── Stock Parameter Status Config ───────────────────────

export const stockParameterStatusConfig: Record<StockParameterStatus, { label: string; color: string; description: string }> = {
  draft:            { label: 'Nháp',          color: 'default',    description: 'Đang soạn thảo, chưa trình duyệt' },
  pending_approval: { label: 'Chờ duyệt',     color: 'warning',    description: 'Đang chờ Trưởng phòng phê duyệt' },
  approved:         { label: 'Đã duyệt',      color: 'success',    description: 'Đã được duyệt, chờ áp dụng' },
  applied:          { label: 'Đang áp dụng',  color: '#1B3A5C',    description: 'Tham số đang có hiệu lực' },
};
