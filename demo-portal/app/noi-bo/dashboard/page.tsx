"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  LogOut, Shield, Home, Mail, Phone, MapPin, Calendar,
  Building2, Award, Briefcase, Clock, Star,
} from "lucide-react";

const userProfile = {
  name: "Trần Văn Đức",
  initials: "TD",
  rank: "Giám đốc",
  position: "Giám đốc Doanh nghiệp A",
  department: "Ban Giám đốc",
  unit: "Doanh nghiệp A — Tổng công ty Công nghệ",
  phone: "(024) 3827 xxxx — Ext 101",
  email: "tv.duc@doanhnghiepa.vn",
  address: "Phường Yên Viên, Gia Lâm, Hà Nội",
  birthYear: "1975",
  joinDate: "1997",
  currentSince: "2020",
  education: "Thạc sĩ Kỹ thuật Điện tử — Đại học Bách khoa Hà Nội",
  specialization: "Kỹ thuật Monitoring và Điều khiển sản phẩm phần mềm",
  awards: [
    "Giải thưởng Sao Khuê (2018)",
    "Bằng khen của Tổng giám đốc Tập đoàn (2022, 2024)",
    "Cá nhân xuất sắc toàn Tổng công ty (2019, 2021)",
  ],
  experience: [
    { period: "2020 – nay", role: "Giám đốc Doanh nghiệp A" },
    { period: "2015 – 2020", role: "Phó Giám đốc Kỹ thuật — Doanh nghiệp A" },
    { period: "2010 – 2015", role: "Trưởng phòng Kỹ thuật — Doanh nghiệp A" },
    { period: "2003 – 2010", role: "Phó Trưởng phòng Kỹ thuật — Doanh nghiệp A" },
    { period: "1997 – 2003", role: "Kỹ sư Trung tâm Phần mềm Alpha" },
  ],
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <div className="bg-[#1B3A5C] text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#D4A843]" />
            <span className="text-white/70">Hệ thống nội bộ — Doanh nghiệp A</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/"><span className="flex items-center gap-1 hover:text-white/90 text-white/60 cursor-pointer"><Home className="w-3 h-3" /> Trang chủ</span></Link>
            <a href="http://localhost:5173"><span className="flex items-center gap-1 hover:text-red-400 text-white/60 cursor-pointer"><LogOut className="w-3 h-3" /> Đăng xuất</span></a>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-5">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

          {/* Profile header */}
          <motion.div variants={item}>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1B3A5C] to-[#2d5a8e] text-white p-6">
              <div className="absolute right-0 top-0 bottom-0 w-48 opacity-5 bg-gradient-to-l from-white" />
              <div className="relative flex items-center gap-6">
                <div
                  className="w-24 h-24 rounded-xl flex items-center justify-center shrink-0 text-3xl font-black"
                  style={{ background: "linear-gradient(135deg, #D4A843, #f0d890)", color: "#0a1628" }}
                >
                  {userProfile.initials}
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{userProfile.position}</p>
                  <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                  <p className="text-white/60 text-sm mt-1">{userProfile.unit}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Thông tin cơ bản */}
            <motion.div variants={item}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1B3A5C]" />
                  <h2 className="font-bold text-sm text-[#1B3A5C]">Thông tin cơ bản</h2>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { icon: Award, label: "Chức danh", value: userProfile.rank },
                    { icon: Briefcase, label: "Chức vụ", value: userProfile.position },
                    { icon: Building2, label: "Đơn vị", value: userProfile.department },
                    { icon: Calendar, label: "Năm sinh", value: userProfile.birthYear },
                    { icon: Clock, label: "Nhận chức vụ hiện tại", value: userProfile.currentSince },
                    { icon: Calendar, label: "Năm vào công ty", value: userProfile.joinDate },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <row.icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">{row.label}</p>
                        <p className="text-sm font-medium text-[#1B3A5C]">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Liên hệ & Đào tạo */}
            <motion.div variants={item}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#1B3A5C]" />
                  <h2 className="font-bold text-sm text-[#1B3A5C]">Liên hệ & Đào tạo</h2>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { icon: Phone, label: "Điện thoại", value: userProfile.phone },
                    { icon: Mail, label: "Email", value: userProfile.email },
                    { icon: MapPin, label: "Địa chỉ đơn vị", value: userProfile.address },
                    { icon: Award, label: "Trình độ", value: userProfile.education },
                    { icon: Star, label: "Chuyên ngành", value: userProfile.specialization },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <row.icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">{row.label}</p>
                        <p className="text-sm font-medium text-[#1B3A5C]">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quá trình công tác */}
          <motion.div variants={item}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1B3A5C]" />
                <h2 className="font-bold text-sm text-[#1B3A5C]">Quá trình công tác</h2>
              </div>
              <div className="p-5">
                <div className="space-y-0">
                  {userProfile.experience.map((exp, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-3 h-3 rounded-full border-2 ${i === 0 ? "bg-[#D4A843] border-[#D4A843]" : "bg-white border-gray-300"}`} />
                        {i < userProfile.experience.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                      </div>
                      <div className="pb-5">
                        <p className="text-xs text-gray-400 font-medium">{exp.period}</p>
                        <p className={`text-sm font-semibold ${i === 0 ? "text-[#1B3A5C]" : "text-gray-600"}`}>{exp.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Khen thưởng */}
          <motion.div variants={item}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4A843]" />
                <h2 className="font-bold text-sm text-[#1B3A5C]">Khen thưởng</h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {userProfile.awards.map((award, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#D4A843" }} />
                      <p className="text-sm text-gray-700">{award}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
