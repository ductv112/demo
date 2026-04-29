"use client";

import { motion } from "framer-motion";
import { BadgeDollarSign, TrendingUp, AlertCircle, FileCheck, DollarSign } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";

const contracts = [
  { name: "Hợp đồng đại tu radar 36D6 cho Sư đoàn 361", value: "4.800.000.000", status: "Đang thực hiện", paid: 40 },
  { name: "Hợp đồng sửa chữa tổ hợp S-125 Pechora", value: "1.200.000.000", status: "Quyết toán", paid: 100 },
  { name: "Hợp đồng đại tu radar P-18 cho Trung đoàn 291", value: "2.500.000.000", status: "Đang thực hiện", paid: 25 },
  { name: "Hợp đồng sửa chữa thiết bị điện tử tên lửa S-75", value: "800.000.000", status: "Chờ nghiệm thu", paid: 80 },
];

const statusStyle: Record<string, string> = {
  "Đang thực hiện": "bg-blue-50 text-blue-700 border-blue-200",
  "Quyết toán": "bg-green-50 text-green-700 border-green-200",
  "Chờ nghiệm thu": "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function DoanhThuPage() {
  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Hệ thống tích hợp", href: "/he-thong" }, { label: "Doanh thu & Công nợ" }]} />
      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1B3A5C] section-title">Doanh thu & Công nợ</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý hợp đồng và theo dõi tài chính nội bộ</p>
          </div>
          <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-full font-semibold">Phiên bản thử nghiệm</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Tổng giá trị HĐ", value: "9.3 tỷ", icon: DollarSign, color: "#b45309", bg: "#fef3e2" },
            { label: "Đã thanh toán", value: "5.1 tỷ", icon: FileCheck, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Còn phải thu", value: "4.2 tỷ", icon: TrendingUp, color: "#1B3A5C", bg: "#e8eef6" },
            { label: "Quá hạn thanh toán", value: "0.8 tỷ", icon: AlertCircle, color: "#dc2626", bg: "#fef2f2" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border p-4 flex items-center gap-3" style={{ background: bg, borderColor: color + "30" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color + "20" }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-black leading-tight" style={{ color }}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contract list */}
        <div className="space-y-3">
          {contracts.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-[#1B3A5C] text-sm leading-snug">{c.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Giá trị: {c.value} VNĐ</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusStyle[c.status]}`}>{c.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-[#b45309]" style={{ width: `${c.paid}%` }} />
                </div>
                <span className="text-xs text-gray-500 font-medium flex-shrink-0">{c.paid}% đã thanh toán</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
