// ═══════════════════════════════════════════════════════════════
// Doanh nghiệp A - Mua hàng — Domain Types
// ═══════════════════════════════════════════════════════════════

// ─── Department ──────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
  head: string;
}

// ─── Material / Vật tư ──────────────────────────────────────
export type MaterialCategory = 'spare_part' | 'consumable' | 'equipment' | 'raw_material' | 'component';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  specifications?: string;
  supplier?: string;
  unitPrice: number;
  currentStock: number;
}

// ─── Nhu cầu vật tư (Material Request) ─────────────────────
export type PriorityLevel = 'high' | 'medium' | 'low';
export type MaterialRequestSource = 'technical_plan' | 'replenishment';
export type SourceSystem = 'pkkq-suachua' | 'pkkq-daitu' | 'pkkq-baotri' | 'pkkq-sanxuat' | 'pkkq-kho';

export interface MaterialRequestItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  quantity: number;
  note?: string;
}

export interface MaterialRequest {
  id: string;
  code: string;
  departmentId: string;
  departmentName: string;
  title: string;
  description?: string;
  items: MaterialRequestItem[];
  priority: PriorityLevel;
  source: MaterialRequestSource;
  sourceSystem: SourceSystem;
  relatedTask?: string;
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  note?: string;
}

// ─── Kế hoạch bảo đảm vật tư (Supply Plan) ─────────────────
export type SupplyPlanStatus = 'draft' | 'pending_approval' | 'approved' | 'executing' | 'completed';
export type SupplySource = 'purchase' | 'stock' | 'transfer';

export type SupplyItemStatus = 'pending' | 'ordered' | 'delivering' | 'received' | 'issued' | 'completed';

export interface SupplyPlanItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  unitPrice: number;
  totalNeed: number;
  inStock: number;
  toPurchase: number;
  toTransfer: number;
  estimatedCost: number;
  receivedQty: number;
  issuedQty: number;
  source: SupplySource;
  deadline: string;
  status: SupplyItemStatus;
  fromRequestIds?: string[];
}

export interface SupplyPlan {
  id: string;
  code: string;
  title: string;
  year: number;
  quarter?: number;
  relatedTask?: string;
  materialRequestIds: string[];
  items: SupplyPlanItem[];
  totalEstimated: number;
  approvedBudget: number;
  status: SupplyPlanStatus;
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

// ─── Kế hoạch mua sắm (Procurement Plan) ───────────────────
export type ProcurementPlanStatus = 'draft' | 'estimating' | 'pending_approval' | 'approved' | 'locked' | 'executing' | 'completed';

export interface ProcurementPlanItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
  totalValue: number;
  deadline: string;
  note?: string;
}

export interface ProcurementPlan {
  id: string;
  code: string;
  title: string;
  year: number;
  quarter?: number;
  items: ProcurementPlanItem[];
  totalEstimated: number;
  approvedBudget: number;
  status: ProcurementPlanStatus;
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  note?: string;
}

// ─── Nhà cung cấp (Supplier) ───────────────────────────────
export type SupplierStatus = 'active' | 'inactive' | 'blacklisted';
export type SupplierRating = 'A' | 'B' | 'C' | 'D';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  email?: string;
  contactPerson: string;
  taxCode: string;
  type: 'military' | 'domestic' | 'foreign';
  certifications: string[];
  categories: MaterialCategory[];
  status: SupplierStatus;
  rating: SupplierRating;
  totalContracts: number;
  totalValue: number;
  onTimeRate: number;
  qualityRate: number;
  registeredDate: string;
}

// ─── Báo giá NCC (Supplier Quotation) ──────────────────────
export interface SupplierQuotationItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  unitPrice: number;
  minOrderQty?: number;
  leadTimeDays?: number;
  note?: string;
}

export interface SupplierQuotation {
  id: string;
  supplierId: string;
  quotationCode: string;
  quotationDate: string;
  validUntil: string;
  items: SupplierQuotationItem[];
  attachmentName?: string;
  note?: string;
}

// ─── Đấu thầu (Bidding) ────────────────────────────────────
export type BiddingType = 'open' | 'quotation' | 'direct';
export type BiddingStatus = 'draft' | 'published' | 'receiving' | 'evaluating' | 'approved' | 'completed' | 'cancelled';
export type BiddingMethod = 'one_stage_one_envelope' | 'one_stage_two_envelope' | 'two_stage_two_envelope';
export type ContractType = 'lump_sum' | 'unit_price' | 'time_based' | 'mixed';
export type BiddingScope = 'domestic' | 'international';

