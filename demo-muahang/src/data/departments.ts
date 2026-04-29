import type { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership', head: 'GĐ Phạm Quốc Hưng' },
  { id: 'PCT', name: 'Phòng Truyền thông', shortName: 'P.TT', type: 'admin', head: 'Phó GĐ Nguyễn Văn An' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán', shortName: 'P.TCKT', type: 'admin', head: 'Nguyễn Thị Lan' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin', head: 'Hoàng Minh Tuấn' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical', head: 'Trưởng phòng Trần Đức Mạnh' },
  { id: 'PHCKT', name: 'Phòng Logistics - Kỹ thuật', shortName: 'P.LGKT', type: 'admin', head: 'Lê Văn Hải' },
  { id: 'PKCDB', name: 'Phòng QA & Đảm bảo CL', shortName: 'P.QA', type: 'technical', head: 'Trưởng phòng Vũ Quang Huy' },
  { id: 'PX1', name: 'Trung tâm Hạ tầng Hệ thống', shortName: 'TT-HT', type: 'technical', head: 'Phó TP Nguyễn Hữu Thắng' },
  { id: 'PX2', name: 'Trung tâm Phát triển Phần mềm', shortName: 'TT-PM', type: 'technical', head: 'Phó TP Lê Thanh Sơn' },
  { id: 'PX3', name: 'Trung tâm Vận hành DevOps', shortName: 'TT-DO', type: 'technical', head: 'Trưởng nhóm Phạm Văn Đức' },
  { id: 'PX4', name: 'Trung tâm Bảo mật & QA', shortName: 'TT-BM', type: 'technical', head: 'Phó TP Trần Minh Khoa' },
];

export const getDepartmentName = (id: string): string => {
  return departments.find(d => d.id === id)?.name ?? id;
};

export const getDepartmentShortName = (id: string): string => {
  return departments.find(d => d.id === id)?.shortName ?? id;
};
