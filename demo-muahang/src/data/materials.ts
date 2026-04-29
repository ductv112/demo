import type { Material } from '../types';

// currentStock: giả lập dữ liệu tồn kho từ pkkq-kho
export const materials: Material[] = [
  { id: 'M001', code: 'VB-001', name: 'License Microsoft 365 Business', category: 'spare_part', unit: 'license', specifications: 'Annual subscription, 1 user', supplier: 'Microsoft VN', unitPrice: 2.0, currentStock: 15 },
  { id: 'M002', code: 'VB-002', name: 'License Atlassian Jira Cloud', category: 'spare_part', unit: 'license', specifications: 'Annual subscription, 10 users', supplier: 'Atlassian', unitPrice: 3.5, currentStock: 5 },
  { id: 'M003', code: 'CB-001', name: 'Module giám sát hạ tầng (APM)', category: 'component', unit: 'license', specifications: 'Datadog APM, gói 5 host', supplier: 'Datadog', unitPrice: 15.0, currentStock: 0 },
  { id: 'M004', code: 'KSC-001', name: 'Bộ công cụ DevOps Toolkit', category: 'spare_part', unit: 'bộ', specifications: 'Bao gồm CI/CD pipeline, monitoring, logging', unitPrice: 50.0, currentStock: 1 },
  { id: 'M005', code: 'DCD-001', name: 'Dịch vụ Cloud AWS EC2', category: 'consumable', unit: 'tháng', specifications: 'Instance t3.large, region Singapore', supplier: 'AWS Vietnam', unitPrice: 0.12, currentStock: 40 },
  { id: 'M006', code: 'DCD-002', name: 'Dịch vụ lưu trữ Cloud Storage', category: 'consumable', unit: 'tháng', specifications: 'AWS S3 Standard, 1TB/tháng', supplier: 'AWS Vietnam', unitPrice: 0.25, currentStock: 8 },
  { id: 'M007', code: 'CAP-001', name: 'Cáp mạng Cat6A UTP', category: 'raw_material', unit: 'mét', specifications: '10Gbps, dùng cho data center', unitPrice: 0.08, currentStock: 30 },
  { id: 'M008', code: 'RF-001', name: 'Module xác thực 2FA', category: 'component', unit: 'bộ', specifications: 'License + thiết bị, 50 users', supplier: 'Trung tâm phần mềm Alpha', unitPrice: 120.0, currentStock: 0 },
  { id: 'M009', code: 'ANT-001', name: 'Hệ thống monitoring on-premise', category: 'component', unit: 'bộ', specifications: 'Prometheus + Grafana, 100 endpoints', supplier: 'Trung tâm phần mềm Alpha', unitPrice: 350.0, currentStock: 0 },
  { id: 'M010', code: 'PCB-001', name: 'Server xử lý Dell PowerEdge', category: 'component', unit: 'cái', specifications: 'R650, Xeon Silver, 64GB RAM', supplier: 'Trung tâm phần mềm Beta', unitPrice: 85.0, currentStock: 0 },
  { id: 'M011', code: 'THL-001', name: 'License IDE JetBrains All-Pack', category: 'consumable', unit: 'license', specifications: 'Annual, all products, 1 user', unitPrice: 0.45, currentStock: 2 },
  { id: 'M012', code: 'INOX-001', name: 'Cáp quang Single-mode', category: 'raw_material', unit: 'mét', specifications: 'OS2 9/125, dùng cho backbone', unitPrice: 0.065, currentStock: 50 },
  { id: 'M013', code: 'DK-001', name: 'Đầu nối RJ45 Cat6A', category: 'spare_part', unit: 'cái', specifications: 'Shielded, dùng cho cáp Cat6A', unitPrice: 0.15, currentStock: 5 },
  { id: 'M014', code: 'TB-001', name: 'Laptop Dell Latitude 5440', category: 'equipment', unit: 'cái', specifications: 'Intel i7, 16GB RAM, 512GB SSD', supplier: 'Dell Vietnam', unitPrice: 280.0, currentStock: 0 },
  { id: 'M015', code: 'NL-001', name: 'UPS APC Smart-UPS 3000VA', category: 'component', unit: 'bộ', specifications: 'Online double-conversion, rack mount', supplier: 'APC by Schneider', unitPrice: 4.5, currentStock: 1 },
  { id: 'M016', code: 'DT-001', name: 'Module ERP Tài chính - Kế toán', category: 'component', unit: 'bộ', specifications: 'Triển khai SAP S/4HANA Finance', supplier: 'Trung tâm phần mềm Gamma', unitPrice: 450.0, currentStock: 0 },
];

export const getMaterialById = (id: string): Material | undefined => {
  return materials.find(m => m.id === id);
};

export const getMaterialByCode = (code: string): Material | undefined => {
  return materials.find(m => m.code === code);
};
