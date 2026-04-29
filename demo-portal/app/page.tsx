"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Bell,
  FileText,
  Newspaper,
  Eye,
  Clock,
  AlertTriangle,
  Anchor,
  Star,
  Users,
  ClipboardList,
  Download,
  Wrench,
  Factory,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PortalNav } from "@/components/portal/portal-nav";
import { IntegratedSystemsShowcase } from "@/components/portal/integrated-systems-showcase";
import {
  heroBanners,
  latestNews,
  featuredNews,
  recentAnnouncements,
  recentDocuments,
  quickLinks,
  statsData,
} from "@/lib/portal-data";
import { forms } from "@/lib/data";

function NewsImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={(e) => {
        const t = e.currentTarget;
        t.style.display = "none";
        const parent = t.parentElement;
        if (parent) {
          parent.style.background = "linear-gradient(135deg,#1B3A5C,#2d5a8e)";
        }
      }}
    />
  );
}

const iconMap: Record<string, React.ElementType> = {
  Newspaper, FileText, Bell, ClipboardList,
};

export default function HomePage() {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [navFixed, setNavFixed] = useState(false);
  const navSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % heroBanners.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Nav handoff: when the secondary nav reaches just below the slim header,
  // pin it via position:fixed and signal the header (via DOM attribute) to
  // slide up out of view. CSS rule in globals.css handles the transform.
  useEffect(() => {
    const HEADER_H = 56; // slim header height
    let ticking = false;
    const update = () => {
      ticking = false;
      const sentinel = navSentinelRef.current;
      if (!sentinel) return;
      const rect = sentinel.getBoundingClientRect();
      const shouldDock = rect.top <= HEADER_H;
      setNavFixed(shouldDock);
      document.documentElement.dataset.navDocked = shouldDock ? "true" : "false";
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update(); // initial
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      delete document.documentElement.dataset.navDocked;
    };
  }, []);

  const banner = heroBanners[bannerIdx];

  return (
    <PortalLayout slim>
      {/* ═════ 1. Integrated systems showcase (full-bleed hero) ═════ */}
      <IntegratedSystemsShowcase />

      {/* ═════ 2. Secondary nav (full-bleed, docks via position:fixed on scroll) ═════ */}
      {/* Sentinel — observed to trigger header→nav handoff */}
      <div ref={navSentinelRef} className="h-px -mb-px" aria-hidden />
      {/* Placeholder fills nav's spot in flow when nav becomes fixed */}
      {navFixed && <div className="h-14" aria-hidden />}
      <div className={navFixed ? "fixed top-0 left-0 right-0 z-40" : ""}>
        <PortalNav variant="secondary" />
      </div>

      {/* ═════ 3. Breaking ticker (full-bleed gold strip, transitions into content) ═════ */}
      <div className="bg-gradient-to-r from-[#D4A843] via-[#e8c46a] to-[#D4A843] text-[#1B3A5C] text-[13px] flex items-center overflow-hidden h-9 shadow-[0_2px_10px_rgba(212,168,67,0.3)]">
        <span className="shrink-0 px-4 h-full flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs border-r border-[#1B3A5C]/25">
          <Bell className="w-3.5 h-3.5" /> Thông báo
        </span>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="ticker-content whitespace-nowrap px-4 font-medium">
            {recentAnnouncements.map((a) => (
              <span key={a.id} className="mr-12">
                {a.urgent && (
                  <span className="inline-flex items-center mr-1">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8a0012] opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8a0012]" />
                    </span>
                  </span>
                )}
                {a.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═════ 4. Content area — light theme with subtle radar background ═════ */}
      <div className="relative overflow-hidden bg-[#f0f2f5]">
        {/* Layer 1 — Radar top-right (navy subtle) */}
        <div className="pointer-events-none absolute -right-32 -top-24 opacity-[0.06]">
          <svg width="900" height="900" viewBox="0 0 900 900" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((r, i) => (
              <circle key={r} cx="450" cy="450" r={r} stroke="#1B3A5C" strokeWidth={i % 2 === 0 ? 1 : 0.6} fill="none" />
            ))}
            <line x1="0"   y1="450" x2="900" y2="450" stroke="#1B3A5C" strokeWidth="0.5" />
            <line x1="450" y1="0"   x2="450" y2="900" stroke="#1B3A5C" strokeWidth="0.5" />
            <line x1="0"   y1="0"   x2="900" y2="900" stroke="#1B3A5C" strokeWidth="0.3" strokeDasharray="4 4" />
            <line x1="900" y1="0"   x2="0"   y2="900" stroke="#1B3A5C" strokeWidth="0.3" strokeDasharray="4 4" />
            <circle cx="450" cy="450" r="6" fill="#1B3A5C" opacity="0.6" />
            <circle cx="450" cy="450" r="14" stroke="#1B3A5C" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        {/* Layer 2 — Radar bottom-left (gold subtle) */}
        <div className="pointer-events-none absolute -left-40 -bottom-32 opacity-[0.05]">
          <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[100, 180, 260, 340, 420, 500, 580, 660].map((r, i) => (
              <circle key={r} cx="400" cy="400" r={r} stroke="#D4A843" strokeWidth={i % 2 === 0 ? 1 : 0.5} fill="none" />
            ))}
            <line x1="0"   y1="400" x2="800" y2="400" stroke="#D4A843" strokeWidth="0.4" />
            <line x1="400" y1="0"   x2="400" y2="800" stroke="#D4A843" strokeWidth="0.4" />
            <circle cx="400" cy="400" r="5" fill="#D4A843" opacity="0.5" />
          </svg>
        </div>

        {/* Layer 3 — Mid radar center (smaller, navy) */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/3 opacity-[0.04]">
          <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[60, 120, 180, 240, 300].map((r, i) => (
              <circle key={r} cx="300" cy="300" r={r} stroke="#1B3A5C" strokeWidth={i % 2 === 0 ? 1 : 0.5} fill="none" />
            ))}
            <line x1="0"   y1="300" x2="600" y2="300" stroke="#1B3A5C" strokeWidth="0.4" />
            <line x1="300" y1="0"   x2="300" y2="600" stroke="#1B3A5C" strokeWidth="0.4" />
          </svg>
        </div>

        {/* Layer 4 — Fine dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(27,58,92,0.1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 95%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 95%)",
          }}
        />

        {/* Constrained content */}
        <div className="relative max-w-[1200px] mx-auto px-4 pt-6 pb-8 space-y-6">

        {/* ── Main grid: Hero banner + Quick links ──────────────── */}
        <div className="grid lg:grid-cols-4 gap-5">

          {/* Hero banner — 3 cols */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="relative overflow-hidden rounded-lg bg-black flex-1 min-h-[340px] shadow-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <NewsImage src={banner.image} alt={banner.title} className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block bg-[#D4A843] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded mb-2">
                      {banner.category}
                    </span>
                    <h2 className="text-white text-xl font-bold leading-snug mb-1">
                      {banner.title}
                    </h2>
                    <p className="text-white/80 text-sm line-clamp-2">{banner.subtitle}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-white/60 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {banner.date}
                      </span>
                      <Link href="/tin-tuc/su-kien" className="text-white text-xs border border-white/40 px-3 py-1 rounded hover:bg-white/10 transition-colors">
                        Đọc thêm →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute top-3 right-3 flex gap-1.5">
                {heroBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === bannerIdx ? "bg-white w-5" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setBannerIdx((bannerIdx - 1 + heroBanners.length) % heroBanners.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setBannerIdx((bannerIdx + 1) % heroBanners.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-1.5">
              {heroBanners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setBannerIdx(i)}
                  className={`relative overflow-hidden rounded h-16 border-2 transition-all ${
                    i === bannerIdx ? "border-[#D4A843]" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <NewsImage src={b.image} alt={b.title} className="w-full h-full" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                    <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">{b.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick access panel — 1 col */}
          <div className="space-y-3">
            <div className="bg-[#1B3A5C] rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4A843] flex items-center justify-center">
                  <Anchor className="w-4 h-4 text-[#D4A843]" />
                </div>
                <span className="text-sm font-bold">Doanh nghiệp A</span>
                <span className="text-xs text-white/50 ml-auto">Từ 1965</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {statsData.map((s) => (
                  <div key={s.label} className="bg-white/10 rounded p-2 text-center">
                    <p className="text-xl font-black text-[#f0d890]">
                      {s.value}<span className="text-sm">{s.suffix}</span>
                    </p>
                    <p className="text-[10px] text-white/60 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-[#2d5a8e] px-3 py-2">
                <h3 className="text-white text-xs font-bold uppercase tracking-wide">Truy cập nhanh</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {quickLinks.map((link) => {
                  const Icon = iconMap[link.icon] || FileText;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f0f4fa] transition-colors cursor-pointer group">
                        <div className="w-7 h-7 rounded bg-[#e8eef6] flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-[#1B3A5C]" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-[#D4A843] flex-1 font-medium">
                          {link.label}
                        </span>
                        {link.count && (
                          <span className="text-xs bg-[#D4A843]/10 text-[#D4A843] px-1.5 py-0.5 rounded font-bold">
                            {link.count}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── News + Announcements + Documents ──────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          <div className="flex flex-col">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="flex items-center justify-between bg-[#1B3A5C] px-4 py-2.5">
                <h2 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#D4A843] rounded" />
                  Tin tức — Sự kiện
                </h2>
                <Link href="/tin-tuc">
                  <span className="text-white/70 text-xs hover:text-white cursor-pointer">Xem tất cả →</span>
                </Link>
              </div>

              <Link href="/tin-tuc/FN001">
              <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex gap-4">
                  <div className="relative w-48 h-32 rounded overflow-hidden shrink-0">
                    <NewsImage src={featuredNews.image} alt={featuredNews.title} className="w-full h-full" />
                    <span className="absolute top-1.5 left-1.5 bg-[#D4A843] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {featuredNews.category}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1B3A5C] text-sm leading-snug group-hover:text-[#D4A843] cursor-pointer line-clamp-3 mb-2">
                      {featuredNews.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {featuredNews.excerpt}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {featuredNews.date}
                    </p>
                  </div>
                </div>
              </div>
              </Link>

              <div className="divide-y divide-gray-100 flex-1">
                {latestNews.slice(0, 5).map((news) => (
                  <Link key={news.id} href={`/tin-tuc/${news.id}`}>
                  <div className="flex gap-3 p-3 hover:bg-gray-50 cursor-pointer group transition-colors">
                    <div className="relative w-20 h-14 rounded overflow-hidden shrink-0">
                      <NewsImage src={news.image} alt={news.title} className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] bg-[#e8eef6] text-[#1B3A5C] px-1.5 py-0.5 rounded font-semibold uppercase">
                          {news.category}
                        </span>
                        {news.isHot && (
                          <span className="text-[9px] bg-[#D4A843] text-white px-1.5 py-0.5 rounded font-semibold uppercase">
                            Nổi bật
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[#D4A843] line-clamp-2 leading-snug">
                        {news.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {news.date}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {news.views}</span>
                      </div>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between bg-[#D4A843] px-4 py-2.5">
                <h2 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5" /> Thông báo
                </h2>
                <Link href="/thong-bao">
                  <span className="text-white/80 text-xs hover:text-white cursor-pointer">Tất cả →</span>
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {recentAnnouncements.map((a) => (
                  <Link key={a.id} href="/thong-bao">
                    <div className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer group transition-colors">
                      <div className="flex items-start gap-2">
                        {a.urgent ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#D4A843] shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#2d5a8e] shrink-0 mt-1.5" />
                        )}
                        <div>
                          <p className="text-sm text-gray-700 group-hover:text-[#D4A843] line-clamp-2 leading-snug font-medium">
                            {a.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{a.date}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between bg-[#1B3A5C] px-4 py-2.5">
                <h2 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#D4A843] rounded" />
                  Văn bản mới ban hành
                </h2>
                <Link href="/van-ban">
                  <span className="text-white/70 text-xs hover:text-white cursor-pointer">Xem tất cả →</span>
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {recentDocuments.map((doc) => (
                  <Link key={doc.id} href="/van-ban">
                    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer group transition-colors">
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full mt-2 bg-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-gray-500 shrink-0">{doc.soHieu}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            doc.loai === "Mệnh lệnh" ? "bg-red-100 text-red-700" :
                            doc.loai === "Quyết định" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {doc.loai}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 group-hover:text-[#D4A843] line-clamp-1 font-medium">
                          {doc.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 mt-0.5">{doc.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Biểu mẫu & Quy trình ───────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between bg-[#1B3A5C] px-4 py-2.5">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
              <div className="w-1 h-4 bg-[#D4A843] rounded" />
              Biểu mẫu & Quy trình
            </h2>
            <Link href="/bieu-mau">
              <span className="text-white/70 text-xs hover:text-white cursor-pointer">Xem tất cả →</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-gray-100">
            {forms.slice(0, 4).map((form) => (
              <Link key={form.id} href={`/bieu-mau/${form.id}`}>
                <div className="p-4 hover:bg-[#f0f4fa] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#e8eef6] flex items-center justify-center shrink-0">
                      <ClipboardList className="w-4 h-4 text-[#1B3A5C]" />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{form.code}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#D4A843] line-clamp-2 leading-snug mb-1.5">
                    {form.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{form.category}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-[#1B3A5C] font-medium group-hover:text-[#D4A843]">
                      <Download className="w-3 h-3" /> Tải mẫu
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        </div>
      </div>

      {/* ═════ 5. Stats bar (full-bleed dark band — Doanh nghiệp A historical pillars) ═════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0a1628] via-[#1B3A5C] to-[#0a1628]">
        {/* Subtle radar bg in stats too */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(212,168,67,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 opacity-[0.08]">
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
            {[60, 120, 180, 240, 300].map((r, i) => (
              <circle key={r} cx="250" cy="250" r={r} stroke="#D4A843" strokeWidth={i % 2 === 0 ? 1 : 0.5} fill="none" />
            ))}
          </svg>
        </div>
        <div className="relative max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Star,   label: "Năm thành lập",        value: "1965",   sub: "Hơn 60 năm xây dựng và phát triển" },
            { icon: Users,  label: "Cán bộ nhân viên",     value: "400+",   sub: "Quản lý, kỹ sư và chuyên viên" },
            { icon: Wrench, label: "Dự án triển khai",     value: "1.000+", sub: "Hệ thống monitoring, module, phần mềm" },
            { icon: Factory,label: "Trung tâm nòng cốt",   value: "4",      sub: "Alpha, Beta, Gamma, Delta" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-[#D4A843]/40 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-[#D4A843]" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs font-semibold text-white/90">{s.label}</p>
                <p className="text-[10px] text-white/50">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PortalLayout>
  );
}
