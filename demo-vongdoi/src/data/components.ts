export interface EquipComponent {
  id: string;
  equipmentId: string;
  name: string;
  code: string;
  group: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  quantity: number;
  unit: string;
  replacedDate?: string;
  nextReplaceDate?: string;
  notes?: string;
}

export const equipmentComponents: EquipComponent[] = [
  // ── EQ001: Hệ thống Monitoring P-18 ─────────────────────────────────
  { id: 'C001-01', equipmentId: 'EQ001', group: 'Hệ thống thu phát', name: 'Module thu phát RF', code: 'RF-TX-P18-01', condition: 'poor', quantity: 1, unit: 'bộ', replacedDate: '2019-06-20', nextReplaceDate: '2026-06-30', notes: 'Đang thay thế trong nâng cấp' },
  { id: 'C001-02', equipmentId: 'EQ001', group: 'Hệ thống thu phát', name: 'Bộ xử lý chính', code: 'PA-P18-02', condition: 'fair', quantity: 2, unit: 'cái', replacedDate: '2022-03-10', nextReplaceDate: '2027-03-10' },
  { id: 'C001-03', equipmentId: 'EQ001', group: 'Hệ thống thu phát', name: 'Bộ lọc băng thông', code: 'BPF-P18-03', condition: 'good', quantity: 4, unit: 'cái', replacedDate: '2023-11-05' },
  { id: 'C001-04', equipmentId: 'EQ001', group: 'Hệ thống anten', name: 'Anten mảng pha chính', code: 'ANT-P18-01', condition: 'fair', quantity: 1, unit: 'bộ', replacedDate: '2019-06-20', nextReplaceDate: '2026-12-31' },
  { id: 'C001-05', equipmentId: 'EQ001', group: 'Hệ thống anten', name: 'Motor quay anten', code: 'MTR-P18-02', condition: 'good', quantity: 1, unit: 'cái', replacedDate: '2023-08-15', nextReplaceDate: '2028-08-15' },
  { id: 'C001-06', equipmentId: 'EQ001', group: 'Hệ thống xử lý tín hiệu', name: 'Bo mạch xử lý tín hiệu số', code: 'DSP-P18-01', condition: 'good', quantity: 2, unit: 'cái', replacedDate: '2021-09-20', nextReplaceDate: '2026-09-20' },
  { id: 'C001-07', equipmentId: 'EQ001', group: 'Hệ thống xử lý tín hiệu', name: 'Màn hình hiển thị', code: 'DSP-MON-01', condition: 'good', quantity: 2, unit: 'cái', replacedDate: '2022-05-10' },
  { id: 'C001-08', equipmentId: 'EQ001', group: 'Nguồn điện & Làm mát', name: 'Bộ nguồn chính UPS', code: 'PWR-P18-01', condition: 'excellent', quantity: 1, unit: 'bộ', replacedDate: '2024-01-15', nextReplaceDate: '2029-01-15' },
  { id: 'C001-09', equipmentId: 'EQ001', group: 'Nguồn điện & Làm mát', name: 'Hệ thống làm mát khí nén', code: 'CLR-P18-01', condition: 'fair', quantity: 1, unit: 'bộ', replacedDate: '2020-04-10', nextReplaceDate: '2026-04-10', notes: 'Sắp đến hạn bảo trì' },

  // ── EQ002: Hệ thống Monitoring 36D6 ──────────────────────────────────
  { id: 'C002-01', equipmentId: 'EQ002', group: 'Hệ thống thu phát', name: 'Đèn magnetron', code: 'MAG-36D6-01', condition: 'good', quantity: 1, unit: 'cái', replacedDate: '2023-05-20', nextReplaceDate: '2026-05-20' },
  { id: 'C002-02', equipmentId: 'EQ002', group: 'Hệ thống thu phát', name: 'Bộ thu siêu cao tần', code: 'RCV-36D6-01', condition: 'good', quantity: 1, unit: 'bộ', replacedDate: '2022-11-10' },
  { id: 'C002-03', equipmentId: 'EQ002', group: 'Hệ thống anten', name: 'Anten parabol', code: 'ANT-36D6-01', condition: 'excellent', quantity: 1, unit: 'bộ', replacedDate: '2020-07-15' },
  { id: 'C002-04', equipmentId: 'EQ002', group: 'Hệ thống xử lý', name: 'Máy tính nhúng xử lý', code: 'CPU-36D6-01', condition: 'good', quantity: 2, unit: 'cái', replacedDate: '2023-02-28' },
  { id: 'C002-05', equipmentId: 'EQ002', group: 'Nguồn điện & Làm mát', name: 'Bộ nguồn switching', code: 'PSU-36D6-01', condition: 'good', quantity: 3, unit: 'cái', replacedDate: '2023-08-01' },

  // ── EQ003: Module S-75 ──────────────────────────────────────────────
  { id: 'C003-01', equipmentId: 'EQ003', group: 'Hệ thống dẫn hướng', name: 'Module điều khiển vận hành', code: 'GDN-S75-01', condition: 'fair', quantity: 1, unit: 'bộ', replacedDate: '2021-06-10', nextReplaceDate: '2026-06-10' },
  { id: 'C003-02', equipmentId: 'EQ003', group: 'Hệ thống dẫn hướng', name: 'Bộ thu lệnh vô tuyến', code: 'CMD-S75-01', condition: 'good', quantity: 1, unit: 'bộ', replacedDate: '2023-03-20' },
  { id: 'C003-03', equipmentId: 'EQ003', group: 'Cơ cấu triển khai', name: 'Bệ triển khai quay', code: 'LCH-S75-01', condition: 'good', quantity: 1, unit: 'bộ', replacedDate: '2022-10-05' },
  { id: 'C003-04', equipmentId: 'EQ003', group: 'Cơ cấu triển khai', name: 'Motor nâng hạ', code: 'MTR-S75-02', condition: 'excellent', quantity: 2, unit: 'cái', replacedDate: '2024-02-14' },
  { id: 'C003-05', equipmentId: 'EQ003', group: 'Hệ thống điện', name: 'Bộ nguồn khởi động', code: 'STR-S75-01', condition: 'good', quantity: 1, unit: 'cái', replacedDate: '2023-09-10' },

  // ── Generic cho EQ004 – EQ015 ────────────────────────────────────
  ...(['EQ004','EQ005','EQ006','EQ007','EQ008','EQ009','EQ010','EQ011','EQ012','EQ013','EQ014','EQ015'] as const).flatMap((eqId, idx) => ([
    { id: `C${eqId}-01`, equipmentId: eqId, group: 'Hệ thống chính', name: 'Khối xử lý trung tâm', code: `CPU-${eqId}-01`, condition: idx % 4 === 0 ? 'fair' : 'good' as 'fair'|'good', quantity: 1, unit: 'bộ', replacedDate: `202${2 + (idx % 3)}-0${(idx % 9) + 1}-10` },
    { id: `C${eqId}-02`, equipmentId: eqId, group: 'Hệ thống chính', name: 'Module thu phát tín hiệu', code: `MOD-${eqId}-02`, condition: idx % 5 === 0 ? 'poor' : 'good' as 'poor'|'good', quantity: 2, unit: 'cái', replacedDate: `202${1 + (idx % 4)}-${(idx % 11) + 1 < 10 ? '0' : ''}${(idx % 11) + 1}-15`, nextReplaceDate: `202${6 + (idx % 2)}-06-30` },
    { id: `C${eqId}-03`, equipmentId: eqId, group: 'Nguồn điện & Làm mát', name: 'Bộ nguồn cấp điện', code: `PSU-${eqId}-03`, condition: 'excellent' as 'excellent', quantity: 1, unit: 'bộ', replacedDate: `2024-0${(idx % 9) + 1}-01` },
    { id: `C${eqId}-04`, equipmentId: eqId, group: 'Phụ kiện', name: 'Cáp kết nối & đầu nối', code: `CBL-${eqId}-04`, condition: 'good' as 'good', quantity: 12, unit: 'bộ', replacedDate: `2023-0${(idx % 9) + 1}-20` },
  ])),
];

export const getComponentsByEquipment = (equipmentId: string): EquipComponent[] =>
  equipmentComponents.filter(c => c.equipmentId === equipmentId);
