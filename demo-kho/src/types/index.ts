// ═══════════════════════════════════════════════════════════
// DOANHNGHIEPA-KHO — TypeScript Domain Model
// ═══════════════════════════════════════════════════════════

// ─── Enums & Unions ──────────────────────────────────────

export type ProductType = 'consumable' | 'spare_part' | 'equipment';
export type TrackingType = 'none' | 'lot' | 'serial';
export type ProductStatus = 'active' | 'inactive' | 'pending_approval';

export type WarehouseStatus = 'active' | 'inactive';
export type LocationType = 'internal' | 'supplier' | 'customer' | 'transit' | 'production' | 'scrap' | 'virtual';

export type InboundStatus = 'draft' | 'waiting' | 'receiving' | 'quality_check' | 'done' | 'cancelled';
export type InboundType = 'purchase' | 'production' | 'transfer_in' | 'return';

export type OutboundStatus = 'draft' | 'submitted' | 'approved' | 'picking' | 'packing' | 'done' | 'cancelled';
export type OutboundType = 'dispatch' | 'production' | 'transfer_out' | 'scrap';

export type TransferStatus = 'draft' | 'submitted' | 'approved' | 'in_transit' | 'done' | 'cancelled';

export type StockCountStatus = 'planned' | 'in_progress' | 'done' | 'cancelled';
export type AdjustmentType = 'count' | 'correction' | 'scrap';
export type ScrapCategory = 'damage' | 'expired' | 'defective' | 'other';

export type ReplenishmentStatus = 'draft' | 'submitted' | 'approved' | 'in_progress' | 'done' | 'rejected';
export type ReplenishmentSource = 'demand' | 'forecast' | 'min_stock' | 'manual';
export type ReplenishmentAction = 'purchase' | 'produce' | 'transfer';

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'low_stock' | 'expired' | 'near_expiry' | 'overstock' | 'slow_moving' | 'pending_receipt' | 'pending_dispatch';

export type PackageStatus = 'in_stock' | 'in_transit' | 'opened' | 'dispatched';
export type PackageType   = 'thùng' | 'pallet' | 'container' | 'kiện' | 'túi';

export interface PackageItem {
  productId: string;
  productCode: string;
  productName: string;
  qty: number;
  unit: string;
}

export interface PackageRecord {
  id: string;
  code: string;             // VD: PKG-2025-001
  type: PackageType;
  status: PackageStatus;
  warehouseId?: string;
  warehouseName?: string;
  locationCode?: string;    // vị trí trong kho
  items: PackageItem[];
  totalWeight?: number;     // kg
  dimensions?: string;      // VD: 600x400x300mm
  note?: string;
  inboundOrderId?: string;  // phiếu nhập liên kết
  outboundOrderId?: string; // phiếu xuất liên kết
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Department ──────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
  head: string;
}

// ─── Product (Master Data) ───────────────────────────────

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
}

