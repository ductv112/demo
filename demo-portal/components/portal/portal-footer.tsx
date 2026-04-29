import Link from "next/link";
import { Shield, Phone, Mail, MapPin, Star } from "lucide-react";

export function PortalFooter() {
  return (
    <footer className="bg-[#1B3A5C] text-white/80 mt-8">
      {/* Main footer */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-[#D4A843] flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-[#D4A843]" />
              </div>
              <div>
                <p className="text-white font-bold leading-tight text-sm">DOANH NGHIỆP A</p>
                <p className="text-white/60 text-xs">Tổng công ty Doanh nghiệp A · Tập đoàn Công nghệ</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Doanh nghiệp A là đơn vị phát triển, vận hành hệ thống monitoring, module phần mềm và sản phẩm công nghệ trực thuộc Tổng công ty Doanh nghiệp A. Thành lập năm 1965 dưới mã đơn vị MZ-495, Doanh nghiệp A đã triển khai hàng nghìn dự án phần mềm và hệ thống phục vụ chuyển đổi số.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#D4A843]" />
                <span>Số 2 Nguyễn Tri Phương, Hai Bà Trưng, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-[#D4A843]" />
                <span>(024) 3864 xxxx</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-[#D4A843]" />
                <span>contact@doanhnghiepa.vn</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide border-b border-white/20 pb-2">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Trang chủ", href: "/" },
                { label: "Giới thiệu Doanh nghiệp", href: "/gioi-thieu" },
                { label: "Tin tức - Sự kiện", href: "/tin-tuc" },
                { label: "Văn bản - Chỉ đạo", href: "/van-ban" },
                { label: "Thư viện Kỹ thuật", href: "/thu-vien" },
                { label: "Biểu mẫu & Quy trình", href: "/bieu-mau" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="hover:text-[#D4A843] transition-colors cursor-pointer">
                      › {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide border-b border-white/20 pb-2">
              Liên kết đối ngoại
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Bộ Thông tin & Truyền thông",
                "Tập đoàn Công nghệ",
                "Tổng cục Đổi mới sáng tạo",
                "Trung tâm Công nghệ DA",
                "Tập đoàn Viettel",
              ].map((name) => (
                <li key={name}>
                  <span className="text-white/60 cursor-default">› {name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>
            © 2026 Doanh nghiệp A. Bản quyền thuộc về Tổng công ty Doanh nghiệp A.
          </p>
          <p>
            Đây là hệ thống thông tin nội bộ. Nghiêm cấm truy cập trái phép.
          </p>
        </div>
      </div>
    </footer>
  );
}
