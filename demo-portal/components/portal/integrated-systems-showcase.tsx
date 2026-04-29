"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  AlertOctagon,
  Banknote,
  BarChart3,
  Bot,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Factory,
  FileStack,
  Fingerprint,
  FlaskConical,
  Hammer,
  HardHat,
  LayoutDashboard,
  Network,
  RefreshCw,
  Scale,
  Shield,
  ShoppingCart,
  Warehouse,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

type ModuleItem = {
  code: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  href: string;
  external?: boolean;
};

type ModuleGroup = {
  number: string;
  label: string;
  description: string;
  accent: string;       // primary glow color
  accentSoft: string;   // soft border/text color
  bar: string;          // gradient for header bar
  modules: ModuleItem[];
};

const MODULE_GROUPS: ModuleGroup[] = [
  {
    number: "01",
    label: "Nền tảng & Trợ lý thông minh",
    description: "Hạ tầng dùng chung và công cụ AI hỗ trợ ra quyết định",
    accent: "#60a5fa",
    accentSoft: "rgba(96,165,250,0.18)",
    bar: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
    modules: [
      { code: "SSO",  icon: Fingerprint,    label: "SSO & Phân quyền",       desc: "Xác thực tập trung, quản lý định danh",        href: "/sso-management" },
      { code: "CMS",  icon: LayoutDashboard,label: "Quản trị nội dung",      desc: "Quản lý tin tức, văn bản trên Portal",         href: "/cms" },
      { code: "DMS",  icon: FileStack,      label: "Quản lý tài liệu",       desc: "Lưu trữ, kiểm soát phiên bản tài liệu KT",     href: "https://pkkq-dms-staging.dft.vn", external: true },
      { code: "BOT",  icon: Bot,            label: "Trợ lý AI Doanh nghiệp A",desc: "Tra cứu, tư vấn quy trình nghiệp vụ 24/7",    href: "https://pkkq-chatbot-staging.dft.vn", external: true },
      { code: "BI",   icon: BarChart3,      label: "Trung tâm điều hành số", desc: "Tổng hợp & trực quan hóa dữ liệu doanh nghiệp",href: "https://pkkq-dieuhanhbi-staging.dft.vn", external: true },
    ],
  },
  {
    number: "02",
    label: "Tài chính & Hợp đồng",
    description: "Dòng tiền, ngân sách và quản trị nhiệm vụ",
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,0.18)",
    bar: "linear-gradient(90deg, #5b21b6 0%, #8b5cf6 100%)",
    modules: [
      { code: "TCKT", icon: Banknote,       label: "Tài chính Kế toán",      desc: "Hạch toán, tính giá thành & quyết toán",       href: "https://pkkq-taichinhketoan-staging.dft.vn", external: true },
      { code: "MUA",  icon: ShoppingCart,   label: "Quản lý Mua hàng",       desc: "Đặt hàng, phê duyệt & theo dõi NCC",           href: "https://pkkq-muahang-staging.dft.vn", external: true },
      { code: "HĐNV", icon: ClipboardList,  label: "Hợp đồng & Nhiệm vụ",    desc: "Ký HĐ, phân rã WBS, theo dõi tiến độ",         href: "https://pkkq-hopdongnhiemvu-staging.dft.vn", external: true },
    ],
  },
  {
    number: "03",
    label: "Vận hành sản xuất & Sửa chữa",
    description: "Chuỗi cung ứng, sản xuất và phục hồi khí tài",
    accent: "#5eead4",
    accentSoft: "rgba(94,234,212,0.18)",
    bar: "linear-gradient(90deg, #115e59 0%, #14b8a6 100%)",
    modules: [
      { code: "KHO",  icon: Warehouse,      label: "Quản lý Kho tàng",       desc: "Tồn kho, vị trí & truy vết lô / sê-ri",        href: "https://pkkq-kho-staging.dft.vn", external: true },
      { code: "SX",   icon: Factory,        label: "Quản lý Sản xuất",       desc: "BOM, quy trình & điều phối lệnh chế tạo",      href: "https://pkkq-sanxuat-staging.dft.vn", external: true },
      { code: "BT",   icon: Wrench,         label: "Quản lý Bảo trì",        desc: "Lịch bảo trì định kỳ & giám sát thiết bị",     href: "https://pkkq-baotri-staging.dft.vn", external: true },
      { code: "SC",   icon: Hammer,         label: "Quản lý Sửa chữa",       desc: "Tiếp nhận, lập phương án & phục hồi",          href: "https://pkkq-suachua-staging.dft.vn", external: true },
      { code: "ĐT",   icon: RefreshCw,      label: "Quản lý Đại tu",         desc: "Tháo rã, phục hồi toàn diện hệ thống",         href: "https://pkkq-daitu-staging.dft.vn", external: true },
    ],
  },
  {
    number: "04",
    label: "Chất lượng & An toàn",
    description: "Bảo đảm chất lượng kỹ thuật và an toàn lao động",
    accent: "#fbbf24",
    accentSoft: "rgba(251,191,36,0.18)",
    bar: "linear-gradient(90deg, #92400e 0%, #f59e0b 100%)",
    modules: [
      { code: "VĐ",   icon: Network,        label: "Vòng đời & Cấu hình",    desc: "Cấu hình thiết kế chuẩn & lý lịch thực tế",    href: "https://pkkq-vongdoi-staging.dft.vn", external: true },
      { code: "CL",   icon: ClipboardCheck, label: "Chất lượng QA/QC",       desc: "Kiểm soát đầu vào, quá trình & đầu ra",        href: "https://pkkq-chatluong-staging.dft.vn", external: true },
      { code: "SCO",  icon: AlertOctagon,   label: "Sự cố & Chẩn đoán",      desc: "Phân tích nguyên nhân gốc & cảnh báo sớm",     href: "https://pkkq-suco-staging.dft.vn", external: true },
      { code: "TN",   icon: FlaskConical,   label: "Thử nghiệm & Nghiệm thu",desc: "Kịch bản đo kiểm & nghiệm thu nhiều cấp",      href: "https://pkkq-thunghiem-staging.dft.vn", external: true },
      { code: "ĐL",   icon: Scale,          label: "Đo lường & Kiểm định",   desc: "Thiết bị đo, chứng thư & cảnh báo hết hạn",    href: "https://pkkq-doluong-staging.dft.vn", external: true },
      { code: "AT",   icon: HardHat,        label: "An toàn Kỹ thuật",       desc: "Nhận diện rủi ro & tuân thủ ATLĐ",             href: "https://pkkq-antoan-staging.dft.vn", external: true },
    ],
  },
];

