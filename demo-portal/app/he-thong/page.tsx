"use client";

import { motion } from "framer-motion";
import {
  Fingerprint,
  Bot,
  FileStack,
  Banknote,
  ShoppingCart,
  ClipboardList,
  BarChart3,
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
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";

// Màu đồng nhất theo nhóm
const groupTheme: Record<string, { color: string; bg: string; border: string; accent: string }> = {
  "Nền tảng":            { color: "#1B3A5C", bg: "#e8eef6", border: "#93c5fd", accent: "#1B3A5C" },
  "Tài chính & Nguồn lực": { color: "#4c1d95", bg: "#f5f3ff", border: "#c4b5fd", accent: "#6d28d9" },
  "Chuỗi cung ứng":     { color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc", accent: "#0369a1" },
  "Thực thi kỹ thuật":  { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", accent: "#059669" },
  "Chất lượng":         { color: "#92400e", bg: "#fef3c7", border: "#fcd34d", accent: "#d97706" },
};

interface SystemItem {
  icon: React.ElementType;
  badge: string;
  label: string;
  desc: string;
  href: string;
  group: string;
}

const systems: SystemItem[] = [
  // ── Nền tảng ─────────────────────────────────────────────────────────────
  {
    icon: Fingerprint,
    badge: "SS",
    label: "Quản lý SSO & Phân quyền",
    desc: "Xác thực tập trung, quản lý định danh và phân quyền truy cập toàn bộ hệ thống",
    href: "/sso-management",
    group: "Nền tảng",
  },
  {
    icon: BarChart3,
    badge: "BI",
    label: "Trung tâm điều hành số",
    desc: "Tổng hợp và trực quan hóa dữ liệu toàn doanh nghiệp, hỗ trợ Ban Giám đốc ra quyết định chiến lược",
    href: "https://pkkq-dieuhanhbi-staging.dft.vn",
    group: "Nền tảng",
  },
  {
    icon: LayoutDashboard,
    badge: "CM",
    label: "Quản trị nội dung (CMS)",
    desc: "Quản lý tin tức, thông báo, văn bản và biểu mẫu trên Cổng thông tin nội bộ",
    href: "/cms",
    group: "Nền tảng",
  },
  {
    icon: Bot,
    badge: "AI",
    label: "Chatbot trợ lý AI",
    desc: "Tra cứu tài liệu kỹ thuật, tư vấn quy trình nghiệp vụ và hỗ trợ vận hành thiết bị 24/7",
    href: "https://pkkq-chatbot-staging.dft.vn",
    group: "Nền tảng",
  },
  {
    icon: FileStack,
    badge: "DM",
    label: "Quản lý tài liệu (DMS)",
    desc: "Lưu trữ, tìm kiếm và kiểm soát phiên bản tài liệu kỹ thuật, quy trình và hồ sơ nội bộ",
    href: "https://pkkq-dms-staging.dft.vn",
    group: "Nền tảng",
  },
  // ── Tài chính & Nguồn lực ────────────────────────────────────────────────
  {
    icon: Banknote,
    badge: "TC",
    label: "Tài chính Kế toán",
    desc: "Hạch toán, tính giá thành sản phẩm và quyết toán hợp đồng dịch vụ",
    href: "https://pkkq-taichinhketoan-staging.dft.vn",
    group: "Tài chính & Nguồn lực",
  },
  {
    icon: ClipboardList,
    badge: "HD",
    label: "Hợp đồng & Nhiệm vụ",
    desc: "Lập dự toán, ký hợp đồng, phân rã WBS và theo dõi tiến độ nhiệm vụ",
    href: "https://pkkq-hopdongnhiemvu-staging.dft.vn",
    group: "Tài chính & Nguồn lực",
  },
  // ── Chuỗi cung ứng ───────────────────────────────────────────────────────
  {
    icon: ShoppingCart,
    badge: "MH",
    label: "Quản lý Mua hàng",
    desc: "Khởi tạo, phê duyệt và theo dõi đơn đặt hàng vật tư với nhà cung cấp",
    href: "https://pkkq-muahang-staging.dft.vn",
    group: "Chuỗi cung ứng",
  },
  {
    icon: Warehouse,
    badge: "KT",
    label: "Quản lý Kho tàng",
    desc: "Quản lý tồn kho, vị trí lưu trữ và truy vết vòng đời vật tư theo lô/sê-ri",
    href: "https://pkkq-kho-staging.dft.vn",
    group: "Chuỗi cung ứng",
  },
  // ── Thực thi kỹ thuật ────────────────────────────────────────────────────
  {
    icon: Factory,
    badge: "SX",
    label: "Quản lý Sản xuất",
    desc: "Quản lý BOM, quy trình công nghệ và điều phối lệnh chế tạo vật tư, phụ tùng",
    href: "https://pkkq-sanxuat-staging.dft.vn",
    group: "Thực thi kỹ thuật",
  },
  {
    icon: Wrench,
    badge: "BT",
    label: "Quản lý Bảo trì",
    desc: "Lập lịch bảo trì định kỳ và giám sát tình trạng thiết bị tại hiện trường",
    href: "https://pkkq-baotri-staging.dft.vn",
    group: "Thực thi kỹ thuật",
  },
  {
    icon: Hammer,
    badge: "SC",
    label: "Quản lý Sửa chữa",
    desc: "Tiếp nhận thiết bị hỏng, lên phương án và phục hồi linh kiện, mô-đun",
    href: "https://pkkq-suachua-staging.dft.vn",
    group: "Thực thi kỹ thuật",
  },
  {
    icon: RefreshCw,
    badge: "DT",
    label: "Quản lý Đại tu",
    desc: "Tháo rã toàn bộ, phục hồi và nâng cấp toàn diện hệ thống thiết bị",
    href: "https://pkkq-daitu-staging.dft.vn",
    group: "Thực thi kỹ thuật",
  },
  // ── Chất lượng ───────────────────────────────────────────────────────────
  {
    icon: Network,
    badge: "VD",
    label: "Vòng đời & Cấu hình",
    desc: "Quản lý cấu hình thiết kế chuẩn và lý lịch cấu hình thực tế theo số hiệu",
    href: "https://pkkq-vongdoi-staging.dft.vn",
    group: "Chất lượng",
  },
  {
    icon: ClipboardCheck,
    badge: "CL",
    label: "Chất lượng QA/QC",
    desc: "Kiểm soát chất lượng đầu vào, trong quá trình và đầu ra theo chuẩn kỹ thuật",
    href: "https://pkkq-chatluong-staging.dft.vn",
    group: "Chất lượng",
  },
  {
    icon: AlertOctagon,
    badge: "SG",
    label: "Sự cố & Chẩn đoán",
    desc: "Phân tích nguyên nhân gốc và cảnh báo sớm xu hướng hỏng hóc thiết bị",
    href: "https://pkkq-suco-staging.dft.vn",
    group: "Chất lượng",
  },
  {
    icon: FlaskConical,
    badge: "TN",
    label: "Thử nghiệm & Nghiệm thu",
    desc: "Xây dựng kịch bản, đo kiểm thông số và nghiệm thu kỹ thuật nhiều cấp",
    href: "https://pkkq-thunghiem-staging.dft.vn",
    group: "Chất lượng",
  },
  {
    icon: Scale,
    badge: "DL",
    label: "Đo lường & Kiểm định",
    desc: "Quản lý danh mục thiết bị đo, chứng thư kiểm định và cảnh báo hết hạn",
    href: "https://pkkq-doluong-staging.dft.vn",
    group: "Chất lượng",
  },
  {
    icon: HardHat,
    badge: "AT",
    label: "An toàn Kỹ thuật",
    desc: "Nhận diện rủi ro, kiểm soát nguy hiểm và giám sát tuân thủ an toàn lao động",
    href: "https://pkkq-antoan-staging.dft.vn",
    group: "Chất lượng",
  },
];

const groups = Object.keys(groupTheme);

export default function HeThongPage() {
  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Phần mềm nghiệp vụ" }]} />

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#1B3A5C] section-title mb-1">
                Phần mềm nghiệp vụ
              </h1>
              <p className="text-sm text-gray-500">
                Hệ thống {systems.length} phần mềm tích hợp phục vụ quản lý kỹ thuật Doanh nghiệp A.
                Đăng nhập SSO một lần để truy cập tất cả.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {groups.map((g) => {
                const theme = groupTheme[g];
                const count = systems.filter((s) => s.group === g).length;
                return (
                  <span
                    key={g}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{ color: theme.color, borderColor: theme.border, background: theme.bg }}
                  >
                    {g} ({count})
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* System grid by group */}
        {groups.map((groupName) => {
          const theme = groupTheme[groupName];
          const groupSystems = systems.filter((s) => s.group === groupName);
          if (groupSystems.length === 0) return null;
          return (
            <div key={groupName}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ background: theme.accent }} />
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: theme.accent }}>
                  {groupName}
                </h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupSystems.map(({ icon: Icon, label, desc, href }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="group block bg-white border rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden h-full"
                      style={{ borderColor: theme.border }}
                    >
                      {/* Accent bar top */}
                      <div className="h-1 w-full" style={{ background: theme.accent }} />

                      <div className="p-5">
                        {/* Large icon */}
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                          style={{ background: theme.bg, border: `1.5px solid ${theme.border}` }}
                        >
                          <Icon className="w-7 h-7" style={{ color: theme.color }} />
                        </div>

                        {/* Label */}
                        <p className="font-bold text-sm text-gray-800 leading-snug">{label}</p>

                        {/* Description */}
                        <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-2">{desc}</p>

                        {/* CTA */}
                        <div
                          className="flex items-center gap-1 mt-4 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ color: theme.accent }}
                        >
                          Truy cập <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

      </div>
    </PortalLayout>
  );
}
