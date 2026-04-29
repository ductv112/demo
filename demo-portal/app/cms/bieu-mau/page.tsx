"use client";

import { useState, useRef } from "react";
import {
  ClipboardList, Plus, Search, Edit2, Trash2, Check, X,
  FileText, Clock, FileType, Upload, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActionMenu } from "@/components/cms/action-menu";

/* ══════════════════ TYPES ══════════════════ */
type Status = "active" | "draft" | "archived";
type FieldType = "text" | "textarea" | "number" | "date" | "daterange" | "select" | "radio" | "file" | "phone" | "checklist";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  note: string;
}

interface FormItem {
  id: string;
  title: string;
  code: string;
  category: string;
  version: string;
  lastUpdated: string;
  usageCount: number;
  status: Status;
  purpose: string;
  fields: FormField[];
  instructions: string[];
  submissionProcess: string[];
  fileWord: string;
  filePdf: string;
}

/* ══════════════════ CONSTANTS ══════════════════ */
const CATEGORIES = ["Sáng kiến","Tài liệu","Nhân sự","Hậu cần","Kỹ thuật","Quy trình","Dự án","Hành chính"];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text",      label: "Văn bản" },
  { value: "textarea",  label: "Đoạn văn" },
  { value: "number",    label: "Số" },
  { value: "date",      label: "Ngày tháng" },
  { value: "daterange", label: "Khoảng ngày" },
  { value: "select",    label: "Lựa chọn (dropdown)" },
  { value: "radio",     label: "Chọn một (radio)" },
  { value: "file",      label: "Tệp đính kèm" },
  { value: "phone",     label: "Số điện thoại" },
  { value: "checklist", label: "Danh sách kiểm tra" },
];

