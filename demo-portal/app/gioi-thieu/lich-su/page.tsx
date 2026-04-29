"use client";

import { motion } from "framer-motion";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { History, Award, Shield } from "lucide-react";

const periods = [
  {
    title: "Giai đoạn thành lập trong chiến tranh (1965–1975)",
    color: "border-blue-500",
    bg: "bg-blue-50",
    content: `Năm 1965, đơn vị được thành lập dưới mật danh MZ-495 với nhiệm vụ sửa chữa ra đa và máy chỉ huy phục vụ chiến đấu. Với đội ngũ ban đầu gồm các kỹ sư và thợ lành nghề, đơn vị đã bắt tay ngay vào nhiệm vụ sửa chữa khẩn cấp các khí tài radar, tên lửa phòng không, đóng góp vào Chiến thắng Hà Nội — Điện Biên Phủ trên không.

Trong giai đoạn này, đơn vị hoàn thành sửa chữa hàng trăm lượt khí tài radar và tên lửa S-75 Dvina, đóng góp trực tiếp vào thắng lợi của cuộc kháng chiến chống Mỹ cứu nước. Năm 1987, đơn vị được điều về trực thuộc Quân chủng Phòng không và mang tên Nhà máy Z119.`,
    achievements: ["Sửa chữa khẩn cấp radar và tên lửa S-75", "Đội ngũ kỹ sư và thợ lành nghề sáng lập", "Hoàn thành hàng trăm lượt sửa chữa trong chiến tranh"],
  },
  {
    title: "Giai đoạn củng cố và phát triển (1975–1995)",
    color: "border-green-500",
    bg: "bg-green-50",
    content: `Sau ngày đất nước thống nhất, Nhà máy bước vào giai đoạn tái cơ cấu và phát triển mạnh mẽ. Lực lượng cán bộ được bổ sung đáng kể từ các trường đại học kỹ thuật trong và ngoài nước. Các phân xưởng chuyên môn được thành lập theo hướng chuyên sâu: sửa chữa radar, sửa chữa tên lửa, cơ khí, điện tử.

Nhà máy đảm nhận sửa chữa và đại tu thành công các tổ hợp tên lửa S-125 Pechora, radar P-18, P-37 phục vụ lực lượng Phòng không Không quân. Quan hệ hợp tác kỹ thuật với Liên Xô và các nước XHCN được mở rộng, tạo nền tảng kỹ thuật vững chắc.`,
    achievements: ["Đại tu tổ hợp tên lửa S-125 đầu tiên", "Mở rộng lên 200 cán bộ kỹ thuật", "Hợp tác kỹ thuật với Liên Xô"],
  },
  {
    title: "Giai đoạn hiện đại hóa (1995–2015)",
    color: "border-orange-500",
    bg: "bg-orange-50",
    content: `Bước sang giai đoạn đổi mới, Nhà máy đẩy mạnh ứng dụng công nghệ thông tin vào công tác sửa chữa. Các thiết bị chẩn đoán, kiểm tra hiện đại được đưa vào sử dụng, thay thế phương pháp thủ công truyền thống. Nhà máy cũng triển khai đào tạo lại đội ngũ kỹ sư theo chuẩn quốc tế.

Giai đoạn này đánh dấu bước chuyển mình quan trọng khi Nhà máy làm chủ công nghệ sửa chữa và đại tu các tổ hợp S-300PMU, radar ST-68 thế hệ mới, góp phần hiện đại hóa lực lượng Phòng không Không quân.`,
    achievements: ["Làm chủ công nghệ sửa chữa S-300PMU", "Đại tu radar ST-68 thế hệ mới", "Nhận Huân chương Quân công hạng Nhất (2012)"],
  },
  {
    title: "Giai đoạn chuyển đổi số (2015–nay)",
    color: "border-red-500",
    bg: "bg-red-50",
    content: `Từ năm 2015 đến nay, Nhà máy bước vào giai đoạn chuyển đổi số toàn diện với việc triển khai hệ thống quản lý sửa chữa số, tích hợp phần mềm chẩn đoán kỹ thuật và phát triển các công cụ kiểm tra tự động. Đây là giai đoạn đánh dấu sự hội nhập sâu rộng với công nghệ quốc phòng hiện đại.

Năm 2025, kỷ niệm 60 năm Ngày truyền thống (1965–2025), Nhà máy được tặng Huân chương Bảo vệ Tổ quốc hạng Nhì và chính thức ra mắt Cổng thông tin nội bộ, mở ra trang mới trong lịch sử phát triển.`,
    achievements: ["Triển khai hệ thống quản lý sửa chữa số", "Ra mắt Cổng thông tin nội bộ (2026)", "Kỷ niệm 60 năm Ngày truyền thống (2025)"],
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
          <p className="text-sm text-gray-500 mt-1">Nhà máy Z119 · 1965 – nay</p>
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
                Nhà máy Z119 là đơn vị sự nghiệp kỹ thuật trực thuộc Quân chủng Phòng không Không quân, Bộ Quốc phòng Việt Nam.
                Được thành lập năm 1965 dưới mật danh MZ-495, Nhà máy là đơn vị chuyên sửa chữa, đại tu
                khí tài radar, tên lửa và thiết bị điện tử phòng không cho Quân đội nhân dân Việt Nam.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-3">
                Trải qua 60 năm xây dựng và phát triển, Nhà máy đã sửa chữa và đại tu thành công hàng nghìn lượt khí tài
                radar, tên lửa các loại, đào tạo hàng trăm kỹ sư kỹ thuật cho lực lượng Phòng không Không quân, đóng góp to lớn vào sự nghiệp
                bảo vệ vùng trời thiêng liêng của Tổ quốc.
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
