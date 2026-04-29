import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Target, CheckCircle2 } from "lucide-react";

const functions = [
  {
    title: "I. Chức năng",
    items: [
      "Sửa chữa, đại tu khí tài radar, tên lửa và thiết bị điện tử phòng không cho Quân đội nhân dân Việt Nam.",
      "Tư vấn, phản biện kỹ thuật các dự án sửa chữa, nâng cấp, cải tiến khí tài phòng không.",
      "Nghiên cứu khoa học và phát triển công nghệ trong lĩnh vực sửa chữa khí tài phòng không.",
      "Đào tạo, bồi dưỡng đội ngũ kỹ sư, kỹ thuật viên sửa chữa khí tài cho toàn quân.",
    ],
  },
  {
    title: "II. Nhiệm vụ chính",
    items: [
      "Sửa chữa, đại tu các tổ hợp radar: P-18, 36D6, P-37, ST-68 và các loại radar phòng không khác.",
      "Sửa chữa, đại tu các tổ hợp tên lửa: S-75 Dvina, S-125 Pechora, S-300PMU và các hệ thống tên lửa phòng không.",
      "Xây dựng, quản lý và cập nhật hệ thống tiêu chuẩn kỹ thuật, quy chuẩn sửa chữa khí tài phòng không.",
      "Phối hợp với các đơn vị thuộc Sư đoàn 361, 363, 367 và các Trung đoàn trong tiếp nhận và bàn giao khí tài.",
      "Nghiên cứu, ứng dụng các công nghệ tiên tiến (chẩn đoán kỹ thuật, kiểm tra không phá hủy) trong sửa chữa khí tài.",
      "Hợp tác quốc tế về kỹ thuật sửa chữa khí tài phòng không với các quốc gia và tổ chức quốc tế.",
      "Lưu trữ, quản lý hồ sơ kỹ thuật và tài liệu sửa chữa toàn bộ các khí tài đã thực hiện.",
    ],
  },
  {
    title: "III. Quyền hạn",
    items: [
      "Ký kết hợp đồng sửa chữa, đại tu với các đơn vị trong và ngoài quân đội theo quy định.",
      "Yêu cầu các đơn vị liên quan cung cấp thông tin, tài liệu phục vụ công tác sửa chữa.",
      "Phê duyệt hồ sơ nghiệm thu kỹ thuật trong phạm vi thẩm quyền được giao.",
      "Đề xuất các giải pháp kỹ thuật, tiêu chuẩn sửa chữa mới trình cấp trên phê duyệt.",
      "Quản lý và sử dụng con dấu, tài sản, ngân sách được giao theo quy định của pháp luật.",
    ],
  },
];

export default function ChucNangPage() {
  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Giới thiệu", href: "/gioi-thieu" }, { label: "Chức năng nhiệm vụ" }]} />
      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <h1 className="text-xl font-bold text-[#1B3A5C] section-title flex items-center gap-2">
            <Target className="w-5 h-5" /> Chức năng — Nhiệm vụ — Quyền hạn
          </h1>
          <p className="text-sm text-gray-500 mt-1">Theo Quyết định số 12/QĐ-BQP của Bộ Quốc phòng</p>
        </div>

        <div className="space-y-4">
          {functions.map((section) => (
            <div key={section.title} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-[#1B3A5C] px-5 py-3">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#D4A843] rounded" />{section.title}
                </h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#1B3A5C] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
