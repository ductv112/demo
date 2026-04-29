import type { AuditLogEntry } from '../types';

export const auditLog: AuditLogEntry[] = [
  { id: 'AL01', userId: 'U17', userName: 'Ngô Đức Thắng', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.3.5', timestamp: '2026-04-01T07:00:00', status: 'success' },
  { id: 'AL02', userId: 'U14', userName: 'Lê Quang Huy', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.4.22', timestamp: '2026-04-01T07:20:00', status: 'success' },
  { id: 'AL03', userId: 'U08', userName: 'Trần Văn Dũng', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.4.10', timestamp: '2026-04-01T07:25:00', status: 'success' },
  { id: 'AL04', userId: 'U05', userName: 'Vũ Thị Lan Anh', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.2.20', timestamp: '2026-04-01T07:45:00', status: 'success' },
  { id: 'AL05', userId: 'U02', userName: 'Nguyễn Văn Thành', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.1.11', timestamp: '2026-04-01T07:50:00', status: 'success' },
  { id: 'AL06', userId: 'U04', userName: 'Hoàng Minh Tuấn', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.2.15', timestamp: '2026-04-01T08:00:00', status: 'success' },
  { id: 'AL07', userId: 'U04', userName: 'Hoàng Minh Tuấn', action: 'switch_app', detail: 'Chuyển sang pkkq-hopdongnhiemvu', ip: '10.119.2.15', timestamp: '2026-04-01T08:02:00', status: 'success' },
  { id: 'AL08', userId: 'U10', userName: 'Lý Thành Công', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.2.16', timestamp: '2026-04-01T08:05:00', status: 'success' },
  { id: 'AL09', userId: 'U06', userName: 'Đỗ Quang Minh', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.3.10', timestamp: '2026-04-01T08:10:00', status: 'success' },
  { id: 'AL10', userId: 'U01', userName: 'Phạm Quốc Hưng', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.1.10', timestamp: '2026-04-01T08:15:00', status: 'success' },
  { id: 'AL11', userId: 'U12', userName: 'Nguyễn Thị Minh', action: 'login', detail: 'Đăng nhập hệ thống SSO', ip: '10.119.2.18', timestamp: '2026-04-01T08:20:00', status: 'success' },
  { id: 'AL12', userId: 'U05', userName: 'Vũ Thị Lan Anh', action: 'switch_app', detail: 'Chuyển sang pkkq-taichinhketoan', ip: '10.119.2.20', timestamp: '2026-04-01T08:25:00', status: 'success' },
  { id: 'AL13', userId: 'U02', userName: 'Nguyễn Văn Thành', action: 'logout', detail: 'Đăng xuất (hết phiên)', ip: '10.119.1.11', timestamp: '2026-04-01T08:30:00', status: 'success' },
  { id: 'AL14', userId: 'U19', userName: 'Hoàng Văn Nam', action: 'failed_login', detail: 'Sai mật khẩu (lần 3) — tài khoản bị khóa tự động', ip: '10.119.4.30', timestamp: '2026-03-20T09:05:00', status: 'failure' },
  { id: 'AL15', userId: 'U17', userName: 'Ngô Đức Thắng', action: 'lock_account', detail: 'Khóa tài khoản ktvpx4 (Hoàng Văn Nam) — vi phạm chính sách bảo mật', ip: '10.119.3.5', timestamp: '2026-03-20T10:00:00', status: 'success' },
  { id: 'AL16', userId: 'U17', userName: 'Ngô Đức Thắng', action: 'role_change', detail: 'Cập nhật quyền U18 (Nguyễn Đức Anh) → inactive', ip: '10.119.3.5', timestamp: '2026-03-15T14:00:00', status: 'success' },
  { id: 'AL17', userId: 'U01', userName: 'Phạm Quốc Hưng', action: 'password_change', detail: 'Đổi mật khẩu định kỳ', ip: '10.119.1.10', timestamp: '2026-03-10T09:30:00', status: 'success' },
  { id: 'AL18', userId: 'U19', userName: 'Hoàng Văn Nam', action: 'failed_login', detail: 'Sai mật khẩu (lần 2)', ip: '10.119.4.30', timestamp: '2026-03-20T09:03:00', status: 'failure' },
  { id: 'AL19', userId: 'U19', userName: 'Hoàng Văn Nam', action: 'failed_login', detail: 'Sai mật khẩu (lần 1)', ip: '10.119.4.30', timestamp: '2026-03-20T09:01:00', status: 'failure' },
  { id: 'AL20', userId: 'U06', userName: 'Đỗ Quang Minh', action: 'switch_app', detail: 'Chuyển sang pkkq-sanxuat', ip: '10.119.3.10', timestamp: '2026-04-01T08:12:00', status: 'success' },
];
