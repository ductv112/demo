"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Home,
  Fingerprint,
  Banknote,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  Warehouse,
  Factory,
  Wrench,
  Hammer,
  RefreshCw,
  Network,
  ClipboardCheck,
  AlertOctagon,
  FlaskConical,
  Scale,
  HardHat,
  ArrowRight,
  AppWindow,
  Bot,
  Files,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface App {
  key: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  url: string;
  external?: boolean;
}

const APPS: App[] = [
  { key: "portal",         name: "Cổng TT Nội bộ",      icon: Home,           color: "#1B3A5C", bg: "#e8eef6", url: "/",                                                  external: false },
  { key: "sso",            name: "SSO & Phân quyền",     icon: Fingerprint,    color: "#1B3A5C", bg: "#e8eef6", url: "/sso-management",                                    external: false },
  { key: "cms",            name: "Quản trị CMS",         icon: LayoutDashboard,color: "#1B3A5C", bg: "#e8eef6", url: "/cms",                                               external: false },
  { key: "dieuhanhbi",     name: "TT Điều hành số",      icon: BarChart3,      color: "#1B3A5C", bg: "#e8eef6", url: "http://localhost:5174",            external: true  },
  { key: "taichinhketoan", name: "Tài chính KT",         icon: Banknote,       color: "#4c1d95", bg: "#f5f3ff", url: "http://localhost:5175",        external: true  },
  { key: "hopdongnhiemvu", name: "Hợp đồng & NV",        icon: ClipboardList,  color: "#4c1d95", bg: "#f5f3ff", url: "http://localhost:5176",       external: true  },
  { key: "muahang",        name: "Mua hàng",              icon: ShoppingCart,   color: "#0369a1", bg: "#e0f2fe", url: "http://localhost:5177",               external: true  },
  { key: "kho",            name: "Kho tàng",              icon: Warehouse,      color: "#0369a1", bg: "#e0f2fe", url: "http://localhost:5178",                   external: true  },
  { key: "sanxuat",        name: "Sản xuất",              icon: Factory,        color: "#065f46", bg: "#d1fae5", url: "http://localhost:5179",               external: true  },
  { key: "baotri",         name: "Bảo trì",               icon: Wrench,         color: "#065f46", bg: "#d1fae5", url: "http://localhost:5180",                external: true  },
  { key: "suachua",        name: "Sửa chữa",              icon: Hammer,         color: "#065f46", bg: "#d1fae5", url: "http://localhost:5181",               external: true  },
  { key: "daitu",          name: "Đại tu",                icon: RefreshCw,      color: "#065f46", bg: "#d1fae5", url: "http://localhost:5182",                 external: true  },
  { key: "vongdoi",        name: "Vòng đời & CH",         icon: Network,        color: "#92400e", bg: "#fef3c7", url: "http://localhost:5183",               external: true  },
  { key: "chatluong",      name: "Chất lượng",            icon: ClipboardCheck, color: "#92400e", bg: "#fef3c7", url: "http://localhost:5184",             external: true  },
  { key: "suco",           name: "Sự cố & CĐ",           icon: AlertOctagon,   color: "#92400e", bg: "#fef3c7", url: "http://localhost:5185",                  external: true  },
  { key: "thunghiem",      name: "Thử nghiệm",            icon: FlaskConical,   color: "#92400e", bg: "#fef3c7", url: "http://localhost:5186",             external: true  },
  { key: "doluong",        name: "Đo lường & KĐ",        icon: Scale,          color: "#92400e", bg: "#fef3c7", url: "http://localhost:5187",               external: true  },
  { key: "antoan",         name: "An toàn KT",            icon: HardHat,        color: "#92400e", bg: "#fef3c7", url: "http://localhost:5188",                external: true  },
  { key: "chatbot",        name: "Chatbot AI",            icon: Bot,            color: "#1B3A5C", bg: "#e8eef6", url: "http://localhost:3011",               external: true  },
  { key: "dms",            name: "Tài liệu DMS",          icon: Files,          color: "#1B3A5C", bg: "#e8eef6", url: "http://localhost:3010",                   external: true  },
];

