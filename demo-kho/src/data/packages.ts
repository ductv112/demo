import type { PackageRecord } from '../types';

// ═══════════════════════════════════════════════════════════
// Mock Data — Kiện hàng / Đóng gói
// Ngữ cảnh: Trung tâm Hà Nội
// ═══════════════════════════════════════════════════════════

export const packages: PackageRecord[] = [
  // ── PKG-2026-001: Pallet linh kiện monitoring P-18 (in_stock) ──
  {
    id: 'pkg-001',
    code: 'PKG-2026-001',
    type: 'pallet',
    status: 'in_stock',
    warehouseId: 'wh-002',
    warehouseName: 'Kho Linh kiện Điện tử',
    locationCode: 'B-02-04',
    items: [
      { productId: 'PRD-001', productCode: 'RD-BM-001', productName: 'Bo mạch xử lý tín hiệu monitoring P-18', qty: 8, unit: 'Cái' },
      { productId: 'PRD-014', productCode: 'IC-KD-014', productName: 'IC khuếch đại vi sai LM358', qty: 50, unit: 'Cái' },
    ],
    totalWeight: 12.5,
    dimensions: '1200x800x400mm',
    note: 'Linh kiện thay thế phục vụ đại tu monitoring P-18 đợt Q2/2026',
    inboundOrderId: 'IB001',
    createdBy: 'Trần Văn Minh',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-01-15T08:30:00Z',
  },

  // ── PKG-2026-002: Thùng tụ điện + điện trở (in_stock) ──
  {
    id: 'pkg-002',
    code: 'PKG-2026-002',
    type: 'thùng',
    status: 'in_stock',
    warehouseId: 'wh-002',
    warehouseName: 'Kho Linh kiện Điện tử',
    locationCode: 'B-01-11',
    items: [
      { productId: 'PRD-004', productCode: 'TD-LN-004', productName: 'Tụ điện lọc nguồn 47µF', qty: 200, unit: 'Cái' },
      { productId: 'PRD-005', productCode: 'DR-CX-005', productName: 'Điện trở chính xác 10kΩ', qty: 500, unit: 'Cái' },
    ],
    totalWeight: 3.8,
    dimensions: '400x300x250mm',
    note: 'Kiện linh kiện thụ động đặt từ nhà cung cấp Hà Nội',
    inboundOrderId: 'IB003',
    createdBy: 'Lê Quang Hùng',
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-01-22T09:00:00Z',
  },

  // ── PKG-2026-003: Container cáp tín hiệu (in_transit) ──
  {
    id: 'pkg-003',
    code: 'PKG-2026-003',
    type: 'container',
    status: 'in_transit',
    warehouseId: 'wh-001',
    warehouseName: 'Kho Vật tư chính',
    items: [
      { productId: 'PRD-007', productCode: 'CB-DT-007', productName: 'Cáp tín hiệu đồng trục RG-58', qty: 150, unit: 'Mét' },
      { productId: 'PRD-015', productCode: 'CB-NG-015', productName: 'Cáp nguồn bọc giáp 3×4mm²', qty: 200, unit: 'Mét' },
    ],
    totalWeight: 85.0,
    dimensions: '2400x1200x1200mm',
    note: 'Container hỗn hợp cáp từ Nhà máy dây cáp Hải Phòng, dự kiến về 20/04/2026',
    inboundOrderId: 'IB005',
    createdBy: 'Phạm Đức Anh',
    createdAt: '2026-03-10T07:00:00Z',
    updatedAt: '2026-04-01T14:00:00Z',
  },

  // ── PKG-2026-004: Kiện vòng bi SKF (in_stock) ──
  {
    id: 'pkg-004',
    code: 'PKG-2026-004',
    type: 'kiện',
    status: 'in_stock',
    warehouseId: 'wh-001',
    warehouseName: 'Kho Vật tư chính',
    locationCode: 'A-05-02',
    items: [
      { productId: 'PRD-009', productCode: 'VB-OL-009', productName: 'Vòng bi ổ lăn SKF 6204', qty: 40, unit: 'Cái' },
    ],
    totalWeight: 5.6,
    dimensions: '500x400x300mm',
    note: 'Vòng bi ổ lăn nhập từ Siemens, đã qua kiểm định chất lượng',
    inboundOrderId: 'IB002',
    createdBy: 'Lê Quang Hùng',
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
  },

  // ── PKG-2026-005: Pallet dầu bôi trơn (in_stock) ──
  {
    id: 'pkg-005',
    code: 'PKG-2026-005',
    type: 'pallet',
    status: 'in_stock',
    warehouseId: 'wh-003',
    warehouseName: 'Kho Hóa chất & Vật liệu',
    locationCode: 'C-01-01',
    items: [
      { productId: 'PRD-016', productCode: 'DU-BT-016', productName: 'Dầu bôi trơn turbine ISO VG 46', qty: 120, unit: 'Lít' },
    ],
    totalWeight: 132.0,
    dimensions: '1200x800x500mm',
    note: '6 thùng 20L — Petrovietnam, nhập Q1/2026',
    inboundOrderId: 'IB004',
    createdBy: 'Phạm Đức Anh',
    createdAt: '2026-02-18T08:30:00Z',
    updatedAt: '2026-02-18T08:30:00Z',
  },

  // ── PKG-2026-006: Túi hóa chất tẩy rửa + IPA (opened) ──
  {
    id: 'pkg-006',
    code: 'PKG-2026-006',
    type: 'túi',
    status: 'opened',
    warehouseId: 'wh-003',
    warehouseName: 'Kho Hóa chất & Vật liệu',
    locationCode: 'C-02-05',
    items: [
      { productId: 'PRD-017', productCode: 'HC-TR-017', productName: 'Hóa chất tẩy rửa bo mạch', qty: 6, unit: 'Hộp' },
      { productId: 'PRD-018', productCode: 'DM-IPA-018', productName: 'Dung môi Isopropanol IPA 99.9%', qty: 10, unit: 'Lít' },
    ],
    totalWeight: 9.2,
    note: 'Đã mở để cấp phát cho PX4 — còn lại theo tồn kho thực tế',
    inboundOrderId: 'IB004',
    createdBy: 'Phạm Đức Anh',
    createdAt: '2026-02-18T09:00:00Z',
    updatedAt: '2026-03-15T14:30:00Z',
  },

  // ── PKG-2026-007: Thùng thiếc hàn (dispatched) ──
  {
    id: 'pkg-007',
    code: 'PKG-2026-007',
    type: 'thùng',
    status: 'dispatched',
    warehouseId: 'wh-002',
    warehouseName: 'Kho Linh kiện Điện tử',
    items: [
      { productId: 'PRD-020', productCode: 'HD-SN-020', productName: 'Cuộn dây hàn thiếc SnPb 63/37', qty: 24, unit: 'Cuộn' },
    ],
    totalWeight: 7.5,
    dimensions: '400x350x250mm',
    note: 'Xuất cho PX4 — phục vụ sửa chữa tổ hợp điều khiển S-125',
    inboundOrderId: 'IB002',
    outboundOrderId: 'OB-2026-008',
    createdBy: 'Lê Quang Hùng',
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-03-20T16:00:00Z',
  },

  // ── PKG-2026-008: Kiện cáp quang (in_transit) ──
  {
    id: 'pkg-008',
    code: 'PKG-2026-008',
    type: 'kiện',
    status: 'in_transit',
    items: [
      { productId: 'PRD-025', productCode: 'CQ-SM-025', productName: 'Cáp quang đơn mode 9/125µm', qty: 330, unit: 'Mét' },
    ],
    totalWeight: 4.2,
    dimensions: '600x600x200mm',
    note: 'Đặt từ Tektronix — dự kiến về 25/04/2026, phục vụ nâng cấp hệ thống liên lạc ST-68',
    inboundOrderId: 'IB006',
    createdBy: 'Trần Văn Minh',
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-04-01T08:00:00Z',
  },

  // ── PKG-2026-009: Pallet động cơ bước (in_stock) ──
  {
    id: 'pkg-009',
    code: 'PKG-2026-009',
    type: 'pallet',
    status: 'in_stock',
    warehouseId: 'wh-001',
    warehouseName: 'Kho Vật tư chính',
    locationCode: 'A-03-08',
    items: [
      { productId: 'PRD-013', productCode: 'DC-BC-013', productName: 'Động cơ bước điều khiển góc ăng-ten', qty: 6, unit: 'Cái' },
    ],
    totalWeight: 18.0,
    dimensions: '800x600x400mm',
    note: '3 bộ (cặp đối xứng) — phục vụ đại tu hệ ăng-ten monitoring P-37',
    inboundOrderId: 'IB003',
    createdBy: 'Lê Quang Hùng',
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────

export const getPackageById = (id: string): PackageRecord | undefined =>
  packages.find(p => p.id === id);

export const getPackagesByWarehouse = (warehouseId: string): PackageRecord[] =>
  packages.filter(p => p.warehouseId === warehouseId);

export const getPackagesByStatus = (status: string): PackageRecord[] =>
  packages.filter(p => p.status === status);
