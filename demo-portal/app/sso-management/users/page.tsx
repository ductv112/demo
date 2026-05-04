"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Lock,
  Unlock,
  Trash2,
  Users,
  UserCheck,
  UserX,
  ShieldOff,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ssoUsers,
  ssoRoles,
  departments,
  militaryRanks,
  type SsoUser,
} from "@/lib/sso-data";

type StatusFilter = "all" | "active" | "inactive" | "locked";

const statusConfig: Record<SsoUser["status"], { label: string; bg: string; color: string; border: string }> = {
  active: { label: "Hoạt động", bg: "#f6ffed", color: "#52c41a", border: "#b7eb8f" },
  inactive: { label: "Vô hiệu", bg: "#f5f5f5", color: "#666666", border: "#d9d9d9" },
  locked: { label: "Đã khóa", bg: "#fff2f0", color: "#ff4d4f", border: "#ffccc7" },
};

function initials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

const avatarColors = ["#1B3A5C", "#2d5a8e", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626"];

function avatarColor(id: string) {
  return avatarColors[id.charCodeAt(id.length - 1) % avatarColors.length];
}

interface UserFormData {
  fullName: string;
  username: string;
  email: string;
  rank: string;
  department: string;
  position: string;
  status: SsoUser["status"];
  roleIds: string[];
}

const emptyForm: UserFormData = {
  fullName: "",
  username: "",
  email: "",
  rank: "CV cao cấp",
  department: departments[0],
  position: "",
  status: "active",
  roleIds: [],
};

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  gradient: string;
}

