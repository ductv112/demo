import { Task, WorkItem } from '../types';

// ─── Nhiệm vụ cụ thể (khai báo khi thực hiện, dưới phân bổ) ──
export const tasks2026: Task[] = [
  // === Bảo trì: PX1 - Hệ thống monitoring (AL-001) ===
  {
    id: 'T-001', allocationId: 'AL-001', costPlanId: 'KHCP-2026', departmentId: 'PX1', categoryType: 'project',
    name: 'BT Hệ thống monitoring P-18 - Trung tâm 291', description: 'Bảo trì hệ thống monitoring cảnh báo P-18 cho Trung tâm 291',
    plannedBudget: 4800, spent: 3360, committed: 480, remaining: 960, progress: 70,
    status: 'in_progress', startDate: '2026-01-15', endDate: '2026-08-30', createdAt: '2026-01-10',
  },
  {
    id: 'T-002', allocationId: 'AL-001', costPlanId: 'KHCP-2026', departmentId: 'PX1', categoryType: 'project',
    name: 'BT Hệ thống monitoring 36D6 - Khối K01', description: 'Bảo trì hệ thống monitoring phát hiện sự cố 36D6',
    plannedBudget: 5000, spent: 2760, committed: 500, remaining: 1740, progress: 48,
    status: 'in_progress', startDate: '2026-03-01', endDate: '2026-11-30', createdAt: '2026-02-20',
  },

  // === Bảo trì: PX2 - Module sản phẩm chủ lực (AL-002) ===
  {
    id: 'T-003', allocationId: 'AL-002', costPlanId: 'KHCP-2026', departmentId: 'PX2', categoryType: 'project',
    name: 'BT Module triển khai S-125 - Trung tâm 285', description: 'Bảo trì module triển khai và hệ thống điều hướng sản phẩm S-125',
    plannedBudget: 5200, spent: 3380, committed: 520, remaining: 1300, progress: 65,
    status: 'in_progress', startDate: '2026-01-15', endDate: '2026-10-30', createdAt: '2026-01-10',
  },
  {
    id: 'T-004', allocationId: 'AL-002', costPlanId: 'KHCP-2026', departmentId: 'PX2', categoryType: 'project',
    name: 'BT Hệ thống điều phối SA-3', description: 'Bảo trì hệ thống điều phối cho sản phẩm chủ lực SA-3',
    plannedBudget: 3000, spent: 1740, committed: 300, remaining: 960, progress: 45,
    status: 'in_progress', startDate: '2026-03-01', endDate: '2026-12-31', createdAt: '2026-02-20',
  },

  // === Bảo trì: PX4 - Điện tử (AL-003) ===
  {
    id: 'T-005', allocationId: 'AL-003', costPlanId: 'KHCP-2026', departmentId: 'PX4', categoryType: 'project',
    name: 'BT Hệ thống truyền thông nội bộ Khối K07', description: 'Bảo trì hệ thống truyền thông nội bộ kết nối các trung tâm',
    plannedBudget: 4500, spent: 3150, committed: 450, remaining: 900, progress: 72,
    status: 'in_progress', startDate: '2026-01-15', endDate: '2026-09-30', createdAt: '2026-01-10',
  },

  // === Bảo trì: PX3 - Cơ khí (AL-004) ===
  {
    id: 'T-006', allocationId: 'AL-004', costPlanId: 'KHCP-2026', departmentId: 'PX3', categoryType: 'project',
    name: 'BT Cơ cấu xoay anten hệ thống monitoring P-37', description: 'Bảo trì cơ cấu xoay và hệ thống truyền động anten hệ thống monitoring P-37',
    plannedBudget: 3200, spent: 1920, committed: 320, remaining: 960, progress: 55,
    status: 'in_progress', startDate: '2026-02-01', endDate: '2026-10-30', createdAt: '2026-01-20',
  },

  // === Nâng cấp lớn: PX1 - Hệ thống monitoring (AL-005) ===
  {
    id: 'T-007', allocationId: 'AL-005', costPlanId: 'KHCP-2026', departmentId: 'PX1', categoryType: 'research',
    name: 'NC Hệ thống monitoring P-37 số 2 - Khối K03', description: 'Nâng cấp toàn bộ hệ thống monitoring dẫn đường P-37 số hiệu 2',
    plannedBudget: 5600, spent: 3640, committed: 560, remaining: 1400, progress: 65,
    status: 'in_progress', startDate: '2026-01-10', endDate: '2026-12-31', createdAt: '2026-01-05',
  },

  // === Nâng cấp lớn: PX2 - Module sản phẩm (AL-006) ===
  {
    id: 'T-008', allocationId: 'AL-006', costPlanId: 'KHCP-2026', departmentId: 'PX2', categoryType: 'research',
    name: 'NC Sản phẩm chủ lực S-75 - Trung tâm 261', description: 'Nâng cấp toàn bộ sản phẩm chủ lực vận hành hệ thống S-75',
    plannedBudget: 4800, spent: 3120, committed: 480, remaining: 1200, progress: 60,
    status: 'in_progress', startDate: '2026-01-10', endDate: '2026-12-31', createdAt: '2026-01-05',
  },

  // === Nâng cấp lớn: PKT (AL-007) ===
  {
    id: 'T-009', allocationId: 'AL-007', costPlanId: 'KHCP-2026', departmentId: 'PKT', categoryType: 'research',
    name: 'Lập quy trình nâng cấp lớn hệ thống monitoring thế hệ mới', description: 'Xây dựng quy trình công nghệ nâng cấp lớn cho các hệ thống monitoring thế hệ mới',
    plannedBudget: 2200, spent: 1430, committed: 220, remaining: 550, progress: 62,
    status: 'in_progress', startDate: '2026-02-01', endDate: '2026-11-30', createdAt: '2026-01-20',
  },

  // === NCKH: PKT (AL-008) ===
  {
    id: 'T-010', allocationId: 'AL-008', costPlanId: 'KHCP-2026', departmentId: 'PKT', categoryType: 'research',
    name: 'NC nâng cấp phần mềm hệ thống monitoring số', description: 'Nghiên cứu nâng cấp phần mềm xử lý tín hiệu cho hệ thống monitoring số hóa',
    plannedBudget: 2800, spent: 1820, committed: 280, remaining: 700, progress: 65,
    status: 'in_progress', startDate: '2026-01-15', endDate: '2026-12-31', createdAt: '2026-01-10',
  },

  // === NCKH: PX1 (AL-009) ===
  {
    id: 'T-011', allocationId: 'AL-009', costPlanId: 'KHCP-2026', departmentId: 'PX1', categoryType: 'research',
    name: 'NC phương pháp kiểm tra mạch vi xử lý', description: 'Nghiên cứu phương pháp kiểm tra và thay thế mạch vi xử lý trong hệ thống monitoring',
    plannedBudget: 1800, spent: 1170, committed: 180, remaining: 450, progress: 60,
    status: 'in_progress', startDate: '2026-02-01', endDate: '2026-12-31', createdAt: '2026-01-20',
  },

  // === NCKH: PX4 (AL-010) ===
  {
    id: 'T-012', allocationId: 'AL-010', costPlanId: 'KHCP-2026', departmentId: 'PX4', categoryType: 'research',
    name: 'NC ứng dụng FPGA thay thế linh kiện cũ', description: 'Nghiên cứu sử dụng FPGA thay thế linh kiện điện tử đã ngừng sản xuất',
    plannedBudget: 1500, spent: 975, committed: 150, remaining: 375, progress: 58,
    status: 'in_progress', startDate: '2026-02-01', endDate: '2026-12-31', createdAt: '2026-01-20',
  },

  // === Kiểm định: PKCDB (AL-011) ===
  {
    id: 'T-013', allocationId: 'AL-011', costPlanId: 'KHCP-2026', departmentId: 'PKCDB', categoryType: 'standard',
    name: 'Kiểm định thiết bị đo lường năm 2026', description: 'Kiểm định và hiệu chuẩn toàn bộ thiết bị đo lường của Doanh nghiệp A',
    plannedBudget: 1600, spent: 960, committed: 160, remaining: 480, progress: 55,
    status: 'in_progress', startDate: '2026-01-15', endDate: '2026-12-31', createdAt: '2026-01-10',
  },

  // === Đào tạo: PKH (AL-012) ===
  {
    id: 'T-014', allocationId: 'AL-012', costPlanId: 'KHCP-2026', departmentId: 'PKH', categoryType: 'training',
    name: 'Đào tạo kỹ thuật vận hành hệ thống monitoring thế hệ mới', description: 'Khóa đào tạo kỹ thuật vận hành hệ thống monitoring cho cán bộ kỹ thuật',
    plannedBudget: 1400, spent: 1080, committed: 144, remaining: 176, progress: 80,
    status: 'in_progress', startDate: '2026-01-15', endDate: '2026-06-30', createdAt: '2026-01-10',
  },
  {
    id: 'T-015', allocationId: 'AL-012', costPlanId: 'KHCP-2026', departmentId: 'PKH', categoryType: 'training',
    name: 'Đào tạo vận hành thiết bị đo kiểm tự động', description: 'Khóa đào tạo sử dụng thiết bị ATE cho nhân viên KCS',
    plannedBudget: 1000, spent: 0, committed: 0, remaining: 1000, progress: 0,
    status: 'planning', startDate: '2026-07-01', endDate: '2026-12-31', createdAt: '2026-01-10',
  },

  // === HCHC: PHCKT (AL-013) ===
  {
    id: 'T-016', allocationId: 'AL-013', costPlanId: 'KHCP-2026', departmentId: 'PHCKT', categoryType: 'admin',
    name: 'Chi phí văn phòng phẩm', description: 'Chi phí văn phòng phẩm toàn Doanh nghiệp A',
    plannedBudget: 1400, spent: 910, committed: 0, remaining: 490, progress: 65,
    status: 'in_progress', startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '2026-01-01',
  },
  {
    id: 'T-017', allocationId: 'AL-013', costPlanId: 'KHCP-2026', departmentId: 'PHCKT', categoryType: 'admin',
    name: 'Chi phí xăng dầu, phương tiện', description: 'Chi phí xăng dầu cho đội xe phục vụ logistics thiết bị',
    plannedBudget: 2100, spent: 1470, committed: 0, remaining: 630, progress: 70,
    status: 'in_progress', startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '2026-01-01',
  },
  {
    id: 'T-018', allocationId: 'AL-013', costPlanId: 'KHCP-2026', departmentId: 'PHCKT', categoryType: 'admin',
    name: 'Sửa chữa, bảo trì cơ sở vật chất', description: 'Sửa chữa văn phòng, phòng lab, kho vật tư',
    plannedBudget: 1700, spent: 1000, committed: 180, remaining: 520, progress: 55,
    status: 'in_progress', startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '2026-01-01',
  },

  // === HCHC: PCT (AL-014) ===
  {
    id: 'T-019', allocationId: 'AL-014', costPlanId: 'KHCP-2026', departmentId: 'PCT', categoryType: 'admin',
    name: 'Chi phí truyền thông nội bộ', description: 'Chi phí hoạt động truyền thông nội bộ Doanh nghiệp A',
    plannedBudget: 1200, spent: 720, committed: 0, remaining: 480, progress: 60,
    status: 'in_progress', startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '2026-01-01',
  },

  // === HCHC: PKH (AL-015) ===
  {
    id: 'T-020', allocationId: 'AL-015', costPlanId: 'KHCP-2026', departmentId: 'PKH', categoryType: 'admin',
    name: 'Chi phí văn phòng & công tác phí P.KH', description: 'Chi phí văn phòng và công tác phí Phòng Kế hoạch',
    plannedBudget: 680, spent: 408, committed: 0, remaining: 272, progress: 60,
    status: 'in_progress', startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '2026-01-01',
  },
];