// Standalone record for UOM management (audit trail, CRUD)
export interface UnitConversionRecord {
  id: string;
  productId: string;
  alternateUnit: string;   // đơn vị thay thế, VD: "Thùng"
  factor: number;          // 1 alternateUnit = factor × baseUnit
  note?: string;           // VD: "Dùng khi nhập từ nhà cung cấp"
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackagingConfig {
  type: string;        // thùng, pallet, kiện
  qtyPerPackage: number;
  weight?: number;
  dimensions?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;          // Nhóm vật tư
  subCategory?: string;
  productType: ProductType;
  trackingType: TrackingType;
  baseUnit: string;          // Đơn vị tính chính
  unitConversions: UnitConversion[];
  packaging?: PackagingConfig;
  specifications?: string;
  manufacturer?: string;
  origin?: string;
  shelfLife?: number;        // ngày
  warrantyMonths?: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  leadTimeDays: number;      // thời gian cung ứng
  leadTimeProduction?: number;
  leadTimeTransport?: number;
  status: ProductStatus;
  militaryGrade?: boolean; // Cờ nội bộ — không hiển thị
  // ── Classification fields (populated after classification is applied) ──
  classificationStatus?: ClassificationStatus;
  currentClassificationId?: string | null;
  qcRequiredOnReceipt?: boolean;
  qcRequiredOnDispatch?: boolean;
  requiresMaintenance?: boolean;
  maintenanceIntervalDays?: number | null;
  criticalPart?: boolean;
  trackExpiry?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Warehouse & Location ────────────────────────────────

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  managerId: string;
  managerName: string;
  status: WarehouseStatus;
  locationCount: number;
  totalProducts: number;
  totalValue: number;        // triệu đồng
  description?: string;
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  code: string;              // VD: A-01-02 (Khu A, Kệ 01, Ngăn 02)
  name: string;
  type: LocationType;
  parentId?: string;         // phân cấp
  capacity?: number;
  currentQty: number;
  isActive: boolean;
}

// ─── Inventory ───────────────────────────────────────────

export interface InventoryItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  locationId?: string;
  locationCode?: string;
  lotNumber?: string;
  serialNumber?: string;
  qtyOnHand: number;         // tồn thực tế
  qtyReserved: number;       // đã giữ
  qtyAvailable: number;      // khả dụng = onHand - reserved
  qtyIncoming: number;       // sắp nhập
  qtyOutgoing: number;       // sắp xuất
  unit: string;
  unitCost: number;          // triệu đồng/đơn vị
  totalValue: number;
  expiryDate?: string;
  receivedDate: string;
  lastMovementDate: string;
}

// ─── Inbound Order (Nhập kho) ────────────────────────────

export interface InboundOrderLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  expectedQty: number;
  receivedQty: number;
  unit: string;
  lotNumber?: string;
  serialNumbers?: string[];
  expiryDate?: string;
  unitCost: number;
  note?: string;
  qcPassed?: boolean;
}

export interface InboundOrder {
  id: string;
  code: string;              // PN-2026-XXX
  type: InboundType;
  warehouseId: string;
  warehouseName: string;
  sourceType: string;        // NCC, Trung tâm, Kho khác
  sourceName: string;
  referenceCode?: string;    // Mã HĐ mua sắm, Lệnh SX
  status: InboundStatus;
  lines: InboundOrderLine[];
  totalItems: number;
  totalValue: number;
  expectedDate: string;
  receivedDate?: string;
  receivedBy?: string;
  qcRequired: boolean;
  qcStatus?: 'pending' | 'passed' | 'failed' | 'partial';
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Outbound Order (Xuất kho) ───────────────────────────

export interface OutboundOrderLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  requestedQty: number;
  pickedQty: number;
  unit: string;
  lotNumber?: string;
  serialNumbers?: string[];
  locationId?: string;
  locationCode?: string;
  unitCost: number;
  note?: string;
}

export interface OutboundOrder {
  id: string;
  code: string;              // PX-2026-XXX
  type: OutboundType;
  warehouseId: string;
  warehouseName: string;
  destinationType: string;   // Trung tâm, Đơn vị, Kho khác
  destinationName: string;
  departmentId?: string;
  referenceCode?: string;    // Mã lệnh SX, Yêu cầu cấp phát
  status: OutboundStatus;
  lines: OutboundOrderLine[];
  totalItems: number;
  totalValue: number;
  requestedDate: string;
  approvedBy?: string;
  approvedAt?: string;
  pickedBy?: string;
  pickedAt?: string;
  dispatchedDate?: string;
  strategy: 'fifo' | 'fefo' | 'nearest';
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Stock Transfer (Điều chuyển) ────────────────────────

export interface TransferLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  qty: number;
  unit: string;
  lotNumber?: string;
  serialNumbers?: string[];
}

export interface StockTransfer {
  id: string;
  code: string;              // DC-2026-XXX
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  status: TransferStatus;
  lines: TransferLine[];
  totalItems: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  note?: string;
  createdAt: string;
}

// ─── Stock Count (Kiểm kê) ──────────────────────────────

