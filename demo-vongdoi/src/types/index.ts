// ─── Equipment ───────────────────────────────────────────────────────────────

export type EquipmentType = 'radar' | 'missile' | 'electronics' | 'communication' | 'mechanical' | 'measurement';
export type EquipmentStatus = 'in_service' | 'maintenance' | 'repair' | 'overhaul' | 'storage' | 'decommission' | 'new';
export type TechnicalCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: EquipmentType;
  category: string;
  manufacturer: string;
  origin: string;
  yearManufactured: number;
  yearReceived: number;
  serialNumber: string;
  unitId: string;
  unitName: string;
  departmentId: string;
  departmentName: string;
  status: EquipmentStatus;
  designLifespan: number;        // years
  operatingHours: number;        // current cumulative hours
  maxOperatingHours: number;     // design limit
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  lastOverhaulDate: string;
  nextOverhaulDate: string;
  technicalCondition: TechnicalCondition;
  location: string;
  notes: string;
  images?: {
    main: string;
    sub: string[];
  };
}

// ─── Lifecycle Plan ──────────────────────────────────────────────────────────

export type LifecyclePhase =
  | 'procurement'
  | 'in_service'
  | 'periodic_maintenance'
  | 'repair'
  | 'overhaul'
  | 'upgrade'
  | 'storage'
  | 'decommission';

export type LifecyclePlanStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export interface LifecyclePlan {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  planYear: number;
  phase: LifecyclePhase;
  status: LifecyclePlanStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  responsibleDeptId: string;
  responsibleDeptName: string;
  estimatedCost: number;
  actualCost?: number;
  description: string;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

// ─── Configuration ───────────────────────────────────────────────────────────

export type ConfigChangeType =
  | 'initial_setup'
  | 'hardware_upgrade'
  | 'software_update'
  | 'component_replacement'
  | 'parameter_change'
  | 'structural_modification';

export interface ConfigComponent {
  name: string;
  oldValue: string;
  newValue: string;
  unit?: string;
}

export interface ConfigurationRecord {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  changeType: ConfigChangeType;
  changeDate: string;
  version: string;
  changedBy: string;
  approvedBy: string;
  description: string;
  components: ConfigComponent[];
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  publishedTo?: { system: string; systemName: string; publishedDate: string }[];
  notes?: string;
}

// ─── Design Version ──────────────────────────────────────────────────────────

export type DesignVersionStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived';

export interface DesignVersion {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  version: string;
  releaseDate: string;
  status: DesignVersionStatus;
  description: string;
  approvedBy?: string;
  approvedDate?: string;
  configIds: string[];   // references to ConfigurationRecord ids
  isBaseline: boolean;   // phiên bản chuẩn tham chiếu hiện tại
}

// ─── Operation Log ───────────────────────────────────────────────────────────

export type OperationEventType =
  | 'transfer_in'
  | 'transfer_out'
  | 'operation_log'
  | 'inspection'
  | 'calibration'
  | 'test_run';

export interface OperationLog {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  eventType: OperationEventType;
  eventDate: string;
  operatingHoursTotal: number;
  hoursThisSession: number;
  operatorName: string;
  departmentId: string;
  departmentName: string;
  location: string;
  result: 'normal' | 'abnormal' | 'needs_attention';
  notes: string;
}

// ─── Alert ───────────────────────────────────────────────────────────────────

export type AlertType =
  | 'overhaul_due'
  | 'maintenance_due'
  | 'end_of_life'
  | 'hours_limit'
  | 'lifecycle_overdue'
  | 'config_pending';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface VongDoiAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  message: string;
  dueDate?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Department ──────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
}

// ─── Category (Danh mục) ────────────────────────────────────────────────────

export interface EquipmentCategory {
  id: string;
  name: string;
  type: EquipmentType;
  description: string;
}

export interface MilitaryUnit {
  id: string;
  name: string;
  shortName: string;
  type: 'division' | 'regiment' | 'battalion';
  parentId?: string;
}

// ─── Change Request (Yêu cầu thay đổi cấu hình) ─────────────────────────────

export type ChangeRequestStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'implemented';

export type ChangeRequestPriority = 'critical' | 'high' | 'medium' | 'low';

export type ChangeRequestSource =
  | 'pkkq-sanxuat'
  | 'pkkq-suachua'
  | 'pkkq-daitu'
  | 'pkkq-baotri'
  | 'internal';

export interface ChangeRequest {
  id: string;
  code: string;
  title: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  description: string;
  reason: string;
  source: ChangeRequestSource;
  sourceRef?: string;
  requestedBy: string;
  requestedDept: string;
  requestedAt: string;
  priority: ChangeRequestPriority;
  status: ChangeRequestStatus;
  affectedSerials?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  implementedBy?: string;
  implementedAt?: string;
  impactAnalysis?: string;
  proposedSolution?: string;
  reviewNotes?: string;
  linkedConfigId?: string;
  postChangeNote?: string;
}

// ─── Actual Configuration (Cấu hình thực tế theo số hiệu) ───────────────────

export type ActualConfigStatus = 'synced' | 'deviated' | 'pending_update' | 'unrecorded';
export type ActualConfigSource = 'pkkq-sanxuat' | 'pkkq-suachua' | 'pkkq-daitu' | 'pkkq-baotri' | 'manual';

export type DeviationActionType = 'repair_requested' | 'accepted' | 'resolved';

export interface DeviationHandling {
  action: DeviationActionType;
  handledBy: string;
  handledAt: string;
  reason: string;
  linkedModule?: 'pkkq-suachua' | 'pkkq-baotri' | 'pkkq-daitu';
  linkedRef?: string;
}

export interface ActualConfigComponent {
  name: string;
  code: string;
  group: string;
  designValue: string;
  actualValue: string;
  unit: string;
  isDeviated: boolean;
  deviationNote?: string;
  deviationHandling?: DeviationHandling;
}

export interface ActualConfiguration {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  serialNumber: string;
  designVersionRef: string;
  recordedAt: string;
  source: ActualConfigSource;
  sourceRef?: string;
  recordedBy: string;
  confirmedBy?: string;
  confirmedAt?: string;
  status: ActualConfigStatus;
  components: ActualConfigComponent[];
  notes?: string;
}
