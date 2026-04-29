import type { Department } from '../types';

export const departments: Department[] = [
  { id: 'BGD',   name: 'Ban Giám đốc',                  shortName: 'BGĐ',    type: 'leadership' },
  { id: 'PCT',   name: 'Phòng Truyền thông',             shortName: 'P.TT',   type: 'admin' },
  { id: 'PTCKT', name: 'Phòng Tài chính - Kế toán',      shortName: 'P.TCKT', type: 'admin' },
  { id: 'PKH',   name: 'Phòng Kế hoạch',                 shortName: 'P.KH',   type: 'admin' },
  { id: 'PKT',   name: 'Phòng Kỹ thuật',                 shortName: 'P.KT',   type: 'technical' },
  { id: 'PHCKT', name: 'Phòng Logistics - Kỹ thuật',     shortName: 'P.LG',   type: 'admin' },
  { id: 'PKCDB', name: 'Phòng QA & Đảm bảo Chất lượng',  shortName: 'P.QA',   type: 'technical' },
  { id: 'PX1',   name: 'TT Monitoring',                   shortName: 'TT1',    type: 'technical' },
  { id: 'PX2',   name: 'TT Sản phẩm',                     shortName: 'TT2',    type: 'technical' },
  { id: 'PX3',   name: 'TT Hạ tầng',                      shortName: 'TT3',    type: 'technical' },
  { id: 'PX4',   name: 'TT Tích hợp',                     shortName: 'TT4',    type: 'technical' },
];

export const getDepartmentById = (id: string) => departments.find(d => d.id === id);
