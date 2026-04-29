import type { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership' },
  { id: 'PCT', name: 'Phòng Nhân sự', shortName: 'P.NS', type: 'admin' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán', shortName: 'P.TCKT', type: 'admin' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical' },
  { id: 'PHCKT', name: 'Phòng Vận hành - Kỹ thuật', shortName: 'P.VHKT', type: 'admin' },
  { id: 'PKCDB', name: 'Phòng QA & Đảm bảo CL', shortName: 'P.QA', type: 'technical' },
  { id: 'PX1', name: 'Trung tâm Bảo hành Alpha', shortName: 'TTA', type: 'technical' },
  { id: 'PX2', name: 'Trung tâm Bảo hành Beta', shortName: 'TTB', type: 'technical' },
  { id: 'PX3', name: 'Trung tâm Cơ khí - Hạ tầng', shortName: 'TTCK', type: 'technical' },
  { id: 'PX4', name: 'Trung tâm Phần mềm Gamma', shortName: 'TTG', type: 'technical' },
];

export const getDepartmentById = (id: string) => departments.find(d => d.id === id);
export const getDepartmentName = (id: string) => getDepartmentById(id)?.name || id;
export const getDepartmentShortName = (id: string) => getDepartmentById(id)?.shortName || id;
