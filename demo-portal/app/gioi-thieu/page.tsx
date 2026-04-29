"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  History, Target, Users, Award, Shield as ShieldIcon, Shield,
  CheckCircle2, ChevronDown, Mail, Phone,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const navItems = [
  { id: "lich-su",   label: "Lịch sử hình thành", icon: History, num: "01" },
  { id: "chuc-nang", label: "Chức năng nhiệm vụ",  icon: Target,  num: "02" },
  { id: "co-cau",    label: "Cơ cấu tổ chức",      icon: Users,   num: "03" },
  { id: "lanh-dao",  label: "Lãnh đạo Nhà máy",      icon: Award,   num: "04" },
];

// accent: navy | gold | red | navy-light — all from the website palette
const periods = [
  {
    title: "Giai đoạn thành lập trong chiến tranh (1965–1975)",
    year: "1965",
    badgeBg: "#1B3A5C", badgeText: "#ffffff", badgeBorder: "#1B3A5C",
    cardBg: "#e8eef6",  cardBorder: "#b8cce0", iconColor: "#1B3A5C",
    content: `Năm 1965, đơn vị được thành lập dưới mật danh MZ-495 với nhiệm vụ sửa chữa ra đa và máy chỉ huy phục vụ chiến đấu. Với đội ngũ ban đầu gồm các kỹ sư và thợ lành nghề, đơn vị đã bắt tay ngay vào nhiệm vụ sửa chữa khẩn cấp các khí tài radar, tên lửa phòng không, đóng góp vào Chiến thắng Hà Nội — Điện Biên Phủ trên không.

Trong giai đoạn này, đơn vị hoàn thành sửa chữa hàng trăm lượt khí tài radar và tên lửa S-75 Dvina, đóng góp trực tiếp vào thắng lợi của cuộc kháng chiến chống Mỹ cứu nước. Năm 1987, đơn vị được điều về trực thuộc Quân chủng Phòng không và mang tên Nhà máy Z119.`,
    achievements: ["Sửa chữa khẩn cấp radar và tên lửa S-75", "Đội ngũ kỹ sư và thợ lành nghề sáng lập", "Hoàn thành hàng trăm lượt sửa chữa trong chiến tranh"],
  },
  {
    title: "Giai đoạn củng cố và phát triển (1975–1995)",
    year: "1975",
    badgeBg: "#D4A843", badgeText: "#ffffff", badgeBorder: "#D4A843",
    cardBg: "#fdf5e0",  cardBorder: "#e8d08a", iconColor: "#8a6a00",
    content: `Sau ngày đất nước thống nhất, Nhà máy bước vào giai đoạn tái cơ cấu và phát triển mạnh mẽ. Lực lượng cán bộ được bổ sung đáng kể từ các trường đại học kỹ thuật trong và ngoài nước. Các phân xưởng chuyên môn được thành lập theo hướng chuyên sâu: sửa chữa radar, sửa chữa tên lửa, cơ khí, điện tử.

Nhà máy đảm nhận sửa chữa và đại tu thành công các tổ hợp tên lửa S-125, radar P-18, P-37 phục vụ lực lượng Phòng không Không quân.`,
    achievements: ["Đại tu tổ hợp tên lửa S-125 đầu tiên", "Mở rộng lên 200 cán bộ kỹ thuật", "Hợp tác kỹ thuật với Liên Xô"],
  },
  {
    title: "Giai đoạn hiện đại hóa (1995–2015)",
    year: "1995",
    badgeBg: "#2d5a8e", badgeText: "#ffffff", badgeBorder: "#2d5a8e",
    cardBg: "#eaf0fa",  cardBorder: "#a8bedd", iconColor: "#2d5a8e",
    content: `Bước sang giai đoạn đổi mới, Nhà máy đẩy mạnh ứng dụng công nghệ thông tin vào sửa chữa. Các thiết bị chẩn đoán hiện đại được đưa vào sử dụng. Nhà máy làm chủ công nghệ sửa chữa và đại tu các tổ hợp S-300PMU, radar ST-68 thế hệ mới.`,
    achievements: ["Làm chủ công nghệ sửa chữa S-300PMU", "Đại tu radar ST-68 thế hệ mới", "Nhận Huân chương Quân công hạng Nhất (2012)"],
  },
  {
    title: "Giai đoạn chuyển đổi số (2015–nay)",
    year: "2015",
    badgeBg: "#D4A843", badgeText: "#ffffff", badgeBorder: "#D4A843",
    cardBg: "#fde8eb",  cardBorder: "#f0a0ab", iconColor: "#D4A843",
    content: `Từ năm 2015 đến nay, Nhà máy bước vào giai đoạn chuyển đổi số toàn diện với việc triển khai hệ thống quản lý sửa chữa số, tích hợp phần mềm chẩn đoán và phát triển các công cụ kiểm tra tự động. Năm 2025, kỷ niệm 60 năm Ngày truyền thống (1965–2025), Nhà máy được tặng Huân chương Bảo vệ Tổ quốc hạng Nhì và chính thức ra mắt Cổng thông tin nội bộ.`,
    achievements: ["Triển khai hệ thống quản lý sửa chữa số", "Ra mắt Cổng thông tin nội bộ (2026)", "Kỷ niệm 60 năm Ngày truyền thống (2025)"],
  },
];

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
      "Sửa chữa, đại tu các tổ hợp radar: P-18, 36D6, P-37, ST-68 và các hệ thống tên lửa: S-75, S-125, S-300PMU.",
      "Nghiên cứu, chẩn đoán kỹ thuật, kiểm tra không phá hủy và đánh giá tình trạng khí tài phòng không.",
      "Xây dựng, quản lý và cập nhật hệ thống tiêu chuẩn kỹ thuật, quy chuẩn sửa chữa khí tài phòng không.",
      "Phối hợp với các đơn vị thuộc Sư đoàn 361, 363, 367 trong tiếp nhận và bàn giao khí tài.",
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

