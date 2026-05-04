import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Target, CheckCircle2 } from "lucide-react";

const functions = [
  {
    title: "I. Chức năng",
    items: [
      "Phát triển, vận hành các hệ thống monitoring, module phần mềm và thiết bị điện tử cho Tổng công ty và đối tác công nghệ.",
      "Tư vấn, phản biện kỹ thuật các dự án triển khai, nâng cấp, cải tiến hệ thống phần mềm.",
      "Nghiên cứu khoa học và phát triển công nghệ trong lĩnh vực phần mềm doanh nghiệp.",
      "Đào tạo, bồi dưỡng đội ngũ kỹ sư, chuyên viên kỹ thuật cho toàn Tổng công ty.",
    ],
  },
  {
    title: "II. Nhiệm vụ chính",
    items: [
      "Triển khai, nâng cấp các hệ thống monitoring: P-18, 36D6, P-37, ST-68 và các hệ thống monitoring khác.",
      "Triển khai, nâng cấp các module sản phẩm chủ lực: S-75 Dvina, S-125 Pechora, S-300PMU và các hệ thống module phần mềm.",
      "Xây dựng, quản lý và cập nhật hệ thống tiêu chuẩn kỹ thuật, quy chuẩn vận hành sản phẩm phần mềm.",
      "Phối hợp với các đơn vị thuộc Khối K361, K363, K367 và các Phòng/Trung tâm trong tiếp nhận và bàn giao thiết bị.",
      "Nghiên cứu, ứng dụng các công nghệ tiên tiến (chẩn đoán kỹ thuật, kiểm thử tự động) trong vận hành sản phẩm.",
      "Hợp tác quốc tế về kỹ thuật phần mềm doanh nghiệp với các quốc gia và tổ chức quốc tế.",
      "Lưu trữ, quản lý hồ sơ kỹ thuật và tài liệu vận hành toàn bộ các sản phẩm đã triển khai.",
    ],
  },
  {
    title: "III. Quyền hạn",
    items: [
      "Ký kết hợp đồng triển khai, nâng cấp với các đơn vị trong và ngoài Tổng công ty theo quy định.",
      "Yêu cầu các đơn vị liên quan cung cấp thông tin, tài liệu phục vụ công tác vận hành.",
      "Phê duyệt hồ sơ nghiệm thu kỹ thuật trong phạm vi thẩm quyền được giao.",
      "Đề xuất các giải pháp kỹ thuật, tiêu chuẩn vận hành mới trình cấp trên phê duyệt.",
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
          <p className="text-sm text-gray-500 mt-1">Theo Quyết định số 12/QĐ-HĐQT của Hội đồng quản trị Tập đoàn Công nghệ</p>
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
