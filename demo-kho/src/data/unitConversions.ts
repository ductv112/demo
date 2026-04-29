import type { UnitConversionRecord } from '../types';

// ═══════════════════════════════════════════════════════════
// Mock Data — Quy đổi đơn vị tính
// Ngữ cảnh: Trung tâm Hà Nội
// factor: 1 alternateUnit = factor × baseUnit (đơn vị chính)
// VD: baseUnit = "Cái", alternateUnit = "Hộp", factor = 50
//     → 1 Hộp = 50 Cái
// ═══════════════════════════════════════════════════════════

export const unitConversions: UnitConversionRecord[] = [
  // PRD-001 — Bo mạch xử lý tín hiệu monitoring P-18 (baseUnit: Cái)
  {
    id: 'UOM-001',
    productId: 'PRD-001',
    alternateUnit: 'Bộ',
    factor: 4,
    note: 'Nhập từ nhà cung cấp theo bộ (4 cái/bộ)',
    createdBy: 'Trần Văn Minh',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z',
  },

  // PRD-004 — Tụ điện lọc nguồn 47µF (baseUnit: Cái)
  {
    id: 'UOM-002',
    productId: 'PRD-004',
    alternateUnit: 'Hộp',
    factor: 50,
    note: 'Đóng gói nhà sản xuất 50 cái/hộp',
    createdBy: 'Trần Văn Minh',
    createdAt: '2024-03-10T08:15:00Z',
    updatedAt: '2024-03-10T08:15:00Z',
  },

  // PRD-005 — Điện trở chính xác 10kΩ (baseUnit: Cái)
  {
    id: 'UOM-003',
    productId: 'PRD-005',
    alternateUnit: 'Hộp',
    factor: 20,
    note: 'Cuộn 20 cái của nhà cung cấp Hà Nội',
    createdBy: 'Trần Văn Minh',
    createdAt: '2024-03-10T08:30:00Z',
    updatedAt: '2024-03-10T08:30:00Z',
  },

  // PRD-007 — Cáp tín hiệu đồng trục RG-58 (baseUnit: Mét)
  {
    id: 'UOM-004',
    productId: 'PRD-007',
    alternateUnit: 'Đoạn (3m)',
    factor: 3,
    note: 'Cắt sẵn đoạn 3m phục vụ lắp ráp tại chỗ',
    createdBy: 'Trần Văn Minh',
    createdAt: '2024-04-01T09:00:00Z',
    updatedAt: '2024-04-01T09:00:00Z',
  },

  // PRD-009 — Vòng bi ổ lăn SKF 6204 (baseUnit: Cái)
  {
    id: 'UOM-005',
    productId: 'PRD-009',
    alternateUnit: 'Hộp',
    factor: 10,
    note: 'Đóng hộp 10 cái của hãng SKF',
    createdBy: 'Lê Quang Hùng',
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-04-05T10:00:00Z',
  },

  // PRD-013 — Động cơ bước điều khiển góc ăng-ten (baseUnit: Cái)
  {
    id: 'UOM-006',
    productId: 'PRD-013',
    alternateUnit: 'Bộ',
    factor: 2,
    note: 'Mỗi bộ gồm 2 cái (cặp đối xứng cho hệ ăng-ten)',
    createdBy: 'Lê Quang Hùng',
    createdAt: '2024-04-10T08:00:00Z',
    updatedAt: '2024-04-10T08:00:00Z',
  },

  // PRD-014 — IC khuếch đại vi sai LM358 (baseUnit: Cái)
  {
    id: 'UOM-007',
    productId: 'PRD-014',
    alternateUnit: 'Hộp',
    factor: 10,
    note: 'Ống 10 cái của Texas Instruments',
    createdBy: 'Trần Văn Minh',
    createdAt: '2024-04-12T09:30:00Z',
    updatedAt: '2024-04-12T09:30:00Z',
  },

  // PRD-015 — Cáp nguồn bọc giáp 3×4mm² (baseUnit: Mét)
  {
    id: 'UOM-008',
    productId: 'PRD-015',
    alternateUnit: 'Cuộn (100m)',
    factor: 100,
    note: 'Cuộn chuẩn 100m của nhà máy dây cáp Hải Phòng',
    createdBy: 'Lê Quang Hùng',
    createdAt: '2024-04-15T14:00:00Z',
    updatedAt: '2024-04-15T14:00:00Z',
  },

  // PRD-016 — Dầu bôi trơn turbine ISO VG 46 (baseUnit: Lít)
  {
    id: 'UOM-009',
    productId: 'PRD-016',
    alternateUnit: 'Thùng (20L)',
    factor: 20,
    note: 'Thùng tiêu chuẩn 20 lít của nhà cung cấp Petrovietnam',
    createdBy: 'Phạm Đức Anh',
    createdAt: '2024-04-16T08:00:00Z',
    updatedAt: '2024-04-16T08:00:00Z',
  },

  // PRD-017 — Hóa chất tẩy rửa bo mạch (baseUnit: Hộp)
  {
    id: 'UOM-010',
    productId: 'PRD-017',
    alternateUnit: 'Kiện (10 hộp)',
    factor: 10,
    note: 'Kiện 10 hộp, đặt hàng tối thiểu 1 kiện',
    createdBy: 'Phạm Đức Anh',
    createdAt: '2024-04-16T08:30:00Z',
    updatedAt: '2024-04-16T08:30:00Z',
  },

  // PRD-018 — Dung môi Isopropanol IPA 99.9% (baseUnit: Lít)
  {
    id: 'UOM-011',
    productId: 'PRD-018',
    alternateUnit: 'Can (5L)',
    factor: 5,
    note: 'Can nhựa 5L nhập khẩu',
    createdBy: 'Phạm Đức Anh',
    createdAt: '2024-04-18T10:00:00Z',
    updatedAt: '2024-04-18T10:00:00Z',
  },

  // PRD-020 — Cuộn dây hàn thiếc SnPb 63/37 (baseUnit: Cuộn)
  {
    id: 'UOM-012',
    productId: 'PRD-020',
    alternateUnit: 'Thùng (24 cuộn)',
    factor: 24,
    note: 'Thùng carton 24 cuộn, mua số lượng lớn',
    createdBy: 'Phạm Đức Anh',
    createdAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-05-01T09:00:00Z',
  },

  // PRD-025 — Cáp quang đơn mode 9/125µm (baseUnit: Mét)
  {
    id: 'UOM-013',
    productId: 'PRD-025',
    alternateUnit: 'Cuộn (33m)',
    factor: 33,
    note: 'Chiều dài chuẩn lắp đặt trong tủ điều khiển',
    createdBy: 'Trần Văn Minh',
    createdAt: '2024-05-10T08:00:00Z',
    updatedAt: '2024-05-10T08:00:00Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────

/** Lấy tất cả conversion records của 1 sản phẩm */
export const getUnitConversions = (productId: string): UnitConversionRecord[] =>
  unitConversions.filter(u => u.productId === productId);

/** Lấy danh sách options đơn vị cho sản phẩm (baseUnit + alternates) */
export const getUnitOptions = (productId: string, baseUnit: string) => {
  const conversions = getUnitConversions(productId);
  return [
    { value: baseUnit, label: baseUnit, factor: 1, isBase: true },
    ...conversions.map(c => ({
      value: c.alternateUnit,
      label: `${c.alternateUnit} (1 ${c.alternateUnit} = ${c.factor} ${baseUnit})`,
      factor: c.factor,
      isBase: false,
    })),
  ];
};

/** Quy đổi số lượng từ đơn vị bất kỳ về baseUnit */
export const convertToBase = (qty: number, unit: string, productId: string, baseUnit: string): number => {
  if (unit === baseUnit) return qty;
  const conv = unitConversions.find(u => u.productId === productId && u.alternateUnit === unit);
  return conv ? qty * conv.factor : qty;
};
