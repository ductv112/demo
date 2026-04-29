import dayjs from 'dayjs';

export function formatDateTime(date: string): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export function formatDate(date: string): string {
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatTimeAgo(date: string): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = now.diff(target, 'hour');
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = now.diff(target, 'day');
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return formatDate(date);
}

export const statusConfig = {
  active: { label: 'Hoạt động', color: 'success' },
  inactive: { label: 'Vô hiệu', color: 'default' },
  locked: { label: 'Đã khóa', color: 'error' },
  expired: { label: 'Hết hạn', color: 'warning' },
  revoked: { label: 'Thu hồi', color: 'error' },
} as const;

export const actionConfig = {
  login: { label: 'Đăng nhập', color: 'success' },
  logout: { label: 'Đăng xuất', color: 'default' },
  switch_app: { label: 'Chuyển app', color: 'processing' },
  failed_login: { label: 'Đăng nhập lỗi', color: 'error' },
  password_change: { label: 'Đổi mật khẩu', color: 'warning' },
  role_change: { label: 'Thay đổi quyền', color: 'purple' },
  lock_account: { label: 'Khóa tài khoản', color: 'error' },
} as const;

export const permissionConfig = {
  none: { label: '—', color: 'default' },
  view: { label: 'Xem', color: 'processing' },
  edit: { label: 'Sửa', color: 'warning' },
  approve: { label: 'Duyệt', color: 'success' },
  full: { label: 'Toàn quyền', color: 'error' },
} as const;
