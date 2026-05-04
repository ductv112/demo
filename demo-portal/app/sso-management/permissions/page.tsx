"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Key, CheckSquare, Square, Shield, Layers, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ssoPermissions, ssoRoles, permissionModules, type SsoPermission } from "@/lib/sso-data";

type ActionType = "view" | "create" | "update" | "delete" | "approve";

const actions: ActionType[] = ["view", "create", "update", "delete", "approve"];

const actionLabel: Record<ActionType, string> = {
  view: "Xem",
  create: "Tạo mới",
  update: "Sửa",
  delete: "Xóa",
  approve: "Duyệt",
};

const actionStyle: Record<ActionType, { bg: string; color: string; header: string }> = {
  view: { bg: "#e8f0fe", color: "#1B3A5C", header: "#1B3A5C" },
  create: { bg: "#f6ffed", color: "#52c41a", header: "#389e0d" },
  update: { bg: "#fffbe6", color: "#faad14", header: "#d48806" },
  delete: { bg: "#fff2f0", color: "#ff4d4f", header: "#cf1322" },
  approve: { bg: "#f9f0ff", color: "#722ed1", header: "#531dab" },
};

// Module gradient backgrounds for icon badges
const moduleGradients = [
  "linear-gradient(135deg, #1B3A5C, #2d5a8e)",
  "linear-gradient(135deg, #7c3aed, #a855f7)",
  "linear-gradient(135deg, #059669, #34d399)",
  "linear-gradient(135deg, #d97706, #fbbf24)",
  "linear-gradient(135deg, #dc2626, #f87171)",
  "linear-gradient(135deg, #0891b2, #22d3ee)",
  "linear-gradient(135deg, #4f46e5, #818cf8)",
  "linear-gradient(135deg, #b45309, #fcd34d)",
];

