// ═══════════════════════════════════════════════════════════════
// Domain types — Quản lý Sản xuất (da-sanxuat)
// ═══════════════════════════════════════════════════════════════

// --- Đơn vị tổ chức ---
export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
  head: string;
}

// --- QT1: Cấu trúc sản phẩm (BOM) ---
export type BOMStatus = 'draft' | 'pending_approval' | 'active' | 'deprecated';

export interface ProductStructure {
  id: string;
  code: string;
  name: string;
  type: 'finished' | 'module' | 'semi_finished' | 'part';
  version: string;
  previousVersion?: string;
  parentId?: string;
  children?: ProductStructure[];
  scope: 'new_production' | 'repair' | 'overhaul';
  equipmentModel: string;
  description?: string;
  status: BOMStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BOMItem {
  id: string;
  bomId: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  quantity: number;
  type: 'main' | 'auxiliary' | 'consumable' | 'replacement';
  position?: string;
  substituteCode?: string;
  usedInStep?: number[];
}

// --- QT2: Công nghệ & công đoạn ---
export type RoutingStatus = 'draft' | 'approved' | 'active' | 'deprecated';

export interface ProcessRouting {
  id: string;
  code: string;
  productId: string;
  productName: string;
  version: string;
  previousVersion?: string;
  description?: string;
  type: 'new_production' | 'repair' | 'overhaul';
  status: RoutingStatus;
  totalSteps: number;
  estimatedDays: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ProcessStep {
  id: string;
  routingId: string;
  stepNo: number;
  name: string;
  description: string;
  workshopId: string;
  workshopName: string;
  equipmentRequired: string[];
  skillRequired: string[];
  requiredWorkers: number;
  estimatedHours: number;
  isMandatory: boolean;
  qualityStandard?: string;
  previousStepId?: string;
}

// --- QT3: Kế hoạch & lệnh sản xuất ---
export type ProductionPlanStatus = 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export interface ProductionPlan {
  id: string;
  code: string;
  name: string;
  year: number;
  quarter?: number;
  month?: number;
  status: ProductionPlanStatus;
  totalOrders: number;
  completedOrders: number;
  totalProducts: number;
  completedProducts: number;
  startDate: string;
  endDate: string;
  approvedBy?: string;
  approvedAt?: string;
  description?: string;
  createdAt: string;
  note?: string;
}

export type ProductionOrderStatus =
  | 'draft' | 'pending_material' | 'ready'
  | 'in_progress' | 'paused' | 'completed' | 'closed' | 'cancelled';

export type ProductionOrderType = 'new_product' | 'spare_part' | 'semi_finished' | 'repair_support';

export type SourceType = 'contract' | 'repair_request' | 'overhaul_plan' | 'inventory_reserve' | 'other';

export interface ProductionOrder {
  id: string;
  code: string;
  planId: string;
  productId: string;
  productName: string;
  productCode: string;
  bomVersion: string;
  routingVersion: string;
  type: ProductionOrderType;
  quantity: number;
  completedQty: number;
  defectQty: number;
  status: ProductionOrderStatus;
  priority: 'critical' | 'high' | 'normal' | 'low';
  workshopId: string;
  workshopName: string;
  workshopIds?: string[];
  workshopNames?: string[];
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  assignedTo?: string;
  sourceType?: SourceType;
  sourceReference?: string;
  note?: string;
  createdAt: string;
}

// --- Log tiến độ sản xuất ---
export interface ProductionLog {
  id: string;
  orderId: string;
  timestamp: string;
  createdBy: string;
  addedQty: number;
  defectQty: number;
  currentStep?: string;
  stepStatus?: 'in_progress' | 'completed' | 'failed';
  action: 'update' | 'pause' | 'resume' | 'complete';
  materialsUsed: { materialCode: string; materialName: string; quantity: number }[];
  laborHours?: number;
  laborWorkers?: number;
  equipmentHours?: number;
  equipmentName?: string;
  qualityResult?: string;
  note?: string;
}

// --- QT4: Thực hiện sản xuất ---
export type StepExecutionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface StepExecution {
  id: string;
  orderId: string;
  stepId: string;
  stepNo: number;
  stepName: string;
  workshopName: string;
  status: StepExecutionStatus;
  assignedWorkers: string[];
  startTime?: string;
  endTime?: string;
  actualHours?: number;
  qualityResult?: 'passed' | 'failed' | 'rework';
  note?: string;
}

export interface MaterialConsumption {
  id: string;
  orderId: string;
  stepExecutionId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  plannedQty: number;
  actualQty: number;
  variance: number;
  issuedDate: string;
}

// --- QT5: Hoàn thành & nhập kho ---
export type CompletionStatus = 'pending_inspection' | 'inspected' | 'warehouse_received' | 'closed';

export interface ProductionCompletion {
  id: string;
  orderId: string;
  orderCode: string;
  productName: string;
  completedQty: number;
  passedQty: number;
  defectQty: number;
  status: CompletionStatus;
  inspectedBy?: string;
  inspectedAt?: string;
  warehouseReceiptCode?: string;
  warehouseLocation?: string;
  completedAt: string;
}

// --- QT6: Thay đổi kỹ thuật ---
export type ECRStatus = 'draft' | 'evaluating' | 'approved' | 'implementing' | 'completed' | 'rejected';
export type ECRType = 'design_change' | 'material_change' | 'process_change';

export interface EngineeringChangeRequest {
  id: string;
  code: string;
  title: string;
  type: ECRType;
  description: string;
  reason: string;
  status: ECRStatus;
  affectedProducts: string[];
  affectedOrders: number;
  affectedInventory: number;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  effectiveDate?: string;
  newVersion?: string;
  previousVersion?: string;
}

// --- QT7: Sản xuất vật tư kỹ thuật ---
export interface MaterialProductionOrder {
  id: string;
  code: string;
  materialCode: string;
  materialName: string;
  specification: string;
  requestedQty: number;
  completedQty: number;
  sourceOrderId?: string;
  sourceOrderCode?: string;
  workshopId: string;
  workshopName: string;
  status: ProductionOrderStatus;
  priority: 'critical' | 'high' | 'normal' | 'low';
  startDate: string;
  endDate: string;
  createdAt: string;
}

// --- QT8: Bán thành phẩm & luồng SX ---
export type WIPStatus = 'not_started' | 'in_progress' | 'waiting' | 'completed' | 'blocked';

export interface WorkInProgress {
  id: string;
  orderId: string;
  orderCode: string;
  productName: string;
  componentName: string;
  currentStep: number;
  totalSteps: number;
  currentWorkshop: string;
  status: WIPStatus;
  startedAt?: string;
  completedAt?: string;
  lastUpdated: string;
  estimatedCompletion?: string;
  blockReason?: string;
}

// --- QT9: Năng lực sản xuất ---
export type ResourceType = 'machine' | 'line' | 'worker';

export interface ProductionResource {
  id: string;
  code: string;
  name: string;
  type: ResourceType;
  workshopId: string;
  workshopName: string;
  capacityPerDay: number;
  unit: string;
  currentUtilization: number;
  status: 'available' | 'busy' | 'maintenance' | 'offline';
}

export interface CapacityPlan {
  workshopId: string;
  workshopName: string;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  bottleneck: boolean;
  resources: ProductionResource[];
}

// --- Báo cáo & cảnh báo ---
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface ProductionAlert {
  id: string;
  type: 'delay' | 'material_shortage' | 'quality_issue' | 'capacity_overload' | 'material_variance' | 'step_blocked';
  severity: AlertSeverity;
  title: string;
  description: string;
  relatedOrderId?: string;
  relatedOrderCode?: string;
  workshopId?: string;
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

export interface MonthlyProduction {
  month: string;
  planned: number;
  actual: number;
}

export interface WorkshopSummary {
  workshopId: string;
  workshopName: string;
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  utilizationRate: number;
  onTimeRate: number;
}
