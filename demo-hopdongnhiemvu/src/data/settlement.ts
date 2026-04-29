import type {
  Settlement,
  SettlementItem,
  VarianceReport,
  FinancialTransaction,
  ContractClosure,
  SettlementVersionLog,
} from '../types';

// ─── Settlements ──────────────────────────────────────────────────────────────
// HD-001: HĐ nâng cấp hệ thống monitoring P-18 — đã có final settlement approved & closed
// HD-002: HĐ nâng cấp module CRM S-125 — có settlement v1 bị reject, v2 đang reviewing

export const settlements: Settlement[] = [
  // ── HD-001: Final settlement, APPROVED → contract CLOSED ──
  {
    id: 'QT-001',
    contractId: 'HD-001',
    code: 'QT-2026-001',
    version: 2,
    parentVersionId: 'QT-001-v1',
    settlementType: 'final',
    coveredPeriod: { from: '2026-02-01', to: '2026-05-15' },
    coveredWorkItemIds: ['WI-001', 'WI-002', 'WI-003'],

    plannedQuantity: 3,
    acceptedQuantity: 3,
    actualQuantity: 3,
    quantityVariance: 0,
    quantityVariancePct: 0,

    contractValue: 850,
    plannedCost: 680,
    actualCost: 756,
    costVariance: 76,
    costVariancePct: 11.2,

    materialCostActual: 312,
    laborCostActual: 198,
    equipmentCostActual: 145,
    overheadCostActual: 101,
    indirectCostAllocated: 42,

    revenue: 850,
    grossProfit: 94,
    profitMargin: 11.1,

    reconciliationStatus: 'reconciled',
    status: 'approved',
    isLocked: true,

    preparedBy: 'Hoàng Minh Tuấn',
    preparedAt: '2026-05-20T08:30:00',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2026-05-20T09:00:00',
    reviewedBy: 'Nguyễn Thu Hà',
    reviewedAt: '2026-05-22T14:00:00',
    reviewNote: 'Chi phí vật tư tăng do biến động giá thị trường trong Q2/2026. Đã có giải trình và chứng từ kèm theo.',
    approvedBy: 'Phạm Quốc Hưng',
    approvedAt: '2026-05-24T10:15:00',

    archiveRef: 'LT-2026-HD001-QT',
    archivedAt: '2026-05-24T10:20:00',

    notes: 'Quyết toán lần 2. Lần 1 bị từ chối do thiếu chứng từ vật tư.',
    createdAt: '2026-05-20T08:30:00',
    updatedAt: '2026-05-24T10:20:00',
  },
  // ── Version 1 bị reject (parent) ──
  {
    id: 'QT-001-v1',
    contractId: 'HD-001',
    code: 'QT-2026-001',
    version: 1,
    settlementType: 'final',
    coveredPeriod: { from: '2026-02-01', to: '2026-05-15' },
    coveredWorkItemIds: ['WI-001', 'WI-002', 'WI-003'],

    plannedQuantity: 3,
    acceptedQuantity: 3,
    actualQuantity: 3,
    quantityVariance: 0,
    quantityVariancePct: 0,

    contractValue: 850,
    plannedCost: 680,
    actualCost: 756,
    costVariance: 76,
    costVariancePct: 11.2,

    materialCostActual: 312,
    laborCostActual: 198,
    equipmentCostActual: 145,
    overheadCostActual: 101,
    indirectCostAllocated: 42,

    revenue: 850,
    grossProfit: 94,
    profitMargin: 11.1,

    reconciliationStatus: 'reconciled',
    status: 'closed',  // locked/archived
    isLocked: true,

    preparedBy: 'Hoàng Minh Tuấn',
    preparedAt: '2026-05-15T08:00:00',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2026-05-15T09:00:00',
    reviewedBy: 'Nguyễn Thu Hà',
    reviewedAt: '2026-05-17T11:00:00',
    reviewNote: '',
    rejectedBy: 'Nguyễn Thu Hà',
    rejectedAt: '2026-05-17T11:00:00',
    rejectionReason: 'Thiếu chứng từ vật tư mua ngoài (3 hóa đơn chưa đính kèm). Yêu cầu bổ sung đầy đủ trước khi trình lại.',

    notes: 'Phiên bản 1 — đã từ chối.',
    createdAt: '2026-05-15T08:00:00',
    updatedAt: '2026-05-17T11:00:00',
  },

  // ── HD-002: Đại tu S-125 — settlement v1 đang reviewing ──
  {
    id: 'QT-002',
    contractId: 'HD-002',
    code: 'QT-2026-002',
    version: 1,
    settlementType: 'partial',
    coveredPeriod: { from: '2026-02-15', to: '2026-04-30' },
    coveredWorkItemIds: ['WI-004', 'WI-005'],

    plannedQuantity: 2,
    acceptedQuantity: 1,
    actualQuantity: 2,
    quantityVariance: 0,
    quantityVariancePct: 0,

    contractValue: 1200,
    plannedCost: 490,
    actualCost: 542,
    costVariance: 52,
    costVariancePct: 10.6,

    materialCostActual: 228,
    laborCostActual: 145,
    equipmentCostActual: 98,
    overheadCostActual: 71,
    indirectCostAllocated: 38,

    revenue: 600,
    grossProfit: 58,
    profitMargin: 9.7,

    reconciliationStatus: 'reconciled',
    status: 'reviewing',
    isLocked: false,

    preparedBy: 'Hoàng Minh Tuấn',
    preparedAt: '2026-05-05T08:00:00',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2026-05-05T09:30:00',
    reviewedBy: 'Nguyễn Thu Hà',
    reviewedAt: '2026-05-06T10:00:00',
    reviewNote: 'Đang xem xét chi phí thiết bị. Yêu cầu bổ sung biên bản kiểm tra thiết bị đo.',

    notes: 'Quyết toán từng phần — giai đoạn 1 (tháo rời + kiểm tra).',
    createdAt: '2026-05-05T08:00:00',
    updatedAt: '2026-05-06T10:00:00',
  },

  // ── HD-003: Draft mới lập ──
  {
    id: 'QT-003',
    contractId: 'HD-003',
    code: 'QT-2026-003',
    version: 1,
    settlementType: 'final',
    coveredPeriod: { from: '2026-01-10', to: '2026-03-31' },
    coveredWorkItemIds: ['WI-007', 'WI-008'],

    plannedQuantity: 4,
    acceptedQuantity: 4,
    actualQuantity: 4,
    quantityVariance: 0,
    quantityVariancePct: 0,

    contractValue: 480,
    plannedCost: 385,
    actualCost: 378,
    costVariance: -7,
    costVariancePct: -1.8,

    materialCostActual: 158,
    laborCostActual: 102,
    equipmentCostActual: 68,
    overheadCostActual: 50,
    indirectCostAllocated: 22,

    revenue: 480,
    grossProfit: 102,
    profitMargin: 21.3,

    reconciliationStatus: 'pending',
    status: 'draft',
    isLocked: false,

    preparedBy: 'Hoàng Minh Tuấn',
    preparedAt: '2026-04-25T14:00:00',

    notes: 'Đang tổng hợp chi phí thực tế. Chờ P.TCKT cung cấp số liệu vật tư tháng 3.',
    createdAt: '2026-04-25T14:00:00',
    updatedAt: '2026-04-28T09:00:00',
  },
];

