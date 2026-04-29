// ═══════════════════════════════════════════════════════════════
// Types cho Quản lý Bảo trì — Doanh nghiệp A
// ═══════════════════════════════════════════════════════════════

// --- Đơn vị tổ chức ---
export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
  head?: string;
}

// --- Nhân sự bảo trì ---
export type StaffStatus = 'active' | 'on_leave' | 'transferred' | 'inactive';
export type SkillLevel = 'basic' | 'intermediate' | 'advanced';

export interface MaintenanceStaff {
  id: string;
  name: string;
  staffCode: string;
  departmentId: string;
  departmentName: string;
  position: string;
  specialization: string;
  status: StaffStatus;
  phone?: string;
  skills: StaffSkill[];
  certificates: Certificate[];
  teamId?: string;
}

export interface StaffSkill {
  equipmentType: string;
  level: SkillLevel;
  experienceCount: number;
}

export interface Certificate {
  id: string;
  name: string;
  number: string;
  issuedDate: string;
  expiryDate: string;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
}

// --- Đội bảo trì ---
export type TeamType = 'fixed' | 'flexible';

export interface MaintenanceTeam {
  id: string;
  name: string;
  type: TeamType;
  leaderId: string;
  leaderName: string;
  departmentId: string;
  departmentName: string;
  memberCount: number;
  specialization: string;
  members: string[];
}

// --- Quy trình bảo trì (Template) ---
export type ProcedureStatus = 'draft' | 'active' | 'archived';

export interface MaintenanceProcedure {
  id: string;
  code: string;
  name: string;
  equipmentType: string;
  equipmentCategory: 'radar' | 'missile' | 'communication' | 'electronic' | 'mechanical' | 'general';
  type: 'periodic' | 'corrective';
  version: string;
  status: ProcedureStatus;
  // Template hạng mục công việc
  workItemTemplates: ProcedureWorkItem[];
  // Vật tư gợi ý
  suggestedParts: ProcedureSuggestedPart[];
  // Tổng thời gian dự kiến (tự tính từ hạng mục)
  totalEstimatedHours: number;
  // Tài liệu kỹ thuật
  documents: TechnicalDocument[];
  // Lịch sử phiên bản
  versionHistory: ProcedureVersion[];
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  approvedBy?: string;
  approvedDate?: string;
  description?: string;
}

// Hạng mục công việc template (sinh ra PlanWorkItem khi chọn quy trình)
export interface ProcedureWorkItem {
  id: string;
  order: number;
  name: string;
  description?: string;
  estimatedHours: number;
  isMandatory: boolean;
  requiredSkill?: string;    // chuyên môn yêu cầu
  // Checklist cho hạng mục này
  checklistItems: ProcedureChecklistItem[];
}

export interface ProcedureChecklistItem {
  id: string;
  order: number;
  content: string;
  isMandatory: boolean;
}

// Vật tư gợi ý khi dùng quy trình này
export interface ProcedureSuggestedPart {
  productId?: string;
  partCode: string;
  partName: string;
  quantity: number;
  unit: string;
  notes?: string;
}

// Lịch sử phiên bản
export interface ProcedureVersion {
  version: string;
  changedBy: string;
  changedDate: string;
  changeDescription: string;
}

export interface TechnicalDocument {
  id: string;
  name: string;
  type: 'pdf' | 'drawing' | 'manual' | 'diagram';
  fileName: string;
  uploadDate: string;
}

// Backward compat
export type ProcedureStep = ProcedureWorkItem;

// --- Kế hoạch bảo trì ---
export type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type PlanPriority = 'low' | 'medium' | 'high' | 'critical';

export type PlanSource = 'auto' | 'manual';

export interface MaintenancePlan {
  id: string;
  code: string;
  name: string;
  type: 'periodic' | 'corrective' | 'inspection';
  status: PlanStatus;
  priority: PlanPriority;
  source: PlanSource;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  teamId: string;
  teamName: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  description: string;
  createdDate: string;
  createdBy: string;
  approvedBy?: string;
  approvedDate?: string;
  estimatedDuration: number; // giờ
  spareParts: SparePartRequest[];
  workItems: PlanWorkItem[];
}

// --- Đầu mục công việc (line items) ---
export type WorkItemStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface PlanWorkItem {
  id: string;
  order: number;
  name: string;
  description?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  estimatedHours: number;
  actualHours?: number;
  status: WorkItemStatus;
  isMandatory: boolean;
  notes?: string;
}

// --- Phiếu công việc bảo trì (PO) ---
export type POStatus = 'draft' | 'assigned' | 'in_progress' | 'checking' | 'evaluated' | 'accepted' | 'rejected' | 'cancelled';
export type EvaluationResult = 'pass' | 'pass_with_conditions' | 'fail';

