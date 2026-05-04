'use client';

/**
 * AppSwitcher — Popover grid chuyển giữa các phần mềm trong hệ sinh thái Doanh nghiệp A.
 *
 * Port từ module taichinhketoan/src/components/AppSwitcher.tsx (AntD Popover)
 * sang shadcn/Radix Popover + Tailwind (Next.js 16).
 *
 * - Trigger: icon-only button (LayoutGrid) vừa header 56px
 * - Content: grid 4 cột, mỗi tile link tới `http://localhost:PORT` (mỗi module một port) (DNS staging giữ nguyên)
 * - Highlight app hiện tại bằng ring gold `#D4A843`
 * - Bao phủ đủ 18 apps: 16 PM trong CLAUDE.md + DMS + Chatbot
 */

import Link from 'next/link';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  AlertOctagon,
  BarChart2,
  Banknote,
  Bot,
  ClipboardCheck,
  ClipboardList,
  Factory,
  FileText,
  Fingerprint,
  FlaskConical,
  Hammer,
  HardHat,
  Home,
  LayoutDashboard,
  LayoutGrid,
  Network,
  RefreshCw,
  Scale,
  ShoppingCart,
  Warehouse,
  Wrench,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AppDef {
  key: string;
  name: string;
  icon: LucideIcon;
  /** Màu icon + border/text khi active */
  color: string;
  /** Background tile */
  bg: string;
  url: string;
  description: string;
}

const APPS: AppDef[] = [
  {
    key: 'sso',
    name: 'SSO & Phân quyền',
    icon: Fingerprint,
    color: '#1B3A5C',
    bg: '#e8eef6',
    url: 'http://localhost:5173/',
    description: 'Đăng nhập SSO & Phân quyền',
  },
  {
    key: 'portal',
    name: 'Cổng thông tin',
    icon: LayoutDashboard,
    color: '#1B3A5C',
    bg: '#e8eef6',
    url: 'http://localhost:3000/',
    description: 'Cổng thông tin nội bộ',
  },
  {
    key: 'taichinhketoan',
    name: 'Tài chính KT',
    icon: Banknote,
    color: '#4c1d95',
    bg: '#f5f3ff',
    url: 'http://localhost:5175/',
    description: 'Quản lý Tài chính Kế toán',
  },
  {
    key: 'muahang',
    name: 'Mua hàng',
    icon: ShoppingCart,
    color: '#0369a1',
    bg: '#e0f2fe',
    url: 'http://localhost:5177/',
    description: 'Quản lý Mua hàng',
  },
  {
    key: 'hopdongnhiemvu',
    name: 'Hợp đồng & NV',
    icon: ClipboardList,
    color: '#4c1d95',
    bg: '#f5f3ff',
    url: 'http://localhost:5176/',
    description: 'Quản lý Hợp đồng & Nhiệm vụ',
  },
  {
    key: 'kho',
    name: 'Kho tàng',
    icon: Warehouse,
    color: '#0369a1',
    bg: '#e0f2fe',
    url: 'http://localhost:5178/',
    description: 'Quản lý Kho tàng',
  },
  {
    key: 'sanxuat',
    name: 'Sản xuất',
    icon: Factory,
    color: '#065f46',
    bg: '#d1fae5',
    url: 'http://localhost:5179/',
    description: 'Quản lý Sản xuất',
  },
  {
    key: 'baotri',
    name: 'Bảo trì',
    icon: Wrench,
    color: '#065f46',
    bg: '#d1fae5',
    url: 'http://localhost:5180/',
    description: 'Quản lý Bảo trì',
  },
  {
    key: 'suachua',
    name: 'Sửa chữa',
    icon: Hammer,
    color: '#065f46',
    bg: '#d1fae5',
    url: 'http://localhost:5181/',
    description: 'Quản lý Sửa chữa',
  },
  {
    key: 'daitu',
    name: 'Đại tu',
    icon: RefreshCw,
    color: '#065f46',
    bg: '#d1fae5',
    url: 'http://localhost:5182/',
    description: 'Quản lý Đại tu',
  },
  {
    key: 'vongdoi',
    name: 'Vòng đời & CH',
    icon: Network,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5183/',
    description: 'Vòng đời & Cấu hình',
  },
  {
    key: 'chatluong',
    name: 'Chất lượng',
    icon: ClipboardCheck,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5184/',
    description: 'Chất lượng QA/QC',
  },
  {
    key: 'suco',
    name: 'Sự cố & CĐ',
    icon: AlertOctagon,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5185/',
    description: 'Sự cố & Chẩn đoán',
  },
  {
    key: 'thunghiem',
    name: 'Thử nghiệm',
    icon: FlaskConical,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5186/',
    description: 'Thử nghiệm & Nghiệm thu',
  },
  {
    key: 'doluong',
    name: 'Đo lường & KĐ',
    icon: Scale,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5187/',
    description: 'Đo lường & Kiểm định',
  },
  {
    key: 'antoan',
    name: 'An toàn KT',
    icon: HardHat,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5188/',
    description: 'An toàn Kỹ thuật',
  },
  // ── 2 PM bổ sung ngoài danh sách 16 (CLAUDE.md) ──────────────
  {
    key: 'dms',
    name: 'Quản lý tài liệu',
    icon: FileText,
    color: '#1B3A5C',
    bg: '#e8eef6',
    url: 'http://localhost:3010/',
    description: 'Quản lý tài liệu & Tri thức',
  },
  {
    key: 'chatbot',
    name: 'Trợ lý AI',
    icon: Bot,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:3011/',
    description: 'Trợ lý AI nội bộ',
  },
];

