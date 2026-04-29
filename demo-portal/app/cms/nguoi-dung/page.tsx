"use client";

import { useState, useRef, useEffect } from "react";
import {
  Users, UserPlus, Search, Shield, Edit2, Trash2,
  Check, X, Eye, PenLine, Settings2, Plus, Lock,
  MoreVertical, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

/* ══════════════════ TYPES ══════════════════ */
type RoleName = string;

interface User {
  id: string; name: string; email: string; initials: string;
  roleName: RoleName; department: string; lastLogin: string; active: boolean;
}

interface RoleDef {
  id: string; name: string; description: string;
  colorKey: string; permissions: string[]; active: boolean; locked?: boolean;
}

/* ══════════════════ PERMISSION CATALOGUE ══════════════════ */
const ALL_PERMS: { id: string; label: string; group: string }[] = [
  { id: "view_home",     label: "Xem nội dung trang chủ",          group: "Chung"     },
  { id: "create_news",   label: "Tạo / chỉnh sửa tin tức",         group: "Tin tức"   },
  { id: "publish_news",  label: "Xuất bản / gỡ tin tức",           group: "Tin tức"   },
  { id: "create_ann",    label: "Tạo / chỉnh sửa thông báo",       group: "Thông báo" },
  { id: "publish_ann",   label: "Xuất bản thông báo",               group: "Thông báo" },
  { id: "manage_banner", label: "Quản lý sự kiện & banner",         group: "Nội dung"  },
  { id: "manage_forms",  label: "Quản lý biểu mẫu",                group: "Nội dung"  },
  { id: "view_docs",     label: "Xem văn bản chỉ đạo",             group: "Văn bản"   },
  { id: "create_docs",   label: "Tạo / chỉnh sửa văn bản",         group: "Văn bản"   },
  { id: "sys_settings",  label: "Thay đổi cài đặt hệ thống",       group: "Hệ thống"  },
  { id: "manage_users",  label: "Quản lý người dùng & phân quyền", group: "Hệ thống"  },
  { id: "view_logs",     label: "Xem nhật ký hoạt động",           group: "Hệ thống"  },
];

/* ══════════════════ COLORS ══════════════════ */
const COLORS: Record<string, { bg: string; text: string; border: string; iconBg: string; dot: string }> = {
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", iconBg: "bg-purple-100", dot: "bg-purple-500" },
  blue:   { bg: "bg-[#e8eef6]",   text: "text-[#1B3A5C]",   border: "border-[#bfdbfe]",   iconBg: "bg-[#e8eef6]",   dot: "bg-[#1B3A5C]"   },
  green:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  iconBg: "bg-green-100",  dot: "bg-green-500"  },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", iconBg: "bg-orange-100", dot: "bg-orange-500" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   iconBg: "bg-teal-100",   dot: "bg-teal-500"   },
  gray:   { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200",   iconBg: "bg-gray-100",   dot: "bg-gray-400"   },
};
const color = (key: string) => COLORS[key] ?? COLORS.gray;

/* ══════════════════ INITIAL DATA ══════════════════ */
const initialRoles: RoleDef[] = [
  { id: "r1", name: "Quản trị viên", description: "Toàn quyền quản lý hệ thống",  colorKey: "purple", permissions: ALL_PERMS.map((p) => p.id), active: true, locked: true },
  { id: "r2", name: "Biên tập viên", description: "Tạo và chỉnh sửa nội dung",    colorKey: "blue",   permissions: ["view_home","create_news","create_ann","manage_banner","manage_forms","view_docs","create_docs","view_logs"], active: true },
  { id: "r3", name: "Người xem",     description: "Chỉ xem nội dung nội bộ",      colorKey: "gray",   permissions: ["view_home","view_docs"], active: true },
];

const initialUsers: User[] = [
  { id: "U001", name: "Nguyễn Văn Hùng", email: "hung.nv@vtktqs.mil.vn",  initials: "HN", roleName: "Quản trị viên", department: "Ban Chỉ huy",      lastLogin: "17/03/2026", active: true  },
  { id: "U002", name: "Trần Thị Mai",    email: "mai.tt@vtktqs.mil.vn",   initials: "MT", roleName: "Biên tập viên", department: "Phòng Chính trị",  lastLogin: "16/03/2026", active: true  },
  { id: "U003", name: "Lê Minh Đức",    email: "duc.lm@vtktqs.mil.vn",   initials: "ĐL", roleName: "Biên tập viên", department: "Phòng Kỹ thuật",   lastLogin: "15/03/2026", active: true  },
  { id: "U004", name: "Phạm Quốc Bảo",  email: "bao.pq@vtktqs.mil.vn",   initials: "BP", roleName: "Người xem",     department: "Phòng Thiết kế 1", lastLogin: "14/03/2026", active: true  },
  { id: "U005", name: "Hoàng Thị Lan",  email: "lan.ht@vtktqs.mil.vn",   initials: "LH", roleName: "Người xem",     department: "Phòng Hành chính", lastLogin: "10/03/2026", active: false },
  { id: "U006", name: "Vũ Đình Khoa",   email: "khoa.vd@vtktqs.mil.vn",  initials: "KV", roleName: "Biên tập viên", department: "Phòng Thiết kế 2", lastLogin: "17/03/2026", active: true  },
];

/* ══════════════════ ROLE ACTION MENU ══════════════════ */
function RoleMenu({ onEdit, onView, onDelete, locked }: {
  onEdit: () => void; onView: () => void; onDelete: () => void; locked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-30">
          <button type="button" onClick={() => { onView(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Eye className="w-3.5 h-3.5 text-gray-400" /> Xem chi tiết
          </button>
          <button type="button" onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Chỉnh sửa
          </button>
          {!locked && (
            <>
              <div className="my-1 border-t border-gray-100" />
              <button type="button" onClick={() => { onDelete(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Xóa vai trò
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════ ROLE EDITOR DIALOG ══════════════════ */
function RoleEditor({ role, onSave, onClose }: {
  role: Partial<RoleDef> & { id?: string };
  onSave: (r: RoleDef) => void;
  onClose: () => void;
}) {
  const isNew = !role.id;
  const [name, setName]         = useState(role.name ?? "");
  const [desc, setDesc]         = useState(role.description ?? "");
  const [colorKey, setColorKey] = useState(role.colorKey ?? "blue");
  const [perms, setPerms]       = useState<string[]>(role.permissions ?? []);

  const toggle = (id: string) =>
    setPerms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleGroup = (group: string) => {
    const ids = ALL_PERMS.filter((p) => p.group === group).map((p) => p.id);
    const allOn = ids.every((id) => perms.includes(id));
    setPerms((prev) => allOn ? prev.filter((p) => !ids.includes(p)) : [...new Set([...prev, ...ids])]);
  };

  const groups = Array.from(new Set(ALL_PERMS.map((p) => p.group)));

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: role.id ?? `r${Date.now()}`,
      name: name.trim(), description: desc.trim(),
      colorKey, permissions: perms, active: true,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B3A5C]">
            {isNew ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isNew ? "Thêm vai trò mới" : "Chỉnh sửa vai trò"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {/* Name + description */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Tên vai trò *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="VD: Kiểm duyệt viên" className="rounded-xl border-gray-200" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Mô tả</label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)}
                placeholder="Mô tả ngắn về vai trò" className="rounded-xl border-gray-200" />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Màu nhận diện</label>
            <div className="flex gap-2">
              {Object.entries(COLORS).map(([key, c]) => (
                <button key={key} type="button" onClick={() => setColorKey(key)}
                  className={`w-7 h-7 rounded-full ${c.dot} transition-transform ${colorKey === key ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "opacity-60 hover:opacity-100"}`} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-600">Quyền hạn ({perms.length}/{ALL_PERMS.length})</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPerms(ALL_PERMS.map((p) => p.id))}
                  className="text-[10px] text-[#1B3A5C] hover:underline">Chọn tất cả</button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={() => setPerms([])}
                  className="text-[10px] text-gray-400 hover:underline">Bỏ chọn</button>
              </div>
            </div>
            <div className="space-y-3">
              {groups.map((group) => {
                const groupPerms = ALL_PERMS.filter((p) => p.group === group);
                const allOn = groupPerms.every((p) => perms.includes(p.id));
                const someOn = groupPerms.some((p) => perms.includes(p.id));
                return (
                  <div key={group} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => toggleGroup(group)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${allOn ? "bg-[#1B3A5C] text-white" : someOn ? "bg-[#e8eef6] text-[#1B3A5C]" : "bg-gray-50 text-gray-500"}`}>
                      <span>{group}</span>
                      <span className="font-normal normal-case opacity-80">
                        {groupPerms.filter((p) => perms.includes(p.id)).length}/{groupPerms.length}
                      </span>
                    </button>
                    <div className="divide-y divide-gray-100">
                      {groupPerms.map((perm) => {
                        const on = perms.includes(perm.id);
                        return (
                          <label key={perm.id}
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                            <button type="button" onClick={() => toggle(perm.id)}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${on ? "bg-[#1B3A5C] border-[#1B3A5C]" : "border-gray-300 bg-white"}`}>
                              {on && <Check className="w-2.5 h-2.5 text-white" />}
                            </button>
                            <span className="text-sm text-gray-700">{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-100 mt-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Hủy</Button>
          <Button disabled={!name.trim()}
            className="flex-1 rounded-xl bg-[#1B3A5C] hover:bg-[#142d4a] text-white" onClick={save}>
            {isNew ? "Thêm vai trò" : "Lưu thay đổi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════ ROLE DETAIL DIALOG ══════════════════ */
function RoleDetail({ role, userCount, onClose }: { role: RoleDef; userCount: number; onClose: () => void }) {
  const c = color(role.colorKey);
  const groups = Array.from(new Set(ALL_PERMS.map((p) => p.group)));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
              <Shield className={`w-5 h-5 ${c.text}`} />
            </div>
            <div>
              <DialogTitle className={`text-base ${c.text}`}>{role.name}</DialogTitle>
              <p className="text-xs text-gray-400">{role.description} · {userCount} người dùng</p>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 space-y-3 pr-1 mt-2">
          {groups.map((group) => {
            const gPerms = ALL_PERMS.filter((p) => p.group === group);
            const enabled = gPerms.filter((p) => role.permissions.includes(p.id));
            if (enabled.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {enabled.map((p) => (
                    <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border}`}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <Button variant="outline" className="mt-3 rounded-xl w-full" onClick={onClose}>Đóng</Button>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function NguoiDungPage() {
  const [tab, setTab]         = useState<"users" | "permissions">("users");
  const [users, setUsers]     = useState<User[]>(initialUsers);
  const [roles, setRoles]     = useState<RoleDef[]>(initialRoles);
  const [search, setSearch]   = useState("");

  /* user dialogs */
  const [editUserTarget, setEditUserTarget] = useState<User | null>(null);
  const [editUserRole, setEditUserRole]     = useState<RoleName>("");
  const [addUserOpen, setAddUserOpen]       = useState(false);
  const [newName, setNewName]   = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDept, setNewDept]   = useState("");
  const [newRole, setNewRole]   = useState<RoleName>("");

  /* role dialogs */
  const [editingRole, setEditingRole] = useState<RoleDef | null | "new">(null);
  const [viewingRole, setViewingRole] = useState<RoleDef | null>(null);
  const [deleteRole, setDeleteRole]   = useState<RoleDef | null>(null);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  /* user actions */
  const openEditUser = (u: User) => { setEditUserTarget(u); setEditUserRole(u.roleName); };
  const saveEditUser = () => {
    if (!editUserTarget) return;
    setUsers((p) => p.map((u) => u.id === editUserTarget.id ? { ...u, roleName: editUserRole } : u));
    setEditUserTarget(null);
  };
  const toggleActive = (id: string) =>
    setUsers((p) => p.map((u) => u.id === id ? { ...u, active: !u.active } : u));
  const addUser = () => {
    if (!newName || !newEmail) return;
    const initials = newName.split(" ").slice(-2).map((w) => w[0].toUpperCase()).join("");
    setUsers((p) => [...p, {
      id: `U${String(p.length + 1).padStart(3, "0")}`,
      name: newName, email: newEmail, initials,
      roleName: newRole || roles[0]?.name, department: newDept,
      lastLogin: "Chưa đăng nhập", active: true,
    }]);
    setAddUserOpen(false);
    setNewName(""); setNewEmail(""); setNewDept(""); setNewRole("");
  };

  /* role actions */
  const saveRole = (r: RoleDef) => {
    setRoles((p) => p.find((x) => x.id === r.id) ? p.map((x) => x.id === r.id ? r : x) : [...p, r]);
    setEditingRole(null);
  };
  const confirmDeleteRole = () => {
    if (!deleteRole) return;
    setRoles((p) => p.filter((r) => r.id !== deleteRole.id));
    setDeleteRole(null);
  };

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Người dùng &amp; Phân quyền</h1>
        <Button onClick={() => setAddUserOpen(true)}
          className="bg-[#1B3A5C] hover:bg-[#142d4a] text-white gap-2 px-5 h-10 rounded-xl text-sm font-semibold shadow-sm">
          <UserPlus className="w-4 h-4" /> Thêm người dùng
        </Button>
      </div>

      {/* ── Main card ── */}
      <Card className="overflow-hidden">

        {/* Section header */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          {tab === "users" ? <Users className="w-4 h-4 text-[#1B3A5C]" /> : <Settings2 className="w-4 h-4 text-[#1B3A5C]" />}
          <h2 className="text-sm font-semibold text-gray-800">
            {tab === "users" ? "Danh sách người dùng" : "Quản lý vai trò & Phân quyền"}
          </h2>
          {tab === "users" && <span className="text-xs text-gray-400 ml-auto">{filteredUsers.length} người dùng</span>}
          {tab === "permissions" && <span className="text-xs text-gray-400 ml-auto">{roles.length} vai trò</span>}
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {(["users", "permissions"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                tab === t ? "border-[#1B3A5C] text-[#1B3A5C] bg-white" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white"
              }`}>
              {t === "users"
                ? <><Users className="w-3.5 h-3.5" /> Danh sách người dùng</>
                : <><Settings2 className="w-3.5 h-3.5" /> Phân quyền chi tiết</>}
            </button>
          ))}
        </div>

        {/* ── TAB: Users ── */}
        {tab === "users" && (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3 bg-white">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input placeholder="Tìm người dùng, email, phòng ban..." value={search}
                  onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm border-gray-200" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {roles.map((role) => {
                  const c = color(role.colorKey);
                  return (
                    <div key={role.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${c.bg} ${c.border} ${c.text}`}>
                      <Shield className="w-3 h-3" />
                      <span className="font-medium hidden sm:inline">{role.name}</span>
                      <span className="font-bold">{users.filter((u) => u.roleName === role.name).length}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr style={{ background: "#1B3A5C" }}>
                      <th className="text-left px-5 py-3 text-xs font-bold text-white rounded-tl-xl">Người dùng</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-white">Phòng ban</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-white">Vai trò</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-white">Đăng nhập gần nhất</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-white">Trạng thái</th>
                      <th className="px-4 py-3 rounded-tr-xl" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const roleDef = roles.find((r) => r.name === u.roleName);
                      const c = color(roleDef?.colorKey ?? "gray");
                      return (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1B3A5C] flex items-center justify-center text-white text-xs font-bold shrink-0">{u.initials}</div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="text-xs text-gray-600">{u.department}</span></td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border}`}>
                              <Shield className="w-3 h-3" />{u.roleName}
                            </span>
                          </td>
                          <td className="px-4 py-3"><span className="text-xs text-gray-500">{u.lastLogin}</span></td>
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => toggleActive(u.id)}
                              className={`relative inline-flex w-9 h-5 rounded-full transition-colors cursor-pointer ${u.active ? "bg-green-500" : "bg-gray-300"}`}>
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${u.active ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" onClick={() => openEditUser(u)}
                                className="text-xs text-[#1B3A5C] hover:underline font-medium px-2 py-1">Phân quyền</button>
                              <button type="button" onClick={() => setUsers((p) => p.filter((x) => x.id !== u.id))}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="py-14 flex flex-col items-center gap-2 text-gray-400">
                    <Users className="w-10 h-10 opacity-25" />
                    <p className="text-sm">Không tìm thấy người dùng</p>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}

        {/* ── TAB: Permissions ── */}
        {tab === "permissions" && (
          <>
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
              <p className="text-xs text-gray-500">Quản lý vai trò và quyền hạn truy cập cho từng nhóm người dùng</p>
              <button type="button" onClick={() => setEditingRole("new")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B3A5C] text-white text-xs font-semibold hover:bg-[#142d4a] transition-colors">
                <Plus className="w-3.5 h-3.5" /> Thêm vai trò
              </button>
            </div>

            {/* Role cards grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const c = color(role.colorKey);
                const userCount = users.filter((u) => u.roleName === role.name).length;
                const visiblePerms = role.permissions.slice(0, 3);
                const extraCount = role.permissions.length - visiblePerms.length;
                const permLabels = ALL_PERMS.filter((p) => visiblePerms.includes(p.id));

                return (
                  <div key={role.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Card header */}
                    <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                        {role.locked ? <Lock className={`w-5 h-5 ${c.text}`} /> : <Shield className={`w-5 h-5 ${c.text}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm leading-tight">{role.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {role.id}</p>
                      </div>
                      <RoleMenu
                        onEdit={() => setEditingRole(role)}
                        onView={() => setViewingRole(role)}
                        onDelete={() => setDeleteRole(role)}
                        locked={role.locked}
                      />
                    </div>

                    {/* Stats */}
                    <div className="mx-4 mb-3 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">Số người dùng</p>
                        <p className="text-lg font-black text-gray-800">{userCount}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">Quyền hạn</p>
                        <p className="text-lg font-black text-gray-800">{role.permissions.length}</p>
                      </div>
                    </div>

                    {/* Permission tags */}
                    <div className="px-4 mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Quyền truy cập</p>
                      <div className="flex flex-wrap gap-1.5">
                        {permLabels.map((p) => (
                          <span key={p.id} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border}`}>
                            {p.label}
                          </span>
                        ))}
                        {extraCount > 0 && (
                          <button type="button" onClick={() => setViewingRole(role)}
                            className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 transition-colors">
                            +{extraCount}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold ${
                        role.active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {role.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {role.active ? "Hoạt động" : "Tạm khóa"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setViewingRole(role)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setEditingRole(role)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${c.bg} ${c.text} hover:opacity-80`}>
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add role card */}
              <button type="button" onClick={() => setEditingRole("new")}
                className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 p-8 text-gray-400 hover:border-[#1B3A5C] hover:text-[#1B3A5C] hover:bg-[#e8eef6]/30 transition-all group min-h-[200px]">
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#e8eef6] flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold">Thêm vai trò mới</p>
                <p className="text-xs text-center opacity-70">Tạo vai trò tùy chỉnh với quyền hạn riêng</p>
              </button>
            </div>
          </>
        )}

      </Card>

      {/* ── Role editor dialog ── */}
      {editingRole !== null && (
        <RoleEditor
          role={editingRole === "new" ? {} : editingRole}
          onSave={saveRole}
          onClose={() => setEditingRole(null)}
        />
      )}

      {/* ── Role detail dialog ── */}
      {viewingRole && (
        <RoleDetail
          role={viewingRole}
          userCount={users.filter((u) => u.roleName === viewingRole.name).length}
          onClose={() => setViewingRole(null)}
        />
      )}

      {/* ── Delete confirm dialog ── */}
      <Dialog open={!!deleteRole} onOpenChange={() => setDeleteRole(null)}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xóa vai trò
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Bạn có chắc muốn xóa vai trò <span className="font-semibold">"{deleteRole?.name}"</span>?
            Thao tác này không thể hoàn tác.
          </p>
          {deleteRole && users.filter((u) => u.roleName === deleteRole.name).length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠ Có {users.filter((u) => u.roleName === deleteRole.name).length} người dùng đang dùng vai trò này.
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteRole(null)}>Hủy</Button>
            <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteRole}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit user role dialog ── */}
      <Dialog open={!!editUserTarget} onOpenChange={() => setEditUserTarget(null)}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1B3A5C]">
              <Edit2 className="w-4 h-4" /> Phân quyền người dùng
            </DialogTitle>
          </DialogHeader>
          {editUserTarget && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-[#1B3A5C] flex items-center justify-center text-white text-sm font-bold">{editUserTarget.initials}</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{editUserTarget.name}</p>
                  <p className="text-xs text-gray-400">{editUserTarget.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                {roles.map((role) => {
                  const c = color(role.colorKey);
                  const on = editUserRole === role.name;
                  return (
                    <button key={role.id} type="button" onClick={() => setEditUserRole(role.name)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${on ? `${c.bg} ${c.border}` : "border-gray-200 hover:border-gray-300"}`}>
                      <Shield className={`w-4 h-4 ${on ? c.text : "text-gray-400"}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${on ? c.text : "text-gray-700"}`}>{role.name}</p>
                        <p className="text-xs text-gray-400">{role.description}</p>
                      </div>
                      {on && <Check className={`w-4 h-4 ${c.text}`} />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditUserTarget(null)}>Hủy</Button>
                <Button className="flex-1 rounded-xl bg-[#1B3A5C] hover:bg-[#142d4a] text-white" onClick={saveEditUser}>Lưu thay đổi</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add user dialog ── */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1B3A5C]">
              <UserPlus className="w-4 h-4" /> Thêm người dùng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Họ và tên *", value: newName,  setter: setNewName,  ph: "Nguyễn Văn A" },
              { label: "Email *",      value: newEmail, setter: setNewEmail, ph: "email@vtktqs.mil.vn" },
              { label: "Phòng ban",    value: newDept,  setter: setNewDept,  ph: "Phòng Kỹ thuật" },
            ].map(({ label, value, setter, ph }) => (
              <div key={label}>
                <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                <Input value={value} onChange={(e) => setter(e.target.value)} placeholder={ph} className="rounded-xl border-gray-200" />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Vai trò</label>
              <div className="space-y-1.5">
                {roles.map((role) => {
                  const c = color(role.colorKey);
                  const on = (newRole || roles[0]?.name) === role.name;
                  return (
                    <button key={role.id} type="button" onClick={() => setNewRole(role.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${on ? `${c.bg} ${c.border} ${c.text} font-semibold` : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      <Shield className="w-3.5 h-3.5" />{role.name}
                      {on && <Check className="w-3 h-3 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setAddUserOpen(false)}>Hủy</Button>
              <Button className="flex-1 rounded-xl bg-[#1B3A5C] hover:bg-[#142d4a] text-white"
                disabled={!newName || !newEmail} onClick={addUser}>Thêm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
