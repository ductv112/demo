import type { MaintenanceHistory, MaintenanceKPI, TeamPerformance } from '../types';

export const maintenanceHistoryData: MaintenanceHistory[] = [
  {
    id: 'MH001', equipmentId: 'EQ007', equipmentName: 'Sản phẩm chủ lực S-300PMU', equipmentCode: 'TL-S300-001',
    type: 'periodic', workOrderCode: 'LBT-2026-001', date: '2026-03-05', duration: 7.5,
    teamName: 'Đội bảo trì Sản phẩm chủ lực', staffNames: ['Phạm Thanh Sơn', 'Vũ Đình Khoa'],
    description: 'Bảo trì định kỳ quý sản phẩm S-300PMU: kiểm tra bệ thử, hệ thống điều khiển, thay tiếp điểm',
    spareParts: [{ partName: 'Bộ tiếp điểm điều khiển', partCode: 'BTD-S300-002', requestedQty: 4, usedQty: 3, returnedQty: 1, unit: 'cái' }],
    results: [
      { parameter: 'Áp suất bệ thử', standardValue: '12-15 MPa', measuredValue: '13.5 MPa', status: 'pass' },
      { parameter: 'Tín hiệu điều khiển', standardValue: '> -20 dBm', measuredValue: '-15 dBm', status: 'pass' },
    ],
    status: 'completed', cost: 45,
  },
  {
    id: 'MH002', equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01', equipmentCode: 'RD-P18-001',
    type: 'corrective', workOrderCode: 'YC-SC-2026-002', date: '2026-03-15', duration: 3,
    teamName: 'Đội bảo trì Hạ tầng', staffNames: ['Nguyễn Văn Hùng', 'Trần Văn Bình'],
    description: 'Sửa chữa nhỏ: thay quạt làm mát module xử lý, vệ sinh khoang module xử lý',
    spareParts: [{ partName: 'Quạt làm mát module xử lý', partCode: 'QLM-RD-005', requestedQty: 1, usedQty: 1, returnedQty: 0, unit: 'cái' }],
    results: [
      { parameter: 'Nhiệt độ module xử lý', standardValue: '< 70°C', measuredValue: '62°C', status: 'pass' },
    ],
    status: 'completed', cost: 12,
  },
  {
    id: 'MH003', equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01', equipmentCode: 'RD-P18-001',
    type: 'periodic', workOrderCode: 'LBT-2026-P18-Q1', date: '2026-02-15', duration: 8,
    teamName: 'Đội bảo trì Hạ tầng', staffNames: ['Nguyễn Văn Hùng', 'Lê Minh Đức'],
    description: 'Bảo trì định kỳ Q1/2026: kiểm tra anten, hiệu chỉnh tần số, kiểm tra nguồn',
    spareParts: [],
    results: [
      { parameter: 'Throughput', standardValue: '150-170 Mbps', measuredValue: '162 Mbps', status: 'pass' },
      { parameter: 'Công suất xử lý', standardValue: '> 200 kQPS', measuredValue: '215 kQPS', status: 'pass' },
    ],
    status: 'completed', cost: 18,
  },
  {
    id: 'MH004', equipmentId: 'EQ003', equipmentName: 'Hệ thống monitoring P-37 số 01', equipmentCode: 'RD-P37-001',
    type: 'corrective', workOrderCode: 'YC-SC-2026-005', date: '2026-03-22', duration: 24,
    teamName: 'Đội bảo trì Hạ tầng', staffNames: ['Trần Văn Bình'],
    description: 'Sửa chữa lỗi encoder vị trí anten, chuyển sang sửa chữa lớn do không có linh kiện thay thế',
    spareParts: [],
    results: [
      { parameter: 'Đồng bộ anten', standardValue: 'Sai lệch < 0.5°', measuredValue: 'Mất đồng bộ', status: 'fail' },
    ],
    status: 'partial', cost: 5,
  },
  {
    id: 'MH005', equipmentId: 'EQ005', equipmentName: 'Sản phẩm chủ lực S-75 Dvina', equipmentCode: 'TL-S75-001',
    type: 'periodic', workOrderCode: 'LBT-2026-S75-Q1', date: '2026-02-20', duration: 10,
    teamName: 'Đội bảo trì Sản phẩm chủ lực', staffNames: ['Phạm Thanh Sơn', 'Vũ Đình Khoa'],
    description: 'Bảo trì định kỳ sản phẩm S-75: kiểm tra bệ thử, hệ thống thủy lực, điều phối',
    spareParts: [{ partName: 'Dầu thủy lực', partCode: 'DTL-S75-001', requestedQty: 10, usedQty: 8, returnedQty: 2, unit: 'lít' }],
    results: [
      { parameter: 'Áp suất thủy lực', standardValue: '18-22 MPa', measuredValue: '20.5 MPa', status: 'pass' },
      { parameter: 'Góc nâng bệ thử', standardValue: '0-85°', measuredValue: '0-84.5°', status: 'pass' },
    ],
    status: 'completed', cost: 32,
  },
];

