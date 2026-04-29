import type { ApprovalRequest, CostVersion, NegotiationLog, AuditLog } from '../types';

// ─── Cost Versions ──────────────────────────────────────────
export const costVersions: CostVersion[] = [
  // DX-001: 2 versions (gốc + sau thẩm định)
  {
    id: 'CV-001-V1', proposalId: 'DX-001', version: 1, type: 'original',
    materialCost: 995, laborCost: 200, equipmentCost: 150, overheadCost: 155,
    totalCost: 1500, proposedPrice: 1650,
    createdBy: 'U001', createdAt: '2026-01-25', note: 'Dự toán gốc',
  },
  {
    id: 'CV-001-V2', proposalId: 'DX-001', version: 2, type: 'review',
    materialCost: 950, laborCost: 200, equipmentCost: 150, overheadCost: 150,
    totalCost: 1450, proposedPrice: 1600,
    createdBy: 'U-TCKT', createdAt: '2026-01-28', note: 'Điều chỉnh CP vật tư giảm 45tr sau thẩm định',
  },
  // DX-004: 2 versions
  {
    id: 'CV-004-V1', proposalId: 'DX-004', version: 1, type: 'original',
    materialCost: 1800, laborCost: 450, equipmentCost: 300, overheadCost: 450,
    totalCost: 3000, proposedPrice: 3300,
    createdBy: 'U001', createdAt: '2026-03-05', note: 'Dự toán gốc',
  },
  {
    id: 'CV-004-V2', proposalId: 'DX-004', version: 2, type: 'review',
    materialCost: 1750, laborCost: 430, equipmentCost: 280, overheadCost: 440,
    totalCost: 2900, proposedPrice: 3200,
    createdBy: 'U-TCKT', createdAt: '2026-03-12', note: 'Giảm CP thiết bị đo, điều chỉnh nhân công',
  },
  // DX-005: 1 version (không điều chỉnh)
  {
    id: 'CV-005-V1', proposalId: 'DX-005', version: 1, type: 'original',
    materialCost: 480, laborCost: 150, equipmentCost: 0, overheadCost: 170,
    totalCost: 800, proposedPrice: 880,
    createdBy: 'U001', createdAt: '2026-03-15', note: 'Dự toán gốc',
  },
  // DX-006: 1 version (đã thẩm định OK)
  {
    id: 'CV-006-V1', proposalId: 'DX-006', version: 1, type: 'original',
    materialCost: 200, laborCost: 350, equipmentCost: 320, overheadCost: 130,
    totalCost: 1000, proposedPrice: 1100,
    createdBy: 'U001', createdAt: '2026-04-08', note: 'Dự toán gốc',
  },
  // DX-007: 1 version (chờ thẩm định)
  {
    id: 'CV-007-V1', proposalId: 'DX-007', version: 1, type: 'original',
    materialCost: 580, laborCost: 100, equipmentCost: 0, overheadCost: 70,
    totalCost: 750, proposedPrice: 825,
    createdBy: 'U001', createdAt: '2026-04-05', note: 'Dự toán gốc',
  },
];

