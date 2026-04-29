"use client";

import { motion } from "framer-motion";
import { FolderKanban, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";

const projects = [
  { name: "Tàu hộ vệ tên lửa lớp 2026", phase: "Thiết kế kỹ thuật", progress: 68, status: "Đúng tiến độ", members: 12, deadline: "30/06/2026" },
  { name: "Tàu tuần tra cao tốc TT-2026", phase: "Thiết kế cơ sở", progress: 45, status: "Đúng tiến độ", members: 8, deadline: "15/08/2026" },
  { name: "Nâng cấp hệ thống động lực tàu TT-500", phase: "Nghiên cứu", progress: 20, status: "Chậm tiến độ", members: 5, deadline: "31/12/2026" },
  { name: "Cải hoán tàu đổ bộ LST-01", phase: "Thiết kế chi tiết", progress: 92, status: "Hoàn thành sớm", members: 15, deadline: "10/04/2026" },
];

const statusStyle: Record<string, string> = {
  "Đúng tiến độ": "bg-green-50 text-green-700 border-green-200",
  "Chậm tiến độ": "bg-red-50 text-red-700 border-red-200",
  "Hoàn thành sớm": "bg-blue-50 text-blue-700 border-blue-200",
};

export default function DuAnPage() {
  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Hệ thống tích hợp", href: "/he-thong" }, { label: "Quản lý Dự án" }]} />
      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1B3A5C] section-title">Quản lý Dự án</h1>
            <p className="text-sm text-gray-500 mt-0.5">Theo dõi tiến độ sửa chữa toàn Nhà máy</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Dự án đang triển khai", value: "4", icon: FolderKanban, color: "#1B3A5C", bg: "#e8eef6" },
            { label: "Đúng tiến độ", value: "3", icon: CheckCircle2, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Chậm tiến độ", value: "1", icon: AlertCircle, color: "#dc2626", bg: "#fef2f2" },
            { label: "Tổng nhân sự", value: "40", icon: Users, color: "#b45309", bg: "#fef3e2" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border p-4 flex items-center gap-3" style={{ background: bg, borderColor: color + "30" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color + "20" }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Project list */}
        <div className="space-y-3">
          {projects.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-[#1B3A5C] text-sm">{p.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Giai đoạn: {p.phase}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusStyle[p.status]}`}>{p.status}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div className="h-2 rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.status === "Chậm tiến độ" ? "#dc2626" : "#1B3A5C" }} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.members} thành viên</span>
                <span>{p.progress}% hoàn thành</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Hạn: {p.deadline}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