const orgChart = {
  top: { name: "BAN GIÁM ĐỐC NHÀ MÁY", sub: "Giám đốc + 02 Phó Giám đốc" },
  departments: [
    {
      group: "Phòng Chức năng",
      color: "bg-[#2d5a8e]",
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
      color: "bg-[#D4A843]",
      units: [
        { name: "PX Sửa chữa Radar (PX1)", sub: "Radar P-18, 36D6, P-37, ST-68" },
        { name: "PX Sửa chữa Tên lửa (PX2)", sub: "S-75, S-125, S-300PMU" },
        { name: "PX Cơ khí (PX3)", sub: "Gia công cơ khí, phục hồi chi tiết" },
        { name: "PX Điện tử (PX4)", sub: "Sửa chữa mạch điện tử, bo mạch" },
        { name: "Phòng KCS & Đảm bảo CL (P.KCS)", sub: "Kiểm tra chất lượng, nghiệm thu" },
      ],
    },
  ],
};

const leaders = [
  {
    name: "Đại tá Trần Văn Đức",
    title: "Giám đốc Nhà máy Z119",
    subtitle: "Phó Bí thư Đảng ủy",
    education: "Tiến sĩ Kỹ thuật Điện tử — Học viện Kỹ thuật Quân sự",
    specialty: "Sửa chữa, đại tu khí tài radar phòng không",
    initials: "TD",
    color: "from-[#1B3A5C] to-[#2d5a8e]",
    phone: "(024) 3864 xx01",
    email: "tv.duc.z119@qpvn.mil.vn",
    bio: "Trực tiếp chỉ đạo các hoạt động sản xuất, sửa chữa và kế hoạch pháp lệnh của đơn vị.",
  },
  {
    name: "Đại tá Đào Ngọc Đại",
    title: "Chính ủy Nhà máy Z119",
    subtitle: "Bí thư Đảng ủy",
    education: "Cử nhân Chính trị — Học viện Chính trị Quân sự",
    specialty: "Công tác Đảng, công tác chính trị, tư tưởng",
    initials: "ĐĐ",
    color: "from-[#8b0014] to-[#c0392b]",
    phone: "(024) 3864 xx02",
    email: "dn.dai.z119@qpvn.mil.vn",
    bio: "Chịu trách nhiệm về công tác Đảng, công tác chính trị, tư tưởng và xây dựng đơn vị vững mạnh toàn diện.",
  },
  {
    name: "Đại tá Nguyễn Cảnh Toàn",
    title: "Phó Giám đốc Nhà máy Z119",
    subtitle: "",
    education: "Thạc sĩ Kỹ thuật — Học viện Kỹ thuật Quân sự",
    specialty: "Kỹ thuật, tập huấn nghiệp vụ, cải tiến công nghệ",
    initials: "CT",
    color: "from-[#2d5a8e] to-[#1e4d8c]",
    phone: "(024) 3864 xx03",
    email: "nc.toan.z119@qpvn.mil.vn",
    bio: "Phụ trách công tác kỹ thuật, chỉ đạo các hoạt động tập huấn nghiệp vụ và cải tiến công nghệ.",
  },
];

