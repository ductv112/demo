import type { Equipment } from '../types';

export const equipment: Equipment[] = [
  { id: 'EQ-001', code: 'RDR-P18-001', name: 'Hệ thống monitoring P-18', model: 'P-18', serial: 'P18-361-001', category: 'radar', manufacturingYear: 1985, operatingHours: 12450, ownerUnit: 'Khối K361', status: 'in_overhaul' },
  { id: 'EQ-002', code: 'RDR-36D6-001', name: 'Hệ thống monitoring 36D6', model: '36D6', serial: '36D6-363-002', category: 'radar', manufacturingYear: 1992, operatingHours: 9800, ownerUnit: 'Khối K363', status: 'in_overhaul' },
  { id: 'EQ-003', code: 'RDR-P37-001', name: 'Hệ thống monitoring P-37', model: 'P-37', serial: 'P37-291-001', category: 'radar', manufacturingYear: 1978, operatingHours: 18600, ownerUnit: 'Phòng 291', status: 'operational' },
  { id: 'EQ-004', code: 'RDR-ST68-001', name: 'Hệ thống đo lường ST-68', model: 'ST-68', serial: 'ST68-291-003', category: 'radar', manufacturingYear: 1990, operatingHours: 11200, ownerUnit: 'Phòng 291', status: 'in_overhaul' },
  { id: 'EQ-005', code: 'MSL-S125-001', name: 'Module S-125 Pechora', model: 'S-125', serial: 'S125-261-001', category: 'missile', manufacturingYear: 1983, operatingHours: 7600, ownerUnit: 'Phòng 261', status: 'in_overhaul' },
  { id: 'EQ-006', code: 'MSL-S75-001', name: 'Module S-75 Dvina', model: 'S-75', serial: 'S75-285-002', category: 'missile', manufacturingYear: 1975, operatingHours: 21000, ownerUnit: 'Phòng 285', status: 'in_overhaul' },
  { id: 'EQ-007', code: 'MSL-S300-001', name: 'Module S-300PMU', model: 'S-300PMU', serial: 'S300-367-001', category: 'missile', manufacturingYear: 2005, operatingHours: 4200, ownerUnit: 'Khối K367', status: 'degraded' },
  { id: 'EQ-008', code: 'RDR-P18-002', name: 'Hệ thống monitoring P-18 (2)', model: 'P-18', serial: 'P18-261-004', category: 'radar', manufacturingYear: 1987, operatingHours: 15300, ownerUnit: 'Phòng 261', status: 'non_operational' },
  { id: 'EQ-009', code: 'COM-TTL-001', name: 'Thiết bị thông tin liên lạc', model: 'R-134', serial: 'R134-361-005', category: 'communication', manufacturingYear: 1995, operatingHours: 6800, ownerUnit: 'Khối K361', status: 'operational' },
  { id: 'EQ-010', code: 'ELT-KMD-001', name: 'Thiết bị mã hóa điện tử', model: 'KMD-02', serial: 'KMD-363-001', category: 'electronic', manufacturingYear: 2001, operatingHours: 3200, ownerUnit: 'Khối K363', status: 'operational' },
];
