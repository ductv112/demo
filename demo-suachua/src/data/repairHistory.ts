import type { RepairHistoryRecord, MonthlyRepairStats } from '../types';

export const repairHistory: RepairHistoryRecord[] = [
  {
    id: 'RH001', equipmentId: 'EQ-RDR-001', equipmentName: 'Đài radar P-18', equipmentType: 'radar',
    workOrderId: 'WO001', workOrderCode: 'LSC-2026-001', repairType: 'medium',
    rootCause: 'Hỏng mô-đun thu phát RF', completedDate: '2026-02-12',
    totalCost: 172, materialCost: 128, laborCost: 44, repairDuration: 25,
    outcome: 'success', isRecurring: false, nextScheduledCheck: '2026-08-12',
  },
  {
    id: 'RH002', equipmentId: 'EQ-COM-001', equipmentName: 'Thiết bị thông tin liên lạc mặt đất-không', equipmentType: 'communication',
    workOrderId: 'WO004', workOrderCode: 'LSC-2026-004', repairType: 'small',
    rootCause: 'Hỏng bộ khuếch đại tín hiệu', completedDate: '2026-02-18',
    totalCost: 38, materialCost: 25, laborCost: 13, repairDuration: 10,
    outcome: 'success', isRecurring: false, nextScheduledCheck: '2026-08-18',
  },
  {
    id: 'RH003', equipmentId: 'EQ-RDR-001', equipmentName: 'Đài radar P-18', equipmentType: 'radar',
    workOrderId: '', workOrderCode: 'LSC-2025-015', repairType: 'small',
    rootCause: 'Hỏng tụ điện lọc nguồn', completedDate: '2025-09-20',
    totalCost: 28, materialCost: 15, laborCost: 13, repairDuration: 5,
    outcome: 'success', isRecurring: false, nextScheduledCheck: '2026-03-20',
  },
  {
    id: 'RH004', equipmentId: 'EQ-RDR-002', equipmentName: 'Đài radar 36D6', equipmentType: 'radar',
    workOrderId: '', workOrderCode: 'LSC-2025-008', repairType: 'medium',
    rootCause: 'Suy giảm bộ thu do nhiệt', completedDate: '2025-06-15',
    totalCost: 95, materialCost: 68, laborCost: 27, repairDuration: 20,
    outcome: 'success', isRecurring: true, nextScheduledCheck: '2025-12-15',
  },
  {
    id: 'RH005', equipmentId: 'EQ-MSL-001', equipmentName: 'Hệ thống dẫn S-125 Pechora', equipmentType: 'missile',
    workOrderId: '', workOrderCode: 'LSC-2025-012', repairType: 'medium',
    rootCause: 'Lỗi phần mềm điều khiển', completedDate: '2025-08-30',
    totalCost: 65, materialCost: 20, laborCost: 45, repairDuration: 15,
    outcome: 'success', isRecurring: true, nextScheduledCheck: '2026-02-28',
  },
  {
    id: 'RH006', equipmentId: 'EQ-RDR-003', equipmentName: 'Đài radar P-37', equipmentType: 'radar',
    workOrderId: '', workOrderCode: 'LSC-2025-018', repairType: 'small',
    rootCause: 'Hỏng relay điều khiển', completedDate: '2025-11-10',
    totalCost: 22, materialCost: 12, laborCost: 10, repairDuration: 3,
    outcome: 'success', isRecurring: false, nextScheduledCheck: '2026-05-10',
  },
];

export const monthlyRepairStats: MonthlyRepairStats[] = [
  { month: '2026-01', received: 5, completed: 1, inProgress: 3, overdue: 0 },
  { month: '2026-02', received: 4, completed: 2, inProgress: 4, overdue: 1 },
  { month: '2026-03', received: 3, completed: 0, inProgress: 3, overdue: 1 },
  { month: '2026-04', received: 0, completed: 0, inProgress: 3, overdue: 2 },
];

export const getHistoryByEquipment = (equipmentId: string) =>
  repairHistory.filter(h => h.equipmentId === equipmentId);