function buildMatrix(module: string) {
  const perms = ssoPermissions.filter((p) => p.module === module);
  const features = [...new Set(perms.map((p) => p.feature))];
  const matrix: Record<string, Record<ActionType, SsoPermission | null>> = {};
  features.forEach((feat) => {
    matrix[feat] = { view: null, create: null, update: null, delete: null, approve: null };
    perms
      .filter((p) => p.feature === feat)
      .forEach((p) => {
        matrix[feat][p.action as ActionType] = p;
      });
  });
  return { features, matrix };
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
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(255,255,255,0.2)",
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

export default function PermissionsPage() {
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [searchPerm, setSearchPerm] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(permissionModules));
  const [enabledPerms, setEnabledPerms] = useState<Set<string>>(
    new Set(ssoPermissions.map((p) => p.id))
  );

  const displayedModules = useMemo(() => {
    const base = moduleFilter === "all" ? permissionModules : [moduleFilter];
    if (!searchPerm) return base;
    return base.filter((mod) =>
      mod.toLowerCase().includes(searchPerm.toLowerCase()) ||
      ssoPermissions.some(
        (p) =>
          p.module === mod &&
          (p.feature.toLowerCase().includes(searchPerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchPerm.toLowerCase()))
      )
    );
  }, [moduleFilter, searchPerm]);

  function toggleModule(mod: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  }

  function togglePerm(permId: string) {
    setEnabledPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  }

  const totalEnabled = enabledPerms.size;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1B3A5C", letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 8 }}>
            <Key size={18} style={{ color: "#1B3A5C" }} />
            Phân quyền Hệ thống
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
            Ma trận quyền theo tính năng và hành động — Doanh nghiệp A
          </p>
        </div>
      </div>

      {/* Gradient stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng quyền hạn"
          value={ssoPermissions.length}
          icon={Key}
          gradient="linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)"
          sub="quyền đã định nghĩa"
        />
        <StatCard
          label="Đang kích hoạt"
          value={totalEnabled}
          icon={CheckSquare}
          gradient="linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
          sub="quyền đang hoạt động"
        />
        <StatCard
          label="Đã tắt"
          value={ssoPermissions.length - totalEnabled}
          icon={Square}
          gradient="linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)"
          sub="quyền bị vô hiệu"
        />
        <StatCard
          label="Phân hệ"
          value={permissionModules.length}
          icon={Layers}
          gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
          sub="phân hệ nghiệp vụ"
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
                placeholder="Tìm theo phân hệ, tính năng, mô tả..."
                value={searchPerm}
                onChange={(e) => setSearchPerm(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>
            <Select value={moduleFilter} onValueChange={(v) => setModuleFilter(v ?? "all")}>
              <SelectTrigger className="w-52 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phân hệ</SelectItem>
                {permissionModules.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchPerm !== "" || moduleFilter !== "all") && (
              <button
                onClick={() => { setSearchPerm(""); setModuleFilter("all"); }}
                style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0 4px", textDecoration: "underline" }}
              >
                Xóa bộ lọc
              </button>
            )}
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
              {displayedModules.length} / {permissionModules.length} phân hệ · Nhấn checkbox để bật/tắt quyền
            </span>
          </div>
        </div>
      </div>

      {/* Permission matrix by module */}
      <div className="space-y-4">
        {displayedModules.map((mod, modIdx) => {
          const { features, matrix } = buildMatrix(mod);
          const modPerms = ssoPermissions.filter((p) => p.module === mod);
          const modEnabled = modPerms.filter((p) => enabledPerms.has(p.id)).length;
          const isExpanded = expandedModules.has(mod);
          const rolesWithMod = ssoRoles.filter((r) =>
            modPerms.some((p) => r.permissionIds.includes(p.id))
          );
          const gradient = moduleGradients[modIdx % moduleGradients.length];

          return (
            <div
              key={mod}
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
              {/* Module card header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: isExpanded ? "1px solid #f0f0f0" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  background: "#f5f7fa",
                }}
                onClick={() => toggleModule(mod)}
              >
                {isExpanded ? (
                  <ChevronDown size={16} style={{ color: "#9ca3af", flexShrink: 0 }} />
                ) : (
                  <ChevronRight size={16} style={{ color: "#9ca3af", flexShrink: 0 }} />
                )}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <Shield size={14} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>{mod}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "#e8eef6",
                    color: "#1B3A5C",
                    border: "1px solid #c5d5e8",
                  }}
                >
                  {modEnabled}/{modPerms.length} quyền
                </span>
                <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                  {rolesWithMod.map((r) => (
                    <span
                      key={r.id}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: r.color + "18",
                        color: r.color,
                      }}
                    >
                      {r.code}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matrix table */}
              {isExpanded && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#fafbff" }}>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "10px 16px",
                            fontWeight: 600,
                            fontSize: 12,
                            color: "#1B3A5C",
                            borderBottom: "1px solid #e8e8e8",
                            minWidth: 180,
                          }}
                        >
                          Tính năng
                        </th>
                        {actions.map((a) => (
                          <th
                            key={a}
                            style={{
                              textAlign: "center",
                              padding: "10px 12px",
                              fontWeight: 600,
                              fontSize: 12,
                              borderBottom: "1px solid #e8e8e8",
                              minWidth: 90,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                background: actionStyle[a].bg,
                                color: actionStyle[a].header,
                              }}
                            >
                              {actionLabel[a]}
                            </span>
                          </th>
                        ))}
                        <th
                          style={{
                            textAlign: "left",
                            padding: "10px 16px",
                            fontWeight: 600,
                            fontSize: 12,
                            color: "#1B3A5C",
                            borderBottom: "1px solid #e8e8e8",
                          }}
                        >
                          Vai trò có quyền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feat) => {
                        const featPerms = Object.values(matrix[feat]).filter(Boolean) as SsoPermission[];
                        const rolesWithFeat = ssoRoles.filter((r) =>
                          featPerms.some((p) => r.permissionIds.includes(p.id))
                        );
                        return (
                          <tr
                            key={feat}
                            style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e8f0fe"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                          >
                            <td style={{ padding: "12px 16px", fontWeight: 500, color: "#374151" }}>
                              {feat}
                            </td>
                            {actions.map((action) => {
                              const perm = matrix[feat][action];
                              if (!perm) {
                                return (
                                  <td key={action} style={{ padding: "12px", textAlign: "center" }}>
                                    <span style={{ color: "#d9d9d9", fontSize: 16 }}>—</span>
                                  </td>
                                );
                              }
                              const enabled = enabledPerms.has(perm.id);
                              return (
                                <td key={action} style={{ padding: "12px", textAlign: "center" }}>
                                  <button
                                    onClick={() => togglePerm(perm.id)}
                                    title={perm.description}
                                    style={{
                                      border: "none",
                                      background: "none",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "transform 0.15s",
                                      padding: 0,
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.2)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                                  >
                                    {enabled ? (
                                      <CheckSquare
                                        size={20}
                                        style={{ color: actionStyle[action].header }}
                                      />
                                    ) : (
                                      <Square size={20} style={{ color: "#d9d9d9" }} />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {rolesWithFeat.map((r) => (
                                  <span
                                    key={r.id}
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 600,
                                      padding: "1px 6px",
                                      borderRadius: 4,
                                      background: r.color + "18",
                                      color: r.color,
                                    }}
                                  >
                                    {r.code}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
