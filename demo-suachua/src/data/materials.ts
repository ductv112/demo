import type { Material } from '../types';

export const materials: Material[] = [
  { id: 'MAT001', name: 'Bo dung cu thao lap chuyen dung', code: 'VT-TL-001', type: 'tool', quantity: 1, unit: 'bo', unitPrice: 5, totalPrice: 5, workOrderId: 'WO001', taskId: 'RT001', issuedDate: '2026-01-18', returnedDate: '2026-01-19', status: 'returned' },
  { id: 'MAT002', name: 'Chat tay rua mach dien tu', code: 'VT-TR-001', type: 'consumable', quantity: 2, unit: 'chai', unitPrice: 0.5, totalPrice: 1, workOrderId: 'WO001', taskId: 'RT001', issuedDate: '2026-01-18', returnedDate: '', status: 'used' },
  { id: 'MAT003', name: 'Mo-dun thu phat RF P-18', code: 'LK-RF-P18', type: 'module', quantity: 1, unit: 'cai', unitPrice: 85, totalPrice: 85, workOrderId: 'WO001', taskId: 'RT002', issuedDate: '2026-01-21', returnedDate: '', status: 'used' },
  { id: 'MAT004', name: 'Mach khuech dai cong suat 500W', code: 'LK-KD-500', type: 'component', quantity: 2, unit: 'cai', unitPrice: 18, totalPrice: 36, workOrderId: 'WO001', taskId: 'RT002', issuedDate: '2026-01-21', returnedDate: '', status: 'used' },
  { id: 'MAT005', name: 'Dau doc encoder quang hoc', code: 'LK-EC-001', type: 'component', quantity: 1, unit: 'cai', unitPrice: 32, totalPrice: 32, workOrderId: 'WO002', taskId: 'RT004', issuedDate: '2026-01-25', returnedDate: '', status: 'used' },
  { id: 'MAT006', name: 'Bo khuech dai tap am thap LNA', code: 'LK-LNA-36D', type: 'module', quantity: 1, unit: 'cai', unitPrice: 45, totalPrice: 45, workOrderId: 'WO002', taskId: 'RT005', issuedDate: '2026-02-06', returnedDate: '', status: 'used' },
  { id: 'MAT007', name: 'Board xu ly trung tam S-125', code: 'LK-CPU-S125', type: 'module', quantity: 1, unit: 'cai', unitPrice: 165, totalPrice: 165, workOrderId: 'WO003', taskId: 'RT006', issuedDate: '2026-02-01', returnedDate: '', status: 'used' },
  { id: 'MAT008', name: 'Chip firmware v3.2.1', code: 'LK-FW-321', type: 'component', quantity: 1, unit: 'cai', unitPrice: 12, totalPrice: 12, workOrderId: 'WO003', taskId: 'RT006', issuedDate: '2026-02-01', returnedDate: '', status: 'used' },
  { id: 'MAT009', name: 'Bo cap ket noi sensor 12 soi', code: 'LK-CB-S12', type: 'component', quantity: 1, unit: 'bo', unitPrice: 58, totalPrice: 58, workOrderId: 'WO003', taskId: 'RT007', issuedDate: '2026-02-13', returnedDate: '', status: 'used' },
  { id: 'MAT010', name: 'Transistor cong suat RF 50W', code: 'LK-TR-50W', type: 'component', quantity: 2, unit: 'cai', unitPrice: 8, totalPrice: 16, workOrderId: 'WO004', taskId: 'RT009', issuedDate: '2026-02-08', returnedDate: '', status: 'used' },
  { id: 'MAT011', name: 'Dau noi RF SMA', code: 'LK-SMA-001', type: 'component', quantity: 3, unit: 'cai', unitPrice: 2.5, totalPrice: 7.5, workOrderId: 'WO004', taskId: 'RT009', issuedDate: '2026-02-08', returnedDate: '', status: 'used' },
  { id: 'MAT012', name: 'Mo-dun nguon chinh P-37', code: 'LK-PSU-P37', type: 'module', quantity: 1, unit: 'cai', unitPrice: 120, totalPrice: 120, workOrderId: 'WO005', taskId: 'RT011', issuedDate: '', returnedDate: '', status: 'requested' },
];

export const getMaterialsByWorkOrder = (workOrderId: string) =>
  materials.filter(m => m.workOrderId === workOrderId);

export const getMaterialsByTask = (taskId: string) =>
  materials.filter(m => m.taskId === taskId);
