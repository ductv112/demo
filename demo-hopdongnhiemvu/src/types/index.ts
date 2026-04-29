// ═══════════════════════════════════════════════════════════════
// Cấu trúc dữ liệu Doanh nghiệp A - Quản lý Hợp đồng & Dự án Kỹ thuật - Trung tâm phần mềm Alpha
// Flow: Tiếp nhận yêu cầu → Đề xuất/Dự toán → Phê duyệt/Ký HĐ → Phân rã → Theo dõi → Nghiệm thu → Quyết toán
// ═══════════════════════════════════════════════════════════════

// ─── Tổ chức ──────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
  head: string;
}

// ─── Dự án kỹ thuật (Tiếp nhận từ đơn vị) ─────────────────
export type MissionType = 'repair' | 'overhaul' | 'manufacturing' | 'research';
export type MissionPriority = 'urgent' | 'periodic' | 'planned';
export type MissionComplexity = 'low' | 'medium' | 'high' | 'critical';
export type ExecutionScope = 'internal' | 'collaborative' | 'outsourced';
export type MissionStatus =
  | 'draft'              // Đang xử lý (tiếp nhận, kiểm tra, phân loại)
  | 'pending_approval'   // Chờ phê duyệt
  | 'approved'           // Đã phê duyệt
  | 'executing'          // Đang thực hiện (HĐ đã ký)
  | 'completed'          // Hoàn thành
  | 'cancelled';         // Hủy

