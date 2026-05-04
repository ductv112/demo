"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Download, FileText, Building2, Calendar, User, Shield, Zap, AlertCircle } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { documents, documentContent } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NAVY  = "#1B3A5C";
const GOLD  = "#D4A843";
const RED   = "#D4A843";

const loaiColors: Record<string, string> = {
  "Quyết định": NAVY,
  "Công văn":   "#2d5a8e",
  "Mệnh lệnh":  RED,
  "Thông báo":  "#8a6a00",
  "Báo cáo":    NAVY,
  "Kế hoạch":   "#2d5a8e",
};

const doMatColors: Record<string, { bg: string; text: string; border: string }> = {
  "Bảo mật cao": { bg: "#fde8eb", text: "#D4A843",  border: "#f0a0ab" },
  "Hạn chế":     { bg: "#fdf5e0", text: "#8a6a00",  border: "#e8d08a" },
  "Nội bộ":      { bg: "#e8eef6", text: "#1B3A5C",  border: "#b8cce0" },
  "Thường":      { bg: "#f3f4f6", text: "#6b7280",  border: "#e5e7eb" },
};

function isBold(line: string): boolean {
  return (
    line.startsWith("Điều ") ||
    line.startsWith("Kính gửi") ||
    line.startsWith("I.") ||
    line.startsWith("II.") ||
    line.startsWith("III.") ||
    line.startsWith("IV.") ||
    line.startsWith("V.") ||
    line === "QUYẾT ĐỊNH:" ||
    line === "LỆNH:" ||
    line.toUpperCase() === line && line.trim().length > 3
  );
}

function isIndented(line: string): boolean {
  return line.startsWith("–") || line.startsWith("Căn cứ") || line.startsWith("Xét đề nghị");
}

function isNumberedItem(line: string): boolean {
  return /^[1-9]\.\s/.test(line);
}

