import type { Supplier, SupplierEvaluation, PriceHistory } from '../types';

export const suppliers: Supplier[] = [
  {
    id: 'SUP-001', code: 'NCC-001', name: 'Trung tâm phần mềm Alpha', shortName: 'Alpha',
    address: 'Thanh Xuân, Hà Nội', phone: '024-3854-xxxx', contactPerson: 'Nguyễn Văn Minh',
    taxCode: '0100xxx001', type: 'military', certifications: ['ISO 9001:2015', 'ISO 27001'],
    categories: ['component', 'spare_part'], status: 'active', rating: 'A',
    totalContracts: 12, totalValue: 3200, onTimeRate: 95, qualityRate: 98,
    registeredDate: '2020-03-15',
  },
  {
    id: 'SUP-002', code: 'NCC-002', name: 'Trung tâm phần mềm Beta', shortName: 'Beta',
    address: 'Hoàng Mai, Hà Nội', phone: '024-3862-xxxx', contactPerson: 'Trần Quốc Bảo',
    taxCode: '0100xxx002', type: 'military', certifications: ['ISO 9001:2015', 'ISO 27001', 'ISO 14001'],
    categories: ['component', 'spare_part'], status: 'active', rating: 'A',
    totalContracts: 8, totalValue: 1850, onTimeRate: 92, qualityRate: 96,
    registeredDate: '2019-06-20',
  },
  {
    id: 'SUP-003', code: 'NCC-003', name: 'Trung tâm phần mềm Gamma', shortName: 'Gamma',
    address: 'Long Biên, Hà Nội', phone: '024-3871-xxxx', contactPerson: 'Lê Hữu Đạt',
    taxCode: '0100xxx003', type: 'military', certifications: ['ISO 9001:2015', 'ISO 27001'],
    categories: ['component'], status: 'active', rating: 'B',
    totalContracts: 5, totalValue: 2100, onTimeRate: 85, qualityRate: 90,
    registeredDate: '2021-01-10',
  },
  {
    id: 'SUP-004', code: 'NCC-004', name: 'Công ty TNHH Tech-VN Hải Phòng', shortName: 'Tech-VN HP',
    address: 'Ngô Quyền, Hải Phòng', phone: '0225-384-xxxx', contactPerson: 'Phạm Thanh Hà',
    taxCode: '0200xxx004', type: 'domestic', certifications: ['ISO 9001:2015'],
    categories: ['spare_part', 'consumable'], status: 'active', rating: 'B',
    totalContracts: 6, totalValue: 450, onTimeRate: 88, qualityRate: 92,
    registeredDate: '2022-04-05',
  },
  {
    id: 'SUP-005', code: 'NCC-005', name: 'Microsoft Vietnam', shortName: 'Microsoft',
    address: 'Quận 7, TP.HCM', phone: '028-3776-xxxx', email: 'vietnam@microsoft.com',
    contactPerson: 'Nguyễn Anh Tuấn', taxCode: '0300xxx005', type: 'foreign',
    certifications: ['ISO 9001:2015', 'ISO 14001', 'ISO 27001'],
    categories: ['spare_part', 'equipment'], status: 'active', rating: 'A',
    totalContracts: 4, totalValue: 680, onTimeRate: 97, qualityRate: 99,
    registeredDate: '2021-08-12',
  },
  {
    id: 'SUP-006', code: 'NCC-006', name: 'Dell Technologies Vietnam', shortName: 'Dell',
    address: 'Cầu Giấy, Hà Nội', phone: '024-3795-xxxx', contactPerson: 'David Nguyễn',
    taxCode: '0100xxx006', type: 'foreign', certifications: ['ISO 9001:2015', 'ISO 17025'],
    categories: ['equipment'], status: 'active', rating: 'A',
    totalContracts: 3, totalValue: 890, onTimeRate: 100, qualityRate: 100,
    registeredDate: '2022-01-20',
  },
  {
    id: 'SUP-007', code: 'NCC-007', name: 'Công ty CP Vật tư Công nghệ Hà Nội', shortName: 'VTCN HN',
    address: 'Hai Bà Trưng, Hà Nội', phone: '024-3943-xxxx', contactPerson: 'Hoàng Văn Bình',
    taxCode: '0100xxx007', type: 'domestic', certifications: ['ISO 9001:2015'],
    categories: ['consumable', 'raw_material'], status: 'active', rating: 'C',
    totalContracts: 10, totalValue: 320, onTimeRate: 75, qualityRate: 85,
    registeredDate: '2020-11-30',
  },
  {
    id: 'SUP-008', code: 'NCC-008', name: 'AWS Vietnam', shortName: 'AWS',
    address: 'Quận 1, TP.HCM', phone: '028-3825-xxxx', contactPerson: 'Trần Thị Mai',
    taxCode: '0300xxx008', type: 'foreign', certifications: ['ISO 9001:2015', 'ISO 14001', 'ISO 27001'],
    categories: ['component', 'equipment'], status: 'active', rating: 'A',
    totalContracts: 2, totalValue: 520, onTimeRate: 100, qualityRate: 98,
    registeredDate: '2023-03-15',
  },
];

