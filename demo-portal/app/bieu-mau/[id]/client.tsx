"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Download, Printer, ClipboardList, FileText, Users,
  Layers, Lightbulb, Wrench, Package, Clock, CheckCircle2, ChevronRight,
  FileType, Eye, X, FileWarning, Shield, Zap, Calendar,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { forms, formContent } from "@/lib/data";

/* ── Constants ── */
const NAVY = "#1B3A5C";
const GOLD = "#D4A843";

/* ── Category config ── */
const catConfig: Record<string, { color: string; bg: string; border: string; bar: string; icon: React.ElementType }> = {
  "Sáng kiến":  { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", bar: "bg-purple-500", icon: Lightbulb },
  "Tài liệu":   { color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   bar: "bg-blue-500",   icon: FileText },
  "Nhân sự":    { color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200",  bar: "bg-green-500",  icon: Users },
  "Hậu cần":    { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-500", icon: Package },
  "Kỹ thuật":   { color: "text-cyan-700",   bg: "bg-cyan-50",   border: "border-cyan-200",   bar: "bg-cyan-500",   icon: Wrench },
  "Quy trình":  { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    bar: "bg-red-500",    icon: Layers },
  "Dự án":      { color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", bar: "bg-indigo-500", icon: ClipboardList },
  "Hành chính": { color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-200",   bar: "bg-teal-500",   icon: FileText },
};

/* ── Form field preview renderer ── */
type FieldDef = { label: string; type: string; required: boolean; note?: string };

function FieldPreview({ field }: { field: FieldDef }) {
  const required = field.required;
  const note = field.note;

  const Label = () => (
    <span className="text-sm font-medium text-gray-800">
      {field.label}
      {required && <span className="text-red-600 ml-0.5">*</span>}
      {note && <span className="text-gray-400 font-normal text-xs ml-1">({note})</span>}
    </span>
  );

  if (field.type === "textarea") {
    return (
      <div className="mb-5">
        <Label />
        <div className="mt-1.5 space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-px bg-gray-300 w-full" style={{ borderBottom: "1px dashed #9ca3af" }} />
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "radio" || field.type === "select") {
    const options = note ? note.split("/").map((s) => s.trim()) : ["Lựa chọn 1", "Lựa chọn 2"];
    return (
      <div className="mb-5">
        <Label />
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          {options.map((opt) => (
            <div key={opt} className="flex items-center gap-1.5 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 shrink-0" />
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checklist") {
    const items = note
      ? []
      : ["Hạng mục kiểm tra 1", "Hạng mục kiểm tra 2", "Hạng mục kiểm tra 3"];
    return (
      <div className="mb-5">
        <Label />
        <div className="mt-2 space-y-1.5 pl-1">
          {(items.length > 0 ? items : ["(xem danh mục đính kèm)"]).map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded border-2 border-gray-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div className="mb-5 flex items-center gap-2 flex-wrap">
        <Label />
        <span className="text-gray-600 font-mono text-sm border-b border-gray-400 min-w-[110px] pb-0.5 text-center">
          &nbsp;&nbsp;/&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      </div>
    );
  }

  if (field.type === "daterange") {
    return (
      <div className="mb-5">
        <Label />
        <div className="mt-1.5 flex items-center gap-2 flex-wrap text-sm text-gray-600">
          <span>Từ ngày</span>
          <span className="border-b border-gray-400 min-w-[100px] pb-0.5 font-mono">&nbsp;</span>
          <span>đến ngày</span>
          <span className="border-b border-gray-400 min-w-[100px] pb-0.5 font-mono">&nbsp;</span>
        </div>
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className="mb-5">
        <Label />
        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg px-3 py-2">
          <FileType className="w-3.5 h-3.5" />
          <span>Đính kèm tài liệu / hồ sơ liên quan</span>
        </div>
      </div>
    );
  }

  if (field.type === "number" || field.type === "phone" || field.type === "rating") {
    return (
      <div className="mb-5 flex items-center gap-2 flex-wrap">
        <Label />
        <span className="border-b border-gray-400 min-w-[160px] pb-0.5 inline-block" />
      </div>
    );
  }

  /* default: text */
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 flex-wrap">
        <Label />
        <span className="border-b border-gray-400 flex-1 min-w-[140px] pb-0.5 inline-block" />
      </div>
    </div>
  );
}

/* ── PDF Preview Modal ── */
function PdfPreviewModal({ filename, onClose }: { filename: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200"
            style={{ background: NAVY }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <FileType className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{filename}</p>
                <p className="text-blue-300 text-[10px]">Xem trước biểu mẫu PDF</p>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="bg-gray-100 flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-24 bg-white rounded-lg shadow-md flex flex-col items-center justify-center border border-gray-200 gap-1">
              <FileType className="w-8 h-8 text-red-500" />
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">PDF</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">{filename}</p>
              <p className="text-xs text-gray-400 mt-1">Trình xem PDF sẽ hiển thị tại đây (cần backend)</p>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-gray-200 flex gap-2 bg-gray-50">
            <Button variant="outline" className="flex-1 gap-2 rounded-xl h-9 text-sm"
              onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> In tài liệu
            </Button>
            <Button className="flex-1 gap-2 rounded-xl h-9 text-sm text-white"
              style={{ backgroundColor: NAVY }} onClick={onClose}>
              <Download className="w-4 h-4" /> Tải về
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Download Toast ── */
function DownloadToast({ filename, onDone }: { filename: string; onDone: () => void }) {
  useState(() => { setTimeout(onDone, 2800); });
  return (
    <motion.div className="fixed top-4 right-4 z-50 bg-[#1B3A5C] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm"
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full shrink-0" />
      <div>
        <p className="font-semibold">Đang tải xuống...</p>
        <p className="text-blue-200 text-[10px] mt-0.5 font-mono">{filename}</p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════ MAIN COMPONENT ════════════════════════════════════════ */
export default function BieuMauDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id     = params.id as string;

  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview]           = useState(false);

  const form    = forms.find((f) => f.id === id);
  const content = formContent[id];

  if (!form) {
    return (
      <PortalLayout>
        <Breadcrumb items={[{ label: "Biểu mẫu & Quy trình", href: "/bieu-mau" }, { label: "Không tìm thấy" }]} />
        <div className="bg-white border border-gray-200 rounded-xl py-24 flex flex-col items-center gap-3 text-gray-400">
          <ClipboardList className="w-14 h-14 opacity-30" />
          <p className="font-semibold text-lg">Biểu mẫu không tồn tại</p>
          <Link href="/bieu-mau">
            <Button variant="outline" className="mt-2 gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </Button>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const cfg     = catConfig[form.category] ?? { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", bar: "bg-gray-300", icon: ClipboardList };
  const CatIcon = cfg.icon;
  const related = forms.filter((f) => f.category === form.category && f.id !== form.id).slice(0, 3);
  const f       = form as typeof form & { fileWord?: string; filePdf?: string };

  return (
    <PortalLayout>
      <Breadcrumb items={[
        { label: "Biểu mẫu & Quy trình", href: "/bieu-mau" },
        { label: form.title },
      ]} />

      {/* Toasts */}
      <AnimatePresence>
        {downloadingFile && <DownloadToast filename={downloadingFile} onDone={() => setDownloadingFile(null)} />}
      </AnimatePresence>
      {pdfPreview && f.filePdf && <PdfPreviewModal filename={f.filePdf} onClose={() => setPdfPreview(false)} />}

      {/* ── Top action bar ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1B3A5C] font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="ml-auto flex gap-2 flex-wrap">
          {f.filePdf && (
            <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9 text-sm"
              onClick={() => setPdfPreview(true)}>
              <Printer className="w-4 h-4" /> In biểu mẫu
            </Button>
          )}
          {f.fileWord && (
            <Button size="sm" variant="outline"
              className="gap-2 rounded-xl h-9 text-sm border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => setDownloadingFile(f.fileWord!)}>
              <FileText className="w-4 h-4" /><span className="hidden sm:inline">Tải</span> .docx
            </Button>
          )}
          {f.filePdf && (
            <Button size="sm" className="gap-2 rounded-xl h-9 text-sm text-white"
              style={{ backgroundColor: NAVY }}
              onClick={() => setDownloadingFile(f.filePdf!)}>
              <Download className="w-4 h-4" /> Tải về biểu mẫu
            </Button>
          )}
          {!f.fileWord && !f.filePdf && (
            <Button size="sm" disabled className="gap-2 rounded-xl h-9 text-sm opacity-50">
              <FileWarning className="w-4 h-4" /> Chưa có file
            </Button>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ════ LEFT COLUMN ════ */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── DOCUMENT PREVIEW CARD ── */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Color bar */}
            <div className={`h-1.5 w-full ${cfg.bar}`} />

            <div className="px-8 py-8 md:px-12 md:py-10 max-w-3xl mx-auto">

              {/* Official header */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Bộ Quốc phòng</p>
                  <p className="text-[11px] font-black uppercase tracking-wide mt-0.5" style={{ color: NAVY }}>
                    Nhà máy Z119
                  </p>
                  <div className="mt-1.5 mx-auto w-14 h-0.5" style={{ background: NAVY }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    Cộng hòa xã hội chủ nghĩa Việt Nam
                  </p>
                  <p className="text-[10px] font-semibold text-gray-600 mt-0.5">Độc lập - Tự do - Hạnh phúc</p>
                  <div className="mt-1.5 mx-auto w-14 h-0.5 bg-gray-400" />
                </div>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="font-mono text-xs font-black px-3 py-1 rounded-lg text-white"
                  style={{ background: NAVY }}>{form.code}</span>
                <Badge className={`border text-xs ${cfg.bg} ${cfg.color} ${cfg.border} flex items-center gap-1`}>
                  <CatIcon className="w-3 h-3" />{form.category}
                </Badge>
                {form.status === "active" && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 border text-xs">Đang áp dụng</Badge>
                )}
                {form.status === "archived" && (
                  <Badge className="bg-gray-100 text-gray-500 border-gray-200 border text-xs">Lưu trữ</Badge>
                )}
                <span className="text-xs text-gray-400 italic ml-auto flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Cập nhật: {form.lastUpdated}
                </span>
              </div>

              {/* Form title */}
              <div className="text-center mb-2">
                <h1 className="text-base md:text-lg font-black uppercase tracking-wide leading-snug"
                  style={{ color: NAVY }}>
                  {form.title}
                </h1>
                <p className="text-xs text-gray-400 mt-1">Phiên bản v{form.version} · {form.usageCount} lần sử dụng</p>
              </div>

              {/* Purpose quote */}
              {content?.purpose && (
                <p className="text-xs text-gray-500 italic text-center border-l-0 mb-4 leading-relaxed px-4">
                  {content.purpose}
                </p>
              )}

              {/* Divider */}
              <div className="text-center text-gray-300 text-sm mb-8 tracking-widest">* * *</div>

              {/* ── Form fields as paper form ── */}
              {content?.fields && content.fields.length > 0 ? (
                <div>
                  {content.fields.map((field, i) => (
                    <FieldPreview key={i} field={field} />
                  ))}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center gap-2 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <FileText className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Chưa có thông tin trường biểu mẫu.</p>
                </div>
              )}

              {/* ── Signature block ── */}
              {content?.fields && content.fields.length > 0 && (
                <div className="mt-10 pt-6 border-t border-dashed border-gray-200 grid grid-cols-2 gap-6 text-xs text-gray-600">
                  <div className="text-center">
                    <p className="font-bold text-gray-700 uppercase text-[10px] tracking-wide mb-1">Người đề nghị</p>
                    <p className="text-gray-400 italic">(Ký và ghi rõ họ tên)</p>
                    <div className="mt-10 border-b border-gray-400 mx-4" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-700 uppercase text-[10px] tracking-wide mb-1">Trưởng phòng xác nhận</p>
                    <p className="text-gray-400 italic">(Ký và đóng dấu)</p>
                    <div className="mt-10 border-b border-gray-400 mx-4" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Hướng dẫn điền ── */}
          {content?.instructions && content.instructions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: NAVY }} /> Hướng dẫn điền
              </h2>
              <ol className="space-y-2.5">
                {content.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{inst}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ── Quy trình nộp ── */}
          {content?.submissionProcess && content.submissionProcess.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: NAVY }} /> Quy trình nộp
              </h2>
              <ol className="space-y-3">
                {content.submissionProcess.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm"
                      style={{ backgroundColor: NAVY }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 mt-0.5">
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* ════ RIGHT SIDEBAR ════ */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Form info card — styled like văn bản sidebar */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #0a1f3d 0%, #1B3A5C 100%)" }}>
              <FileText className="w-4 h-4 text-white/70" />
              <span className="text-sm font-bold text-white">Thông tin biểu mẫu</span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Mã hiệu",        value: form.code },
                { label: "Phiên bản",       value: `v${form.version}` },
                { label: "Danh mục",        value: form.category },
                { label: "Cập nhật",        value: form.lastUpdated },
                { label: "Số lần sử dụng",  value: `${form.usageCount} lần` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Trạng thái</p>
                {form.status === "active"
                  ? <Badge className="bg-green-50 text-green-700 border-green-200 border text-xs font-bold">Đang áp dụng</Badge>
                  : <Badge className="bg-gray-100 text-gray-500 border-gray-200 border text-xs font-bold">Lưu trữ</Badge>}
              </div>
            </div>
          </div>

          {/* File download cards */}
          {(f.fileWord || f.filePdf) && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">File đính kèm</p>
              {f.fileWord && (
                <button type="button" onClick={() => setDownloadingFile(f.fileWord!)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-700 truncate">{f.fileWord}</p>
                    <p className="text-[10px] text-blue-400">Word — có thể chỉnh sửa</p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 shrink-0" />
                </button>
              )}
              {f.filePdf && (
                <button type="button" onClick={() => setPdfPreview(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                    <FileType className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-red-700 truncate">{f.filePdf}</p>
                    <p className="text-[10px] text-red-400">PDF — xem trước & in</p>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-red-400 group-hover:text-red-600 shrink-0" />
                </button>
              )}
            </div>
          )}

          {/* Related forms */}
          {related.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Biểu mẫu liên quan</p>
              <div className="space-y-1.5">
                {related.map((rf) => {
                  const rfCfg = catConfig[rf.category] ?? { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: ClipboardList };
                  const RfIcon = rfCfg.icon;
                  return (
                    <Link key={rf.id} href={`/bieu-mau/${rf.id}`}>
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-200">
                        <div className={`w-7 h-7 rounded-lg ${rfCfg.bg} ${rfCfg.border} border flex items-center justify-center shrink-0`}>
                          <RfIcon className={`w-3.5 h-3.5 ${rfCfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 group-hover:text-[#1B3A5C] line-clamp-2 leading-snug">{rf.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{rf.code}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1B3A5C] shrink-0 mt-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="space-y-2">
            {f.filePdf && (
              <Button className="w-full gap-2 rounded-xl h-10 text-white font-semibold text-sm"
                style={{ backgroundColor: NAVY }}
                onClick={() => setDownloadingFile(f.filePdf!)}>
                <Download className="w-4 h-4" /> Tải về biểu mẫu
              </Button>
            )}
            {f.fileWord && (
              <Button variant="outline" className="w-full gap-2 rounded-xl h-10 text-sm border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => setDownloadingFile(f.fileWord!)}>
                <FileText className="w-4 h-4" /> Tải bản Word (.docx)
              </Button>
            )}
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