const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; border: string }> = {
  active:   { label: "Đang dùng", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  draft:    { label: "Nháp",      bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  archived: { label: "Lưu trữ",  bg: "bg-gray-100",  text: "text-gray-500",  border: "border-gray-200"  },
};

const CAT_COLORS: Record<string, string> = {
  "Sáng kiến": "bg-purple-100 text-purple-700", "Tài liệu": "bg-[#e8eef6] text-[#1B3A5C]",
  "Nhân sự":   "bg-green-100 text-green-700",   "Hậu cần":  "bg-orange-100 text-orange-700",
  "Kỹ thuật":  "bg-cyan-100 text-cyan-700",     "Quy trình":"bg-red-100 text-red-700",
  "Dự án":     "bg-indigo-100 text-indigo-700", "Hành chính":"bg-teal-100 text-teal-700",
};

/* ══════════════════ INITIAL DATA ══════════════════ */
const uid = () => Math.random().toString(36).slice(2, 8);
const today = () => { const d = new Date(); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };

const initialForms: FormItem[] = [
  {
    id: "BM001", title: "Phiếu đề xuất - Sáng kiến cải tiến kỹ thuật", code: "BM-SKKT-01",
    category: "Sáng kiến", version: "2.1", lastUpdated: "01/02/2026", usageCount: 38, status: "active",
    purpose: "Biểu mẫu dùng để đăng ký sáng kiến, cải tiến kỹ thuật hoặc cải tiến quy trình công tác tại Nhà máy.",
    fields: [
      { id: "f1", label: "Họ và tên người đề xuất", type: "text",     required: true,  note: "" },
      { id: "f2", label: "Đơn vị / Phòng ban",       type: "text",     required: true,  note: "" },
      { id: "f3", label: "Tên sáng kiến / cải tiến", type: "text",     required: true,  note: "" },
      { id: "f4", label: "Lĩnh vực áp dụng",         type: "select",   required: true,  note: "Kỹ thuật / Hành chính / CNTT / Khác" },
      { id: "f5", label: "Mô tả tình trạng hiện tại", type: "textarea", required: true,  note: "" },
      { id: "f6", label: "Nội dung giải pháp đề xuất",type: "textarea", required: true,  note: "" },
      { id: "f7", label: "Lợi ích kỳ vọng",           type: "textarea", required: true,  note: "" },
      { id: "f8", label: "Thời gian triển khai dự kiến",type: "date",   required: false, note: "" },
      { id: "f9", label: "Tài liệu đính kèm",         type: "file",     required: false, note: "" },
    ],
    instructions: [
      "Điền đầy đủ thông tin vào tất cả các mục bắt buộc (đánh dấu *)",
      "Mô tả sáng kiến cần rõ ràng, cụ thể, có thể kèm theo bản vẽ hoặc sơ đồ",
      "Nêu rõ lợi ích kinh tế–kỹ thuật ước tính nếu sáng kiến được áp dụng",
      "Ký và ghi rõ họ tên vào cuối biểu mẫu trước khi nộp",
    ],
    submissionProcess: [
      "Bước 1: Tải và điền biểu mẫu BM-SKKT-01",
      "Bước 2: Trình Trưởng phòng ký xác nhận",
      "Bước 3: Nộp về Phòng Khoa học–Công nghệ",
      "Bước 4: Hội đồng KH-CN xem xét trong 30 ngày làm việc",
      "Bước 5: Nhận kết quả thẩm định và thông báo khen thưởng (nếu có)",
    ],
    fileWord: "BM-SKKT-01_v2.1.docx", filePdf: "BM-SKKT-01_v2.1.pdf",
  },
  {
    id: "BM003", title: "Đơn xin nghỉ phép - Phép thường niên", code: "BM-HP-01",
    category: "Nhân sự", version: "3.0", lastUpdated: "01/01/2026", usageCount: 267, status: "active",
    purpose: "Đơn đề nghị nghỉ phép thường niên theo quy định của Luật Lao động và Điều lệnh Quân đội.",
    fields: [
      { id: "g1", label: "Họ và tên",                          type: "text",    required: true,  note: "" },
      { id: "g2", label: "Cấp bậc / Chức vụ",                  type: "text",    required: true,  note: "" },
      { id: "g3", label: "Đơn vị / Phòng ban",                  type: "text",    required: true,  note: "" },
      { id: "g4", label: "Thời gian nghỉ từ ngày",              type: "date",    required: true,  note: "" },
      { id: "g5", label: "Đến ngày",                            type: "date",    required: true,  note: "" },
      { id: "g6", label: "Tổng số ngày nghỉ",                   type: "number",  required: true,  note: "" },
      { id: "g7", label: "Địa chỉ liên hệ khi nghỉ phép",       type: "text",    required: true,  note: "" },
      { id: "g8", label: "Số điện thoại liên lạc",              type: "phone",   required: true,  note: "" },
      { id: "g9", label: "Lý do nghỉ phép (nếu có)",            type: "textarea",required: false, note: "" },
      { id: "g10",label: "Người phụ trách công việc thay thế",  type: "text",    required: true,  note: "" },
    ],
    instructions: [
      "Nộp đơn tối thiểu 03 ngày làm việc trước ngày nghỉ dự kiến",
      "Trường hợp nghỉ đột xuất phải thông báo cho Trưởng phòng ngay trong ngày",
      "Bàn giao đầy đủ công việc cho người phụ trách thay thế",
      "Đơn phải có chữ ký xác nhận của Trưởng phòng trước khi nộp",
    ],
    submissionProcess: [
      "Bước 1: Điền và ký đơn",
      "Bước 2: Trình Trưởng phòng ký xác nhận và đề nghị",
      "Bước 3: Nộp về Phòng Hành chính–Nhân sự",
      "Bước 4: Phòng HC–NS trình Giám đốc phê duyệt",
      "Bước 5: Nhận lại đơn đã phê duyệt và lưu một bản tại Phòng HC–NS",
    ],
    fileWord: "BM-HP-01_v3.0.docx", filePdf: "BM-HP-01_v3.0.pdf",
  },
  {
    id: "BM005", title: "Phiếu kiểm tra chất lượng bản vẽ thiết kế", code: "BM-KT-03",
    category: "Kỹ thuật", version: "4.1", lastUpdated: "05/03/2026", usageCount: 156, status: "active",
    purpose: "Biểu mẫu kiểm tra và nghiệm thu chất lượng bản vẽ kỹ thuật trước khi đưa vào quy trình xét duyệt.",
    fields: [
      { id: "h1", label: "Số bản vẽ / Mã hiệu",          type: "text",      required: true,  note: "" },
      { id: "h2", label: "Tên bản vẽ",                    type: "text",      required: true,  note: "" },
      { id: "h3", label: "Dự án / Công trình",             type: "text",      required: true,  note: "" },
      { id: "h4", label: "Người vẽ",                       type: "text",      required: true,  note: "" },
      { id: "h5", label: "Ngày kiểm tra",                  type: "date",      required: true,  note: "" },
      { id: "h6", label: "Người kiểm tra",                 type: "text",      required: true,  note: "" },
      { id: "h7", label: "Danh mục kiểm tra (checklist)",  type: "checklist", required: true,  note: "15 hạng mục theo VTKTQS-QT-04" },
      { id: "h8", label: "Kết luận",                       type: "radio",     required: true,  note: "Đạt / Không đạt / Cần sửa" },
      { id: "h9", label: "Nội dung cần sửa đổi (nếu có)", type: "textarea",  required: false, note: "" },
    ],
    instructions: [
      "Kiểm tra đủ 15 hạng mục, không được bỏ qua hạng mục nào",
      "Ghi cụ thể nội dung lỗi và số tờ bản vẽ bị lỗi vào cột ghi chú",
      "Chỉ ký 'Đạt' khi TẤT CẢ các hạng mục bắt buộc đều được xác nhận OK",
      "Bản gốc lưu tại Phòng KCS, bản photo giao lại cho người vẽ",
    ],
    submissionProcess: [
      "Bước 1: Người vẽ nộp bản vẽ kèm phiếu yêu cầu kiểm tra",
      "Bước 2: Người kiểm tra nhận và tiến hành kiểm tra theo checklist",
      "Bước 3: Ghi kết quả và ký vào phiếu",
      "Bước 4: Nếu 'Không đạt': trả lại người vẽ, thực hiện lại từ Bước 1",
      "Bước 5: Nếu 'Đạt': chuyển bản vẽ lên quy trình xét duyệt tiếp theo",
    ],
    fileWord: "BM-KT-03_v4.1.docx", filePdf: "BM-KT-03_v4.1.pdf",
  },
  {
    id: "BM007", title: "Biểu mẫu báo cáo tiến độ dự án thiết kế hàng tuần", code: "BM-DA-03",
    category: "Dự án", version: "1.2", lastUpdated: "10/02/2026", usageCount: 312, status: "active",
    purpose: "Báo cáo tiến độ dự án thiết kế hàng tuần, giúp Ban Giám đốc theo dõi sát tiến độ thực tế.",
    fields: [
      { id: "i1", label: "Tên dự án",                        type: "text",      required: true,  note: "" },
      { id: "i2", label: "Tuần báo cáo (từ ngày – đến ngày)",type: "daterange", required: true,  note: "" },
      { id: "i3", label: "Người báo cáo",                    type: "text",      required: true,  note: "" },
      { id: "i4", label: "Tiến độ tổng thể (%)",             type: "number",    required: true,  note: "" },
      { id: "i5", label: "Công việc đã hoàn thành trong tuần",type: "textarea", required: true,  note: "" },
      { id: "i6", label: "Công việc kế hoạch tuần tới",      type: "textarea",  required: true,  note: "" },
      { id: "i7", label: "Vướng mắc / Rủi ro",               type: "textarea",  required: false, note: "" },
      { id: "i8", label: "Đề xuất / Kiến nghị",              type: "textarea",  required: false, note: "" },
    ],
    instructions: [
      "Nộp báo cáo trước 17:00 thứ Sáu hàng tuần",
      "Tiến độ cần phản ánh đúng thực tế, không tô hồng hoặc bi quan",
      "Gửi qua email nội bộ cho Trưởng phòng và CC Phòng KH–TH",
    ],
    submissionProcess: [
      "Bước 1: Điền báo cáo theo mẫu BM-DA-03",
      "Bước 2: Gửi email cho Trưởng phòng (CC: Phòng KH–TH)",
      "Bước 3: Trưởng phòng tổng hợp và báo cáo Ban Giám đốc vào thứ Hai tuần sau",
    ],
    fileWord: "BM-DA-03_v1.2.docx", filePdf: "BM-DA-03_v1.2.pdf",
  },
];

/* ══════════════════ DYNAMIC LIST EDITOR ══════════════════ */
function DynList({ items, onChange, placeholder }: {
  items: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const addItem   = () => onChange([...items, ""]);
  const editItem  = (i: number, v: string) => onChange(items.map((x, j) => j === i ? v : x));
  const removeItem= (i: number) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="w-5 h-5 mt-2 rounded-full bg-[#1B3A5C] text-white text-[10px] flex items-center justify-center shrink-0 font-bold select-none">
            {i + 1}
          </div>
          <textarea
            value={item}
            onChange={(e) => editItem(i, e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 resize-none"
          />
          <button type="button" onClick={() => removeItem(i)}
            className="mt-1.5 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem}
        className="flex items-center gap-1.5 text-xs text-[#1B3A5C] hover:underline font-medium py-1">
        <Plus className="w-3.5 h-3.5" /> Thêm mục
      </button>
    </div>
  );
}

/* ══════════════════ FIELD TABLE EDITOR ══════════════════ */
function FieldTableEditor({ fields, onChange }: {
  fields: FormField[]; onChange: (v: FormField[]) => void;
}) {
  const addField = () => onChange([...fields, { id: uid(), label: "", type: "text", required: false, note: "" }]);
  const upd = (id: string, k: keyof FormField, v: string | boolean) =>
    onChange(fields.map((f) => f.id === id ? { ...f, [k]: v } : f));
  const del = (id: string) => onChange(fields.filter((f) => f.id !== id));

  return (
    <div className="space-y-2">
      {fields.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_60px_80px_28px] gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <span>Tên trường</span>
            <span>Loại</span>
            <span className="text-center">Bắt buộc</span>
            <span>Ghi chú</span>
            <span />
          </div>
          <div className="divide-y divide-gray-100">
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[1fr_120px_60px_80px_28px] gap-2 px-3 py-2 items-center hover:bg-gray-50/50">
                <Input value={f.label} onChange={(e) => upd(f.id, "label", e.target.value)}
                  placeholder={`Trường ${i + 1}`}
                  className="h-7 text-xs border-gray-200 rounded-lg" />
                <Select value={f.type} onValueChange={(v) => v && upd(f.id, "type", v as FieldType)}>
                  <SelectTrigger className="h-7 text-xs border-gray-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {FIELD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-center">
                  <button type="button" onClick={() => upd(f.id, "required", !f.required)}
                    className={`w-7 h-4 rounded-full transition-colors ${f.required ? "bg-[#1B3A5C]" : "bg-gray-200"} relative`}>
                    <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-150 ${f.required ? "translate-x-3.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <Input value={f.note} onChange={(e) => upd(f.id, "note", e.target.value)}
                  placeholder="Ghi chú"
                  className="h-7 text-xs border-gray-200 rounded-lg" />
                <button type="button" onClick={() => del(f.id)}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <button type="button" onClick={addField}
        className="flex items-center gap-1.5 text-xs text-[#1B3A5C] hover:underline font-medium py-1">
        <Plus className="w-3.5 h-3.5" /> Thêm trường
      </button>
    </div>
  );
}

/* ══════════════════ FILE UPLOAD ROW ══════════════════ */
function FileUploadRow({
  label, accept, icon: Icon, color, value, onChange,
}: {
  label: string; accept: string; icon: React.ElementType;
  color: string; value: string; onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file.name);
  };

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed transition-colors ${value ? "border-gray-200 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        {value
          ? <p className="text-[11px] text-gray-500 truncate font-mono mt-0.5">{value}</p>
          : <p className="text-[11px] text-gray-400 mt-0.5">Chưa có file — nhấn để chọn</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {value && (
          <button type="button" onClick={() => onChange("")}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <Upload className="w-3 h-3" /> {value ? "Thay file" : "Chọn file"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ══════════════════ FORM EDITOR (FULL PAGE) ══════════════════ */
function FormEditor({ item, onSave, onBack }: {
  item: Partial<FormItem>;
  onSave: (f: FormItem) => void;
  onBack: () => void;
}) {
  const isNew = !item.id;

  const [title,        setTitle]        = useState(item.title              ?? "");
  const [category,     setCategory]     = useState(item.category           ?? CATEGORIES[0]);
  const [status,       setStatus]       = useState<Status>(item.status     ?? "draft");
  const [purpose,      setPurpose]      = useState(item.purpose            ?? "");
  const [instructions, setInstructions] = useState<string[]>(item.instructions       ?? [""]);
  const [submission,   setSubmission]   = useState<string[]>(item.submissionProcess  ?? [""]);
  const [fileWord,     setFileWord]     = useState(item.fileWord           ?? "");
  const [filePdf,      setFilePdf]      = useState(item.filePdf            ?? "");

  const canSave = title.trim();

  const save = () => {
    if (!canSave) return;
    const code = item.code ?? `BM-${Date.now().toString().slice(-4)}`;
    onSave({
      id: item.id ?? `BM${Date.now().toString().slice(-4)}`,
      title: title.trim(), code,
      category, version: item.version ?? "1.0",
      lastUpdated: today(), usageCount: item.usageCount ?? 0,
      status, purpose: purpose.trim(),
      fields: item.fields ?? [],
      instructions: instructions.filter(Boolean),
      submissionProcess: submission.filter(Boolean),
      fileWord, filePdf,
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {isNew ? "Thêm biểu mẫu mới" : "Chỉnh sửa biểu mẫu"}
            </h1>
            {!isNew && item.code && (
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{item.code}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl h-9 px-4 text-sm" onClick={onBack}>
            Hủy
          </Button>
          <Button disabled={!canSave}
            className="rounded-xl h-9 px-5 bg-[#1B3A5C] hover:bg-[#142d4a] text-white font-semibold text-sm shadow-sm"
            onClick={save}>
            {isNew ? "Thêm biểu mẫu" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Thông tin cơ bản */}
          <Card>
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#1B3A5C]" />
              <h2 className="text-sm font-semibold text-gray-800">Thông tin biểu mẫu</h2>
            </div>
            <CardContent className="p-5 space-y-4">
              {/* Tên biểu mẫu */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Tên biểu mẫu <span className="text-red-500">*</span>
                </label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Đơn xin nghỉ phép thường niên"
                  className="rounded-xl border-gray-200" />
              </div>

              {/* Danh mục + Trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Danh mục</label>
                  <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                    <SelectTrigger className="rounded-xl border-gray-200 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Trạng thái</label>
                  <Select value={status} onValueChange={(v) => v && setStatus(v as Status)}>
                    <SelectTrigger className="rounded-xl border-gray-200 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="active">Đang dùng</SelectItem>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="archived">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mục đích sử dụng */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Mục đích sử dụng</label>
                <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Mô tả mục đích và đối tượng sử dụng biểu mẫu..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 resize-none" />
              </div>
            </CardContent>
          </Card>

          {/* Hướng dẫn & Quy trình */}
          <Card>
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B3A5C]" />
              <h2 className="text-sm font-semibold text-gray-800">Hướng dẫn &amp; Quy trình</h2>
            </div>
            <CardContent className="p-5 space-y-5">
              {/* Hướng dẫn điền */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">
                  Hướng dẫn điền
                  <span className="ml-1.5 text-gray-400 font-normal">(từng dòng = 1 mục)</span>
                </label>
                <DynList items={instructions} onChange={setInstructions}
                  placeholder="VD: Điền đầy đủ các mục bắt buộc trước khi nộp..." />
              </div>

              <hr className="border-gray-100" />

              {/* Quy trình nộp */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">
                  Quy trình nộp
                  <span className="ml-1.5 text-gray-400 font-normal">(từng dòng = 1 bước)</span>
                </label>
                <DynList items={submission} onChange={setSubmission}
                  placeholder="VD: Bước 1: Điền và ký đơn..." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — files */}
        <div className="space-y-5">
          <Card>
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#1B3A5C]" />
              <h2 className="text-sm font-semibold text-gray-800">File đính kèm</h2>
            </div>
            <CardContent className="p-5 space-y-3">
              <FileUploadRow
                label="File Word (.docx) — Mẫu điền"
                accept=".doc,.docx"
                icon={FileText}
                color="bg-[#1B3A5C]"
                value={fileWord}
                onChange={setFileWord}
              />
              <FileUploadRow
                label="File PDF — Xem trước & In"
                accept=".pdf"
                icon={FileType}
                color="bg-red-600"
                value={filePdf}
                onChange={setFilePdf}
              />
              <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                Hỗ trợ file <span className="font-mono">.docx</span> và <span className="font-mono">.pdf</span>.
                File Word dùng để tải về điền tay; File PDF dùng để xem trước và in.
              </p>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="rounded-xl bg-[#e8eef6] border border-[#bfdbfe] p-4 space-y-2">
            <p className="text-xs font-semibold text-[#1B3A5C]">Lưu ý khi thêm biểu mẫu</p>
            <ul className="text-[11px] text-[#1B3A5C] space-y-1.5 leading-relaxed">
              <li>• Đặt tên biểu mẫu rõ ràng, đúng nghiệp vụ để dễ tìm kiếm.</li>
              <li>• Nên có đủ cả file Word (để điền) và PDF (để in).</li>
              <li>• Biểu mẫu ở trạng thái <span className="font-semibold">Nháp</span> sẽ không hiển thị trên cổng thông tin.</li>
              <li>• Sau khi thêm, cần đổi sang <span className="font-semibold">Đang dùng</span> để công bố.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function CmsBieuMauPage() {
  const [items, setItems]             = useState<FormItem[]>(initialForms);
  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [editing, setEditing]         = useState<Partial<FormItem> | null>(null);
  const [view, setView]               = useState<"list" | "editor">("list");
  const [deleting, setDeleting]       = useState<FormItem | null>(null);

  const filtered = items.filter((f) => {
    const q = search.toLowerCase();
    if (q && !f.title.toLowerCase().includes(q) && !f.code.toLowerCase().includes(q) && !f.category.toLowerCase().includes(q)) return false;
    if (catFilter !== "all" && f.category !== catFilter) return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    return true;
  });

  const saveForm = (f: FormItem) => {
    setItems((p) => p.find((x) => x.id === f.id) ? p.map((x) => x.id === f.id ? f : x) : [...p, f]);
    setEditing(null);
    setView("list");
  };

  const openEditor = (item: Partial<FormItem>) => {
    setEditing(item);
    setView("editor");
  };

  const closeEditor = () => {
    setEditing(null);
    setView("list");
  };

  /* Full-page editor */
  if (view === "editor" && editing !== null) {
    return (
      <FormEditor
        item={editing}
        onSave={saveForm}
        onBack={closeEditor}
      />
    );
  }
  const confirmDelete = () => {
    if (!deleting) return;
    setItems((p) => p.filter((x) => x.id !== deleting.id));
    setDeleting(null);
  };

  const activeCount   = items.filter((f) => f.status === "active").length;
  const draftCount    = items.filter((f) => f.status === "draft").length;
  const archivedCount = items.filter((f) => f.status === "archived").length;

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Biểu mẫu</h1>
        <Button onClick={() => openEditor({})}
          className="bg-[#1B3A5C] hover:bg-[#142d4a] text-white gap-2 px-5 h-10 rounded-xl text-sm font-semibold shadow-sm">
          <Plus className="w-4 h-4" /> Thêm biểu mẫu
        </Button>
      </div>

      {/* ── Main card ── */}
      <Card className="overflow-hidden">

        {/* Section header */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#1B3A5C]" />
          <h2 className="text-sm font-semibold text-gray-800">Danh sách biểu mẫu</h2>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} biểu mẫu</span>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3 bg-white">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input placeholder="Tìm tên, mã hiệu, danh mục..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm border-gray-200 rounded-lg" />
          </div>
          <Select value={catFilter} onValueChange={(v) => v && setCatFilter(v)}>
            <SelectTrigger className="h-8 text-xs border-gray-200 rounded-lg w-36">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as Status | "all")}>
            <SelectTrigger className="h-8 text-xs border-gray-200 rounded-lg w-32">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang dùng</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="archived">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr style={{ background: "#1B3A5C" }}>
                  <th className="text-left px-5 py-3 text-xs font-bold text-white w-8">STT</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white">Mã hiệu</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white">Tên biểu mẫu</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white">Danh mục</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white">Phiên bản</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white">Cập nhật</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-white">File</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white">Trạng thái</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => {
                  const st = STATUS_CONFIG[f.status];
                  const catCls = CAT_COLORS[f.category] ?? "bg-gray-100 text-gray-600";
                  return (
                    <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-bold">{f.code}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[260px]">
                        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{f.title}</p>
                        {f.purpose && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{f.purpose}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catCls}`}>{f.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-gray-600">v{f.version}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 shrink-0" />{f.lastUpdated}
                        </span>
                      </td>
                      {/* File badges */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {f.fileWord
                            ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#e8eef6] text-[#1B3A5C]">DOC</span>
                            : <span className="text-[9px] text-gray-300">—</span>}
                          {f.filePdf
                            ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">PDF</span>
                            : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${st.bg} ${st.text} ${st.border}`}>
                          {f.status === "active" ? <Check className="w-3 h-3" /> : f.status === "draft" ? <FileText className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <ActionMenu actions={[
                            { icon: Edit2,  label: "Chỉnh sửa", onClick: () => openEditor(f) },
                            { icon: Trash2, label: "Xóa",       onClick: () => setDeleting(f), danger: true, separator: true },
                          ]} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
                <ClipboardList className="w-10 h-10 opacity-25" />
                <p className="text-sm">Không tìm thấy biểu mẫu</p>
              </div>
            )}
          </div>

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Hiển thị <span className="font-semibold text-gray-600">{filtered.length}</span> / {items.length} biểu mẫu
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span><span className="font-semibold text-green-600">{activeCount}</span> đang dùng</span>
                <span><span className="font-semibold text-amber-600">{draftCount}</span> nháp</span>
                <span><span className="font-semibold text-gray-500">{archivedCount}</span> lưu trữ</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* ── Delete confirm ── */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xóa biểu mẫu
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Bạn có chắc muốn xóa biểu mẫu <span className="font-semibold">"{deleting?.title}"</span>?
            Thao tác này không thể hoàn tác.
          </p>
          {deleting && deleting.usageCount > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠ Biểu mẫu này đã được sử dụng {deleting.usageCount} lần.
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleting(null)}>Hủy</Button>
            <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