export interface StockCountLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  locationId?: string;
  locationCode?: string;
  lotNumber?: string;
  systemQty: number;
  countedQty: number;
  difference: number;
  unit: string;
  reason?: string;
  // ─── Scrap-specific ───────────────────────────────────────
  scrapCategory?: ScrapCategory;  // Loại lý do loại bỏ
  unitValue?: number;             // Đơn giá (triệu VND)
  totalLoss?: number;             // Tổng giá trị tổn thất = systemQty × unitValue
}

export interface StockCount {
  id: string;
  code: string;              // KK-2026-XXX
  warehouseId: string;
  warehouseName: string;
  type: AdjustmentType;
  status: StockCountStatus;
  lines: StockCountLine[];
  totalItems: number;
  totalDifference: number;
  totalLossValue?: number;   // Tổng giá trị tổn thất (scrap only)
  scheduledDate: string;
  completedDate?: string;
  countedBy?: string;
  approvedBy?: string;
  note?: string;
  createdAt: string;
}

// ─── Replenishment (Bổ sung vật tư) ─────────────────────

export interface ReplenishmentLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  forecastDemand: number;
  suggestedQty: number;
  approvedQty?: number;
  reservedQty?: number;      // số lượng đã dự trữ
  unit: string;
  action: ReplenishmentAction;
  leadTimeDays: number;
  neededByDate: string;
  orderByDate: string;
}

export interface Replenishment {
  id: string;
  code: string;              // BS-2026-XXX
  source: ReplenishmentSource;
  status: ReplenishmentStatus;
  warehouseId: string;
  warehouseName: string;
  lines: ReplenishmentLine[];
  totalItems: number;
  totalValue: number;
  period?: string;           // Q2/2026, Tháng 04/2026
  requestedUnit?: string;    // đơn vị yêu cầu (PX1, PKT...)
  requestedBy?: string;      // người tạo yêu cầu
  purpose?: 'issue' | 'production' | 'repair' | 'internal';
  demandRef?: string;        // mã tham chiếu nhu cầu gốc (VD: YC-2026-015)
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
  createdAt: string;
}

// ─── Alert ───────────────────────────────────────────────

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  productId?: string;
  warehouseId?: string;
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

// ─── Product Classification (Phân loại & Thuộc tính vật tư) ─────────────────

export type ClassificationStatus =
  | 'not_classified'
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'applied'
  | 'rejected'
  | 'returned_for_edit';

export interface ManagementAttributes {
  trackExpiry: boolean;
  shelfLife: number | null;
  qcRequiredOnReceipt: boolean;
  qcRequiredOnDispatch: boolean;
  requiresMaintenance: boolean;
  maintenanceIntervalDays: number | null;
  criticalPart: boolean;
}

export interface ClassificationAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  fromStatus?: ClassificationStatus;
  toStatus?: ClassificationStatus;
  fieldsChanged?: string[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  note?: string;
}

export interface ProductClassificationRecord extends ManagementAttributes {
  id: string;
  code: string;                          // PC-2026-XXX
  productId: string;
  productCode: string;
  productName: string;
  productCategory: string;
  classificationStatus: ClassificationStatus;
  version: number;
  productType: ProductType;
  trackingType: TrackingType;
  militaryGrade: boolean;
  // minStock / maxStock / reorderPoint đã tách sang StockParameterRecord
  classificationReason: string;
  submittedBy: string | null;
  submittedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  approvalNote: string | null;
  appliedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  note: string | null;
  auditLog: ClassificationAuditEntry[];
}

// ─── Stock Parameter (Tham số tồn kho) ───────────────────────────────────────
// Entity độc lập — lịch sử đầy đủ, duyệt Trưởng phòng (không cần BGĐ)

export type StockParameterStatus = 'draft' | 'pending_approval' | 'approved' | 'applied';

export interface StockParameterAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  fromStatus?: StockParameterStatus;
  toStatus?: StockParameterStatus;
  oldValues?: { minStock?: number; maxStock?: number; reorderPoint?: number };
  newValues?: { minStock?: number; maxStock?: number; reorderPoint?: number };
  note?: string;
}