export interface BiddingItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
  totalValue: number;
  technicalRequirement?: string;
  deadline: string;
}

export interface QualifiedSupplier {
  supplierId: string;
  supplierName: string;
  checkedBy: string;
  checkedDate: string;
  qualificationStatus: 'qualified' | 'disqualified' | 'pending';
  certifications: string[];
  capacityNote?: string;
  qcConfirmed: boolean;
}

export interface BiddingResult {
  announcementDate?: string;
  announcementCode?: string;
  muasamcongResultUrl?: string;
  resultAttachment?: string;
}

export interface BidSubmission {
  supplierId: string;
  supplierName: string;
  totalPrice: number;
  deliveryDays: number;
  technicalScore: number;
  priceScore: number;
  totalScore: number;
  submittedDate: string;
  note?: string;
  isSelected: boolean;
}

export interface BiddingPackage {
  id: string;
  code: string;
  supplyPlanId: string;
  title: string;
  description: string;

  // Thông tin chung KHLCNT
  khlcntCode?: string;
  khlcntCategory?: string;
  procurementName?: string;
  investor: string;

  // Thông tin gói thầu
  legalBasis: string;
  fundingSource: string;
  sector: string;
  type: BiddingType;
  contractType: ContractType;
  scope: BiddingScope;
  method: BiddingMethod;
  estimatedValue: number;
  executionDays: number;
  hasMultipleLots: boolean;
  items: BiddingItem[];
  technicalRequirements?: string;
  paymentTerms: string;

  // Cách thức dự thầu
  biddingMode: 'online' | 'offline' | 'both';
  eHsmtUrl?: string;
  eHsdtFee?: number;
  eHsdtUrl?: string;
  executionLocation: string;

  // Thông tin dự thầu
  closingDateTime?: string;
  openingDateTime?: string;
  openingLocation?: string;
  hsdtValidityDays?: number;
  depositAmount?: number;
  depositForm?: string;

  // Thông tin phê duyệt
  approvalDecisionNo?: string;
  approvalDate?: string;
  approvalAuthority?: string;
  approvalAttachment?: string;

  // NCC đủ điều kiện (Bước 3)
  qualifiedSuppliers?: QualifiedSupplier[];

  // Công bố kết quả (Bước 7)
  result?: BiddingResult;

  // Hồ sơ dự thầu
  submissions: BidSubmission[];
  status: BiddingStatus;
  publishDate?: string;
  selectedSupplierId?: string;
  selectedSupplierName?: string;

  // Đăng tải muasamcong
  muasamcongCode?: string;
  muasamcongUrl?: string;
  attachments?: string[];

  createdBy: string;
  createdDate: string;
}

// ─── Hợp đồng mua sắm (Contract) ──────────────────────────
export type ContractStatus = 'draft' | 'pending_sign' | 'signed' | 'executing' | 'completed' | 'terminated';

export interface ContractDeliveryItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  plannedQty: number;
  deliveredQty: number;
  acceptedQty: number;
}

export interface ContractDelivery {
  id: string;
  deliveryNo: number;
  plannedDate: string;
  actualDate?: string;
  items: ContractDeliveryItem[];
  status: 'pending' | 'partial' | 'delivered' | 'late' | 'confirmed';
  confirmedBy?: string;
  confirmedDate?: string;
  note?: string;
}

export interface ContractItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  technicalRequirement?: string;
}

export interface ProcurementContract {
  id: string;
  code: string;
  biddingPackageId: string;
  supplierId: string;
  supplierName: string;
  supplierAddress?: string;
  supplierContact?: string;
  title: string;
  items: ContractItem[];
  totalValue: number;
  signedDate: string;
  startDate: string;
  endDate: string;
  paymentTerms: string;
  contractType: 'lump_sum' | 'unit_price';
  deliveries: ContractDelivery[];
  deliveredValue: number;
  paidValue: number;
  remainingValue: number;
  status: ContractStatus;
  attachments?: string[];
  warnings?: { type: string; message: string; date: string }[];
  createdBy: string;
  createdDate: string;
  note?: string;
}

