import type { Role } from '../types';

export const roles: Role[] = [
  { id: 'R01', name: 'Giám đốc', code: 'DIRECTOR', description: 'Giám đốc / Phó Giám đốc — toàn quyền trên mọi phần mềm', level: 1, userCount: 3, color: '#ff4d4f' },
  { id: 'R02', name: 'Trưởng phòng', code: 'HEAD', description: 'Trưởng phòng / Trưởng trung tâm — quản lý nghiệp vụ thuộc phòng ban', level: 2, userCount: 7, color: '#D4A843' },
  { id: 'R03', name: 'Phó phòng', code: 'DEPUTY', description: 'Phó phòng — hỗ trợ trưởng phòng, duyệt một số nghiệp vụ', level: 3, userCount: 5, color: '#1890ff' },
  { id: 'R04', name: 'Chuyên viên', code: 'STAFF', description: 'Chuyên viên / Nhân viên — thực hiện nghiệp vụ hàng ngày', level: 4, userCount: 12, color: '#52c41a' },
  { id: 'R05', name: 'Kỹ thuật viên', code: 'TECHNICIAN', description: 'Kỹ thuật viên trung tâm — nhập liệu, báo cáo kỹ thuật', level: 5, userCount: 8, color: '#722ed1' },
  { id: 'R06', name: 'Quản trị hệ thống', code: 'SYSADMIN', description: 'Quản trị viên SSO — quản lý user, phân quyền, cấu hình hệ thống', level: 0, userCount: 2, color: '#1B3A5C' },
];
