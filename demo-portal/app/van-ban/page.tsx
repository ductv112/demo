"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText, Search, Download,
  Building2, Calendar, ChevronRight, Flame, X, Eye,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { documents } from "@/lib/data";

/* ── helpers ── */
// Parse "DD/MM/YYYY" → Date for comparison
function parseVNDate(s: string): Date | null {
  const [d, m, y] = s.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}
// "YYYY-MM-DD" (input[type=date] value) → Date
function parseISODate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/* ── Loại config — website palette ── */
const loaiConfig: Record<string, { color: string; badgeBg: string; badgeBorder: string; bar: string; panelFrom: string; panelTo: string }> = {
  "Quyết định": { color: "#1B3A5C", badgeBg: "#e8eef6", badgeBorder: "#b8cce0", bar: "#1B3A5C", panelFrom: "#1B3A5C", panelTo: "#2d5a8e" },
  "Công văn":   { color: "#2d5a8e", badgeBg: "#eaf0fa", badgeBorder: "#a8bedd", bar: "#2d5a8e", panelFrom: "#2d5a8e", panelTo: "#2a5490" },
  "Mệnh lệnh":  { color: "#D4A843", badgeBg: "#fde8eb", badgeBorder: "#f0a0ab", bar: "#D4A843", panelFrom: "#8b0014", panelTo: "#D4A843" },
  "Thông báo":  { color: "#8a6a00", badgeBg: "#fdf5e0", badgeBorder: "#e8d08a", bar: "#D4A843", panelFrom: "#8a6a00", panelTo: "#D4A843" },
  "Báo cáo":    { color: "#1B3A5C", badgeBg: "#e8eef6", badgeBorder: "#b8cce0", bar: "#1B3A5C", panelFrom: "#0a1f3d", panelTo: "#1B3A5C" },
  "Kế hoạch":   { color: "#2d5a8e", badgeBg: "#eaf0fa", badgeBorder: "#a8bedd", bar: "#2d5a8e", panelFrom: "#1B3A5C", panelTo: "#2d5a8e" },
};

const loaiTypes = ["Quyết định", "Công văn", "Mệnh lệnh", "Thông báo", "Báo cáo", "Kế hoạch"];

