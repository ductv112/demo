import type { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership', head: 'Phạm Quốc Hưng' },
  { id: 'PCT', name: 'Phòng Truyền thông', shortName: 'P.TT', type: 'admin', head: 'Lê Văn Dũng' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán', shortName: 'P.TCKT', type: 'admin', head: 'Nguyễn Thị Lan' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin', head: 'Hoàng Minh Tuấn' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical', head: 'Trần Văn Hùng' },
  { id: 'PHCKT', name: 'Phòng Logistics - Kỹ thuật', shortName: 'P.HCKT', type: 'admin', head: 'Nguyễn Đức Minh' },
  { id: 'PKCDB', name: 'Phòng QA & Đảm bảo CL', shortName: 'P.QA', type: 'technical', head: 'Lê Quang Vinh' },
  { id: 'PX1', name: 'Trung tâm Hệ thống monitoring', shortName: 'PX1', type: 'technical', head: 'Nguyễn Thanh Sơn' },
  { id: 'PX2', name: 'Trung tâm Module sản phẩm', shortName: 'PX2', type: 'technical', head: 'Phạm Văn Đức' },
  { id: 'PX3', name: 'Trung tâm Hạ tầng', shortName: 'PX3', type: 'technical', head: 'Trần Quốc Bảo' },
  { id: 'PX4', name: 'Trung tâm Điện tử', shortName: 'PX4', type: 'technical', head: 'Vũ Hoàng Nam' },
];