const TOTAL_MODULES = MODULE_GROUPS.reduce((s, g) => s + g.modules.length, 0);

// ─── KPI counter with count-up animation ──────────────────────────────────
function KpiCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {String(val).padStart(2, "0")}
      {suffix}
    </span>
  );
}

// ─── Module row (compact, horizontal layout for vertical column panels) ───
function ModuleRow({
  m,
  group,
  index,
}: {
  m: ModuleItem;
  group: ModuleGroup;
  index: number;
}) {
  const Icon = m.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      className="group relative"
    >
      <Link
        href={m.href}
        target={m.external ? "_blank" : undefined}
        rel={m.external ? "noopener noreferrer" : undefined}
        className="block"
      >
        <div
          className="relative flex items-center gap-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/[0.09]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
        >
          {/* Hover glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `linear-gradient(90deg, ${group.accentSoft} 0%, transparent 80%)`,
            }}
          />
          {/* Left accent bar (animated on hover) */}
          <div
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full transition-all duration-300 opacity-60 group-hover:opacity-100"
            style={{ background: group.accent }}
          />

          {/* Icon */}
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${group.accent}33 0%, ${group.accent}14 100%)`,
              border: `1px solid ${group.accentSoft}`,
            }}
          >
            <Icon className="h-4 w-4" style={{ color: group.accent }} strokeWidth={2} />
          </div>

          {/* Title + status + code */}
          <div className="relative min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-bold leading-tight text-white">{m.label}</p>
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
            </div>
            <p
              className="mt-0.5 truncate text-[10px] font-bold tracking-wider tabular-nums"
              style={{ color: group.accent, letterSpacing: "0.06em" }}
            >
              Z119·{m.code}
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight
            className="relative h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
            style={{ color: group.accent }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export function IntegratedSystemsShowcase() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1b2f] to-[#060f1c]" />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 30% 0%, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 30% 0%, black 30%, transparent 85%)",
        }}
      />
      {/* Gold radial glow */}
      <div
        className="absolute -right-60 -top-40 h-[560px] w-[560px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,67,0.4) 0%, transparent 70%)",
        }}
      />
      {/* Navy radial glow bottom-left */}
      <div
        className="absolute -bottom-60 -left-40 h-[520px] w-[520px] rounded-full opacity-35"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-5">
        {/* ═════ Header ═════ */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: title */}
          <div className="max-w-2xl">
            <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Hệ sinh thái đang hoạt động
              </span>
            </div>
            <h2 className="text-[22px] font-black leading-tight text-white md:text-[26px]">
              Cổng điều hành{" "}
              <span className="bg-gradient-to-r from-[#D4A843] via-[#f0d890] to-[#D4A843] bg-clip-text text-transparent">
                tích hợp Z119
              </span>
            </h2>
            <p className="mt-1 max-w-xl text-[13px] leading-snug text-white/85">
              Hệ sinh thái <span className="font-bold text-white">19 phân hệ</span> chia thành{" "}
              <span className="font-bold text-white">04 nhóm</span>, kết nối qua một lần đăng nhập
              SSO — phục vụ toàn bộ vòng đời sửa chữa, đại tu khí tài Nhà máy Z119.
            </p>
          </div>

          {/* Right: KPI cluster */}
          <div className="grid grid-cols-4 gap-2 lg:gap-2.5">
            {[
              { value: TOTAL_MODULES, label: "Phần mềm", icon: LayoutDashboard, color: "#60a5fa" },
              { value: MODULE_GROUPS.length, label: "Nhóm", icon: Network, color: "#a78bfa" },
              { value: 1, label: "SSO", icon: Shield, color: "#5eead4" },
              { value: 24, label: "Sẵn sàng", icon: Activity, color: "#fbbf24", suffix: "/7" },
            ].map((k) => {
              const Icon = k.icon;
              return (
                <div
                  key={k.label}
                  className="relative overflow-hidden rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 backdrop-blur-sm"
                >
                  <Icon
                    className="absolute right-1 top-1 h-6 w-6 opacity-15"
                    style={{ color: k.color }}
                  />
                  <p
                    className="relative text-[22px] font-black leading-none md:text-[26px] tabular-nums"
                    style={{ color: k.color }}
                  >
                    <KpiCounter target={k.value} suffix={k.suffix} />
                  </p>
                  <p className="relative mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/85">
                    {k.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative divider */}
        <div className="mt-3 mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <Zap className="h-3 w-3 text-[#D4A843]" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* ═════ Groups — vertical column panels (app-dock style) ═════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          {MODULE_GROUPS.map((group) => (
            <div
              key={group.number}
              className="relative flex flex-col rounded-xl border border-white/10 bg-white/[0.025] overflow-hidden"
              style={{
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px ${group.accentSoft}`,
              }}
            >
              {/* Panel header */}
              <div
                className="relative px-3 py-2.5 border-b border-white/10"
                style={{ background: group.bar }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-black tracking-wider text-white/85 tabular-nums">
                      {group.number}
                    </span>
                    <p className="truncate text-[12px] font-black uppercase tracking-wider text-white">
                      {group.label}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-black/25 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white tabular-nums">
                    {String(group.modules.length).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-white/75">{group.description}</p>
              </div>

              {/* Modules — vertical stack */}
              <div className="flex flex-col gap-1.5 p-2">
                {group.modules.map((m, i) => (
                  <ModuleRow key={m.code} m={m} group={group} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
