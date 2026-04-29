import type { StockParameterRecord } from '../types';

// ═══════════════════════════════════════════════════════════
// Mock Data — Tham số tồn kho (Stock Parameters)
// Tách khỏi ProductClassificationRecord — lịch sử độc lập
// Duyệt: Trưởng phòng P.KH/P.LGKT (không phải BGĐ)
// Ngữ cảnh: Trung tâm Hà Nội
// ═══════════════════════════════════════════════════════════

export const stockParameters: StockParameterRecord[] = [

  // ─── SP-2026-001 — PRD-001 Bo mạch monitoring P-18 (applied, v2) ─────────────────
  {
    id: 'SPR-001',
    code: 'SP-2026-001',
    productId: 'PRD-001',
    productCode: 'RD-BM-001',
    productName: 'Bo mạch xử lý tín hiệu monitoring P-18',
    status: 'applied',
    version: 2,
    minStock: 5,
    maxStock: 30,
    reorderPoint: 8,
    effectiveFrom: '2026-01-01',
    changeReason: 'Điều chỉnh tăng mức tối đa từ 20 lên 30 do nhu cầu đại tu tăng trong Q1/2026.',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2025-12-20T09:00:00',
    approvedBy: 'Lê Thị Mai',
    approvedAt: '2025-12-22T14:00:00',
    approvalNote: 'Duyệt. Phù hợp kế hoạch đại tu monitoring Q1/2026.',
    appliedAt: '2026-01-01T00:00:00',
    createdBy: 'Hoàng Minh Tuấn',
    createdAt: '2025-12-20T09:00:00',
    updatedAt: '2026-01-01T00:00:00',
    auditLog: [
      { id: 'SPL-001-1', timestamp: '2025-12-20T09:00:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'created', toStatus: 'draft' },
      { id: 'SPL-001-2', timestamp: '2025-12-20T09:30:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'submitted', fromStatus: 'draft', toStatus: 'pending_approval', note: 'Trình Trưởng phòng duyệt' },
      { id: 'SPL-001-3', timestamp: '2025-12-22T14:00:00', actor: 'Lê Thị Mai', actorRole: 'Phòng Logistics - Kỹ thuật', action: 'approved', fromStatus: 'pending_approval', toStatus: 'approved', note: 'Duyệt. Phù hợp kế hoạch đại tu monitoring Q1/2026.', newValues: { minStock: 5, maxStock: 30, reorderPoint: 8 } },
      { id: 'SPL-001-4', timestamp: '2026-01-01T00:00:00', actor: 'System', actorRole: 'Hệ thống', action: 'applied', fromStatus: 'approved', toStatus: 'applied' },
    ],
  },

  // ─── SP-2026-001 v1 (lịch sử — đã bị thay thế bởi v2) ───────────────────────
  {
    id: 'SPR-001-H',
    code: 'SP-2025-001',
    productId: 'PRD-001',
    productCode: 'RD-BM-001',
    productName: 'Bo mạch xử lý tín hiệu monitoring P-18',
    status: 'applied',
    version: 1,
    minStock: 5,
    maxStock: 20,
    reorderPoint: 8,
    effectiveFrom: '2025-06-17',
    changeReason: 'Thiết lập tham số tồn kho lần đầu sau khi phân loại được áp dụng.',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2025-06-17T15:30:00',
    approvedBy: 'Lê Thị Mai',
    approvedAt: '2025-06-18T09:00:00',
    approvalNote: 'Duyệt — thiết lập ban đầu.',
    appliedAt: '2025-06-18T09:30:00',
    createdBy: 'Hoàng Minh Tuấn',
    createdAt: '2025-06-17T15:30:00',
    updatedAt: '2026-01-01T00:00:00',
    auditLog: [
      { id: 'SPL-001H-1', timestamp: '2025-06-17T15:30:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'created', toStatus: 'draft' },
      { id: 'SPL-001H-2', timestamp: '2025-06-17T16:00:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'submitted', fromStatus: 'draft', toStatus: 'pending_approval' },
      { id: 'SPL-001H-3', timestamp: '2025-06-18T09:00:00', actor: 'Lê Thị Mai', actorRole: 'Phòng Logistics - Kỹ thuật', action: 'approved', fromStatus: 'pending_approval', toStatus: 'approved' },
      { id: 'SPL-001H-4', timestamp: '2025-06-18T09:30:00', actor: 'System', actorRole: 'Hệ thống', action: 'applied', fromStatus: 'approved', toStatus: 'applied' },
      { id: 'SPL-001H-5', timestamp: '2026-01-01T00:00:00', actor: 'System', actorRole: 'Hệ thống', action: 'superseded', note: 'Thay thế bởi SP-2026-001 v2' },
    ],
  },

  // ─── SP-2026-002 — PRD-002 Máy phát cao tần (applied, v1) ────────────────────
  {
    id: 'SPR-002',
    code: 'SP-2026-002',
    productId: 'PRD-002',
    productCode: 'RD-MPH-001',
    productName: 'Máy phát cao tần cụm monitoring 36D6',
    status: 'applied',
    version: 1,
    minStock: 2,
    maxStock: 8,
    reorderPoint: 3,
    effectiveFrom: '2025-05-27',
    changeReason: 'Thiết lập tham số tồn kho ban đầu cho thiết bị monitoring 36D6.',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2025-05-27T09:30:00',
    approvedBy: 'Lê Thị Mai',
    approvedAt: '2025-05-28T08:00:00',
    approvalNote: 'Duyệt.',
    appliedAt: '2025-05-28T08:30:00',
    createdBy: 'Hoàng Minh Tuấn',
    createdAt: '2025-05-27T09:30:00',
    updatedAt: '2025-05-28T08:30:00',
    auditLog: [
      { id: 'SPL-002-1', timestamp: '2025-05-27T09:30:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'created', toStatus: 'draft' },
      { id: 'SPL-002-2', timestamp: '2025-05-27T10:00:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'submitted', fromStatus: 'draft', toStatus: 'pending_approval' },
      { id: 'SPL-002-3', timestamp: '2025-05-28T08:00:00', actor: 'Lê Thị Mai', actorRole: 'Phòng Logistics - Kỹ thuật', action: 'approved', fromStatus: 'pending_approval', toStatus: 'approved' },
      { id: 'SPL-002-4', timestamp: '2025-05-28T08:30:00', actor: 'System', actorRole: 'Hệ thống', action: 'applied', fromStatus: 'approved', toStatus: 'applied' },
    ],
  },

  // ─── SP-2026-003 — PRD-003 (pending_approval — chờ duyệt điều chỉnh) ─────────
  {
    id: 'SPR-003',
    code: 'SP-2026-003',
    productId: 'PRD-003',
    productCode: 'RD-ATX-001',
    productName: 'Anten thu phát monitoring P-37',
    status: 'pending_approval',
    version: 2,
    minStock: 3,
    maxStock: 15,
    reorderPoint: 5,
    effectiveFrom: '2026-05-01',
    changeReason: 'Tăng mức tối thiểu từ 2 lên 3 và tối đa từ 10 lên 15 do Trung tâm 285 mở rộng biên chế monitoring P-37.',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2026-04-10T08:30:00',
    approvedBy: null,
    approvedAt: null,
    approvalNote: null,
    appliedAt: null,
    createdBy: 'Hoàng Minh Tuấn',
    createdAt: '2026-04-10T08:00:00',
    updatedAt: '2026-04-10T08:30:00',
    auditLog: [
      { id: 'SPL-003-1', timestamp: '2026-04-10T08:00:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'created', toStatus: 'draft' },
      { id: 'SPL-003-2', timestamp: '2026-04-10T08:30:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'submitted', fromStatus: 'draft', toStatus: 'pending_approval', note: 'Đề xuất điều chỉnh theo nhu cầu mới của Trung tâm 285', newValues: { minStock: 3, maxStock: 15, reorderPoint: 5 }, oldValues: { minStock: 2, maxStock: 10, reorderPoint: 4 } },
    ],
  },

  // ─── SP-2026-003 v1 (đang applied — sẽ bị thay thế khi v2 được duyệt) ────────
  {
    id: 'SPR-003-H',
    code: 'SP-2025-003',
    productId: 'PRD-003',
    productCode: 'RD-ATX-001',
    productName: 'Anten thu phát monitoring P-37',
    status: 'applied',
    version: 1,
    minStock: 2,
    maxStock: 10,
    reorderPoint: 4,
    effectiveFrom: '2025-08-01',
    changeReason: 'Thiết lập tham số ban đầu.',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2025-07-28T10:00:00',
    approvedBy: 'Lê Thị Mai',
    approvedAt: '2025-07-29T09:00:00',
    approvalNote: 'Duyệt.',
    appliedAt: '2025-08-01T00:00:00',
    createdBy: 'Hoàng Minh Tuấn',
    createdAt: '2025-07-28T10:00:00',
    updatedAt: '2025-08-01T00:00:00',
    auditLog: [
      { id: 'SPL-003H-1', timestamp: '2025-07-28T10:00:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'created', toStatus: 'draft' },
      { id: 'SPL-003H-2', timestamp: '2025-07-28T10:30:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'submitted', fromStatus: 'draft', toStatus: 'pending_approval' },
      { id: 'SPL-003H-3', timestamp: '2025-07-29T09:00:00', actor: 'Lê Thị Mai', actorRole: 'Phòng Logistics - Kỹ thuật', action: 'approved', fromStatus: 'pending_approval', toStatus: 'approved' },
      { id: 'SPL-003H-4', timestamp: '2025-08-01T00:00:00', actor: 'System', actorRole: 'Hệ thống', action: 'applied', fromStatus: 'approved', toStatus: 'applied' },
    ],
  },

  // ─── SP-2026-004 — PRD-015 Dầu khoáng HM46 (draft) ──────────────────────────
  {
    id: 'SPR-004',
    code: 'SP-2026-004',
    productId: 'PRD-015',
    productCode: 'VT-DK-001',
    productName: 'Dầu khoáng thủy lực HM46',
    status: 'draft',
    version: 2,
    minStock: 60,
    maxStock: 500,
    reorderPoint: 120,
    effectiveFrom: '2026-05-01',
    changeReason: 'Tăng mức tối thiểu từ 50 lên 60 do mùa bảo dưỡng thiết bị thủy lực tháng 5.',
    submittedBy: null,
    submittedAt: null,
    approvedBy: null,
    approvedAt: null,
    approvalNote: null,
    appliedAt: null,
    createdBy: 'Hoàng Minh Tuấn',
    createdAt: '2026-04-12T14:00:00',
    updatedAt: '2026-04-12T14:00:00',
    auditLog: [
      { id: 'SPL-004-1', timestamp: '2026-04-12T14:00:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'created', toStatus: 'draft' },
    ],
  },

  // ─── SP-2026-004 v1 (applied) ─────────────────────────────────────────────────
  {
    id: 'SPR-004-H',
    code: 'SP-2025-004',
    productId: 'PRD-015',
    productCode: 'VT-DK-001',
    productName: 'Dầu khoáng thủy lực HM46',
    status: 'applied',
    version: 1,
    minStock: 50,
    maxStock: 500,
    reorderPoint: 100,
    effectiveFrom: '2025-09-16',
    changeReason: 'Thiết lập tham số ban đầu.',
    submittedBy: 'Hoàng Minh Tuấn',
    submittedAt: '2025-09-15T10:30:00',
    approvedBy: 'Lê Thị Mai',
    approvedAt: '2025-09-16T07:30:00',
    approvalNote: 'Duyệt.',
    appliedAt: '2025-09-16T08:30:00',
    createdBy: 'Hoàng Minh Tuấn',
    createdAt: '2025-09-15T10:30:00',
    updatedAt: '2025-09-16T08:30:00',
    auditLog: [
      { id: 'SPL-004H-1', timestamp: '2025-09-15T10:30:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'created', toStatus: 'draft' },
      { id: 'SPL-004H-2', timestamp: '2025-09-15T11:00:00', actor: 'Hoàng Minh Tuấn', actorRole: 'Phòng Kế hoạch', action: 'submitted', fromStatus: 'draft', toStatus: 'pending_approval' },
      { id: 'SPL-004H-3', timestamp: '2025-09-16T07:30:00', actor: 'Lê Thị Mai', actorRole: 'Phòng Logistics - Kỹ thuật', action: 'approved', fromStatus: 'pending_approval', toStatus: 'approved' },
      { id: 'SPL-004H-4', timestamp: '2025-09-16T08:30:00', actor: 'System', actorRole: 'Hệ thống', action: 'applied', fromStatus: 'approved', toStatus: 'applied' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────

/** Lấy tham số đang applied (hiện hành) của một sản phẩm */
export const getAppliedStockParameter = (productId: string): StockParameterRecord | null => {
  const applied = stockParameters.filter(
    r => r.productId === productId && r.status === 'applied'
  );
  if (applied.length === 0) return null;
  // Lấy version cao nhất đang applied
  return applied.reduce((latest, r) => r.version > latest.version ? r : latest);
};

/** Toàn bộ lịch sử tham số của một sản phẩm, mới nhất trước */
export const getStockParameterHistory = (productId: string): StockParameterRecord[] => {
  return stockParameters
    .filter(r => r.productId === productId)
    .sort((a, b) => b.version - a.version);
};

/** Tham số đang chờ duyệt của một sản phẩm (nếu có) */
export const getPendingStockParameter = (productId: string): StockParameterRecord | null => {
  return stockParameters.find(
    r => r.productId === productId &&
      (r.status === 'draft' || r.status === 'pending_approval')
  ) || null;
};
