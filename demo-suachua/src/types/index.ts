// ═══════════════════════════════════════════════════════════════
// Domain Types — Quản lý Sửa chữa (pkkq-suachua)
// ═══════════════════════════════════════════════════════════════

// --- Enums ---

export type RepairType = 'small' | 'medium' | 'field';
export type ReceptionSource = 'unit' | 'maintenance' | 'inspection';
export type RepairStage = 'electronic' | 'mechanical' | 'optical' | 'assembly' | 'testing';
export type RepairMethod = 'in_place' | 'replacement' | 'restoration' | 'overhaul_transfer';
export type EquipmentType = 'radar' | 'missile' | 'communication' | 'electronic';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type RepairRequestStatus = 'received' | 'diagnosing' | 'diagnosed' | 'planning' | 'ready';

export type WorkOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'quality_check'
  | 'testing'
  | 'accepted'
  | 'handed_over'
  | 'closed';

export type RepairTaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type InspectionStatus = 'pending' | 'passed' | 'failed' | 'retesting';
export type InspectionType = 'quality' | 'testing' | 'acceptance';
export type DiagnosticStatus = 'pending' | 'received' | 'confirmed' | 'recheck';
export type AlertType = 'overdue' | 'over_budget' | 'recurring_failure' | 'pending_approval';
export type AlertSeverity = 'critical' | 'warning' | 'info';

// --- Department ---

export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
}

// --- Repair Request ---

export interface RepairRequest {
  id: string;
  code: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  serialNumber: string;
  unitName: string;
  unitId: string;
  receivedDate: string;
  initialCondition: string;
  symptoms: string[];
  repairType: RepairType;
  priority: Priority;
  status: RepairRequestStatus;
  receptionSource: ReceptionSource;
  classificationReason: string;
  receivedBy: string;
  notes: string;
}

// --- Diagnostic Result ---

export interface DiagnosticResult {
  id: string;
  repairRequestId: string;
  repairRequestCode: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  unitName: string;
  initialCondition: string;
  symptoms: string[];
  status: DiagnosticStatus;
  diagnosis: string;
  rootCause: string;
  affectedComponents: string[];
  recommendedAction: RepairMethod;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  diagnosedBy: string;
  diagnosedDate: string;
  confirmedBy: string;
  confirmedDate: string;
  notes: string;
}

// --- Work Order ---

export interface WorkOrder {
  id: string;
  code: string;
  repairRequestId: string;
  repairRequestCode: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  unitName: string;
  repairType: RepairType;
  repairMethod: RepairMethod;
  diagnosticSummary: string;
  assignedTeam: string;
  assignedTeamId: string;
  leader: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string;
  actualEnd: string;
  status: WorkOrderStatus;
  priority: Priority;
  tasks: string[];
  estimatedCost: number;
  actualCost: number;
  materialCost: number;
  laborCost: number;
  progress: number;
  createdDate: string;
  createdBy: string;
  approvedBy: string;
  approvedDate: string;
  notes: string;
}

// --- Repair Task ---

export interface RepairTask {
  id: string;
  workOrderId: string;
  workOrderCode: string;
  taskName: string;
  description: string;
  stage: RepairStage;
  assignee: string;
  assigneeId: string;
  plannedHours: number;
  actualHours: number;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string;
  actualEnd: string;
  progress: number;
  status: RepairTaskStatus;
  materials: string[];
  notes: string;
  sequence: number;
}

// --- Material ---

export interface Material {
  id: string;
  name: string;
  code: string;
  type: 'component' | 'module' | 'consumable' | 'tool';
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  workOrderId: string;
  taskId: string;
  issuedDate: string;
  returnedDate: string;
  status: 'requested' | 'issued' | 'used' | 'returned';
}

// --- Inspection ---

export interface Inspection {
  id: string;
  workOrderId: string;
  workOrderCode: string;
  equipmentName: string;
  type: InspectionType;
  status: InspectionStatus;
  inspector: string;
  inspectorId: string;
  date: string;
  criteria: string[];
  results: string;
  passed: boolean;
  notes: string;
}

// --- Repair History ---

export interface RepairHistoryRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  workOrderId: string;
  workOrderCode: string;
  repairType: RepairType;
  rootCause: string;
  completedDate: string;
  totalCost: number;
  materialCost: number;
  laborCost: number;
  repairDuration: number;
  outcome: 'success' | 'partial' | 'failed';
  isRecurring: boolean;
  nextScheduledCheck: string;
}

// --- Material Request ---

export type MaterialRequestStatus = 'draft' | 'submitted' | 'approved' | 'issuing' | 'received' | 'rejected';

export interface MaterialRequestItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  note: string;
}

export interface MaterialRequest {
  id: string;
  code: string;
  workOrderId: string;
  workOrderCode: string;
  equipmentName: string;
  unitName: string;
  items: MaterialRequestItem[];
  status: MaterialRequestStatus;
  totalEstimatedCost: number;
  requestedBy: string;
  requestedDate: string;
  approvedBy: string;
  approvedDate: string;
  issuedBy: string;
  issuedDate: string;
  receivedBy: string;
  receivedDate: string;
  warehouseNote: string;
  notes: string;
}

// --- Alert ---

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  relatedId: string;
  relatedCode: string;
  createdDate: string;
  isRead: boolean;
  isResolved: boolean;
}

// --- Monthly Stats ---

export interface MonthlyRepairStats {
  month: string;
  received: number;
  completed: number;
  inProgress: number;
  overdue: number;
}
