import { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership', head: 'Phạm Quốc Hưng' },
  { id: 'PCT', name: 'Phòng Truyền thông nội bộ', shortName: 'P.CT', type: 'admin', head: 'Trần Đức Mạnh' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán', shortName: 'P.TCKT', type: 'admin', head: 'Nguyễn Thị Lan' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin', head: 'Hoàng Minh Tuấn' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical', head: 'Vũ Đình Thắng' },
  { id: 'PHCKT', name: 'Phòng Logistics - Kỹ thuật', shortName: 'P.HCKT', type: 'admin', head: 'Lê Văn Toàn' },
  { id: 'PKCDB', name: 'Phòng KCS & Đảm bảo CL', shortName: 'P.KCS', type: 'technical', head: 'Đỗ Quang Huy' },
  { id: 'PX1', name: 'Trung tâm Phần mềm Alpha', shortName: 'PX1', type: 'technical', head: 'Nguyễn Thanh Sơn' },
  { id: 'PX2', name: 'Trung tâm Phần mềm Beta', shortName: 'PX2', type: 'technical', head: 'Bùi Minh Trí' },
  { id: 'PX3', name: 'Trung tâm Hạ tầng', shortName: 'PX3', type: 'technical', head: 'Lý Hoàng Nam' },
  { id: 'PX4', name: 'Trung tâm DevOps', shortName: 'PX4', type: 'technical', head: 'Trần Anh Dũng' },
];

export const getDepartmentById = (id: string) => departments.find(d => d.id === id);
export const getDepartmentName = (id: string) => getDepartmentById(id)?.name || id;
export const getDepartmentShortName = (id: string) => getDepartmentById(id)?.shortName || id;
