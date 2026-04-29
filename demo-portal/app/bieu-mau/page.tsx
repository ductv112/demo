"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Search, Download, Clock,
  FileText, Users, Layers,
  Lightbulb, Wrench, Package, X,
} from "lucide-react";
import Link from "next/link";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { forms } from "@/lib/data";

/* ── Category config ── */
const catConfig: Record<string, { color: string; bg: string; border: string; bar: string; icon: React.ElementType }> = {
  "Sáng kiến":  { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", bar: "bg-purple-500", icon: Lightbulb },
  "Tài liệu":   { color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   bar: "bg-blue-500",   icon: FileText },
  "Nhân sự":    { color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200",  bar: "bg-green-500",  icon: Users },
  "Hậu cần":    { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-500", icon: Package },
  "Kỹ thuật":   { color: "text-cyan-700",   bg: "bg-cyan-50",   border: "border-cyan-200",   bar: "bg-cyan-500",   icon: Wrench },
  "Quy trình":  { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    bar: "bg-red-500",    icon: Layers },
  "Dự án":      { color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", bar: "bg-indigo-500", icon: ClipboardList },
  "Hành chính": { color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-200",   bar: "bg-teal-500",   icon: FileText },
};

const categories = Array.from(new Set(forms.map((f) => f.category)));

export default function BieuMauPage() {
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  const hasFilter = search !== "" || catFilter !== "all";
  const clearFilters = () => { setSearch(""); setCatFilter("all"); };

  const filtered = forms.filter((f) => {
    const q = search.toLowerCase();
    if (!(f.title.toLowerCase().includes(q) || f.code.toLowerCase().includes(q))) return false;
    if (catFilter !== "all" && f.category !== catFilter) return false;
    return true;
  });

  const handleDownload = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDownloading(id);
    await new Promise((r) => setTimeout(r, 1200));
    setDownloading(null);
  };

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Biểu mẫu & Quy trình" }]} />

      <div className="space-y-6">
        {/* ── Hero ── */}
        <div className="relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1f3d 0%, #1B3A5C 60%, #2d5a8e 100%)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #D4A843 0%, transparent 50%), radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 40%)" }} />
          <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-[#D4A843]" />
                <span className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase">Kho biểu mẫu điện tử</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Biểu mẫu & Quy trình</h1>
              <p className="text-blue-200 text-sm">Tải xuống và sử dụng biểu mẫu chuẩn toàn Nhà máy</p>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { label: "Tổng biểu mẫu", value: forms.length.toString() },
                { label: "Danh mục",      value: categories.length.toString() },
                { label: "Đang dùng",     value: forms.filter((f) => f.status === "active").length.toString() },
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

            {/* Tìm kiếm */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Tên biểu mẫu, mã hiệu..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-gray-200 h-10 text-sm" />
              </div>
            </div>

            {/* Danh mục */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Danh mục</label>
              <Select value={catFilter} onValueChange={(v) => setCatFilter(v ?? "all")}>
                <SelectTrigger className="rounded-xl border-gray-200 h-10 text-sm w-full">
                  <SelectValue>
                    {catFilter === "all"
                      ? <span className="text-gray-400">Tất cả danh mục</span>
                      : <span className="font-medium text-gray-700">{catFilter}</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result count + clear */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-700">{filtered.length}</span> / {forms.length} biểu mẫu
            </p>
            {hasFilter && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#D4A843] font-medium hover:opacity-75 transition-opacity">
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* ── Forms grid ── */}
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((form, i) => {
              const cfg = catConfig[form.category] ?? { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", bar: "bg-gray-300", icon: ClipboardList };
              const Icon = cfg.icon;
              return (
                <motion.div key={form.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/bieu-mau/${form.id}`}>
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#1B3A5C]/20 transition-all overflow-hidden group cursor-pointer">
                      {/* Color top bar */}
                      <div className={`h-1 w-full ${cfg.bar}`} />
                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          {/* Icon box */}
                          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border}`}>
                            <Icon className={`w-5 h-5 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg font-bold">{form.code}</span>
                              <Badge className={`border text-[10px] h-4 px-1.5 ${cfg.bg} ${cfg.color} ${cfg.border}`}>{form.category}</Badge>
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#1B3A5C] transition-colors leading-snug">
                              {form.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{form.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {form.lastUpdated}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {form.usageCount} lần dùng</span>
                          <span className="font-mono ml-auto">v{form.version}</span>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1 rounded-xl pointer-events-none">
                            Xem chi tiết
                          </Button>
                          <Button size="sm" className="h-8 text-xs gap-1 px-4 rounded-xl bg-[#1B3A5C] hover:bg-[#2d5a8e] text-white"
                            disabled={downloading === form.id}
                            onClick={(e) => handleDownload(e, form.id)}>
                            {downloading === form.id ? (
                              <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />Đang tải...</>
                            ) : (
                              <><Download className="w-3 h-3" /> Tải mẫu</>
                            )}
                          </Button>
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
          <div className="bg-white border border-gray-200 rounded-xl py-20 flex flex-col items-center gap-3 text-gray-400">
            <ClipboardList className="w-12 h-12 opacity-30" />
            <p className="font-medium">Không tìm thấy biểu mẫu</p>
            <p className="text-sm">Thử thay đổi từ khóa hoặc chọn danh mục khác</p>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