export default function VanBanPage() {
  const [search, setSearch]       = useState("");
  const [loaiFilter, setLoaiFilter] = useState("all");
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");

  const hasFilter = loaiFilter !== "all" || dateFrom !== "" || dateTo !== "" || search !== "";

  const clearFilters = () => {
    setSearch(""); setLoaiFilter("all");
    setDateFrom(""); setDateTo("");
  };

  const filtered = documents.filter((d) => {
    const q = search.toLowerCase();
    if (!(d.trichYeu.toLowerCase().includes(q) || d.soHieu.toLowerCase().includes(q))) return false;
    if (loaiFilter !== "all" && d.loaiVanBan !== loaiFilter) return false;
    const docDate = parseVNDate(d.ngayBanHanh);
    if (docDate) {
      const from = parseISODate(dateFrom);
      const to   = parseISODate(dateTo);
      if (from && docDate < from) return false;
      if (to   && docDate > to)   return false;
    }
    return true;
  });

  const featured = filtered[0] ?? null;
  const rest     = filtered.slice(1);

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Văn bản — Chỉ đạo" }]} />

      <div className="space-y-6">

        {/* ── Hero ── */}
        <div className="relative rounded-xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a1f3d 0%, #1B3A5C 60%, #2d5a8e 100%)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #D4A843 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D4A843 0%, transparent 40%)" }} />
          <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-[#D4A843]" />
                <span className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase">Hệ thống văn bản điện tử</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Văn bản — Chỉ đạo — Mệnh lệnh</h1>
              <p className="text-blue-200 text-sm">Doanh nghiệp A · Tổng công ty Công nghệ</p>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { label: "Tổng văn bản", value: documents.length.toString() },
                { label: "Tháng này",    value: "5" },
                { label: "Loại",         value: loaiTypes.length.toString() },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Số hiệu, trích yếu văn bản..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-gray-200 h-10 text-sm" />
              </div>
            </div>

            {/* Loại văn bản */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại văn bản</label>
              <Select value={loaiFilter} onValueChange={(v) => setLoaiFilter(v ?? "all")}>
                <SelectTrigger className="rounded-xl border-gray-200 h-10 text-sm w-full">
                  <SelectValue>
                    {loaiFilter === "all" ? (
                      <span className="text-gray-400">Tất cả loại</span>
                    ) : (
                      <span className="font-medium text-gray-700">{loaiFilter}</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {loaiTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ngày ban hành — date range */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày ban hành</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 h-10 text-sm rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1B3A5C]/30 bg-white" />
                </div>
                <span className="text-gray-300 shrink-0 text-sm">—</span>
                <div className="relative flex-1 min-w-0">
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 h-10 text-sm rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1B3A5C]/30 bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Result count + clear */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Hiển thị <span className="font-semibold text-gray-700">{filtered.length}</span> / {documents.length} văn bản
            </p>
            {hasFilter && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#D4A843] transition-colors font-medium">
                <X className="w-3 h-3" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-20 flex flex-col items-center gap-3 text-gray-400">
            <FileText className="w-12 h-12 opacity-30" />
            <p className="font-medium">Không tìm thấy văn bản phù hợp</p>
            <p className="text-sm">Thử thay đổi từ khóa hoặc bộ lọc</p>
          </div>
        ) : (
          <>
            {/* ── Featured — văn bản mới nhất ── */}
            {featured && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Link href={`/van-ban/${featured.id}`} className="block">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="grid md:grid-cols-5 gap-0">

                      {/* Left panel — decorative */}
                      {(() => {
                        const cfg = loaiConfig[featured.loaiVanBan] ?? { panelFrom: "#1B3A5C", panelTo: "#2d5a8e", color: "#1B3A5C", badgeBg: "#e8eef6", badgeBorder: "#b8cce0", bar: "#1B3A5C" };
                        return (
                          <div className="md:col-span-2 relative flex flex-col items-center justify-center p-8 min-h-[180px]"
                            style={{ background: `linear-gradient(135deg, ${cfg.panelFrom} 0%, ${cfg.panelTo} 100%)` }}>
                            {/* Decorative rings */}
                            {[80, 130, 180].map((s, i) => (
                              <div key={i} className="absolute rounded-full border border-white/10"
                                style={{ width: s, height: s, right: -s / 4, top: "50%", transform: "translateY(-50%)" }} />
                            ))}
                            <div className="relative flex flex-col items-center gap-3 text-center">
                              <div className="w-16 h-16 rounded-xl bg-white/15 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-white" />
                              </div>
                              <span className="font-mono text-lg font-black text-white leading-tight">{featured.soHieu}</span>
                              <span className="text-xs px-3 py-1 rounded-full font-bold text-white bg-white/20 border border-white/30">
                                {featured.loaiVanBan}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Right panel — content */}
                      <div className="md:col-span-3 p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-[#D4A843] text-white border-0 font-bold text-xs px-2.5 gap-1">
                            <Flame className="w-3 h-3" /> MỚI NHẤT
                          </Badge>
                        </div>
                        <h2 className="text-base font-black text-[#1B3A5C] group-hover:text-[#D4A843] leading-snug transition-colors mb-4">
                          {featured.trichYeu}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500 mb-5">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" /> {featured.coQuanBanHanh}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> {featured.ngayBanHanh}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#1B3A5C] group-hover:text-[#D4A843] transition-colors">
                            Xem chi tiết <ChevronRight className="w-4 h-4" />
                          </span>
                          <button
                            onClick={(e) => e.preventDefault()}
                            className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B3A5C] transition-colors px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#1B3A5C]/30">
                            <Download className="w-3.5 h-3.5" /> Tải xuống
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* ── Văn bản khác ── */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#D4A843] rounded-full" />
                  <h2 className="font-bold text-[#1B3A5C]">Văn bản khác</h2>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {rest.map((doc, i) => {
                      const cfg = loaiConfig[doc.loaiVanBan] ?? { color: "#374151", badgeBg: "#f3f4f6", badgeBorder: "#e5e7eb", bar: "#9ca3af", panelFrom: "#1B3A5C", panelTo: "#2d5a8e" };
                      return (
                        <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }} transition={{ delay: i * 0.04 }}>
                          <Link href={`/van-ban/${doc.id}`} className="block">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#1B3A5C]/20 transition-all cursor-pointer group overflow-hidden">
                              <div className="flex items-stretch">
                                <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: cfg.bar }} />
                                <div className="flex-1 p-4 md:p-5 flex items-start gap-4 min-w-0">
                                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                                    style={{ background: cfg.badgeBg, borderColor: cfg.badgeBorder }}>
                                    <FileText className="w-5 h-5" style={{ color: cfg.color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{doc.soHieu}</span>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                        style={{ background: cfg.badgeBg, color: cfg.color, borderColor: cfg.badgeBorder }}>
                                        {doc.loaiVanBan}
                                      </span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#1B3A5C] transition-colors leading-snug line-clamp-2">
                                      {doc.trichYeu}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {doc.coQuanBanHanh}</span>
                                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {doc.ngayBanHanh}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
                                    <span className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#1B3A5C] hover:text-white flex items-center justify-center transition-colors text-gray-500">
                                      <Eye className="w-3.5 h-3.5" />
                                    </span>
                                    <button
                                      onClick={(e) => e.preventDefault()}
                                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#1B3A5C] hover:text-white flex items-center justify-center transition-colors text-gray-500">
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-gray-400">Trang 1 / 8 · Tổng {documents.length} văn bản</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, "...", 8].map((p, i) => (
                      <button key={i} className={`w-8 h-8 rounded-xl text-sm font-medium transition-colors ${
                        p === 1 ? "bg-[#1B3A5C] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}>{p}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
}