export const supplierEvaluations: SupplierEvaluation[] = [
  { supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', period: '2025', priceScore: 85, deliveryScore: 95, qualityScore: 98, complianceScore: 96, totalScore: 93.5, rating: 'A', lateDeliveries: 1, defectRate: 2, totalContracts: 4 },
  { supplierId: 'SUP-002', supplierName: 'Trung tâm phần mềm Beta', period: '2025', priceScore: 82, deliveryScore: 92, qualityScore: 96, complianceScore: 94, totalScore: 91, rating: 'A', lateDeliveries: 1, defectRate: 4, totalContracts: 3 },
  { supplierId: 'SUP-003', supplierName: 'Trung tâm phần mềm Gamma', period: '2025', priceScore: 78, deliveryScore: 85, qualityScore: 90, complianceScore: 88, totalScore: 85.3, rating: 'B', lateDeliveries: 2, defectRate: 10, totalContracts: 2 },
  { supplierId: 'SUP-004', supplierName: 'Công ty TNHH Tech-VN Hải Phòng', period: '2025', priceScore: 80, deliveryScore: 88, qualityScore: 92, complianceScore: 90, totalScore: 87.5, rating: 'B', lateDeliveries: 1, defectRate: 8, totalContracts: 2 },
  { supplierId: 'SUP-005', supplierName: 'Microsoft Vietnam', period: '2025', priceScore: 70, deliveryScore: 97, qualityScore: 99, complianceScore: 98, totalScore: 91, rating: 'A', lateDeliveries: 0, defectRate: 1, totalContracts: 2 },
  { supplierId: 'SUP-007', supplierName: 'Công ty CP Vật tư Công nghệ Hà Nội', period: '2025', priceScore: 88, deliveryScore: 75, qualityScore: 85, complianceScore: 80, totalScore: 82, rating: 'C', lateDeliveries: 3, defectRate: 15, totalContracts: 4 },
];

export const priceHistories: PriceHistory[] = [
  {
    materialId: 'M001', materialName: 'License Microsoft 365 Business',
    records: [
      { year: 2024, supplierId: 'SUP-005', supplierName: 'Microsoft VN', unitPrice: 1.8, quantity: 50 },
      { year: 2025, supplierId: 'SUP-005', supplierName: 'Microsoft VN', unitPrice: 1.9, quantity: 40 },
      { year: 2026, supplierId: 'SUP-005', supplierName: 'Microsoft VN', unitPrice: 2.0, quantity: 25 },
    ],
  },
  {
    materialId: 'M008', materialName: 'Module xác thực 2FA',
    records: [
      { year: 2024, supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', unitPrice: 110, quantity: 3 },
      { year: 2025, supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', unitPrice: 115, quantity: 4 },
      { year: 2026, supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', unitPrice: 120, quantity: 2 },
    ],
  },
  {
    materialId: 'M016', materialName: 'Module ERP Tài chính - Kế toán',
    records: [
      { year: 2024, supplierId: 'SUP-003', supplierName: 'Trung tâm phần mềm Gamma', unitPrice: 420, quantity: 2 },
      { year: 2025, supplierId: 'SUP-003', supplierName: 'Trung tâm phần mềm Gamma', unitPrice: 435, quantity: 1 },
      { year: 2026, supplierId: 'SUP-003', supplierName: 'Trung tâm phần mềm Gamma', unitPrice: 450, quantity: 1 },
    ],
  },
  {
    materialId: 'M010', materialName: 'Server xử lý Dell PowerEdge',
    records: [
      { year: 2024, supplierId: 'SUP-002', supplierName: 'Trung tâm phần mềm Beta', unitPrice: 78, quantity: 2 },
      { year: 2025, supplierId: 'SUP-002', supplierName: 'Trung tâm phần mềm Beta', unitPrice: 82, quantity: 3 },
      { year: 2025, supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', unitPrice: 85, quantity: 1 },
    ],
  },
  {
    materialId: 'M014', materialName: 'Laptop Dell Latitude 5440',
    records: [
      { year: 2024, supplierId: 'SUP-006', supplierName: 'Dell Technologies Vietnam', unitPrice: 265, quantity: 1 },
      { year: 2025, supplierId: 'SUP-006', supplierName: 'Dell Technologies Vietnam', unitPrice: 275, quantity: 1 },
      { year: 2025, supplierId: 'SUP-008', supplierName: 'AWS Vietnam', unitPrice: 290, quantity: 1 },
    ],
  },
  {
    materialId: 'M004', materialName: 'Bộ công cụ DevOps Toolkit',
    records: [
      { year: 2024, supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', unitPrice: 45, quantity: 3 },
      { year: 2025, supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', unitPrice: 48, quantity: 2 },
      { year: 2025, supplierId: 'SUP-004', supplierName: 'Công ty TNHH Tech-VN Hải Phòng', unitPrice: 52, quantity: 1 },
    ],
  },
  {
    materialId: 'M009', materialName: 'Hệ thống monitoring on-premise',
    records: [
      { year: 2024, supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', unitPrice: 330, quantity: 1 },
      { year: 2025, supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', unitPrice: 340, quantity: 2 },
      { year: 2025, supplierId: 'SUP-002', supplierName: 'Trung tâm phần mềm Beta', unitPrice: 355, quantity: 1 },
    ],
  },
  {
    materialId: 'M003', materialName: 'Module giám sát hạ tầng (APM)',
    records: [
      { year: 2024, supplierId: 'SUP-008', supplierName: 'AWS Vietnam', unitPrice: 14, quantity: 5 },
      { year: 2025, supplierId: 'SUP-008', supplierName: 'AWS Vietnam', unitPrice: 14.5, quantity: 3 },
      { year: 2025, supplierId: 'SUP-005', supplierName: 'Microsoft Vietnam', unitPrice: 15.5, quantity: 2 },
    ],
  },
  {
    materialId: 'M012', materialName: 'Cáp quang Single-mode',
    records: [
      { year: 2024, supplierId: 'SUP-007', supplierName: 'Công ty CP Vật tư Công nghệ Hà Nội', unitPrice: 0.058, quantity: 300 },
      { year: 2025, supplierId: 'SUP-007', supplierName: 'Công ty CP Vật tư Công nghệ Hà Nội', unitPrice: 0.062, quantity: 200 },
    ],
  },
  {
    materialId: 'M015', materialName: 'UPS APC Smart-UPS 3000VA',
    records: [
      { year: 2024, supplierId: 'SUP-004', supplierName: 'Công ty TNHH Tech-VN Hải Phòng', unitPrice: 4.0, quantity: 5 },
      { year: 2025, supplierId: 'SUP-004', supplierName: 'Công ty TNHH Tech-VN Hải Phòng', unitPrice: 4.2, quantity: 3 },
      { year: 2025, supplierId: 'SUP-008', supplierName: 'AWS Vietnam', unitPrice: 4.8, quantity: 2 },
    ],
  },
];

export const getSupplierById = (id: string): Supplier | undefined => {
  return suppliers.find(s => s.id === id);
};
