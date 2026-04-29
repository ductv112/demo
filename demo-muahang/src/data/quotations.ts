import type { SupplierQuotation } from '../types';

export const supplierQuotations: SupplierQuotation[] = [
  {
    id: 'QT-001',
    supplierId: 'SUP-001',
    quotationCode: 'BG-Alpha-2026-001',
    quotationDate: '2026-01-05',
    validUntil: '2026-06-30',
    items: [
      { materialId: 'M008', materialCode: 'RF-001', materialName: 'Module xác thực 2FA', unit: 'bộ', unitPrice: 120, minOrderQty: 1, leadTimeDays: 25 },
      { materialId: 'M009', materialCode: 'ANT-001', materialName: 'Hệ thống monitoring on-premise', unit: 'bộ', unitPrice: 340, minOrderQty: 1, leadTimeDays: 30 },
      { materialId: 'M004', materialCode: 'KSC-001', materialName: 'Bộ công cụ DevOps Toolkit', unit: 'bộ', unitPrice: 48, minOrderQty: 1, leadTimeDays: 15 },
    ],
    attachmentName: 'BaoGia_Alpha_2026_Q1.pdf',
    note: 'Giá đã bao gồm vận chuyển nội địa',
  },
  {
    id: 'QT-002',
    supplierId: 'SUP-002',
    quotationCode: 'BG-Beta-2026-001',
    quotationDate: '2026-01-08',
    validUntil: '2026-06-30',
    items: [
      { materialId: 'M010', materialCode: 'PCB-001', materialName: 'Server xử lý Dell PowerEdge', unit: 'cái', unitPrice: 82, minOrderQty: 2, leadTimeDays: 28 },
      { materialId: 'M009', materialCode: 'ANT-001', materialName: 'Hệ thống monitoring on-premise', unit: 'bộ', unitPrice: 355, minOrderQty: 1, leadTimeDays: 35 },
    ],
    attachmentName: 'BaoGia_Beta_2026.pdf',
  },
  {
    id: 'QT-003',
    supplierId: 'SUP-003',
    quotationCode: 'BG-Gamma-2026-001',
    quotationDate: '2026-01-10',
    validUntil: '2026-07-31',
    items: [
      { materialId: 'M016', materialCode: 'DT-001', materialName: 'Module ERP Tài chính - Kế toán', unit: 'bộ', unitPrice: 450, minOrderQty: 1, leadTimeDays: 45 },
    ],
    attachmentName: 'BaoGia_Gamma_ERP_2026.pdf',
    note: 'Yêu cầu đặt cọc 30%',
  },
  {
    id: 'QT-004',
    supplierId: 'SUP-005',
    quotationCode: 'BG-MS-2026-001',
    quotationDate: '2026-01-12',
    validUntil: '2026-12-31',
    items: [
      { materialId: 'M001', materialCode: 'VB-001', materialName: 'License Microsoft 365 Business', unit: 'license', unitPrice: 2.0, minOrderQty: 10, leadTimeDays: 14 },
      { materialId: 'M002', materialCode: 'VB-002', materialName: 'License Atlassian Jira Cloud', unit: 'license', unitPrice: 3.5, minOrderQty: 10, leadTimeDays: 14 },
      { materialId: 'M003', materialCode: 'CB-001', materialName: 'Module giám sát hạ tầng (APM)', unit: 'license', unitPrice: 15.5, minOrderQty: 1, leadTimeDays: 21 },
    ],
    attachmentName: 'Microsoft_PriceList_2026.xlsx',
    note: 'Giá FOB HCM, chưa bao gồm VAT',
  },
  {
    id: 'QT-005',
    supplierId: 'SUP-004',
    quotationCode: 'BG-TVHP-2026-001',
    quotationDate: '2026-02-01',
    validUntil: '2026-08-31',
    items: [
      { materialId: 'M001', materialCode: 'VB-001', materialName: 'License Microsoft 365 Business', unit: 'license', unitPrice: 1.85, minOrderQty: 20, leadTimeDays: 21 },
      { materialId: 'M015', materialCode: 'NL-001', materialName: 'UPS APC Smart-UPS 3000VA', unit: 'bộ', unitPrice: 4.2, minOrderQty: 2, leadTimeDays: 14 },
      { materialId: 'M004', materialCode: 'KSC-001', materialName: 'Bộ công cụ DevOps Toolkit', unit: 'bộ', unitPrice: 52, minOrderQty: 1, leadTimeDays: 20 },
    ],
    note: 'Giá đã bao gồm VAT và vận chuyển',
  },
  {
    id: 'QT-006',
    supplierId: 'SUP-006',
    quotationCode: 'BG-DELL-2026-001',
    quotationDate: '2026-02-15',
    validUntil: '2026-12-31',
    items: [
      { materialId: 'M014', materialCode: 'TB-001', materialName: 'Laptop Dell Latitude 5440', unit: 'cái', unitPrice: 275, minOrderQty: 1, leadTimeDays: 30 },
    ],
    attachmentName: 'Dell_Quote_2026.pdf',
    note: 'Bao gồm cấu hình ban đầu và bảo hành 3 năm',
  },
  {
    id: 'QT-007',
    supplierId: 'SUP-008',
    quotationCode: 'BG-AWS-2026-001',
    quotationDate: '2026-01-20',
    validUntil: '2026-09-30',
    items: [
      { materialId: 'M003', materialCode: 'CB-001', materialName: 'Module giám sát hạ tầng (APM)', unit: 'license', unitPrice: 14.5, minOrderQty: 3, leadTimeDays: 18 },
      { materialId: 'M014', materialCode: 'TB-001', materialName: 'Laptop Dell Latitude 5440', unit: 'cái', unitPrice: 290, minOrderQty: 1, leadTimeDays: 35, note: 'Cấu hình tương đương' },
      { materialId: 'M015', materialCode: 'NL-001', materialName: 'UPS APC Smart-UPS 3000VA', unit: 'bộ', unitPrice: 4.8, minOrderQty: 1, leadTimeDays: 14 },
    ],
    attachmentName: 'AWS_PriceList_VN_2026.pdf',
  },
  {
    id: 'QT-008',
    supplierId: 'SUP-007',
    quotationCode: 'BG-VTCN-2026-001',
    quotationDate: '2026-01-15',
    validUntil: '2026-06-30',
    items: [
      { materialId: 'M012', materialCode: 'INOX-001', materialName: 'Cáp quang Single-mode', unit: 'mét', unitPrice: 0.065, minOrderQty: 100, leadTimeDays: 7 },
      { materialId: 'M005', materialCode: 'DCD-001', materialName: 'Dịch vụ Cloud AWS EC2', unit: 'tháng', unitPrice: 0.12, minOrderQty: 20, leadTimeDays: 5 },
      { materialId: 'M006', materialCode: 'DCD-002', materialName: 'Dịch vụ lưu trữ Cloud Storage', unit: 'tháng', unitPrice: 0.25, minOrderQty: 10, leadTimeDays: 5 },
      { materialId: 'M011', materialCode: 'THL-001', materialName: 'License IDE JetBrains All-Pack', unit: 'license', unitPrice: 0.45, minOrderQty: 5, leadTimeDays: 7 },
    ],
    note: 'Giao hàng tại văn phòng Doanh nghiệp A',
  },
];

export const getQuotationsBySupplier = (supplierId: string): SupplierQuotation[] => {
  return supplierQuotations.filter(q => q.supplierId === supplierId);
};

export const getQuotationItemsForMaterial = (materialId: string): { supplierId: string; unitPrice: number; minOrderQty?: number; leadTimeDays?: number; quotationCode: string; quotationDate: string; validUntil: string; note?: string }[] => {
  const result: { supplierId: string; unitPrice: number; minOrderQty?: number; leadTimeDays?: number; quotationCode: string; quotationDate: string; validUntil: string; note?: string }[] = [];
  supplierQuotations.forEach(q => {
    q.items.forEach(item => {
      if (item.materialId === materialId) {
        result.push({
          supplierId: q.supplierId,
          unitPrice: item.unitPrice,
          minOrderQty: item.minOrderQty,
          leadTimeDays: item.leadTimeDays,
          quotationCode: q.quotationCode,
          quotationDate: q.quotationDate,
          validUntil: q.validUntil,
          note: item.note,
        });
      }
    });
  });
  return result;
};
