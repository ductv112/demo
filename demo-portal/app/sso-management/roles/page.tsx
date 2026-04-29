"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  Lock,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Users,
  Search,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ssoRoles,
  ssoUsers,
  ssoPermissions,
  permissionModules,
  type SsoRole,
} from "@/lib/sso-data";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  sub: string;
}

function StatCard({ label, value, icon: Icon, gradient, sub }: StatCardProps) {
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

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<SsoRole[]>(ssoRoles);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SsoRole | null>(null);
  const [searchRole, setSearchRole] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "system" | "custom">("all");

  const userCountByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    ssoUsers.forEach((u) => {
      u.roleIds.forEach((rId) => {
        counts[rId] = (counts[rId] || 0) + 1;
      });
    });
    return counts;
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchSearch =
        searchRole === "" ||
        r.name.toLowerCase().includes(searchRole.toLowerCase()) ||
        r.code.toLowerCase().includes(searchRole.toLowerCase()) ||
        r.description.toLowerCase().includes(searchRole.toLowerCase());
      const matchType =
        typeFilter === "all" ||
        (typeFilter === "system" && r.isSystem) ||
        (typeFilter === "custom" && !r.isSystem);
      return matchSearch && matchType;
    });
  }, [roles, searchRole, typeFilter]);

  function confirmDelete(role: SsoRole) {
    setDeleteTarget(role);
    setShowDeleteConfirm(true);
  }

  function doDelete() {
    if (deleteTarget) {
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1B3A5C", letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={18} style={{ color: "#1B3A5C" }} />
            Quản lý Vai trò
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
            Định nghĩa vai trò và tập hợp quyền truy cập trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => router.push("/sso-management/roles/new")}
          style={{ background: "#1B3A5C", color: "#fff", height: 36, fontSize: 13, gap: 6, flexShrink: 0 }}
        >
          <Plus className="w-4 h-4" />
          Thêm vai trò
        </Button>
      </div>

      {/* Gradient stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng vai trò"
          value={roles.length}
          icon={Shield}
          gradient="linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)"
          sub="vai trò trong hệ thống"
        />
        <StatCard
          label="Vai trò hệ thống"
          value={roles.filter((r) => r.isSystem).length}
          icon={Lock}
          gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
          sub="không thể chỉnh sửa"
        />
        <StatCard
          label="Vai trò tùy chỉnh"
          value={roles.filter((r) => !r.isSystem).length}
          icon={ShieldCheck}
          gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
          sub="do quản trị viên tạo"
        />
        <StatCard
          label="Tổng quyền hạn"
          value={ssoPermissions.length}
          icon={Users}
          gradient="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
          sub="quyền đã định nghĩa"
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
                placeholder="Tìm theo tên, mã vai trò, mô tả..."
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | "system" | "custom")}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="system">Vai trò hệ thống</SelectItem>
                <SelectItem value="custom">Vai trò tùy chỉnh</SelectItem>
              </SelectContent>
            </Select>
            {(searchRole !== "" || typeFilter !== "all") && (
              <button
                onClick={() => { setSearchRole(""); setTypeFilter("all"); }}
                style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0 4px", textDecoration: "underline" }}
              >
                Xóa bộ lọc
              </button>
            )}
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
              {filteredRoles.length} / {roles.length} vai trò
            </span>
          </div>
        </div>
      </div>

      {/* Role mini cards */}
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
              }}
            >
              <Shield size={14} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>Tổng quan vai trò</span>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRoles.map((role) => {
              const userCount = userCountByRole[role.id] ?? 0;
              return (
                <div
                  key={role.id}
                  style={{
                    border: `1px solid ${role.color}30`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    background: role.color + "06",
                    transition: "all 0.2s",
                    cursor: "default",
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: role.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{role.name}</span>
                    {role.isSystem && (
                      <Lock size={11} style={{ color: role.color, marginLeft: "auto" }} />
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, lineHeight: 1.4 }}>
                    {role.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{userCount} người dùng</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roles table */}
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
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <ShieldCheck size={14} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>Chi tiết vai trò &amp; quyền</span>
          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 4 }}>
            — Nhấn vào hàng để xem quyền
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f7fa" }}>
                {["STT", "Vai trò", "Mã", "Mô tả", "Số quyền", "Người dùng", "Loại", "Thao tác"].map((h) => (
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
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px 16px", color: "#9ca3af", fontSize: 13 }}>
                    Không tìm thấy vai trò phù hợp
                  </td>
                </tr>
              )}
              {filteredRoles.map((role, idx) => {
                const isExpanded = expandedId === role.id;
                const userCount = userCountByRole[role.id] ?? 0;
                const rolePerms = ssoPermissions.filter((p) => role.permissionIds.includes(p.id));
                const groupedPerms: Record<string, typeof rolePerms> = {};
                rolePerms.forEach((p) => {
                  if (!groupedPerms[p.module]) groupedPerms[p.module] = [];
                  groupedPerms[p.module].push(p);
                });

                return (
                  <>
                    <tr
                      key={role.id}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        background: isExpanded ? "#f0f6ff" : undefined,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : role.id)}
                      onMouseEnter={(e) => {
                        if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "#e8f0fe";
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "";
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 12 }}>{idx + 1}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {isExpanded ? (
                            <ChevronDown size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
                          ) : (
                            <ChevronRight size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
                          )}
                          <span style={{ width: 12, height: 12, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: "#1f2937" }}>{role.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13, maxWidth: 260 }}>
                        {role.description}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontWeight: 600, color: "#1B3A5C" }}>{role.permissionIds.length}</span>
                        <span style={{ color: "#9ca3af", fontSize: 12 }}> /{ssoPermissions.length}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#4b5563" }}>{userCount} người</td>
                      <td style={{ padding: "12px 16px" }}>
                        {role.isSystem ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "#fff2f0",
                              color: "#ff4d4f",
                              border: "1px solid #ffccc7",
                            }}
                          >
                            <Lock size={10} />
                            Hệ thống
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "#f6ffed",
                              color: "#52c41a",
                              border: "1px solid #b7eb8f",
                            }}
                          >
                            Tùy chỉnh
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                        {!role.isSystem ? (
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
                                onClick={() => router.push(`/sso-management/roles/${role.id}`)}
                              >
                                <Pencil size={13} style={{ marginRight: 8 }} />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                style={{ fontSize: 13, cursor: "pointer", color: "#ff4d4f" }}
                                onClick={() => confirmDelete(role)}
                              >
                                <Trash2 size={13} style={{ marginRight: 8 }} />
                                Xóa vai trò
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Lock size={14} style={{ color: "#d1d5db" }} />
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${role.id}-expand`} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td colSpan={8} style={{ padding: "16px 16px 20px 56px", background: "#f8faff" }}>
                          <p
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#6b7280",
                              textTransform: "uppercase",
                              letterSpacing: "0.8px",
                              marginBottom: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <ShieldCheck size={13} />
                            Danh sách quyền ({rolePerms.length})
                          </p>
                          {Object.entries(groupedPerms).map(([mod, perms]) => (
                            <div key={mod} style={{ marginBottom: 12 }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: "#1B3A5C", marginBottom: 6 }}>
                                {mod}
                              </p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {perms.map((p) => (
                                  <span
                                    key={p.id}
                                    title={p.description}
                                    style={{
                                      fontSize: 11,
                                      padding: "2px 8px",
                                      borderRadius: 4,
                                      border: "1px solid #1B3A5C30",
                                      color: "#1B3A5C",
                                      background: "#e8eef6",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {p.feature} · {p.action}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                          {rolePerms.length === 0 && (
                            <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                              Chưa có quyền nào được gán
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "#ff4d4f", fontWeight: 700 }}>Xác nhận xóa vai trò</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: 13, color: "#4b5563", padding: "8px 0" }}>
            Bạn có chắc chắn muốn xóa vai trò{" "}
            <span style={{ fontWeight: 600, color: "#1f2937" }}>{deleteTarget?.name}</span>? Người dùng
            đang có vai trò này sẽ bị ảnh hưởng.
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
              Xóa vai trò
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
