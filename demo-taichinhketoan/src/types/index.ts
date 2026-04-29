// ═══════════════════════════════════════════════════════════════
// Cấu trúc dữ liệu Doanh nghiệp A - Quản lý Tài chính Kế toán
// Flow: Đăng ký nhu cầu → Tổng hợp → Phê duyệt → Phân bổ → Thực hiện → Thanh toán
// ═══════════════════════════════════════════════════════════════

// ─── Tổ chức ──────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  shortName: string;
  type: 'leadership' | 'admin' | 'technical';
  head: string;
}

// ─── Kế hoạch chi phí (KHCP) ─────────────────────────────────
export type CostPlanStatus =
  | 'draft'            // Đang lập KH
  | 'collecting'       // Đang thu thập nhu cầu
  | 'consolidating'    // Đang tổng hợp
  | 'pending_approval' // Chờ phê duyệt
  | 'approved'         // Đã phê duyệt
  | 'allocating'       // Đang phân bổ
  | 'executing'        // Đang thực hiện
  | 'settling'         // Đang quyết toán
  | 'settled';         // Đã quyết toán

export interface CostPlan {
  id: string;
  year: number;
  status: CostPlanStatus;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  registrationDeadline?: string;
  approvedDate?: string;
  approvedBy?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Nguồn kinh phí ──────────────────────────────────────────
export type BudgetSourceType = 'state' | 'project' | 'research' | 'service' | 'internal' | 'special';

export interface BudgetSource {
  id: string;
  name: string;
  type: BudgetSourceType;
  description: string;
}

// ─── Hạng mục chi phí (Danh mục) ─────────────────────────────
export interface CostCategory {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  children?: CostCategory[];
}

// Loại hạng mục (map từ CostCategory top-level)
export type CategoryType = 'project' | 'research' | 'document' | 'standard' | 'training' | 'admin';

// ─── GĐ1: Đăng ký nhu cầu (PB → Ban TC) ────────────────────
// PB đăng ký theo HẠNG MỤC CHI PHÍ, ước lượng tổng
export interface BudgetRegistration {
  id: string;
  costPlanId: string;
  departmentId: string;
  categoryId: string;         // Hạng mục CP: CC-DA, CC-NCKH, CC-DT...
  categoryType: CategoryType; // Derived from categoryId
  estimatedAmount: number;    // Ước lượng tổng
  justification: string;      // Giải trình nhu cầu
  previousYearActual?: number; // Thực tế năm trước (tham khảo)
  adjustedAmount?: number;    // Số tiền sau khi Ban TC điều chỉnh
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'adjusted' | 'rejected';
  submittedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

// ─── GĐ2: Phân bổ NS (theo hạng mục + phòng ban) ───────────
// Sau khi KHCP được duyệt, Ban TC phân bổ NS cho từng PB theo hạng mục
export interface BudgetAllocation {
  id: string;
  costPlanId: string;
  departmentId: string;
  categoryId: string;         // Hạng mục CP
  categoryType: CategoryType;
  totalAllocated: number;     // Tổng được phân bổ
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  spent: number;              // Tổng đã chi (tính từ tasks)
  committed: number;          // Cam kết chi
  remaining: number;          // Còn lại
  sourceId: string;           // Nguồn kinh phí
  status: 'allocated' | 'executing' | 'completed';
}

// ─── GĐ3: Nhiệm vụ (khai báo khi thực hiện) ────────────────
// PB khai báo nhiệm vụ cụ thể dưới hạng mục đã được phân bổ NS
export interface Task {
  id: string;
  allocationId: string;       // Thuộc phân bổ nào
  costPlanId: string;
  departmentId: string;
  categoryType: CategoryType;
  name: string;               // Tên nhiệm vụ: "Phát triển module CRM"
  description: string;
  plannedBudget: number;      // Dự toán cho nhiệm vụ này
  spent: number;              // Đã chi (tính từ work items)
  committed: number;
  remaining: number;
  progress: number;           // % tiến độ (rollup từ work items)
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  startDate: string;
  endDate: string;
  createdAt: string;
}

// ─── GĐ3b: Công việc (dưới nhiệm vụ) ───────────────────────
// Chi tiết công việc cụ thể, cập nhật tiến độ ở mức này
export interface WorkItem {
  id: string;
  taskId: string;
  name: string;               // "TK sơ bộ", "Mua license phần mềm"
  description?: string;
  plannedAmount: number;
  actualAmount: number;       // Thực chi
  progress: number;           // % hoàn thành
  status: 'not_started' | 'in_progress' | 'completed';
  startDate?: string;
  endDate?: string;
}

// ─── GĐ4: Đề nghị thanh toán (gắn với công việc/nhiệm vụ) ──
export type PaymentRequestStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'returned';

export interface PaymentRequest {
  id: string;
  code: string;
  costPlanId: string;
  departmentId: string;
  taskId: string;             // Gắn với nhiệm vụ cụ thể
  workItemId?: string;        // Optional: gắn với công việc cụ thể
  allocationId: string;       // Ref đến phân bổ NS
  categoryType: CategoryType;
  title: string;
  description: string;
  amount: number;
  status: PaymentRequestStatus;
  createdBy: string;
  createdAt: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  attachments: Attachment[];
  paymentMethod?: 'transfer' | 'advance' | 'direct';
  vendor?: string;
  contractNo?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

// ─── Cảnh báo ─────────────────────────────────────────────────
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: 'over_budget' | 'slow_disbursement' | 'deadline' | 'pending_payment' | 'duplicate_staff' | 'low_budget';
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

// ─── Điều chỉnh KHCP ─────────────────────────────────────────
export interface CostPlanAdjustment {
  id: string;
  costPlanId: string;
  version: number;
  adjustedBy: string;
  adjustedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  changes: AdjustmentChange[];
}

export interface AdjustmentChange {
  allocationId: string;
  categoryName: string;
  departmentName: string;
  previousAmount: number;
  newAmount: number;
  difference: number;
  reason: string;
}

// ─── Báo cáo & Tổng hợp ──────────────────────────────────────
export interface MonthlySpending {
  month: string;
  planned: number;
  actual: number;
}

export interface DepartmentSummary {
  departmentId: string;
  departmentName: string;
  allocated: number;
  spent: number;
  committed: number;
  remaining: number;
  progress: number;
  taskCount: number;
  pendingPayments: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
  departments: { departmentName: string; amount: number; spent: number }[];
}

// ─── Đề xuất ngân sách (Budget Request) ─────────────────────
export interface BudgetRequestItem {
  id: string;
  name: string;
  amount: number;
}

export interface BudgetRequest {
  id: string;
  costPlanId: string;
  departmentId: string;
  taskType: CategoryType;
  taskName: string;
  description: string;
  requestedAmount: number;
  approvedAmount?: number;
  sourceId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  previousYearActual?: number;
  items?: BudgetRequestItem[];
}

// ─── User ─────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'finance' | 'department_head' | 'staff';
  department: string;
  avatar?: string;
}