// ─── Công việc cụ thể (dưới nhiệm vụ) ───────────────────────
export const workItems2026: WorkItem[] = [
  // T-001: BT Hệ thống monitoring P-18 (PX1)
  { id: 'WI-001', taskId: 'T-001', name: 'Kiểm tra, chẩn đoán lỗi tổng thể', plannedAmount: 800, actualAmount: 800, progress: 100, status: 'completed', startDate: '2026-01-15', endDate: '2026-02-28' },
  { id: 'WI-002', taskId: 'T-001', name: 'Thay thế khối thu phát RF', plannedAmount: 2200, actualAmount: 1680, progress: 75, status: 'in_progress', startDate: '2026-03-01', endDate: '2026-06-30' },
  { id: 'WI-003', taskId: 'T-001', name: 'Mua linh kiện thay thế board xử lý', plannedAmount: 1200, actualAmount: 880, progress: 70, status: 'in_progress', startDate: '2026-01-20', endDate: '2026-05-30' },
  { id: 'WI-004', taskId: 'T-001', name: 'Hiệu chuẩn và thử nghiệm tổng thể', plannedAmount: 600, actualAmount: 0, progress: 0, status: 'not_started', startDate: '2026-07-01', endDate: '2026-08-30' },

  // T-003: BT Module S-125 (PX2)
  { id: 'WI-005', taskId: 'T-003', name: 'Tháo rã và kiểm tra module triển khai', plannedAmount: 1200, actualAmount: 1200, progress: 100, status: 'completed', startDate: '2026-01-15', endDate: '2026-03-15' },
  { id: 'WI-006', taskId: 'T-003', name: 'Phục hồi hệ thống thủy lực nâng hạ', plannedAmount: 1800, actualAmount: 1500, progress: 80, status: 'in_progress', startDate: '2026-03-01', endDate: '2026-07-30' },
  { id: 'WI-007', taskId: 'T-003', name: 'Mua van thủy lực Rexroth nhập khẩu', plannedAmount: 680, actualAmount: 680, progress: 95, status: 'in_progress', startDate: '2026-02-01', endDate: '2026-04-30' },

  // T-005: BT Hệ thống truyền thông nội bộ (PX4)
  { id: 'WI-008', taskId: 'T-005', name: 'Sửa chữa khối mã hóa tín hiệu', plannedAmount: 1800, actualAmount: 1440, progress: 80, status: 'in_progress', startDate: '2026-01-15', endDate: '2026-06-30' },
  { id: 'WI-009', taskId: 'T-005', name: 'Mua module RF cho server phát', plannedAmount: 1200, actualAmount: 1140, progress: 95, status: 'in_progress', startDate: '2026-03-01', endDate: '2026-05-30' },
  { id: 'WI-010', taskId: 'T-005', name: 'Kiểm tra tích hợp hệ thống', plannedAmount: 800, actualAmount: 480, progress: 55, status: 'in_progress', startDate: '2026-05-01', endDate: '2026-09-30' },

  // T-010: NC nâng cấp hệ thống monitoring số (PKT)
  { id: 'WI-011', taskId: 'T-010', name: 'Phân tích thuật toán xử lý tín hiệu hiện tại', plannedAmount: 800, actualAmount: 520, progress: 65, status: 'in_progress', startDate: '2026-03-01', endDate: '2026-08-30' },
  { id: 'WI-012', taskId: 'T-010', name: 'Thuê PTN ĐH Bách Khoa HN thử nghiệm', plannedAmount: 600, actualAmount: 480, progress: 80, status: 'in_progress', startDate: '2026-03-15', endDate: '2026-06-30' },
  { id: 'WI-013', taskId: 'T-010', name: 'Báo cáo kết quả nghiên cứu', plannedAmount: 400, actualAmount: 0, progress: 0, status: 'not_started', startDate: '2026-09-01', endDate: '2026-12-31' },

  // T-012: NC FPGA thay thế linh kiện cũ (PX4)
  { id: 'WI-014', taskId: 'T-012', name: 'Mua kit FPGA và linh kiện thử nghiệm', plannedAmount: 600, actualAmount: 420, progress: 65, status: 'in_progress', startDate: '2026-02-01', endDate: '2026-06-30' },
  { id: 'WI-015', taskId: 'T-012', name: 'Lập trình và nạp firmware FPGA', plannedAmount: 500, actualAmount: 380, progress: 55, status: 'in_progress', startDate: '2026-04-01', endDate: '2026-09-30' },

  // T-014: Đào tạo kỹ thuật vận hành hệ thống monitoring (PKH)
  { id: 'WI-016', taskId: 'T-014', name: 'Khóa đào tạo đợt 1 (hệ thống monitoring P-18)', plannedAmount: 700, actualAmount: 540, progress: 100, status: 'completed', startDate: '2026-01-15', endDate: '2026-03-15' },
  { id: 'WI-017', taskId: 'T-014', name: 'Khóa đào tạo đợt 2 (hệ thống monitoring 36D6)', plannedAmount: 700, actualAmount: 540, progress: 75, status: 'in_progress', startDate: '2026-04-01', endDate: '2026-06-30' },
];

export const getTasksByAllocation = (allocationId: string) =>
  tasks2026.filter(t => t.allocationId === allocationId);

export const getTasksByDepartment = (departmentId: string) =>
  tasks2026.filter(t => t.departmentId === departmentId);

export const getTasksByCostPlan = (costPlanId: string) =>
  tasks2026.filter(t => t.costPlanId === costPlanId);

export const getWorkItemsByTask = (taskId: string) =>
  workItems2026.filter(w => w.taskId === taskId);
