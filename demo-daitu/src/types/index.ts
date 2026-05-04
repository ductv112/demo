// ═══════════════════════════════════════════════════════════════
// Cấu trúc dữ liệu Doanh nghiệp A - Quản lý Đại tu - Trung tâm phần mềm Alpha
// Flow: Tiếp nhận → Kế hoạch → Tháo rã → Kiểm tra → Phục hồi → Lắp ráp → Thử nghiệm → Truy vết
// ═══════════════════════════════════════════════════════════════

// ─── Tổ chức ──────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
  head: string;
}

// ─── Thiết bị ──────────────────────────────────────
export type EquipmentCategory = 'radar' | 'missile' | 'communication' | 'electronic' | 'mechanical';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  model: string;
  serial: string;
  category: EquipmentCategory;
  manufacturingYear: number;
  operatingHours: number;
  ownerUnit: string;
  status: 'operational' | 'degraded' | 'non_operational' | 'in_overhaul';
}

// ─── Quy trình 1: Tiếp nhận & Đánh giá tổng thể ────────────
export type ReceptionStatus =
  | 'pending_reception'   // Chờ tiếp nhận
  | 'received'            // Đã tiếp nhận
  | 'assessing'           // Đang đánh giá
  | 'assessed'            // Đã đánh giá
  | 'pending_plan';       // Chờ lập kế hoạch

