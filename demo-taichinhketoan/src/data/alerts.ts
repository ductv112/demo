import { Alert, MonthlySpending, CostPlanAdjustment } from '../types';

export const alerts: Alert[] = [
  {
    id: 'ALT-001', type: 'over_budget', severity: 'critical',
    title: 'Nguy cơ vượt ngân sách', description: 'BT Cơ cấu xoay anten hệ thống monitoring P-37 - PX3: Đã sử dụng 85% NS nhưng mới hoàn thành 55% khối lượng',
    relatedEntity: 'NV: BT Cơ cấu xoay anten hệ thống monitoring P-37', relatedEntityId: 'T-006',
    departmentId: 'PX3', createdAt: '2026-06-20', isRead: false, isResolved: false,
  },
  {
    id: 'ALT-002', type: 'slow_disbursement', severity: 'warning',
    title: 'Giải ngân chậm tiến độ', description: 'BT Hệ thống monitoring 36D6 - PX1: Giải ngân mới đạt 48% trong khi kế hoạch Q1-Q2 là 56%',
    relatedEntity: 'NV: BT Hệ thống monitoring 36D6 - Khối K01', relatedEntityId: 'T-002',
    departmentId: 'PX1', createdAt: '2026-06-18', isRead: true, isResolved: false,
  },
  {
    id: 'ALT-003', type: 'pending_payment', severity: 'warning',
    title: 'ĐNTT tồn đọng quá 7 ngày', description: 'ĐNTT-2026-007 (PX4 - Mua kit FPGA thử nghiệm) đã gửi 12 ngày chưa được xử lý',
    relatedEntity: 'ĐNTT-2026-007', relatedEntityId: 'PR-007',
    departmentId: 'PX4', createdAt: '2026-06-27', isRead: false, isResolved: false,
  },
  {
    id: 'ALT-004', type: 'low_budget', severity: 'warning',
    title: 'Ngân sách còn lại thấp', description: 'Đào tạo kỹ thuật hệ thống monitoring thế hệ mới: NS còn lại chỉ 12.5% (176/1400 triệu)',
    relatedEntity: 'NV: Đào tạo kỹ thuật vận hành hệ thống monitoring thế hệ mới', relatedEntityId: 'T-014',
    departmentId: 'PKH', createdAt: '2026-06-15', isRead: true, isResolved: false,
  },
  {
    id: 'ALT-005', type: 'duplicate_staff', severity: 'info',
    title: 'Trùng lịch nhân sự', description: 'KS. Nguyễn Văn A (PX1) được phân công đồng thời 3 nhiệm vụ BT trong tháng 7/2026',
    relatedEntity: 'Phân công nhân sự', relatedEntityId: '',
    departmentId: 'PX1', createdAt: '2026-06-25', isRead: false, isResolved: false,
  },
  {
    id: 'ALT-006', type: 'deadline', severity: 'info',
    title: 'Sắp đến hạn nghiệm thu', description: 'NC phương pháp kiểm tra mạch vi xử lý: Hạn nghiệm thu giai đoạn 1 còn 15 ngày (15/07/2026)',
    relatedEntity: 'NV: NC phương pháp kiểm tra mạch vi xử lý', relatedEntityId: 'T-011',
    departmentId: 'PX1', createdAt: '2026-06-30', isRead: false, isResolved: false,
  },
  {
    id: 'ALT-007', type: 'over_budget', severity: 'critical',
    title: 'Vượt dự toán hạng mục', description: 'BT Module S-125: Chi phí mua van thủy lực Rexroth vượt 15% do giá nhập khẩu tăng',
    relatedEntity: 'NV: BT Module triển khai S-125', relatedEntityId: 'T-003',
    departmentId: 'PX2', createdAt: '2026-06-22', isRead: true, isResolved: false,
  },
  {
    id: 'ALT-008', type: 'deadline', severity: 'warning',
    title: 'Sắp đến hạn nộp báo cáo tiến độ', description: 'Báo cáo tiến độ BT hệ thống Q2/2026 phải nộp Ban Giám đốc Doanh nghiệp A trước 15/07/2026 (còn 15 ngày)',
    relatedEntity: 'Báo cáo tiến độ Q2/2026', relatedEntityId: '',
    departmentId: 'PKH', createdAt: '2026-06-30', isRead: false, isResolved: false,
  },
  {
    id: 'ALT-009', type: 'pending_payment', severity: 'info',
    title: 'ĐNTT chờ xử lý', description: 'ĐNTT-2026-013 (Chi phí khảo sát Trung tâm R&D Đà Nẵng) đã gửi 9 ngày chưa được phê duyệt',
    relatedEntity: 'ĐNTT-2026-013', relatedEntityId: 'PR-013',
    departmentId: 'PKH', createdAt: '2026-06-29', isRead: false, isResolved: false,
  },
  {
    id: 'ALT-010', type: 'over_budget', severity: 'critical',
    title: 'Nguy cơ vượt NS đào tạo', description: 'Đào tạo kỹ thuật hệ thống monitoring: Đã chi 77% NS nhưng mới hoàn thành đợt 1/2 (đợt 2 dự kiến Q3)',
    relatedEntity: 'NV: Đào tạo kỹ thuật vận hành hệ thống monitoring thế hệ mới', relatedEntityId: 'T-014',
    departmentId: 'PKH', createdAt: '2026-06-28', isRead: false, isResolved: false,
  },
];

export const monthlySpending2026: MonthlySpending[] = [
  { month: 'T1', planned: 4200, actual: 4050 },
  { month: 'T2', planned: 4400, actual: 4580 },
  { month: 'T3', planned: 4800, actual: 4700 },
  { month: 'T4', planned: 5200, actual: 5420 },
  { month: 'T5', planned: 5500, actual: 5880 },
  { month: 'T6', planned: 5800, actual: 5600 },
  { month: 'T7', planned: 6000, actual: 0 },
  { month: 'T8', planned: 5600, actual: 0 },
  { month: 'T9', planned: 5200, actual: 0 },
  { month: 'T10', planned: 4600, actual: 0 },
  { month: 'T11', planned: 4000, actual: 0 },
  { month: 'T12', planned: 3800, actual: 0 },
];

export const adjustments2026: CostPlanAdjustment[] = [
  {
    id: 'ADJ-001', costPlanId: 'KHCP-2026', version: 1,
    adjustedBy: 'Nguyễn Thị Lan', adjustedAt: '2026-04-15',
    reason: 'Điều chuyển NS từ hạng mục đào tạo sang bảo trì PX3 do phát sinh bảo trì cơ cấu xoay hệ thống monitoring P-37',
    status: 'approved',
    changes: [
      { allocationId: 'AL-012', categoryName: 'Chi phí đào tạo', departmentName: 'P.KH', previousAmount: 2600, newAmount: 2400, difference: -200, reason: 'Giảm quy mô đào tạo đợt 2' },
      { allocationId: 'AL-004', categoryName: 'Chi phí bảo trì hệ thống', departmentName: 'PX3', previousAmount: 3000, newAmount: 3200, difference: 200, reason: 'Bổ sung chi phí BT cơ cấu xoay hệ thống monitoring P-37' },
    ],
  },
];