// ─── Approval Requests ──────────────────────────────────────
export const approvalRequests: ApprovalRequest[] = [
  // DX-001: Đã qua full flow
  {
    id: 'AR-001-1', proposalId: 'DX-001', type: 'cost_review',
    fromRole: 'PKH', toRole: 'TCKT', status: 'approved',
    submittedBy: 'U001', submittedAt: '2026-01-26',
    reviewedBy: 'U-TCKT', reviewedAt: '2026-01-28',
    comment: 'Đồng ý, điều chỉnh giảm CP vật tư 45tr',
    costVersionId: 'CV-001-V2',
  },
  {
    id: 'AR-001-2', proposalId: 'DX-001', type: 'approval',
    fromRole: 'PKH', toRole: 'BGD', status: 'approved',
    submittedBy: 'U001', submittedAt: '2026-01-29',
    reviewedBy: 'U003', reviewedAt: '2026-01-30',
    comment: 'Đồng ý phương án và dự toán sau thẩm định',
  },
  // DX-004: Đã duyệt, đang đàm phán
  {
    id: 'AR-004-1', proposalId: 'DX-004', type: 'cost_review',
    fromRole: 'PKH', toRole: 'TCKT', status: 'approved',
    submittedBy: 'U001', submittedAt: '2026-03-08',
    reviewedBy: 'U-TCKT', reviewedAt: '2026-03-12',
    comment: 'Điều chỉnh giảm CP thiết bị và nhân công',
    costVersionId: 'CV-004-V2',
  },
  {
    id: 'AR-004-2', proposalId: 'DX-004', type: 'approval',
    fromRole: 'PKH', toRole: 'BGD', status: 'approved',
    submittedBy: 'U001', submittedAt: '2026-03-15',
    reviewedBy: 'U003', reviewedAt: '2026-03-18',
    comment: 'Phê duyệt. Lưu ý đàm phán giá với khách hàng',
  },
  // DX-005: Chờ BGĐ phê duyệt (bước 5)
  {
    id: 'AR-005-1', proposalId: 'DX-005', type: 'cost_review',
    fromRole: 'PKH', toRole: 'TCKT', status: 'approved',
    submittedBy: 'U001', submittedAt: '2026-03-05',
    reviewedBy: 'U-TCKT', reviewedAt: '2026-03-08',
    comment: 'Chi phí hợp lý, không cần điều chỉnh',
  },
  {
    id: 'AR-005-2', proposalId: 'DX-005', type: 'approval',
    fromRole: 'PKH', toRole: 'BGD', status: 'pending',
    submittedBy: 'U001', submittedAt: '2026-03-20',
    comment: 'Kính trình BGĐ phê duyệt phương án bảo trì hệ thống monitoring ST-68',
  },
  // DX-006: TC đã thẩm định, chờ trình BGĐ (bước 4)
  {
    id: 'AR-006-1', proposalId: 'DX-006', type: 'cost_review',
    fromRole: 'PKH', toRole: 'TCKT', status: 'approved',
    submittedBy: 'U001', submittedAt: '2026-04-09',
    reviewedBy: 'U-TCKT', reviewedAt: '2026-04-11',
    comment: 'Đã thẩm định, đồng ý dự toán nghiên cứu S-300PMU',
  },
  // DX-007: Chờ thẩm định TC
  {
    id: 'AR-007-1', proposalId: 'DX-007', type: 'cost_review',
    fromRole: 'PKH', toRole: 'TCKT', status: 'pending',
    submittedBy: 'U001', submittedAt: '2026-04-06',
    comment: 'Đề nghị thẩm định chi phí bảo trì module triển khai SA-3',
  },
];

// ─── Negotiation Logs ───────────────────────────────────────
export const negotiationLogs: NegotiationLog[] = [
  {
    id: 'NL-001', proposalId: 'DX-004', type: 'note',
    content: 'Liên hệ Ban TGĐ Doanh nghiệp A để thống nhất phạm vi và tiến độ cung cấp bộ chuyển đổi A/D',
    createdBy: 'U001', createdAt: '2026-03-20',
  },
  {
    id: 'NL-002', proposalId: 'DX-004', type: 'meeting',
    content: 'Họp với đại diện Ban TGĐ tại Trung tâm phần mềm Alpha. Thống nhất: giao 5 bộ trong 10 tháng, tạm ứng 30%',
    createdBy: 'U001', createdAt: '2026-03-25',
  },
  {
    id: 'NL-003', proposalId: 'DX-004', type: 'price_change',
    content: 'Điều chỉnh giá đề xuất từ 3.200tr xuống 3.150tr theo kết quả đàm phán',
    createdBy: 'U001', createdAt: '2026-03-28',
  },
];

