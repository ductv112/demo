"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { navMenu } from "@/lib/portal-data";

interface PortalNavProps {
  /** When true, render as a "secondary" pill bar (pill backgrounds, lighter look). */
  variant?: "primary" | "secondary";
}

/**
 * Horizontal navigation menu, used both as the primary header nav (default)
 * and as a secondary nav (placed below the homepage hero showcase).
 */
export function PortalNav({ variant = "primary" }: PortalNavProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (variant === "secondary") {
    // ── Secondary nav (full-bleed bar, used on homepage between ticker and content) ──
    return (
      <nav className="hidden lg:block bg-gradient-to-r from-[#1B3A5C] via-[#2d5a8e] to-[#1B3A5C] border-y-2 border-[#D4A843] shadow-[0_4px_18px_-8px_rgba(10,22,40,0.4)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-stretch justify-center gap-1">
            {navMenu.map((item) => {
              const active = isActive(item.href);
              return (
                <div
                  key={item.href}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.href)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link href={item.href}>
                    <div
                      className={`relative flex items-center gap-1.5 h-14 px-5 text-[15px] font-bold transition-all cursor-pointer
                        ${
                          active
                            ? "text-[#0a1628] bg-gradient-to-b from-[#f0d890] to-[#D4A843]"
                            : "text-white/90 hover:text-white hover:bg-white/10"
                        }`}
                    >
                      {item.label}
                      {item.children && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            active ? "opacity-90" : "opacity-65"
                          } group-hover:rotate-180`}
                        />
                      )}
                      {/* Active gold underline below */}
                      {active && (
                        <span className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-[#D4A843] shadow-[0_0_10px_rgba(212,168,67,0.7)]" />
                      )}
                      {/* Hover gold underline */}
                      {!active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-0 bg-gradient-to-r from-[#D4A843] to-[#f0d890] transition-all duration-300 group-hover:w-1/2" />
                      )}
                    </div>
                  </Link>

                  {item.children && (
                    <AnimatePresence>
                      {activeDropdown === item.href && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full min-w-[240px] bg-white border border-gray-200 shadow-xl z-40 rounded-b-lg overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <Link key={child.href} href={child.href}>
                              <div className="px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fdf6e3] hover:text-[#1B3A5C] hover:pl-6 transition-all border-b border-gray-100 last:border-0">
                                {child.label}
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  // ── Primary nav bar (dark navy, used as header secondary row on non-home pages) ──
  return (
    <nav className="bg-[#1B3A5C] hidden lg:block">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-stretch">
          {navMenu.map((item) => (
            <div
              key={item.href}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(item.href)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link href={item.href}>
                <div
                  className={`flex items-center gap-1 px-4 py-3.5 text-sm font-medium text-white/90 hover:text-white hover:bg-[#D4A843] transition-colors cursor-pointer ${
                    isActive(item.href) ? "bg-[#D4A843] text-white" : ""
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3 h-3 opacity-70" />}
                </div>
              </Link>

              {item.children && (
                <AnimatePresence>
                  {activeDropdown === item.href && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full min-w-[220px] bg-white border border-gray-200 shadow-xl z-50 rounded-b"
                    >
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <div className="px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f0f4fa] hover:text-[#1B3A5C] hover:pl-6 transition-all border-b border-gray-100 last:border-0">
                            {child.label}
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