export const maintenanceKPIs: MaintenanceKPI[] = [
  { equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01', mtbf: 720, mttr: 4, availability: 98.2, failureCount: 2, totalDowntime: 11, maintenanceCost: 30, complianceRate: 100, period: 'Q1/2026' },
  { equipmentId: 'EQ002', equipmentName: 'Hệ thống monitoring 36D6 số 01', mtbf: 960, mttr: 3, availability: 99.1, failureCount: 1, totalDowntime: 3, maintenanceCost: 15, complianceRate: 100, period: 'Q1/2026' },
  { equipmentId: 'EQ003', equipmentName: 'Hệ thống monitoring P-37 số 01', mtbf: 480, mttr: 24, availability: 92.5, failureCount: 3, totalDowntime: 96, maintenanceCost: 23, complianceRate: 85, period: 'Q1/2026' },
  { equipmentId: 'EQ004', equipmentName: 'Hệ thống monitoring ST-68 số 01', mtbf: 1200, mttr: 2, availability: 99.5, failureCount: 0, totalDowntime: 2, maintenanceCost: 8, complianceRate: 100, period: 'Q1/2026' },
  { equipmentId: 'EQ005', equipmentName: 'Sản phẩm chủ lực S-75 Dvina', mtbf: 1440, mttr: 5, availability: 98.8, failureCount: 1, totalDowntime: 10, maintenanceCost: 32, complianceRate: 100, period: 'Q1/2026' },
  { equipmentId: 'EQ006', equipmentName: 'Sản phẩm chủ lực S-125 Pechora', mtbf: 360, mttr: 48, availability: 88.5, failureCount: 4, totalDowntime: 192, maintenanceCost: 65, complianceRate: 75, period: 'Q1/2026' },
  { equipmentId: 'EQ007', equipmentName: 'Sản phẩm chủ lực S-300PMU', mtbf: 2160, mttr: 4, availability: 99.7, failureCount: 0, totalDowntime: 7.5, maintenanceCost: 45, complianceRate: 100, period: 'Q1/2026' },
  { equipmentId: 'EQ008', equipmentName: 'Hệ thống truyền thông', mtbf: 720, mttr: 2, availability: 99.0, failureCount: 2, totalDowntime: 4, maintenanceCost: 10, complianceRate: 95, period: 'Q1/2026' },
  { equipmentId: 'EQ009', equipmentName: 'Máy tiện CNC vạn năng', mtbf: 960, mttr: 3, availability: 98.5, failureCount: 1, totalDowntime: 6, maintenanceCost: 18, complianceRate: 100, period: 'Q1/2026' },
  { equipmentId: 'EQ010', equipmentName: 'Máy hiện sóng Tektronix', mtbf: 2880, mttr: 1, availability: 99.9, failureCount: 0, totalDowntime: 0, maintenanceCost: 3, complianceRate: 100, period: 'Q1/2026' },
];

export const teamPerformances: TeamPerformance[] = [
  { teamId: 'TM001', teamName: 'Đội bảo trì Hạ tầng', completedTasks: 12, totalTasks: 14, averageTime: 6.5, complianceRate: 95, qualityScore: 92 },
  { teamId: 'TM002', teamName: 'Đội bảo trì Sản phẩm chủ lực', completedTasks: 8, totalTasks: 9, averageTime: 8.2, complianceRate: 90, qualityScore: 95 },
  { teamId: 'TM003', teamName: 'Đội bảo trì Cơ khí', completedTasks: 15, totalTasks: 16, averageTime: 3.5, complianceRate: 98, qualityScore: 88 },
  { teamId: 'TM004', teamName: 'Đội bảo trì Điện tử', completedTasks: 10, totalTasks: 11, averageTime: 3.0, complianceRate: 96, qualityScore: 90 },
  { teamId: 'TM005', teamName: 'Đội bảo trì lưu động', completedTasks: 5, totalTasks: 6, averageTime: 5.5, complianceRate: 88, qualityScore: 85 },
];
