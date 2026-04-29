import type { MaintenanceStaff, MaintenanceTeam } from '../types';

export const maintenanceStaff: MaintenanceStaff[] = [
  {
    id: 'MS001', name: 'Nguyễn Văn Hùng', staffCode: 'KTV-001',
    departmentId: 'PX1', departmentName: 'TT Vận hành Hạ tầng', position: 'Kỹ thuật viên chính',
    specialization: 'Hệ thống monitoring', status: 'active', phone: '0912345678', teamId: 'TM001',
    skills: [
      { equipmentType: 'Monitoring P-18', level: 'advanced', experienceCount: 45 },
      { equipmentType: 'Monitoring 36D6', level: 'advanced', experienceCount: 32 },
      { equipmentType: 'Monitoring ST-68', level: 'intermediate', experienceCount: 15 },
    ],
    certificates: [
      { id: 'C001', name: 'Chứng chỉ An toàn điện cao áp', number: 'ATDCA-2024-0156', issuedDate: '2024-06-15', expiryDate: '2027-06-15' },
      { id: 'C002', name: 'Chứng chỉ Kỹ thuật viên Hạ tầng', number: 'KTV-HT-2023-089', issuedDate: '2023-03-20', expiryDate: '2026-03-20', isExpiringSoon: true },
    ],
  },
  {
    id: 'MS002', name: 'Trần Văn Bình', staffCode: 'KTV-002',
    departmentId: 'PX1', departmentName: 'TT Vận hành Hạ tầng', position: 'Kỹ thuật viên',
    specialization: 'Hệ thống monitoring', status: 'active', phone: '0923456789', teamId: 'TM001',
    skills: [
      { equipmentType: 'Monitoring P-18', level: 'intermediate', experienceCount: 20 },
      { equipmentType: 'Monitoring P-37', level: 'advanced', experienceCount: 38 },
    ],
    certificates: [
      { id: 'C003', name: 'Chứng chỉ An toàn điện cao áp', number: 'ATDCA-2025-0201', issuedDate: '2025-01-10', expiryDate: '2028-01-10' },
    ],
  },
  {
    id: 'MS003', name: 'Lê Minh Đức', staffCode: 'KTV-003',
    departmentId: 'PX1', departmentName: 'TT Vận hành Hạ tầng', position: 'Kỹ thuật viên',
    specialization: 'Monitoring & Điện tử', status: 'active', phone: '0934567890', teamId: 'TM001',
    skills: [
      { equipmentType: 'Monitoring 36D6', level: 'intermediate', experienceCount: 18 },
      { equipmentType: 'Monitoring ST-68', level: 'advanced', experienceCount: 28 },
    ],
    certificates: [
      { id: 'C004', name: 'Chứng chỉ An toàn điện cao áp', number: 'ATDCA-2024-0180', issuedDate: '2024-08-20', expiryDate: '2027-08-20' },
      { id: 'C005', name: 'Chứng chỉ Kỹ thuật viên Điện tử', number: 'KTV-DT-2024-045', issuedDate: '2024-05-10', expiryDate: '2027-05-10' },
    ],
  },
  {
    id: 'MS004', name: 'Phạm Thanh Sơn', staffCode: 'KTV-004',
    departmentId: 'PX2', departmentName: 'TT Sản phẩm chủ lực', position: 'Kỹ thuật viên chính',
    specialization: 'Sản phẩm chủ lực', status: 'active', phone: '0945678901', teamId: 'TM002',
    skills: [
      { equipmentType: 'S-75 Dvina', level: 'advanced', experienceCount: 42 },
      { equipmentType: 'S-125 Pechora', level: 'advanced', experienceCount: 35 },
      { equipmentType: 'S-300PMU', level: 'intermediate', experienceCount: 12 },
    ],
    certificates: [
      { id: 'C006', name: 'Chứng chỉ An toàn vận hành sản phẩm', number: 'ATSP-2024-0098', issuedDate: '2024-04-15', expiryDate: '2026-04-15', isExpiringSoon: true },
      { id: 'C007', name: 'Chứng chỉ Kỹ thuật viên Sản phẩm', number: 'KTV-SP-2023-067', issuedDate: '2023-09-01', expiryDate: '2026-09-01' },
    ],
  },
  {
    id: 'MS005', name: 'Vũ Đình Khoa', staffCode: 'KTV-005',
    departmentId: 'PX2', departmentName: 'TT Sản phẩm chủ lực', position: 'Kỹ thuật viên',
    specialization: 'Sản phẩm chủ lực', status: 'on_leave', phone: '0956789012', teamId: 'TM002',
    skills: [
      { equipmentType: 'S-75 Dvina', level: 'intermediate', experienceCount: 15 },
      { equipmentType: 'S-125 Pechora', level: 'basic', experienceCount: 8 },
    ],
    certificates: [
      { id: 'C008', name: 'Chứng chỉ An toàn vận hành sản phẩm', number: 'ATSP-2025-0012', issuedDate: '2025-02-01', expiryDate: '2027-02-01' },
    ],
  },
  {
    id: 'MS006', name: 'Đỗ Quang Vinh', staffCode: 'KTV-006',
    departmentId: 'PX3', departmentName: 'TT Cơ khí', position: 'Thợ cơ khí bậc cao',
    specialization: 'Cơ khí', status: 'active', phone: '0967890123', teamId: 'TM003',
    skills: [
      { equipmentType: 'Máy tiện CNC', level: 'advanced', experienceCount: 50 },
      { equipmentType: 'Máy phay', level: 'advanced', experienceCount: 45 },
    ],
    certificates: [
      { id: 'C009', name: 'Chứng chỉ Thợ cơ khí bậc 6/7', number: 'CK-B6-2023-034', issuedDate: '2023-07-15', expiryDate: '2028-07-15' },
    ],
  },
  {
    id: 'MS007', name: 'Hoàng Văn Nam', staffCode: 'KTV-007',
    departmentId: 'PX4', departmentName: 'TT Điện tử & Mạng', position: 'Kỹ thuật viên điện tử',
    specialization: 'Điện tử', status: 'active', phone: '0978901234', teamId: 'TM004',
    skills: [
      { equipmentType: 'Hệ thống truyền thông', level: 'advanced', experienceCount: 30 },
      { equipmentType: 'Thiết bị đo lường', level: 'intermediate', experienceCount: 20 },
    ],
    certificates: [
      { id: 'C010', name: 'Chứng chỉ An toàn điện cao áp', number: 'ATDCA-2025-0055', issuedDate: '2025-03-01', expiryDate: '2028-03-01' },
      { id: 'C011', name: 'Chứng chỉ Kỹ thuật viên Điện tử', number: 'KTV-DT-2024-078', issuedDate: '2024-11-20', expiryDate: '2027-11-20' },
    ],
  },
  {
    id: 'MS008', name: 'Bùi Văn Thắng', staffCode: 'KTV-008',
    departmentId: 'PX3', departmentName: 'TT Cơ khí', position: 'Thợ hàn bậc cao',
    specialization: 'Cơ khí - Hàn', status: 'active', phone: '0989012345', teamId: 'TM003',
    skills: [
      { equipmentType: 'Máy hàn TIG/MIG', level: 'advanced', experienceCount: 55 },
      { equipmentType: 'Máy cắt plasma', level: 'intermediate', experienceCount: 25 },
    ],
    certificates: [
      { id: 'C012', name: 'Chứng chỉ Thợ hàn quốc tế IIW', number: 'IIW-2024-VN-089', issuedDate: '2024-02-15', expiryDate: '2027-02-15' },
    ],
  },
];