// ─── Settlement Items ─────────────────────────────────────────────────────────
export const settlementItems: SettlementItem[] = [
  // QT-001 (HD-001 — hệ thống monitoring P-18)
  {
    id: 'SI-001',
    settlementId: 'QT-001',
    wbsItemId: 'WI-001',
    workOrderIds: ['WO-001'],
    itemCode: 'WBS-001.01',
    itemName: 'Tháo rời kiểm tra tổng thể hệ thống monitoring P-18',
    unit: 'Cụm',
    contractQuantity: 1,
    acceptedQuantity: 1,
    actualQuantity: 1,
    quantityVariance: 0,
    plannedUnitCost: 85,
    actualUnitCost: 98,
    plannedCost: 85,
    actualCost: 98,
    costVariance: 13,
    costVariancePct: 15.3,
    materialCost: 42,
    laborCost: 28,
    equipmentCost: 18,
    overheadCost: 10,
    isIncluded: true,
    sortOrder: 1,
  },
  {
    id: 'SI-002',
    settlementId: 'QT-001',
    wbsItemId: 'WI-002',
    workOrderIds: ['WO-002', 'WO-003'],
    itemCode: 'WBS-001.02',
    itemName: 'Sửa chữa khối thu tần số cao',
    unit: 'Bộ',
    contractQuantity: 1,
    acceptedQuantity: 1,
    actualQuantity: 1,
    quantityVariance: 0,
    plannedUnitCost: 320,
    actualUnitCost: 358,
    plannedCost: 320,
    actualCost: 358,
    costVariance: 38,
    costVariancePct: 11.9,
    materialCost: 185,
    laborCost: 102,
    equipmentCost: 45,
    overheadCost: 26,
    isIncluded: true,
    sortOrder: 2,
  },
  {
    id: 'SI-003',
    settlementId: 'QT-001',
    wbsItemId: 'WI-003',
    workOrderIds: ['WO-004'],
    itemCode: 'WBS-001.03',
    itemName: 'Sửa chữa hệ thống cảnh báo 360°',
    unit: 'Bộ',
    contractQuantity: 1,
    acceptedQuantity: 1,
    actualQuantity: 1,
    quantityVariance: 0,
    plannedUnitCost: 275,
    actualUnitCost: 300,
    plannedCost: 275,
    actualCost: 300,
    costVariance: 25,
    costVariancePct: 9.1,
    materialCost: 85,
    laborCost: 68,
    equipmentCost: 82,
    overheadCost: 65,
    isIncluded: true,
    sortOrder: 3,
  },

  // QT-002 (HD-002 — S-125)
  {
    id: 'SI-004',
    settlementId: 'QT-002',
    wbsItemId: 'WI-004',
    workOrderIds: ['WO-005'],
    itemCode: 'WBS-002.01',
    itemName: 'Tháo rời tổ hợp triển khai S-125',
    unit: 'Tổ hợp',
    contractQuantity: 1,
    acceptedQuantity: 1,
    actualQuantity: 1,
    quantityVariance: 0,
    plannedUnitCost: 185,
    actualUnitCost: 204,
    plannedCost: 185,
    actualCost: 204,
    costVariance: 19,
    costVariancePct: 10.3,
    materialCost: 85,
    laborCost: 58,
    equipmentCost: 38,
    overheadCost: 23,
    isIncluded: true,
    sortOrder: 1,
  },
  {
    id: 'SI-005',
    settlementId: 'QT-002',
    wbsItemId: 'WI-005',
    workOrderIds: ['WO-006'],
    itemCode: 'WBS-002.02',
    itemName: 'Kiểm tra hệ thống điện điều khiển',
    unit: 'Hệ thống',
    contractQuantity: 1,
    acceptedQuantity: 0,
    actualQuantity: 1,
    quantityVariance: 0,
    plannedUnitCost: 305,
    actualUnitCost: 338,
    plannedCost: 305,
    actualCost: 338,
    costVariance: 33,
    costVariancePct: 10.8,
    materialCost: 143,
    laborCost: 87,
    equipmentCost: 60,
    overheadCost: 48,
    isIncluded: true,
    sortOrder: 2,
  },

  // QT-003 (HD-003 — draft)
  {
    id: 'SI-006',
    settlementId: 'QT-003',
    wbsItemId: 'WI-007',
    workOrderIds: ['WO-007'],
    itemCode: 'WBS-003.01',
    itemName: 'Sản xuất cụm module thay thế hệ thống monitoring 36D6',
    unit: 'Cụm',
    contractQuantity: 2,
    acceptedQuantity: 2,
    actualQuantity: 2,
    quantityVariance: 0,
    plannedUnitCost: 95,
    actualUnitCost: 92,
    plannedCost: 190,
    actualCost: 184,
    costVariance: -6,
    costVariancePct: -3.2,
    materialCost: 78,
    laborCost: 52,
    equipmentCost: 32,
    overheadCost: 22,
    isIncluded: true,
    sortOrder: 1,
  },
  {
    id: 'SI-007',
    settlementId: 'QT-003',
    wbsItemId: 'WI-008',
    workOrderIds: ['WO-008'],
    itemCode: 'WBS-003.02',
    itemName: 'Lắp ráp và thử nghiệm hệ thống',
    unit: 'Bộ',
    contractQuantity: 2,
    acceptedQuantity: 2,
    actualQuantity: 2,
    quantityVariance: 0,
    plannedUnitCost: 97.5,
    actualUnitCost: 97,
    plannedCost: 195,
    actualCost: 194,
    costVariance: -1,
    costVariancePct: -0.5,
    materialCost: 80,
    laborCost: 50,
    equipmentCost: 36,
    overheadCost: 28,
    isIncluded: true,
    sortOrder: 2,
  },
];

