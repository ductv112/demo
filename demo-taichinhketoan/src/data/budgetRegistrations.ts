import { BudgetRegistration } from '../types';

// ─── Đăng ký nhu cầu chi phí năm 2027 ───────────────────────
export const budgetRegistrations2027: BudgetRegistration[] = [
  {
    id: 'BR-001', costPlanId: 'KHCP-2027', departmentId: 'PX1',
    categoryId: 'CC-SC', categoryType: 'project',
    estimatedAmount: 10500,
    justification: 'SC 3 đài radar: P-18 (TĐ 291), 36D6 (SĐ 361), P-37 (SĐ 363). Dự kiến phát sinh thêm 1 đài từ Quân chủng.',
    previousYearActual: 9800,
    status: 'submitted', submittedAt: '2026-06-10',
  },
  {
    id: 'BR-002', costPlanId: 'KHCP-2027', departmentId: 'PX1',
    categoryId: 'CC-NCKH', categoryType: 'research',
    estimatedAmount: 2200,
    justification: 'Tiếp tục ĐT NC phương pháp kiểm tra mạch vi xử lý GĐ2 + đề tài mới về phục hồi board mạch.',
    previousYearActual: 1800,
    status: 'submitted', submittedAt: '2026-06-12',
  },
  {
    id: 'BR-003', costPlanId: 'KHCP-2027', departmentId: 'PX2',
    categoryId: 'CC-SC', categoryType: 'project',
    estimatedAmount: 9000,
    justification: 'SC tổ hợp tên lửa S-125 (TĐ 285), SA-3, dự kiến thêm 1 tổ hợp S-75 từ đơn vị.',
    previousYearActual: 8200,
    status: 'submitted', submittedAt: '2026-06-15',
  },
  {
    id: 'BR-004', costPlanId: 'KHCP-2027', departmentId: 'PX2',
    categoryId: 'CC-DTU', categoryType: 'research',
    estimatedAmount: 5500,
    justification: 'Đại tu tổ hợp S-75 GĐ2 + dự kiến đại tu bổ sung 1 tổ hợp SA-3.',
    previousYearActual: 4800,
    status: 'submitted', submittedAt: '2026-06-15',
  },
  {
    id: 'BR-005', costPlanId: 'KHCP-2027', departmentId: 'PX4',
    categoryId: 'CC-SC', categoryType: 'project',
    estimatedAmount: 5000,
    justification: 'SC hệ thống thông tin liên lạc cho SĐ 367 + SĐ 361.',
    previousYearActual: 4500,
    status: 'submitted', submittedAt: '2026-06-18',
  },
  {
    id: 'BR-006', costPlanId: 'KHCP-2027', departmentId: 'PX4',
    categoryId: 'CC-NCKH', categoryType: 'research',
    estimatedAmount: 1800,
    justification: 'Tiếp tục NC ứng dụng FPGA thay thế linh kiện cũ GĐ2 + đề xuất NC mạch tích hợp.',
    previousYearActual: 1500,
    status: 'submitted', submittedAt: '2026-06-18',
  },
  {
    id: 'BR-007', costPlanId: 'KHCP-2027', departmentId: 'PX3',
    categoryId: 'CC-SC', categoryType: 'project',
    estimatedAmount: 3600,
    justification: 'SC cơ cấu cơ khí cho các đài radar và bệ phóng tên lửa theo kế hoạch 2027.',
    previousYearActual: 3200,
    status: 'draft',
  },
  {
    id: 'BR-008', costPlanId: 'KHCP-2027', departmentId: 'PKT',
    categoryId: 'CC-NCKH', categoryType: 'research',
    estimatedAmount: 3200,
    justification: 'NC nâng cấp phần mềm radar số GĐ2 + đề xuất NC quy trình kiểm tra không phá hủy.',
    previousYearActual: 2800,
    status: 'draft',
  },
  {
    id: 'BR-009', costPlanId: 'KHCP-2027', departmentId: 'PKCDB',
    categoryId: 'CC-KDDL', categoryType: 'standard',
    estimatedAmount: 1800,
    justification: 'Kiểm định thiết bị đo lường + mua sắm bổ sung thiết bị đo kiểm mới.',
    previousYearActual: 1600,
    status: 'submitted', submittedAt: '2026-06-20',
  },
  {
    id: 'BR-010', costPlanId: 'KHCP-2027', departmentId: 'PHCKT',
    categoryId: 'CC-HCHC', categoryType: 'admin',
    estimatedAmount: 5600,
    justification: 'Chi phí hành chính hậu cần năm 2027: văn phòng phẩm, xăng dầu, bảo trì xưởng.',
    previousYearActual: 5200,
    status: 'submitted', submittedAt: '2026-06-20',
  },
  {
    id: 'BR-011', costPlanId: 'KHCP-2027', departmentId: 'PKH',
    categoryId: 'CC-DT', categoryType: 'training',
    estimatedAmount: 2800,
    justification: 'Đào tạo nâng cao: kỹ thuật radar thế hệ mới, thiết bị ATE, an toàn bức xạ.',
    previousYearActual: 2400,
    status: 'submitted', submittedAt: '2026-06-22',
  },
  {
    id: 'BR-012', costPlanId: 'KHCP-2027', departmentId: 'PKT',
    categoryId: 'CC-DTU', categoryType: 'research',
    estimatedAmount: 2600,
    justification: 'Xây dựng quy trình đại tu cho radar thế hệ mới nhập về năm 2027.',
    previousYearActual: 2200,
    status: 'submitted', submittedAt: '2026-06-22',
  },
  {
    id: 'BR-013', costPlanId: 'KHCP-2027', departmentId: 'PCT',
    categoryId: 'CC-HCHC', categoryType: 'admin',
    estimatedAmount: 1300,
    justification: 'Chi phí hoạt động công tác chính trị năm 2027.',
    previousYearActual: 1200,
    status: 'submitted', submittedAt: '2026-06-25',
  },
  {
    id: 'BR-014', costPlanId: 'KHCP-2027', departmentId: 'PX1',
    categoryId: 'CC-DTU', categoryType: 'research',
    estimatedAmount: 6200,
    justification: 'Đại tu 2 đài radar P-37 và P-18 theo kế hoạch năm 2027.',
    previousYearActual: 5600,
    status: 'submitted', submittedAt: '2026-06-20',
  },
];

export const getRegistrationsByDepartment = (departmentId: string) =>
  budgetRegistrations2027.filter(r => r.departmentId === departmentId);

export const getRegistrationsByCostPlan = (costPlanId: string) =>
  budgetRegistrations2027.filter(r => r.costPlanId === costPlanId);

export const getRegistrationsByCategory = (categoryType: string) =>
  budgetRegistrations2027.filter(r => r.categoryType === categoryType);