export interface Mission {
  id: string;
  code: string;                    // Mã dự án: DA-2026-001
  name: string;                    // Tên dự án
  description: string;
  requestingUnit: string;          // Đơn vị giao: Khối K01, Ban TGĐ...
  equipmentType: string;           // Loại sản phẩm: Hệ thống monitoring, Module CRM...
  equipmentQuantity: number;       // Số lượng
  missionType: MissionType;
  priority: MissionPriority;
  status: MissionStatus;
  receivedDate: string;
  deadline: string;                // Thời hạn yêu cầu hoàn thành
  assignedDepartment?: string;     // Phân hệ xử lý chính (PX nào)
  complexity?: MissionComplexity;  // Độ phức tạp kỹ thuật
  executionScope?: ExecutionScope; // Phạm vi thực hiện
  technicalRequirements?: string;
  qualityRequirements?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Đề xuất & Dự toán ──────────────────────────────────────
export type ProposalStatus =
  | 'draft'                  // Nháp — đang lập
  | 'submitted'              // Đã trình — P.KH gửi
  | 'pending_cost_review'    // Chờ thẩm định TC
  | 'cost_reviewing'         // Đang thẩm định
  | 'cost_reviewed'          // Đã thẩm định (TC OK)
  | 'cost_rejected'          // TC từ chối
  | 'pending_approval'       // Chờ phê duyệt (BGĐ)
  | 'approved'               // Đã phê duyệt
  | 'rejected'               // BGĐ từ chối
  | 'revision'               // Yêu cầu chỉnh sửa
  | 'negotiating'            // Đang đàm phán
  | 'contract_created'       // Đã tạo HĐ
  | 'contract_signed';       // Đã ký HĐ

export interface CostItem {
  id: string;
  name: string;
  category: 'material' | 'labor' | 'equipment' | 'overhead' | 'other';
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}

export interface WorkVolume {
  id: string;
  name: string;                    // Tên hạng mục công việc
  description?: string;
  unit: string;                    // ĐVT: Bộ, Cụm, Module...
  quantity: number;
  estimatedDays: number;           // Số ngày dự kiến
  assignedUnit?: string;           // Trung tâm/Phòng ban dự kiến thực hiện
}

export interface Proposal {
  id: string;
  missionId: string;
  code: string;                    // ĐX-2026-001
  technicalPlan: string;           // Mô tả phương án kỹ thuật
  workProcess: string;             // Quy trình công nghệ
  configReference?: string;        // Tham chiếu cấu hình từ phân hệ vòng đời
  workVolumes: WorkVolume[];       // Phân rã khối lượng công việc (B3)
  estimatedDuration: number;       // Thời gian dự kiến (ngày)
  costItems: CostItem[];
  totalCost: number;               // Tổng dự toán (triệu đồng)
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  proposedPrice: number;           // Giá đề xuất
  profitMargin?: number;           // Tỷ lệ lợi nhuận (%)
  status: ProposalStatus;
  currentCostVersion?: number;     // Version chi phí hiện tại
  preparedBy: string;
  preparedAt: string;
  reviewedBy?: string;
  reviewNote?: string;
}

// ─── Cost Version (Versioning chi phí) ───────────────────────
export interface CostVersion {
  id: string;
  proposalId: string;
  version: number;
  type: 'original' | 'review' | 'adjust';
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  totalCost: number;
  proposedPrice: number;
  createdBy: string;
  createdAt: string;
  note?: string;
}

// ─── Approval Request (Yêu cầu phê duyệt) ──────────────────
export type ApprovalRequestType = 'cost_review' | 'approval';
export type ApprovalResult = 'pending' | 'approved' | 'rejected' | 'revision';

export interface ApprovalRequest {
  id: string;
  proposalId: string;
  type: ApprovalRequestType;
  fromRole: 'PKH' | 'TCKT' | 'BGD';
  toRole: 'PKH' | 'TCKT' | 'BGD';
  status: ApprovalResult;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comment?: string;
  costVersionId?: string;          // Version chi phí sau thẩm định
}

// ─── Negotiation Log (Lịch sử đàm phán) ─────────────────────
export interface NegotiationLog {
  id: string;
  proposalId: string;
  contractId?: string;
  type: 'note' | 'meeting' | 'email' | 'price_change' | 'file';
  content: string;
  attachmentPath?: string;
  createdBy: string;
  createdAt: string;
}

// ─── Audit Log ───────────────────────────────────────────────
export interface AuditLog {
  id: string;
  entityType: 'proposal' | 'contract' | 'mission';
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedAt: string;
}

// ─── Hợp đồng ──────────────────────────────────────────────
export type ContractStatus =
  | 'draft'             // Nháp
  | 'negotiating'       // Đang đàm phán
  | 'pending_approval'  // Chờ phê duyệt
  | 'approved'          // Đã phê duyệt
  | 'signed'            // Đã ký kết
  | 'executing'         // Đang thực hiện
  | 'acceptance'        // Đang nghiệm thu
  | 'settling'          // Đang quyết toán
  | 'completed'         // Hoàn thành
  | 'cancelled';        // Hủy

export interface Contract {
  id: string;
  code: string;                    // HĐ-2026-001
  missionId: string;
  proposalId: string;
  name: string;                    // Tên hợp đồng
  contractType: 'contract' | 'assignment';  // Hợp đồng hoặc Quyết định giao NV
  partnerUnit: string;             // Khách hàng / Bên A
  contractValue: number;           // Giá trị HĐ (triệu đồng)
  advancePayment: number;          // Tạm ứng
  signedDate?: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  terms?: string;                  // Điều khoản
  signedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Phân rã công việc (WBS) ─────────────────────────────────
export type WorkItemStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type WorkItemType = 'manufacturing' | 'repair' | 'overhaul' | 'testing' | 'assembly';

export interface WorkItem {
  id: string;
  contractId: string;
  parentId?: string;               // Cho cấu trúc cây
  code: string;                    // WBS-001.01
  name: string;
  description?: string;
  workType: WorkItemType;
  assignedUnit: string;            // Trung tâm/Phòng ban thực hiện
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  plannedQuantity: number;
  completedQuantity: number;
  plannedCost: number;             // Chi phí dự kiến
  actualCost: number;              // Chi phí thực tế
  progress: number;                // % hoàn thành
  status: WorkItemStatus;
  technicalStandard?: string;
  qualityRequirement?: string;
}

// ─── Theo dõi tiến độ ────────────────────────────────────────
export interface ProgressRecord {
  id: string;
  contractId: string;
  workItemId: string;
  reportDate: string;
  reportedBy: string;
  quantityCompleted: number;
  progressPercent: number;
  issues?: string;
  notes?: string;
}

// ─── Nghiệm thu & Bàn giao ──────────────────────────────────
export type AcceptanceStatus = 'pending' | 'inspecting' | 'passed' | 'failed' | 'remediation' | 'handed_over';
export type AcceptanceType = 'phase' | 'final';
export type QualityResult = 'passed' | 'conditional' | 'failed' | 'pending';

export interface AcceptanceRecord {
  id: string;
  contractId: string;
  workItemId?: string;
  code: string;
  type: AcceptanceType;
  name: string;
  cycleNumber: number;             // Số lần nghiệm thu (1, 2, 3...)
  scopeType: 'wbs_item' | 'contract';
  inspectionDate: string;
  inspectorTeam: string;
  qualityResult: QualityResult;
  testResult?: string;
  measurementResult?: string;
  status: AcceptanceStatus;
  handoverDate?: string;
  handoverTo?: string;
  notes?: string;
  isLocked?: boolean;              // true sau khi PASSED — bất biến
  createdAt: string;
}

// ─── Kết quả kiểm tra (Inspection checklist) ─────────────────
export type InspectionResult2 = 'pass' | 'fail' | 'na';

export interface InspectionResult {
  id: string;
  acceptanceId: string;
  checklistItem: string;
  standardRef?: string;
  actualValue: string;
  passThreshold: string;
  result: InspectionResult2;
  inspector: string;
  inspectedAt: string;
}

// ─── Lỗi (Defect) ────────────────────────────────────────────
export type DefectSeverity = 'critical' | 'major' | 'minor' | 'observation';
export type DefectStatus = 'open' | 'reworking' | 'verified' | 'waived';
export type DefectCategory = 'functional' | 'dimensional' | 'surface' | 'documentation';

export interface Defect {
  id: string;
  acceptanceId: string;
  code: string;
  title: string;
  description: string;
  severity: DefectSeverity;
  category: DefectCategory;
  foundBy: string;
  foundAt: string;
  status: DefectStatus;
  waivedReason?: string;
  waivedBy?: string;
}

// ─── Yêu cầu khắc phục (Rework) ─────────────────────────────
export type ReworkStatus = 'pending' | 'in_progress' | 'completed' | 'verified';

export interface ReworkRequest {
  id: string;
  acceptanceId: string;
  code: string;
  description: string;
  defectIds: string[];
  assignedUnit: string;
  dueDate: string;
  status: ReworkStatus;
  progressPercent: number;
  reworkNotes?: string;
  completedAt?: string;
  verifiedBy?: string;
}

// ─── Bàn giao ────────────────────────────────────────────────
export type HandoverStatus = 'draft' | 'signed' | 'completed';
export type HandoverType = 'partial' | 'final';
export type HandoverDocType = 'technical_doc' | 'test_report' | 'warranty' | 'manual' | 'other';

export interface Handover {
  id: string;
  acceptanceId: string;
  contractId: string;
  code: string;
  handoverType: HandoverType;
  handoverDate: string;
  handoverBy: string;
  receivedBy: string;
  receivingUnit: string;
  itemsDescription: string;
  quantity: number;
  conditionNote?: string;
  status: HandoverStatus;
  signedAt?: string;
}

export interface HandoverDocument {
  id: string;
  handoverId: string;
  docType: HandoverDocType;
  docName: string;
  docNumber?: string;
  isRequired: boolean;
  fileAttached: boolean;
}

// ─── Quyết toán ──────────────────────────────────────────────
export type SettlementStatus = 'draft' | 'compiling' | 'submitted' | 'reviewing' | 'approved' | 'closed';
export type SettlementType = 'partial' | 'final';
export type ReconciliationStatus = 'pending' | 'reconciled' | 'discrepancy';
export type VarianceCategory = 'within_budget' | 'minor_overrun' | 'major_overrun' | 'savings';

export interface Settlement {
  id: string;
  contractId: string;
  code: string;                       // QT-2026-001
  version: number;                    // 1, 2, 3...
  parentVersionId?: string;
  settlementType: SettlementType;
  coveredPeriod: { from: string; to: string };
  coveredWorkItemIds: string[];