export interface MaintenanceWorkOrder {
  id: string;
  code: string;
  planId: string;
  planCode: string;
  workItemId: string;
  workItemName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  status: POStatus;
  assignedStaffId: string;
  assignedStaffName: string;
  teamId: string;
  teamName: string;
  scheduledDate: string;
  estimatedHours: number;
  actualHours?: number;
  actualStart?: string;
  actualEnd?: string;
  isMandatory: boolean;
  description?: string;
  // Checklist
  checklistItems: POChecklistItem[];
  // Vật tư sử dụng
  spareParts: SparePartUsage[];
  // Đánh giá kết quả
  evaluation?: POEvaluation;
}

export interface POChecklistItem {
  id: string;
  order: number;
  content: string;
  isCompleted: boolean;
  notes?: string;
}

export interface POEvaluation {
  result: EvaluationResult;
  measurements: POTestResult[];
  evaluatorNotes: string;
  evaluatorName: string;
  evaluatedDate: string;
  // Nghiệm thu
  acceptedBy?: string;
  acceptedDate?: string;
  acceptanceNotes?: string;
}

export interface POTestResult {
  id: string;
  parameter: string;
  standardValue: string;
  measuredValue: string;
  unit: string;
  status: 'pass' | 'fail' | 'warning';
  notes?: string;
}

// --- Lệnh bảo trì định kỳ (legacy) ---
export type WorkOrderStatus = 'pending' | 'preparing' | 'locked' | 'in_progress' | 'checking' | 'completed' | 'cancelled';

export interface ScheduledWorkOrder {
  id: string;
  code: string;
  planId: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  procedureId: string;
  procedureName: string;
  teamId: string;
  teamName: string;
  assignedStaff: string[];
  assignedStaffNames: string[];
  status: WorkOrderStatus;
  scheduledDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  checklistCompleted: number;
  checklistTotal: number;
  spareParts: SparePartUsage[];
  results: MaintenanceResult[];
  notes?: string;
  isLocked: boolean;
}

// --- Yêu cầu sửa chữa nhỏ ---
export type RepairRequestStatus = 'new' | 'evaluating' | 'assigned' | 'in_progress' | 'checking' | 'completed' | 'escalated' | 'cancelled';
export type RepairSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RepairRequest {
  id: string;
  code: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  symptom: string;
  severity: RepairSeverity;
  status: RepairRequestStatus;
  reportedBy: string;
  reportedDate: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedStaff?: string[];
  assignedStaffNames?: string[];
  rootCause?: string;
  resolution?: string;
  startDate?: string;
  endDate?: string;
  spareParts: SparePartUsage[];
  downtime?: number; // phút
}

// --- Yêu cầu vật tư (gửi sang Kho) ---
export type MaterialRequestType = 'issue' | 'return';
export type MaterialRequestStatus = 'draft' | 'submitted' | 'warehouse_processing' | 'issued' | 'received' | 'returning' | 'returned' | 'cancelled';

export interface MaterialRequestLine {
  id: string;
  productId: string;
  partCode: string;
  partName: string;
  unit: string;
  requestedQty: number;
  approvedQty?: number;
  issuedQty?: number;
  receivedQty?: number;
  returnedQty?: number;
  qtyAvailable: number;       // tồn khả dụng tại thời điểm yêu cầu
  lotNumber?: string;
  serialNumber?: string;
  notes?: string;
}

export interface MaterialRequest {
  id: string;
  code: string;                // YC-VT-2026-XXX
  type: MaterialRequestType;   // issue = cấp phát, return = trả kho
  status: MaterialRequestStatus;
  poId?: string;               // ref PO bảo trì
  poCode?: string;
  planId?: string;             // ref Kế hoạch
  planCode?: string;
  equipmentId?: string;
  equipmentName?: string;
  requestedBy: string;
  requestedDate: string;
  departmentId: string;
  departmentName: string;
  warehouseId: string;         // kho xuất/nhập
  warehouseName: string;
  lines: MaterialRequestLine[];
  totalItems: number;
  // Liên kết với Kho
  outboundOrderCode?: string;  // mã phiếu xuất kho (PX-2026-XXX)
  inboundOrderCode?: string;   // mã phiếu nhập trả (PN-2026-XXX)
  // Phê duyệt
  approvedBy?: string;
  approvedDate?: string;
  // Nhận hàng
  receivedBy?: string;
  receivedDate?: string;
  notes?: string;
  createdAt: string;
}

// --- Vật tư bảo trì ---
export type SparePartRequestStatus = 'pending' | 'approved' | 'issued' | 'used' | 'returned' | 'reconciled';

export type ProductType = 'consumable' | 'spare_part' | 'equipment';
export type TrackingType = 'none' | 'lot' | 'serial';

