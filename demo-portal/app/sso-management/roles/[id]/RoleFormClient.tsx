"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  ArrowLeft,
  Save,
  Lock,
  Search,
  Users,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ssoRoles, ssoUsers, ssoPermissions, permissionModules } from "@/lib/sso-data";

const colorOptions = [
  { hex: "#dc2626", label: "Đỏ" },
  { hex: "#7c3aed", label: "Tím" },
  { hex: "#1B3A5C", label: "Navy" },
  { hex: "#0891b2", label: "Xanh cyan" },
  { hex: "#059669", label: "Xanh lá" },
  { hex: "#d97706", label: "Cam" },
  { hex: "#4f46e5", label: "Chàm" },
  { hex: "#0d7a4f", label: "Xanh đậm" },
];

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

const actionBadge: Record<string, { label: string; bg: string; color: string }> = {
  view:    { label: "Xem",   bg: "#e8f0fe", color: "#1B3A5C" },
  create:  { label: "Tạo",   bg: "#f6ffed", color: "#389e0d" },
  update:  { label: "Sửa",   bg: "#fffbe6", color: "#d48806" },
  delete:  { label: "Xóa",   bg: "#fff2f0", color: "#cf1322" },
  approve: { label: "Duyệt", bg: "#f9f0ff", color: "#531dab" },
};

function avatarInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}
const avatarColors = ["#1B3A5C", "#2d5a8e", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626"];
const avatarColor = (id: string) => avatarColors[id.charCodeAt(id.length - 1) % avatarColors.length];

export default function RoleFormClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";
  const permSectionRef = useRef<HTMLDivElement>(null);

  const existingRole = useMemo(
    () => (!isNew ? ssoRoles.find((r) => r.id === id) : undefined),
    [id, isNew]
  );

  const [name, setName] = useState(existingRole?.name ?? "");
  const [code, setCode] = useState(existingRole?.code ?? "");
  const [description, setDescription] = useState(existingRole?.description ?? "");
  const [color, setColor] = useState(existingRole?.color ?? "#1B3A5C");
  const [permissionIds, setPermissionIds] = useState<string[]>(existingRole?.permissionIds ?? []);
  const [permSearch, setPermSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean; code?: boolean }>({});

  // Users with this role (edit mode)
  const usersWithRole = useMemo(
    () => (!isNew ? ssoUsers.filter((u) => u.roleIds.includes(id)) : []),
    [id, isNew]
  );

  const permsByModule = useMemo(() => {
    const map: Record<string, typeof ssoPermissions> = {};
    ssoPermissions.forEach((p) => {
      if (!map[p.module]) map[p.module] = [];
      map[p.module].push(p);
    });
    return map;
  }, []);

  // Filtered modules + permissions based on search
  const filteredModules = useMemo(() => {
    if (!permSearch) return permissionModules;
    const q = permSearch.toLowerCase();
    return permissionModules.filter((mod) =>
      mod.toLowerCase().includes(q) ||
      (permsByModule[mod] ?? []).some(
        (p) =>
          p.description.toLowerCase().includes(q) ||
          p.feature.toLowerCase().includes(q) ||
          actionBadge[p.action]?.label.toLowerCase().includes(q)
      )
    );
  }, [permSearch, permsByModule]);

  function getFilteredPerms(mod: string) {
    const all = permsByModule[mod] ?? [];
    if (!permSearch) return all;
    const q = permSearch.toLowerCase();
    return all.filter(
      (p) =>
        p.description.toLowerCase().includes(q) ||
        p.feature.toLowerCase().includes(q) ||
        actionBadge[p.action]?.label.toLowerCase().includes(q) ||
        mod.toLowerCase().includes(q)
    );
  }

  function togglePerm(permId: string) {
    setPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  }

  function toggleModule(module: string) {
    const modulePerms = (permsByModule[module] ?? []).map((p) => p.id);
    const allSelected = modulePerms.every((id) => permissionIds.includes(id));
    setPermissionIds((prev) =>
      allSelected
        ? prev.filter((id) => !modulePerms.includes(id))
        : [...new Set([...prev, ...modulePerms])]
    );
  }

  function toggleCollapse(mod: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  }

  function expandAll() {
    setCollapsed(new Set());
  }
  function collapseAll() {
    setCollapsed(new Set(permissionModules));
  }

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = true;
    if (!code.trim()) e.code = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => router.push("/sso-management/roles"), 900);
  }

  if (!isNew && !existingRole) {
    return (
      <div style={{ textAlign: "center", padding: "80px 16px", color: "#9ca3af", fontSize: 14 }}>
        Không tìm thấy vai trò.{" "}
        <button onClick={() => router.back()} style={{ color: "#1B3A5C", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
          Quay lại
        </button>
      </div>
    );
  }

  const selectedCount = permissionIds.length;
  const pct = Math.round((selectedCount / ssoPermissions.length) * 100);

  return (
    <div>
      {/* ── Top banner ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 60%, #2d5a8e 100%)",
          borderRadius: 14,
          padding: "24px 28px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div style={{ position: "absolute", top: -30, right: -30, opacity: 0.06 }}>
          <Shield size={180} color="#fff" />
        </div>

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          {/* Left: back + title */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <button
              onClick={() => router.push("/sso-management/roles")}
              style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0, marginTop: 2,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.8)", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Quản lý SSO</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>/</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Vai trò</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>/</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                  {isNew ? "Thêm mới" : "Chỉnh sửa"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Role badge preview */}
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 14px ${color}60`,
                    border: "2px solid rgba(255,255,255,0.2)",
                    transition: "background 0.3s",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>
                    {code.slice(0, 2) || (isNew ? "??" : existingRole?.code.slice(0, 2))}
                  </span>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
                    {isNew ? (name || "Vai trò mới") : (name || existingRole?.name)}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    {code && (
                      <span
                        style={{
                          fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                          padding: "2px 8px", borderRadius: 4,
                          background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)",
                        }}
                      >
                        {code}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                      {isNew ? "Vai trò tùy chỉnh mới" : `${usersWithRole.length} người dùng đang sử dụng`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
            {/* Permission count badge */}
            <div
              style={{
                padding: "6px 14px", borderRadius: 8,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <ShieldCheck size={14} style={{ color: "#D4A843" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{selectedCount}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>/ {ssoPermissions.length} quyền</span>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/sso-management/roles")}
              style={{
                height: 36, fontSize: 13,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={saved}
              style={{
                height: 36, fontSize: 13, gap: 6,
                background: saved ? "#52c41a" : "#D4A843",
                color: saved ? "#fff" : "#0a1628",
                fontWeight: 700,
                transition: "all 0.3s",
                border: "none",
              }}
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Đã lưu!" : isNew ? "Tạo vai trò" : "Lưu thay đổi"}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.12)" }}>
            <div
              style={{
                height: "100%", borderRadius: 2, background: "#D4A843",
                width: `${pct}%`, transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
            {pct}% phân quyền
          </span>
        </div>
      </div>

      {/* ── Content grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left column ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Basic info */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #1B3A5C, #2d5a8e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Shield size={13} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#1B3A5C" }}>Thông tin vai trò</span>
            </div>
            <div style={{ padding: "16px 20px" }} className="space-y-3">
              <div className="space-y-1.5">
                <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  Tên vai trò <span style={{ color: "#ff4d4f" }}>*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: false })); }}
                  placeholder="VD: Trưởng phòng Kỹ thuật"
                  className="h-9 text-sm"
                  style={{ borderColor: errors.name ? "#ff4d4f" : undefined, boxShadow: errors.name ? "0 0 0 2px rgba(255,77,79,0.1)" : undefined }}
                />
                {errors.name && (
                  <p style={{ fontSize: 12, color: "#ff4d4f", display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertCircle size={12} /> Vui lòng nhập tên vai trò
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  Mã vai trò <span style={{ color: "#ff4d4f" }}>*</span>
                </Label>
                <Input
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "")); if (errors.code) setErrors((p) => ({ ...p, code: false })); }}
                  placeholder="VD: HEAD_KT"
                  className="h-9 text-sm font-mono"
                  style={{ borderColor: errors.code ? "#ff4d4f" : undefined, boxShadow: errors.code ? "0 0 0 2px rgba(255,77,79,0.1)" : undefined }}
                />
                {errors.code ? (
                  <p style={{ fontSize: 12, color: "#ff4d4f", display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertCircle size={12} /> Vui lòng nhập mã vai trò
                  </p>
                ) : (
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>Viết hoa, không dấu, dùng dấu gạch dưới (_)</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Mô tả vai trò</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả phạm vi, mục đích và đối tượng sử dụng vai trò này..."
                  rows={3}
                  style={{
                    width: "100%", padding: "8px 12px", borderRadius: 6,
                    border: "1px solid #e8e8e8", fontSize: 13, color: "#374151",
                    resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.5,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#1B3A5C"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(27,58,92,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          </div>

          {/* Color picker */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{code.slice(0, 2) || "??"}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#1B3A5C" }}>Màu nhận diện</span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    title={c.label}
                    style={{
                      width: 30, height: 30, borderRadius: 8, background: c.hex,
                      border: color === c.hex ? "3px solid #fff" : "2px solid transparent",
                      outline: color === c.hex ? `2.5px solid ${c.hex}` : "none",
                      outlineOffset: 2, cursor: "pointer", transition: "all 0.15s",
                    }}
                    onClick={() => setColor(c.hex)}
                  />
                ))}
              </div>
              {/* Live preview card */}
              <div
                style={{
                  padding: "12px 14px", borderRadius: 8,
                  border: `1px solid ${color}30`,
                  background: color + "08",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{name || "Tên vai trò"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, background: color + "18", color, padding: "2px 8px", borderRadius: 20 }}>
                    {code || "CODE"}
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{selectedCount} quyền</span>
                </div>
              </div>
            </div>
          </div>

          {/* Permission summary */}
          <div
            style={{
              background: "linear-gradient(135deg, #0d1b2a, #1B3A5C)",
              borderRadius: 12, padding: "16px 20px", color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={15} style={{ color: "#D4A843" }} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>Tóm tắt quyền</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#D4A843" }}>{selectedCount}</span>
            </div>
            {/* Per-module mini bars */}
            <div className="space-y-2">
              {permissionModules.map((mod) => {
                const total = (permsByModule[mod] ?? []).length;
                const selected = (permsByModule[mod] ?? []).filter((p) => permissionIds.includes(p.id)).length;
                const p = total > 0 ? Math.round((selected / total) * 100) : 0;
                return (
                  <div key={mod}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{mod}</span>
                      <span style={{ fontSize: 11, color: selected > 0 ? "#D4A843" : "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                        {selected}/{total}
                      </span>
                    </div>
                    <div style={{ height: 2, borderRadius: 1, background: "rgba(255,255,255,0.1)" }}>
                      <div style={{ height: "100%", borderRadius: 1, background: selected > 0 ? "#D4A843" : "transparent", width: `${p}%`, transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Users with this role (edit only) */}
          {!isNew && usersWithRole.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #059669, #34d399)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Users size={13} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#1B3A5C" }}>
                  Người dùng ({usersWithRole.length})
                </span>
              </div>
              <div style={{ padding: "12px 20px" }} className="space-y-2">
                {usersWithRole.map((u) => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: avatarColor(u.id),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 10, fontWeight: 700,
                      }}
                    >
                      {avatarInitials(u.fullName)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", margin: 0 }} className="truncate">
                        {u.fullName}
                      </p>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }} className="truncate">
                        {u.rank} · {u.department}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: Permission matrix ─────────────────────────────────── */}
        <div className="lg:col-span-2" ref={permSectionRef}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            {/* Card header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Lock size={13} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#1B3A5C" }}>Phân bổ quyền hạn</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>— {filteredModules.length} phân hệ</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setPermissionIds(ssoPermissions.map((p) => p.id))}
                  style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid #1B3A5C30", background: "#e8eef6", color: "#1B3A5C", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1B3A5C"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#e8eef6"; (e.currentTarget as HTMLElement).style.color = "#1B3A5C"; }}
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() => setPermissionIds([])}
                  style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid #e8e8e8", background: "#f5f5f5", color: "#6b7280", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e5e5e5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
                >
                  Bỏ tất cả
                </button>
                <button
                  onClick={expandAll}
                  style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #e8e8e8", background: "#f5f5f5", color: "#6b7280", cursor: "pointer" }}
                  title="Mở rộng tất cả"
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  onClick={collapseAll}
                  style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #e8e8e8", background: "#f5f5f5", color: "#6b7280", cursor: "pointer" }}
                  title="Thu gọn tất cả"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Search permissions */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #f0f0f0", background: "#fafbff" }}>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <Input
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="Tìm quyền theo tên, tính năng, hành động..."
                  className="pl-8 h-8 text-sm bg-white"
                />
                {permSearch && (
                  <button
                    onClick={() => setPermSearch("")}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, lineHeight: 1 }}
                  >
                    ×
                  </button>
                )}
              </div>
              {permSearch && (
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                  Tìm thấy{" "}
                  <span style={{ fontWeight: 600, color: "#1B3A5C" }}>
                    {filteredModules.reduce((acc, mod) => acc + getFilteredPerms(mod).length, 0)}
                  </span>{" "}
                  quyền trong {filteredModules.length} phân hệ
                </p>
              )}
            </div>

            {/* Permissions list */}
            <div style={{ padding: "16px 20px" }} className="space-y-3">
              {filteredModules.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#9ca3af", fontSize: 13 }}>
                  Không tìm thấy quyền phù hợp
                </div>
              )}

              {filteredModules.map((mod, modIdx) => {
                const allModPerms = permsByModule[mod] ?? [];
                const filteredPerms = getFilteredPerms(mod);
                const checkedCount = allModPerms.filter((p) => permissionIds.includes(p.id)).length;
                const allChecked = checkedCount === allModPerms.length;
                const someChecked = checkedCount > 0 && !allChecked;
                const isCollapsed = collapsed.has(mod);
                const gradient = moduleGradients[modIdx % moduleGradients.length];

                return (
                  <div
                    key={mod}
                    style={{
                      border: `1px solid ${allChecked ? "#1B3A5C20" : someChecked ? "#1B3A5C10" : "#e8e8e8"}`,
                      borderRadius: 10,
                      overflow: "hidden",
                      transition: "border-color 0.15s",
                      background: allChecked ? "#f8fbff" : "#fff",
                    }}
                  >
                    {/* Module row */}
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                        cursor: "pointer", transition: "background 0.15s",
                        background: allChecked ? "#eef4ff" : someChecked ? "#f8faff" : "#f5f7fa",
                        borderBottom: isCollapsed ? "none" : "1px solid #f0f0f0",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => { if (el) el.indeterminate = someChecked; }}
                        onChange={() => toggleModule(mod)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: 14, height: 14, accentColor: "#1B3A5C", cursor: "pointer", flexShrink: 0 }}
                      />
                      <div
                        style={{ width: 26, height: 26, borderRadius: 6, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}
                        onClick={() => toggleCollapse(mod)}
                      >
                        <Shield size={11} />
                      </div>
                      <span
                        style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", flex: 1 }}
                        onClick={() => toggleCollapse(mod)}
                      >
                        {mod}
                      </span>
                      {/* Module stats */}
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: allChecked ? "#dbeafe" : "#f5f5f5", color: allChecked ? "#1B3A5C" : "#9ca3af", border: `1px solid ${allChecked ? "#c5d5e8" : "#e5e5e5"}` }}>
                        {checkedCount}/{allModPerms.length}
                      </span>
                      <button
                        onClick={() => toggleCollapse(mod)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 2 }}
                      >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Permissions */}
                    {!isCollapsed && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                          gap: 0,
                          padding: "8px 12px 12px",
                        }}
                      >
                        {filteredPerms.map((perm) => {
                          const checked = permissionIds.includes(perm.id);
                          const badge = actionBadge[perm.action];
                          return (
                            <label
                              key={perm.id}
                              style={{
                                display: "flex", alignItems: "flex-start", gap: 8,
                                padding: "7px 10px", borderRadius: 7, cursor: "pointer",
                                background: checked ? "#f0f6ff" : "transparent",
                                border: `1px solid ${checked ? "#1B3A5C20" : "transparent"}`,
                                transition: "all 0.12s",
                                margin: 2,
                              }}
                              onMouseEnter={(e) => {
                                if (!checked) (e.currentTarget as HTMLElement).style.background = "#f5f7fa";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = checked ? "#f0f6ff" : "transparent";
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePerm(perm.id)}
                                style={{ width: 13, height: 13, marginTop: 2, accentColor: "#1B3A5C", flexShrink: 0 }}
                              />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 12, fontWeight: checked ? 600 : 400, color: checked ? "#1f2937" : "#4b5563", lineHeight: 1.4 }}>
                                    {perm.description}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{perm.feature}</span>
                                  <span style={{ fontSize: 10, color: "#d1d5db" }}>·</span>
                                  {badge && (
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: badge.bg, color: badge.color }}>
                                      {badge.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid #f0f0f0", background: "#fafbff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckSquare size={14} style={{ color: "#1B3A5C" }} />
                <span style={{ fontSize: 13, color: "#4b5563" }}>
                  Đã chọn <strong style={{ color: "#1B3A5C" }}>{selectedCount}</strong> / {ssoPermissions.length} quyền ({pct}%)
                </span>
              </div>
              <Button
                onClick={handleSave}
                disabled={saved}
                style={{
                  height: 36, fontSize: 13, gap: 6,
                  background: saved ? "#52c41a" : "#1B3A5C",
                  color: "#fff", transition: "all 0.3s",
                }}
              >
                {saved ? <Check size={14} /> : <Save size={14} />}
                {saved ? "Đã lưu!" : isNew ? "Tạo vai trò" : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
