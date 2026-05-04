"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Calendar, MapPin, Users, ChevronRight, Trophy, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ── Data ── */
const events = [
  {
    id: 1,
    title: "Doanh nghiệp A kỷ niệm 60 năm thành lập (1965–2025)",
    excerpt: "Buổi lễ long trọng kỷ niệm chặng đường 60 năm xây dựng, phát triển và trưởng thành của Doanh nghiệp A. Đơn vị được tặng Bằng khen của Thủ tướng Chính phủ. Sự kiện đón tiếp đại diện lãnh đạo Tổng công ty, Bộ TT&TT và nhiều đoàn khách.",
    date: "15/04/2025",
    location: "Hội trường lớn Doanh nghiệp A, Hà Nội",
    participants: "350+",
    highlight: true,
    badge: "Kỷ niệm 60 năm",
    badgeColor: "bg-[#D4A843] text-white",
    accentColor: "#D4A843",
    image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&h=500&fit=crop&auto=format&q=80",
  },
  {
    id: 2,
    title: "Hội nghị Tổng kết Công tác Năm 2025 — Triển khai nhiệm vụ năm 2026",
    excerpt: "Hội nghị đánh giá toàn diện kết quả công tác năm 2025, biểu dương cá nhân và tập thể xuất sắc, đồng thời triển khai phương hướng nhiệm vụ trọng tâm năm 2026.",
    date: "20/01/2026",
    location: "Hội trường Doanh nghiệp A",
    participants: "128",
    highlight: false,
    badge: "Hội nghị",
    badgeColor: "bg-blue-600 text-white",
    accentColor: "#2563eb",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 3,
    title: "Bàn giao hệ thống monitoring 36D6 sau nâng cấp cho Khối K361",
    excerpt: "Lễ bàn giao chính thức hệ thống monitoring 36D6 sau nâng cấp toàn diện cho Khối K361, đánh dấu thành tựu quan trọng trong việc duy trì vận hành hệ thống doanh nghiệp.",
    date: "10/03/2026",
    location: "Doanh nghiệp A, Hà Nội",
    participants: "45",
    highlight: false,
    badge: "Bàn giao dự án",
    badgeColor: "bg-green-600 text-white",
    accentColor: "#16a34a",
    image: "https://images.unsplash.com/photo-1564521272849-e3b33ea6c1b3?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 4,
    title: "Hội thảo quốc tế 'Vận hành hệ thống monitoring hiện đại — Kinh nghiệm Việt Nam'",
    excerpt: "Hội thảo quốc tế quy mô lớn với sự tham gia của các chuyên gia kỹ thuật từ 8 quốc gia, chia sẻ kinh nghiệm và công nghệ trong lĩnh vực vận hành hệ thống monitoring doanh nghiệp.",
    date: "25/11/2025",
    location: "Khách sạn Melia, Hà Nội",
    participants: "120",
    highlight: false,
    badge: "Quốc tế",
    badgeColor: "bg-cyan-600 text-white",
    accentColor: "#0891b2",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 5,
    title: "Lễ nhận Bằng khen của Thủ tướng Chính phủ cho tập thể Doanh nghiệp A",
    excerpt: "Doanh nghiệp A vinh dự được Thủ tướng Chính phủ tặng Bằng khen về thành tích xuất sắc trong công tác phát triển, vận hành sản phẩm phần mềm phục vụ chuyển đổi số quốc gia.",
    date: "02/09/2025",
    location: "Hà Nội",
    participants: "30",
    highlight: false,
    badge: "Khen thưởng",
    badgeColor: "bg-yellow-600 text-white",
    accentColor: "#d97706",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 6,
    title: "Triển lãm thành tựu công nghệ nhân kỷ niệm 60 năm thành lập Doanh nghiệp A",
    excerpt: "Triển lãm trưng bày hơn 200 hiện vật, tài liệu và mô hình sản phẩm tiêu biểu qua 60 năm lịch sử của đơn vị, thu hút hàng nghìn lượt khách tham quan.",
    date: "14–17/04/2025",
    location: "Doanh nghiệp A, Hà Nội",
    participants: "2000+",
    highlight: false,
    badge: "Triển lãm",
    badgeColor: "bg-purple-600 text-white",
    accentColor: "#7c3aed",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&h=440&fit=crop&auto=format&q=80",
  },
];

function EventImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img src={src} alt={alt} className={className}
      onError={(e) => {
        const t = e.target as HTMLImageElement;
        t.style.display = "none";
        const p = t.parentElement;
        if (p) p.style.background = "linear-gradient(135deg,#1B3A5C,#2d5a8e)";
      }}
    />
  );
}

