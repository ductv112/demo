import type { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership', head: 'Phạm Quốc Hưng' },
  { id: 'PCT', name: 'Phòng Nhân sự', shortName: 'P.NS', type: 'admin' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán', shortName: 'P.TCKT', type: 'admin' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical', head: 'Trần Đức Mạnh' },
  { id: 'PHCKT', name: 'Phòng Logistics - Kỹ thuật', shortName: 'P.LGKT', type: 'admin' },
  { id: 'PKCDB', name: 'Phòng QA/QC & Đảm bảo CL', shortName: 'P.QA', type: 'technical' },
  { id: 'PX1', name: 'Trung tâm Vận hành Hạ tầng', shortName: 'TT1', type: 'technical', head: 'Hoàng Minh Tuấn' },
  { id: 'PX2', name: 'Trung tâm Sản phẩm chủ lực', shortName: 'TT2', type: 'technical' },
  { id: 'PX3', name: 'Trung tâm Cơ khí', shortName: 'TT3', type: 'technical' },
  { id: 'PX4', name: 'Trung tâm Điện tử & Mạng', shortName: 'TT4', type: 'technical' },
];