export default function VanBanDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const doc     = documents.find((d) => d.id === id);
  const content = documentContent[id];

  if (!doc) {
    return (
      <PortalLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
          <AlertCircle className="w-16 h-16 opacity-30" />
          <p className="text-lg font-semibold">Không tìm thấy văn bản</p>
          <Link href="/van-ban">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </Button>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const loaiColor  = loaiColors[doc.loaiVanBan] ?? NAVY;
  const doMatStyle = doMatColors[doc.doMat] ?? doMatColors["Thường"];
  const hasContent = !!content;

  return (
    <PortalLayout>
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <Link href="/van-ban">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 hover:border-[#1B3A5C]/30">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> In văn bản
          </Button>
          <Button size="sm" className="gap-2 rounded-xl text-white" style={{ background: NAVY }}>
            <Download className="w-4 h-4" /> Tải xuống
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Main document ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0">

            {/* Document color bar */}
            <div className="h-1.5" style={{ background: loaiColor }} />

            <div className="px-8 py-8 md:px-12 md:py-10 max-w-3xl mx-auto">

              {/* ── Official header ── */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Left: issuing agency */}
                <div className="text-center">
                  {content && (
                    <>
                      <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider leading-tight">
                        {content.coQuanChuQuan}
                      </p>
                      <p className="text-[12px] font-black uppercase tracking-wide mt-0.5" style={{ color: NAVY }}>
                        {content.coQuanBanHanh}
                      </p>
                    </>
                  )}
                  {!content && (
                    <p className="text-[12px] font-black uppercase tracking-wide" style={{ color: NAVY }}>
                      {doc.coQuanBanHanh}
                    </p>
                  )}
                  <div className="mt-1.5 mx-auto w-16 h-0.5" style={{ background: NAVY }} />
                </div>

                {/* Right: national motto */}
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="text-[11px] font-semibold text-gray-600 mt-0.5">Độc lập - Tự do - Hạnh phúc</p>
                  <div className="mt-1.5 mx-auto w-16 h-0.5 bg-gray-400" />
                </div>
              </div>

              {/* ── Document number + type + date ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-black px-3 py-1 rounded-lg text-white"
                    style={{ background: loaiColor }}>
                    {doc.soHieu}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{ background: doMatStyle.bg, color: doMatStyle.text, borderColor: doMatStyle.border }}>
                    {doc.loaiVanBan}
                  </span>
                  {doc.doMat !== "Thường" && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1"
                      style={{ background: doMatStyle.bg, color: doMatStyle.text, borderColor: doMatStyle.border }}>
                      <Shield className="w-3 h-3" /> {doc.doMat}
                    </span>
                  )}
                  {doc.doKhan !== "Thường" && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#fde8eb] text-[#D4A843] border border-[#f0a0ab] flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {doc.doKhan}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 italic">
                  {content?.diaDanh ?? doc.ngayBanHanh}
                </span>
              </div>

              {/* ── Document title ── */}
              <div className="text-center mb-4">
                <h1 className="text-base md:text-lg font-black uppercase tracking-wide leading-snug" style={{ color: NAVY }}>
                  {doc.trichYeu}
                </h1>
              </div>

              {/* Divider */}
              <div className="text-center text-gray-400 text-sm mb-6 font-light tracking-widest">* * *</div>

              {/* ── Body ── */}
              {hasContent ? (
                <div className="space-y-3 text-sm text-gray-800 leading-relaxed">
                  {content.body.map((line, idx) => {
                    const bold      = isBold(line);
                    const indented  = isIndented(line);
                    const numbered  = isNumberedItem(line);
                    return (
                      <p key={idx}
                        className={[
                          bold    ? "font-bold text-gray-900" : "",
                          indented ? "pl-8" : numbered ? "pl-6" : "",
                          "leading-relaxed",
                        ].filter(Boolean).join(" ")}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-3 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <FileText className="w-10 h-10 opacity-30" />
                  <p className="text-sm">Nội dung văn bản không có sẵn trong hệ thống.</p>
                </div>
              )}

              {/* ── Signature + Nơi nhận block ── */}
              {hasContent && (
                <div className="mt-10 flex items-start justify-between gap-6">
                  {/* Left: Nơi nhận */}
                  <div className="text-xs text-gray-600 space-y-0.5 max-w-[200px]">
                    <p className="font-bold text-gray-700 mb-1">Nơi nhận:</p>
                    {content.noiNhan.map((line, idx) => (
                      <p key={idx} className="leading-relaxed">{line}</p>
                    ))}
                  </div>

                  {/* Right: Signature */}
                  <div className="text-center min-w-[160px]">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      {content.chucVuNguoiKy.split("\n").map((part, i) => (
                        <span key={i} className="block">{part}</span>
                      ))}
                    </p>
                    <p className="text-[10px] text-gray-400 italic mb-8">(Đã ký)</p>
                    <p className="text-sm font-black" style={{ color: NAVY }}>{content.nguoiKy}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar: Thông tin văn bản ── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Sidebar header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #0a1f3d 0%, #1B3A5C 100%)" }}>
              <FileText className="w-4 h-4 text-white/70" />
              <span className="text-sm font-bold text-white">Thông tin văn bản</span>
            </div>
            <div className="p-5 space-y-4">
              {([
                { icon: FileText,   label: "Số hiệu",          value: doc.soHieu },
                { icon: FileText,   label: "Loại văn bản",     value: doc.loaiVanBan },
                { icon: Building2,  label: "Cơ quan ban hành", value: doc.coQuanBanHanh },
                { icon: Calendar,   label: "Ngày ban hành",    value: doc.ngayBanHanh },
                { icon: Calendar,   label: "Ngày đến",         value: doc.ngayDen },
                { icon: User,       label: "Người xử lý",      value: doc.nguoiXuLy },
                { icon: Calendar,   label: "Hạn xử lý",        value: doc.hanXuLy },
              ] as { icon: React.ElementType; label: string; value: string }[]).map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 flex items-center gap-1 mb-0.5">
                    <Icon className="w-3 h-3" /> {label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}

              {/* Status */}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Trạng thái</p>
                <Badge
                  className="text-xs font-bold rounded-full"
                  style={
                    doc.trangThai === "Đã xử lý"
                      ? { background: "#e6f4ea", color: "#1e7e34", border: "1px solid #a8d5b5" }
                      : doc.trangThai === "Đang xử lý"
                      ? { background: "#fdf5e0", color: "#8a6a00", border: "1px solid #e8d08a" }
                      : { background: "#e8eef6", color: NAVY,      border: "1px solid #b8cce0" }
                  }>
                  {doc.trangThai}
                </Badge>
              </div>

              {/* Security */}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Độ mật</p>
                <Badge
                  className="text-xs font-bold rounded-full flex items-center gap-1 w-fit"
                  style={{ background: doMatStyle.bg, color: doMatStyle.text, border: `1px solid ${doMatStyle.border}` }}>
                  <Shield className="w-3 h-3" /> {doc.doMat}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Thao tác nhanh</p>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-xl text-sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> In văn bản
            </Button>
            <Button size="sm" className="w-full justify-start gap-2 rounded-xl text-sm text-white" style={{ background: NAVY }}>
              <Download className="w-4 h-4" /> Tải xuống PDF
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