export const maintenanceTeams: MaintenanceTeam[] = [
  {
    id: 'TM001', name: 'Đội bảo trì Hạ tầng', type: 'fixed',
    leaderId: 'MS001', leaderName: 'Nguyễn Văn Hùng',
    departmentId: 'PX1', departmentName: 'TT Vận hành Hạ tầng',
    memberCount: 3, specialization: 'Bảo trì hệ thống monitoring các loại',
    members: ['MS001', 'MS002', 'MS003'],
  },
  {
    id: 'TM002', name: 'Đội bảo trì Sản phẩm chủ lực', type: 'fixed',
    leaderId: 'MS004', leaderName: 'Phạm Thanh Sơn',
    departmentId: 'PX2', departmentName: 'TT Sản phẩm chủ lực',
    memberCount: 2, specialization: 'Bảo trì các module sản phẩm chủ lực',
    members: ['MS004', 'MS005'],
  },
  {
    id: 'TM003', name: 'Đội bảo trì Cơ khí', type: 'fixed',
    leaderId: 'MS006', leaderName: 'Đỗ Quang Vinh',
    departmentId: 'PX3', departmentName: 'TT Cơ khí',
    memberCount: 2, specialization: 'Bảo trì thiết bị cơ khí, máy công cụ',
    members: ['MS006', 'MS008'],
  },
  {
    id: 'TM004', name: 'Đội bảo trì Điện tử', type: 'fixed',
    leaderId: 'MS007', leaderName: 'Hoàng Văn Nam',
    departmentId: 'PX4', departmentName: 'TT Điện tử & Mạng',
    memberCount: 1, specialization: 'Bảo trì thiết bị điện tử, truyền thông',
    members: ['MS007'],
  },
  {
    id: 'TM005', name: 'Đội bảo trì lưu động', type: 'flexible',
    leaderId: 'MS001', leaderName: 'Nguyễn Văn Hùng',
    departmentId: 'PKT', departmentName: 'Phòng Kỹ thuật',
    memberCount: 4, specialization: 'Hỗ trợ bảo trì hiện trường, đa chuyên môn',
    members: ['MS001', 'MS004', 'MS006', 'MS007'],
  },
];