// ─── Variance Reports ─────────────────────────────────────────────────────────
export const varianceReports: VarianceReport[] = [
  {
    id: 'VR-001',
    settlementId: 'QT-001',
    generatedAt: '2026-05-20T08:35:00',
    generatedBy: 'Hệ thống',
    totalCostVariance: 76,
    totalQuantityVariance: 0,
    varianceCategory: 'major_overrun',
    topVarianceItems: [
      {
        wbsItemId: 'WI-001',
        itemName: 'Tháo rời kiểm tra tổng thể hệ thống monitoring P-18',
        plannedCost: 85,
        actualCost: 98,
        variance: 13,
        variancePct: 15.3,
        rootCause: 'Phát hiện thêm ăn mòn ở 4 điểm hàn không thể thấy khi kiểm tra sơ bộ',
      },
      {
        wbsItemId: 'WI-002',
        itemName: 'Sửa chữa khối thu tần số cao',
        plannedCost: 320,
        actualCost: 358,
        variance: 38,
        variancePct: 11.9,
        rootCause: 'Giá linh kiện IC nhập ngoại tăng 18% so với thời điểm lập dự toán (Q4/2025)',
      },
      {
        wbsItemId: 'WI-003',
        itemName: 'Sửa chữa hệ thống cảnh báo 360°',
        plannedCost: 275,
        actualCost: 300,
        variance: 25,
        variancePct: 9.1,
        rootCause: 'Phải thay thêm 2 vòng bi do mòn vượt tiêu chuẩn, không phát hiện được trước khi tháo rời',
      },
    ],
    explanationRequired: true,
    explanationNote: 'Chi phí vật tư vượt dự toán do: (1) Biến động giá IC nhập ngoại tăng 18%, (2) Phát sinh thêm hạng mục sửa chữa ăn mòn và thay thế vòng bi khi tháo rời kiểm tra. Đính kèm: biên bản phát sinh công việc số BN-2026-042, 3 hóa đơn vật tư bổ sung.',
    approvedWithVariance: true,
    varianceApprovalNote: 'Đã xem xét và chấp thuận — phát sinh khách quan, có đầy đủ chứng từ. Phạm Quốc Hưng, 24/05/2026.',
  },
  {
    id: 'VR-002',
    settlementId: 'QT-002',
    generatedAt: '2026-05-05T08:10:00',
    generatedBy: 'Hệ thống',
    totalCostVariance: 52,
    totalQuantityVariance: 0,
    varianceCategory: 'major_overrun',
    topVarianceItems: [
      {
        wbsItemId: 'WI-004',
        itemName: 'Tháo rời tổ hợp triển khai S-125',
        plannedCost: 185,
        actualCost: 204,
        variance: 19,
        variancePct: 10.3,
        rootCause: 'Phát sinh thêm nhân công tháo ren bị han gỉ',
      },
      {
        wbsItemId: 'WI-005',
        itemName: 'Kiểm tra hệ thống điện điều khiển',
        plannedCost: 305,
        actualCost: 338,
        variance: 33,
        variancePct: 10.8,
        rootCause: 'Phải thuê thiết bị đo chuyên dụng do thiết bị nội bộ đang hiệu chuẩn',
      },
    ],
    explanationRequired: true,
    explanationNote: 'Đang bổ sung giải trình — chờ xác nhận từ P.TCKT về biên bản thuê thiết bị đo.',
  },
  {
    id: 'VR-003',
    settlementId: 'QT-003',
    generatedAt: '2026-04-25T14:10:00',
    generatedBy: 'Hệ thống',
    totalCostVariance: -7,
    totalQuantityVariance: 0,
    varianceCategory: 'within_budget',
    topVarianceItems: [],
    explanationRequired: false,
  },
];

