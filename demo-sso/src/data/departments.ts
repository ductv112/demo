import type { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership' },
  { id: 'PCT', name: 'Phòng Nhân sự', shortName: 'P.NS', type: 'admin' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán', shortName: 'P.TCKT', type: 'admin' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical' },
  { id: 'PHCKT', name: 'Phòng Logistics - Kỹ thuật', shortName: 'P.LGKT', type: 'admin' },
  { id: 'PKCDB', name: 'Phòng KCS & Đảm bảo CL', shortName: 'P.KCS', type: 'technical' },
  { id: 'PX1', name: 'Trung tâm Phần mềm Alpha', shortName: 'TT-Alpha', type: 'technical' },
  { id: 'PX2', name: 'Trung tâm Phần mềm Beta', shortName: 'TT-Beta', type: 'technical' },
  { id: 'PX3', name: 'Trung tâm Hạ tầng', shortName: 'TT-HT', type: 'technical' },
  { id: 'PX4', name: 'Trung tâm Vận hành', shortName: 'TT-VH', type: 'technical' },
];
