"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, Zap, AlertTriangle, Info, Megaphone, Clock, Pin, ChevronRight, AlertCircle } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { announcements } from "@/lib/data";
import { Button } from "@/components/ui/button";

const typeConfig: Record<string, {
  label: string;
  bar: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  iconColor: string;
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

export default function ThongBaoDetailClient() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const announcement = announcements.find((a) => a.id === id);
  const related = announcements.filter((a) => a.id !== id).slice(0, 4);

  if (!announcement) {
    return (
      <PortalLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
          <AlertCircle className="w-16 h-16 opacity-30" />
          <p className="text-lg font-semibold">Không tìm thấy thông báo</p>
          <Link href="/thong-bao">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </Button>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const cfg  = typeConfig[announcement.type] ?? typeConfig.normal;
  const Icon = cfg.icon;

  return (
    <PortalLayout>
      {/* Back button */}
      <div className="mb-6">
        <Link href="/thong-bao">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 hover:border-[#1B3A5C]/30">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Urgency indicator bar */}
            <div className="h-1.5" style={{ background: cfg.bar }} />

            <div className="px-6 py-7 md:px-10 md:py-8">
              {/* Type badge + pin */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5"
                  style={{ background: cfg.badgeBg, color: cfg.badgeText, borderColor: cfg.badgeBorder }}>
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
                {announcement.isPinned && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                    style={{ background: "#fdf5e0", color: "#8a6a00", border: "1px solid #e8d08a" }}>
                    <Pin className="w-3 h-3" /> Đã ghim
                  </span>
                )}
                {!announcement.isRead && (
                  <span className="text-xs font-semibold text-[#1B3A5C] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1B3A5C] inline-block" />
                    Chưa đọc
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl font-black text-[#1B3A5C] leading-snug mb-5">
                {announcement.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">{announcement.author}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {announcement.date} · {announcement.time}
                </span>
              </div>

              {/* Content */}
              <div className="text-base text-gray-700 leading-relaxed space-y-4">
                {announcement.content.split(/\.\s+(?=[A-ZĐÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ])/).map((sentence, idx, arr) => (
                  <p key={idx}>{sentence}{idx < arr.length - 1 ? "." : ""}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar: Related announcements ── */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #0a1f3d 0%, #1B3A5C 100%)" }}>
              <Bell className="w-4 h-4 text-white/70" />
              <span className="text-sm font-bold text-white">Thông báo khác</span>
            </div>
            <div className="divide-y divide-gray-100">
              {related.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Không có thông báo liên quan.</p>
              )}
              {related.map((a) => {
                const relCfg  = typeConfig[a.type] ?? typeConfig.normal;
                const RelIcon = relCfg.icon;
                return (
                  <Link key={a.id} href={`/thong-bao/${a.id}`}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: relCfg.iconBg }}>
                      <RelIcon className="w-3.5 h-3.5" style={{ color: relCfg.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#1B3A5C] transition-colors">
                        {a.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {a.date}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1B3A5C] shrink-0 self-center transition-colors" />
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100">
              <Link href="/thong-bao">
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Xem tất cả thông báo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
