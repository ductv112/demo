import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 bg-white border border-gray-200 rounded px-3 py-2">
      <Link href="/">
        <span className="flex items-center gap-1 hover:text-[#D4A843] transition-colors cursor-pointer">
          <Home className="w-3 h-3" /> Trang chủ
        </span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-gray-400" />
          {item.href ? (
            <Link href={item.href}>
              <span className="hover:text-[#D4A843] transition-colors cursor-pointer">{item.label}</span>
            </Link>
          ) : (
            <span className="text-[#1B3A5C] font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
