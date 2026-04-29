"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Shield as ShieldIcon,
  Star,
  UserCircle,
} from "lucide-react";
import { navMenu } from "@/lib/portal-data";
import { logout } from "@/lib/auth";

const DEMO_USER = { name: "Nguyễn Văn Hùng", rank: "Trưởng phòng — Trung tâm Vận hành Monitoring (Alpha)", initials: "HN" };

/**
 * Slim header — single row with logo, slogan, search trigger, and user menu.
 * Main navigation is handled by <PortalNav /> rendered separately by the layout
 * (or by individual pages, e.g. homepage places it under the hero showcase).
 */
export function PortalHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setShowSearch(false);
      setSearchQuery("");
      router.push(`/tim-kiem?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header
      data-portal-header
      className="sticky top-0 z-50 w-full bg-white border-b-2 border-[#D4A843] shadow-[0_1px_8px_rgba(10,22,40,0.08)] transition-transform duration-300 ease-out will-change-transform"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-10 h-10 rounded-full bg-[#1B3A5C] border-2 border-[#D4A843] flex items-center justify-center shadow-sm">
            <div className="flex flex-col items-center justify-center">
              <Star className="w-2 h-2 text-[#f0d890] fill-[#f0d890]" />
              <ShieldIcon className="w-3.5 h-3.5 text-white -mt-0.5" />
            </div>
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-[9px] font-semibold text-[#1B3A5C]/55 uppercase tracking-wider">
              Tổng công ty Doanh nghiệp A
            </p>
            <h1 className="text-[14px] font-black text-[#1B3A5C] tracking-tight">
              DOANH NGHIỆP A ·{" "}
              <span className="text-[#D4A843] font-bold">CỔNG THÔNG TIN NỘI BỘ</span>
            </h1>
          </div>
        </Link>

        {/* Center slogan (desktop only) */}
        <div className="flex-1 hidden xl:flex justify-center">
          <p className="text-xs text-[#1B3A5C]/45 italic font-medium">
            "Đổi mới — Chính xác — Đồng hành cùng khách hàng"
          </p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-1.5 text-[#1B3A5C] hover:bg-[#f0f4fa] px-2.5 h-9 rounded-md text-sm font-medium transition-colors"
            aria-label="Tìm kiếm"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline text-xs">Tìm kiếm</span>
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
              className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-md hover:bg-[#f0f4fa] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4A843] to-[#a07a26] flex items-center justify-center text-[10px] font-black text-[#1B3A5C] shadow-sm">
                {DEMO_USER.initials}
              </div>
              <span className="text-[#1B3A5C] text-xs font-bold hidden md:inline">
                {DEMO_USER.name.split(" ").slice(-1)[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-[#1B3A5C]/60" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-[#f0f4fa] border-b border-gray-100">
                    <p className="text-sm font-bold text-[#1B3A5C]">{DEMO_USER.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{DEMO_USER.rank}</p>
                  </div>
                  <Link href="/noi-bo/dashboard">
                    <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <UserCircle className="w-4 h-4 text-gray-400" /> Trang cá nhân
                    </div>
                  </Link>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu */}
          <button
            className="lg:hidden ml-1 text-[#1B3A5C]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Search bar (expandable) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 overflow-hidden bg-[#fafbfc]"
          >
            <div className="max-w-[1200px] mx-auto px-4 py-3">
              <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#1B3A5C]"
                />
                <button type="submit" className="bg-[#1B3A5C] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#2d5a8e]">
                  Tìm kiếm
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="lg:hidden bg-[#1B3A5C] overflow-hidden"
          >
            {navMenu.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <div className="px-4 py-3 text-sm text-white border-b border-white/10 hover:bg-[#D4A843]">
                  {item.label}
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