export interface OverhaulReception {
  id: string;
  code: string;
  equipmentId: string;
  equipmentName: string;
  equipmentModel: string;
  equipmentSerial: string;
  sendingUnit: string;
  receivedDate: string;
  receivedBy: string;
  operatingHours: number;
  // Bước 1: Hồ sơ tài liệu đi kèm
  receivedDocuments?: string[];      // Danh mục hồ sơ, tài liệu nhận được
  maintenanceHistory?: string;       // Tóm tắt lịch sử vận hành & bảo trì
  // Bước 2: Kiểm tra tổng thể ban đầu
  initialCondition: string;          // Tình trạng quan sát ban đầu
  initialCheckDate?: string;         // Ngày kiểm tra ban đầu
  initialCheckBy?: string;           // Người thực hiện kiểm tra ban đầu
  // Bước 3: Đánh giá tình trạng & hao mòn
  wearLevel: 'low' | 'medium' | 'high' | 'critical';
  assessmentSummary?: string;        // Kết luận đánh giá
  assessedDate?: string;             // Ngày hoàn thành đánh giá
  assessedBy?: string;               // KTV phụ trách đánh giá
  // Bước 4-5: Phạm vi & Định tuyến
  overhaulScope: 'full' | 'partial';
  overhaulType: 'scheduled' | 'condition_based' | 'priority';
  routingWorkshop: string;
  routingWorkshopName?: string;      // Tên đầy đủ trung tâm
  routingReason?: string;            // Lý do định tuyến
  // Bước 6: Liên kết hồ sơ đại tu
  linkedOrderId?: string;            // Mã lệnh đại tu được tạo từ hồ sơ này
  status: ReceptionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Quy trình 2: Lệnh đại tu & Kế hoạch ───────────────────
export type OverhaulOrderStatus =
  | 'draft'               // Nháp
  | 'pending_approval'    // Chờ duyệt
  | 'approved'            // Đã duyệt
  | 'in_progress'         // Đang thực hiện
  | 'completed'           // Hoàn thành
  | 'closed';             // Đã đóng

export interface OverhaulOrder {
  id: string;
  code: string;
  receptionId: string;
  equipmentId: string;
  equipmentName: string;
  equipmentModel: string;
  workshopId: string;
  workshopName: string;
  overhaulScope: 'full' | 'partial';
  // Bước 1: Phương án đại tu
  strategy: string;                    // Mô tả chiến lược tổng thể
  technicalStandards?: string;         // Tiêu chuẩn / chỉ thị kỹ thuật áp dụng
  interventionScope?: string;          // Mức can thiệp từng cụm hệ thống
  // Bước 3: Vật tư & linh kiện
  materialRequirements?: string[];     // Danh mục vật tư chính cần dùng
  mandatoryReplacements?: string[];    // Vật tư bắt buộc thay thế
  estimatedMaterialCost?: number;      // Chi phí vật tư ước tính (tr)
  // Bước 4: Nhân lực
  personnelPlan?: string;              // Kế hoạch phân công nhân lực tổng thể
  teamSize?: number;                   // Số lượng KTV tham gia
  status: OverhaulOrderStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  plannedDuration: number;
  actualDuration?: number;
  plannedCost: number;
  actualCost?: number;
  approvedBy?: string;
  approvedDate?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Công đoạn trong lệnh đại tu ────────────────────────────
export type WorkStageStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface WorkStage {
  id: string;
  orderId: string;
  sequence: number;
  name: string;
  description: string;
  assignedTeam: string;
  plannedDuration: number;
  actualDuration?: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: WorkStageStatus;
  progress: number;
}

// ─── Quy trình 3: Tháo rã & Cấu phần ───────────────────────
export type DisassemblyStatus = 'pending' | 'in_progress' | 'completed';

export interface DisassemblyRecord {
  id: string;
  orderId: string;
  equipmentName: string;
  startDate: string;
  endDate?: string;
  performedBy: string;
  totalComponents: number;
  status: DisassemblyStatus;
  notes?: string;
  // Bước 1: Chuẩn bị
  receivedOrderDate?: string;      // Ngày nhận lệnh đại tu
  technicalDocuments?: string[];   // Tài liệu kỹ thuật chuẩn bị
  toolsRequired?: string[];        // Dụng cụ chuyên dụng
  workAreaNotes?: string;          // Ghi chú khu vực thi công
  // Bước 2: Tháo rã
  disassemblySequence?: string;    // Trình tự tháo rã
  disassemblyMethodNote?: string;  // Ghi chú phương pháp tháo rã
  // Bước 6: Chuẩn bị kiểm tra
  readyForInspectionDate?: string; // Ngày sẵn sàng chuyển kiểm tra
  inspectionGroupingNotes?: string; // Ghi chú phân nhóm kiểm tra
}

export type ComponentStatus =
  | 'disassembled'        // Đã tháo rã
  | 'pending_inspection'  // Chờ kiểm tra
  | 'inspecting'          // Đang kiểm tra
  | 'serviceable'         // Đạt - Giữ lại
  | 'repairable'          // Phục hồi được
  | 'beyond_repair'       // Thay mới
  | 'upgrade_required'    // Cần nâng cấp
  | 'restored'            // Đã phục hồi
  | 'replaced'            // Đã thay thế
  | 'upgraded'            // Đã nâng cấp
  | 'ready_for_assembly'; // Sẵn sàng lắp ráp

export type ComponentCategory = 'module' | 'part' | 'consumable' | 'assembly';

export interface Component {
  id: string;
  disassemblyId: string;
  orderId: string;
  code: string;
  name: string;
  category: ComponentCategory;
  systemGroup: string;
  position: string;
  installDirection?: string;
  status: ComponentStatus;
  condition: string;
  serialNumber?: string;
}

// ─── Quy trình 4: Kiểm tra & Đánh giá kỹ thuật ─────────────
export type InspectionType = 'visual' | 'dimensional' | 'ndt' | 'functional' | 'surface';

export type InspectionResult = 'pass' | 'fail' | 'marginal';

export type DispositionAction = 'serviceable' | 'restore' | 'replace' | 'upgrade';

export interface TechnicalInspection {
  id: string;
  componentId: string;
  componentName: string;
  orderId: string;
  inspectionType: InspectionType;
  requestedBy: string;
  performedBy?: string;
  inspectionUnit?: string;          // Đơn vị / phân hệ thực hiện kiểm tra
  requestDate: string;
  sentDate?: string;                // Ngày gửi đến phân hệ chuyên môn
  receivedResultDate?: string;      // Ngày nhận kết quả về
  completedDate?: string;
  measuredValue?: string;
  technicalLimit?: string;
  comparisonNote?: string;          // Ghi chú khi so sánh với giới hạn KT
  result?: InspectionResult;
  disposition?: DispositionAction;
  externalSystem?: string;
  attachments?: string[];           // Biên bản, ảnh, report kiểm tra
  notes?: string;
  status: 'requested' | 'in_progress' | 'completed';
}

// ─── Quy trình 5: Phục hồi, Thay thế & Nâng cấp ────────────
export type RestorationAction = 'restore' | 'replace' | 'upgrade' | 'retain';

export interface RestorationRecord {
  id: string;
  componentId: string;
  componentName: string;
  orderId: string;
  inspectionId?: string;
  action: RestorationAction;
  method?: string;
  steps?: string[];
  materialsUsed?: string[];
  oldPartSerial?: string;
  newPartSerial?: string;
  newPartName?: string;
  upgradeVersion?: string;
  performedBy: string;
  startDate: string;
  endDate?: string;
  qualityCheckResult?: string;
  approvedBy?: string;
  approvedDate?: string;
  readyForAssembly?: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  cost?: number;
}

// ─── Quy trình 6: Lắp ráp & Hiệu chỉnh ────────────────────
export type AssemblyStatus = 'preparing' | 'assembling' | 'calibrating' | 'pending_test' | 'completed';

export interface AssemblyRecord {
  id: string;
  orderId: string;
  equipmentName: string;
  workshopName: string;
  startDate: string;
  endDate?: string;
  performedBy: string;
  status: AssemblyStatus;
  // Bước 1: Chuẩn bị
  componentCount?: number;
  checklistNotes?: string;
  // Bước 2: Lắp ráp & kiểm soát kỹ thuật
  torqueRecords?: string;
  clearanceRecords?: string;
  // Bước 3: Hiệu chỉnh
  calibrationParams?: string;
  // Bước 4: Ghi nhận cấu hình
  configSnapshot?: string;
  // Bước 5: Chuyển thử nghiệm
  readyForTest?: boolean;
  cost?: number;
  notes?: string;
}

// ─── Quy trình 7: Thử nghiệm & Nghiệm thu ─────────────────
export type TestAcceptanceStatus =
  | 'pending_test'        // Chờ thử nghiệm
  | 'testing'             // Đang thử nghiệm
  | 'passed'              // Đạt
  | 'failed'              // Không đạt
  | 'retesting'           // Thử lại
  | 'accepted'            // Đã nghiệm thu
  | 'delivered';          // Đã bàn giao

export interface TestAcceptance {
  id: string;
  orderId: string;
  equipmentName: string;
  workshopName?: string;
  // Bước 1: Chuẩn bị
  testScenario: string;
  testEnvironment: string;
  testRequirements?: string;       // Tiêu chuẩn đánh giá
  // Bước 2: Gửi yêu cầu
  testRequestDate?: string;
  // Bước 3: Kết quả thử nghiệm
  testDate?: string;
  testResult?: 'pass' | 'fail';
  performanceMetrics?: string;
  // Bước 4: Nghiệm thu
  acceptedBy?: string;
  acceptedDate?: string;
  // Bước 5: Xử lý không đạt
  failureReason?: string;
  correctiveAction?: string;       // Hành động khắc phục
  retestDate?: string;
  retestResult?: 'pass' | 'fail';
  // Bước 6: Bàn giao & đóng hồ sơ
  deliveredTo?: string;
  deliveredDate?: string;
  closedBy?: string;
  closedDate?: string;
  status: TestAcceptanceStatus;
  notes?: string;
}

// ─── Quy trình 8: Truy vết & Cấu hình sau đại tu ───────────
export type TraceabilityStatus =
  | 'collecting'   // Bước 1: Đang tổng hợp dữ liệu
  | 'updating'     // Bước 2: Cập nhật lịch sử
  | 'configuring'  // Bước 3: Cập nhật cấu hình
  | 'recording'    // Bước 4: Ghi nhận thay đổi KT
  | 'tracing'      // Bước 5: Thiết lập truy vết
  | 'syncing'      // Bước 6: Đồng bộ hệ thống
  | 'completed';   // Hoàn thành

export interface ConfigChangeItem {
  parameter: string;
  before: string;
  after: string;
  reason?: string;
}

export interface TechnicalChangeItem {
  type: 'standard' | 'design' | 'material' | 'document';
  description: string;
  reference?: string;
  appliedDate?: string;
}

export interface ComponentTraceItem {
  componentId: string;
  componentName: string;
  action: 'replace' | 'restore' | 'upgrade' | 'serviceable';
  serialNo?: string;
  supplier?: string;
  installDate?: string;
  lifeRemaining?: string;
}

export interface TraceabilityRecord {
  id: string;
  orderId: string;
  equipmentId: string;
  equipmentName: string;
  status: TraceabilityStatus;
  // Bước 1: Tổng hợp
  overhaulStartDate?: string;
  overhaulEndDate?: string;
  overhaulDate: string;
  overhaulScope: string;
  workshopName: string;
  totalComponents?: number;
  replacedCount?: number;
  restoredCount?: number;
  testResult?: 'pass' | 'fail';
  testAcceptanceId?: string;
  // Bước 2: Lịch sử
  completedItems: string[];
  responsiblePerson?: string;
  supervisorName?: string;
  overhaulCost?: number;
  // Bước 3: Cấu hình
  configVersion?: string;
  configItems?: ConfigChangeItem[];
  configChanges: string[];
  // Bước 4: Thay đổi kỹ thuật
  technicalChangeItems?: TechnicalChangeItem[];
  technicalChanges: string[];
  // Bước 5: Truy vết cấu phần
  componentTraceItems?: ComponentTraceItem[];
  replacedComponents: string[];
  upgradedComponents: string[];
  // Bước 6: Đồng bộ
  linkedSystems: { system: string; status: 'synced' | 'pending' | 'failed'; syncDate?: string }[];
  syncedAt?: string;
  notes?: string;
}

// ─── Yêu cầu vật tư ─────────────────────────────────────────
export type MaterialRequestStatus =
  | 'draft'              // Nháp
  | 'pending_approval'   // Chờ duyệt
  | 'approved'           // Đã duyệt
  | 'rejected'           // Từ chối
  | 'partially_issued'   // Cấp phát một phần
  | 'issued'             // Đã cấp phát
  | 'completed';         // Hoàn thành

export type MaterialRequestPriority = 'normal' | 'urgent' | 'critical';

export type MaterialCategory = 'spare_part' | 'consumable' | 'chemical' | 'tool';

export interface MaterialRequestItem {
  id: string;
  requestId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  category: MaterialCategory;
  requestedQty: number;
  approvedQty?: number;
  issuedQty?: number;
  unitPrice?: number;           // Đơn giá (triệu đồng)
  reason: string;               // Lý do yêu cầu
  linkedComponentId?: string;
  linkedComponentName?: string;
  isMandatoryReplace: boolean;
}

export interface MaterialRequest {
  id: string;
  code: string;
  orderId: string;
  orderCode: string;
  equipmentName: string;
  workshopId: string;
  workshopName: string;
  requestedBy: string;
  requestDate: string;
  requiredDate: string;         // Ngày cần có vật tư
  priority: MaterialRequestPriority;
  status: MaterialRequestStatus;
  totalItems: number;
  estimatedCost?: number;       // Chi phí ước tính (tr)
  actualCost?: number;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  issuedBy?: string;
  issuedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Vật tư & Linh kiện ─────────────────────────────────────
export interface Material {
  id: string;
  code: string;
  name: string;
  category: 'spare_part' | 'consumable' | 'chemical' | 'tool';
  unit: string;
  supplier?: string;
  isMandatoryReplace: boolean;
}

// ─── Nhân sự kỹ thuật ───────────────────────────────────────
export interface Personnel {
  id: string;
  name: string;
  rank: string;
  departmentId: string;
  specialization: string;
  certifications: string[];
}

// ─── Cảnh báo ────────────────────────────────────────────────
export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType =
  | 'overdue'             // Chậm tiến độ
  | 'material_shortage'   // Thiếu vật tư
  | 'test_failed'         // Không đạt thử nghiệm
  | 'pending_acceptance'  // Chờ nghiệm thu
  | 'cost_overrun'        // Vượt chi phí
  | 'quality_issue';      // Vấn đề chất lượng

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
