// ═══════════════════════════════════════════════════════════════
// Domain types — Quản lý An toàn Kỹ thuật (Doanh nghiệp A — module antoan)
// ═══════════════════════════════════════════════════════════════

// --- Đơn vị tổ chức ---
export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
}

// ═══════════════════════════════════════════════════════════════
// QT1 — Tiêu chuẩn & Quy trình an toàn
// ═══════════════════════════════════════════════════════════════

export type SafetyStandardStatus = 'draft' | 'pending_approval' | 'active' | 'superseded' | 'retired';
export type SafetyStandardScope =
  | 'chung'
  | 'san_xuat'
  | 'sua_chua'
  | 'dai_tu'
  | 'thu_nghiem';

export type HazardCategory =
  | 'dien_ap_cao'
  | 'ap_suat_cao'
  | 'chay_no'
  | 'buc_xa'
  | 'hoa_chat'
  | 'co_hoc'
  | 'nhiet_do'
  | 'khac';

export type LinkedProcessModule = 'san_xuat' | 'sua_chua' | 'dai_tu' | 'thu_nghiem';

export interface LinkedProcess {
  module: LinkedProcessModule;
  stage: string;
}

export interface DistributionRecord {
  workshopId: string;
  workshopName: string;
  receivedBy: string;
  receivedAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

export interface SafetyStandard {
  id: string;
  code: string;
  title: string;
  version: string;
  previousVersion?: string;
  scope: SafetyStandardScope;
  hazardCategory: HazardCategory;
  applicableWorkshops: string[];
  description: string;
  keyRequirements: string[];
  linkedProcesses?: LinkedProcess[];
  status: SafetyStandardStatus;
  issuedBy: string;
  issuedAt: string;
  effectiveFrom: string;
  effectiveTo?: string;
  supersededBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  distributionRecords?: DistributionRecord[];
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// QT2 — Nhận diện & Đánh giá rủi ro
// ═══════════════════════════════════════════════════════════════

export type RiskStatus = 'identified' | 'assessed' | 'controlled' | 'accepted' | 'closed';
export type RiskProbability = 1 | 2 | 3 | 4 | 5;
export type RiskImpact = 1 | 2 | 3 | 4 | 5;
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

export type RiskDataSource = 'san_xuat' | 'sua_chua' | 'dai_tu' | 'thu_nghiem' | 'kiem_tra' | 'bao_cao_noi_bo';

export interface TechnicalRisk {
  id: string;
  code: string;
  title: string;
  description: string;
  hazardCategory: HazardCategory;
  workshopId: string;
  workshopName: string;
  equipmentOrProcess: string;
  dataSource?: RiskDataSource;
  probability: RiskProbability;
  impact: RiskImpact;
  riskScore: number;
  riskLevel: RiskLevel;
  controlMeasures: string[];
  residualRisk?: RiskLevel;
  responsiblePerson: string;
  status: RiskStatus;
  acceptanceNote?: string;
  relatedStandardIds: string[];
  identifiedAt: string;
  assessedAt?: string;
  reviewDate?: string;
  note?: string;
}

// ═══════════════════════════════════════════════════════════════
// QT3 — Sự cố & Tai nạn kỹ thuật
// ═══════════════════════════════════════════════════════════════

export type IncidentStatus =
  | 'new'
  | 'classifying'
  | 'investigating'
  | 'handling'
  | 'closed';

export type IncidentSeverity = 'nghiem_trong' | 'trung_binh' | 'nhe';
export type IncidentType =
  | 'su_co_thiet_bi'
  | 'tai_nan_lao_dong'
  | 'chay_no'
  | 'ro_ri'
  | 'qua_nguong'
  | 'khac';

export interface IncidentAction {
  step: number;
  actor: string;
  timestamp: string;
  note: string;
}

export interface SafetyIncident {
  id: string;
  code: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  workshopId: string;
  workshopName: string;
  location: string;
  occurredAt: string;
  reportedBy: string;
  reportedAt: string;
  description: string;
  immediateAction: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  relatedEquipment?: string;
  relatedRiskIds: string[];
  status: IncidentStatus;
  currentStep: number;
  actions: IncidentAction[];
  closedAt?: string;
  closedBy?: string;
  injuryCount: number;
  damageEstimate?: number;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// QT4 — Giám sát tuân thủ an toàn
// ═══════════════════════════════════════════════════════════════

export type ViolationStatus = 'new' | 'handling' | 'resolved' | 'closed';
export type ViolationSeverity = 'nghiem_trong' | 'nang' | 'nhe';
export type ForwardedToModule = 'san_xuat' | 'sua_chua' | 'dai_tu' | 'thu_nghiem';
export type ViolationSource =
  | 'quan_ly_san_xuat'
  | 'quan_ly_sua_chua'
  | 'quan_ly_dai_tu'
  | 'quan_ly_thu_nghiem'
  | 'quan_ly_chat_luong'
  | 'kiem_tra_dinh_ky'
  | 'bao_cao_noi_bo';

export interface SafetyViolation {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: ViolationSeverity;
  source: ViolationSource;
  workshopId: string;
  workshopName: string;
  violationType: HazardCategory;
  relatedStandardId?: string;
  relatedStandardCode?: string;
  relatedRiskId?: string;
  forwardedTo?: ForwardedToModule;
  detectedBy: string;
  detectedAt: string;
  deadline?: string;
  assignedTo?: string;
  remedyRequest?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: ViolationStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// QT3 — Kiểm soát điều kiện an toàn trong vận hành
// ═══════════════════════════════════════════════════════════════

export type ControlSheetStatus = 'pending' | 'in_progress' | 'passed' | 'failed';
export type CheckItemResult    = 'pass' | 'fail' | 'na' | 'pending';
export type ShiftType          = 'ca1' | 'ca2' | 'ca3';

export interface SafetyCheckItem {
  id: string;
  category: HazardCategory;
  description: string;
  requirement: string;
  thresholdValue?: string;
  result: CheckItemResult;
  measuredValue?: string;
  correctionAction?: string;
  note?: string;
}

export interface SafetyControlSheet {
  id: string;
  code: string;
  workshopId: string;
  workshopName: string;
  shift: ShiftType;
  date: string;
  inspector: string;
  status: ControlSheetStatus;
  checkItems: SafetyCheckItem[];
  passCount: number;
  failCount: number;
  naCount: number;
  note?: string;
  createdAt: string;
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// QT7 — Theo dõi, cải tiến và phòng ngừa rủi ro
// ═══════════════════════════════════════════════════════════════

export type ImprovementStatus   = 'proposed' | 'approved' | 'implementing' | 'evaluating' | 'closed' | 'rejected';
export type ImprovementSource   = 'su_co' | 'rui_ro' | 'vi_pham' | 'phan_tich' | 'kien_nghi';
export type ImprovementPriority = 'cao' | 'trung_binh' | 'thap';

export interface ImprovementProposal {
  id: string;
  code: string;
  title: string;
  description: string;
  source: ImprovementSource;
  relatedCode?: string;
  workshopIds: string[];
  rootCause?: string;
  expectedOutcome?: string;
  linkedStandardIds?: string[];
  linkedProcessModules?: ForwardedToModule[];
  proposedBy: string;
  proposedAt: string;
  priority: ImprovementPriority;
  estimatedCost?: number;
  estimatedDeadline?: string;
  approvedBy?: string;
  approvedAt?: string;
  implementedBy?: string;
  implementedAt?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
  evaluationResult?: string;
  status: ImprovementStatus;
  closedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// Cảnh báo an toàn
// ═══════════════════════════════════════════════════════════════

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SafetyAlert {
  id: string;
  type:
    | 'risk_uncontrolled'
    | 'incident_unresolved'
    | 'violation_overdue'
    | 'standard_expiring'
    | 'review_due';
  severity: AlertSeverity;
  title: string;
  description: string;
  relatedId?: string;
  workshopId?: string;
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}
