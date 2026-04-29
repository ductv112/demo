"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Bell,
  BookOpen,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Trang chủ", icon: LayoutDashboard },
  { href: "/van-ban", label: "Quản lý Văn bản", icon: FileText, badge: 12 },
  { href: "/thong-bao", label: "Thông báo Nội bộ", icon: Bell, badge: 5 },
  { href: "/thu-vien", label: "Thư viện Kỹ thuật", icon: BookOpen },
  { href: "/bieu-mau", label: "Biểu mẫu & Quy trình", icon: ClipboardList },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full overflow-hidden shrink-0"
      style={{ background: "linear-gradient(180deg, #0d1b2a 0%, #0a1628 30%, #071018 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{
            background: "linear-gradient(135deg, #D4A843, #f0d890)",
            boxShadow: "0 2px 8px rgba(212,168,67,0.3)",
          }}
        >
          <span className="text-xs font-extrabold" style={{ color: "#0a1628" }}>PT</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">
                Cổng thông tin
              </p>
              <p className="text-[11px] whitespace-nowrap" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nhà máy Z119
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 z-10 flex items-center justify-center w-6 h-6 rounded-full text-white shadow-md transition-colors"
        style={{ background: "#1B3A5C" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#2d5a8e"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#1B3A5C"; }}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            Phân hệ chính
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group relative",
                  isActive
                    ? "text-white"
                    : "hover:text-white"
                )}
                style={isActive ? {
                  background: "rgba(27,58,92,0.6)",
                } : {
                  color: "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Gold accent bar */}
                {isActive && !collapsed && (
                  <div
                    className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r"
                    style={{ background: "linear-gradient(180deg, #D4A843, #f0d890)" }}
                  />
                )}
                <div className="relative shrink-0">
                  <Icon className="w-5 h-5 transition-colors" />
                  {item.badge && collapsed && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff4d4f] rounded-full" />
                  )}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between flex-1 overflow-hidden"
                    >
                      <span className={cn("text-sm whitespace-nowrap", isActive ? "font-semibold" : "font-medium")}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge className="text-[10px] h-4 px-1.5" style={{ background: "rgba(255,77,79,0.2)", color: "#ff4d4f", border: "1px solid rgba(255,77,79,0.3)" }}>
                          {item.badge}
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <Separator style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* User section */}
      <div className="px-3 py-4 space-y-1">
        <Link href="/settings">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-sm">Cài đặt</span>}
          </div>
        </Link>

        <div className="flex items-center gap-3 px-3 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)", borderRadius: "8px", marginTop: "8px", paddingTop: "12px" }}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback
              className="text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #D4A843, #f0d890)", color: "#0a1628" }}
            >
              QH
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-white truncate">
                  Đại tá Phạm Quốc Hưng
                </p>
                <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>Giám đốc Nhà máy</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <a href="https://pkkq-sso-staging.dft.vn">
              <LogOut className="w-4 h-4 transition-colors shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            </a>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
