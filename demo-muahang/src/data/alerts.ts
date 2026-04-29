import type { Alert, MonthlyProcurement } from '../types';

export const alerts: Alert[] = [
  {
    id: 'ALR-001', type: 'late_delivery', severity: 'critical',
    title: 'Chậm giao hàng đợt 2 - HD-2026-001',
    description: 'Trung tâm phần mềm Alpha chưa giao module ERP Finance (đợt 2), quá hạn 3 ngày so với kế hoạch 25/03/2026',
    relatedEntity: 'contract', relatedEntityId: 'CT-001', departmentId: 'PHCKT',
    createdAt: '2026-03-28', isRead: false, isResolved: false,
  },
  {
    id: 'ALR-002', type: 'material_shortage', severity: 'warning',
    title: 'DevOps Toolkit chưa đặt hàng',
    description: 'Bộ công cụ DevOps Toolkit cho nâng cấp hệ thống P-37 chưa được đưa vào gói thầu, nguy cơ chậm tiến độ nhiệm vụ',
    relatedEntity: 'supply_plan', relatedEntityId: 'SP-003', departmentId: 'PHCKT',
    createdAt: '2026-03-25', isRead: false, isResolved: false,
  },
  {
    id: 'ALR-003', type: 'qc_failed', severity: 'warning',
    title: '3 license không đạt chất lượng',
    description: '3/25 license M365 từ Microsoft không kích hoạt được, đã trả lại NCC',
    relatedEntity: 'receiving', relatedEntityId: 'RCV-002', departmentId: 'PKCDB',
    createdAt: '2026-02-27', isRead: true, isResolved: false,
  },
  {
    id: 'ALR-004', type: 'payment_due', severity: 'info',
    title: 'Thanh toán hợp đồng HD-2026-003 sắp đến hạn',
    description: 'Thanh toán đợt 2 (50%) hợp đồng mua laptop Dell sẽ đến hạn sau khi giao hàng',
    relatedEntity: 'payment', relatedEntityId: 'PAY-003', departmentId: 'PTCKT',
    createdAt: '2026-03-30', isRead: false, isResolved: false,
  },
  {
    id: 'ALR-005', type: 'contract_risk', severity: 'warning',
    title: 'Hợp đồng HD-2026-001 có nguy cơ vi phạm',
    description: 'Tiến độ thực hiện mới đạt 37.7%, thời hạn HĐ còn 2 ngày. NCC cần đẩy nhanh giao đợt 2',
    relatedEntity: 'contract', relatedEntityId: 'CT-001', departmentId: 'PHCKT',
    createdAt: '2026-03-28', isRead: false, isResolved: false,
  },
  {
    id: 'ALR-006', type: 'budget_overrun', severity: 'info',
    title: 'Biến động giá license M365 tăng 11%',
    description: 'Giá license Microsoft 365 tăng từ 1.8 tr (2024) lên 2.0 tr (2026), tăng 11% trong 2 năm',
    relatedEntity: 'price_history', relatedEntityId: 'M001',
    createdAt: '2026-03-15', isRead: true, isResolved: false,
  },
  {
    id: 'ALR-007', type: 'material_shortage', severity: 'critical',
    title: 'Server 36D6 chưa có NCC phù hợp',
    description: 'Gói thầu GT-2026-004 đang đánh giá, cần sớm chọn NCC để đảm bảo tiến độ nâng cấp hệ thống 36D6',
    relatedEntity: 'bidding', relatedEntityId: 'BID-004', departmentId: 'PHCKT',
    createdAt: '2026-03-25', isRead: false, isResolved: false,
  },
];

export const monthlyProcurement: MonthlyProcurement[] = [
  { month: 'T1', ordered: 120, received: 0, paid: 0 },
  { month: 'T2', ordered: 350, received: 58, paid: 0 },
  { month: 'T3', ordered: 280, received: 290, paid: 420.5 },
  { month: 'T4', ordered: 0, received: 0, paid: 0 },
  { month: 'T5', ordered: 0, received: 0, paid: 0 },
  { month: 'T6', ordered: 0, received: 0, paid: 0 },
];