export interface StockParameterRecord {
  id: string;
  code: string;                          // SP-2026-XXX
  productId: string;
  productCode: string;
  productName: string;
  status: StockParameterStatus;
  version: number;                       // tăng mỗi lần thay đổi được duyệt
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  effectiveFrom: string;                 // ngày có hiệu lực sau khi applied
  changeReason: string;                  // lý do thay đổi tham số
  submittedBy: string | null;
  submittedAt: string | null;
  approvedBy: string | null;             // Trưởng phòng P.KH/P.LGKT — không phải BGĐ
  approvedAt: string | null;
  approvalNote: string | null;
  appliedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  auditLog: StockParameterAuditEntry[];
}

// ─── Product Creation Request (Yêu cầu bổ sung danh mục) ────────────────────

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'checking_duplicate'
  | 'duplicate_found'
  | 'unique_confirmed'
  | 'pending_normalization'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'returned_for_edit'
  | 'initializing'
  | 'initialized'
  | 'published'
  | 'closed_duplicate';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  fromStatus?: RequestStatus;
  toStatus?: RequestStatus;
  note?: string;
}

export interface DuplicateCandidate {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  similarity: number;   // 0–100 percent
  matchReason: string;  // e.g. "Tên trùng 87%, cùng danh mục"
}

export interface ProductCreationRequest {
  id: string;
  requestCode: string;          // YC-2026-XXX
  status: RequestStatus;

  // Thông tin do người yêu cầu nhập
  requestedName: string;
  requestedCategory: string;
  requestedType: ProductType;
  requestedUnit: string;
  purpose: string;
  specifications?: string;
  estimatedQty?: number;

  // Người yêu cầu
  requesterDeptId: string;
  requesterDeptName: string;
  requesterName: string;

  // Kết quả kiểm tra trùng lặp
  duplicateCandidates?: DuplicateCandidate[];
  duplicateCheckNote?: string;

  // Sau chuẩn hóa (P.KT điền)
  normalizedName?: string;
  normalizedCategory?: string;
  normalizedType?: ProductType;
  normalizedUnit?: string;
  assignedCode?: string;
  normalizationNote?: string;

  // Phê duyệt
  approvedBy?: string;
  approvedAt?: string;
  approvalNote?: string;
  rejectionReason?: string;

  // Sản phẩm liên kết
  linkedProductId?: string;   // nếu đóng do trùng
  productMasterId?: string;   // sau khi khởi tạo

  // Timestamps
  submittedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Lịch sử thao tác
  auditLog: AuditLogEntry[];
}

// ─── Tracking (Theo dõi vật tư theo serial / lô) ────────

export type TrackingItemStatus = 'in_stock' | 'in_use' | 'in_transit' | 'maintenance' | 'disposed' | 'returned';

export interface TrackingMovement {
  id: string;
  date: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'issue' | 'return' | 'maintenance_send' | 'maintenance_return' | 'scrap';
  fromWarehouseId?: string;
  fromWarehouseName?: string;
  fromLocation?: string;
  toWarehouseId?: string;
  toWarehouseName?: string;
  toLocation?: string;
  quantity: number;
  unit: string;
  orderId?: string;
  orderCode?: string;
  performedBy: string;
  department?: string;
  note?: string;
}

