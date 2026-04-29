import type { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', shortName: 'BGĐ', type: 'leadership', head: 'Phạm Quốc Hưng' },
  { id: 'PKT', name: 'Phòng Kỹ thuật', shortName: 'P.KT', type: 'technical', head: 'Trần Văn Đức' },
  { id: 'PKH', name: 'Phòng Kế hoạch', shortName: 'P.KH', type: 'admin', head: 'Hoàng Minh Tuấn' },
  { id: 'PKCDB', name: 'Phòng QA & Đảm bảo CL', shortName: 'P.QA', type: 'technical', head: 'Nguyễn Văn Thành' },
  { id: 'PHCKT', name: 'Phòng Vận hành - Kỹ thuật', shortName: 'P.VHKT', type: 'admin', head: 'Lê Quang Huy' },
  { id: 'PX1', name: 'Trung tâm Bảo trì Hệ thống Monitoring', shortName: 'PX1', type: 'technical', head: 'Nguyễn Hữu Long' },
  { id: 'PX2', name: 'Trung tâm Bảo trì Cluster Server', shortName: 'PX2', type: 'technical', head: 'Phạm Văn Hải' },
  { id: 'PX3', name: 'Trung tâm Hạ tầng', shortName: 'PX3', type: 'technical', head: 'Trương Quốc Việt' },
  { id: 'PX4', name: 'Trung tâm Phát triển Phần mềm', shortName: 'PX4', type: 'technical', head: 'Lê Minh Quân' },
];
