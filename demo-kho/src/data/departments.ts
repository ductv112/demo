import type { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership', head: 'Phạm Quốc Hưng' },
  { id: 'PCT', name: 'Phòng Truyền thông', shortName: 'P.TT', type: 'admin', head: 'Nguyễn Văn Hải' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán', shortName: 'P.TCKT', type: 'admin', head: 'Nguyễn Thị Lan' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin', head: 'Hoàng Minh Tuấn' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical', head: 'Lê Văn Đức' },
  { id: 'PHCKT', name: 'Phòng Logistics - Kỹ thuật', shortName: 'P.LGKT', type: 'admin', head: 'Trần Đức Mạnh' },
  { id: 'PKCDB', name: 'Phòng QA & Đảm bảo CL', shortName: 'P.QA', type: 'technical', head: 'Vũ Thị Hương' },
  { id: 'PX1', name: 'Trung tâm Phần mềm Alpha', shortName: 'TT1', type: 'technical', head: 'Trần Văn Nam' },
  { id: 'PX2', name: 'Trung tâm Phần mềm Beta', shortName: 'TT2', type: 'technical', head: 'Nguyễn Quốc Bảo' },
  { id: 'PX3', name: 'Trung tâm Hạ tầng & DevOps', shortName: 'TT3', type: 'technical', head: 'Phạm Minh Cường' },
  { id: 'PX4', name: 'Trung tâm Phần mềm Gamma', shortName: 'TT4', type: 'technical', head: 'Lê Hoàng Sơn' },
];

export const getDepartmentById = (id: string) => departments.find(d => d.id === id);