function StatCard({ label, value, sub, icon: Icon, gradient }: StatCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: gradient,
        borderRadius: 12,
        padding: "14px 16px 12px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 12px 32px rgba(27,58,92,0.18)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background icon */}
      <div
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          fontSize: 64,
          color: "rgba(255,255,255,0.1)",
          lineHeight: 1,
          transition: "transform 0.5s",
          transform: hovered ? "rotate(15deg) scale(1.15)" : "rotate(0deg) scale(1)",
        }}
      >
        <Icon size={64} />
      </div>
      {/* Icon badge + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 16,
          }}
        >
          <Icon size={16} />
        </div>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500 }}>{label}</span>
      </div>
      {/* Value */}
      <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, lineHeight: "30px", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<SsoUser[]>(ssoUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SsoUser | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SsoUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        search === "" ||
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.department.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      inactive: users.filter((u) => u.status === "inactive").length,
      locked: users.filter((u) => u.status === "locked").length,
    }),
    [users]
  );

  function openAdd() {
    setSelectedUser(null);
    setForm(emptyForm);
    setShowDrawer(true);
  }

  function openEdit(u: SsoUser) {
    setSelectedUser(u);
    setForm({
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      rank: u.rank,
      department: u.department,
      position: u.position,
      status: u.status,
      roleIds: [...u.roleIds],
    });
    setShowDrawer(true);
  }

  function toggleLock(u: SsoUser) {
    setUsers((prev) =>
      prev.map((x) =>
        x.id === u.id ? { ...x, status: x.status === "locked" ? "active" : "locked" } : x
      )
    );
  }

  function confirmDelete(u: SsoUser) {
    setDeleteTarget(u);
    setShowDeleteConfirm(true);
  }

  function doDelete() {
    if (deleteTarget) {
      setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  }

  function saveUser() {
    if (selectedUser) {
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...form } : u)));
    } else {
      const newUser: SsoUser = {
        id: `user_${Date.now()}`,
        ...form,
        lastLogin: "—",
        createdAt: new Date().toLocaleDateString("vi-VN"),
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setShowDrawer(false);
  }

  function toggleRole(roleId: string) {
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((r) => r !== roleId)
        : [...prev.roleIds, roleId],
    }));
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1B3A5C", letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={18} style={{ color: "#1B3A5C" }} />
            Quản lý Người dùng
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
            Quản lý tài khoản, chức danh và phân quyền người dùng Doanh nghiệp A
          </p>
        </div>
        <Button
          onClick={openAdd}
          style={{ background: "#1B3A5C", color: "#fff", height: 36, fontSize: 13, gap: 6, flexShrink: 0 }}
        >
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Gradient stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={stats.total}
          sub="tài khoản trong hệ thống"
          icon={Users}
          gradient="linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)"
        />
        <StatCard
          label="Đang hoạt động"
          value={stats.active}
          sub="tài khoản đang sử dụng"
          icon={UserCheck}
          gradient="linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
        />
        <StatCard
          label="Vô hiệu"
          value={stats.inactive}
          sub="tài khoản bị vô hiệu hóa"
          icon={UserX}
          gradient="linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)"
        />
        <StatCard
          label="Đã khóa"
          value={stats.locked}
          sub="tài khoản bị khóa"
          icon={ShieldOff}
          gradient="linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)"
        />
      </div>

      {/* Section card: toolbar */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e8e8e8",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          overflow: "hidden",
          transition: "box-shadow 0.3s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(27,58,92,0.1)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
      >
        {/* Card header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #1B3A5C, #2d5a8e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
              }}
            >
              <Search size={14} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>Tìm kiếm &amp; Lọc</span>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm theo tên, username, đơn vị..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v ?? "all") as StatusFilter)}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Vô hiệu</SelectItem>
                <SelectItem value="locked">Đã khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section card: table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e8e8e8",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          overflow: "hidden",
          transition: "box-shadow 0.3s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(27,58,92,0.1)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
      >
        {/* Card header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #1B3A5C, #2d5a8e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <Users size={14} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>
            Danh sách người dùng
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#6b7280",
              background: "#f5f7fa",
              padding: "2px 10px",
              borderRadius: 20,
              border: "1px solid #e8e8e8",
            }}
          >
            {filtered.length} / {users.length} người dùng
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f7fa" }}>
                {["STT", "Người dùng", "Cấp bậc", "Đơn vị", "Vai trò", "Trạng thái", "Đăng nhập cuối", "Thao tác"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#1B3A5C",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "40px 16px", color: "#9ca3af", fontSize: 13 }}
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
              {filtered.map((user, idx) => {
                const sc = statusConfig[user.status];
                const userRoles = ssoRoles.filter((r) => user.roleIds.includes(r.id));
                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e8f0fe"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: avatarColor(user.id),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials(user.fullName)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: "#1f2937", fontSize: 13 }}>{user.fullName}</p>
                          <p style={{ fontSize: 12, color: "#9ca3af" }}>@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#4b5563", fontSize: 13 }}>{user.rank}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, color: "#374151" }}>{user.department}</p>
                      <p style={{ fontSize: 12, color: "#9ca3af" }}>{user.position}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {userRoles.map((r) => (
                          <span
                            key={r.id}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: r.color + "18",
                              color: r.color,
                            }}
                          >
                            {r.code}
                          </span>
                        ))}
                        {userRoles.length === 0 && (
                          <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>Chưa gán</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.border}`,
                          borderRadius: 4,
                          padding: "2px 8px",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 12, whiteSpace: "nowrap" }}>
                      {user.lastLogin}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              border: "1px solid #e8e8e8",
                              background: "#fff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#6b7280",
                            }}>
                          <MoreVertical size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" style={{ minWidth: 160 }}>
                          <DropdownMenuItem
                            style={{ fontSize: 13, cursor: "pointer" }}
                            onClick={() => openEdit(user)}
                          >
                            <Pencil size={13} style={{ marginRight: 8 }} />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            style={{ fontSize: 13, cursor: "pointer" }}
                            onClick={() => toggleLock(user)}
                          >
                            {user.status === "locked" ? (
                              <>
                                <Unlock size={13} style={{ marginRight: 8 }} />
                                Mở khóa
                              </>
                            ) : (
                              <>
                                <Lock size={13} style={{ marginRight: 8 }} />
                                Khóa tài khoản
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            style={{ fontSize: 13, cursor: "pointer", color: "#ff4d4f" }}
                            onClick={() => confirmDelete(user)}
                          >
                            <Trash2 size={13} style={{ marginRight: 8 }} />
                            Xóa người dùng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="!w-[760px] !max-w-[760px]"
          style={{ display: "flex", flexDirection: "column", padding: 0, gap: 0, width: 760, maxWidth: 760 }}
        >
          {/* Dark gradient header */}
          <div
            style={{
              background: "linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 100%)",
              padding: "20px 24px 20px",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowDrawer(false)}
              style={{
                position: "absolute", top: 14, right: 16,
                width: 28, height: 28, borderRadius: 6,
                background: "rgba(255,255,255,0.1)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.7)", cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
            >
              <X size={14} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg, #D4A843, #f0d890)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(212,168,67,0.4)",
                }}
              >
                {selectedUser ? (
                  <Pencil size={18} style={{ color: "#0a1628" }} />
                ) : (
                  <Plus size={20} style={{ color: "#0a1628" }} />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
                  {selectedUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
                  {selectedUser
                    ? `Cập nhật thông tin tài khoản · ${selectedUser.username}`
                    : "Đăng ký tài khoản mới vào hệ thống SSO"}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable form body */}
          <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }} className="space-y-5">

            {/* Section: Định danh */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1B3A5C", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Định danh
                </span>
                <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      Họ và tên <span style={{ color: "#ff4d4f" }}>*</span>
                    </Label>
                    <Input
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="VD: Nguyễn Văn An"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      Tên đăng nhập <span style={{ color: "#ff4d4f" }}>*</span>
                    </Label>
                    <Input
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="VD: nguyenvana"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Địa chỉ email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="VD: nguyenvana@doanhnghiepa.vn"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section: Vị trí công tác */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1B3A5C", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Vị trí công tác
                </span>
                <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      Cấp bậc <span style={{ color: "#ff4d4f" }}>*</span>
                    </Label>
                    <Select value={form.rank} onValueChange={(v) => setForm({ ...form, rank: v ?? form.rank })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {militaryRanks.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      Đơn vị công tác <span style={{ color: "#ff4d4f" }}>*</span>
                    </Label>
                    <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v ?? form.department })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Chức vụ</Label>
                    <Input
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      placeholder="VD: Trưởng phòng"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Trạng thái tài khoản</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm({ ...form, status: (v ?? "active") as SsoUser["status"] })}
                    >
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
                        <SelectItem value="locked">Đã khóa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Phân quyền */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1B3A5C", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Phân quyền
                </span>
                <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
              </div>
              <div className="space-y-1.5">
                <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  Vai trò được gán <span style={{ color: "#ff4d4f" }}>*</span>
                </Label>
                <div
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
                    border: "1px solid #e8e8e8", borderRadius: 8, padding: 12, background: "#f8faff",
                  }}
                >
                  {ssoRoles.map((role) => {
                    const checked = form.roleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                          padding: "6px 8px", borderRadius: 6,
                          background: checked ? role.color + "10" : "transparent",
                          border: `1px solid ${checked ? role.color + "40" : "transparent"}`,
                          transition: "all 0.15s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRole(role.id)}
                          style={{ width: 14, height: 14, accentColor: "#1B3A5C" }}
                        />
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
                          <span style={{ width: 9, height: 9, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                          {role.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Sticky footer */}
          <SheetFooter
            style={{
              borderTop: "1px solid #e8e8e8",
              padding: "14px 24px",
              background: "#fff",
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button variant="outline" onClick={() => setShowDrawer(false)} className="h-9 text-sm">
              Hủy
            </Button>
            <Button
              onClick={saveUser}
              style={{ background: "#1B3A5C", color: "#fff", height: 36, fontSize: 13, gap: 6 }}
            >
              {selectedUser ? (
                <><Pencil size={13} /> Lưu thay đổi</>
              ) : (
                <><Plus size={13} /> Thêm người dùng</>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "#ff4d4f", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Trash2 className="w-5 h-5" />
              Xác nhận xóa người dùng
            </DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: 13, color: "#4b5563", padding: "8px 0" }}>
            Bạn có chắc chắn muốn xóa người dùng{" "}
            <span style={{ fontWeight: 600, color: "#1f2937" }}>{deleteTarget?.fullName}</span>{" "}
            (@{deleteTarget?.username})? Thao tác này không thể hoàn tác.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="h-9 text-sm">
              Hủy
            </Button>
            <Button
              onClick={doDelete}
              className="h-9 text-sm"
              style={{ background: "#ff4d4f", color: "#fff" }}
            >
              Xóa người dùng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
