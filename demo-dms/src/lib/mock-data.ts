// Mock data + URL router cho Doanh nghiệp A DMS prototype (Tổng công ty Doanh nghiệp A).
// Tất cả *-api.ts import `api` từ api.ts, api.ts delegate qua routeMock().

/* ───────────────────────────── USERS ───────────────────────────── */

export const MOCK_CURRENT_USER = {
  id: 'user-1',
  username: 'hoangmt',
  email: 'hmtuan@doanhnghiepa.vn',
  fullName: 'Hoàng Minh Tuấn',
  phone: '0912345678',
  avatarUrl: null as string | null,
  department: { id: 'dept-phk', name: 'Phòng Kế hoạch', code: 'PKH' },
  roles: [{ id: 'role-manager', name: 'department_manager', displayName: 'Trưởng phòng' }],
  isActive: true,
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2026-04-10T10:30:00Z',
  userDepartments: [{ id: 'ud-1' }],
};

const MOCK_USERS = [
  MOCK_CURRENT_USER,
  {
    id: 'user-2', username: 'phamqh', email: 'pqhung@doanhnghiepa.vn', fullName: 'Phạm Quốc Hưng', phone: '0912340001',
    avatarUrl: null, department: { id: 'dept-bgd', name: 'Ban Giám đốc', code: 'BGD' },
    roles: [{ id: 'role-director', name: 'director', displayName: 'Tổng Giám đốc' }],
    isActive: true, createdAt: '2023-05-12T08:00:00Z', updatedAt: '2026-04-01T08:00:00Z', userDepartments: [{ id: 'ud-2' }],
  },
  {
    id: 'user-3', username: 'nguyenva', email: 'nvanh@doanhnghiepa.vn', fullName: 'Nguyễn Văn Anh', phone: '0912340002',
    avatarUrl: null, department: { id: 'dept-tckt', name: 'Phòng Tài chính - Kế toán', code: 'PTCKT' },
    roles: [{ id: 'role-manager', name: 'department_manager', displayName: 'Trưởng phòng' }],
    isActive: true, createdAt: '2023-08-20T08:00:00Z', updatedAt: '2026-03-15T08:00:00Z', userDepartments: [{ id: 'ud-3' }],
  },
  {
    id: 'user-4', username: 'tranbh', email: 'tbhung@doanhnghiepa.vn', fullName: 'Trần Bá Hùng', phone: '0912340003',
    avatarUrl: null, department: { id: 'dept-pkt', name: 'Phòng Kỹ thuật', code: 'PKT' },
    roles: [{ id: 'role-manager', name: 'department_manager', displayName: 'Trưởng phòng' }],
    isActive: true, createdAt: '2023-09-10T08:00:00Z', updatedAt: '2026-02-20T08:00:00Z', userDepartments: [{ id: 'ud-4' }],
  },
  {
    id: 'user-5', username: 'lehl', email: 'lhlong@doanhnghiepa.vn', fullName: 'Lê Hoàng Long', phone: '0912340004',
    avatarUrl: null, department: { id: 'dept-pkcs', name: 'Phòng KCS & Đảm bảo CL', code: 'PKCDB' },
    roles: [{ id: 'role-manager', name: 'department_manager', displayName: 'Trưởng phòng' }],
    isActive: true, createdAt: '2024-01-05T08:00:00Z', updatedAt: '2026-01-10T08:00:00Z', userDepartments: [{ id: 'ud-5' }],
  },
  {
    id: 'user-6', username: 'vuct', email: 'vctrung@doanhnghiepa.vn', fullName: 'Vũ Công Trung', phone: '0912340005',
    avatarUrl: null, department: { id: 'dept-px1', name: 'Trung tâm phần mềm Alpha', code: 'PX1' },
    roles: [{ id: 'role-manager', name: 'department_manager', displayName: 'Giám đốc Trung tâm' }],
    isActive: true, createdAt: '2024-02-18T08:00:00Z', updatedAt: '2026-03-22T08:00:00Z', userDepartments: [{ id: 'ud-6' }],
  },
  {
    id: 'user-7', username: 'doxh', email: 'dxhoa@doanhnghiepa.vn', fullName: 'Đỗ Xuân Hòa', phone: '0912340006',
    avatarUrl: null, department: { id: 'dept-px2', name: 'Trung tâm phần mềm Beta', code: 'PX2' },
    roles: [{ id: 'role-manager', name: 'department_manager', displayName: 'Giám đốc Trung tâm' }],
    isActive: true, createdAt: '2024-03-08T08:00:00Z', updatedAt: '2026-03-15T08:00:00Z', userDepartments: [{ id: 'ud-7' }],
  },
  {
    id: 'user-8', username: 'maidt', email: 'mdthang@doanhnghiepa.vn', fullName: 'Mai Đức Thắng', phone: '0912340007',
    avatarUrl: null, department: { id: 'dept-px4', name: 'Trung tâm phần mềm Gamma', code: 'PX4' },
    roles: [{ id: 'role-manager', name: 'department_manager', displayName: 'Giám đốc Trung tâm' }],
    isActive: true, createdAt: '2024-04-20T08:00:00Z', updatedAt: '2026-02-28T08:00:00Z', userDepartments: [{ id: 'ud-8' }],
  },
];

/* ───────────────────────── DEPARTMENTS ────────────────────────── */

const MOCK_DEPARTMENTS = [
  { id: 'dept-bgd',  name: 'Ban Giám đốc',                  code: 'BGD',    description: 'Ban Giám đốc Doanh nghiệp A',         parentId: null, level: 0, sortOrder: 1 },
  { id: 'dept-pct',  name: 'Phòng Truyền thông',            code: 'PCT',    description: 'Truyền thông nội bộ, văn hóa',       parentId: null, level: 0, sortOrder: 2 },
  { id: 'dept-tckt', name: 'Phòng Tài chính - Kế toán',     code: 'PTCKT',  description: 'Quản lý tài chính, kế toán',          parentId: null, level: 0, sortOrder: 3 },
  { id: 'dept-phk',  name: 'Phòng Kế hoạch',                code: 'PKH',    description: 'Lập kế hoạch sản xuất',               parentId: null, level: 0, sortOrder: 4 },
  { id: 'dept-pkt',  name: 'Phòng Kỹ thuật',                code: 'PKT',    description: 'Phòng Kỹ thuật doanh nghiệp',         parentId: null, level: 0, sortOrder: 5 },
  { id: 'dept-phckt',name: 'Phòng Logistics - Kỹ thuật',    code: 'PHCKT',  description: 'Logistics, vật tư kỹ thuật',          parentId: null, level: 0, sortOrder: 6 },
  { id: 'dept-pkcs', name: 'Phòng QA & Đảm bảo CL',         code: 'PKCDB',  description: 'Kiểm tra chất lượng sản phẩm',        parentId: null, level: 0, sortOrder: 7 },
  { id: 'dept-px1',  name: 'Trung tâm phần mềm Alpha',      code: 'PX1',    description: 'Phát triển, bảo trì hệ thống monitoring', parentId: null, level: 0, sortOrder: 8 },
  { id: 'dept-px2',  name: 'Trung tâm phần mềm Beta',       code: 'PX2',    description: 'Phát triển, bảo trì module nghiệp vụ', parentId: null, level: 0, sortOrder: 9 },
  { id: 'dept-px3',  name: 'Trung tâm phần mềm Gamma',      code: 'PX3',    description: 'Phát triển hạ tầng, server',          parentId: null, level: 0, sortOrder: 10 },
  { id: 'dept-px4',  name: 'Trung tâm phần mềm Delta',      code: 'PX4',    description: 'Phát triển ứng dụng web/mobile',      parentId: null, level: 0, sortOrder: 11 },
].map((d) => ({
  ...d,
  isActive: true,
  createdAt: '2023-01-01T08:00:00Z',
  updatedAt: '2025-12-01T08:00:00Z',
}));