  // Volume
  plannedQuantity: number;
  acceptedQuantity: number;
  actualQuantity: number;
  quantityVariance: number;
  quantityVariancePct: number;

  // Cost summary
  contractValue: number;
  plannedCost: number;
  actualCost: number;
  costVariance: number;
  costVariancePct: number;

  // Cost breakdown (actual)
  materialCostActual: number;
  laborCostActual: number;
  equipmentCostActual: number;
  overheadCostActual: number;
  indirectCostAllocated: number;

  // Financial result
  revenue: number;
  grossProfit: number;
  profitMargin: number;

  // Reconciliation
  reconciliationStatus: ReconciliationStatus;

  // Workflow
  status: SettlementStatus;
  preparedBy: string;
  preparedAt: string;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Lock
  isLocked: boolean;
  archivedAt?: string;
  archiveRef?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementItem {
  id: string;
  settlementId: string;
  wbsItemId: string;
  workOrderIds: string[];
  itemCode: string;
  itemName: string;
  unit: string;
  contractQuantity: number;
  acceptedQuantity: number;
  actualQuantity: number;
  quantityVariance: number;
  plannedUnitCost: number;
  actualUnitCost: number;
  plannedCost: number;
  actualCost: number;
  costVariance: number;
  costVariancePct: number;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  isIncluded: boolean;
  exclusionReason?: string;
  sortOrder: number;
}

export interface VarianceItem {
  wbsItemId: string;
  itemName: string;
  plannedCost: number;
  actualCost: number;
  variance: number;
  variancePct: number;
  rootCause?: string;
}

export interface VarianceReport {
  id: string;
  settlementId: string;
  generatedAt: string;
  generatedBy: string;
  totalCostVariance: number;
  totalQuantityVariance: number;
  varianceCategory: VarianceCategory;
  topVarianceItems: VarianceItem[];
  explanationRequired: boolean;
  explanationNote?: string;
  approvedWithVariance?: boolean;
  varianceApprovalNote?: string;
}

export interface FinancialTransaction {
  id: string;
  contractId: string;
  wbsItemId?: string;
  transactionCode: string;
  transactionType: 'purchase' | 'labor' | 'depreciation' | 'overhead' | 'advance';
  transactionDate: string;
  amount: number;
  financeSystemRef: string;
  accountCode: string;
  costCenter: string;
  isReconciled: boolean;
  reconciliationNote?: string;
  syncedAt: string;
}

export interface ClosureChecklistItem {
  key: string;
  label: string;
  isMet: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface ContractClosure {
  id: string;
  contractId: string;
  settlementId: string;
  closureDate: string;
  closureReason: 'completed' | 'terminated' | 'expired';
  closedBy: string;
  finalContractValue: number;
  finalActualCost: number;
  finalGrossProfit: number;
  finalProfitMargin: number;
  checklistItems: ClosureChecklistItem[];
  isLocked: boolean;
  lockedAt: string;
  archiveCode: string;
  archiveLocation: string;
  notes?: string;
  createdAt: string;
}

export interface SettlementVersionLog {
  id: string;
  settlementId: string;
  version: number;
  action: 'created' | 'edited' | 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'locked';
  performedBy: string;
  performedAt: string;
  changedFields?: string[];
  comment?: string;
}

// ─── Cảnh báo ─────────────────────────────────────────────────
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType =
  | 'overdue'           // Quá hạn
  | 'behind_schedule'   // Chậm tiến độ
  | 'over_budget'       // Vượt dự toán
  | 'pending_approval'  // Chờ phê duyệt
  | 'quality_issue'     // Vấn đề chất lượng
  | 'acceptance_failed'; // Nghiệm thu không đạt

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  relatedEntity: string;           // 'contract' | 'mission' | 'workItem'
  relatedEntityId: string;
  departmentId?: string;
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

// ─── Báo cáo ─────────────────────────────────────────────────
export interface MonthlyProgress {
  month: string;
  planned: number;
  actual: number;
}

export interface ContractSummary {
  contractId: string;
  contractName: string;
  contractValue: number;
  progress: number;
  costActual: number;
  status: ContractStatus;
  daysRemaining: number;
}
