"use client";

import { motion } from "framer-motion";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Users, ChevronDown } from "lucide-react";

const orgChart = {
  top: { name: "BAN GIÁM ĐỐC NHÀ MÁY", sub: "Giám đốc + 02 Phó Giám đốc", color: "bg-[#1B3A5C] text-white border-[#1B3A5C]" },
  departments: [
    {
      group: "Phòng Chức năng",
      color: "bg-[#2d5a8e] text-white",
      units: [
        { name: "Phòng Chính trị (P.CT)", sub: "Công tác chính trị, tư tưởng" },
        { name: "Phòng Kế hoạch (P.KH)", sub: "Lập kế hoạch, điều phối sản xuất" },
        { name: "Phòng Tài chính - Kế toán (P.TCKT)", sub: "Ngân sách, kế toán" },
        { name: "Phòng Hậu cần - Kỹ thuật (P.HCKT)", sub: "HC, hậu cần, đời sống" },
        { name: "Phòng Kỹ thuật (P.KT)", sub: "Quản lý kỹ thuật, công nghệ" },
      ],
    },
    {
      group: "Phân xưởng Sản xuất",
      color: "bg-[#D4A843] text-white",
      units: [
        { name: "Phân xưởng Sửa chữa Radar (PX1)", sub: "Sửa chữa radar P-18, 36D6, P-37, ST-68" },
        { name: "Phân xưởng Sửa chữa Tên lửa (PX2)", sub: "Sửa chữa S-75, S-125, S-300PMU" },
        { name: "Phân xưởng Cơ khí (PX3)", sub: "Gia công cơ khí, phục hồi chi tiết" },
        { name: "Phân xưởng Điện tử (PX4)", sub: "Sửa chữa mạch điện tử, bo mạch" },
        { name: "Phòng KCS & Đảm bảo CL (P.KCS)", sub: "Kiểm tra chất lượng, nghiệm thu" },
      ],
    },
  ],
};

export default function CoCauPage() {
  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Giới thiệu", href: "/gioi-thieu" }, { label: "Cơ cấu tổ chức" }]} />
      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <h1 className="text-xl font-bold text-[#1B3A5C] section-title flex items-center gap-2">
            <Users className="w-5 h-5" /> Cơ cấu tổ chức
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sơ đồ tổ chức Nhà máy Z119</p>
        </div>

        {/* Org chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col items-center">

            {/* Top box */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
              <div className={`rounded-lg border-2 p-4 text-center shadow-md ${orgChart.top.color}`}>
                <p className="font-black text-sm tracking-wide">{orgChart.top.name}</p>
                <p className="text-xs opacity-80 mt-1">{orgChart.top.sub}</p>
              </div>
            </motion.div>

            {/* Connector */}
            <div className="w-0.5 h-8 bg-gray-300" />
            <ChevronDown className="w-5 h-5 text-gray-400 -mt-3 mb-2" />

            {/* Two columns */}
            <div className="w-full grid md:grid-cols-2 gap-6 relative">
              {/* Horizontal connector */}
              <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gray-300 hidden md:block" />

              {orgChart.departments.map((dept, di) => (
                <motion.div key={dept.group} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + di * 0.1 }}>
                  {/* Group header */}
                  <div className={`rounded-t-lg px-4 py-2.5 text-center ${dept.color}`}>
                    <p className="font-bold text-sm">{dept.group}</p>
                  </div>
                  {/* Units */}
                  <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden divide-y divide-gray-100">
                    {dept.units.map((unit, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-[#D4A843] shrink-0 mt-1.5" />
                        <div>
                          <p className="text-sm font-semibold text-[#1B3A5C]">{unit.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{unit.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#1B3A5C] px-5 py-3">
            <h2 className="text-white font-bold flex items-center gap-2">
              <div className="w-1 h-4 bg-[#D4A843] rounded" /> Tổng hợp nhân sự
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Đơn vị","Quân số","Sĩ quan","Kỹ sư","Ghi chú"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Ban Giám đốc","3","3","3","Giám đốc + 2 Phó"],
                  ["Phòng Chính trị","10","4","3","P.CT"],
                  ["Phòng Kế hoạch","8","3","5","P.KH"],
                  ["Phòng TC-KT","6","2","4","P.TCKT"],
                  ["Phòng HC-KT","12","2","3","P.HCKT"],
                  ["Phòng Kỹ thuật","15","6","12","P.KT"],
                  ["PX Sửa chữa Radar","35","10","28","PX1"],
                  ["PX Sửa chữa Tên lửa","30","8","24","PX2"],
                  ["PX Cơ khí","25","5","18","PX3"],
                  ["PX Điện tử","20","6","16","PX4"],
                  ["Phòng KCS","16","5","14","P.KCS"],
                  ["Tổng cộng","180","54","130",""],
                ].map(([unit, total, officers, engineers, note], i) => (
                  <tr key={i} className={`hover:bg-gray-50 ${i === 10 ? "font-bold bg-[#1B3A5C]/5" : ""}`}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{unit}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-[#1B3A5C]">{total}</td>
                    <td className="px-4 py-2.5 text-center">{officers}</td>
                    <td className="px-4 py-2.5 text-center">{engineers}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
