import { CostPlan, BudgetSource, CostCategory } from '../types';

export const costPlans: CostPlan[] = [
  {
    id: 'KHCP-2027',
    year: 2027,
    status: 'collecting',
    totalBudget: 0,
    allocatedBudget: 0,
    spentBudget: 0,
    remainingBudget: 0,
    registrationDeadline: '2026-11-30',
    note: 'Đang thu thập nhu cầu kinh phí từ các phòng ban, trung tâm',
    createdAt: '2026-04-15',
    updatedAt: '2026-06-20',
  },
  {
    id: 'KHCP-2026',
    year: 2026,
    status: 'executing',
    totalBudget: 52800,
    allocatedBudget: 51200,
    spentBudget: 32500,
    remainingBudget: 18700,
    registrationDeadline: '2025-11-30',
    approvedDate: '2025-12-20',
    approvedBy: 'Phạm Quốc Hưng',
    note: 'Kế hoạch chi phí năm 2026 - Đang thực hiện',
    createdAt: '2025-04-10',
    updatedAt: '2026-06-15',
  },
  {
    id: 'KHCP-2025',
    year: 2025,
    status: 'settled',
    totalBudget: 48500,
    allocatedBudget: 48500,
    spentBudget: 47100,
    remainingBudget: 1400,
    approvedDate: '2024-12-18',
    approvedBy: 'Phạm Quốc Hưng',
    note: 'Kế hoạch chi phí năm 2025 - Đã quyết toán',
    createdAt: '2024-04-05',
    updatedAt: '2026-03-01',
  },
  {
    id: 'KHCP-2024',
    year: 2024,
    status: 'settled',
    totalBudget: 42300,
    allocatedBudget: 42300,
    spentBudget: 41500,
    remainingBudget: 800,
    approvedDate: '2023-12-15',
    approvedBy: 'Phạm Quốc Hưng',
    createdAt: '2023-04-10',
    updatedAt: '2025-03-01',
  },
];

export const budgetSources: BudgetSource[] = [
  { id: 'NS-TX', name: 'Ngân sách thường xuyên', type: 'state', description: 'NS Nhà nước cấp hàng năm' },
  { id: 'NS-DA', name: 'Ngân sách dự án ĐTPT', type: 'project', description: 'Theo dự án sửa chữa/đại tu được duyệt' },
  { id: 'NS-NCKH', name: 'Kinh phí NCKH', type: 'research', description: 'Theo đề tài, nghiệm thu mới quyết toán' },
  { id: 'NS-DV', name: 'Kinh phí DVKHCN', type: 'service', description: 'Hợp đồng dịch vụ sửa chữa bên ngoài' },
  { id: 'NS-NB', name: 'Kinh phí nội bộ', type: 'internal', description: 'Nguồn nội bộ nhà máy' },
  { id: 'NS-DT', name: 'Kinh phí đặc thù', type: 'special', description: 'Kinh phí mật, quốc phòng' },
];

export const costCategories: CostCategory[] = [
  {
    id: 'CC-SC', code: 'SC', name: 'Chi phí bảo trì hệ thống',
    children: [
      { id: 'CC-SC-VT', code: 'SC-01', name: 'Vật tư, linh kiện thay thế' },
      { id: 'CC-SC-NC', code: 'SC-02', name: 'Nhân công bảo trì' },
      { id: 'CC-SC-TB', code: 'SC-03', name: 'Thuê thiết bị đo, kiểm' },
      { id: 'CC-SC-CG', code: 'SC-04', name: 'Thuê chuyên gia' },
      { id: 'CC-SC-VC', code: 'SC-05', name: 'Logistics thiết bị' },
    ],
  },
  {
    id: 'CC-DTU', code: 'DTU', name: 'Chi phí nâng cấp lớn hệ thống',
    children: [
      { id: 'CC-DTU-VT', code: 'DTU-01', name: 'Vật tư, phụ tùng đại tu' },
      { id: 'CC-DTU-NC', code: 'DTU-02', name: 'Nhân công đại tu' },
      { id: 'CC-DTU-TN', code: 'DTU-03', name: 'Thử nghiệm, hiệu chuẩn' },
    ],
  },
  {
    id: 'CC-NCKH', code: 'NCKH', name: 'Chi phí nghiên cứu kỹ thuật',
    children: [
      { id: 'CC-NCKH-NC', code: 'NCKH-01', name: 'Nghiên cứu cơ bản' },
      { id: 'CC-NCKH-TN', code: 'NCKH-02', name: 'Thí nghiệm, thử nghiệm' },
      { id: 'CC-NCKH-CG', code: 'NCKH-03', name: 'Thuê chuyên gia' },
    ],
  },
  {
    id: 'CC-DT', code: 'DT', name: 'Chi phí đào tạo',
    children: [
      { id: 'CC-DT-HP', code: 'DT-01', name: 'Học phí, giảng viên' },
      { id: 'CC-DT-VT', code: 'DT-02', name: 'Tài liệu, thiết bị đào tạo' },
    ],
  },
  {
    id: 'CC-HCHC', code: 'HCHC', name: 'Chi phí hành chính, logistics',
    children: [
      { id: 'CC-HCHC-VP', code: 'HCHC-01', name: 'Văn phòng phẩm' },
      { id: 'CC-HCHC-XD', code: 'HCHC-02', name: 'Xăng dầu, phương tiện' },
      { id: 'CC-HCHC-SC', code: 'HCHC-03', name: 'Sửa chữa, bảo trì CSVC' },
      { id: 'CC-HCHC-TS', code: 'HCHC-04', name: 'Trang thiết bị' },
    ],
  },
  {
    id: 'CC-KDDL', code: 'KDDL', name: 'Chi phí kiểm định, đo lường',
  },
];

export const getCostPlanById = (id: string) => costPlans.find(p => p.id === id);