// ─── Financial Transactions ───────────────────────────────────────────────────
export const financialTransactions: FinancialTransaction[] = [
  // HD-001 transactions
  { id: 'FT-001', contractId: 'HD-001', wbsItemId: 'WI-001', transactionCode: 'CT-2026-0312', transactionType: 'purchase', transactionDate: '2026-03-05', amount: 42, financeSystemRef: 'TCKT-INV-0312', accountCode: '152', costCenter: 'PX1', isReconciled: true, syncedAt: '2026-05-18T08:00:00' },
  { id: 'FT-002', contractId: 'HD-001', wbsItemId: 'WI-001', transactionCode: 'CT-2026-0318', transactionType: 'labor', transactionDate: '2026-03-12', amount: 28, financeSystemRef: 'TCKT-LBR-0318', accountCode: '334', costCenter: 'PX1', isReconciled: true, syncedAt: '2026-05-18T08:00:00' },
  { id: 'FT-003', contractId: 'HD-001', wbsItemId: 'WI-002', transactionCode: 'CT-2026-0401', transactionType: 'purchase', transactionDate: '2026-03-20', amount: 185, financeSystemRef: 'TCKT-INV-0401', accountCode: '152', costCenter: 'PX4', isReconciled: true, syncedAt: '2026-05-18T08:00:00' },
  { id: 'FT-004', contractId: 'HD-001', wbsItemId: 'WI-002', transactionCode: 'CT-2026-0415', transactionType: 'labor', transactionDate: '2026-04-10', amount: 102, financeSystemRef: 'TCKT-LBR-0415', accountCode: '334', costCenter: 'PX4', isReconciled: true, syncedAt: '2026-05-18T08:00:00' },
  { id: 'FT-005', contractId: 'HD-001', wbsItemId: 'WI-003', transactionCode: 'CT-2026-0502', transactionType: 'purchase', transactionDate: '2026-04-20', amount: 85, financeSystemRef: 'TCKT-INV-0502', accountCode: '152', costCenter: 'PX3', isReconciled: true, syncedAt: '2026-05-18T08:00:00' },
  { id: 'FT-006', contractId: 'HD-001', wbsItemId: 'WI-003', transactionCode: 'CT-2026-0508', transactionType: 'depreciation', transactionDate: '2026-05-01', amount: 82, financeSystemRef: 'TCKT-EQP-0508', accountCode: '214', costCenter: 'PX3', isReconciled: true, syncedAt: '2026-05-18T08:00:00' },
  { id: 'FT-007', contractId: 'HD-001', transactionCode: 'CT-2026-0515', transactionType: 'overhead', transactionDate: '2026-05-10', amount: 101, financeSystemRef: 'TCKT-OHD-0515', accountCode: '627', costCenter: 'CHUNG', isReconciled: true, syncedAt: '2026-05-18T08:00:00' },
  // HD-002 transactions
  { id: 'FT-008', contractId: 'HD-002', wbsItemId: 'WI-004', transactionCode: 'CT-2026-0321', transactionType: 'purchase', transactionDate: '2026-03-10', amount: 85, financeSystemRef: 'TCKT-INV-0321', accountCode: '152', costCenter: 'PX2', isReconciled: true, syncedAt: '2026-05-04T08:00:00' },
  { id: 'FT-009', contractId: 'HD-002', wbsItemId: 'WI-004', transactionCode: 'CT-2026-0328', transactionType: 'labor', transactionDate: '2026-03-25', amount: 58, financeSystemRef: 'TCKT-LBR-0328', accountCode: '334', costCenter: 'PX2', isReconciled: true, syncedAt: '2026-05-04T08:00:00' },
  { id: 'FT-010', contractId: 'HD-002', wbsItemId: 'WI-005', transactionCode: 'CT-2026-0422', transactionType: 'depreciation', transactionDate: '2026-04-15', amount: 60, financeSystemRef: 'TCKT-EQP-0422', accountCode: '214', costCenter: 'PX4', isReconciled: true, syncedAt: '2026-05-04T08:00:00' },
  { id: 'FT-011', contractId: 'HD-002', wbsItemId: 'WI-005', transactionCode: 'CT-2026-0430', transactionType: 'purchase', transactionDate: '2026-04-22', amount: 143, financeSystemRef: 'TCKT-INV-0430', accountCode: '152', costCenter: 'PX4', isReconciled: true, syncedAt: '2026-05-04T08:00:00' },
];

