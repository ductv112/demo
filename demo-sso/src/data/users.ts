import type { SSOUser } from '../types';

export const users: SSOUser[] = [
  {
    id: 'U01', username: 'giamdoc', password: '123456', fullName: 'Phạm Quốc Hưng',
    rank: 'Tổng Giám đốc', position: 'Tổng Giám đốc', departmentId: 'BGD', departmentName: 'Ban Giám đốc',
    email: 'hungpq@dnA.com.vn', phone: '0912-345-001', roleId: 'R01', status: 'inactive',
    lastLogin: '2026-04-01T08:15:00', createdAt: '2024-01-15',
  },
  {
    id: 'U02', username: 'pgdkt', password: '123456', fullName: 'Nguyễn Văn Thành',
    rank: 'Phó TGĐ', position: 'Phó Tổng Giám đốc Kỹ thuật', departmentId: 'BGD', departmentName: 'Ban Giám đốc',
    email: 'thanhnv@dnA.com.vn', phone: '0912-345-002', roleId: 'R01', status: 'inactive',
    lastLogin: '2026-04-01T07:50:00', createdAt: '2024-01-15',
  },
  {
    id: 'U03', username: 'pgdhc', password: '123456', fullName: 'Lê Đình Phúc',
    rank: 'Phó TGĐ', position: 'Phó Tổng Giám đốc Vận hành', departmentId: 'BGD', departmentName: 'Ban Giám đốc',
    email: 'phucld@dnA.com.vn', phone: '0912-345-003', roleId: 'R01', status: 'inactive',
    lastLogin: '2026-03-31T16:20:00', createdAt: '2024-01-15',
  },
  {
    id: 'U04', username: 'truongphong', password: '123456', fullName: 'Hoàng Minh Tuấn',
    rank: 'Phó GĐ', position: 'Trưởng phòng Kế hoạch', departmentId: 'PKH', departmentName: 'Phòng Kế hoạch',
    email: 'tuanhm@dnA.com.vn', phone: '0912-345-004', roleId: 'R02', status: 'inactive',
    lastLogin: '2026-04-01T08:00:00', createdAt: '2024-02-01',
  },
  {
    id: 'U05', username: 'tptckt', password: '123456', fullName: 'Vũ Thị Lan Anh',
    rank: 'Phó GĐ', position: 'Trưởng phòng Tài chính - Kế toán', departmentId: 'PTCKT', departmentName: 'Phòng Tài chính - Kế toán',
    email: 'anhvtl@dnA.com.vn', phone: '0912-345-005', roleId: 'R02', status: 'inactive',
    lastLogin: '2026-04-01T07:45:00', createdAt: '2024-02-01',
  },
  {
    id: 'U06', username: 'tpkt', password: '123456', fullName: 'Đỗ Quang Minh',
    rank: 'Phó GĐ', position: 'Trưởng phòng Kỹ thuật', departmentId: 'PKT', departmentName: 'Phòng Kỹ thuật',
    email: 'minhdq@dnA.com.vn', phone: '0912-345-006', roleId: 'R02', status: 'inactive',
    lastLogin: '2026-04-01T08:10:00', createdAt: '2024-02-01',
  },
  {
    id: 'U07', username: 'tpkcs', password: '123456', fullName: 'Nguyễn Hải Đăng',
    rank: 'Trưởng phòng', position: 'Trưởng phòng KCS & ĐBCL', departmentId: 'PKCDB', departmentName: 'Phòng KCS & Đảm bảo CL',
    email: 'dangnh@dnA.com.vn', phone: '0912-345-007', roleId: 'R02', status: 'inactive',
    lastLogin: '2026-03-31T15:30:00', createdAt: '2024-03-01',
  },
  {
    id: 'U08', username: 'qdpx1', password: '123456', fullName: 'Trần Văn Dũng',
    rank: 'Trưởng phòng', position: 'Quản đốc TT Phần mềm Alpha', departmentId: 'PX1', departmentName: 'Trung tâm Phần mềm Alpha',
    email: 'dungtv@dnA.com.vn', phone: '0912-345-008', roleId: 'R02', status: 'inactive',
    lastLogin: '2026-04-01T07:30:00', createdAt: '2024-03-01',
  },
  {
    id: 'U09', username: 'qdpx2', password: '123456', fullName: 'Bùi Xuân Trường',
    rank: 'Trưởng phòng', position: 'Quản đốc TT Phần mềm Beta', departmentId: 'PX2', departmentName: 'Trung tâm Phần mềm Beta',
    email: 'truongbx@dnA.com.vn', phone: '0912-345-009', roleId: 'R02', status: 'inactive',
    lastLogin: '2026-03-31T17:00:00', createdAt: '2024-03-01',
  },
  {
    id: 'U10', username: 'ppkh', password: '123456', fullName: 'Lý Thành Công',
    rank: 'Phó TP', position: 'Phó phòng Kế hoạch', departmentId: 'PKH', departmentName: 'Phòng Kế hoạch',
    email: 'conglt@dnA.com.vn', phone: '0912-345-010', roleId: 'R03', status: 'inactive',
    lastLogin: '2026-04-01T08:05:00', createdAt: '2024-04-01',
  },
  {
    id: 'U11', username: 'pptckt', password: '123456', fullName: 'Phạm Thu Hà',
    rank: 'Phó TP', position: 'Phó phòng Tài chính - Kế toán', departmentId: 'PTCKT', departmentName: 'Phòng Tài chính - Kế toán',
    email: 'hapt@dnA.com.vn', phone: '0912-345-011', roleId: 'R03', status: 'inactive',
    lastLogin: '2026-03-31T16:45:00', createdAt: '2024-04-01',
  },
  {
    id: 'U12', username: 'chuyenvien', password: '123456', fullName: 'Nguyễn Thị Minh',
    rank: 'Trưởng nhóm', position: 'Trưởng nhóm Kế hoạch', departmentId: 'PKH', departmentName: 'Phòng Kế hoạch',
    email: 'minhnt@dnA.com.vn', phone: '0912-345-012', roleId: 'R04', status: 'inactive',
    lastLogin: '2026-04-01T08:20:00', createdAt: '2024-05-01',
  },
  {
    id: 'U13', username: 'cvtckt1', password: '123456', fullName: 'Trần Hoàng Long',
    rank: 'Trưởng nhóm', position: 'Trưởng nhóm Kế toán', departmentId: 'PTCKT', departmentName: 'Phòng Tài chính - Kế toán',
    email: 'longth@dnA.com.vn', phone: '0912-345-013', roleId: 'R04', status: 'inactive',
    lastLogin: '2026-03-31T14:30:00', createdAt: '2024-05-01',
  },
  {
    id: 'U14', username: 'ktvpx1', password: '123456', fullName: 'Lê Quang Huy',
    rank: 'CV cao cấp', position: 'Kỹ sư phần mềm Alpha', departmentId: 'PX1', departmentName: 'Trung tâm Phần mềm Alpha',
    email: 'huylq@dnA.com.vn', phone: '0912-345-014', roleId: 'R05', status: 'inactive',
    lastLogin: '2026-04-01T07:20:00', createdAt: '2024-06-01',
  },
  {
    id: 'U15', username: 'ktvpx2', password: '123456', fullName: 'Đinh Tiến Đạt',
    rank: 'CV cao cấp', position: 'Kỹ sư phần mềm Beta', departmentId: 'PX2', departmentName: 'Trung tâm Phần mềm Beta',
    email: 'datdt@dnA.com.vn', phone: '0912-345-015', roleId: 'R05', status: 'inactive',
    lastLogin: '2026-03-31T16:00:00', createdAt: '2024-06-01',
  },
  {
    id: 'U16', username: 'ktvpx3', password: '123456', fullName: 'Phạm Anh Tuấn',
    rank: 'CV cao cấp', position: 'Kỹ sư hệ thống', departmentId: 'PX3', departmentName: 'Trung tâm Hạ tầng',
    email: 'tuanpa@dnA.com.vn', phone: '0912-345-016', roleId: 'R05', status: 'inactive',
    lastLogin: '2026-03-31T15:10:00', createdAt: '2024-07-01',
  },
  {
    id: 'U17', username: 'AdminDNA', password: 'DNAdemo#2026', fullName: 'Ngô Đức Thắng',
    rank: 'Trưởng phòng', position: 'Quản trị hệ thống', departmentId: 'PKT', departmentName: 'Phòng Kỹ thuật',
    email: 'thangnd@dnA.com.vn', phone: '0912-345-017', roleId: 'R06', status: 'active',
    lastLogin: '2026-04-01T07:00:00', createdAt: '2024-01-10',
  },
  {
    id: 'U18', username: 'tpct', password: '123456', fullName: 'Nguyễn Đức Anh',
    rank: 'Phó GĐ', position: 'Giám đốc Nhân sự', departmentId: 'PCT', departmentName: 'Phòng Nhân sự',
    email: 'anhnd@dnA.com.vn', phone: '0912-345-018', roleId: 'R02', status: 'inactive',
    lastLogin: '2026-03-15T09:00:00', createdAt: '2024-02-01',
  },
  {
    id: 'U19', username: 'ktvpx4', password: '123456', fullName: 'Hoàng Văn Nam',
    rank: 'CV cao cấp', position: 'Kỹ sư DevOps', departmentId: 'PX4', departmentName: 'Trung tâm Vận hành',
    email: 'namhv@dnA.com.vn', phone: '0912-345-019', roleId: 'R05', status: 'locked',
    lastLogin: '2026-03-20T10:00:00', createdAt: '2024-07-01',
  },
];
