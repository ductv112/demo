"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Download, Clock,
  Lock, BookMarked, FileText, FileSpreadsheet, Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { technicalDocs } from "@/lib/data";

/* ── Category config ── */
const catConfig: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Tiêu chuẩn quốc gia": { color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200", icon: BookMarked },
  "Quy chuẩn kỹ thuật":  { color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",  icon: BookOpen },
  "Tài liệu nội bộ":     { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200",icon: Lock },
  "Tiêu chuẩn quốc tế":  { color: "text-cyan-700",   bg: "bg-cyan-50",   border: "border-cyan-200",  icon: Star },
  "Tiêu chuẩn quân sự":  { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",   icon: Shield },
};

function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function FileIcon({ type }: { type: string }) {
  const base = "w-10 h-10 rounded-xl flex items-center justify-center shrink-0";
  if (type === "xlsx") return <div className={`${base} bg-emerald-50 border border-emerald-200`}><FileSpreadsheet className="w-5 h-5 text-emerald-600" /></div>;
  if (type === "docx") return <div className={`${base} bg-blue-50 border border-blue-200`}><FileText className="w-5 h-5 text-blue-600" /></div>;
  return <div className={`${base} bg-red-50 border border-red-200`}><FileText className="w-5 h-5 text-red-600" /></div>;
}

const categories = Array.from(new Set(technicalDocs.map((d) => d.category)));

const fileTypes = ["pdf", "docx", "xlsx"] as const;

export default function ThuVienPage() {
  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState("all");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  const hasFilter = search !== "" || catFilter !== "all" || typeFilter !== "all";

  const clearFilters = () => {
    setSearch(""); setCatFilter("all"); setTypeFilter("all");
  };

  const filtered = technicalDocs.filter((d) => {
    const q = search.toLowerCase();
    if (!(d.title.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q)))) return false;
    if (catFilter !== "all" && d.category !== catFilter) return false;
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    return true;
  });

  const handleDownload = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDownloading(id);
    await new Promise((r) => setTimeout(r, 1400));
    setDownloading(null);
  };

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Thư viện Kỹ thuật" }]} />

      <div className="space-y-6">
        {/* ── Hero ── */}
        <div className="relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1f3d 0%, #1B3A5C 60%, #2d5a8e 100%)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #D4A843 0%, transparent 50%), radial-gradient(circle at 10% 80%, #16a34a 0%, transparent 40%)" }} />
          <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-[#D4A843]" />
                <span className="text-[#D4A843] text-xs font-semibold tracking-widest uppercase">Kho tri thức kỹ thuật</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Thư viện Kỹ thuật</h1>
              <p className="text-blue-200 text-sm">Tiêu chuẩn · Quy chuẩn · Tài liệu nội bộ · Hướng dẫn nghiệp vụ</p>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { label: "Tổng tài liệu", value: technicalDocs.length.toString() },
                { label: "Nội bộ",        value: technicalDocs.filter((d) => d.restricted).length.toString() },
                { label: "Danh mục",      value: categories.length.toString() },
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Tìm kiếm */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Tên tài liệu, tiêu chuẩn, từ khóa..."
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

            {/* Loại file */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại file</label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
                <SelectTrigger className="rounded-xl border-gray-200 h-10 text-sm w-full">
                  <SelectValue>
                    {typeFilter === "all"
                      ? <span className="text-gray-400">Tất cả loại file</span>
                      : <span className="font-medium uppercase text-gray-700">{typeFilter}</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Tất cả loại file</SelectItem>
                  {fileTypes.map((t) => (
                    <SelectItem key={t} value={t}><span className="uppercase font-mono">{t}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result count + clear */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-700">{filtered.length}</span> / {technicalDocs.length} tài liệu
            </p>
            {hasFilter && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#D4A843] font-medium hover:opacity-75 transition-opacity">
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* ── Document grid ── */}
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((doc, i) => {
              const cfg = catConfig[doc.category] ?? { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: BookOpen };
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/thu-vien/${doc.id}`}>
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#1B3A5C]/20 transition-all overflow-hidden group cursor-pointer">
                      {/* Top accent bar */}
                      <div className={`h-1 w-full ${cfg.bg.replace("bg-", "bg-").replace("-50", "-400")}`}
                        style={{ background: doc.restricted ? "#7c3aed" : undefined }} />

                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <FileIcon type={doc.type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <Badge className={`border text-[10px] h-4 px-1.5 ${cfg.bg} ${cfg.color} ${cfg.border}`}>{doc.category}</Badge>
                              {doc.restricted && (
                                <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px] h-4 gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Nội bộ
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#1B3A5C] transition-colors leading-snug line-clamp-2">
                              {doc.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{doc.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {doc.lastUpdated}
                          </span>
                          <span className="text-xs text-gray-400">{doc.size}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Download className="w-3 h-3" /> {doc.downloads} lượt
                          </span>
                          <span className="text-xs text-gray-400 font-mono ml-auto">v{doc.version}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {doc.tags.map((tag) => (
                            <span key={tag} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1 rounded-xl pointer-events-none">
                            Xem chi tiết
                          </Button>
                          <Button size="sm" className="flex-1 h-8 text-xs gap-1 rounded-xl bg-[#1B3A5C] hover:bg-[#2d5a8e] text-white"
                            disabled={downloading === doc.id}
                            onClick={(e) => handleDownload(e, doc.id)}>
                            {downloading === doc.id ? (
                              <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />Đang tải...</>
                            ) : (
                              <><Download className="w-3 h-3" /> Tải xuống</>
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
            <BookOpen className="w-12 h-12 opacity-30" />
            <p className="font-medium">Không tìm thấy tài liệu</p>
            <p className="text-sm">Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
