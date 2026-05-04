"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const notifications = [
  { id: 1, title: "Có văn bản mới cần xử lý", desc: "102/CV-BGĐ - Về bảo mật thông tin", time: "5 phút", unread: true },
  { id: 2, title: "Thông báo hội nghị tổng kết", desc: "Ngày 20/03/2026 tại Hội trường A", time: "1 giờ", unread: true },
  { id: 3, title: "Biểu mẫu đã được phê duyệt", desc: "BM-SKKT-02/2026 đã được duyệt", time: "2 giờ", unread: false },
];

export function Header({ title, subtitle }: HeaderProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-base font-bold text-foreground leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative hidden md:block w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm..."
          className="pl-9 h-8 text-sm bg-muted/50 border-muted focus:bg-background"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
        </button>

        <AnimatePresence>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold">Thông báo</span>
                <Badge className="bg-red-100 text-red-600 border-0 text-xs">2 mới</Badge>
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${n.unread ? "bg-blue-50/50" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      )}
                      {!n.unread && <span className="w-2 h-2 mt-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.desc}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{n.time} trước</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <Link href="/thong-bao" onClick={() => setShowNotif(false)}>
                  <button className="w-full text-xs text-primary hover:underline py-1">
                    Xem tất cả thông báo
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              NM
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold leading-tight">Phạm Q. Hưng</p>
            <p className="text-[10px] text-muted-foreground">Giám đốc</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        <AnimatePresence>
          {showUser && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Phạm Quốc Hưng</p>
                <p className="text-xs text-muted-foreground">Giám đốc</p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3 text-[#1B3A5C]" />
                  <span className="text-[10px] text-[#1B3A5C]">Quản trị hệ thống</span>
                </div>
              </div>
              <div className="p-1">
                {[
                  { icon: User, label: "Thông tin cá nhân" },
                  { icon: Settings, label: "Cài đặt" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    {item.label}
                  </button>
                ))}
                <Separator className="my-1" />
                <a href="http://localhost:5173" onClick={() => setShowUser(false)}>
                  <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay to close dropdowns */}
      {(showNotif || showUser) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotif(false); setShowUser(false); }}
        />
      )}
    </header>
  );
}
