"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Key,
  GitMerge,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { AppSwitcher } from "@/components/layout/app-switcher";

const managementItems = [
  { icon: Users, label: "Người dùng", href: "/sso-management/users" },
  { icon: ShieldCheck, label: "Vai trò", href: "/sso-management/roles" },
  { icon: Key, label: "Phân quyền", href: "/sso-management/permissions" },
  { icon: GitMerge, label: "Gán vai trò", href: "/sso-management/mapping" },
];

const systemItems = [
  { icon: Settings, label: "Cấu hình SSO", href: "/sso-management/config" },
];

const pageTitles: Record<string, string> = {
  "/sso-management/users": "Quản lý Người dùng",
  "/sso-management/roles": "Quản lý Vai trò",
  "/sso-management/permissions": "Phân quyền Hệ thống",
  "/sso-management/mapping": "Gán Vai trò Người dùng",
  "/sso-management/config": "Cấu hình SSO",
};

export default function SsoManagementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const currentTitle = pageTitles[pathname] ?? "SSO";

  function NavItem({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
    const isActive = pathname.startsWith(href);
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          collapsed ? "justify-center px-2 py-2.5 mx-1" : "py-2.5 mx-2"
        }`}
        style={{
          color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
          background: isActive ? "rgba(27,58,92,0.6)" : "transparent",
          borderLeft: collapsed ? "none" : isActive ? "3px solid #D4A843" : "3px solid transparent",
          paddingLeft: collapsed ? undefined : isActive ? "9px" : "9px",
          fontWeight: isActive ? 600 : 500,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
          }
        }}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col z-50 transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
        style={{
          background: "linear-gradient(180deg, #0d1b2a 0%, #0a1628 30%, #071018 100%)",
        }}
      >
        {/* Logo area */}
        <div
          className={`flex items-center gap-3 overflow-hidden flex-shrink-0 ${
            collapsed ? "justify-center px-0 py-5" : "px-4 py-5"
          }`}
          style={{ height: 64 }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #D4A843 0%, #f0d890 50%, #D4A843 100%)",
              boxShadow: "0 2px 8px rgba(212,168,67,0.4)",
            }}
          >
            <span style={{ color: "#0a1628", fontWeight: 800, fontSize: 13, letterSpacing: "-0.5px" }}>SS</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p style={{ color: "#ffffff", fontWeight: 700, fontSize: 14, lineHeight: "1.2", letterSpacing: "-0.3px" }} className="truncate">
                Quản lý SSO
              </p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>
                Nhà máy Z119
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 12px" }} />

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {/* Section: QUẢN LÝ */}
          {!collapsed && (
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", padding: "4px 20px 6px" }}>
              Quản lý
            </p>
          )}
          <div className="space-y-0.5">
            {managementItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>

          {/* Divider between groups */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 12px" }} />

          {/* Section: HỆ THỐNG */}
          {!collapsed && (
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", padding: "4px 20px 6px" }}>
              Hệ thống
            </p>
          )}
          <div className="space-y-0.5">
            {systemItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </nav>

        {/* User info footer */}
        {!collapsed && (
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "12px 16px",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4A843, #f0d890)",
                  }}
                >
                  <span style={{ color: "#0a1628", fontWeight: 700, fontSize: 11 }}>QT</span>
                </div>
                <div className="min-w-0">
                  <p style={{ color: "#ffffff", fontWeight: 600, fontSize: 13, lineHeight: "1.2" }} className="truncate">
                    Quản trị viên
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 1 }}>SYSADMIN · P.Kỹ thuật</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Đăng xuất"
                style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ff6b6b"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        {/* Topbar */}
        <header
          className="sticky top-0 z-40 bg-white flex items-center justify-between px-4"
          style={{ height: 56, borderBottom: "1px solid #e8e8e8", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
        >
          {/* Left: toggle + breadcrumb */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{ width: 32, height: 32, color: "#6b7280" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: "#9ca3af" }}>
              <span>SSO</span>
              <span>/</span>
              <span style={{ fontWeight: 600, color: "#1B3A5C" }}>{currentTitle}</span>
            </div>
          </div>

          {/* Right: App Switcher + user avatar */}
          <div className="flex items-center gap-2.5">
            <AppSwitcher currentApp="sso" />
            <div className="text-right">
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1B3A5C", lineHeight: "1.2" }}>Quản trị viên</p>
              <span
                style={{
                  fontSize: 10,
                  background: "#e8eef6",
                  color: "#1B3A5C",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                }}
              >
                SYSADMIN
              </span>
            </div>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D4A843, #f0d890)",
              }}
            >
              <span style={{ color: "#0a1628", fontWeight: 700, fontSize: 11 }}>QT</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 p-6"
          style={{ background: "#f0f2f5", minHeight: "calc(100vh - 56px)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
