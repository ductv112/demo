"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Eye, Calendar, ChevronRight, Search, Flame, X } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ── Data ── */
const activities = [
  {
    id: 1,
    title: "Nhà máy Z119 triển khai thành công hệ thống quản lý sửa chữa số",
    excerpt: "Ngày 15/3/2026, Nhà máy đã chính thức đưa vào vận hành hệ thống quản lý sửa chữa khí tài số hóa, tích hợp phần mềm chẩn đoán và quản lý nội bộ, bước đầu đạt kết quả tốt.",
    date: "15/03/2026",
    views: 342,
    isNew: true,
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 2,
    title: "Hội thảo khoa học 'Ứng dụng công nghệ mới trong sửa chữa khí tài phòng không'",
    excerpt: "Hội thảo thu hút hơn 80 nhà khoa học, kỹ sư từ các đơn vị trong và ngoài quân đội, tập trung vào việc ứng dụng công nghệ chẩn đoán và kiểm tra không phá hủy trong sửa chữa khí tài.",
    date: "12/03/2026",
    views: 218,
    isNew: false,
    category: "Hội thảo",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 3,
    title: "Phân xưởng 1 hoàn thành đại tu radar P-18 cho Trung đoàn 291",
    excerpt: "Sau 8 tháng triển khai, Phân xưởng Sửa chữa Radar đã hoàn thành đại tu toàn bộ tổ hợp radar P-18, đáp ứng đầy đủ yêu cầu kỹ thuật.",
    date: "10/03/2026",
    views: 195,
    isNew: false,
    category: "Dự án",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 4,
    title: "Đoàn cán bộ Nhà máy tham dự triển lãm INDO Defence 2026 tại Indonesia",
    excerpt: "Đoàn cán bộ kỹ thuật 12 người đã tham dự Triển lãm Quốc phòng INDO Defence, tiếp cận nhiều công nghệ tiên tiến trong lĩnh vực sửa chữa khí tài phòng không thế giới.",
    date: "08/03/2026",
    views: 276,
    isNew: false,
    category: "Hợp tác quốc tế",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 5,
    title: "Nghiệm thu đề tài nghiên cứu khoa học cấp Bộ Quốc phòng về nâng cao tầm phát hiện radar",
    excerpt: "Hội đồng nghiệm thu đề tài 'Nghiên cứu, cải tiến nâng cao tầm phát hiện cho radar P-37 trong điều kiện nhiễu phức tạp' đã thông qua kết quả nghiên cứu xuất sắc.",
    date: "06/03/2026",
    views: 163,
    isNew: false,
    category: "Nghiên cứu",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 6,
    title: "Tổ chức lớp tập huấn phần mềm chẩn đoán kỹ thuật cho cán bộ Nhà máy",
    excerpt: "Nhà máy phối hợp với đối tác kỹ thuật tổ chức khóa tập huấn nâng cao về phần mềm chẩn đoán khí tài, nâng cao năng lực sửa chữa cho đội ngũ kỹ sư.",
    date: "04/03/2026",
    views: 142,
    isNew: false,
    category: "Đào tạo",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 7,
    title: "Đoàn cán bộ Nhà máy thăm và học tập kinh nghiệm tại Nhà máy Z111",
    excerpt: "Đoàn công tác đã có buổi làm việc và trao đổi kinh nghiệm về quy trình sửa chữa, đại tu khí tài điện tử phòng không tại thực địa.",
    date: "01/03/2026",
    views: 98,
    isNew: false,
    category: "Học tập",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&h=440&fit=crop&auto=format&q=80",
  },
  {
    id: 8,
    title: "Kết nạp 25 đảng viên mới trong đợt 26/3 nhân kỷ niệm thành lập Đoàn TNCS",
    excerpt: "Đảng ủy Nhà máy đã tổ chức lễ kết nạp đảng viên mới cho 25 quần chúng ưu tú, tiêu biểu trong phong trào thi đua của Nhà máy năm 2025.",
    date: "03/03/2026",
    views: 134,
    isNew: false,
    category: "Đảng ủy",
    image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=700&h=440&fit=crop&auto=format&q=80",
  },
];

