"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, Eye, Calendar, Flame, ChevronRight,
  Activity, Star, Bell, Search, X,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ── Data ── */
const allNews = [
  {
    id: "N001",
    title: "Doanh nghiệp A triển khai thành công hệ thống quản lý vận hành số",
    excerpt: "Ngày 15/3/2026, Doanh nghiệp A đã chính thức đưa vào vận hành hệ thống quản lý vận hành thiết bị số hóa, tích hợp phần mềm chẩn đoán và hệ thống quản lý nội bộ.",
    category: "Tin hoạt động",
    date: "15/03/2026",
    isHot: true,
    views: 342,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=380&fit=crop&auto=format&q=80",
  },
  {
    id: "N007",
    title: "Doanh nghiệp A kỷ niệm 60 năm thành lập (1965–2025)",
    excerpt: "Chặng đường 60 năm xây dựng và phát triển với hàng nghìn dự án triển khai, nâng cấp hệ thống monitoring và module sản phẩm phần mềm cho Tổng công ty và đối tác. Doanh nghiệp A được tặng Bằng khen của Thủ tướng Chính phủ.",
    category: "Sự kiện",
    date: "05/03/2026",
    isHot: true,
    views: 512,
    image: "https://images.unsplash.com/photo-1564521272849-e3b33ea6c1b3?w=600&h=380&fit=crop&auto=format&q=80",
  },
  {
    id: "N002",
    title: "Hội thảo khoa học 'Ứng dụng công nghệ mới trong vận hành hệ thống monitoring'",
    excerpt: "Hội thảo thu hút hơn 80 nhà khoa học, kỹ sư từ các đơn vị trong và ngoài Tổng công ty, tập trung vào ứng dụng công nghệ chẩn đoán và kiểm thử tự động.",
    category: "Khoa học",
    date: "12/03/2026",
    isHot: false,
    views: 218,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=380&fit=crop&auto=format&q=80",
  },
  {
    id: "N003",
    title: "Trung tâm Phần mềm Alpha hoàn thành nâng cấp hệ thống monitoring P-18 cho Phòng Triển khai P291",
    excerpt: "Sau 8 tháng triển khai, Trung tâm Phần mềm Alpha đã hoàn thành nâng cấp toàn bộ hệ thống monitoring P-18 cho Phòng Triển khai P291.",
    category: "Dự án",
    date: "10/03/2026",
    isHot: false,
    views: 195,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=380&fit=crop&auto=format&q=80",
  },
  {
    id: "N004",
    title: "Đoàn cán bộ Doanh nghiệp A tham dự triển lãm Tech 2026 tại Indonesia",
    excerpt: "Đoàn cán bộ kỹ thuật 12 người đã tham dự Triển lãm Công nghệ Tech 2026, tiếp cận nhiều công nghệ tiên tiến về monitoring và sản phẩm phần mềm.",
    category: "Hợp tác quốc tế",
    date: "08/03/2026",
    isHot: false,
    views: 276,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=380&fit=crop&auto=format&q=80",
  },
  {
    id: "N005",
    title: "Nghiệm thu đề tài nghiên cứu khoa học cấp Tổng công ty về nâng cao khả năng phát hiện hệ thống monitoring",
    excerpt: "Hội đồng nghiệm thu đề tài 'Nghiên cứu, cải tiến nâng cao khả năng phát hiện cho hệ thống monitoring P-37 trong điều kiện nhiễu phức tạp' đã thông qua kết quả xuất sắc.",
    category: "Nghiên cứu KH",
    date: "06/03/2026",
    isHot: false,
    views: 163,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=380&fit=crop&auto=format&q=80",
  },
  {
    id: "N006",
    title: "Kết nạp 25 đảng viên mới trong đợt 26/3 nhân kỷ niệm thành lập Đoàn TNCS",
    excerpt: "Đảng ủy Doanh nghiệp A đã tổ chức lễ kết nạp đảng viên mới cho 25 quần chúng ưu tú, tiêu biểu trong phong trào thi đua của đơn vị năm 2025.",
    category: "Đảng ủy",
    date: "03/03/2026",
    isHot: false,
    views: 134,
    image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&h=380&fit=crop&auto=format&q=80",
  },
  {
    id: "N008",
    title: "Đoàn cán bộ Doanh nghiệp A thăm và học tập kinh nghiệm tại Trung tâm phần mềm Beta",
    excerpt: "Đoàn công tác đã có buổi làm việc và trao đổi kinh nghiệm về quy trình vận hành, nâng cấp thiết bị điện tử trên hệ thống module phần mềm.",
    category: "Tin hoạt động",
    date: "01/03/2026",
    isHot: false,
    views: 98,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=380&fit=crop&auto=format&q=80",
  },
];

const categories = ["Tất cả", "Tin hoạt động", "Khoa học", "Dự án", "Sự kiện", "Hợp tác quốc tế", "Nghiên cứu KH", "Đảng ủy"];

const catConfig: Record<string, { color: string; bg: string }> = {
  "Tin hoạt động":    { color: "text-blue-700",   bg: "bg-blue-50" },
  "Khoa học":         { color: "text-purple-700", bg: "bg-purple-50" },
  "Dự án":            { color: "text-green-700",  bg: "bg-green-50" },
  "Sự kiện":          { color: "text-orange-700", bg: "bg-orange-50" },
  "Hợp tác quốc tế":  { color: "text-cyan-700",   bg: "bg-cyan-50" },
  "Nghiên cứu KH":    { color: "text-indigo-700", bg: "bg-indigo-50" },
  "Đảng ủy":          { color: "text-red-700",    bg: "bg-red-50" },
};

function NewsImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
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

/* ── Sub-section nav cards ── */
const sections = [
  { href: "/tin-tuc/hoat-dong", label: "Tin hoạt động",   desc: "Hoạt động hàng ngày của Doanh nghiệp A",   icon: Activity, color: "#1B3A5C", bg: "#e8eef6" },
  { href: "/thong-bao",         label: "Thông báo",        desc: "Thông báo nội bộ chính thức",       icon: Bell,     color: "#D4A843", bg: "#fef2f2" },
  { href: "/tin-tuc/su-kien",   label: "Sự kiện nổi bật", desc: "Sự kiện quan trọng, lễ kỷ niệm",   icon: Star,     color: "#D4A843", bg: "#fefce8" },
];

export default function TinTucPage() {
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch]       = useState("");

  const hasFilter = catFilter !== "all" || search !== "";
  const clearFilters = () => { setCatFilter("all"); setSearch(""); };

  const allFiltered = allNews.filter((n) => {
    if (!n.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "all" && n.category !== catFilter) return false;
    return true;
  });

  const featured = allFiltered[0] ?? null;
  const filtered = allFiltered.slice(1);

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Tin tức - Sự kiện" }]} />

      <div className="space-y-6">
        {/* ── Hero ── */}
        <div className="relative rounded-xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0a1f3d 0%,#1B3A5C 60%,#2d5a8e 100%)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 80% 30%,#D4A843 0%,transparent 50%),radial-gradient(circle at 10% 70%,#D4A843 0%,transparent 40%)" }} />
          <div className="relative px-6 py-8 md:px-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-0.5 bg-[#D4A843]" />
              <span className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase">Bản tin nội bộ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Tin tức — Sự kiện</h1>
            <p className="text-blue-200 text-sm mb-5">Thông tin hoạt động và sự kiện của Doanh nghiệp A</p>
            {/* Section nav */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sections.map(({ href, label, desc, icon: Icon, color, bg }) => (
                <Link key={href} href={href}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 hover:bg-white/20 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#D4A843] transition-colors">{label}</p>
                        <p className="text-[10px] text-blue-300">{desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
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
                <Input placeholder="Tìm tiêu đề tin tức..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-gray-200 h-10 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chủ đề</label>
              <Select value={catFilter} onValueChange={(v) => setCatFilter(v ?? "all")}>
                <SelectTrigger className="rounded-xl border-gray-200 h-10 text-sm w-full">
                  <SelectValue>
                    {catFilter === "all"
                      ? <span className="text-gray-400">Tất cả chủ đề</span>
                      : <span className="font-medium text-gray-700">{catFilter}</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Tất cả chủ đề</SelectItem>
                  {categories.slice(1).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-700">{allFiltered.length}</span> / {allNews.length} bài viết
            </p>
            {hasFilter && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#D4A843] font-medium hover:opacity-75 transition-opacity">
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* ── Featured article ── */}
        {featured && (
        <Link href={`/tin-tuc/${featured.id}`}>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-56 md:h-auto bg-gradient-to-br from-[#1B3A5C] to-[#2d5a8e] overflow-hidden">
              <NewsImage src={featured.image} alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-[#D4A843] text-white border-0 text-xs font-bold px-2.5">
                  <Flame className="w-3 h-3 mr-1" /> NỔI BẬT
                </Badge>
                {(() => {
                  const c = catConfig[featured.category];
                  return c ? <Badge className={`${c.bg} ${c.color} border-0 text-xs`}>{featured.category}</Badge> : null;
                })()}
              </div>
            </div>
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{featured.date}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{featured.views} lượt xem</span>
              </div>
              <h2 className="text-lg font-black text-[#1B3A5C] group-hover:text-[#D4A843] leading-snug transition-colors mb-3">
                {featured.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{featured.excerpt}</p>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-[#1B3A5C] hover:text-[#D4A843] transition-colors w-fit">
                Đọc tiếp <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        </Link>
        )}

        {/* ── Section title ── */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#D4A843] rounded-full" />
            <h2 className="font-bold text-[#1B3A5C]">Tin tức khác</h2>
          </div>
        )}

        {/* ── News grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((news, i) => {
              const cfg = catConfig[news.category] ?? { color: "text-gray-600", bg: "bg-gray-50" };
              return (
                <motion.div key={news.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/tin-tuc/${news.id}`} className="block h-full">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-44 bg-gradient-to-br from-[#1B3A5C] to-[#2d5a8e] overflow-hidden shrink-0">
                      <NewsImage src={news.image} alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        <Badge className={`border-0 text-[10px] px-2 py-0.5 ${cfg.bg} ${cfg.color}`}>{news.category}</Badge>
                        {news.isHot && (
                          <Badge className="bg-[#D4A843] text-white border-0 text-[10px] px-2 py-0.5">
                            <Flame className="w-2.5 h-2.5 mr-0.5" />HOT
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-[#1B3A5C] text-sm leading-snug group-hover:text-[#D4A843] transition-colors line-clamp-2 mb-2">
                        {news.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">{news.excerpt}</p>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{news.date}</span>
                        <span className="flex items-center gap-1 ml-auto"><Eye className="w-3 h-3" />{news.views}</span>
                      </div>
                    </div>
                  </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center gap-3 text-gray-400">
            <Newspaper className="w-10 h-10 opacity-30" />
            <p className="font-medium">Không tìm thấy tin tức</p>
          </div>
        )}

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">Trang 1 / 6 · Tổng {allNews.length} bài viết</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, "...", 6].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-xl text-sm font-medium transition-colors ${
                p === 1 ? "bg-[#1B3A5C] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