// ─── Audit Logs ─────────────────────────────────────────────
export const auditLogs: AuditLog[] = [
  // DX-007 flow
  { id: 'AL-01', entityType: 'proposal', entityId: 'DX-007', action: 'Tạo đề xuất', oldValue: '', newValue: 'draft', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-04-05 09:00' },
  { id: 'AL-02', entityType: 'proposal', entityId: 'DX-007', action: 'Trình duyệt', oldValue: 'draft', newValue: 'submitted', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-04-05 14:30' },
  { id: 'AL-03', entityType: 'proposal', entityId: 'DX-007', action: 'Gửi thẩm định TC', oldValue: 'submitted', newValue: 'pending_cost_review', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-04-06 10:00' },
  // DX-005: Chờ BGĐ duyệt
  { id: 'AL-05', entityType: 'proposal', entityId: 'DX-005', action: 'Tạo đề xuất', oldValue: '', newValue: 'draft', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-03-01 09:00' },
  { id: 'AL-06', entityType: 'proposal', entityId: 'DX-005', action: 'TC thẩm định đạt', oldValue: 'pending_cost_review', newValue: 'cost_reviewed', performedBy: 'P. Tài chính Kế toán', performedAt: '2026-03-08 15:00' },
  { id: 'AL-07', entityType: 'proposal', entityId: 'DX-005', action: 'Trình BGĐ phê duyệt', oldValue: 'cost_reviewed', newValue: 'pending_approval', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-03-20 10:00' },
  // DX-006: Chờ trình BGĐ
  { id: 'AL-08', entityType: 'proposal', entityId: 'DX-006', action: 'Tạo đề xuất', oldValue: '', newValue: 'draft', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-04-08 08:30' },
  { id: 'AL-09', entityType: 'proposal', entityId: 'DX-006', action: 'Gửi thẩm định TC', oldValue: 'submitted', newValue: 'pending_cost_review', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-04-09 09:00' },
  { id: 'AL-09b', entityType: 'proposal', entityId: 'DX-006', action: 'TC thẩm định đạt', oldValue: 'cost_reviewing', newValue: 'cost_reviewed', performedBy: 'P. Tài chính Kế toán', performedAt: '2026-04-11 16:00' },
  // DX-004 full flow
  { id: 'AL-10', entityType: 'proposal', entityId: 'DX-004', action: 'Tạo đề xuất', oldValue: '', newValue: 'draft', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-03-05 08:30' },
  { id: 'AL-11', entityType: 'proposal', entityId: 'DX-004', action: 'Trình duyệt', oldValue: 'draft', newValue: 'submitted', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-03-06 09:00' },
  { id: 'AL-12', entityType: 'proposal', entityId: 'DX-004', action: 'Gửi thẩm định TC', oldValue: 'submitted', newValue: 'pending_cost_review', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-03-08 10:00' },
  { id: 'AL-13', entityType: 'proposal', entityId: 'DX-004', action: 'TC bắt đầu thẩm định', oldValue: 'pending_cost_review', newValue: 'cost_reviewing', performedBy: 'P. Tài chính Kế toán', performedAt: '2026-03-09 08:00' },
  { id: 'AL-14', entityType: 'proposal', entityId: 'DX-004', action: 'TC hoàn thành thẩm định — Điều chỉnh giảm CP', oldValue: 'cost_reviewing', newValue: 'cost_reviewed', performedBy: 'P. Tài chính Kế toán', performedAt: '2026-03-12 16:00' },
  { id: 'AL-15', entityType: 'proposal', entityId: 'DX-004', action: 'Trình BGĐ phê duyệt', oldValue: 'cost_reviewed', newValue: 'pending_approval', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-03-15 09:00' },
  { id: 'AL-16', entityType: 'proposal', entityId: 'DX-004', action: 'BGĐ phê duyệt', oldValue: 'pending_approval', newValue: 'approved', performedBy: 'Phạm Quốc Hưng', performedAt: '2026-03-18 14:00' },
  { id: 'AL-17', entityType: 'proposal', entityId: 'DX-004', action: 'Bắt đầu đàm phán', oldValue: 'approved', newValue: 'negotiating', performedBy: 'Hoàng Minh Tuấn', performedAt: '2026-03-20 10:00' },
];

// ─── Helpers ────────────────────────────────────────────────
export const getCostVersionsByProposal = (proposalId: string) =>
  costVersions.filter(cv => cv.proposalId === proposalId).sort((a, b) => a.version - b.version);

export const getApprovalsByProposal = (proposalId: string) =>
  approvalRequests.filter(ar => ar.proposalId === proposalId).sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

export const getNegotiationsByProposal = (proposalId: string) =>
  negotiationLogs.filter(nl => nl.proposalId === proposalId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getAuditLogsByEntity = (entityId: string) =>
  auditLogs.filter(al => al.entityId === entityId).sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