const APP_MAP = Object.fromEntries(APPS.map((a) => [a.key, a]));

const ALL_APP_KEYS = ["sso", "dieuhanhbi", "cms", "chatbot", "dms", "taichinhketoan", "hopdongnhiemvu", "muahang", "kho", "sanxuat", "baotri", "suachua", "daitu", "vongdoi", "chatluong", "suco", "thunghiem", "doluong", "antoan"];

interface AppSwitcherProps {
  currentApp: string;
}

export function AppSwitcher({ currentApp }: AppSwitcherProps) {
  const [open, setOpen] = useState(false);

  const renderApp = (app: App) => {
    const isCurrent = app.key === currentApp;
    const Icon = app.icon;
    return (
      <a
        key={app.key}
        href={app.url}
        target={app.external ? "_blank" : undefined}
        rel={app.external ? "noopener noreferrer" : undefined}
        onClick={() => setOpen(false)}
        title={app.name}
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "8px 4px 8px",
            borderRadius: 10,
            cursor: "pointer",
            background: isCurrent ? app.bg : "transparent",
            border: isCurrent ? `1.5px solid ${app.color}44` : "1.5px solid transparent",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!isCurrent) {
              (e.currentTarget as HTMLDivElement).style.background = app.bg;
              (e.currentTarget as HTMLDivElement).style.border = `1.5px solid ${app.color}30`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isCurrent) {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
              (e.currentTarget as HTMLDivElement).style.border = "1.5px solid transparent";
            }
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: app.bg,
              border: `1.5px solid ${app.color}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
              flexShrink: 0,
            }}
          >
            <Icon size={21} color={app.color} strokeWidth={1.75} />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: isCurrent ? 700 : 500,
              color: isCurrent ? app.color : "#555",
              textAlign: "center",
              lineHeight: "14px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
              maxWidth: 76,
            }}
          >
            {app.name}
          </span>
        </div>
      </a>
    );
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: open ? "#f0f2f5" : "transparent",
            transition: "background 0.18s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "#f5f7fa"; }}
          onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          aria-label="Chuyển ứng dụng"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0"   y="0"   width="5" height="5" rx="1" fill="#555"/>
            <rect x="6.5" y="0"   width="5" height="5" rx="1" fill="#555"/>
            <rect x="13"  y="0"   width="5" height="5" rx="1" fill="#555"/>
            <rect x="0"   y="6.5" width="5" height="5" rx="1" fill="#555"/>
            <rect x="6.5" y="6.5" width="5" height="5" rx="1" fill="#555"/>
            <rect x="13"  y="6.5" width="5" height="5" rx="1" fill="#555"/>
            <rect x="0"   y="13"  width="5" height="5" rx="1" fill="#555"/>
            <rect x="6.5" y="13"  width="5" height="5" rx="1" fill="#555"/>
            <rect x="13"  y="13"  width="5" height="5" rx="1" fill="#555"/>
          </svg>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          style={{
            width: 360,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.08)",
            padding: "12px 10px 10px",
            zIndex: 9999,
            userSelect: "none",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Ứng dụng</span>
            <a
              href="/"
              style={{ fontSize: 12, color: "#1B3A5C", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              <Home size={12} /> Cổng thông tin <ArrowRight size={10} />
            </a>
          </div>

          {/* All apps — 4-column flat grid (portal first) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px 0" }}>
            {[APP_MAP["portal"], ...ALL_APP_KEYS.map((key) => APP_MAP[key])].map((app) => renderApp(app))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#f0f0f0", margin: "6px 0 4px" }} />

          {/* Footer */}
          <a
            href="/he-thong"
            style={{ fontSize: 12, color: "#1B3A5C", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
            onClick={() => setOpen(false)}
          >
            <AppWindow size={14} />
            Xem tất cả phần mềm nghiệp vụ
            <ArrowRight size={10} style={{ marginLeft: "auto" }} />
          </a>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
