"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Bell,
  Image,
  Settings,
  Users,
  FileText,
  CalendarDays,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { AppSwitcher } from "@/components/layout/app-switcher";
import { logout } from "@/lib/auth";

const navGroups = [
  {
    label: "Nội dung",
    items: [
      { icon: Newspaper,    label: "Tin tức",    href: "/cms/tin-tuc" },
      { icon: Bell,         label: "Thông báo",  href: "/cms/thong-bao" },
      { icon: CalendarDays, label: "Sự kiện",    href: "/cms/su-kien" },
      { icon: FileText,     label: "Văn bản",    href: "/cms/van-ban" },
      { icon: ClipboardList,label: "Biểu mẫu",  href: "/cms/bieu-mau" },
      { icon: Image,        label: "Banner",     href: "/cms/banner" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { icon: Users,    label: "Người dùng", href: "/cms/nguoi-dung" },
      { icon: Settings, label: "Cài đặt",    href: "/cms/cai-dat" },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/cms":            "Tổng quan",
  "/cms/tin-tuc":    "Quản lý Tin tức",
  "/cms/thong-bao":  "Quản lý Thông báo",
  "/cms/su-kien":    "Quản lý Sự kiện",
  "/cms/van-ban":    "Quản lý Văn bản",
  "/cms/bieu-mau":   "Quản lý Biểu mẫu",
  "/cms/banner":     "Quản lý Banner",
  "/cms/nguoi-dung": "Người dùng & Phân quyền",
  "/cms/cai-dat":    "Cài đặt",
  "/cms/giao-dien":  "Cài đặt giao diện",
};

const DEMO_USER = { name: "Nguyễn Văn Hùng", position: "Quản trị viên CMS", initials: "HN" };

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed]   = useState(false);
  const [showUser,  setShowUser]    = useState(false);

  const currentTitle = pageTitles[pathname] ?? "CMS";

  return (
    <div className="flex min-h-screen" style={{ background: "#f0f2f5" }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="fixed top-0 left-0 h-screen flex flex-col z-50 transition-all duration-200 overflow-hidden"
        style={{
          width: collapsed ? 80 : 260,
          background: "linear-gradient(180deg, #0d1b2a 0%, #0a1628 30%, #071018 100%)",
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center gap-3 shrink-0"
          style={{
            height: 64,
            padding: collapsed ? "0" : "0 18px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #D4A843 0%, #f0d890 50%, #D4A843 100%)",
              boxShadow: "0 2px 8px rgba(212,168,67,0.3)",
            }}
          >
            <span className="text-xs font-extrabold" style={{ color: "#0a1628" }}>CM</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white leading-tight whitespace-nowrap" style={{ letterSpacing: "-0.3px" }}>
                Quản trị nội dung
              </p>
              <p className="text-[11px] whitespace-nowrap" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nhà máy Z119
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              {!collapsed && (
                <p
                  className="px-5 mb-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5 px-2">
                {group.items.map(({ icon: Icon, label, href }) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link key={href} href={href} title={collapsed ? label : undefined}>
                      <div
                        className="relative flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-200"
                        style={{
                          height: 44,
                          padding: collapsed ? "0 12px" : "0 12px 0 14px",
                          justifyContent: collapsed ? "center" : "flex-start",
                          background: isActive ? "rgba(27,58,92,0.6)" : "transparent",
                          color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                        }}
                      >
                        {/* Gold accent bar */}
                        {isActive && !collapsed && (
                          <div
                            className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r"
                            style={{ background: "linear-gradient(180deg, #D4A843, #f0d890)" }}
                          />
                        )}
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {!collapsed && (
                          <span
                            className="text-[13px] whitespace-nowrap"
                            style={{ fontWeight: isActive ? 600 : 500 }}
                          >
                            {label}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mx-4 mt-2" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>
          ))}
        </nav>

        {/* User panel */}
        {!collapsed && (
          <div
            className="shrink-0 flex items-center gap-2.5 px-4 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #D4A843, #f0d890)", color: "#0a1628" }}
            >
              {DEMO_USER.initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{DEMO_USER.name}</p>
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{DEMO_USER.position}</p>
            </div>
            <button onClick={() => logout()} title="Đăng xuất">
              <LogOut className="w-4 h-4 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) => { (e.currentTarget as SVGElement).style.color = "#ff4d4f"; }}
                onMouseLeave={(e) => { (e.currentTarget as SVGElement).style.color = "rgba(255,255,255,0.3)"; }}
              />
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? 80 : 260 }}
      >
        {/* Header */}
        <header
          className="h-14 bg-white flex items-center justify-between px-6 sticky top-0 z-40"
          style={{ borderBottom: "1px solid #eef0f3", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
        >
          {/* Left: toggle + breadcrumb */}
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ color: "#666" }}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5 text-gray-400 text-[13px]">
              <span style={{ color: "#1B3A5C", fontWeight: 600 }}>CMS</span>
              <span className="text-gray-300">/</span>
              <span className="font-semibold" style={{ color: "#8c8c8c" }}>{currentTitle}</span>
            </div>
          </div>

          {/* Right: AppSwitcher + User */}
          <div className="flex items-center gap-3">
            <AppSwitcher currentApp="cms" />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUser(!showUser)}
                onBlur={() => setTimeout(() => setShowUser(false), 150)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #D4A843, #f0d890)", color: "#0a1628" }}
                >
                  {DEMO_USER.initials}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-[13px] font-semibold text-[#1B3A5C] leading-tight">{DEMO_USER.name}</p>
                  <p className="text-[11px] text-gray-400">{DEMO_USER.position}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              <AnimatePresence>
                {showUser && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100" style={{ background: "#f0f4fa" }}>
                      <p className="text-sm font-bold text-[#1B3A5C]">{DEMO_USER.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{DEMO_USER.position}</p>
                    </div>
                    <Link href="/noi-bo/dashboard">
                      <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <UserCircle className="w-4 h-4 text-gray-400" /> Trang cá nhân
                      </div>
                    </Link>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
