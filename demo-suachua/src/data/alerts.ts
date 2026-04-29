import type { Alert } from '../types';

export const alerts: Alert[] = [
  {
    id: 'ALT001', type: 'overdue', severity: 'critical',
    title: 'Lệnh SC chậm tiến độ', description: 'LSC-2026-002 (Đài radar 36D6) đã vượt thời hạn dự kiến 5 ngày',
    relatedId: 'WO002', relatedCode: 'LSC-2026-002',
    createdDate: '2026-03-05', isRead: false, isResolved: false,
  },
  {
    id: 'ALT002', type: 'pending_approval', severity: 'warning',
    title: 'Lệnh SC chờ phê duyệt', description: 'LSC-2026-006 (Đài radar P-18 - hiện trường) đang chờ phê duyệt từ Ban Giám đốc',
    relatedId: 'WO006', relatedCode: 'LSC-2026-006',
    createdDate: '2026-03-12', isRead: false, isResolved: false,
  },
  {
    id: 'ALT003', type: 'over_budget', severity: 'warning',
    title: 'Vượt dự toán chi phí', description: 'LSC-2026-003 (S-125 Pechora) chi phí thực tế đạt 93% dự toán',
    relatedId: 'WO003', relatedCode: 'LSC-2026-003',
    createdDate: '2026-03-01', isRead: true, isResolved: false,
  },
  {
    id: 'ALT004', type: 'recurring_failure', severity: 'warning',
    title: 'Lỗi lặp lại', description: 'Đài radar 36D6 (EQ-RDR-002) có lỗi lặp lại lần thứ 2 trong 12 tháng - suy giảm bộ thu',
    relatedId: 'RR002', relatedCode: 'YCSC-2026-002',
    createdDate: '2026-01-20', isRead: true, isResolved: false,
  },
  {
    id: 'ALT005', type: 'recurring_failure', severity: 'info',
    title: 'Lỗi lặp lại', description: 'Hệ thống S-125 (EQ-MSL-001) có lỗi lặp lại - lỗi hệ thống điều khiển',
    relatedId: 'RR003', relatedCode: 'YCSC-2026-003',
    createdDate: '2026-01-25', isRead: false, isResolved: false,
  },
  {
    id: 'ALT006', type: 'overdue', severity: 'warning',
    title: 'Sắp đến hạn sửa chữa', description: 'LSC-2026-005 (Đài radar P-37) còn 5 ngày đến hạn, tiến độ mới đạt 45%',
    relatedId: 'WO005', relatedCode: 'LSC-2026-005',
    createdDate: '2026-03-15', isRead: false, isResolved: false,
  },
  {
    id: 'ALT007', type: 'pending_approval', severity: 'info',
    title: 'Lệnh SC nháp mới', description: 'LSC-2026-007 (S-125 Pechora bổ sung) đang ở trạng thái nháp, chưa gửi phê duyệt',
    relatedId: 'WO007', relatedCode: 'LSC-2026-007',
    createdDate: '2026-03-15', isRead: false, isResolved: false,
  },
  {
    id: 'ALT008', type: 'over_budget', severity: 'critical',
    title: 'Vượt dự toán', description: 'Tổng chi phí sửa chữa Q1/2026 đạt 88% kế hoạch năm, cần xem xét điều chỉnh',
    relatedId: '', relatedCode: '',
    createdDate: '2026-03-20', isRead: false, isResolved: false,
  },
];
