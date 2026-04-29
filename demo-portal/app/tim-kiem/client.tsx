"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, FileText, Bell, Newspaper, Clock, ChevronRight } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import {
  latestNews, featuredNews, recentAnnouncements,
  recentDocuments,
} from "@/lib/portal-data";

/* ─── helpers ─────────────────────────────────────────── */
function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function match(text: string, q: string) {
  return normalize(text).includes(normalize(q));
}

/* ─── result types ────────────────────────────────────── */
type ResultItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
  group: string;
};

/* ─── group config ────────────────────────────────────── */
const groupConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  "Tin tức": {
    label: "Tin tức — Sự kiện",
    icon: Newspaper,
    color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe",
  },
  "Thông báo": {
    label: "Thông báo",
    icon: Bell,
    color: "#D4A843", bg: "#fff1f2", border: "#fecdd3",
  },
  "Văn bản": {
    label: "Văn bản — Chỉ đạo",
    icon: FileText,
    color: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff",
  },
};

export default function SearchClient() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();

  const results = useMemo<ResultItem[]>(() => {
    if (!q) return [];
    const out: ResultItem[] = [];

    // Tin tức
    [featuredNews, ...latestNews].forEach((n) => {
      if (match(n.title, q) || match(n.excerpt ?? "", q)) {
        out.push({ id: n.id, title: n.title, meta: n.date + " · " + n.category, href: "/tin-tuc", group: "Tin tức" });
      }
    });

    // Thông báo
    recentAnnouncements.forEach((a) => {
      if (match(a.title, q)) {
        out.push({ id: a.id, title: a.title, meta: a.date, href: "/thong-bao", group: "Thông báo" });
      }
    });

    // Văn bản
    recentDocuments.forEach((d) => {
      if (match(d.title, q) || match(d.soHieu, q)) {
        out.push({ id: d.id, title: d.title, meta: d.soHieu + " · " + d.loai + " · " + d.date, href: "/van-ban", group: "Văn bản" });
      }
    });

    return out;
  }, [q]);

  // Group results
  const grouped = useMemo(() => {
    const map: Record<string, ResultItem[]> = {};
    results.forEach((r) => {
      if (!map[r.group]) map[r.group] = [];
      map[r.group].push(r);
    });
    return map;
  }, [results]);

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-[#1B3A5C]">Kết quả tìm kiếm</h1>
          {q ? (
            <p className="text-sm text-gray-500 mt-1">
              Tìm thấy <span className="font-bold text-[#1B3A5C]">{results.length}</span> kết quả cho từ khóa:{" "}
              <span className="font-bold text-[#D4A843]">"{q}"</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Nhập từ khóa để tìm kiếm.</p>
          )}
        </div>

        {/* No results */}
        {q && results.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">Không tìm thấy kết quả nào</p>
            <p className="text-sm text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác.</p>
          </div>
        )}

        {/* Grouped results */}
        {Object.entries(grouped).map(([group, items]) => {
          const cfg = groupConfig[group];
          const Icon = cfg.icon;
          return (
            <div key={group} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Group header */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-100"
                style={{ background: cfg.bg }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: cfg.color }}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border"
                  style={{ background: "#fff", color: cfg.color, borderColor: cfg.border }}>
                  {items.length} kết quả
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#D4A843] transition-colors line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {item.meta}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PortalLayout>
  );
}
