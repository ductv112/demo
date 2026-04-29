import type { Material } from '../types';

export const materials: Material[] = [
  { id: 'MAT-001', code: 'GK-001', name: 'Gioăng chịu nhiệt cao áp', category: 'spare_part', unit: 'bộ', supplier: 'Trung tâm Beta', isMandatoryReplace: true },
  { id: 'MAT-002', code: 'VB-001', name: 'Vòng bi trục chính (SKF 6310)', category: 'spare_part', unit: 'cái', supplier: 'Bosch Rexroth', isMandatoryReplace: true },
  { id: 'MAT-003', code: 'BL-001', name: 'Bu lông bộ điều chỉnh (M12x1.5)', category: 'spare_part', unit: 'cái', supplier: 'Trung tâm Gamma', isMandatoryReplace: true },
  { id: 'MAT-004', code: 'XM-001', name: 'Xéc măng xi-lanh', category: 'spare_part', unit: 'bộ', supplier: 'Trung tâm R&D HN', isMandatoryReplace: true },
  { id: 'MAT-005', code: 'MD-001', name: 'Mô-đun khuếch đại tín hiệu', category: 'spare_part', unit: 'khối', supplier: 'Tektronix', isMandatoryReplace: false },
  { id: 'MAT-006', code: 'MD-002', name: 'Mô-đun xử lý tín hiệu số', category: 'spare_part', unit: 'khối', supplier: 'Siemens', isMandatoryReplace: false },
  { id: 'MAT-007', code: 'OT-001', name: 'Dầu thủy lực AeroShell 33', category: 'consumable', unit: 'lít', supplier: 'Trung tâm Beta', isMandatoryReplace: true },
  { id: 'MAT-008', code: 'OT-002', name: 'Mỡ bôi trơn chịu nhiệt Molykote', category: 'consumable', unit: 'kg', supplier: 'Trung tâm Gamma', isMandatoryReplace: true },
  { id: 'MAT-009', code: 'HC-001', name: 'Chất làm sạch tiếp điểm CRC', category: 'chemical', unit: 'chai', supplier: 'Công ty Điện tử Hà Nội', isMandatoryReplace: false },
  { id: 'MAT-010', code: 'HC-002', name: 'Keo chống ăn mòn Loctite 243', category: 'chemical', unit: 'tuýp', supplier: 'Công ty Điện tử Hải Phòng', isMandatoryReplace: false },
  { id: 'MAT-011', code: 'PT-001', name: 'Phớt dầu trục quay', category: 'spare_part', unit: 'cái', supplier: 'Trung tâm R&D HN', isMandatoryReplace: true },
  { id: 'MAT-012', code: 'CB-001', name: 'Cáp bọc chống nhiễu RF', category: 'spare_part', unit: 'mét', supplier: 'Công ty Điện tử Hà Nội', isMandatoryReplace: false },
  { id: 'MAT-013', code: 'TR-001', name: 'Transitor công suất cao tần', category: 'spare_part', unit: 'cái', supplier: 'Tektronix', isMandatoryReplace: false },
  { id: 'MAT-014', code: 'TU-001', name: 'Ống từ magnetron', category: 'spare_part', unit: 'cái', supplier: 'Trung tâm R&D Công nghệ', isMandatoryReplace: false },
  { id: 'MAT-015', code: 'DC-001', name: 'Dụng cụ đo mô-men siết chuyên dụng', category: 'tool', unit: 'bộ', supplier: 'Tektronix', isMandatoryReplace: false },
];