const badges = Array.from(new Set(events.map((e) => e.badge)));

export default function SuKienPage() {
  const [search, setSearch]         = useState("");
  const [badgeFilter, setBadgeFilter] = useState("all");

  const hasFilter = search !== "" || badgeFilter !== "all";
  const clearFilters = () => { setSearch(""); setBadgeFilter("all"); };

  const allFiltered = events.filter((e) => {
    if (!e.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (badgeFilter !== "all" && e.badge !== badgeFilter) return false;
    return true;
  });

  const featured = allFiltered.find((e) => e.highlight) ?? allFiltered[0] ?? null;
  const rest     = allFiltered.filter((e) => e !== featured);

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Tin tức - Sự kiện", href: "/tin-tuc" }, { label: "Sự kiện nổi bật" }]} />

      <div className="space-y-6">
        {/* ── Hero ── */}
        <div className="relative rounded-xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0a1f3d 0%,#1B3A5C 60%,#2d5a8e 100%)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%,#D4A843 0%,transparent 50%),radial-gradient(circle at 10% 80%,#D4A843 0%,transparent 40%)" }} />
          <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-[#D4A843]" />
                <span className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase">Sự kiện tiêu biểu</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Sự kiện nổi bật</h1>
              <p className="text-blue-200 text-sm">Các sự kiện quan trọng và lễ kỷ niệm của Doanh nghiệp A</p>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { label: "Sự kiện lớn", value: events.length.toString() },
                { label: "Quốc tế", value: "3" },
                { label: "Đại biểu", value: "3K+" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-[10px] text-blue-200 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Tìm tên sự kiện..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-gray-200 h-10 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại sự kiện</label>
              <Select value={badgeFilter} onValueChange={(v) => setBadgeFilter(v ?? "all")}>
                <SelectTrigger className="rounded-xl border-gray-200 h-10 text-sm w-full">
                  <SelectValue>
                    {badgeFilter === "all"
                      ? <span className="text-gray-400">Tất cả loại</span>
                      : <span className="font-medium text-gray-700">{badgeFilter}</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {badges.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-700">{allFiltered.length}</span> / {events.length} sự kiện
            </p>
            {hasFilter && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#D4A843] font-medium hover:opacity-75 transition-opacity">
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* ── Featured event — large card ── */}
        {featured && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#1B3A5C] to-[#2d5a8e] overflow-hidden">
              <EventImage src={featured.image} alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Overlay content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-[#D4A843]" />
                  <Badge className={`text-xs font-bold px-3 py-1 ${featured.badgeColor} border-0`}>{featured.badge}</Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white leading-snug mb-3">{featured.title}</h2>
                <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-2 max-w-2xl">{featured.excerpt}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-300">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#D4A843]" />{featured.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#D4A843]" />{featured.location}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#D4A843]" />{featured.participants} đại biểu</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* ── Other events section title ── */}
        {rest.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#D4A843] rounded-full" />
            <h2 className="font-black text-[#1B3A5C] text-lg">Sự kiện tiêu biểu khác</h2>
          </div>
        )}

        {/* ── Events grid ── */}
        <div className="grid md:grid-cols-2 gap-5">
          <AnimatePresence>
          {rest.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer h-full flex flex-col">
                {/* Accent top bar */}
                <div className="h-1 w-full" style={{ background: event.accentColor }} />
                {/* Image strip */}
                <div className="relative h-44 bg-gradient-to-br from-[#1B3A5C] to-[#2d5a8e] overflow-hidden shrink-0">
                  <EventImage src={event.image} alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge className={`text-[10px] font-semibold px-2.5 border-0 ${event.badgeColor}`}>{event.badge}</Badge>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[#1B3A5C] text-sm leading-snug group-hover:text-[#D4A843] transition-colors line-clamp-2 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">{event.excerpt}</p>
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: event.accentColor }} />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: event.accentColor }} />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs text-gray-400">
                        <Users className="w-3.5 h-3.5" style={{ color: event.accentColor }} />
                        {event.participants} đại biểu
                      </span>
                      <button className="flex items-center gap-1 text-xs font-semibold transition-colors"
                        style={{ color: event.accentColor }}>
                        Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        {allFiltered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center gap-3 text-gray-400">
            <Trophy className="w-10 h-10 opacity-30" />
            <p className="font-medium">Không tìm thấy sự kiện</p>
            <p className="text-sm">Thử thay đổi từ khóa hoặc loại sự kiện</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
