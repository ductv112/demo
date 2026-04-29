import dayjs from 'dayjs';

// ═══════════════════════════════════════════════════════════
// Lịch kiểm kê định kỳ — Trung tâm Hà Nội
// ═══════════════════════════════════════════════════════════

export type ScheduleFrequency = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export interface CountSchedule {
  id: string;
  warehouseId: string;      // 'wh-001' — khớp warehouses.id
  warehouseName: string;
  warehouseCode: string;    // 'WH01'  — khớp inventory.warehouseId
  managerName: string;
  frequency: ScheduleFrequency;
  frequencyDays: number;    // số ngày chu kỳ (có thể chỉnh thủ công)
  lastCountDate: string;
  nextCountDate: string;
  responsible: string;
  startDate: string;        // ngày bắt đầu áp dụng lịch
}

export const frequencyConfig: Record<ScheduleFrequency, { label: string; color: string; days: number }> = {
  monthly:     { label: 'Hằng tháng', color: 'blue',    days: 30  },
  quarterly:   { label: 'Hằng quý',   color: 'purple',  days: 90  },
  semi_annual: { label: 'Nửa năm',    color: 'cyan',    days: 180 },
  annual:      { label: 'Hằng năm',   color: 'geekblue',days: 365 },
};

// ─── Dữ liệu ban đầu ─────────────────────────────────────
const initialSchedules: CountSchedule[] = [
  {
    id: 'sch-001',
    warehouseId: 'wh-001',
    warehouseName: 'Kho Vật tư chính',
    warehouseCode: 'WH01',
    managerName: 'Trần Đức Mạnh',
    frequency: 'monthly',
    frequencyDays: 30,
    lastCountDate: '2026-03-31',
    nextCountDate: '2026-04-30',
    responsible: 'Nguyễn Hữu Phúc',
    startDate: '2025-01-01',
  },
  {
    id: 'sch-002',
    warehouseId: 'wh-002',
    warehouseName: 'Kho Linh kiện Điện tử',
    warehouseCode: 'WH02',
    managerName: 'Nguyễn Văn Hải',
    frequency: 'monthly',
    frequencyDays: 30,
    lastCountDate: '2026-02-28',
    nextCountDate: '2026-03-31',
    responsible: 'Lê Thị Minh',
    startDate: '2025-01-01',
  },
  {
    id: 'sch-003',
    warehouseId: 'wh-003',
    warehouseName: 'Kho Cơ khí & Phụ tùng',
    warehouseCode: 'WH03',
    managerName: 'Lê Quang Vinh',
    frequency: 'quarterly',
    frequencyDays: 90,
    lastCountDate: '2025-12-31',
    nextCountDate: '2026-03-31',
    responsible: 'Phạm Văn Đông',
    startDate: '2025-01-01',
  },
  {
    id: 'sch-004',
    warehouseId: 'wh-004',
    warehouseName: 'Kho Phụ tùng Kỹ thuật',
    warehouseCode: 'WH04',
    managerName: 'Phạm Hồng Sơn',
    frequency: 'quarterly',
    frequencyDays: 90,
    lastCountDate: '2026-01-05',
    nextCountDate: '2026-04-05',
    responsible: 'Trần Đình Hòa',
    startDate: '2025-01-01',
  },
  {
    id: 'sch-005',
    warehouseId: 'wh-005',
    warehouseName: 'Kho Tạm / Trung chuyển',
    warehouseCode: 'WH05',
    managerName: 'Đỗ Minh Quân',
    frequency: 'semi_annual',
    frequencyDays: 180,
    lastCountDate: '2025-09-30',
    nextCountDate: '2026-03-31',
    responsible: 'Đỗ Minh Quân',
    startDate: '2025-01-01',
  },
];

// ─── Module-level mutable store (session state) ───────────
export let scheduleList: CountSchedule[] = [...initialSchedules];

// ─── Cập nhật lịch sau khi kiểm kê hoàn thành (Bước 7) ───
export function updateScheduleAfterCount(warehouseId: string, completedDate: string): void {
  const idx = scheduleList.findIndex(s => s.warehouseId === warehouseId);
  if (idx === -1) return;
  const sch = scheduleList[idx];
  const next = dayjs(completedDate).add(sch.frequencyDays, 'day').format('YYYY-MM-DD');
  scheduleList = scheduleList.map((s, i) =>
    i === idx ? { ...s, lastCountDate: completedDate, nextCountDate: next } : s,
  );
}

// ─── Cập nhật tần suất (Bước 1) ───────────────────────────
export function updateScheduleFrequency(
  scheduleId: string,
  frequency: ScheduleFrequency,
  frequencyDays: number,
  responsible: string,
  startDate: string,
): void {
  scheduleList = scheduleList.map(s => {
    if (s.id !== scheduleId) return s;
    const next = dayjs(s.lastCountDate).add(frequencyDays, 'day').format('YYYY-MM-DD');
    return { ...s, frequency, frequencyDays, responsible, startDate, nextCountDate: next };
  });
}

// ─── Tra cứu lịch theo kho ────────────────────────────────
export function getScheduleByWarehouseId(warehouseId: string): CountSchedule | undefined {
  return scheduleList.find(s => s.warehouseId === warehouseId);
}
