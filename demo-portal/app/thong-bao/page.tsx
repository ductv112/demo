"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bell, AlertTriangle, Info,
  Clock, Search, Pin, ChevronRight, Zap,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Input } from "@/components/ui/input";
import { announcements } from "@/lib/data";

/* ── Type config — website palette only ── */
const typeConfig: Record<string, {
  label: string;
  bar: string;
  badgeBg: string; badgeText: string; badgeBorder: string;
  iconBg: string;  iconColor: string;
  icon: React.ElementType;
}> = {
  urgent: {
    label: "Khẩn cấp",
    bar: "#D4A843",
    badgeBg: "#fde8eb", badgeText: "#D4A843", badgeBorder: "#f0a0ab",
    iconBg: "#fde8eb",  iconColor: "#D4A843",
    icon: Zap,
  },
  important: {
    label: "Quan trọng",
    bar: "#D4A843",
    badgeBg: "#fdf5e0", badgeText: "#8a6a00", badgeBorder: "#e8d08a",
    iconBg: "#fdf5e0",  iconColor: "#8a6a00",
    icon: AlertTriangle,
  },
  normal: {
    label: "Thông báo",
    bar: "#1B3A5C",
    badgeBg: "#e8eef6", badgeText: "#1B3A5C", badgeBorder: "#b8cce0",
    iconBg: "#e8eef6",  iconColor: "#1B3A5C",
    icon: Info,
  },
};

const filterTypes = ["all", "urgent", "important", "normal"] as const;

export default function ThongBaoPage() {
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = announcements.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const unread = announcements.filter((a) => !a.isRead).length;

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Thông báo Nội bộ" }]} />

      <div className="space-y-6">

        {/* ── Hero ── */}
        <div className="relative rounded-xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a1f3d 0%, #1B3A5C 60%, #2d5a8e 100%)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 75% 30%, #D4A843 0%, transparent 50%), radial-gradient(circle at 15% 70%, #D4A843 0%, transparent 40%)" }} />
          <div className="relative px-6 py-8 md:px-10 flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-[#D4A843]" />
                <span className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase">Bảng tin nội bộ</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Thông báo Nội bộ</h1>
              <p className="text-blue-200 text-sm">Nhà máy Z119 · Toàn đơn vị</p>
            </div>
            {unread > 0 && (
              <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-white/10 border border-white/20">
                <span className="text-3xl font-black text-[#f0d890]">{unread}</span>
                <span className="text-[10px] text-blue-200 font-medium mt-0.5">Chưa đọc</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Tìm kiếm thông báo..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl border-gray-200" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filterTypes.map((t) => {
                const cfg = t !== "all" ? typeConfig[t] : null;
                const active = typeFilter === t;
                return (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium border transition-all"
                    style={
                      active
                        ? { background: "#1B3A5C", color: "#ffffff", borderColor: "#1B3A5C" }
                        : cfg
                        ? { background: cfg.badgeBg, color: cfg.badgeText, borderColor: cfg.badgeBorder }
                        : { background: "#f3f4f6", color: "#6b7280", borderColor: "#e5e7eb" }
                    }>
                    {t === "all" ? "Tất cả" : cfg!.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 ml-auto">
              <span className="font-semibold text-gray-700">{filtered.length}</span> / {announcements.length} thông báo
            </p>
          </div>
        </div>

        {/* ── List ── */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((a, i) => {
              const cfg  = typeConfig[a.type];
              const Icon = cfg.icon;
              return (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/thong-bao/${a.id}`} className="block">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#1B3A5C]/20 transition-all cursor-pointer group overflow-hidden">
                      <div className="flex items-stretch">
                        {/* Type color bar */}
                        <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: cfg.bar }} />

                        <div className="flex-1 p-4 md:p-5 flex items-start gap-4 min-w-0">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: cfg.iconBg }}>
                            <Icon className="w-4 h-4" style={{ color: cfg.iconColor }} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              {a.isPinned && (
                                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: "#fdf5e0", color: "#8a6a00", border: "1px solid #e8d08a" }}>
                                  <Pin className="w-2.5 h-2.5" /> Ghim
                                </span>
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                style={{ background: cfg.badgeBg, color: cfg.badgeText, borderColor: cfg.badgeBorder }}>
                                {cfg.label}
                              </span>
                              {!a.isRead && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#1B3A5C]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B3A5C] inline-block" /> Mới
                                </span>
                              )}
                            </div>
                            <h3 className={`text-sm font-bold leading-snug group-hover:text-[#1B3A5C] transition-colors ${!a.isRead ? "text-gray-900" : "text-gray-700"}`}>
                              {a.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{a.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Bell className="w-3 h-3" /> {a.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {a.date} · {a.time}
                              </span>
                            </div>
                          </div>

                          {/* Hover arrow */}
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1B3A5C] group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl py-20 flex flex-col items-center gap-3 text-gray-400">
              <Bell className="w-12 h-12 opacity-30" />
              <p className="font-medium">Không có thông báo nào</p>
              <p className="text-sm">Thử thay đổi từ khóa hoặc bộ lọc</p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