const catColors: Record<string, string> = {
  "Công nghệ":        "bg-blue-50 text-blue-700",
  "Hội thảo":         "bg-purple-50 text-purple-700",
  "Dự án":            "bg-green-50 text-green-700",
  "Hợp tác quốc tế":  "bg-cyan-50 text-cyan-700",
  "Nghiên cứu":       "bg-indigo-50 text-indigo-700",
  "Đào tạo":          "bg-teal-50 text-teal-700",
  "Học tập":          "bg-emerald-50 text-emerald-700",
  "Đảng ủy":          "bg-red-50 text-red-700",
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

const categories = Array.from(new Set(activities.map((a) => a.category)));

export default function HoatDongPage() {
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const hasFilter = search !== "" || catFilter !== "all";
  const clearFilters = () => { setSearch(""); setCatFilter("all"); };

  const filtered = activities.filter((a) => {
    if (!a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "all" && a.category !== catFilter) return false;
    return true;
  });

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Tin tức - Sự kiện", href: "/tin-tuc" }, { label: "Tin hoạt động" }]} />

      <div className="space-y-6">
        {/* ── Hero ── */}
        <div className="relative rounded-xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0a1f3d 0%,#1B3A5C 60%,#2d5a8e 100%)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 90% 40%,#D4A843 0%,transparent 50%)" }} />
          <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-[#D4A843]" />
                <span className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase">Bản tin nội bộ</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Tin hoạt động</h1>
              <p className="text-blue-200 text-sm">Thông tin về các hoạt động của Nhà máy Z119</p>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { label: "Bài viết", value: activities.length.toString() },
                { label: "Tháng này", value: "8" },
                { label: "Lượt xem", value: "1.7K" },
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
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-700">{filtered.length}</span> / {activities.length} bài viết
            </p>
            {hasFilter && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#D4A843] font-medium hover:opacity-75 transition-opacity">
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* ── Featured ── */}
        {featured && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <div className="grid md:grid-cols-5 gap-0">
              <div className="md:col-span-3 relative h-56 md:h-72 bg-gradient-to-br from-[#1B3A5C] to-[#2d5a8e] overflow-hidden">
                <NewsImage src={featured.image} alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-[#D4A843] text-white border-0 font-bold text-xs px-2.5">
                    <Flame className="w-3 h-3 mr-1" /> MỚI NHẤT
                  </Badge>
                  <Badge className={`border-0 text-xs px-2 ${catColors[featured.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {featured.category}
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-2 p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{featured.date}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{featured.views} lượt xem</span>
                </div>
                <h2 className="text-base font-black text-[#1B3A5C] group-hover:text-[#D4A843] leading-snug transition-colors mb-3">
                  {featured.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                <button className="flex items-center gap-1.5 text-sm font-semibold text-[#1B3A5C] hover:text-[#D4A843] transition-colors w-fit">
                  Đọc tiếp <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* ── Section title ── */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#D4A843] rounded-full" />
          <h2 className="font-bold text-[#1B3A5C]">Tin hoạt động khác</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {rest.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer h-full flex flex-col">
                  <div className="relative h-40 bg-gradient-to-br from-[#1B3A5C] to-[#2d5a8e] overflow-hidden shrink-0">
                    <NewsImage src={item.image} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      <Badge className={`border-0 text-[10px] px-2 py-0.5 ${catColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {item.category}
                      </Badge>
                      {item.isNew && (
                        <Badge className="bg-[#D4A843] text-white border-0 text-[10px] px-2 py-0.5">MỚI</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[#1B3A5C] text-sm leading-snug group-hover:text-[#D4A843] transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">{item.excerpt}</p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.date}</span>
                      <span className="flex items-center gap-1 ml-auto"><Eye className="w-3 h-3" />{item.views}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {rest.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center gap-3 text-gray-400">
            <Activity className="w-10 h-10 opacity-30" />
            <p className="font-medium">Không tìm thấy tin tức</p>
          </div>
        )}

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">Trang 1 / 4 · Tổng {activities.length} bài viết</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-xl text-sm font-medium transition-colors ${
                p === 1 ? "bg-[#1B3A5C] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