function deptUserCount(id: string): number {
  const map: Record<string, number> = {
    'dept-bgd': 3, 'dept-pct': 4, 'dept-tckt': 8, 'dept-phk': 6, 'dept-pkt': 12,
    'dept-phckt': 7, 'dept-pkcs': 9, 'dept-px1': 18, 'dept-px2': 16, 'dept-px3': 14, 'dept-px4': 15,
  };
  return map[id] ?? 0;
}

/* ─────────────────────────── ROLES ────────────────────────────── */

const MOCK_ROLES = [
  { id: 'role-sysadmin',  name: 'system_admin',        displayName: 'Quản trị hệ thống',  description: 'Toàn quyền hệ thống',       isSystem: true,  systemPermissionCount: -1, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z', deletedAt: null },
  { id: 'role-director',  name: 'director',            displayName: 'Tổng Giám đốc',      description: 'Lãnh đạo doanh nghiệp',     isSystem: true,  systemPermissionCount: 42, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z', deletedAt: null },
  { id: 'role-manager',   name: 'department_manager',  displayName: 'Trưởng phòng',       description: 'Quản lý phòng ban',         isSystem: false, systemPermissionCount: 28, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z', deletedAt: null },
  { id: 'role-staff',     name: 'staff',               displayName: 'Nhân viên',          description: 'Nhân viên thông thường',    isSystem: false, systemPermissionCount: 12, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z', deletedAt: null },
  { id: 'role-kcs',       name: 'kcs',                 displayName: 'Kiểm định viên QA',  description: 'Kiểm tra chất lượng',       isSystem: false, systemPermissionCount: 18, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z', deletedAt: null },
  { id: 'role-technician',name: 'technician',          displayName: 'Kỹ thuật viên',      description: 'Vận hành, bảo trì',          isSystem: false, systemPermissionCount: 14, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z', deletedAt: null },
];

/* ──────────────────────── PERMISSIONS ────────────────────────── */

const RESOURCES = ['documents', 'folders', 'users', 'roles', 'departments', 'audit', 'chat', 'glossary', 'translation', 'permissions'];
const ACTIONS = ['read', 'create', 'update', 'delete', 'share', 'approve', 'report', 'history', 'stats'];

const PERMISSION_REGISTRY = RESOURCES.map((resource) => ({
  key: resource,
  displayName: resource,
  actions: ACTIONS.map((a) => ({ key: a, displayName: a })),
}));

/* ───────────────────────── FOLDERS ────────────────────────────── */

interface MockFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  permissionLevel: 'VIEWER' | 'EDITOR' | 'OWNER';
}

const MOCK_FOLDERS: MockFolder[] = [
  { id: 'fold-root-z119', name: 'Tài liệu Doanh nghiệp A',    parentId: null, createdBy: 'user-2', sortOrder: 0, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2026-04-01T08:00:00Z', documentCount: 0, permissionLevel: 'OWNER' },
  { id: 'fold-tktk',     name: 'Tài liệu kỹ thuật',           parentId: 'fold-root-z119', createdBy: 'user-4', sortOrder: 1, createdAt: '2024-01-05T08:00:00Z', updatedAt: '2026-03-15T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-qtsx',     name: 'Quy trình sản xuất',          parentId: 'fold-root-z119', createdBy: 'user-4', sortOrder: 2, createdAt: '2024-01-05T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-vbbgd',    name: 'Văn bản BGĐ',                 parentId: 'fold-root-z119', createdBy: 'user-2', sortOrder: 3, createdAt: '2024-01-05T08:00:00Z', updatedAt: '2026-02-28T08:00:00Z', documentCount: 0, permissionLevel: 'VIEWER' },
  { id: 'fold-bckcs',    name: 'Báo cáo QA',                  parentId: 'fold-root-z119', createdBy: 'user-5', sortOrder: 4, createdAt: '2024-01-05T08:00:00Z', updatedAt: '2026-03-20T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-daotao',   name: 'Tài liệu đào tạo',            parentId: 'fold-root-z119', createdBy: 'user-4', sortOrder: 5, createdAt: '2024-01-05T08:00:00Z', updatedAt: '2026-01-30T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },

  { id: 'fold-radar-p18', name: 'Hệ thống monitoring P-18',   parentId: 'fold-tktk', createdBy: 'user-4', sortOrder: 1, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2026-03-01T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-radar-36d6',name: 'Hệ thống monitoring 36D6',   parentId: 'fold-tktk', createdBy: 'user-4', sortOrder: 2, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2026-03-01T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-radar-p37', name: 'Hệ thống monitoring P-37',   parentId: 'fold-tktk', createdBy: 'user-4', sortOrder: 3, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2026-03-01T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-radar-st68',name: 'Hệ thống monitoring ST-68',  parentId: 'fold-tktk', createdBy: 'user-4', sortOrder: 4, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2026-03-01T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-tl-s75',    name: 'Module S-75',                parentId: 'fold-tktk', createdBy: 'user-4', sortOrder: 5, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2026-03-01T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-tl-s125',   name: 'Module S-125',               parentId: 'fold-tktk', createdBy: 'user-4', sortOrder: 6, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2026-03-01T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-tl-s300',   name: 'Module S-300PMU',            parentId: 'fold-tktk', createdBy: 'user-4', sortOrder: 7, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2026-03-01T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },

  { id: 'fold-qtsx-sc',   name: 'Sửa chữa',                   parentId: 'fold-qtsx', createdBy: 'user-4', sortOrder: 1, createdAt: '2024-01-12T08:00:00Z', updatedAt: '2026-02-20T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-qtsx-dt',   name: 'Nâng cấp',                   parentId: 'fold-qtsx', createdBy: 'user-4', sortOrder: 2, createdAt: '2024-01-12T08:00:00Z', updatedAt: '2026-02-20T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
  { id: 'fold-qtsx-bt',   name: 'Bảo trì',                    parentId: 'fold-qtsx', createdBy: 'user-4', sortOrder: 3, createdAt: '2024-01-12T08:00:00Z', updatedAt: '2026-02-20T08:00:00Z', documentCount: 0, permissionLevel: 'EDITOR' },
];

/* ───────────────────────── DOCUMENTS ──────────────────────────── */

interface MockDocument {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  uploadedBy: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
  departmentId: string | null;
  referenceNumber: string | null;
  securityLevel: 'NORMAL' | 'CONFIDENTIAL';
  extractionStatus: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  embeddingStatus: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  chunkCount: number;
  permissionLevel: 'VIEWER' | 'EDITOR' | 'OWNER';
}

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const MOCK_DOCUMENTS: MockDocument[] = [
  mkDoc('doc-001', 'Quy trình vận hành hệ thống monitoring P-18.pdf', PDF_MIME,  2450000,  'fold-radar-p18',  'dept-px1',  'QT-PX1-2026-01', 'NORMAL',       'user-6'),
  mkDoc('doc-002', 'Biên bản nghiệm thu nâng cấp S-75.docx',     DOCX_MIME, 318000,   'fold-tl-s75',     'dept-pkcs', 'BB-QA-2026-034', 'NORMAL',       'user-5'),
  mkDoc('doc-003', 'Thông số kỹ thuật hệ thống 36D6.xlsx',       XLSX_MIME, 156000,   'fold-radar-36d6', 'dept-pkt',  'TS-PKT-2025-118','CONFIDENTIAL', 'user-4'),
  mkDoc('doc-004', 'Quy định an toàn Trung tâm Alpha.pdf',       PDF_MIME,  890000,   'fold-daotao',     'dept-px1',  'QĐ-PX1-2025-07', 'NORMAL',       'user-6'),
  mkDoc('doc-005', 'Hướng dẫn vận hành module S-125 Pechora.pdf',PDF_MIME, 4120000,  'fold-tl-s125',    'dept-px2',  'HD-PX2-2026-02', 'CONFIDENTIAL', 'user-7'),
  mkDoc('doc-006', 'Báo cáo kiểm định Q4-2025.xlsx',             XLSX_MIME, 210000,   'fold-bckcs',      'dept-pkcs', 'BC-QA-Q4-2025',  'NORMAL',       'user-5'),
  mkDoc('doc-007', 'Sơ đồ khối hệ thống ST-68.pdf',              PDF_MIME,  1780000,  'fold-radar-st68', 'dept-pkt',  'SĐ-PKT-2025-092','CONFIDENTIAL', 'user-4'),
  mkDoc('doc-008', 'Lệnh sản xuất LSX-2026-0142.pdf',            PDF_MIME,  220000,   'fold-vbbgd',      'dept-phk',  'LSX-2026-0142',  'NORMAL',       'user-1'),
  mkDoc('doc-009', 'Biên bản họp BGĐ Doanh nghiệp A.docx',       DOCX_MIME, 145000,   'fold-vbbgd',      'dept-bgd',  'BB-BGĐ-2026-18', 'CONFIDENTIAL', 'user-2'),
  mkDoc('doc-010', 'Tài liệu kỹ thuật P-37.pdf',                 PDF_MIME,  3680000,  'fold-radar-p37',  'dept-pkt',  'TL-PKT-2025-077','CONFIDENTIAL', 'user-4'),
  mkDoc('doc-011', 'Quy trình nâng cấp động cơ hệ thống.docx',   DOCX_MIME, 412000,   'fold-qtsx-dt',    'dept-px1',  'QT-PX1-2025-44', 'NORMAL',       'user-6'),
  mkDoc('doc-012', 'Thông số S-300PMU.xlsx',                     XLSX_MIME, 188000,   'fold-tl-s300',    'dept-pkt',  'TS-PKT-2026-03', 'CONFIDENTIAL', 'user-4'),
  mkDoc('doc-013', 'Hướng dẫn sử dụng máy đo Tektronix.pdf',     PDF_MIME,  2240000,  'fold-daotao',     'dept-px4',  'HD-PX4-2025-09', 'NORMAL',       'user-8'),
  mkDoc('doc-014', 'Báo cáo sự cố Trung tâm Beta T12-2025.docx', DOCX_MIME, 268000,   'fold-bckcs',      'dept-px2',  'BC-PX2-2025-12', 'NORMAL',       'user-7'),
  mkDoc('doc-015', 'Quy trình QA nghiệm thu thiết bị.pdf',       PDF_MIME,  1540000,  'fold-bckcs',      'dept-pkcs', 'QT-QA-2025-28',  'CONFIDENTIAL', 'user-5'),
];

function mkDoc(
  id: string,
  fileName: string,
  mimeType: string,
  fileSize: number,
  folderId: string,
  departmentId: string,
  referenceNumber: string,
  securityLevel: 'NORMAL' | 'CONFIDENTIAL',
  uploadedBy: string,
): MockDocument {
  const title = fileName.replace(/\.(pdf|docx?|xlsx?|pptx?)$/i, '');
  return {
    id,
    title,
    description: `Tài liệu ${title} — Doanh nghiệp A`,
    fileName,
    fileSize,
    mimeType,
    storagePath: `/doanhnghiepa/${id}/${fileName}`,
    uploadedBy,
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-04-10T08:00:00Z',
    folderId,
    departmentId,
    referenceNumber,
    securityLevel,
    extractionStatus: 'COMPLETED',
    embeddingStatus: 'COMPLETED',
    chunkCount: Math.floor(fileSize / 2048),
    permissionLevel: 'EDITOR',
  };
}

function findUser(id: string) {
  const u = MOCK_USERS.find((x) => x.id === id) ?? MOCK_CURRENT_USER;
  return { id: u.id, username: u.username, fullName: u.fullName, email: u.email };
}

function findDept(id: string | null) {
  if (!id) return null;
  const d = MOCK_DEPARTMENTS.find((x) => x.id === id);
  return d ? { id: d.id, name: d.name, code: d.code } : null;
}

function enrichDoc(d: MockDocument) {
  return {
    ...d,
    uploader: findUser(d.uploadedBy),
    department: findDept(d.departmentId),
  };
}

/* ───────────────────────── CHAT SESSIONS ──────────────────────── */

const MOCK_CHAT_SESSIONS = [
  { id: 'chat-1', userId: 'user-1', title: 'Hỏi về quy trình vận hành hệ thống P-18', createdAt: '2026-04-18T09:15:00Z', updatedAt: '2026-04-18T09:45:00Z', _count: { messages: 8 }, multiLanguageEnabled: false, messageCount: 8 },
  { id: 'chat-2', userId: 'user-1', title: 'Tra cứu thông số module S-125',           createdAt: '2026-04-17T14:22:00Z', updatedAt: '2026-04-17T15:01:00Z', _count: { messages: 12 }, multiLanguageEnabled: false, messageCount: 12 },
  { id: 'chat-3', userId: 'user-1', title: 'Tìm biên bản QA Q4-2025',                 createdAt: '2026-04-15T10:08:00Z', updatedAt: '2026-04-15T10:30:00Z', _count: { messages: 4 }, multiLanguageEnabled: false, messageCount: 4 },
  { id: 'chat-4', userId: 'user-1', title: 'Tóm tắt báo cáo sự cố Trung tâm Beta',    createdAt: '2026-04-12T16:45:00Z', updatedAt: '2026-04-12T17:00:00Z', _count: { messages: 6 }, multiLanguageEnabled: false, messageCount: 6 },
  { id: 'chat-5', userId: 'user-1', title: 'Quy định an toàn trong Trung tâm',        createdAt: '2026-04-10T11:12:00Z', updatedAt: '2026-04-10T11:30:00Z', _count: { messages: 5 }, multiLanguageEnabled: false, messageCount: 5 },
];

const SAMPLE_EXTRACTED = `DOANH NGHIỆP A — TỔNG CÔNG TY CÔNG NGHỆ

QUY TRÌNH VẬN HÀNH HỆ THỐNG MONITORING P-18

1. PHẠM VI ÁP DỤNG
Quy trình này áp dụng cho việc vận hành, bảo trì, nâng cấp các hệ thống monitoring P-18 tại Doanh nghiệp A phục vụ các đơn vị Khối K361, K363, K367 và các Trung tâm 261, 285, 291.

2. YÊU CẦU KỸ THUẬT
- Kiểm tra các module phát tín hiệu, module thu, module hiển thị.
- Đo các thông số: công suất phát, độ nhạy thu, dải tần hoạt động.
- Kiểm tra hệ thống cấp nguồn, module điều khiển.

3. TRÌNH TỰ TRIỂN KHAI
3.1. Tiếp nhận thiết bị, lập biên bản tình trạng kỹ thuật.
3.2. Tháo rời, làm sạch, kiểm tra từng module.
3.3. Sửa chữa, thay thế linh kiện hỏng hóc.
3.4. Lắp ráp, căn chỉnh thông số.
3.5. Chạy thử, đo kiểm.
3.6. Nghiệm thu QA, bàn giao.

4. VẬT TƯ THAY THẾ
- Linh kiện cao tần: nhập từ đơn vị đối tác.
- Linh kiện bán dẫn: Tektronix, Bosch Rexroth.
- Cáp cao tần: Siemens.

5. THIẾT BỊ ĐO KIỂM
- Máy đo công suất Tektronix TDS3054C.
- Máy phát chuẩn R&S SMB100A.
- Dao động ký số 4 kênh.

6. NGHIỆM THU
Sau khi triển khai, sản phẩm phải được QA (Phòng QA & Đảm bảo CL) nghiệm thu đầy đủ các hạng mục theo quy định QT-QA-2025-28.`;

/* ───────────────────────── AUDIT LOGS ─────────────────────────── */

const MOCK_AUDIT = [
  { id: 1, userId: 'user-1', action: 'upload', resource: 'documents', resourceId: 'doc-001', details: { fileName: 'Quy trình vận hành hệ thống monitoring P-18.pdf' }, ipAddress: '10.0.5.21', userAgent: 'Mozilla/5.0', createdAt: '2026-04-19T08:15:00Z', user: findUser('user-1') },
  { id: 2, userId: 'user-5', action: 'update', resource: 'documents', resourceId: 'doc-006', details: { field: 'title' }, ipAddress: '10.0.5.34', userAgent: 'Mozilla/5.0', createdAt: '2026-04-18T16:42:00Z', user: findUser('user-5') },
  { id: 3, userId: 'user-4', action: 'share',  resource: 'documents', resourceId: 'doc-003', details: { granteeType: 'DEPARTMENT', granteeName: 'PX1' }, ipAddress: '10.0.5.12', userAgent: 'Mozilla/5.0', createdAt: '2026-04-18T11:10:00Z', user: findUser('user-4') },
  { id: 4, userId: 'user-2', action: 'create', resource: 'folders',   resourceId: 'fold-bckcs', details: { name: 'Báo cáo QA' }, ipAddress: '10.0.5.10', userAgent: 'Mozilla/5.0', createdAt: '2026-04-17T09:33:00Z', user: findUser('user-2') },
  { id: 5, userId: 'user-6', action: 'download', resource: 'documents', resourceId: 'doc-011', details: {}, ipAddress: '10.0.5.56', userAgent: 'Mozilla/5.0', createdAt: '2026-04-16T14:25:00Z', user: findUser('user-6') },
  { id: 6, userId: 'user-5', action: 'delete', resource: 'documents', resourceId: 'doc-xxx', details: { fileName: 'draft.docx' }, ipAddress: '10.0.5.34', userAgent: 'Mozilla/5.0', createdAt: '2026-04-15T10:05:00Z', user: findUser('user-5') },
  { id: 7, userId: 'user-3', action: 'login',  resource: 'users',     resourceId: 'user-3', details: {}, ipAddress: '10.0.5.18', userAgent: 'Mozilla/5.0', createdAt: '2026-04-15T08:00:00Z', user: findUser('user-3') },
  { id: 8, userId: 'user-1', action: 'update', resource: 'folders',   resourceId: 'fold-qtsx-dt', details: { field: 'name' }, ipAddress: '10.0.5.21', userAgent: 'Mozilla/5.0', createdAt: '2026-04-14T15:40:00Z', user: findUser('user-1') },
];

/* ───────────────────────── DASHBOARD ──────────────────────────── */

const DASHBOARD_STATS = {
  totalDocuments: { value: 1240, change: 8.5 },
  storageUsed:    { value: 18.5 * 1024 * 1024 * 1024, change: 12.3 }, // bytes
  onlineUsers:    { value: 45, change: 5.2 },
  aiRequests:     { value: 156, change: -2.8 },
};

const DASHBOARD_CHART = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  total:      [22, 34, 28, 41, 37, 18, 10],
  completed:  [20, 31, 26, 38, 34, 16, 8],
  processing: [1, 2, 1, 2, 2, 1, 1],
  failed:     [1, 1, 1, 1, 1, 1, 1],
};

const DATA_CLASSIFICATION = {
  total: 1240,
  items: [
    { label: 'Tài liệu kỹ thuật', count: 412, percentage: 33.2 },
    { label: 'Quy trình sản xuất', count: 298, percentage: 24.0 },
    { label: 'Báo cáo QA',         count: 215, percentage: 17.3 },
    { label: 'Văn bản BGĐ',        count: 180, percentage: 14.5 },
    { label: 'Tài liệu đào tạo',   count: 135, percentage: 10.9 },
  ],
};

const RECENT_DOCUMENTS = MOCK_DOCUMENTS.slice(0, 8).map((d) => ({
  id: d.id,
  title: d.title,
  fileName: d.fileName,
  mimeType: d.mimeType,
  fileSize: d.fileSize,
  createdAt: d.createdAt,
  folderId: d.folderId,
  uploader: { id: findUser(d.uploadedBy).id, fullName: findUser(d.uploadedBy).fullName },
  department: findDept(d.departmentId),
}));

const ACTIVITY_FEED = MOCK_AUDIT.slice(0, 6).map((a) => ({
  id: a.id,
  action: a.action,
  resource: a.resource,
  resourceId: a.resourceId,
  details: a.details,
  ipAddress: a.ipAddress,
  createdAt: a.createdAt,
  user: a.user,
}));

/* ───────────────────── AI QUALITY / USAGE ─────────────────────── */

const AI_QUALITY_STATS = { totalRated: 245, likes: 208, dislikes: 37, satisfactionRate: 84.9, feedbackDetailRate: 62.0 };

const AI_QUALITY_TREND = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 2, 20 + i);
  return { date: d.toISOString().slice(0, 10), likes: 5 + (i % 4), dislikes: 1 + (i % 2), total: 6 + (i % 4) + (i % 2) };
});

const AI_QUALITY_FEEDBACKS = Array.from({ length: 25 }, (_, i) => ({
  id: `fb-${i + 1}`,
  content: 'Theo tài liệu QT-PX1-2026-01 về quy trình vận hành hệ thống monitoring P-18, bước kiểm tra đầu tiên là đo công suất phát tín hiệu bằng máy đo Tektronix TDS3054C...',
  userQuery: i % 2 === 0 ? 'Quy trình vận hành hệ thống monitoring P-18 gồm những bước nào?' : 'Thông số kỹ thuật hệ thống monitoring 36D6 là gì?',
  feedbackType: (i % 5 === 0 ? 'dislike' : 'like') as 'like' | 'dislike',
  feedbackTags: i % 3 === 0 ? ['chính xác', 'đầy đủ'] : null,
  feedbackText: i % 4 === 0 ? 'Câu trả lời rất hữu ích, nguồn trích dẫn đúng.' : null,
  feedbackAt: '2026-04-18T10:00:00Z',
  createdAt: '2026-04-18T09:55:00Z',
  user: { id: 'user-1', fullName: 'Hoàng Minh Tuấn', email: 'hmtuan@doanhnghiepa.vn' },
}));


const USAGE_STATS = {
  totalQuestions: { value: 1847, change: 12.4 },
  activeUsers:    { value: 68, change: 4.1 },
  avgQuestionsPerUser: 27.2,
  activeDepartments: { value: 11, change: 0 },
  period: '30d',
};

const USAGE_TREND = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 2, 20 + i);
  return { date: d.toISOString().slice(0, 10), total: 40 + ((i * 7) % 30) };
});

const USAGE_BY_DEPT = MOCK_DEPARTMENTS.slice(0, 8).map((d, i) => ({
  departmentId: d.id,
  departmentName: d.name,
  totalQuestions: 80 + i * 25,
  activeUsers: 4 + i,
}));

const INTENT_BREAKDOWN = {
  total: 1847,
  items: [
    { intent: 'rag',       count: 892, percentage: 48.3 },
    { intent: 'summarize', count: 312, percentage: 16.9 },
    { intent: 'translate', count: 245, percentage: 13.3 },
    { intent: 'compare',   count: 178, percentage:  9.6 },
    { intent: 'diff',      count: 132, percentage:  7.1 },
    { intent: 'chat',      count:  88, percentage:  4.8 },
  ],
};

const RETRY_STATS = { retryCount: 42, totalMessages: 1847, retryRate: 2.3, retryRateChange: -0.8, period: '30d' };

/* ───────────────────────── GLOSSARY ───────────────────────────── */

const GLOSSARY_CATEGORIES = [
  { id: 'gcat-1', name: 'Thuật ngữ hệ thống',     description: 'Hệ thống monitoring',  sourceLang: 'vi', targetLang: 'en', createdAt: '2025-06-01T08:00:00Z', _count: { terms: 48 } },
  { id: 'gcat-2', name: 'Thuật ngữ module',       description: 'Module phần mềm',      sourceLang: 'vi', targetLang: 'en', createdAt: '2025-06-15T08:00:00Z', _count: { terms: 36 } },
  { id: 'gcat-3', name: 'Thuật ngữ điện tử',      description: 'Linh kiện, mạch',      sourceLang: 'vi', targetLang: 'en', createdAt: '2025-07-10T08:00:00Z', _count: { terms: 64 } },
  { id: 'gcat-4', name: 'Thuật ngữ doanh nghiệp', description: 'Đơn vị, chức danh',    sourceLang: 'vi', targetLang: 'en', createdAt: '2025-08-01T08:00:00Z', _count: { terms: 25 } },
];

const GLOSSARY_TERMS = [
  { id: 'gt-1', term: 'Hệ thống cảnh báo sớm', categoryId: 'gcat-1', translatedTerm: 'Early-warning system',   definition: 'Hệ thống phát hiện sự cố ở phạm vi rộng', abbreviation: 'EWS', synonyms: 'Hệ thống cảnh báo từ xa', createdAt: '2025-06-02T08:00:00Z', updatedAt: '2025-12-10T08:00:00Z' },
  { id: 'gt-2', term: 'Module xử lý tín hiệu', categoryId: 'gcat-2', translatedTerm: 'Signal processing module', definition: 'Module xử lý tín hiệu đầu vào', abbreviation: 'SPM', synonyms: '', createdAt: '2025-06-16T08:00:00Z', updatedAt: '2025-12-10T08:00:00Z' },
  { id: 'gt-3', term: 'Khối thu phát',         categoryId: 'gcat-3', translatedTerm: 'Transceiver module',      definition: 'Khối thu và phát tín hiệu', abbreviation: 'T/R', synonyms: '', createdAt: '2025-07-12T08:00:00Z', updatedAt: '2025-12-10T08:00:00Z' },
].map((t) => ({ ...t, category: GLOSSARY_CATEGORIES.find((c) => c.id === t.categoryId)! }));

/* ───────────────── TRANSLATION / PUBLIC LINKS ─────────────────── */

const TRANSLATION_HISTORY = [
  { id: 'tr-1', userId: 'user-1', sourceLang: 'vi', targetLang: 'en', sourceText: 'Hệ thống cảnh báo sớm P-18', aiResult: 'P-18 early-warning system', editedResult: null, glossaryCategoryId: 'gcat-1', glossaryCategory: { id: 'gcat-1', name: 'Thuật ngữ hệ thống' }, charCount: 23, alternatives: null, selectedIndex: null, createdAt: '2026-04-18T10:00:00Z', updatedAt: '2026-04-18T10:00:00Z' },
  { id: 'tr-2', userId: 'user-1', sourceLang: 'vi', targetLang: 'en', sourceText: 'Biên bản nghiệm thu nâng cấp S-75', aiResult: 'S-75 upgrade acceptance record', editedResult: null, glossaryCategoryId: 'gcat-2', glossaryCategory: { id: 'gcat-2', name: 'Thuật ngữ module' }, charCount: 31, alternatives: null, selectedIndex: null, createdAt: '2026-04-17T14:00:00Z', updatedAt: '2026-04-17T14:00:00Z' },
];

/* ────────────────── MENTIONABLE DOCS / CITATIONS ──────────────── */

const MENTIONABLE_DOCS = MOCK_DOCUMENTS.map((d) => ({ id: d.id, fileName: d.fileName, mimeType: d.mimeType }));

/* ────────────────────────── ROUTER ───────────────────────────── */

function stripQuery(url: string): { path: string; qs: URLSearchParams } {
  const [path, query] = url.split('?');
  return { path: path.startsWith('/') ? path : '/' + path, qs: new URLSearchParams(query ?? '') };
}

function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / limit)) },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function routeMock(method: string, rawUrl: string, body?: unknown, paramsObj?: Record<string, any>): unknown {
  const { path, qs } = stripQuery(rawUrl);
  if (paramsObj) {
    for (const [k, v] of Object.entries(paramsObj)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const page = Number(qs.get('page') ?? 1);
  const limit = Number(qs.get('limit') ?? 20);
  const search = (qs.get('search') ?? '').trim().toLowerCase();

  /* Auth / profile / permissions */
  if (path === '/users/me' && method === 'GET') {
    return {
      id: MOCK_CURRENT_USER.id,
      username: MOCK_CURRENT_USER.username,
      email: MOCK_CURRENT_USER.email,
      fullName: MOCK_CURRENT_USER.fullName,
      phone: MOCK_CURRENT_USER.phone,
      avatarUrl: MOCK_CURRENT_USER.avatarUrl,
      department: MOCK_CURRENT_USER.department,
      roles: MOCK_CURRENT_USER.roles,
      createdAt: MOCK_CURRENT_USER.createdAt,
    };
  }
  if (path === '/users/me' && method === 'PUT') return { ...MOCK_CURRENT_USER, ...(body as object) };
  if (path === '/users/me/avatar' && method === 'POST') return { avatarUrl: '/avatar-mock.png' };

  if (path === '/permissions/my' && method === 'GET') {
    const all = RESOURCES.flatMap((r) => ACTIONS.map((a) => ({ resource: r, action: a })));
    return { userId: MOCK_CURRENT_USER.id, username: MOCK_CURRENT_USER.username, permissions: all, systemPermissions: all, departmentPermissions: [] };
  }
  if (path === '/permissions/registry' && method === 'GET') return PERMISSION_REGISTRY;
  if (path.startsWith('/permissions/for-role/') && method === 'GET') {
    const name = path.split('/').pop();
    return { roleName: name, roleDisplayName: name, permissions: RESOURCES.flatMap((r) => ACTIONS.map((a) => ({ resource: r, action: a }))) };
  }
  if (path.startsWith('/permissions/for-role/') && method === 'PUT') {
    const name = path.split('/').pop();
    return { roleName: name, permissions: (body as { permissions?: unknown[] })?.permissions ?? [], message: 'Đã cập nhật' };
  }
  if (path === '/permissions/share' && method === 'POST') return { data: { id: 'perm-new', ...(body as object) } };
  if (path.startsWith('/permissions/') && method === 'GET') return { data: [] };
  if (path.startsWith('/permissions/') && method === 'DELETE') return {};

  /* Auth endpoints */
  if (path === '/auth/logout-event' && method === 'POST') return {};
  if (path === '/auth/change-password' && method === 'POST') return { message: 'Đổi mật khẩu thành công' };
  if (path === '/auth/forgot-password' && method === 'POST') return { message: 'Đã gửi link đặt lại' };
  if (path === '/auth/reset-password' && method === 'POST') return { message: 'Đặt lại mật khẩu thành công' };

  /* Dashboard */
  if (path === '/dashboard/stats' && method === 'GET') return DASHBOARD_STATS;
  if (path === '/dashboard/charts/documents' && method === 'GET') return DASHBOARD_CHART;
  if (path === '/dashboard/charts/classification' && method === 'GET') return DATA_CLASSIFICATION;
  if (path === '/dashboard/recent-documents' && method === 'GET') return RECENT_DOCUMENTS;
  if (path === '/dashboard/activity' && method === 'GET') return ACTIVITY_FEED;

  /* Documents */
  if (path === '/documents/mentionable' && method === 'GET') {
    const filtered = MENTIONABLE_DOCS.filter((d) => !search || d.fileName.toLowerCase().includes(search));
    return { data: filtered, meta: { total: filtered.length } };
  }
  if (path === '/documents/count-by-department' && method === 'GET') {
    const ids = (qs.get('departmentIds') ?? '').split(',').filter(Boolean);
    const result: Record<string, number> = {};
    for (const id of ids) {
      result[id] = MOCK_DOCUMENTS.filter((d) => d.departmentId === id).length;
    }
    return { data: result };
  }
  if (path === '/documents/chunk-text' && method === 'GET') return { original_text: SAMPLE_EXTRACTED };
  if (path === '/documents' && method === 'GET') {
    let items = MOCK_DOCUMENTS.slice();
    const folderId = qs.get('folderId');
    const deptId = qs.get('departmentId');
    const status = qs.get('status');
    if (folderId) items = items.filter((d) => d.folderId === folderId || (folderId === 'root' && !d.folderId));
    if (deptId && deptId !== 'all' && deptId !== 'personal') items = items.filter((d) => d.departmentId === deptId);
    if (status) items = items.filter((d) => d.status === status);
    if (search) items = items.filter((d) => d.title.toLowerCase().includes(search) || d.fileName.toLowerCase().includes(search));
    const { data, meta } = paginate(items.map(enrichDoc), page, limit);
    return { data, meta };
  }
  if (path === '/documents/upload' && method === 'POST') {
    const newDoc = enrichDoc(MOCK_DOCUMENTS[0]);
    return { data: newDoc, autoSharedWithDepartment: null };
  }
  if (path === '/documents/move-bulk' && method === 'PUT') return { data: { movedCount: 1, previousFolders: {} } };
  const docIdMatch = path.match(/^\/documents\/([^/]+)(\/.*)?$/);
  if (docIdMatch) {
    const docId = docIdMatch[1];
    const sub = docIdMatch[2] ?? '';
    const doc = MOCK_DOCUMENTS.find((d) => d.id === docId) ?? MOCK_DOCUMENTS[0];
    const enriched = enrichDoc(doc);

    if (sub === '' && method === 'GET') return { data: enriched };
    if (sub === '' && method === 'DELETE') return { message: 'Đã xóa tài liệu' };
    if (sub === '/preview' && method === 'GET') return { url: '#', fileName: doc.fileName, mimeType: doc.mimeType, fileSize: doc.fileSize, title: doc.title, permissionLevel: 'EDITOR' };
    if (sub === '/text' && method === 'GET') return { extractedText: SAMPLE_EXTRACTED, extractionStatus: 'COMPLETED', extractedAt: '2026-04-18T10:00:00Z' };
    if (sub === '/download' && method === 'GET') return new Blob([SAMPLE_EXTRACTED], { type: 'text/plain' });
    if (sub === '/stream' && method === 'GET') return new Blob([SAMPLE_EXTRACTED], { type: 'text/plain' });
    if (sub === '/rename' && method === 'PATCH') return { data: { ...enriched, title: (body as { title?: string })?.title ?? enriched.title } };
    if (sub === '/move' && method === 'PUT') return { data: enriched };
    if (sub === '/re-extract' && method === 'POST') return { success: true, message: 'Đã gửi yêu cầu trích xuất lại' };
    if (sub === '/cancel-extract' && method === 'POST') return { success: true, message: 'Đã hủy trích xuất' };
    if (sub === '/cancel-embed' && method === 'POST') return { success: true, message: 'Đã hủy nhúng' };
    if (sub === '/re-embed' && method === 'POST') return { success: true, message: 'Đã nhúng lại' };
    if (sub === '/activate' && method === 'PATCH') return { data: { ...enriched, status: 'ACTIVE' } };
    if (sub === '/deactivate' && method === 'PATCH') return { data: { ...enriched, status: 'INACTIVE' } };
    if (sub === '/content' && method === 'PUT') return { success: true };
    if (sub === '/file' && method === 'PUT') return { success: true, fileSize: doc.fileSize };
    if (sub === '/security-level' && method === 'PATCH') return { data: enriched };
    if (sub === '/versions' && method === 'GET') return [];
    const versionMatch = sub.match(/^\/versions\/([^/]+)(\/.*)?$/);
    if (versionMatch) {
      const vsub = versionMatch[2] ?? '';
      if (vsub === '/text' && method === 'GET') return { text: SAMPLE_EXTRACTED };
      if (vsub === '/download' && method === 'GET') return new Blob([SAMPLE_EXTRACTED], { type: 'text/plain' });
      if (vsub === '/restore' && method === 'POST') return {};
      if (vsub === '' && method === 'DELETE') return { message: 'Đã xóa phiên bản' };
    }
  }

  /* Folders */
  if (path === '/folders/tree' && method === 'GET') {
    const deptId = qs.get('departmentId');
    const counts: Record<string, number> = {};
    for (const d of MOCK_DOCUMENTS) {
      if (d.folderId) counts[d.folderId] = (counts[d.folderId] ?? 0) + 1;
      if (deptId && deptId !== 'all' && d.departmentId !== deptId) continue;
    }
    const buildChildren = (parent: string | null): any[] => {
      return MOCK_FOLDERS.filter((f) => f.parentId === parent).map((f) => ({
        id: f.id, name: f.name, parentId: f.parentId, createdBy: f.createdBy, sortOrder: f.sortOrder,
        createdAt: f.createdAt, updatedAt: f.updatedAt, documentCount: counts[f.id] ?? 0,
        permissionLevel: f.permissionLevel, children: buildChildren(f.id),
      }));
    };
    return { data: buildChildren(null) };
  }
  if (path === '/folders/children' && method === 'GET') {
    const parentId = qs.get('parentId') === 'root' ? null : qs.get('parentId') ?? null;
    const folders = MOCK_FOLDERS.filter((f) => f.parentId === parentId).map((f) => ({
      id: f.id, name: f.name, type: 'FOLDER' as const, parentId: f.parentId,
      documentCount: MOCK_DOCUMENTS.filter((d) => d.folderId === f.id).length,
      createdAt: f.createdAt, createdBy: f.createdBy,
      createdByUser: findUser(f.createdBy),
      sortOrder: f.sortOrder, updatedAt: f.updatedAt, permissionLevel: f.permissionLevel,
    }));
    const docs = MOCK_DOCUMENTS.filter((d) => d.folderId === parentId).map((d) => ({
      id: d.id, title: d.title, type: 'DOCUMENT' as const, fileName: d.fileName, fileSize: d.fileSize,
      mimeType: d.mimeType, storagePath: d.storagePath, folderId: d.folderId,
      departmentId: d.departmentId, uploadedBy: d.uploadedBy, status: d.status,
      securityLevel: d.securityLevel, createdAt: d.createdAt, updatedAt: d.updatedAt,
      permissionLevel: d.permissionLevel, uploader: findUser(d.uploadedBy), department: findDept(d.departmentId),
    }));
    let items = [...folders, ...docs];
    if (search) items = items.filter((it) => ('title' in it ? it.title : it.name).toLowerCase().includes(search));
    const { data, meta } = paginate(items, page, limit);
    return { data, meta, folderCount: folders.length };
  }
  if (path === '/folders' && method === 'POST') {
    const b = body as { name?: string; parentId?: string };
    return { data: { id: `fold-${Date.now()}`, name: b.name ?? 'New', parentId: b.parentId ?? null, createdBy: MOCK_CURRENT_USER.id, sortOrder: 99, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
  }
  const folderIdMatch = path.match(/^\/folders\/([^/]+)(\/.*)?$/);
  if (folderIdMatch) {
    const folderId = folderIdMatch[1];
    const sub = folderIdMatch[2] ?? '';
    const f = MOCK_FOLDERS.find((x) => x.id === folderId) ?? MOCK_FOLDERS[0];
    if (sub === '' && method === 'PUT') return { data: { ...f, name: (body as { name?: string })?.name ?? f.name } };
    if (sub === '' && method === 'DELETE') return { data: { success: true } };
    if (sub === '/stats' && method === 'GET') {
      const subCount = MOCK_FOLDERS.filter((x) => x.parentId === folderId).length;
      const docCount = MOCK_DOCUMENTS.filter((x) => x.folderId === folderId).length;
      return { data: { subfolderCount: subCount, documentCount: docCount } };
    }
  }

  /* Users */
  if (path === '/users' && method === 'GET') {
    let items = MOCK_USERS.slice();
    if (search) items = items.filter((u) => u.fullName.toLowerCase().includes(search) || u.username.toLowerCase().includes(search));
    return paginate(items, page, limit);
  }
  if (path === '/users' && method === 'POST') return { data: MOCK_USERS[0] };
  const userIdMatch = path.match(/^\/users\/([^/]+)(\/.*)?$/);
  if (userIdMatch) {
    const userId = userIdMatch[1];
    const sub = userIdMatch[2] ?? '';
    const u = MOCK_USERS.find((x) => x.id === userId) ?? MOCK_USERS[0];
    if (sub === '' && method === 'GET') return { data: u };
    if (sub === '' && method === 'PUT') return { data: { ...u, ...(body as object) } };
    if (sub === '/lock' && method === 'POST') return { data: { ...u, isActive: false } };
    if (sub === '/unlock' && method === 'POST') return { data: { ...u, isActive: true } };
    if (sub === '/reset-password' && method === 'POST') return { data: { newPassword: 'DA@Temp2026' } };
    if (sub === '/roles' && method === 'PUT') return { data: u };
  }

  /* Roles */
  if (path === '/roles' && method === 'GET') return paginate(MOCK_ROLES, page, limit);
  if (path === '/roles/options' && method === 'GET') return MOCK_ROLES.map((r) => ({ id: r.id, name: r.name, displayName: r.displayName }));
  if (path === '/roles' && method === 'POST') return { data: MOCK_ROLES[3] };
  const roleIdMatch = path.match(/^\/roles\/([^/]+)$/);
  if (roleIdMatch) {
    const id = roleIdMatch[1];
    const r = MOCK_ROLES.find((x) => x.id === id) ?? MOCK_ROLES[0];
    if (method === 'GET') return { data: r };
    if (method === 'PUT') return { data: { ...r, ...(body as object) } };
    if (method === 'DELETE') return { data: { success: true } };
  }

  /* Departments */
  if (path === '/departments/tree' && method === 'GET') {
    return {
      data: MOCK_DEPARTMENTS.map((d) => ({ ...d, children: [], _count: { userDepartments: deptUserCount(d.id), children: 0 } })),
    };
  }
  if (path === '/departments' && method === 'GET') {
    const parentId = qs.get('parentId');
    let items = MOCK_DEPARTMENTS.slice();
    if (parentId && parentId !== 'root') items = items.filter((d) => d.parentId === parentId);
    else if (parentId === 'root') items = items.filter((d) => d.parentId === null);
    if (search) items = items.filter((d) => d.name.toLowerCase().includes(search) || d.code.toLowerCase().includes(search));
    const enriched = items.map((d) => ({
      ...d,
      parent: null,
      _count: { userDepartments: deptUserCount(d.id), children: MOCK_DEPARTMENTS.filter((x) => x.parentId === d.id).length },
    }));
    return paginate(enriched, page, limit);
  }
  if (path === '/departments' && method === 'POST') return { data: MOCK_DEPARTMENTS[0] };
  const deptMatch = path.match(/^\/departments\/([^/]+)(\/.*)?$/);
  if (deptMatch) {
    const id = deptMatch[1];
    const sub = deptMatch[2] ?? '';
    const d = MOCK_DEPARTMENTS.find((x) => x.id === id) ?? MOCK_DEPARTMENTS[0];
    if (sub === '' && method === 'GET') return { data: { ...d, children: [], _count: { userDepartments: deptUserCount(d.id), children: 0 } } };
    if (sub === '' && method === 'PUT') return { data: { ...d, ...(body as object) } };
    if (sub === '' && method === 'DELETE') return { data: { success: true } };
    if (sub === '/users' && method === 'GET') {
      const users = MOCK_USERS.filter((u) => u.department?.id === id).map((u) => ({
        id: `ud-${u.id}`, userId: u.id, username: u.username, email: u.email, fullName: u.fullName, phone: u.phone, isActive: u.isActive, joinedAt: u.createdAt, roles: u.roles,
      }));
      return paginate(users, page, limit);
    }
    if (sub === '/users' && method === 'POST') return { data: MOCK_DEPARTMENTS[0] };
    if (sub.startsWith('/users/') && method === 'DELETE') return { data: { success: true } };
    if (sub === '/users/transfer' && method === 'POST') return { data: { success: true } };
  }

  /* Audit */
  if (path === '/audit' && method === 'GET') {
    let items = MOCK_AUDIT.slice();
    if (search) items = items.filter((a) => a.resource.includes(search) || a.action.includes(search));
    return paginate(items, page, limit);
  }
  if (path === '/audit/export' && method === 'GET') return new Blob(['id,action,resource,createdAt\n1,upload,documents,2026-04-18'], { type: 'text/csv' });

  /* Chat */
  if (path === '/chat/sessions' && method === 'GET') return paginate(MOCK_CHAT_SESSIONS, page, limit);
  if (path === '/chat/sessions' && method === 'POST') {
    const b = body as { title?: string };
    return { id: `chat-${Date.now()}`, userId: MOCK_CURRENT_USER.id, title: b?.title ?? 'Phiên mới', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _count: { messages: 0 }, messageCount: 0 };
  }
  const chatMatch = path.match(/^\/chat\/sessions\/([^/]+)(\/.*)?$/);
  if (chatMatch) {
    const sid = chatMatch[1];
    const sub = chatMatch[2] ?? '';
    const sess = MOCK_CHAT_SESSIONS.find((x) => x.id === sid) ?? MOCK_CHAT_SESSIONS[0];
    if (sub === '' && method === 'GET') return sess;
    if (sub === '' && method === 'PUT') return { ...sess, ...(body as object) };
    if (sub === '' && method === 'DELETE') return {};
    if (sub === '/generate-title' && method === 'POST') return { title: 'Tiêu đề được AI sinh tự động' };
    if (sub === '/generate-summary' && method === 'POST') return { summary: 'Tóm tắt phiên chat về hệ thống monitoring và module phần mềm tại Doanh nghiệp A.' };
    if (sub === '/messages' && method === 'GET') {
      const msgs = [
        { id: 'msg-1', sessionId: sid, role: 'USER' as const, content: 'Quy trình vận hành hệ thống monitoring P-18 gồm những bước nào?', sources: null, createdAt: '2026-04-18T09:15:00Z', messageType: 'rag' as const },
        { id: 'msg-2', sessionId: sid, role: 'ASSISTANT' as const, content: 'Theo tài liệu QT-PX1-2026-01, quy trình vận hành hệ thống monitoring P-18 gồm 6 bước chính: tiếp nhận, tháo rời, sửa chữa, lắp ráp, chạy thử, nghiệm thu QA.', sources: [{ doc_id: 'doc-001', file_name: 'Quy trình vận hành hệ thống monitoring P-18.pdf', score: 0.92, page_numbers: [1, 2] }], createdAt: '2026-04-18T09:15:10Z', messageType: 'rag' as const },
      ];
      return paginate(msgs, page, limit);
    }
    if (sub === '/referenced-documents' && method === 'GET') {
      return { data: MOCK_DOCUMENTS.slice(0, 3).map((d) => ({ documentId: d.id, documentName: d.title, fileName: d.fileName, referenceCount: 2 })) };
    }
    if (sub === '/language' && method === 'PUT') return { ...sess, ...(body as object) };
  }
  if (path.startsWith('/chat/messages/') && method === 'PUT') return body;

  /* AI Quality */
  if (path === '/ai-quality/stats' && method === 'GET') return AI_QUALITY_STATS;
  if (path === '/ai-quality/trend' && method === 'GET') return AI_QUALITY_TREND;
  if (path === '/ai-quality/feedbacks' && method === 'GET') return paginate(AI_QUALITY_FEEDBACKS, page, limit);
  if (path.startsWith('/ai-quality/feedbacks/') && method === 'GET') return AI_QUALITY_FEEDBACKS[0];
  if (path === '/ai-quality/usage/stats' && method === 'GET') return USAGE_STATS;
  if (path === '/ai-quality/usage/trend' && method === 'GET') return USAGE_TREND;
  if (path === '/ai-quality/usage/by-department' && method === 'GET') return USAGE_BY_DEPT;
  if (path === '/ai-quality/usage/by-intent' && method === 'GET') return INTENT_BREAKDOWN;
  if (path === '/ai-quality/retry/stats' && method === 'GET') return RETRY_STATS;
  if (path === '/ai-quality/users/stats' && method === 'GET') {
    const stats = MOCK_USERS.map((u, i) => ({
      userId: u.id, userName: u.fullName, email: u.email,
      totalMessages: 120 + i * 17, totalSessions: 8 + i * 2,
      feedbackRate: 45 + (i * 3) % 30, retryRate: 2 + (i % 4),
    }));
    return paginate(stats, page, limit);
  }
  if (path === '/ai-quality/export' && method === 'GET') return new Blob(['stub'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  /* Glossary */
  if (path === '/glossary' && method === 'GET') return paginate(GLOSSARY_TERMS, page, limit);
  if (path === '/glossary' && method === 'POST') return GLOSSARY_TERMS[0];
  if (path === '/glossary/categories' && method === 'GET') return paginate(GLOSSARY_CATEGORIES, page, limit);
  if (path === '/glossary/categories' && method === 'POST') return GLOSSARY_CATEGORIES[0];
  if (path === '/glossary/import' && method === 'POST') return { total: 0, success: 0, skipped: 0, failed: 0, rows: [] };
  if (path.startsWith('/glossary/export') && method === 'GET') return new Blob(['term,translated\n'], { type: 'text/csv' });
  if (path.startsWith('/glossary/template') && method === 'GET') return new Blob(['term,translated\n'], { type: 'text/csv' });
  const gcatVer = path.match(/^\/glossary\/categories\/([^/]+)\/versions(\/.*)?$/);
  if (gcatVer) {
    if (method === 'GET') return { data: [] };
    if (method === 'POST') return { data: { id: 'gv-1', categoryId: gcatVer[1], name: 'v1', note: null, isAutoSave: false, snapshotData: { category: GLOSSARY_CATEGORIES[0], terms: [], capturedAt: new Date().toISOString(), termCount: 0 }, createdBy: MOCK_CURRENT_USER.id, createdAt: new Date().toISOString() } };
    if (method === 'DELETE') return {};
  }
  const gcatMatch = path.match(/^\/glossary\/categories\/([^/]+)$/);
  if (gcatMatch) {
    const c = GLOSSARY_CATEGORIES.find((x) => x.id === gcatMatch[1]) ?? GLOSSARY_CATEGORIES[0];
    if (method === 'GET') return { data: c };
    if (method === 'PATCH') return { ...c, ...(body as object) };
    if (method === 'DELETE') return {};
  }
  const gtMatch = path.match(/^\/glossary\/([^/]+)$/);
  if (gtMatch && !path.startsWith('/glossary/categories') && !path.startsWith('/glossary/template') && !path.startsWith('/glossary/export') && !path.startsWith('/glossary/import')) {
    const t = GLOSSARY_TERMS.find((x) => x.id === gtMatch[1]) ?? GLOSSARY_TERMS[0];
    if (method === 'GET') return t;
    if (method === 'PATCH') return { ...t, ...(body as object) };
    if (method === 'DELETE') return {};
  }

  /* Translate */
  if (path === '/translate/history' && method === 'GET') {
    return { data: TRANSLATION_HISTORY, total: TRANSLATION_HISTORY.length, page, limit };
  }
  if (path === '/translate/stats' && method === 'GET') {
    return {
      timeSeries: USAGE_TREND.map((u) => ({ date: u.date, count: Math.floor(u.total / 3), totalChars: u.total * 20 })),
      languagePairs: [{ sourceLang: 'vi', targetLang: 'en', count: 180, totalChars: 12400 }, { sourceLang: 'en', targetLang: 'vi', count: 75, totalChars: 5300 }],
      topUsers: MOCK_USERS.slice(0, 5).map((u) => ({ userId: u.id, userName: u.fullName, count: 30, totalChars: 2500 })),
      topDepartments: MOCK_DEPARTMENTS.slice(0, 5).map((d) => ({ departmentId: d.id, departmentName: d.name, count: 45, totalChars: 3600 })),
      totalChars: 17700, totalCount: 255, estimatedCostUsd: 0.18, costPerChar: 0.00001,
    };
  }
  if (path.startsWith('/translate/export/') && method === 'GET') return new Blob(['source,target\n'], { type: 'text/csv' });
  const trMatch = path.match(/^\/translate\/([^/]+)$/);
  if (trMatch) {
    const t = TRANSLATION_HISTORY.find((x) => x.id === trMatch[1]) ?? TRANSLATION_HISTORY[0];
    if (method === 'GET') return t;
    if (method === 'PATCH') return { message: 'Đã cập nhật', id: t.id };
    if (method === 'DELETE') return {};
  }

  /* Public links */
  if (path === '/public-links' && method === 'POST') {
    const b = body as { resourceType: 'DOCUMENT' | 'FOLDER'; resourceId: string; permissionLevel?: 'VIEWER' | 'EDITOR' };
    return {
      data: {
        id: `pl-${Date.now()}`, token: 'mock-token-' + Date.now().toString(36),
        resourceType: b.resourceType, resourceId: b.resourceId, permissionLevel: b.permissionLevel ?? 'VIEWER',
        isActive: true, createdAt: new Date().toISOString(),
        url: `/public/mock-token-${Date.now().toString(36)}`,
      },
    };
  }
  if (path === '/public-links/my' && method === 'GET') return { data: [] };
  if (path.startsWith('/public-links/') && method === 'DELETE') return {};
  if (path.startsWith('/public-links/') && method === 'PATCH') return { data: { ...(body as object), id: 'pl-1' } };

  /* Fallback — trả rỗng để UI không crash */
  if (method === 'GET') return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
  return {};
}
