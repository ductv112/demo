"use client";

import { useState, useMemo } from "react";
import { Search, Pencil, GitMerge, Users, UserCheck, UserX, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ssoUsers, ssoRoles, type SsoUser } from "@/lib/sso-data";

function initials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

const avatarColors = ["#1B3A5C", "#2d5a8e", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626"];

function avatarColor(id: string) {
  return avatarColors[id.charCodeAt(id.length - 1) % avatarColors.length];
}

function StatCard({ label, value, icon: Icon, gradient, sub }: {
  label: string; value: number; icon: React.ElementType; gradient: string; sub: string;
}) {
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
        boxShadow: hovered ? "0 12px 32px rgba(27,58,92,0.18)" : "0 2px 12px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "absolute", top: -8, right: -8, fontSize: 64,
          color: "rgba(255,255,255,0.1)", lineHeight: 1, transition: "transform 0.5s",
          transform: hovered ? "rotate(15deg) scale(1.15)" : "rotate(0deg) scale(1)",
        }}
      >
        <Icon size={64} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}
        >
          <Icon size={16} />
        </div>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, lineHeight: "30px", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

export default function MappingPage() {
  const [users, setUsers] = useState<SsoUser[]>(ssoUsers);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SsoUser | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);

  const departments = useMemo(() => [...new Set(users.map((u) => u.department))].sort(), [users]);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          search === "" ||
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.department.toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter === "all" || u.department === deptFilter;
        const matchRole = roleFilter === "all" || u.roleIds.includes(roleFilter);
        return matchSearch && matchDept && matchRole;
      }),
    [users, search, deptFilter, roleFilter]
  );

  const stats = useMemo(() => {
    const withRoles = users.filter((u) => u.roleIds.length > 0).length;
    return {
      total: users.length,
      withRoles,
      withoutRoles: users.length - withRoles,
    };
  }, [users]);

  function openEdit(user: SsoUser) {
    setSelectedUser(user);
    setEditRoleIds([...user.roleIds]);
    setShowDrawer(true);
  }

  function toggleRole(roleId: string) {
    setEditRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  }

  function saveMapping() {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, roleIds: editRoleIds } : u))
    );
    setShowDrawer(false);
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1B3A5C", letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 8 }}>
            <GitMerge size={18} style={{ color: "#1B3A5C" }} />
            Gán Vai trò Người dùng
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
            Quản lý ánh xạ giữa người dùng và vai trò trong hệ thống
          </p>
        </div>
      </div>

      {/* Gradient stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={stats.total}
          icon={Users}
          gradient="linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)"
          sub="tài khoản trong hệ thống"
        />
        <StatCard
          label="Đã gán vai trò"
          value={stats.withRoles}
          icon={UserCheck}
          gradient="linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
          sub="người dùng có ít nhất 1 vai trò"
        />
        <StatCard
          label="Chưa gán vai trò"
          value={stats.withoutRoles}
          icon={UserX}
          gradient="linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)"
          sub="cần được phân quyền"
        />
      </div>

      {/* Search & Filter section card */}
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
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #1B3A5C, #2d5a8e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Search size={14} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>Tìm kiếm &amp; Lọc</span>
        </div>
        <div style={{ padding: 20 }}>
          <div className="flex flex-wrap items-center gap-3">
            <div style={{ position: "relative", flex: "1 1 260px", minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <Input
                placeholder="Tìm theo tên, tài khoản, đơn vị..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>
            <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? "all")}>
              <SelectTrigger className="w-52 h-9 text-sm">
                <SelectValue placeholder="Tất cả đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn vị</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "all")}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {ssoRoles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search !== "" || deptFilter !== "all" || roleFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setDeptFilter("all"); setRoleFilter("all"); }}
                style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0 4px", textDecoration: "underline" }}
              >
                Xóa bộ lọc
              </button>
            )}
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
              {filtered.length} / {users.length} người dùng
            </span>
          </div>
        </div>
      </div>

      {/* Role summary section card */}
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
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #D4A843, #f0d890)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <GitMerge size={14} style={{ color: "#0a1628" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>Phân bổ vai trò</span>
        </div>
        <div style={{ padding: 20 }}>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {ssoRoles.map((role) => {
              const count = users.filter((u) => u.roleIds.includes(role.id)).length;
              return (
                <div
                  key={role.id}
                  style={{
                    border: `1px solid ${role.color}30`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    background: role.color + "06",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = role.color + "10";
                    (e.currentTarget as HTMLElement).style.borderColor = role.color + "60";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = role.color + "06";
                    (e.currentTarget as HTMLElement).style.borderColor = role.color + "30";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: role.color }} className="truncate">
                      {role.name}
                    </span>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: role.color, lineHeight: 1 }}>{count}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>người dùng</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mapping table section card */}
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
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #1B3A5C, #2d5a8e)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}
          >
            <Users size={14} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>
            Ánh xạ người dùng — vai trò
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f7fa" }}>
                {["STT", "Người dùng", "Đơn vị / Chức vụ", "Vai trò được gán", "Số quyền", "Thao tác"].map((h) => (
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
                      borderBottom: "1px solid #e8e8e8",
                      whiteSpace: "nowrap",
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
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "#9ca3af", fontSize: 13 }}>
                    Không tìm thấy người dùng
                  </td>
                </tr>
              )}
              {filtered.map((user, idx) => {
                const userRoles = ssoRoles.filter((r) => user.roleIds.includes(r.id));
                const permCount = new Set(userRoles.flatMap((r) => r.permissionIds)).size;
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
                            width: 34, height: 34, borderRadius: "50%",
                            background: avatarColor(user.id),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}
                        >
                          {initials(user.fullName)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: "#1f2937", fontSize: 13 }}>{user.fullName}</p>
                          <p style={{ fontSize: 12, color: "#9ca3af" }}>
                            {user.rank} · @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, color: "#374151" }}>{user.department}</p>
                      <p style={{ fontSize: 12, color: "#9ca3af" }}>{user.position}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {userRoles.length === 0 ? (
                        <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                          Chưa gán vai trò
                        </span>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {userRoles.map((r) => (
                            <span
                              key={r.id}
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                padding: "2px 10px",
                                borderRadius: 20,
                                background: r.color + "15",
                                color: r.color,
                                border: `1px solid ${r.color}40`,
                              }}
                            >
                              {r.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontWeight: 600, color: "#1B3A5C" }}>{permCount}</span>
                      <span style={{ color: "#9ca3af", fontSize: 12 }}> quyền</span>
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
                            Gán vai trò
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
        <div style={{ padding: "10px 16px", borderTop: "1px solid #f0f0f0", fontSize: 12, color: "#9ca3af" }}>
          Hiển thị {filtered.length} / {users.length} người dùng
        </div>
      </div>

      {/* Gán vai trò Sheet */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="!w-[700px] !max-w-[700px]"
          style={{ display: "flex", flexDirection: "column", padding: 0, gap: 0, width: 700, maxWidth: 700 }}
        >
          {/* Dark gradient header */}
          <div
            style={{
              background: "linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 100%)",
              padding: "20px 24px",
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
                <GitMerge size={20} style={{ color: "#0a1628" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
                  Gán vai trò người dùng
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
                  {selectedUser ? `${selectedUser.rank} ${selectedUser.fullName}` : "Chọn vai trò phù hợp"}
                </p>
              </div>
            </div>

            {/* User info strip */}
            {selectedUser && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: avatarColor(selectedUser.id),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {initials(selectedUser.fullName)}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>
                    {selectedUser.fullName}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                    {selectedUser.department} · {selectedUser.position}
                  </p>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {selectedUser.username}
                </span>
              </div>
            )}
          </div>

          {/* Scrollable form body */}
          {selectedUser && (
            <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }} className="space-y-4">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1B3A5C", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Vai trò được gán
                </span>
                <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  Đã chọn <span style={{ fontWeight: 600, color: "#1B3A5C" }}>{editRoleIds.length}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ssoRoles.map((role) => {
                  const checked = editRoleIds.includes(role.id);
                  return (
                    <label
                      key={role.id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${checked ? role.color + "50" : "#e8e8e8"}`,
                        background: checked ? role.color + "08" : "#fff",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRole(role.id)}
                        style={{ width: 15, height: 15, marginTop: 2, accentColor: "#1B3A5C", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: 13, color: "#1f2937" }}>{role.name}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3, paddingLeft: 18 }}>
                          {role.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

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
              onClick={saveMapping}
              style={{ background: "#1B3A5C", color: "#fff", height: 36, fontSize: 13, gap: 6 }}
            >
              <GitMerge size={13} />
              Lưu phân quyền
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