export interface TrackingRecord {
  id: string;
  trackingCode: string;
  trackingType: 'serial' | 'lot';
  productId: string;
  productCode: string;
  productName: string;
  productCategory: string;
  baseUnit: string;
  status: TrackingItemStatus;
  currentQuantity: number;
  initialQuantity: number;
  currentWarehouseId?: string;
  currentWarehouseName?: string;
  currentLocation?: string;
  currentUnitId?: string;
  currentUnitName?: string;
  receivedDate: string;
  inboundOrderId?: string;
  inboundOrderCode?: string;
  supplier?: string;
  unitPrice?: number;
  expiryDate?: string;
  movements: TrackingMovement[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Lifecycle & Expiry (Vòng đời & Hạn sử dụng) ────────

export type LifecycleStatus = 'valid' | 'near_expiry' | 'expired' | 'disposed' | 'recalled';

export type LifecycleEventType =
  | 'registered'
  | 'warning_issued'
  | 'recalled'
  | 'disposed'
  | 'transferred'
  | 'extended'
  | 'checked';

export interface LifecycleEvent {
  id: string;
  date: string;
  type: LifecycleEventType;
  actor: string;
  department?: string;
  note?: string;
}

export interface LifecycleRecord {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  productCategory: string;
  trackingType: 'serial' | 'lot';
  trackingCode: string;
  warehouseId?: string;
  warehouseName?: string;
  location?: string;
  quantity: number;
  unit: string;
  manufactureDate?: string;
  receivedDate: string;
  expiryDate: string;
  warningDays: number;       // số ngày trước hạn để cảnh báo
  status: LifecycleStatus;
  daysRemaining: number;     // âm = đã hết hạn
  inboundOrderCode?: string;
  supplier?: string;
  handledAt?: string;
  handledBy?: string;
  handlingNote?: string;
  events: LifecycleEvent[];
  createdAt: string;
  updatedAt: string;
}

// ─── Movement History ────────────────────────────────────

export interface MovementHistory {
  id: string;
  date: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'scrap';
  referenceCode: string;
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  locationCode?: string;
  qty: number;
  unit: string;
  lotNumber?: string;
  serialNumber?: string;
  counterparty: string;
  performedBy: string;
}

// ─── 4.1.7 Truy xuất nguồn gốc vật tư ───────────────────
export type TraceEventType =
  | 'inbound'      // Nhập kho
  | 'stored'       // Nhập vị trí lưu
  | 'transferred'  // Điều chuyển kho
  | 'dispatched'   // Cấp phát cho đơn vị
  | 'returned'     // Trả về kho
  | 'checked'      // Kiểm tra / kiểm định
  | 'adjusted'     // Điều chỉnh tồn
  | 'scrapped';    // Thanh lý / hủy

export type TraceCurrentStatus = 'in_stock' | 'dispatched' | 'in_use' | 'returned' | 'transferred' | 'scrapped';

export interface TraceEvent {
  id: string;
  date: string;
  type: TraceEventType;
  fromLocation?: string;   // kho/bộ phận xuất phát
  toLocation?: string;     // kho/bộ phận đích
  actor: string;           // người thực hiện
  department: string;      // phòng ban
  docRef?: string;         // số phiếu/lệnh tham chiếu
  quantity?: number;
  unit?: string;
  note?: string;
}

export interface TraceabilityRecord {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  productCategory: string;
  trackingType: 'serial' | 'lot';
  trackingCode: string;
  // Nguồn gốc
  supplier: string;
  supplierCountry?: string;
  inboundOrderCode: string;
  inboundDate: string;
  contractRef?: string;
  // Trạng thái hiện tại
  currentStatus: TraceCurrentStatus;
  currentLocation?: string;
  currentDept?: string;
  currentQty: number;
  totalQty: number;
  unit: string;
  // Lịch sử sự kiện
  events: TraceEvent[];
  createdAt: string;
  updatedAt: string;
}

// ─── 4.1.8 Kiểm soát & chuẩn hóa dữ liệu ───────────────
export type DataIssueType      = 'duplicate' | 'missing_field' | 'non_standard' | 'inconsistent';
export type DataIssueSeverity  = 'critical' | 'warning' | 'info';
export type DataIssueStatus    = 'open' | 'in_review' | 'resolved' | 'ignored';

export interface DataIssue {
  id: string;
  type: DataIssueType;
  severity: DataIssueSeverity;
  status: DataIssueStatus;
  affectedCodes: string[];    // mã vật tư liên quan
  affectedNames: string[];    // tên vật tư liên quan
  field?: string;             // trường dữ liệu có vấn đề
  description: string;        // mô tả vấn đề
  suggestion?: string;        // gợi ý xử lý
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  note?: string;
}