export interface SparePartRequest {
  id: string;
  productId?: string;        // ref → Product.id trong Kho
  partName: string;
  partCode: string;
  quantity: number;
  unit: string;
  status: SparePartRequestStatus;
  qtyAvailable?: number;     // tồn kho khả dụng (từ Kho)
}

export interface SparePartUsage {
  productId?: string;        // ref → Product.id trong Kho
  partName: string;
  partCode: string;
  requestedQty: number;
  usedQty: number;
  returnedQty: number;
  unit: string;
  lotNumber?: string;        // truy vết lô hàng (từ Kho)
  serialNumber?: string;     // truy vết serial (từ Kho)
  outboundOrderCode?: string; // mã phiếu xuất kho liên kết
  returnOrderCode?: string;   // mã phiếu nhập trả kho
}

export interface SparePartInventory {
  id: string;
  productId?: string;        // ref → Product.id trong Kho
  partName: string;
  partCode: string;
  category: string;
  productType: ProductType;  // consumable | spare_part | equipment
  trackingType: TrackingType; // none | lot | serial
  unit: string;
  currentStock: number;      // tồn thực tế (= qtyOnHand từ Kho)
  reservedStock: number;     // đã giữ cho PO khác
  availableStock: number;    // khả dụng = current - reserved
  minStock: number;
  maxStock: number;
  reorderPoint: number;      // mức đặt hàng lại
  leadTimeDays: number;      // thời gian cung ứng
  warehouseId?: string;      // ref → Warehouse.id trong Kho
  warehouseName?: string;
  warehouseLocation: string; // vị trí cụ thể (kệ, ngăn)
  manufacturer?: string;
  militaryGrade?: boolean;
  lastUpdated: string;
}

// --- Thiết bị ---
export type EquipmentStatus = 'operational' | 'maintenance' | 'faulty' | 'decommissioned';

export interface Equipment {
  id: string;
  productId?: string;        // ref → Product.id trong Kho (cho thiết bị tracked)
  code: string;
  name: string;
  type: string;
  category: 'radar' | 'missile' | 'communication' | 'electronic' | 'mechanical';
  location: string;
  departmentId: string;
  departmentName: string;
  status: EquipmentStatus;
  operatingHours: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceCycle: number; // ngày
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiry?: string;   // hạn bảo hành (từ Kho warrantyMonths)
  specifications?: string;   // thông số kỹ thuật (từ Kho)
}

export interface EquipmentMonitoringData {
  equipmentId: string;
  timestamp: string;
  temperature?: number;
  pressure?: number;
  signalStrength?: number;
  vibration?: number;
  operatingHours: number;
  status: EquipmentStatus;
  alerts: MonitoringAlert[];
}

export interface MonitoringAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'temperature' | 'pressure' | 'signal' | 'vibration' | 'hours' | 'general';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  threshold?: number;
  actualValue?: number;
}

// --- Kết quả bảo trì ---
export interface MaintenanceResult {
  parameter: string;
  standardValue: string;
  measuredValue: string;
  status: 'pass' | 'fail' | 'warning';
  notes?: string;
}

// --- Lịch sử bảo trì ---
export interface MaintenanceHistory {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  type: 'periodic' | 'corrective' | 'inspection';
  workOrderCode: string;
  date: string;
  duration: number; // giờ
  teamName: string;
  staffNames: string[];
  description: string;
  spareParts: SparePartUsage[];
  results: MaintenanceResult[];
  status: 'completed' | 'partial' | 'failed';
  cost?: number; // triệu đồng
}

// --- KPI & Đánh giá ---
export interface MaintenanceKPI {
  equipmentId: string;
  equipmentName: string;
  mtbf: number; // Mean Time Between Failures (giờ)
  mttr: number; // Mean Time To Repair (giờ)
  availability: number; // % thời gian sẵn sàng
  failureCount: number;
  totalDowntime: number; // giờ
  maintenanceCost: number; // triệu đồng
  complianceRate: number; // % tuân thủ kế hoạch
  period: string;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  completedTasks: number;
  totalTasks: number;
  averageTime: number; // giờ
  complianceRate: number; // %
  qualityScore: number; // %
}

// --- Báo cáo ---
export type ReportType =
  | 'plan_execution'
  | 'equipment_history'
  | 'incident_repair'
  | 'downtime'
  | 'performance'
  | 'cost'
  | 'spare_part_consumption'
  | 'spare_part_inventory'
  | 'team_productivity'
  | 'staff_assignment'
  | 'compliance'
  | 'alerts'
  | 'failure_trend'
  | 'equipment_comparison'
  | 'team_comparison'
  | 'quality'
  | 'improvement';

export type AlertSeverity = 'info' | 'warning' | 'critical';