const formerLeaders = [
  { name: "Đại tá Trần Văn Đức",     period: "2021 – Nay",             title: "Giám đốc" },
  { name: "Đại tá Nguyễn Văn Thanh", period: "Giai đoạn 2014",         title: "Giám đốc" },
  { name: "Đại tá Nguyễn Hữu Thắng", period: "Giai đoạn trước 2014",   title: "Giám đốc" },
];

/* ─────────────────────────────────────────────
   SECTION HEADING component
───────────────────────────────────────────── */
function SectionHeading({ num, label, icon: Icon }: { num: string; label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-end gap-5 mb-8 pb-5 border-b-2 border-gray-100">
      <span className="text-6xl font-black leading-none select-none"
        style={{ color: "rgba(13,42,79,0.08)", fontVariantNumeric: "tabular-nums" }}>
        {num}
      </span>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-6 h-0.5 bg-[#D4A843]" />
          <span className="text-[#D4A843] text-xs font-semibold uppercase tracking-widest">Mục {num}</span>
        </div>
        <h2 className="text-2xl font-black text-[#1B3A5C] flex items-center gap-2">
          <Icon className="w-6 h-6 shrink-0" /> {label}
        </h2>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function GioiThieuPage() {
  /* Handle hash on mount */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, []);

  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Giới thiệu" }]} />

      {/* ── Hero ── */}
      <div className="relative rounded-xl overflow-hidden mb-8"
        style={{ background: "linear-gradient(135deg, #0a1f3d 0%, #1B3A5C 55%, #2d5a8e 100%)" }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 80% 40%, #D4A843 0%, transparent 50%), radial-gradient(circle at 10% 70%, #D4A843 0%, transparent 40%)" }} />
        {/* Decorative rings */}
        {[200, 350, 500].map((s, i) => (
          <div key={i} className="absolute rounded-full border border-white/5"
            style={{ width: s, height: s, right: -s / 4, top: "50%", transform: "translateY(-50%)" }} />
        ))}
        <div className="relative px-8 py-10 md:px-12 flex items-center gap-8">
          <div className="w-20 h-20 rounded-full border-4 border-[#D4A843] bg-white/10 flex items-center justify-center shrink-0">
            <ShieldIcon className="w-10 h-10 text-[#D4A843]" />
          </div>
          <div className="flex-1">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Quân chủng Phòng không Không quân · Bộ Quốc phòng</p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">NHÀ MÁY Z119</h1>
            <p className="text-blue-200 text-sm mt-1">Thành lập năm 1965 · 60 năm xây dựng và phát triển</p>
            <div className="flex flex-wrap gap-6 mt-4">
              {[["180+", "Cán bộ"], ["20+", "Loại khí tài"], ["1000+", "Lượt sửa chữa"], ["50+", "Năm"]].map(([v, l]) => (
                <div key={l} className="text-center">
                  <p className="text-2xl font-black text-[#f0d890]">{v}</p>
                  <p className="text-xs text-blue-300">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="space-y-20">

          {/* ════════ 01 LỊCH SỬ HÌNH THÀNH ════════ */}
          <section id="lich-su" style={{ scrollMarginTop: "80px" }}>
            <SectionHeading num="01" label="Lịch sử hình thành" icon={History} />

            {/* Overview */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 mb-6 flex items-start gap-5">
              <div className="w-16 h-16 rounded-xl bg-[#1B3A5C] border-4 border-[#D4A843] flex items-center justify-center shrink-0">
                <ShieldIcon className="w-8 h-8 text-[#D4A843]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1B3A5C] text-lg mb-2">Tổng quan</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Nhà máy Z119 là đơn vị sự nghiệp kỹ thuật trực thuộc Quân chủng Phòng không Không quân, Bộ Quốc phòng Việt Nam.
                  Được thành lập năm 1965 dưới mật danh MZ-495, Nhà máy là đơn vị chuyên sửa chữa, đại tu khí tài radar,
                  tên lửa và thiết bị điện tử phòng không cho Quân đội nhân dân Việt Nam.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mt-2">
                  Trải qua 60 năm xây dựng và phát triển, Nhà máy đã sửa chữa và đại tu thành công hàng nghìn lượt khí tài,
                  đóng góp to lớn vào sự nghiệp bảo vệ vùng trời thiêng liêng của Tổ quốc.
                </p>
              </div>
            </div>

            {/* ── Timeline ── */}
            <div className="relative rounded-xl overflow-hidden py-10 px-4 md:px-8"
              style={{ background: "linear-gradient(160deg, #e8eef6 0%, #f0f3f8 60%, #e8eef6 100%)" }}>

              {/* Vertical center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#1B3A5C]/20 via-[#1B3A5C] to-[#1B3A5C]/20" />

              <div className="space-y-0">
                {periods.map((p, i) => {
                  const isLeft = i % 2 === 0;

                  const ContentCard = () => (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                      <h3 className="font-black text-sm mb-2" style={{ color: p.badgeBg }}>{p.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{p.content.split("\n\n")[0]}</p>
                    </div>
                  );

                  const AchievementsCard = () => (
                    <div className="rounded-xl border p-5" style={{ background: p.cardBg, borderColor: p.cardBorder }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: p.iconColor }}>
                        Thành tựu nổi bật
                      </p>
                      <div className="space-y-2">
                        {p.achievements.map((a) => (
                          <div key={a} className="flex items-start gap-2">
                            <Award className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: p.iconColor }} />
                            <span className="text-sm text-gray-700 leading-snug">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );

                  return (
                    <div key={i} className="relative grid grid-cols-2 gap-0 min-h-[200px] items-center">

                      {/* ── Left cell ── */}
                      <div className="pr-10 flex justify-end">
                        <motion.div
                          initial={{ opacity: 0, x: -56 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false, margin: "-80px" }}
                          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="max-w-sm w-full">
                          {isLeft ? <ContentCard /> : <AchievementsCard />}
                        </motion.div>
                      </div>

                      {/* ── Center dot + year badge ── */}
                      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10">
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: false, margin: "-60px" }}
                          transition={{ duration: 0.4, delay: 0.15 }}>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full border-4 border-white shadow-lg"
                              style={{ background: p.badgeBg, outline: `2px solid ${p.badgeBg}`, outlineOffset: "2px" }} />
                            <div className="px-3 py-1 rounded-full border text-xs font-black shadow-sm whitespace-nowrap"
                              style={{ background: p.badgeBg, borderColor: p.badgeBorder, color: p.badgeText }}>
                              {p.year}
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* ── Right cell ── */}
                      <div className="pl-10 flex justify-start">
                        <motion.div
                          initial={{ opacity: 0, x: 56 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false, margin: "-80px" }}
                          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="max-w-sm w-full">
                          {!isLeft ? <ContentCard /> : <AchievementsCard />}
                        </motion.div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Bottom cap */}
              <div className="relative flex justify-center mt-4">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.4 }}
                  className="w-3 h-3 rounded-full bg-[#D4A843] border-2 border-white shadow-md" />
              </div>
            </div>
          </section>

          {/* ════════ 02 CHỨC NĂNG NHIỆM VỤ ════════ */}
          <section id="chuc-nang" style={{ scrollMarginTop: "80px" }}>
            <SectionHeading num="02" label="Chức năng — Nhiệm vụ — Quyền hạn" icon={Target} />
            <p className="text-sm text-gray-500 -mt-4 mb-6">Theo Quyết định số 12/QĐ-BQP của Bộ Quốc phòng</p>

            <div className="space-y-5">
              {functions.map((sec, si) => (
                <motion.div key={sec.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }} transition={{ delay: si * 0.08 }}>
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-[#1B3A5C] px-6 py-3.5 flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#D4A843] rounded-full" />
                      <h3 className="text-white font-bold">{sec.title}</h3>
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {sec.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-[#1B3A5C] shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ════════ 03 CƠ CẤU TỔ CHỨC ════════ */}
          <section id="co-cau" style={{ scrollMarginTop: "80px" }}>
            <SectionHeading num="03" label="Cơ cấu tổ chức" icon={Users} />

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
              <div className="flex flex-col items-center">
                {/* Top box */}
                <motion.div initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }} className="w-full max-w-xs">
                  <div className="rounded-xl bg-[#1B3A5C] border-2 border-[#1B3A5C] p-5 text-center shadow-lg">
                    <p className="font-black text-white tracking-wide">{orgChart.top.name}</p>
                    <p className="text-blue-200 text-xs mt-1">{orgChart.top.sub}</p>
                  </div>
                </motion.div>

                {/* Connector */}
                <div className="w-0.5 h-8 bg-gray-200" />
                <ChevronDown className="w-5 h-5 text-gray-300 -mt-3 mb-3" />

                {/* Two columns */}
                <div className="w-full grid md:grid-cols-2 gap-6 relative">
                  <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gray-200 hidden md:block" />
                  {orgChart.departments.map((dept, di) => (
                    <motion.div key={dept.group} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }} transition={{ delay: 0.15 + di * 0.1 }}>
                      <div className={`rounded-t-xl px-4 py-3 text-center text-white font-bold text-sm ${dept.color}`}>
                        {dept.group}
                      </div>
                      <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden divide-y divide-gray-100">
                        {dept.units.map((unit, ui) => (
                          <div key={ui} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
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
            <div className="mt-5 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#1B3A5C] px-6 py-3.5 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#D4A843] rounded-full" />
                <h3 className="text-white font-bold">Tổng hợp nhân sự</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Đơn vị", "Quân số", "Sĩ quan", "Kỹ sư", "Ghi chú"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
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
                      <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${i === 10 ? "font-bold bg-[#1B3A5C]/5 border-t-2 border-[#1B3A5C]/20" : ""}`}>
                        <td className="px-5 py-3 font-medium text-gray-800">{unit}</td>
                        <td className="px-5 py-3 text-center font-bold text-[#1B3A5C]">{total}</td>
                        <td className="px-5 py-3 text-center text-gray-600">{officers}</td>
                        <td className="px-5 py-3 text-center text-gray-600">{engineers}</td>
                        <td className="px-5 py-3 text-xs text-gray-400">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ════════ 04 LÃNH ĐẠO VIỆN ════════ */}
          <section id="lanh-dao" style={{ scrollMarginTop: "80px" }}>
            <SectionHeading num="04" label="Ban Lãnh đạo Nhà máy" icon={Award} />
            <p className="text-sm text-gray-500 -mt-4 mb-6">Nhiệm kỳ 2022 – 2027</p>

            {/* Current leaders */}
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              {leaders.map((leader, i) => (
                <motion.div key={leader.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }} transition={{ delay: i * 0.1 }}>
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Avatar area */}
                    <div className={`bg-gradient-to-br ${leader.color} p-7 flex flex-col items-center`}>
                      <div className="w-20 h-20 rounded-full bg-white/15 border-4 border-[#D4A843] flex items-center justify-center mb-3">
                        <span className="text-2xl font-black text-white">{leader.initials}</span>
                      </div>
                      <h3 className="text-white font-bold text-center text-sm leading-snug">{leader.name}</h3>
                      <span className="mt-2 text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">
                        {leader.title}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Học vấn</p>
                        <p className="text-sm font-medium text-gray-800">{leader.education}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Chuyên ngành</p>
                        <p className="text-sm font-medium text-gray-800">{leader.specialty}</p>
                      </div>
                      <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-3 leading-relaxed">
                        {leader.bio}
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <a href={`tel:${leader.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#1B3A5C] transition-colors">
                          <Phone className="w-3 h-3" /> {leader.phone}
                        </a>
                        <a href={`mailto:${leader.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#1B3A5C] transition-colors">
                          <Mail className="w-3 h-3" /> {leader.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Former leaders */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#1B3A5C] px-6 py-3.5 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#D4A843] rounded-full" />
                <h3 className="text-white font-bold">Lãnh đạo qua các thời kỳ</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {formerLeaders.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#e8eef6] flex items-center justify-center">
                        <Award className="w-4 h-4 text-[#1B3A5C]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{l.name}</p>
                        <p className="text-xs text-gray-500">{l.title}</p>
                      </div>
                    </div>
                    <span className="text-sm text-[#D4A843] font-bold tabular-nums">{l.period}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
    </PortalLayout>
  );
}
