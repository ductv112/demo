import { BudgetRequest } from '../types';

export const budgetRequests2027: BudgetRequest[] = [
  {
    id: 'BR-001', costPlanId: 'KHCP-2027', departmentId: 'PX1', taskType: 'project',
    taskName: 'SC Đài radar P-18 và 36D6 năm 2027', description: 'Sửa chữa các đài radar cảnh giới theo kế hoạch năm 2027',
    requestedAmount: 7500, approvedAmount: undefined, sourceId: 'NS-DA', categoryId: 'CC-SC',
    startDate: '2027-01-01', endDate: '2027-12-31', status: 'submitted', submittedAt: '2026-06-10',
    previousYearActual: 5800,
    items: [
      { id: 'BRI-001', name: 'Vật tư, linh kiện thay thế', amount: 3200 },
      { id: 'BRI-002', name: 'Nhân công sửa chữa', amount: 2000 },
      { id: 'BRI-003', name: 'Thuê thiết bị đo, kiểm', amount: 1200 },
      { id: 'BRI-004', name: 'Thuê chuyên gia', amount: 700 },
      { id: 'BRI-005', name: 'Vận chuyển khí tài', amount: 400 },
    ],
  },
  {
    id: 'BR-002', costPlanId: 'KHCP-2027', departmentId: 'PX1', taskType: 'research',
    taskName: 'ĐT Đài radar P-37 năm 2027', description: 'Đại tu đài radar dẫn đường P-37 theo kế hoạch năm 2027',
    requestedAmount: 6200, sourceId: 'NS-DA', categoryId: 'CC-DTU',
    startDate: '2027-01-01', endDate: '2027-12-31', status: 'submitted', submittedAt: '2026-06-12',
    previousYearActual: 5600,
    items: [
      { id: 'BRI-006', name: 'Vật tư, phụ tùng đại tu', amount: 2800 },
      { id: 'BRI-007', name: 'Nhân công đại tu', amount: 1800 },
      { id: 'BRI-008', name: 'Thử nghiệm, hiệu chuẩn', amount: 1000 },
      { id: 'BRI-009', name: 'Vận chuyển và lắp đặt', amount: 600 },
    ],
  },
  {
    id: 'BR-003', costPlanId: 'KHCP-2027', departmentId: 'PX2', taskType: 'project',
    taskName: 'SC Tổ hợp tên lửa S-125 và SA-3 năm 2027', description: 'Sửa chữa tổ hợp tên lửa phòng không theo kế hoạch',
    requestedAmount: 9000, sourceId: 'NS-DA', categoryId: 'CC-SC',
    startDate: '2027-01-01', endDate: '2027-12-31', status: 'submitted', submittedAt: '2026-06-15',
    previousYearActual: 8200,
    items: [
      { id: 'BRI-010', name: 'Vật tư, linh kiện bệ phóng', amount: 3500 },
      { id: 'BRI-011', name: 'Nhân công sửa chữa', amount: 2500 },
      { id: 'BRI-012', name: 'Hệ thống thủy lực', amount: 1800 },
      { id: 'BRI-013', name: 'Thử nghiệm hệ thống điều khiển', amount: 1200 },
    ],
  },
  {
    id: 'BR-004', costPlanId: 'KHCP-2027', departmentId: 'PKT', taskType: 'research',
    taskName: 'NC nâng cấp phần mềm radar số GĐ2', description: 'Tiếp tục nghiên cứu nâng cấp phần mềm xử lý tín hiệu radar',
    requestedAmount: 3200, sourceId: 'NS-NCKH', categoryId: 'CC-NCKH',
    startDate: '2027-01-01', endDate: '2027-12-31', status: 'submitted', submittedAt: '2026-06-18',
    previousYearActual: 2800,
    items: [
      { id: 'BRI-014', name: 'Thiết bị phần cứng thử nghiệm', amount: 1200 },
      { id: 'BRI-015', name: 'Phần mềm bản quyền', amount: 800 },
      { id: 'BRI-016', name: 'Nhân công nghiên cứu', amount: 800 },
      { id: 'BRI-017', name: 'Nghiệm thu, báo cáo', amount: 400 },
    ],
  },
  {
    id: 'BR-005', costPlanId: 'KHCP-2027', departmentId: 'PX4', taskType: 'project',
    taskName: 'SC Hệ thống thông tin liên lạc năm 2027', description: 'Sửa chữa hệ thống thông tin liên lạc cho các Sư đoàn',
    requestedAmount: 5000, sourceId: 'NS-DA', categoryId: 'CC-SC',
    startDate: '2027-01-01', endDate: '2027-12-31', status: 'draft',
    items: [
      { id: 'BRI-018', name: 'Module RF và linh kiện', amount: 2200 },
      { id: 'BRI-019', name: 'Nhân công sửa chữa', amount: 1500 },
      { id: 'BRI-020', name: 'Thử nghiệm tích hợp', amount: 1300 },
    ],
  },
  {
    id: 'BR-006', costPlanId: 'KHCP-2027', departmentId: 'PHCKT', taskType: 'admin',
    taskName: 'Chi phí hành chính hậu cần năm 2027', description: 'Dự toán chi phí văn phòng, xăng dầu, bảo trì xưởng năm 2027',
    requestedAmount: 5600, sourceId: 'NS-TX', categoryId: 'CC-HCHC',
    startDate: '2027-01-01', endDate: '2027-12-31', status: 'submitted', submittedAt: '2026-06-20',
    previousYearActual: 5200,
    items: [
      { id: 'BRI-021', name: 'Văn phòng phẩm', amount: 1500 },
      { id: 'BRI-022', name: 'Xăng dầu, phương tiện', amount: 2200 },
      { id: 'BRI-023', name: 'Sửa chữa, bảo trì xưởng', amount: 1900 },
    ],
  },
  {
    id: 'BR-007', costPlanId: 'KHCP-2027', departmentId: 'PKH', taskType: 'training',
    taskName: 'Chương trình đào tạo năm 2027', description: 'Đào tạo nâng cao năng lực kỹ thuật cho cán bộ, nhân viên nhà máy',
    requestedAmount: 2800, sourceId: 'NS-TX', categoryId: 'CC-DT',
    startDate: '2027-01-01', endDate: '2027-12-31', status: 'submitted', submittedAt: '2026-06-22',
    previousYearActual: 2400,
    items: [
      { id: 'BRI-024', name: 'Đào tạo kỹ thuật radar thế hệ mới', amount: 1000 },
      { id: 'BRI-025', name: 'Đào tạo vận hành thiết bị ATE', amount: 700 },
      { id: 'BRI-026', name: 'Đào tạo an toàn bức xạ điện từ', amount: 600 },
      { id: 'BRI-027', name: 'Đào tạo quản lý chất lượng', amount: 500 },
    ],
  },
];
