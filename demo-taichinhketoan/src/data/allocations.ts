import { BudgetAllocation } from '../types';

// Phân bổ theo HẠNG MỤC + PHÒNG BAN/PHÂN XƯỞNG
export const allocations2026: BudgetAllocation[] = [
  // ─── Sửa chữa khí tài (CC-SC) ────────────────────────────────
  { id: 'AL-001', costPlanId: 'KHCP-2026', departmentId: 'PX1', categoryId: 'CC-SC', categoryType: 'project', totalAllocated: 9800, q1: 2200, q2: 2600, q3: 2700, q4: 2300, spent: 6120, committed: 980, remaining: 2700, sourceId: 'NS-DA', status: 'executing' },
  { id: 'AL-002', costPlanId: 'KHCP-2026', departmentId: 'PX2', categoryId: 'CC-SC', categoryType: 'project', totalAllocated: 8200, q1: 1800, q2: 2200, q3: 2200, q4: 2000, spent: 5120, committed: 820, remaining: 2260, sourceId: 'NS-DA', status: 'executing' },
  { id: 'AL-003', costPlanId: 'KHCP-2026', departmentId: 'PX4', categoryId: 'CC-SC', categoryType: 'project', totalAllocated: 4500, q1: 1000, q2: 1200, q3: 1200, q4: 1100, spent: 3150, committed: 450, remaining: 900, sourceId: 'NS-DA', status: 'executing' },
  { id: 'AL-004', costPlanId: 'KHCP-2026', departmentId: 'PX3', categoryId: 'CC-SC', categoryType: 'project', totalAllocated: 3200, q1: 800, q2: 800, q3: 800, q4: 800, spent: 1920, committed: 320, remaining: 960, sourceId: 'NS-DA', status: 'executing' },

  // ─── Đại tu khí tài (CC-DTU) ──────────────────────────────────
  { id: 'AL-005', costPlanId: 'KHCP-2026', departmentId: 'PX1', categoryId: 'CC-DTU', categoryType: 'research', totalAllocated: 5600, q1: 1400, q2: 1400, q3: 1400, q4: 1400, spent: 3640, committed: 560, remaining: 1400, sourceId: 'NS-DA', status: 'executing' },
  { id: 'AL-006', costPlanId: 'KHCP-2026', departmentId: 'PX2', categoryId: 'CC-DTU', categoryType: 'research', totalAllocated: 4800, q1: 1200, q2: 1200, q3: 1200, q4: 1200, spent: 3120, committed: 480, remaining: 1200, sourceId: 'NS-DA', status: 'executing' },
  { id: 'AL-007', costPlanId: 'KHCP-2026', departmentId: 'PKT', categoryId: 'CC-DTU', categoryType: 'research', totalAllocated: 2200, q1: 550, q2: 550, q3: 550, q4: 550, spent: 1430, committed: 220, remaining: 550, sourceId: 'NS-DA', status: 'executing' },

  // ─── Nghiên cứu kỹ thuật (CC-NCKH) ───────────────────────────
  { id: 'AL-008', costPlanId: 'KHCP-2026', departmentId: 'PKT', categoryId: 'CC-NCKH', categoryType: 'research', totalAllocated: 2800, q1: 700, q2: 700, q3: 700, q4: 700, spent: 1820, committed: 280, remaining: 700, sourceId: 'NS-NCKH', status: 'executing' },
  { id: 'AL-009', costPlanId: 'KHCP-2026', departmentId: 'PX1', categoryId: 'CC-NCKH', categoryType: 'research', totalAllocated: 1800, q1: 450, q2: 450, q3: 450, q4: 450, spent: 1170, committed: 180, remaining: 450, sourceId: 'NS-NCKH', status: 'executing' },
  { id: 'AL-010', costPlanId: 'KHCP-2026', departmentId: 'PX4', categoryId: 'CC-NCKH', categoryType: 'research', totalAllocated: 1500, q1: 375, q2: 375, q3: 375, q4: 375, spent: 975, committed: 150, remaining: 375, sourceId: 'NS-NCKH', status: 'executing' },

  // ─── Kiểm định, đo lường (CC-KDDL) ───────────────────────────
  { id: 'AL-011', costPlanId: 'KHCP-2026', departmentId: 'PKCDB', categoryId: 'CC-KDDL', categoryType: 'standard', totalAllocated: 1600, q1: 400, q2: 400, q3: 400, q4: 400, spent: 960, committed: 160, remaining: 480, sourceId: 'NS-TX', status: 'executing' },

  // ─── Đào tạo (CC-DT) ─────────────────────────────────────────
  { id: 'AL-012', costPlanId: 'KHCP-2026', departmentId: 'PKH', categoryId: 'CC-DT', categoryType: 'training', totalAllocated: 2400, q1: 700, q2: 700, q3: 500, q4: 500, spent: 1080, committed: 144, remaining: 1176, sourceId: 'NS-TX', status: 'executing' },

  // ─── Hành chính hậu cần (CC-HCHC) ────────────────────────────
  { id: 'AL-013', costPlanId: 'KHCP-2026', departmentId: 'PHCKT', categoryId: 'CC-HCHC', categoryType: 'admin', totalAllocated: 5200, q1: 1200, q2: 1350, q3: 1350, q4: 1300, spent: 3380, committed: 180, remaining: 1640, sourceId: 'NS-TX', status: 'executing' },
  { id: 'AL-014', costPlanId: 'KHCP-2026', departmentId: 'PCT', categoryId: 'CC-HCHC', categoryType: 'admin', totalAllocated: 1200, q1: 300, q2: 300, q3: 300, q4: 300, spent: 720, committed: 0, remaining: 480, sourceId: 'NS-TX', status: 'executing' },
  { id: 'AL-015', costPlanId: 'KHCP-2026', departmentId: 'PKH', categoryId: 'CC-HCHC', categoryType: 'admin', totalAllocated: 680, q1: 170, q2: 170, q3: 170, q4: 170, spent: 408, committed: 0, remaining: 272, sourceId: 'NS-TX', status: 'executing' },
];

export const getAllocationsByDepartment = (departmentId: string) =>
  allocations2026.filter(a => a.departmentId === departmentId);

export const getAllocationsByCostPlan = (costPlanId: string) =>
  allocations2026.filter(a => a.costPlanId === costPlanId);

export const getAllocationsByCategory = (categoryId: string) =>
  allocations2026.filter(a => a.categoryId === categoryId);
