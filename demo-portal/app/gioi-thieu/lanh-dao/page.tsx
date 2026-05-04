"use client";

import { motion } from "framer-motion";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Award, Mail, Phone } from "lucide-react";

const leaders = [
  {
    name: "Trần Văn Đức",
    title: "Giám đốc Doanh nghiệp A",
    subtitle: "Phó Bí thư Đảng ủy",
    rank: "Giám đốc",
    education: "Tiến sĩ Kỹ thuật Điện tử — Đại học Bách khoa Hà Nội",
    specialty: "Phát triển, vận hành hệ thống monitoring doanh nghiệp",
    initials: "TD",
    color: "bg-[#1B3A5C]",
    phone: "(024) 3864 xx01",
    email: "tv.duc@doanhnghiepa.vn",
    bio: "Trực tiếp chỉ đạo các hoạt động phát triển sản phẩm, triển khai và kế hoạch chiến lược của đơn vị.",
  },
  {
    name: "Đào Ngọc Đại",
    title: "Giám đốc Nhân sự Doanh nghiệp A",
    subtitle: "Bí thư Đảng ủy",
    rank: "Giám đốc",
    education: "Cử nhân Quản trị — Đại học Kinh tế Quốc dân",
    specialty: "Quản trị nhân sự, văn hóa doanh nghiệp, đào tạo nội bộ",
    initials: "ĐĐ",
    color: "bg-[#8b0014]",
    phone: "(024) 3864 xx02",
    email: "dn.dai@doanhnghiepa.vn",
    bio: "Chịu trách nhiệm về công tác nhân sự, văn hóa doanh nghiệp và xây dựng tổ chức vững mạnh toàn diện.",
  },
  {
    name: "Nguyễn Cảnh Toàn",
    title: "Phó Giám đốc Doanh nghiệp A",
    subtitle: "",
    rank: "Phó Giám đốc",
    education: "Thạc sĩ Kỹ thuật — Đại học Bách khoa Hà Nội",
    specialty: "Kỹ thuật, đào tạo nội bộ, cải tiến công nghệ",
    initials: "CT",
    color: "bg-[#2d5a8e]",
    phone: "(024) 3864 xx03",
    email: "nc.toan@doanhnghiepa.vn",
    bio: "Phụ trách công tác kỹ thuật, chỉ đạo các hoạt động đào tạo nội bộ và cải tiến công nghệ.",
  },
];

const formerLeaders = [
  { name: "Trần Văn Đức",     period: "2021 – Nay",             title: "Giám đốc" },
  { name: "Nguyễn Văn Thanh", period: "Giai đoạn 2014",         title: "Giám đốc" },
  { name: "Nguyễn Hữu Thắng", period: "Giai đoạn trước 2014",   title: "Giám đốc" },
];

export default function LanhDaoPage() {
  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Giới thiệu", href: "/gioi-thieu" }, { label: "Ban Giám đốc" }]} />
      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
          <h1 className="text-xl font-bold text-[#1B3A5C] section-title flex items-center gap-2">
            <Award className="w-5 h-5" /> Ban Giám đốc Doanh nghiệp A
          </h1>
          <p className="text-sm text-gray-500 mt-1">Nhiệm kỳ 2022 – 2027</p>
        </div>

        {/* Current leaders */}
        <div className="grid md:grid-cols-3 gap-4">
          {leaders.map((leader, i) => (
            <motion.div key={leader.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Avatar area */}
                <div className={`${leader.color} p-6 flex flex-col items-center`}>
                  <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-[#D4A843] flex items-center justify-center mb-3">
                    <span className="text-2xl font-black text-white">{leader.initials}</span>
                  </div>
                  <h3 className="text-white font-bold text-center leading-snug">{leader.name}</h3>
                  <span className="mt-1.5 text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">
                    {leader.title}
                  </span>
                </div>
                {/* Info */}
                <div className="p-4 space-y-2.5">
                  <div>
                    <p className="text-xs text-gray-500">Học vấn</p>
                    <p className="text-sm font-medium text-gray-800">{leader.education}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Chuyên ngành</p>
                    <p className="text-sm font-medium text-gray-800">{leader.specialty}</p>
                  </div>
                  <p className="text-xs text-gray-600 italic border-t border-gray-100 pt-2">{leader.bio}</p>
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone className="w-3 h-3" /> {leader.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3 h-3" /> {leader.email}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Former leaders */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#1B3A5C] px-5 py-3">
            <h2 className="text-white font-bold flex items-center gap-2">
              <div className="w-1 h-4 bg-[#D4A843] rounded" /> Lãnh đạo qua các thời kỳ
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {formerLeaders.map((l, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#e8eef6] flex items-center justify-center">
                    <Award className="w-4 h-4 text-[#1B3A5C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{l.name}</p>
                    <p className="text-xs text-gray-500">{l.title}</p>
                  </div>
                </div>
                <span className="text-sm text-[#D4A843] font-semibold">{l.period}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
