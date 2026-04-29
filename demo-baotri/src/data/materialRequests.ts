import type { MaterialRequest } from '../types';

export const materialRequests: MaterialRequest[] = [
  // ══ Yêu cầu cấp phát cho PO S-300PMU (đã hoàn thành) ══
  {
    id: 'MR001', code: 'YC-VT-2026-001', type: 'issue', status: 'received',
    poId: 'PO001', poCode: 'WO-2026-001', planId: 'MP006', planCode: 'KHBT-2026-006',
    equipmentId: 'EQ007', equipmentName: 'Sản phẩm chủ lực S-300PMU',
    requestedBy: 'Phạm Thanh Sơn', requestedDate: '2026-03-04',
    departmentId: 'PX2', departmentName: 'TT Sản phẩm chủ lực',
    warehouseId: 'WH01', warehouseName: 'Kho Vật tư chính',
    lines: [
      { id: 'MRL001', productId: 'PRD-031', partCode: 'MBT-SM-001', partName: 'Mỡ bôi trơn Siemens', unit: 'kg', requestedQty: 1, approvedQty: 1, issuedQty: 1, receivedQty: 1, returnedQty: 0.5, qtyAvailable: 7 },
    ],
    totalItems: 1,
    outboundOrderCode: 'PX-2026-015',
    approvedBy: 'Trần Đức Mạnh', approvedDate: '2026-03-04',
    receivedBy: 'Phạm Thanh Sơn', receivedDate: '2026-03-05',
    createdAt: '2026-03-04',
  },
  {
    id: 'MR002', code: 'YC-VT-2026-002', type: 'issue', status: 'received',
    poId: 'PO002', poCode: 'WO-2026-002', planId: 'MP006', planCode: 'KHBT-2026-006',
    equipmentId: 'EQ007', equipmentName: 'Sản phẩm chủ lực S-300PMU',
    requestedBy: 'Phạm Thanh Sơn', requestedDate: '2026-03-04',
    departmentId: 'PX2', departmentName: 'TT Sản phẩm chủ lực',
    warehouseId: 'WH04', warehouseName: 'Kho Phụ tùng Kỹ thuật',
    lines: [
      { id: 'MRL002', productId: 'PRD-011', partCode: 'BTD-S300-002', partName: 'Bộ tiếp điểm điều khiển S-300', unit: 'cái', requestedQty: 4, approvedQty: 4, issuedQty: 4, receivedQty: 4, returnedQty: 1, qtyAvailable: 6, lotNumber: 'LOT-2025-BTD-003' },
    ],
    totalItems: 1,
    outboundOrderCode: 'PX-2026-015',
    approvedBy: 'Trần Đức Mạnh', approvedDate: '2026-03-04',
    receivedBy: 'Phạm Thanh Sơn', receivedDate: '2026-03-05',
    createdAt: '2026-03-04',
  },
  // ══ Yêu cầu trả kho vật tư dư (từ MR002) ══
  {
    id: 'MR003', code: 'YC-VT-2026-003', type: 'return', status: 'returned',
    poId: 'PO002', poCode: 'WO-2026-002', planId: 'MP006', planCode: 'KHBT-2026-006',
    equipmentId: 'EQ007', equipmentName: 'Sản phẩm chủ lực S-300PMU',
    requestedBy: 'Phạm Thanh Sơn', requestedDate: '2026-03-06',
    departmentId: 'PX2', departmentName: 'TT Sản phẩm chủ lực',
    warehouseId: 'WH04', warehouseName: 'Kho Phụ tùng Kỹ thuật',
    lines: [
      { id: 'MRL003', productId: 'PRD-011', partCode: 'BTD-S300-002', partName: 'Bộ tiếp điểm điều khiển S-300', unit: 'cái', requestedQty: 1, receivedQty: 1, returnedQty: 1, qtyAvailable: 6, lotNumber: 'LOT-2025-BTD-003', notes: 'Hoàn trả 1 cái chưa sử dụng' },
    ],
    totalItems: 1,
    inboundOrderCode: 'PN-2026-009',
    receivedBy: 'Nguyễn Văn Kho', receivedDate: '2026-03-06',
    notes: 'Trả vật tư dư từ WO-2026-002',
    createdAt: '2026-03-06',
  },
  // ══ Yêu cầu cấp phát cho PO S-125 (đang xử lý) ══
  {
    id: 'MR004', code: 'YC-VT-2026-004', type: 'issue', status: 'warehouse_processing',
    poId: 'PO011', poCode: 'WO-2026-011', planId: 'MP003', planCode: 'KHBT-2026-003',
    equipmentId: 'EQ006', equipmentName: 'Sản phẩm chủ lực S-125 Pechora',
    requestedBy: 'Phạm Thanh Sơn', requestedDate: '2026-04-01',
    departmentId: 'PX2', departmentName: 'TT Sản phẩm chủ lực',
    warehouseId: 'WH04', warehouseName: 'Kho Phụ tùng Kỹ thuật',
    lines: [
      { id: 'MRL004', productId: 'PRD-010', partCode: 'MDD-S125-001', partName: 'Module điều phối S-125', unit: 'cái', requestedQty: 1, approvedQty: 1, qtyAvailable: 0, serialNumber: 'SN-MDD-S125-007', notes: 'Tồn kho = 0, đang chờ bổ sung từ NCC' },
    ],
    totalItems: 1,
    outboundOrderCode: 'PX-2026-021',
    approvedBy: 'Trần Đức Mạnh', approvedDate: '2026-04-01',
    notes: 'Vật tư đặc chủng, tồn kho đã hết. Kho đang liên hệ NCC Datadog.',
    createdAt: '2026-04-01',
  },
  // ══ Yêu cầu cấp phát cho PO Monitoring P-18 (đã gửi, chờ duyệt) ══
  {
    id: 'MR005', code: 'YC-VT-2026-005', type: 'issue', status: 'submitted',
    poId: 'PO021', poCode: 'WO-2026-021', planId: 'MP001', planCode: 'KHBT-2026-001',
    equipmentId: 'EQ001', equipmentName: 'Hệ thống monitoring P-18 số 01',
    requestedBy: 'Nguyễn Văn Hùng', requestedDate: '2026-04-10',
    departmentId: 'PX1', departmentName: 'TT Vận hành Hạ tầng',
    warehouseId: 'WH02', warehouseName: 'Kho Linh kiện Điện tử',
    lines: [
      { id: 'MRL005', productId: 'PRD-002', partCode: 'MTH-RD-001', partName: 'Module tín hiệu monitoring', unit: 'cái', requestedQty: 1, qtyAvailable: 6 },
    ],
    totalItems: 1,
    notes: 'Cấp phát cho bảo trì định kỳ P-18 ngày 15/04',
    createdAt: '2026-04-10',
  },
  // ══ Yêu cầu cấp phát cho KH truyền thông (bản nháp) ══
  {
    id: 'MR006', code: 'YC-VT-2026-006', type: 'issue', status: 'draft',
    planId: 'MP004', planCode: 'KHBT-2026-004',
    equipmentId: 'EQ008', equipmentName: 'Hệ thống truyền thông nội - ngoại bộ',
    requestedBy: 'Hoàng Văn Nam', requestedDate: '2026-04-08',
    departmentId: 'PX4', departmentName: 'TT Điện tử & Mạng',
    warehouseId: 'WH02', warehouseName: 'Kho Linh kiện Điện tử',
    lines: [
      { id: 'MRL006', productId: 'PRD-015', partCode: 'CTH-RF-002', partName: 'Cáp tín hiệu RF', unit: 'cuộn', requestedQty: 3, qtyAvailable: 9 },
      { id: 'MRL007', productId: 'PRD-005', partCode: 'DN-RF-001', partName: 'Đầu nối RF cao tần', unit: 'cái', requestedQty: 6, qtyAvailable: 72 },
    ],
    totalItems: 2,
    createdAt: '2026-04-08',
  },
  // ══ Yêu cầu cấp phát cho KH CNC (bản nháp) ══
  {
    id: 'MR007', code: 'YC-VT-2026-007', type: 'issue', status: 'draft',
    planId: 'MP005', planCode: 'KHBT-2026-005',
    equipmentId: 'EQ009', equipmentName: 'Máy tiện CNC vạn năng',
    requestedBy: 'Đỗ Quang Vinh', requestedDate: '2026-04-12',
    departmentId: 'PX3', departmentName: 'TT Cơ khí',
    warehouseId: 'WH01', warehouseName: 'Kho Vật tư chính',
    lines: [
      { id: 'MRL008', productId: 'PRD-030', partCode: 'DBT-CNC-001', partName: 'Dầu bôi trơn công nghiệp', unit: 'lít', requestedQty: 5, qtyAvailable: 20 },
      { id: 'MRL009', productId: 'PRD-021', partCode: 'VB-SKF-6205', partName: 'Vòng bi SKF 6205', unit: 'cái', requestedQty: 2, qtyAvailable: 15 },
    ],
    totalItems: 2,
    createdAt: '2026-04-12',
  },
];
