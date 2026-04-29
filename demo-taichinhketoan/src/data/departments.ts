import { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership', head: 'Đại tá Phạm Quốc Hưng' },
  { id: 'PCT', name: 'Phòng Chính trị', shortName: 'P.CT', type: 'admin', head: 'Thượng tá Trần Đức Mạnh' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán', shortName: 'P.TCKT', type: 'admin', head: 'Thượng tá Nguyễn Thị Lan' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin', head: 'Trung tá Hoàng Minh Tuấn' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical', head: 'Trung tá Vũ Đình Thắng' },
  { id: 'PHCKT', name: 'Phòng Hậu cần - Kỹ thuật', shortName: 'P.HCKT', type: 'admin', head: 'Trung tá Lê Văn Toàn' },
  { id: 'PKCDB', name: 'Phòng KCS & Đảm bảo CL', shortName: 'P.KCS', type: 'technical', head: 'Thiếu tá Đỗ Quang Huy' },
  { id: 'PX1', name: 'Phân xưởng Sửa chữa Radar', shortName: 'PX1', type: 'technical', head: 'Thiếu tá Nguyễn Thanh Sơn' },
  { id: 'PX2', name: 'Phân xưởng Sửa chữa Tên lửa', shortName: 'PX2', type: 'technical', head: 'Thiếu tá Bùi Minh Trí' },
  { id: 'PX3', name: 'Phân xưởng Cơ khí', shortName: 'PX3', type: 'technical', head: 'Thiếu tá Lý Hoàng Nam' },
  { id: 'PX4', name: 'Phân xưởng Điện tử', shortName: 'PX4', type: 'technical', head: 'Thiếu tá Trần Anh Dũng' },
];

export const getDepartmentById = (id: string) => departments.find(d => d.id === id);
export const getDepartmentName = (id: string) => getDepartmentById(id)?.name || id;
export const getDepartmentShortName = (id: string) => getDepartmentById(id)?.shortName || id;