interface AppSwitcherProps {
  /** App key của ứng dụng hiện tại — để highlight tile tương ứng */
  currentApp?: string;
}

export function AppSwitcher({ currentApp = 'dms' }: AppSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Chuyển ứng dụng"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            open && 'bg-accent text-foreground',
          )}
        >
          <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[520px] max-w-[92vw] rounded-2xl border border-border/60 bg-popover p-0 shadow-[0_8px_32px_rgba(0,0,0,0.13),0_2px_8px_rgba(0,0,0,0.08)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 pb-3 pt-4">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold leading-tight text-[#1a1a2e]">
              Ứng dụng
            </span>
            <span className="text-[11px] font-medium leading-tight text-muted-foreground">
              Hệ thống phần mềm — Doanh nghiệp A
            </span>
          </div>
          <a
            href="http://localhost:3000/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-1 text-[12px] font-semibold text-[#1B3A5C] transition-colors hover:text-[#2d5a8e]"
          >
            <Home className="h-3.5 w-3.5" />
            Cổng thông tin
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        {/* Apps grid — 4 cột */}
        <div className="grid grid-cols-4 gap-1 p-3">
          {APPS.map((app) => {
            const Icon = app.icon;
            const isCurrent = app.key === currentApp;
            return (
              <a
                key={app.key}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                title={app.description}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-[10px] border px-1.5 py-2 text-center transition-all',
                  isCurrent
                    ? 'border-[#D4A843] ring-2 ring-[#D4A843]/40'
                    : 'border-transparent hover:border-border/80',
                )}
                style={{
                  background: isCurrent ? app.bg : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = app.bg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl border"
                  style={{
                    background: app.bg,
                    borderColor: `${app.color}33`,
                  }}
                >
                  <Icon size={20} color={app.color} strokeWidth={1.75} />
                </div>
                <span
                  className={cn(
                    'line-clamp-2 max-w-[80px] text-[11px] leading-[14px]',
                    isCurrent ? 'font-bold' : 'font-medium text-[#555]',
                  )}
                  style={{ color: isCurrent ? app.color : undefined }}
                >
                  {app.name}
                </span>
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 px-4 py-3">
          <a
            href="http://localhost:3000/he-thong"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-[12px] font-semibold text-[#1B3A5C] transition-colors hover:text-[#2d5a8e]"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Xem tất cả phần mềm nghiệp vụ
            <ArrowRight className="ml-auto h-3 w-3" />
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AppSwitcher;
