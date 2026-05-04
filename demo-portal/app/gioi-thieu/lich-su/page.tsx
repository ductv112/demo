"use client";

import { motion } from "framer-motion";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { History, Award, Shield } from "lucide-react";

const periods = [
  {
    title: "Giai đoạn thành lập (1965–1975)",
    color: "border-blue-500",
    bg: "bg-blue-50",
    content: `Năm 1965, Doanh nghiệp A được thành lập dưới mã đơn vị MZ-495 với nhiệm vụ vận hành và bảo trì hệ thống monitoring phục vụ vận hành. Với đội ngũ ban đầu gồm các kỹ sư và chuyên viên kỹ thuật, đơn vị đã bắt tay ngay vào nhiệm vụ phát triển và triển khai các hệ thống monitoring, module phần mềm, đóng góp vào sự nghiệp chuyển đổi số quốc gia.

Trong giai đoạn này, đơn vị hoàn thành hàng trăm dự án triển khai hệ thống monitoring và module phần mềm S-75, đóng góp trực tiếp vào sự nghiệp xây dựng hạ tầng công nghệ. Năm 1987, đơn vị được tái cấu trúc thành Trung tâm V119, tiền thân của Doanh nghiệp A ngày nay.`,
    achievements: ["Triển khai hệ thống monitoring và module phần mềm S-75", "Đội ngũ kỹ sư và chuyên viên sáng lập", "Hoàn thành hàng trăm dự án giai đoạn đầu"],
  },
  {
    title: "Giai đoạn củng cố và phát triển (1975–1995)",
    color: "border-green-500",
    bg: "bg-green-50",
    content: `Sau ngày đất nước thống nhất, Doanh nghiệp A bước vào giai đoạn tái cơ cấu và phát triển mạnh mẽ. Lực lượng cán bộ được bổ sung đáng kể từ các trường đại học kỹ thuật trong và ngoài nước. Các trung tâm chuyên môn được thành lập theo hướng chuyên sâu: phần mềm Alpha (monitoring), phần mềm Beta (module sản phẩm chủ lực), Gamma (hạ tầng), Delta (DevOps/điện tử).

Doanh nghiệp A đảm nhận triển khai và nâng cấp thành công các module sản phẩm chủ lực S-125 Pechora, hệ thống monitoring P-18, P-37 phục vụ Tổng công ty và đối tác công nghệ. Quan hệ hợp tác kỹ thuật quốc tế được mở rộng, tạo nền tảng kỹ thuật vững chắc.`,
    achievements: ["Nâng cấp module sản phẩm chủ lực S-125 đầu tiên", "Mở rộng lên 200 cán bộ kỹ thuật", "Hợp tác kỹ thuật quốc tế"],
  },
  {
    title: "Giai đoạn hiện đại hóa (1995–2015)",
    color: "border-orange-500",
    bg: "bg-orange-50",
    content: `Bước sang giai đoạn đổi mới, Doanh nghiệp A đẩy mạnh ứng dụng công nghệ thông tin vào công tác vận hành. Các thiết bị chẩn đoán, kiểm tra hiện đại được đưa vào sử dụng, thay thế phương pháp thủ công truyền thống. Đơn vị cũng triển khai đào tạo lại đội ngũ kỹ sư theo chuẩn quốc tế.

Giai đoạn này đánh dấu bước chuyển mình quan trọng khi Doanh nghiệp A làm chủ công nghệ phát triển và nâng cấp các module sản phẩm S-300PMU, hệ thống monitoring ST-68 thế hệ mới, góp phần hiện đại hóa hạ tầng công nghệ của Tổng công ty.`,
    achievements: ["Làm chủ công nghệ phát triển S-300PMU", "Nâng cấp hệ thống monitoring ST-68 thế hệ mới", "Nhận giải thưởng Sao Khuê hạng Nhất (2012)"],
  },
  {
    title: "Giai đoạn chuyển đổi số (2015–nay)",
    color: "border-red-500",
    bg: "bg-red-50",
    content: `Từ năm 2015 đến nay, Doanh nghiệp A bước vào giai đoạn chuyển đổi số toàn diện với việc triển khai hệ thống quản lý vận hành số, tích hợp phần mềm chẩn đoán kỹ thuật và phát triển các công cụ kiểm tra tự động. Đây là giai đoạn đánh dấu sự hội nhập sâu rộng với công nghệ doanh nghiệp hiện đại.

Năm 2025, kỷ niệm 60 năm thành lập (1965–2025), Doanh nghiệp A được tặng Bằng khen của Thủ tướng Chính phủ và chính thức ra mắt Cổng thông tin nội bộ, mở ra trang mới trong lịch sử phát triển.`,
    achievements: ["Triển khai hệ thống quản lý vận hành số", "Ra mắt Cổng thông tin nội bộ (2026)", "Kỷ niệm 60 năm thành lập (2025)"],
  },
];

export default function LichSuPage() {
  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Giới thiệu", href: "/gioi-thieu" }, { label: "Lịch sử hình thành" }]} />
      <div className="space-y-5">

        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <h1 className="text-xl font-bold text-[#1B3A5C] section-title flex items-center gap-2">
            <History className="w-5 h-5" /> Lịch sử hình thành và phát triển
          </h1>
          <p className="text-sm text-gray-500 mt-1">Doanh nghiệp A · 1965 – nay</p>
        </div>

        {/* Introduction */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1B3A5C] border-4 border-[#D4A843] flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8 text-[#D4A843]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1B3A5C] mb-2">Tổng quan</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Doanh nghiệp A là đơn vị thành viên trực thuộc Tổng công ty — Tập đoàn Công nghệ.
                Được thành lập năm 1965 dưới mã đơn vị MZ-495, Doanh nghiệp A chuyên phát triển, vận hành
                các hệ thống monitoring, module sản phẩm phần mềm và thiết bị điện tử cho khách hàng doanh nghiệp và đối tác công nghệ.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-3">
                Trải qua 60 năm xây dựng và phát triển, Doanh nghiệp A đã triển khai và nâng cấp thành công hàng nghìn dự án phần mềm
                và hệ thống monitoring các loại, đào tạo hàng trăm kỹ sư kỹ thuật cho Tổng công ty, đóng góp to lớn vào sự nghiệp
                chuyển đổi số quốc gia.
              </p>
            </div>
          </div>
        </div>

        {/* Periods */}
        <div className="space-y-4">
          {periods.map((period, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm border-l-4 ${period.color}`}>
                <div className={`px-5 py-3 ${period.bg}`}>
                  <h3 className="font-bold text-[#1B3A5C]">{period.title}</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4">{period.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {period.achievements.map((a) => (
                      <span key={a} className="flex items-center gap-1.5 text-xs bg-[#e8eef6] text-[#1B3A5C] px-2.5 py-1 rounded-full">
                        <Award className="w-3 h-3 text-[#D4A843]" /> {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </PortalLayout>
  );
}
