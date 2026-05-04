"use client";

import { useState } from "react";
import {
  Settings,
  Eye,
  EyeOff,
  CheckCircle,
  RefreshCw,
  Server,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ssoConfig, type SsoConfig } from "@/lib/sso-data";

function SectionCard({
  icon: Icon,
  iconGradient,
  title,
  children,
}: {
  icon: React.ElementType;
  iconGradient: string;
  title: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e8e8e8",
        boxShadow: hovered ? "0 8px 24px rgba(27,58,92,0.1)" : "0 2px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
        transition: "box-shadow 0.3s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#f5f7fa",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: iconGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <Icon size={14} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1B3A5C" }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  colorOn = "bg-green-500",
}: {
  checked: boolean;
  onChange: () => void;
  colorOn?: string;
}) {
  return (
    <button
      onClick={onChange}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        background: checked ? (colorOn === "bg-green-500" ? "#52c41a" : "#1B3A5C") : "#d9d9d9",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

export default function ConfigPage() {
  const [config, setConfig] = useState<SsoConfig>(ssoConfig);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "fail">("idle");

  function update<K extends keyof SsoConfig>(key: K, value: SsoConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  }

  function handleTest() {
    setTesting(true);
    setTestResult("idle");
    setTimeout(() => {
      setTesting(false);
      setTestResult("success");
      setTimeout(() => setTestResult("idle"), 4000);
    }, 1200);
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1B3A5C", letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 8 }}>
            <Settings size={18} style={{ color: "#1B3A5C" }} />
            Cấu hình SSO
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
            Thiết lập nhà cung cấp xác thực và chính sách bảo mật phiên đăng nhập
          </p>
        </div>
      </div>

      {/* Section 1: Provider */}
      <SectionCard
        icon={Server}
        iconGradient="linear-gradient(135deg, #1B3A5C, #2d5a8e)"
        title="Nhà cung cấp SSO"
      >
        <div className="space-y-5">
          {/* Master toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: 10,
              border: "1px solid #e8e8e8",
              background: config.enabled ? "#f6ffed" : "#fafafa",
              transition: "background 0.2s",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#1f2937" }}>Kích hoạt SSO</p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                Cho phép người dùng đăng nhập qua nhà cung cấp SSO bên ngoài
              </p>
            </div>
            <Toggle checked={config.enabled} onChange={() => update("enabled", !config.enabled)} colorOn="bg-green-500" />
          </div>

          {config.enabled && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#f6ffed",
                color: "#52c41a",
                fontSize: 13,
                fontWeight: 500,
                border: "1px solid #b7eb8f",
              }}
            >
              <CheckCircle size={16} />
              SSO đang hoạt động — Người dùng sẽ được chuyển hướng đến nhà cung cấp khi đăng nhập
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Nhà cung cấp</Label>
              <Select value={config.provider} onValueChange={(v) => update("provider", v ?? "LDAP")}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LDAP">LDAP</SelectItem>
                  <SelectItem value="Google">Google Workspace</SelectItem>
                  <SelectItem value="Azure AD">Azure Active Directory</SelectItem>
                  <SelectItem value="Keycloak">Keycloak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Trạng thái kết nối</Label>
              <div
                style={{
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: `1px solid ${config.enabled ? "#b7eb8f" : "#e8e8e8"}`,
                  background: config.enabled ? "#f6ffed" : "#fafafa",
                  fontSize: 13,
                  fontWeight: 500,
                  color: config.enabled ? "#52c41a" : "#9ca3af",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: config.enabled ? "#52c41a" : "#d9d9d9",
                    flexShrink: 0,
                  }}
                />
                {config.enabled ? "Đã kết nối" : "Chưa kích hoạt"}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Section 2: Connection info */}
      <SectionCard
        icon={Shield}
        iconGradient="linear-gradient(135deg, #7c3aed, #a855f7)"
        title="Thông tin kết nối"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Client ID</Label>
            <Input
              value={config.clientId}
              onChange={(e) => update("clientId", e.target.value)}
              placeholder="doanhnghiepa-sso-client"
              className="h-9 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Client Secret</Label>
            <div style={{ position: "relative" }}>
              <Input
                type={showSecret ? "text" : "password"}
                value={config.clientSecret}
                onChange={(e) => update("clientSecret", e.target.value)}
                placeholder="••••••••••••"
                className="h-9 text-sm font-mono pr-10"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#4b5563"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Redirect URL</Label>
            <Input
              value={config.redirectUrl}
              onChange={(e) => update("redirectUrl", e.target.value)}
              placeholder="http://localhost:3000/auth/callback"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>SSO Endpoint</Label>
            <Input
              value={config.ssoEndpoint}
              onChange={(e) => update("ssoEndpoint", e.target.value)}
              placeholder="ldap://ldap.doanhnghiepa.vn:389/dc=doanhnghiepa,dc=vn"
              className="h-9 text-sm font-mono"
            />
          </div>

          {/* Test connection button */}
          <div style={{ paddingTop: 4 }}>
            <button
              onClick={handleTest}
              disabled={testing}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: 8,
                border: `1px solid ${testResult === "success" ? "#b7eb8f" : testResult === "fail" ? "#ffccc7" : "#c5d5e8"}`,
                color:
                  testResult === "success"
                    ? "#52c41a"
                    : testResult === "fail"
                    ? "#ff4d4f"
                    : "#1B3A5C",
                background:
                  testResult === "success"
                    ? "#f6ffed"
                    : testResult === "fail"
                    ? "#fff2f0"
                    : "#e8eef6",
                cursor: testing ? "not-allowed" : "pointer",
                opacity: testing ? 0.7 : 1,
                transition: "all 0.2s",
              }}
            >
              {testing ? (
                <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
              ) : testResult === "success" ? (
                <CheckCircle size={15} />
              ) : (
                <RefreshCw size={15} />
              )}
              {testing
                ? "Đang kiểm tra..."
                : testResult === "success"
                ? "Kết nối thành công!"
                : testResult === "fail"
                ? "Kết nối thất bại"
                : "Kiểm tra kết nối"}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Security policy */}
      <SectionCard
        icon={Clock}
        iconGradient="linear-gradient(135deg, #059669, #34d399)"
        title="Chính sách bảo mật"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                Thời gian phiên (phút)
              </Label>
              <Input
                type="number"
                min={30}
                max={1440}
                value={config.sessionTimeout}
                onChange={(e) => update("sessionTimeout", Number(e.target.value))}
                className="h-9 text-sm"
              />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                {config.sessionTimeout >= 60
                  ? `${Math.floor(config.sessionTimeout / 60)} giờ${config.sessionTimeout % 60 > 0 ? ` ${config.sessionTimeout % 60} phút` : ""}`
                  : `${config.sessionTimeout} phút`}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                Số lần sai tối đa
              </Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={config.maxLoginAttempts}
                onChange={(e) => update("maxLoginAttempts", Number(e.target.value))}
                className="h-9 text-sm"
              />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                Lần thứ {config.maxLoginAttempts + 1} sẽ khóa
              </p>
            </div>
            <div className="space-y-1.5">
              <Label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                Thời gian khóa (phút)
              </Label>
              <Input
                type="number"
                min={5}
                max={1440}
                value={config.lockDuration}
                onChange={(e) => update("lockDuration", Number(e.target.value))}
                className="h-9 text-sm"
              />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                Tự mở sau {config.lockDuration} phút
              </p>
            </div>
          </div>

          {/* 2FA toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: 10,
              border: "1px solid #e8e8e8",
              background: config.twoFactorEnabled ? "#e8eef6" : "#fafafa",
              transition: "background 0.2s",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#1f2937" }}>
                Xác thực hai yếu tố (2FA)
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                Yêu cầu mã OTP khi đăng nhập từ thiết bị lạ
              </p>
            </div>
            <Toggle
              checked={config.twoFactorEnabled}
              onChange={() => update("twoFactorEnabled", !config.twoFactorEnabled)}
              colorOn="navy"
            />
          </div>

          {config.twoFactorEnabled && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#e8eef6",
                color: "#1B3A5C",
                fontSize: 13,
                fontWeight: 500,
                border: "1px solid #c5d5e8",
              }}
            >
              <Shield size={16} />
              2FA được kích hoạt — Người dùng cần ứng dụng xác thực (TOTP) khi đăng nhập từ xa
            </div>
          )}
        </div>
      </SectionCard>

      {/* Save footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e8e8e8",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          {saved && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#52c41a",
              }}
            >
              <CheckCircle size={16} />
              Đã lưu cấu hình thành công
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="outline"
            onClick={() => {
              setConfig(ssoConfig);
              setSaved(false);
            }}
            className="h-9 text-sm"
          >
            Đặt lại mặc định
          </Button>
          <Button
            onClick={handleSave}
            className="h-9 text-sm"
            style={{ background: "#1B3A5C", color: "#fff", gap: 6 }}
          >
            <Settings size={15} />
            Lưu cấu hình
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
