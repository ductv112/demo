import type { Session } from '../types';

export const sessions: Session[] = [
  {
    id: 'S001', userId: 'U01', userName: 'Phạm Quốc Hưng', department: 'Ban Giám đốc',
    ip: '10.119.1.10', browser: 'Chrome 124 / Windows 11',
    loginTime: '2026-04-01T08:15:00', lastActivity: '2026-04-01T09:42:00',
    status: 'active', currentApp: 'pkkq-portal',
  },
  {
    id: 'S002', userId: 'U04', userName: 'Hoàng Minh Tuấn', department: 'Phòng Kế hoạch',
    ip: '10.119.2.15', browser: 'Chrome 124 / Windows 11',
    loginTime: '2026-04-01T08:00:00', lastActivity: '2026-04-01T09:38:00',
    status: 'active', currentApp: 'pkkq-hopdongnhiemvu',
  },
  {
    id: 'S003', userId: 'U05', userName: 'Vũ Thị Lan Anh', department: 'Phòng Tài chính - Kế toán',
    ip: '10.119.2.20', browser: 'Firefox 126 / Windows 11',
    loginTime: '2026-04-01T07:45:00', lastActivity: '2026-04-01T09:40:00',
    status: 'active', currentApp: 'pkkq-taichinhketoan',
  },
  {
    id: 'S004', userId: 'U06', userName: 'Đỗ Quang Minh', department: 'Phòng Kỹ thuật',
    ip: '10.119.3.10', browser: 'Chrome 124 / Windows 11',
    loginTime: '2026-04-01T08:10:00', lastActivity: '2026-04-01T09:35:00',
    status: 'active', currentApp: 'pkkq-sanxuat',
  },
  {
    id: 'S005', userId: 'U14', userName: 'Lê Quang Huy', department: 'TT Phần mềm Alpha',
    ip: '10.119.4.22', browser: 'Edge 124 / Windows 10',
    loginTime: '2026-04-01T07:20:00', lastActivity: '2026-04-01T09:30:00',
    status: 'active', currentApp: 'pkkq-suachua',
  },
  {
    id: 'S006', userId: 'U17', userName: 'Ngô Đức Thắng', department: 'Phòng Kỹ thuật',
    ip: '10.119.3.5', browser: 'Chrome 124 / Windows 11',
    loginTime: '2026-04-01T07:00:00', lastActivity: '2026-04-01T09:45:00',
    status: 'active', currentApp: 'pkkq-sso',
  },
  {
    id: 'S007', userId: 'U12', userName: 'Nguyễn Thị Minh', department: 'Phòng Kế hoạch',
    ip: '10.119.2.18', browser: 'Chrome 124 / Windows 11',
    loginTime: '2026-04-01T08:20:00', lastActivity: '2026-04-01T09:15:00',
    status: 'active', currentApp: 'pkkq-hopdongnhiemvu',
  },
  {
    id: 'S008', userId: 'U02', userName: 'Nguyễn Văn Thành', department: 'Ban Giám đốc',
    ip: '10.119.1.11', browser: 'Chrome 124 / Windows 11',
    loginTime: '2026-04-01T07:50:00', lastActivity: '2026-04-01T08:30:00',
    status: 'expired',
  },
  {
    id: 'S009', userId: 'U08', userName: 'Trần Văn Dũng', department: 'TT Phần mềm Alpha',
    ip: '10.119.4.10', browser: 'Firefox 126 / Windows 10',
    loginTime: '2026-03-31T14:00:00', lastActivity: '2026-03-31T17:20:00',
    status: 'expired',
  },
  {
    id: 'S010', userId: 'U19', userName: 'Hoàng Văn Nam', department: 'TT Vận hành',
    ip: '10.119.4.30', browser: 'Chrome 123 / Windows 10',
    loginTime: '2026-03-20T09:00:00', lastActivity: '2026-03-20T09:05:00',
    status: 'revoked',
  },
];
