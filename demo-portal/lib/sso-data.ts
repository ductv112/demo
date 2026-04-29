// SSO Management mock data — Doanh nghiệp A

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SsoPermission {
  id: string;
  module: string;
  feature: string;
  action: "view" | "create" | "update" | "delete" | "approve";
  description: string;
}

export interface SsoRole {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  permissionIds: string[];
  isSystem: boolean;
}

export interface SsoUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  rank: string;
  department: string;
  position: string;
  status: "active" | "inactive" | "locked";
  roleIds: string[];
  lastLogin: string;
  createdAt: string;
}

export interface SsoConfig {
  provider: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  ssoEndpoint: string;
  enabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockDuration: number;
  twoFactorEnabled: boolean;
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export const ssoPermissions: SsoPermission[] = [
  // Portal
  { id: "perm_01", module: "Portal", feature: "Cổng thông tin", action: "view", description: "Xem cổng thông tin nội bộ" },
  { id: "perm_02", module: "Portal", feature: "Nội dung CMS", action: "create", description: "Tạo bài viết, tin tức, thông báo" },
  { id: "perm_03", module: "Portal", feature: "Nội dung CMS", action: "update", description: "Chỉnh sửa nội dung đã đăng" },
  { id: "perm_04", module: "Portal", feature: "Nội dung CMS", action: "delete", description: "Xoá bài viết và nội dung" },
  // SSO
  { id: "perm_05", module: "SSO", feature: "Người dùng", action: "view", description: "Xem danh sách người dùng" },
  { id: "perm_06", module: "SSO", feature: "Người dùng", action: "create", description: "Tạo tài khoản người dùng mới" },
  { id: "perm_07", module: "SSO", feature: "Người dùng", action: "update", description: "Chỉnh sửa thông tin người dùng" },
  { id: "perm_08", module: "SSO", feature: "Người dùng", action: "delete", description: "Khoá và xoá tài khoản" },
  { id: "perm_09", module: "SSO", feature: "Vai trò & Quyền", action: "view", description: "Xem cấu hình vai trò và quyền" },
  { id: "perm_10", module: "SSO", feature: "Vai trò & Quyền", action: "update", description: "Chỉnh sửa vai trò và phân quyền" },
  // Tài chính
  { id: "perm_11", module: "Tài chính", feature: "Báo cáo tài chính", action: "view", description: "Xem báo cáo và số liệu tài chính" },
  { id: "perm_12", module: "Tài chính", feature: "Chứng từ kế toán", action: "create", description: "Tạo và nhập chứng từ kế toán" },
  { id: "perm_13", module: "Tài chính", feature: "Chứng từ kế toán", action: "approve", description: "Phê duyệt chứng từ và thanh toán" },
  // Mua hàng
  { id: "perm_14", module: "Mua hàng", feature: "Đơn đặt hàng", action: "view", description: "Xem đơn đặt hàng và nhà cung cấp" },
  { id: "perm_15", module: "Mua hàng", feature: "Đơn đặt hàng", action: "create", description: "Tạo đơn đặt hàng mới" },
  { id: "perm_16", module: "Mua hàng", feature: "Đơn đặt hàng", action: "approve", description: "Phê duyệt đơn mua hàng" },
  // Sản xuất
  { id: "perm_17", module: "Sản xuất", feature: "Lệnh sản xuất", action: "view", description: "Xem kế hoạch và lệnh sản xuất" },
  { id: "perm_18", module: "Sản xuất", feature: "Lệnh sản xuất", action: "update", description: "Cập nhật tiến độ sản xuất" },
  { id: "perm_19", module: "Sản xuất", feature: "BOM & Quy trình", action: "create", description: "Quản lý BOM và công nghệ sản xuất" },
  // Kho tàng
  { id: "perm_20", module: "Kho tàng", feature: "Tồn kho", action: "view", description: "Xem tồn kho và vị trí vật tư" },
  { id: "perm_21", module: "Kho tàng", feature: "Xuất/Nhập kho", action: "create", description: "Tạo phiếu xuất/nhập kho" },
  { id: "perm_22", module: "Kho tàng", feature: "Xuất/Nhập kho", action: "approve", description: "Phê duyệt phiếu xuất/nhập kho" },
  // Chất lượng
  { id: "perm_23", module: "Chất lượng", feature: "Kế hoạch kiểm tra", action: "view", description: "Xem kế hoạch và biên bản kiểm tra" },
  { id: "perm_24", module: "Chất lượng", feature: "Kết quả KCS", action: "create", description: "Nhập kết quả kiểm tra chất lượng" },
  // Hệ thống
  { id: "perm_25", module: "Hệ thống", feature: "Nhật ký hệ thống", action: "view", description: "Xem log và nhật ký hoạt động" },
  { id: "perm_26", module: "Hệ thống", feature: "Cấu hình hệ thống", action: "update", description: "Thay đổi cấu hình toàn hệ thống" },
];

// ─── Roles ───────────────────────────────────────────────────────────────────

export const ssoRoles: SsoRole[] = [
  {
    id: "role_01",
    name: "Quản trị hệ thống",
    code: "Quản trị hệ thống",
    description: "Toàn quyền quản trị hệ thống SSO, người dùng và cấu hình",
    color: "#dc2626",
    permissionIds: ssoPermissions.map((p) => p.id),
    isSystem: true,
  },
  {
    id: "role_02",
    name: "Giám đốc",
    code: "Giám đốc",
    description: "Xem tổng quan toàn bộ phân hệ, phê duyệt cấp cao",
    color: "#7c3aed",
    permissionIds: ["perm_01", "perm_11", "perm_13", "perm_14", "perm_16", "perm_17", "perm_20", "perm_23", "perm_25"],
    isSystem: true,
  },
  {
    id: "role_03",
    name: "Trưởng phòng",
    code: "Trưởng phòng",
    description: "Quản lý nghiệp vụ trong phạm vi phòng/ban, phê duyệt nội bộ",
    color: "#1B3A5C",
    permissionIds: ["perm_01", "perm_11", "perm_12", "perm_13", "perm_14", "perm_15", "perm_17", "perm_20", "perm_21", "perm_23"],
    isSystem: false,
  },
  {
    id: "role_04",
    name: "Phó phòng",
    code: "Phó phòng",
    description: "Hỗ trợ trưởng phòng, xử lý nghiệp vụ và ký thừa lệnh",
    color: "#0891b2",
    permissionIds: ["perm_01", "perm_11", "perm_12", "perm_14", "perm_15", "perm_17", "perm_20", "perm_21", "perm_23"],
    isSystem: false,
  },
  {
    id: "role_05",
    name: "Chuyên viên",
    code: "Chuyên viên",
    description: "Thực hiện công tác nghiệp vụ chuyên môn, nhập liệu và báo cáo",
    color: "#059669",
    permissionIds: ["perm_01", "perm_11", "perm_12", "perm_14", "perm_15", "perm_17", "perm_18", "perm_20", "perm_23", "perm_24"],
    isSystem: false,
  },
  {
    id: "role_06",
    name: "Kỹ thuật viên",
    code: "Kỹ thuật viên",
    description: "Thực hiện công tác kỹ thuật tại trung tâm, cập nhật tiến độ",
    color: "#d97706",
    permissionIds: ["perm_01", "perm_17", "perm_18", "perm_20", "perm_23", "perm_24"],
    isSystem: false,
  },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const ssoUsers: SsoUser[] = [
  {
    id: "user_01",
    username: "phamquochung",
    fullName: "Phạm Quốc Hưng",
    email: "phamquochung@z119.mil.vn",
    rank: "GĐ",
    department: "Ban Giám đốc",
    position: "Giám đốc",
    status: "active",
    roleIds: ["role_02"],
    lastLogin: "13/04/2026 07:45",
    createdAt: "01/01/2022",
  },
  {
    id: "user_02",
    username: "nguyenthanhbinh",
    fullName: "Nguyễn Thành Bình",
    email: "nguyenthanhbinh@z119.mil.vn",
    rank: "Phó GĐ",
    department: "Ban Giám đốc",
    position: "Phó Giám đốc Kỹ thuật",
    status: "active",
    roleIds: ["role_02", "role_03"],
    lastLogin: "13/04/2026 08:10",
    createdAt: "01/01/2022",
  },
  {
    id: "user_03",
    username: "tranvanlong",
    fullName: "Trần Văn Long",
    email: "tranvanlong@z119.mil.vn",
    rank: "Trưởng phòng",
    department: "Phòng Tài chính - Kế toán",
    position: "Trưởng phòng TCKT",
    status: "active",
    roleIds: ["role_03"],
    lastLogin: "12/04/2026 16:30",
    createdAt: "15/03/2022",
  },
  {
    id: "user_04",
    username: "hoangminhtuan",
    fullName: "Hoàng Minh Tuấn",
    email: "hoangminhtuan@z119.mil.vn",
    rank: "Trưởng phòng",
    department: "Phòng Kế hoạch",
    position: "Trưởng phòng Kế hoạch",
    status: "active",
    roleIds: ["role_03"],
    lastLogin: "13/04/2026 09:15",
    createdAt: "20/04/2022",
  },
  {
    id: "user_05",
    username: "levanchinh",
    fullName: "Lê Văn Chính",
    email: "levanchinh@z119.mil.vn",
    rank: "Trưởng nhóm",
    department: "Phòng Kỹ thuật",
    position: "Phó phòng Kỹ thuật",
    status: "active",
    roleIds: ["role_04"],
    lastLogin: "11/04/2026 14:20",
    createdAt: "01/06/2022",
  },
  {
    id: "user_06",
    username: "nguyenthikimanh",
    fullName: "Nguyễn Thị Kim Anh",
    email: "nguyenthikimanh@z119.mil.vn",
    rank: "CV cao cấp",
    department: "Phòng Tài chính - Kế toán",
    position: "Chuyên viên kế toán",
    status: "active",
    roleIds: ["role_05"],
    lastLogin: "13/04/2026 08:55",
    createdAt: "10/07/2022",
  },
  {
    id: "user_07",
    username: "dinhquanghuy",
    fullName: "Đinh Quang Huy",
    email: "dinhquanghuy@z119.mil.vn",
    rank: "Trưởng phòng",
    department: "Trung tâm Vận hành Monitoring",
    position: "Trưởng nhóm Trung tâm",
    status: "active",
    roleIds: ["role_03"],
    lastLogin: "12/04/2026 10:00",
    createdAt: "05/08/2022",
  },
  {
    id: "user_08",
    username: "vuvannam",
    fullName: "Vũ Văn Nam",
    email: "vuvannam@z119.mil.vn",
    rank: "Trưởng nhóm",
    department: "Trung tâm Vận hành Module",
    position: "Kỹ thuật viên cao cấp",
    status: "active",
    roleIds: ["role_06"],
    lastLogin: "10/04/2026 07:30",
    createdAt: "12/09/2022",
  },
  {
    id: "user_09",
    username: "phamthithuhuong",
    fullName: "Phạm Thị Thu Hương",
    email: "phamthithuhuong@z119.mil.vn",
    rank: "Trưởng nhóm",
    department: "Phòng Logistics - Kỹ thuật",
    position: "Chuyên viên logistics",
    status: "active",
    roleIds: ["role_05"],
    lastLogin: "09/04/2026 13:45",
    createdAt: "20/10/2022",
  },
  {
    id: "user_10",
    username: "nguyenduchung",
    fullName: "Nguyễn Đức Hùng",
    email: "nguyenduchung@z119.mil.vn",
    rank: "Phó GĐ",
    department: "Phòng Truyền thông",
    position: "Trưởng phòng Truyền thông",
    status: "active",
    roleIds: ["role_03"],
    lastLogin: "08/04/2026 09:00",
    createdAt: "01/01/2022",
  },
  {
    id: "user_11",
    username: "buithanhtu",
    fullName: "Bùi Thành Tú",
    email: "buithanhtu@z119.mil.vn",
    rank: "CV cao cấp",
    department: "Trung tâm Cơ khí",
    position: "Kỹ thuật viên",
    status: "active",
    roleIds: ["role_06"],
    lastLogin: "07/04/2026 15:10",
    createdAt: "15/11/2022",
  },
  {
    id: "user_12",
    username: "tranthibich",
    fullName: "Trần Thị Bích",
    email: "tranthibich@z119.mil.vn",
    rank: "CV cao cấp",
    department: "Phòng KCS & Đảm bảo CL",
    position: "Nhân viên KCS",
    status: "inactive",
    roleIds: ["role_05"],
    lastLogin: "25/03/2026 11:20",
    createdAt: "01/02/2023",
  },
  {
    id: "user_13",
    username: "hoangvantoan",
    fullName: "Hoàng Văn Toàn",
    email: "hoangvantoan@z119.mil.vn",
    rank: "Trưởng nhóm",
    department: "Trung tâm Điện tử",
    position: "Kỹ thuật viên điện tử",
    status: "active",
    roleIds: ["role_06"],
    lastLogin: "12/04/2026 08:45",
    createdAt: "10/03/2023",
  },
  {
    id: "user_14",
    username: "ngocanh",
    fullName: "Ngô Cẩm Anh",
    email: "ngocanh@z119.mil.vn",
    rank: "CV cao cấp",
    department: "Phòng Kế hoạch",
    position: "Chuyên viên kế hoạch",
    status: "locked",
    roleIds: ["role_05"],
    lastLogin: "01/04/2026 10:00",
    createdAt: "20/04/2023",
  },
  {
    id: "user_15",
    username: "sysadmin",
    fullName: "Quản trị viên hệ thống",
    email: "admin@z119.mil.vn",
    rank: "—",
    department: "Phòng Kỹ thuật",
    position: "Quản trị viên CNTT",
    status: "active",
    roleIds: ["role_01"],
    lastLogin: "13/04/2026 06:00",
    createdAt: "01/01/2022",
  },
];

// ─── SSO Config ───────────────────────────────────────────────────────────────

export const ssoConfig: SsoConfig = {
  provider: "LDAP",
  clientId: "z119-sso-client",
  clientSecret: "s3cr3t-z119-k3yc10ak-2026",
  redirectUrl: "https://pkkq-portal-staging.dft.vn/auth/callback",
  ssoEndpoint: "ldap://ldap.z119.mil.vn:389/dc=z119,dc=mil,dc=vn",
  enabled: true,
  sessionTimeout: 480,
  maxLoginAttempts: 5,
  lockDuration: 30,
  twoFactorEnabled: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const departments = [
  "Ban Giám đốc",
  "Phòng Truyền thông",
  "Phòng Tài chính - Kế toán",
  "Phòng Kế hoạch",
  "Phòng Kỹ thuật",
  "Phòng Logistics - Kỹ thuật",
  "Phòng KCS & Đảm bảo CL",
  "Trung tâm Vận hành Monitoring",
  "Trung tâm Vận hành Module",
  "Trung tâm Cơ khí",
  "Trung tâm Điện tử",
];

export const jobTitles = [
  "GĐ",
  "Phó GĐ",
  "Phó GĐ",
  "Trưởng phòng",
  "Trưởng nhóm",
  "CV cao cấp",
  "CV cao cấp",
  "Nhân viên",
  "—",
];

export const permissionModules = [
  "Portal",
  "SSO",
  "Tài chính",
  "Mua hàng",
  "Sản xuất",
  "Kho tàng",
  "Chất lượng",
  "Hệ thống",
];
