import type { BiddingPackage } from '../types';

export const biddingPackages: BiddingPackage[] = [
  // ═══ 1. NHÁP (draft) ═══
  {
    id: 'BID-007',
    code: 'GT-2026-007',
    supplyPlanId: 'SP-002',
    title: 'Gói thầu cung cấp nguyên vật liệu hạ tầng mạng',
    description: 'Cáp quang và dịch vụ cloud phục vụ thi công hạ tầng mạng quý 2/2026',

    // Thông tin chung KHLCNT
    khlcntCode: 'PL2600063007',
    khlcntCategory: 'Mua sắm hàng hóa',
    procurementName: 'Mua sắm nguyên vật liệu hạ tầng mạng phục vụ thi công Q2/2026',
    investor: 'Doanh nghiệp A',

    // Thông tin gói thầu
    legalBasis: 'Luật Đấu thầu',
    fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
    sector: 'Hàng hóa',
    type: 'quotation',
    contractType: 'lump_sum',
    scope: 'domestic',
    method: 'one_stage_one_envelope',
    estimatedValue: 12.75,
    executionDays: 10,
    hasMultipleLots: false,
    items: [
      { materialId: 'M012', materialCode: 'INOX-001', materialName: 'Cáp quang Single-mode', unit: 'mét', quantity: 150, estimatedPrice: 0.065, totalValue: 9.75, technicalRequirement: 'OS2 9/125, dùng cho backbone, có chứng nhận xuất xứ', deadline: '2026-04-30' },
      { materialId: 'M006', materialCode: 'DCD-002', materialName: 'Dịch vụ lưu trữ Cloud Storage', unit: 'tháng', quantity: 12, estimatedPrice: 0.25, totalValue: 3.0, technicalRequirement: 'AWS S3 Standard hoặc tương đương, 1TB/tháng', deadline: '2026-04-15' },
    ],
    technicalRequirements: 'Thiết bị/dịch vụ phải có chứng nhận xuất xứ, đạt tiêu chuẩn công nghiệp',
    paymentTerms: 'Thanh toán 100% sau giao hàng',

    // Cách thức dự thầu
    biddingMode: 'offline',
    executionLocation: 'Doanh nghiệp A, Hà Nội',

    // Hồ sơ dự thầu
    submissions: [],
    status: 'draft',
    createdBy: 'Lê Văn Hải',
    createdDate: '2026-03-28',
  },

  // ═══ 2. ĐÃ ĐĂNG TẢI (published) ═══
  {
    id: 'BID-006',
    code: 'GT-2026-006',
    supplyPlanId: 'SP-002',
    title: 'Gói thầu cung cấp license IDE và phần mềm tiêu hao',
    description: 'License IDE và phần mềm tiêu hao phục vụ phát triển phần mềm quý 2/2026',

    // Thông tin chung KHLCNT
    khlcntCode: 'PL2600063006',
    khlcntCategory: 'Mua sắm hàng hóa',
    procurementName: 'Mua sắm phần mềm tiêu hao phục vụ phát triển Q2/2026',
    investor: 'Doanh nghiệp A',

    // Thông tin gói thầu
    legalBasis: 'Luật Đấu thầu',
    fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
    sector: 'Hàng hóa',
    type: 'quotation',
    contractType: 'lump_sum',
    scope: 'domestic',
    method: 'one_stage_one_envelope',
    estimatedValue: 1.35,
    executionDays: 14,
    hasMultipleLots: false,
    items: [
      { materialId: 'M011', materialCode: 'THL-001', materialName: 'License IDE JetBrains All-Pack', unit: 'license', quantity: 3, estimatedPrice: 0.45, totalValue: 1.35, technicalRequirement: 'Annual subscription, all products, 1 user/license', deadline: '2026-05-15' },
    ],
    technicalRequirements: 'Đạt tiêu chuẩn ISO 27001, có chứng nhận chất lượng',
    paymentTerms: 'Thanh toán 100% sau giao hàng và nghiệm thu',

    // Cách thức dự thầu
    biddingMode: 'offline',
    executionLocation: 'Doanh nghiệp A, Hà Nội',

    // Thông tin dự thầu
    closingDateTime: '2026-04-05T09:00:00',
    hsdtValidityDays: 30,

    // Hồ sơ dự thầu
    submissions: [],
    status: 'published',
    publishDate: '2026-03-25',
    createdBy: 'Lê Văn Hải',
    createdDate: '2026-03-22',
  },

  // ═══ 3. ĐANG NHẬN HSDT (receiving) ═══
  {
    id: 'BID-005',
    code: 'GT-2026-005',
    supplyPlanId: 'SP-002',
    title: 'Gói thầu cung cấp license M365 và module APM Q2/2026',
    description: 'License Microsoft 365 và module giám sát APM phục vụ vận hành & bảo trì',

    // Thông tin chung KHLCNT
    khlcntCode: 'PL2600063005',
    khlcntCategory: 'Mua sắm hàng hóa',
    procurementName: 'Mua sắm license và module APM phục vụ bảo trì Q2/2026',
    investor: 'Doanh nghiệp A',

    // Thông tin gói thầu
    legalBasis: 'Luật Đấu thầu',
    fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
    sector: 'Hàng hóa',
    type: 'quotation',
    contractType: 'lump_sum',
    scope: 'domestic',
    method: 'one_stage_one_envelope',
    estimatedValue: 115,
    executionDays: 21,
    hasMultipleLots: false,
    items: [
      { materialId: 'M001', materialCode: 'VB-001', materialName: 'License Microsoft 365 Business', unit: 'license', quantity: 20, estimatedPrice: 2.0, totalValue: 40, technicalRequirement: 'Annual subscription hoặc tương đương, 1 user/license', deadline: '2026-04-30' },
      { materialId: 'M003', materialCode: 'CB-001', materialName: 'Module giám sát hạ tầng (APM)', unit: 'license', quantity: 5, estimatedPrice: 15, totalValue: 75, technicalRequirement: 'Datadog APM hoặc tương đương, gói 5 host', deadline: '2026-06-30' },
    ],
    technicalRequirements: 'Sản phẩm phải có chứng nhận xuất xứ và báo cáo kiểm tra chất lượng',
    paymentTerms: 'Thanh toán 100% sau giao hàng và nghiệm thu',

    // Cách thức dự thầu
    biddingMode: 'offline',
    executionLocation: 'Doanh nghiệp A, Hà Nội',

    // Thông tin dự thầu
    closingDateTime: '2026-04-03T09:00:00',
    openingDateTime: '2026-04-03T09:30:00',
    openingLocation: 'Phòng họp Doanh nghiệp A',
    hsdtValidityDays: 45,
    depositAmount: 4600000,
    depositForm: 'Thư bảo lãnh hoặc giấy chứng nhận bảo hiểm bảo lãnh',

    // NCC đủ điều kiện
    qualifiedSuppliers: [
      { supplierId: 'SUP-005', supplierName: 'Microsoft Vietnam', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-03-22', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015', 'ISO 14001', 'ISO 27001'], qcConfirmed: true },
      { supplierId: 'SUP-004', supplierName: 'Công ty TNHH Tech-VN Hải Phòng', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-03-22', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015'], qcConfirmed: true },
      { supplierId: 'SUP-008', supplierName: 'AWS Vietnam', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-03-23', qualificationStatus: 'pending', certifications: ['ISO 9001:2015', 'ISO 14001'], qcConfirmed: false },
    ],

    // Hồ sơ dự thầu
    submissions: [
      { supplierId: 'SUP-005', supplierName: 'Microsoft Vietnam', totalPrice: 112, deliveryDays: 14, technicalScore: 95, priceScore: 90, totalScore: 92.5, submittedDate: '2026-03-30', isSelected: false },
    ],
    status: 'receiving',
    publishDate: '2026-03-20',
    createdBy: 'Lê Văn Hải',
    createdDate: '2026-03-18',
  },

  // ═══ 4. ĐANG ĐÁNH GIÁ (evaluating) ═══
  {
    id: 'BID-004',
    code: 'GT-2026-004',
    supplyPlanId: 'SP-002',
    title: 'Gói thầu cung cấp server và UPS điện tử',
    description: 'Server Dell PowerEdge và UPS phục vụ nâng cấp hệ thống xử lý dữ liệu 36D6',

    // Thông tin chung KHLCNT
    khlcntCode: 'PL2600063004',
    khlcntCategory: 'Mua sắm hàng hóa',
    procurementName: 'Mua sắm server và UPS phục vụ nâng cấp hệ thống 36D6',
    investor: 'Doanh nghiệp A',

    // Thông tin gói thầu
    legalBasis: 'Luật Đấu thầu',
    fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
    sector: 'Hàng hóa',
    type: 'quotation',
    contractType: 'lump_sum',
    scope: 'domestic',
    method: 'one_stage_one_envelope',
    estimatedValue: 268.5,
    executionDays: 28,
    hasMultipleLots: false,
    items: [
      { materialId: 'M010', materialCode: 'PCB-001', materialName: 'Server xử lý Dell PowerEdge', unit: 'cái', quantity: 3, estimatedPrice: 85, totalValue: 255, technicalRequirement: 'Dell R650, Xeon Silver, 64GB RAM, hỗ trợ workload xử lý 36D6', deadline: '2026-05-15' },
      { materialId: 'M015', materialCode: 'NL-001', materialName: 'UPS APC Smart-UPS 3000VA', unit: 'bộ', quantity: 3, estimatedPrice: 4.5, totalValue: 13.5, technicalRequirement: 'APC Smart-UPS 3000VA hoặc tương đương, online double-conversion', deadline: '2026-05-15' },
    ],
    technicalRequirements: 'Server phải tương thích hoàn toàn với hệ thống 36D6 hiện có. Yêu cầu test chức năng trước khi giao',
    paymentTerms: 'Thanh toán 100% sau giao hàng, kiểm tra và nghiệm thu đạt yêu cầu',

    // Cách thức dự thầu
    biddingMode: 'offline',
    executionLocation: 'Doanh nghiệp A, Hà Nội',

    // Thông tin dự thầu
    closingDateTime: '2026-03-22T09:00:00',
    openingDateTime: '2026-03-22T09:30:00',
    openingLocation: 'Phòng họp Doanh nghiệp A',
    hsdtValidityDays: 45,
    depositAmount: 10000000,
    depositForm: 'Thư bảo lãnh hoặc giấy chứng nhận bảo hiểm bảo lãnh',

    // NCC đủ điều kiện
    qualifiedSuppliers: [
      { supplierId: 'SUP-002', supplierName: 'Trung tâm phần mềm Beta', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-03-15', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015', 'ISO 27001', 'ISO 14001'], qcConfirmed: true },
      { supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-03-15', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015', 'ISO 27001'], qcConfirmed: true },
    ],

    // Hồ sơ dự thầu
    submissions: [
      { supplierId: 'SUP-002', supplierName: 'Trung tâm phần mềm Beta', totalPrice: 262, deliveryDays: 28, technicalScore: 94, priceScore: 88, totalScore: 91, submittedDate: '2026-03-20', isSelected: false },
      { supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', totalPrice: 270, deliveryDays: 21, technicalScore: 96, priceScore: 85, totalScore: 90.5, submittedDate: '2026-03-19', isSelected: false },
    ],
    status: 'evaluating',
    publishDate: '2026-03-12',
    createdBy: 'Lê Văn Hải',
    createdDate: '2026-03-10',
  },

  // ═══ 5. ĐÃ PHÊ DUYỆT (approved) ═══
  {
    id: 'BID-003',
    code: 'GT-2026-003',
    supplyPlanId: 'SP-002',
    title: 'Gói thầu cung cấp laptop nhân viên',
    description: 'Mua sắm laptop Dell Latitude phục vụ kiểm tra nghiệm thu hệ thống',

    // Thông tin chung KHLCNT
    khlcntCode: 'PL2600063003',
    khlcntCategory: 'Mua sắm hàng hóa',
    procurementName: 'Mua sắm laptop phục vụ kiểm tra nghiệm thu',
    investor: 'Doanh nghiệp A',

    // Thông tin gói thầu
    legalBasis: 'Luật Đấu thầu',
    fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
    sector: 'Hàng hóa',
    type: 'direct',
    contractType: 'lump_sum',
    scope: 'international',
    method: 'one_stage_one_envelope',
    estimatedValue: 280,
    executionDays: 30,
    hasMultipleLots: false,
    items: [
      { materialId: 'M014', materialCode: 'TB-001', materialName: 'Laptop Dell Latitude 5440', unit: 'cái', quantity: 1, estimatedPrice: 280, totalValue: 280, technicalRequirement: 'Intel i7, 16GB RAM, 512GB SSD, có chứng nhận chất lượng', deadline: '2026-06-30' },
    ],
    technicalRequirements: 'Thiết bị phải có giấy chứng nhận chất lượng ban đầu, bảo hành tối thiểu 2 năm',
    paymentTerms: 'Thanh toán 50% khi ký HĐ, 50% sau giao hàng và nghiệm thu',

    // Cách thức dự thầu
    biddingMode: 'offline',
    executionLocation: 'Doanh nghiệp A, Hà Nội',

    // Thông tin dự thầu
    closingDateTime: '2026-03-20T09:00:00',
    openingDateTime: '2026-03-20T09:30:00',
    openingLocation: 'Phòng họp Doanh nghiệp A',
    hsdtValidityDays: 60,
    depositAmount: 11200000,
    depositForm: 'Thư bảo lãnh hoặc giấy chứng nhận bảo hiểm bảo lãnh',

    // Thông tin phê duyệt
    approvalDecisionNo: '812/QĐ-DNA',
    approvalDate: '2026-03-25',
    approvalAuthority: 'Doanh nghiệp A',
    approvalAttachment: 'QD_PheDuyet_GT-2026-003.pdf',

    // Hồ sơ dự thầu
    submissions: [
      { supplierId: 'SUP-006', supplierName: 'Dell Technologies Vietnam', totalPrice: 275, deliveryDays: 30, technicalScore: 100, priceScore: 95, totalScore: 97.5, submittedDate: '2026-03-15', isSelected: true },
    ],
    status: 'approved',
    publishDate: '2026-03-10',
    selectedSupplierId: 'SUP-006',
    selectedSupplierName: 'Dell Technologies Vietnam',
    createdBy: 'Lê Văn Hải',
    createdDate: '2026-03-08',
  },

  // ═══ 6. HOÀN THÀNH (completed) ═══
  {
    id: 'BID-001',
    code: 'GT-2026-001',
    supplyPlanId: 'SP-001',
    title: 'Gói thầu cung cấp module monitoring & ERP Q1/2026',
    description: 'Cung cấp module xác thực 2FA, ERP Finance, DevOps Toolkit phục vụ nhiệm vụ vận hành Q1/2026',

    // Thông tin chung KHLCNT
    khlcntCode: 'PL2600063001',
    khlcntCategory: 'Mua sắm hàng hóa',
    procurementName: 'Mua sắm module monitoring và ERP phục vụ vận hành Q1/2026',
    investor: 'Doanh nghiệp A',

    // Thông tin gói thầu
    legalBasis: 'Luật Đấu thầu',
    fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
    sector: 'Hàng hóa',
    type: 'open',
    contractType: 'lump_sum',
    scope: 'domestic',
    method: 'one_stage_one_envelope',
    estimatedValue: 790,
    executionDays: 30,
    hasMultipleLots: false,
    items: [
      { materialId: 'M008', materialCode: 'RF-001', materialName: 'Module xác thực 2FA', unit: 'bộ', quantity: 2, estimatedPrice: 120, totalValue: 240, technicalRequirement: 'License + thiết bị, 50 users/bộ, tương thích hệ thống monitoring', deadline: '2026-03-20' },
      { materialId: 'M016', materialCode: 'DT-001', materialName: 'Module ERP Tài chính - Kế toán', unit: 'bộ', quantity: 1, estimatedPrice: 450, totalValue: 450, technicalRequirement: 'Triển khai SAP S/4HANA Finance, đạt tiêu chuẩn ISO 27001', deadline: '2026-03-30' },
      { materialId: 'M004', materialCode: 'KSC-001', materialName: 'Bộ công cụ DevOps Toolkit', unit: 'bộ', quantity: 2, estimatedPrice: 50, totalValue: 100, technicalRequirement: 'Bao gồm CI/CD pipeline, monitoring, logging', deadline: '2026-03-25' },
    ],
    technicalRequirements: 'Toàn bộ sản phẩm phải đạt tiêu chuẩn kỹ thuật doanh nghiệp. Có chứng nhận xuất xứ và kiểm định chất lượng',
    paymentTerms: 'Thanh toán 30% sau giao đợt 1, 70% sau hoàn thành và nghiệm thu',

    // Cách thức dự thầu
    biddingMode: 'online',
    eHsmtUrl: 'https://muasamcong.mpi.gov.vn',
    eHsdtFee: 330000,
    eHsdtUrl: 'https://muasamcong.mpi.gov.vn',
    executionLocation: 'Doanh nghiệp A, Hà Nội',

    // Thông tin dự thầu
    closingDateTime: '2026-02-07T09:00:00',
    openingDateTime: '2026-02-07T09:30:00',
    openingLocation: 'https://muasamcong.mpi.gov.vn',
    hsdtValidityDays: 60,
    depositAmount: 30000000,
    depositForm: 'Thư bảo lãnh hoặc giấy chứng nhận bảo hiểm bảo lãnh',

    // Thông tin phê duyệt
    approvalDecisionNo: '910/QĐ-DNA',
    approvalDate: '2026-02-15',
    approvalAuthority: 'Doanh nghiệp A',
    approvalAttachment: 'QD_PheDuyet_GT-2026-001.pdf',

    // NCC đủ điều kiện
    qualifiedSuppliers: [
      { supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-01-25', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015', 'ISO 27001'], capacityNote: 'Đã cung cấp module monitoring nhiều năm, năng lực tốt', qcConfirmed: true },
      { supplierId: 'SUP-003', supplierName: 'Trung tâm phần mềm Gamma', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-01-25', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015', 'ISO 27001'], qcConfirmed: true },
      { supplierId: 'SUP-002', supplierName: 'Trung tâm phần mềm Beta', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-01-25', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015', 'ISO 27001', 'ISO 14001'], qcConfirmed: true },
    ],

    // Hồ sơ dự thầu
    submissions: [
      { supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', totalPrice: 770, deliveryDays: 25, technicalScore: 92, priceScore: 88, totalScore: 90, submittedDate: '2026-02-05', isSelected: true },
      { supplierId: 'SUP-003', supplierName: 'Trung tâm phần mềm Gamma', totalPrice: 750, deliveryDays: 35, technicalScore: 85, priceScore: 90, totalScore: 87.5, submittedDate: '2026-02-06', isSelected: false },
      { supplierId: 'SUP-002', supplierName: 'Trung tâm phần mềm Beta', totalPrice: 800, deliveryDays: 20, technicalScore: 94, priceScore: 82, totalScore: 88, submittedDate: '2026-02-04', isSelected: false },
    ],
    status: 'completed',
    publishDate: '2026-01-20',
    selectedSupplierId: 'SUP-001',
    selectedSupplierName: 'Trung tâm phần mềm Alpha',

    // Công bố kết quả
    result: {
      announcementDate: '2026-02-16',
      announcementCode: 'TB-KQLCNT-2026-001',
      muasamcongResultUrl: 'https://muasamcong.mpi.gov.vn/web/guest/result?id=IB2600001234',
      resultAttachment: 'KetQua_LCNT_GT-2026-001.pdf',
    },

    muasamcongCode: 'IB2600001234',
    muasamcongUrl: 'https://muasamcong.mpi.gov.vn/web/guest/package?id=IB2600001234',
    attachments: ['HSMT_GT-2026-001.pdf', 'YeuCauKyThuat_Monitoring_ERP.pdf'],
    createdBy: 'Lê Văn Hải',
    createdDate: '2026-01-18',
  },
  {
    id: 'BID-002',
    code: 'GT-2026-002',
    supplyPlanId: 'SP-001',
    title: 'Gói thầu cung cấp license M365 và phụ kiện kết nối',
    description: 'Cung cấp license Microsoft 365, cáp mạng Cat6A, đầu nối RJ45 phục vụ vận hành hạ tầng',

    // Thông tin chung KHLCNT
    khlcntCode: 'PL2600063002',
    khlcntCategory: 'Mua sắm hàng hóa',
    procurementName: 'Mua sắm license và phụ kiện kết nối phục vụ vận hành hạ tầng',
    investor: 'Doanh nghiệp A',

    // Thông tin gói thầu
    legalBasis: 'Luật Đấu thầu',
    fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
    sector: 'Hàng hóa',
    type: 'quotation',
    contractType: 'lump_sum',
    scope: 'domestic',
    method: 'one_stage_one_envelope',
    estimatedValue: 59.4,
    executionDays: 14,
    hasMultipleLots: false,
    items: [
      { materialId: 'M001', materialCode: 'VB-001', materialName: 'License Microsoft 365 Business', unit: 'license', quantity: 25, estimatedPrice: 2.0, totalValue: 50, technicalRequirement: 'Annual subscription hoặc tương đương, 1 user/license', deadline: '2026-03-15' },
      { materialId: 'M007', materialCode: 'CAP-001', materialName: 'Cáp mạng Cat6A UTP', unit: 'mét', quantity: 80, estimatedPrice: 0.08, totalValue: 6.4, technicalRequirement: '10Gbps, dùng cho data center, đạt tiêu chuẩn TIA-568', deadline: '2026-02-28' },
      { materialId: 'M013', materialCode: 'DK-001', materialName: 'Đầu nối RJ45 Cat6A', unit: 'cái', quantity: 20, estimatedPrice: 0.15, totalValue: 3.0, technicalRequirement: 'Shielded, Cat6A, mạ vàng', deadline: '2026-02-28' },
    ],
    technicalRequirements: 'Sản phẩm phải có chứng nhận xuất xứ, đạt tiêu chuẩn kỹ thuật theo tiêu chuẩn doanh nghiệp',
    paymentTerms: 'Thanh toán 100% sau giao hàng và nghiệm thu',

    // Cách thức dự thầu
    biddingMode: 'offline',
    executionLocation: 'Doanh nghiệp A, Hà Nội',

    // Thông tin dự thầu
    closingDateTime: '2026-02-03T09:00:00',
    openingDateTime: '2026-02-03T09:30:00',
    openingLocation: 'Phòng họp Doanh nghiệp A',
    hsdtValidityDays: 30,
    depositAmount: 2400000,
    depositForm: 'Thư bảo lãnh hoặc giấy chứng nhận bảo hiểm bảo lãnh',

    // Thông tin phê duyệt
    approvalDecisionNo: '856/QĐ-DNA',
    approvalDate: '2026-02-08',
    approvalAuthority: 'Doanh nghiệp A',
    approvalAttachment: 'QD_PheDuyet_GT-2026-002.pdf',

    // NCC đủ điều kiện
    qualifiedSuppliers: [
      { supplierId: 'SUP-005', supplierName: 'Microsoft Vietnam', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-01-28', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015', 'ISO 14001', 'ISO 27001'], qcConfirmed: true },
      { supplierId: 'SUP-004', supplierName: 'Công ty TNHH Tech-VN Hải Phòng', checkedBy: 'Vũ Quang Huy', checkedDate: '2026-01-28', qualificationStatus: 'qualified', certifications: ['ISO 9001:2015'], qcConfirmed: true },
    ],

    // Hồ sơ dự thầu
    submissions: [
      { supplierId: 'SUP-005', supplierName: 'Microsoft Vietnam', totalPrice: 58, deliveryDays: 14, technicalScore: 96, priceScore: 90, totalScore: 93, submittedDate: '2026-02-01', isSelected: true },
      { supplierId: 'SUP-004', supplierName: 'Công ty TNHH Tech-VN Hải Phòng', totalPrice: 55, deliveryDays: 21, technicalScore: 82, priceScore: 94, totalScore: 88, submittedDate: '2026-02-02', isSelected: false },
    ],
    status: 'completed',
    publishDate: '2026-01-22',
    selectedSupplierId: 'SUP-005',
    selectedSupplierName: 'Microsoft Vietnam',

    // Công bố kết quả
    result: {
      announcementDate: '2026-02-09',
      announcementCode: 'TB-KQLCNT-2026-002',
      resultAttachment: 'KetQua_LCNT_GT-2026-002.pdf',
    },

    attachments: ['HSMT_GT-2026-002.pdf'],
    createdBy: 'Lê Văn Hải',
    createdDate: '2026-01-20',
  },

  // ═══ 7. HỦY (cancelled) ═══
  {
    id: 'BID-008',
    code: 'GT-2026-008',
    supplyPlanId: 'SP-003',
    title: 'Gói thầu cung cấp hệ thống monitoring P-37 (đã hủy)',
    description: 'Gói thầu bị hủy do thay đổi kế hoạch nâng cấp, chuyển sang quý 3/2026',

    // Thông tin chung KHLCNT
    khlcntCode: 'PL2600063008',
    khlcntCategory: 'Mua sắm hàng hóa',
    procurementName: 'Mua sắm hệ thống monitoring P-37 phục vụ nâng cấp',
    investor: 'Doanh nghiệp A',

    // Thông tin gói thầu
    legalBasis: 'Luật Đấu thầu',
    fundingSource: 'Ngân sách doanh nghiệp - Khối CNTT năm 2026',
    sector: 'Hàng hóa',
    type: 'open',
    contractType: 'lump_sum',
    scope: 'domestic',
    method: 'one_stage_one_envelope',
    estimatedValue: 700,
    executionDays: 45,
    hasMultipleLots: false,
    items: [
      { materialId: 'M009', materialCode: 'ANT-001', materialName: 'Hệ thống monitoring on-premise', unit: 'bộ', quantity: 2, estimatedPrice: 350, totalValue: 700, technicalRequirement: 'Prometheus + Grafana, tương thích P-37', deadline: '2026-06-15' },
    ],
    technicalRequirements: 'Hệ thống phải tương thích hoàn toàn với hạ tầng P-37 hiện hành',
    paymentTerms: 'Thanh toán theo tiến độ giao hàng',

    // Cách thức dự thầu
    biddingMode: 'online',
    eHsmtUrl: 'https://muasamcong.mpi.gov.vn',
    eHsdtFee: 330000,
    eHsdtUrl: 'https://muasamcong.mpi.gov.vn',
    executionLocation: 'Doanh nghiệp A, Hà Nội',

    // Thông tin dự thầu
    closingDateTime: '2026-03-10T09:00:00',
    openingDateTime: '2026-03-10T09:30:00',
    openingLocation: 'https://muasamcong.mpi.gov.vn',
    hsdtValidityDays: 60,
    depositAmount: 28000000,
    depositForm: 'Thư bảo lãnh hoặc giấy chứng nhận bảo hiểm bảo lãnh',

    // Hồ sơ dự thầu
    submissions: [
      { supplierId: 'SUP-001', supplierName: 'Trung tâm phần mềm Alpha', totalPrice: 680, deliveryDays: 40, technicalScore: 90, priceScore: 88, totalScore: 89, submittedDate: '2026-03-05', isSelected: false },
    ],
    status: 'cancelled',
    publishDate: '2026-02-25',
    muasamcongCode: 'IB2600001567',
    muasamcongUrl: 'https://muasamcong.mpi.gov.vn/web/guest/package?id=IB2600001567',
    attachments: ['HSMT_GT-2026-008.pdf'],
    createdBy: 'Lê Văn Hải',
    createdDate: '2026-02-20',
  },
];