// ─── Theo dõi giao hàng (Delivery Tracking) ────────────────
export type DeliveryTrackingStatus = 'waiting' | 'delivered' | 'inspecting' | 'accepted' | 'rejected' | 'stored';

export interface DeliveryTracking {
  id: string;
  contractId: string;
  contractCode: string;
  deliveryId: string;
  deliveryNo: number;
  supplierId: string;
  supplierName: string;
  plannedDate: string;
  actualDate?: string;
  items: {
    materialId: string;
    materialCode: string;
    materialName: string;
    unit: string;
    orderedQty: number;
    deliveredQty: number;
    acceptedQty: number;
    rejectedQty: number;
  }[];
  status: DeliveryTrackingStatus;
  receivedBy?: string;
  receivedDate?: string;
  qcResult?: 'pass' | 'partial' | 'fail';
  qcDate?: string;
  storedDate?: string;
  warehouseCode?: string;
  source: 'pkkq-kho';
  updatedAt: string;
}

// ─── Xử lý vật tư lỗi (Defect Handling) ────────────────────
export type DefectRequestStatus = 'received' | 'notified' | 'processing' | 'resolved' | 'closed';
export type DefectAction = 'return' | 'replace' | 'repair';

export interface DefectItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  defectQty: number;
  reason: string;
}

export interface DefectRequest {
  id: string;
  code: string;
  contractId: string;
  contractCode: string;
  supplierId: string;
  supplierName: string;
  deliveryTrackingId: string;
  items: DefectItem[];
  totalDefectValue: number;
  action: DefectAction;
  status: DefectRequestStatus;
  reportedBy: string;
  reportedDate: string;
  notifiedDate?: string;
  resolvedDate?: string;
  supplierResponse?: string;
  replacementDeliveryDate?: string;
  note?: string;
  source: 'pkkq-kho' | 'pkkq-chatluong';
}

// ─── Thanh toán (Payment) ───────────────────────────────────
export type PaymentStatus = 'draft' | 'verifying' | 'verified' | 'requested' | 'approved' | 'paid' | 'rejected';

export interface PaymentRecord {
  id: string;
  code: string;
  contractId: string;
  contractCode: string;
  deliveryNo?: number;
  supplierId: string;
  supplierName: string;

  // Hóa đơn NCC
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  invoiceAttachment?: string;

  // Đối soát 3 bên
  matchResult: {
    contractMatch: boolean;
    warehouseMatch: boolean;
    qualityMatch: boolean;
  };
  verifiedValue: number;
  verifiedBy?: string;
  verifiedDate?: string;

  // Đề nghị thanh toán
  paymentAmount: number;
  paymentMethod: 'transfer' | 'advance' | 'direct';
  requestedBy?: string;
  requestedDate?: string;

  // Phê duyệt + Thanh toán
  approvedBy?: string;
  approvedDate?: string;
  paymentDate?: string;
  transactionRef?: string;

  // Đánh giá NCC
  supplierRated: boolean;

  status: PaymentStatus;
  createdBy: string;
  createdDate: string;
  note?: string;
}

// ─── Đánh giá NCC (Supplier Evaluation) ────────────────────
export interface SupplierEvaluation {
  supplierId: string;
  supplierName: string;
  period: string;
  priceScore: number;
  deliveryScore: number;
  qualityScore: number;
  complianceScore: number;
  totalScore: number;
  rating: SupplierRating;
  lateDeliveries: number;
  defectRate: number;
  totalContracts: number;
}

// ─── Lịch sử giá (Price History) ───────────────────────────
export interface PriceHistory {
  materialId: string;
  materialName: string;
  records: {
    year: number;
    supplierId: string;
    supplierName: string;
    unitPrice: number;
    quantity: number;
  }[];
}

// ─── Cảnh báo (Alert) ──────────────────────────────────────
export type AlertType = 'late_delivery' | 'material_shortage' | 'contract_risk' | 'budget_overrun' | 'qc_failed' | 'payment_due';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  relatedEntity: string;
  relatedEntityId: string;
  departmentId?: string;
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

// ─── Monthly stats for charts ───────────────────────────────
export interface MonthlyProcurement {
  month: string;
  ordered: number;
  received: number;
  paid: number;
}