// ─── Contract Closure ─────────────────────────────────────────────────────────
export const contractClosures: ContractClosure[] = [
  {
    id: 'CC-001',
    contractId: 'HD-001',
    settlementId: 'QT-001',
    closureDate: '2026-05-25',
    closureReason: 'completed',
    closedBy: 'Phạm Quốc Hưng',
    finalContractValue: 850,
    finalActualCost: 756,
    finalGrossProfit: 94,
    finalProfitMargin: 11.1,
    checklistItems: [
      { key: 'all_wbs_completed', label: 'Tất cả WBS đã hoàn thành', isMet: true, verifiedBy: 'Hoàng Minh Tuấn', verifiedAt: '2026-05-19T10:00:00' },
      { key: 'all_acceptance_passed', label: 'Tất cả nghiệm thu đã đạt', isMet: true, verifiedBy: 'P.KCS', verifiedAt: '2026-05-10T14:00:00' },
      { key: 'all_defects_closed', label: 'Không còn lỗi chưa xử lý', isMet: true, verifiedBy: 'P.KCS', verifiedAt: '2026-05-10T14:30:00' },
      { key: 'handover_completed', label: 'Bàn giao đã hoàn tất', isMet: true, verifiedBy: 'Hoàng Minh Tuấn', verifiedAt: '2026-05-12T09:00:00' },
      { key: 'settlement_approved', label: 'Quyết toán đã được phê duyệt', isMet: true, verifiedBy: 'Phạm Quốc Hưng', verifiedAt: '2026-05-24T10:15:00' },
      { key: 'financial_reconciled', label: 'Số liệu tài chính đã đối chiếu', isMet: true, verifiedBy: 'Nguyễn Thu Hà', verifiedAt: '2026-05-18T16:00:00' },
    ],
    isLocked: true,
    lockedAt: '2026-05-25T09:00:00',
    archiveCode: 'LT-2026-HD001-CLOSE',
    archiveLocation: '/archive/2026/hop-dong/HD-001/',
    notes: 'Hợp đồng hoàn thành đúng tiến độ. Chi phí vượt dự toán 11.2% có giải trình được chấp thuận.',
    createdAt: '2026-05-25T09:00:00',
  },
];

