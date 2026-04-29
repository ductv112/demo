import type { UserPermission } from '../types';

// Ma trận phân quyền: user × app × permission level
// Giám đốc (U01-U03): full trên mọi app
// Trưởng phòng: full trên app liên quan, view trên app khác
// Chuyên viên: edit trên app phòng mình, view trên một số app
// Kỹ thuật viên: edit trên app kỹ thuật, none trên tài chính

const directorApps = ['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10','A11','A12','A13','A14','A15','A16'];

function generateDirectorPerms(userId: string): UserPermission[] {
  return directorApps.map(appId => ({ userId, appId, permission: 'full' as const }));
}

export const permissions: UserPermission[] = [
  // Ban Giám đốc — full access
  ...generateDirectorPerms('U01'),
  ...generateDirectorPerms('U02'),
  ...generateDirectorPerms('U03'),

  // TP Kế hoạch — Hoàng Minh Tuấn
  { userId: 'U04', appId: 'A02', permission: 'view' },
  { userId: 'U04', appId: 'A03', permission: 'view' },
  { userId: 'U04', appId: 'A04', permission: 'approve' },
  { userId: 'U04', appId: 'A05', permission: 'full' },
  { userId: 'U04', appId: 'A06', permission: 'view' },
  { userId: 'U04', appId: 'A07', permission: 'approve' },

  // TP Tài chính Kế toán — Vũ Thị Lan Anh
  { userId: 'U05', appId: 'A02', permission: 'view' },
  { userId: 'U05', appId: 'A03', permission: 'full' },
  { userId: 'U05', appId: 'A04', permission: 'approve' },
  { userId: 'U05', appId: 'A05', permission: 'view' },

  // TP Kỹ thuật — Đỗ Quang Minh
  { userId: 'U06', appId: 'A02', permission: 'view' },
  { userId: 'U06', appId: 'A07', permission: 'full' },
  { userId: 'U06', appId: 'A08', permission: 'full' },
  { userId: 'U06', appId: 'A09', permission: 'full' },
  { userId: 'U06', appId: 'A10', permission: 'full' },
  { userId: 'U06', appId: 'A11', permission: 'full' },
  { userId: 'U06', appId: 'A12', permission: 'approve' },

  // TP KCS — Nguyễn Hải Đăng
  { userId: 'U07', appId: 'A02', permission: 'view' },
  { userId: 'U07', appId: 'A12', permission: 'full' },
  { userId: 'U07', appId: 'A13', permission: 'full' },
  { userId: 'U07', appId: 'A14', permission: 'full' },
  { userId: 'U07', appId: 'A15', permission: 'full' },
  { userId: 'U07', appId: 'A16', permission: 'full' },

  // QĐ TT Phần mềm Alpha — Trần Văn Dũng
  { userId: 'U08', appId: 'A07', permission: 'edit' },
  { userId: 'U08', appId: 'A08', permission: 'edit' },
  { userId: 'U08', appId: 'A09', permission: 'full' },
  { userId: 'U08', appId: 'A11', permission: 'view' },

  // QĐ TT Phần mềm Beta — Bùi Xuân Trường
  { userId: 'U09', appId: 'A07', permission: 'edit' },
  { userId: 'U09', appId: 'A08', permission: 'edit' },
  { userId: 'U09', appId: 'A09', permission: 'full' },
  { userId: 'U09', appId: 'A10', permission: 'full' },

  // CV Kế hoạch — Nguyễn Thị Minh
  { userId: 'U12', appId: 'A02', permission: 'view' },
  { userId: 'U12', appId: 'A05', permission: 'edit' },
  { userId: 'U12', appId: 'A06', permission: 'view' },

  // CV Kế toán — Trần Hoàng Long
  { userId: 'U13', appId: 'A03', permission: 'edit' },
  { userId: 'U13', appId: 'A04', permission: 'edit' },

  // KTV PX1 — Lê Quang Huy
  { userId: 'U14', appId: 'A09', permission: 'edit' },
  { userId: 'U14', appId: 'A11', permission: 'view' },
  { userId: 'U14', appId: 'A14', permission: 'view' },

  // KTV PX2 — Đinh Tiến Đạt
  { userId: 'U15', appId: 'A09', permission: 'edit' },
  { userId: 'U15', appId: 'A10', permission: 'edit' },

  // Admin SSO — Ngô Đức Thắng
  { userId: 'U17', appId: 'A01', permission: 'full' },
  { userId: 'U17', appId: 'A02', permission: 'view' },
];