// ─── Version Logs ─────────────────────────────────────────────────────────────
export const settlementVersionLogs: SettlementVersionLog[] = [
  // QT-001 (v2 — current)
  { id: 'VL-001', settlementId: 'QT-001', version: 1, action: 'created', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-05-15T08:00:00', comment: 'Lập hồ sơ quyết toán lần đầu' },
  { id: 'VL-002', settlementId: 'QT-001', version: 1, action: 'submitted', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-05-15T09:00:00' },
  { id: 'VL-003', settlementId: 'QT-001', version: 1, action: 'rejected', performedBy: 'Nguyễn Thu Hà', performedAt: '2026-05-17T11:00:00', comment: 'Thiếu chứng từ vật tư mua ngoài (3 hóa đơn chưa đính kèm)' },
  { id: 'VL-004', settlementId: 'QT-001', version: 2, action: 'created', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-05-20T08:30:00', comment: 'Lập lại — đã bổ sung đầy đủ chứng từ' },
  { id: 'VL-005', settlementId: 'QT-001', version: 2, action: 'submitted', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-05-20T09:00:00' },
  { id: 'VL-006', settlementId: 'QT-001', version: 2, action: 'reviewed', performedBy: 'Nguyễn Thu Hà', performedAt: '2026-05-22T14:00:00', comment: 'Đã thẩm định — chuyển BGĐ phê duyệt' },
  { id: 'VL-007', settlementId: 'QT-001', version: 2, action: 'approved', performedBy: 'Phạm Quốc Hưng', performedAt: '2026-05-24T10:15:00', comment: 'Phê duyệt — có chấp thuận vượt dự toán' },
  { id: 'VL-008', settlementId: 'QT-001', version: 2, action: 'locked', performedBy: 'Hệ thống', performedAt: '2026-05-24T10:20:00' },
  // QT-002
  { id: 'VL-009', settlementId: 'QT-002', version: 1, action: 'created', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-05-05T08:00:00' },
  { id: 'VL-010', settlementId: 'QT-002', version: 1, action: 'submitted', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-05-05T09:30:00' },
  { id: 'VL-011', settlementId: 'QT-002', version: 1, action: 'reviewed', performedBy: 'Nguyễn Thu Hà', performedAt: '2026-05-06T10:00:00', comment: 'Đang xem xét — yêu cầu bổ sung biên bản thiết bị đo' },
  // QT-003
  { id: 'VL-012', settlementId: 'QT-003', version: 1, action: 'created', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-04-25T14:00:00' },
];

// ─── Helper functions ─────────────────────────────────────────────────────────
export const getSettlementById = (id: string) =>
  settlements.find(s => s.id === id);

export const getSettlementsByContract = (contractId: string) =>
  settlements.filter(s => s.contractId === contractId).sort((a, b) => b.version - a.version);

export const getLatestSettlementByContract = (contractId: string) => {
  const list = getSettlementsByContract(contractId);
  return list.find(s => s.status !== 'closed') ?? list[0];
};

export const getSettlementItems = (settlementId: string) =>
  settlementItems.filter(si => si.settlementId === settlementId).sort((a, b) => a.sortOrder - b.sortOrder);

export const getVarianceReport = (settlementId: string) =>
  varianceReports.find(vr => vr.settlementId === settlementId);

export const getFinancialTransactions = (contractId: string) =>
  financialTransactions.filter(ft => ft.contractId === contractId);

export const getContractClosure = (contractId: string) =>
  contractClosures.find(cc => cc.contractId === contractId);

export const getVersionLogs = (settlementId: string) =>
  settlementVersionLogs
    .filter(vl => vl.settlementId === settlementId)
    .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());
