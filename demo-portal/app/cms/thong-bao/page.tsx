"use client";

import { useState } from "react";
import {
  Plus, Edit2, Trash2, ArrowLeft, Save, Search, Bell,
} from "lucide-react";
import { ActionMenu } from "@/components/cms/action-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type Status = "published" | "draft";
type AnnType = "normal" | "important" | "urgent";

interface AnnItem {
  id: string;
  title: string;
  content: string;
  type: AnnType;
  author: string;
  date: string;
  time: string;
  status: Status;
}

const initialAnns: AnnItem[] = [
  {
    id: "A001",
    title: "Triệu tập Hội nghị Tổng kết công tác 2025 ngày 20/03/2026",
    content: "Căn cứ Kế hoạch công tác năm 2026 của Nhà máy Z119, Nhà máy tổ chức Hội nghị Tổng kết công tác năm 2025 và triển khai nhiệm vụ năm 2026. Hội nghị được tổ chức vào ngày 20/03/2026 tại Hội trường Nhà máy Z119. Yêu cầu tất cả cán bộ, nhân viên thuộc Nhà máy tham dự đầy đủ, đúng giờ.",
    type: "urgent",
    author: "Ban Lãnh đạo",
    date: "17/03/2026",
    time: "08:00",
    status: "published",
  },
  {
    id: "A002",
    title: "Thông báo lịch trực ban tuần 12/2026",
    content: "Văn phòng Nhà máy thông báo lịch trực ban tuần 12/2026 (từ ngày 16/03 đến 22/03/2026). Đề nghị các cán bộ được phân công trực ban thực hiện nghiêm túc nhiệm vụ theo quy định.",
    type: "normal",
    author: "VP Nhà máy",
    date: "16/03/2026",
    time: "14:30",
    status: "published",
  },
  {
    id: "A003",
    title: "Lịch tiêm phòng định kỳ cho cán bộ nhân viên",
    content: "Phòng Hành chính thông báo lịch tiêm phòng định kỳ cho toàn thể cán bộ, nhân viên của Nhà máy. Thời gian tiêm phòng từ 08:00 đến 11:30 ngày 15/03/2026 tại Phòng Y tế – Tầng 1 nhà A.",
    type: "important",
    author: "Phòng HC",
    date: "12/03/2026",
    time: "09:00",
    status: "published",
  },
  {
    id: "A004",
    title: "Kế hoạch kiểm tra an toàn thông tin nội bộ",
    content: "Phòng Kế hoạch phối hợp với Phòng Công nghệ Thông tin triển khai kiểm tra an toàn thông tin nội bộ theo kế hoạch năm 2026. Các đơn vị chuẩn bị tài liệu và phối hợp theo yêu cầu.",
    type: "important",
    author: "Phòng KH",
    date: "18/03/2026",
    time: "10:00",
    status: "draft",
  },
];

function statusBadge(s: Status) {
  if (s === "published")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Đã đăng</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 border border-gray-200 bg-gray-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Nháp</span>;
}

function typeBadge(t: AnnType) {
  if (t === "urgent")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Khẩn</span>;
  if (t === "important")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 border border-orange-200 bg-orange-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />Quan trọng</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B3A5C] border border-[#bfdbfe] bg-[#e8eef6] px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-[#1B3A5C] inline-block" />Thường</span>;
}

function ConfirmDeleteDialog({
  open, title, onClose, onConfirm,
}: { open: boolean; title: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-4 h-4" /> Xác nhận xóa
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Bạn có chắc chắn muốn xóa <strong>&ldquo;{title}&rdquo;</strong>? Hành động này không thể hoàn tác.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm}>Xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Full-page editor ─── */
function AnnEditor({
  initial,
  onBack,
  onSave,
}: {
  initial: AnnItem | "new";
  onBack: () => void;
  onSave: (data: AnnItem) => void;
}) {
  const blank = initial === "new";
  const src = blank ? null : (initial as AnnItem);

  const [title, setTitle] = useState(src?.title ?? "");
  const [content, setContent] = useState(src?.content ?? "");
  const [type, setType] = useState<AnnType>(src?.type ?? "normal");
  const [author, setAuthor] = useState(src?.author ?? "");
  const [date, setDate] = useState(src?.date ?? "");
  const [time, setTime] = useState(src?.time ?? "");
  const [status, setStatus] = useState<Status>(src?.status ?? "draft");

  const handleSave = () => {
    if (!title.trim()) return;
    if (blank) {
      onSave({
        id: `A${Date.now()}`,
        title, content, type, author,
        date, time, status,
      });
    } else {
      onSave({ ...(src as AnnItem), title, content, type, author, date, time, status });
    }
    onBack();
  };

  const typeOptions: { value: AnnType; label: string }[] = [
    { value: "normal", label: "Thường" },
    { value: "important", label: "Quan trọng" },
    { value: "urgent", label: "Khẩn cấp" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B3A5C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>Hủy</Button>
          <Button
            size="sm"
            className="bg-[#1B3A5C] hover:bg-[#142d4a] text-white gap-1.5"
            onClick={handleSave}
          >
            <Save className="w-3.5 h-3.5" />
            {blank ? "Đăng thông báo" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-black text-[#1B3A5C]">
        {blank ? "Thêm thông báo mới" : "Chỉnh sửa thông báo"}
      </h1>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">
                  Tiêu đề <span className="text-red-500">*</span>
                </p>
                <textarea
                  rows={2}
                  placeholder="Nhập tiêu đề thông báo..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 leading-relaxed"
                />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Nội dung thông báo</p>
                <textarea
                  rows={14}
                  placeholder="Nhập nội dung đầy đủ của thông báo..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trạng thái</p>
              <div className="flex flex-col gap-2">
                {(["published", "draft"] as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${
                      status === s
                        ? "border-[#1B3A5C] bg-[#1B3A5C] text-white"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {s === "published" ? "✓ Đăng ngay" : "◷ Lưu nháp"}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Type */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mức độ</p>
              <div className="flex flex-col gap-2">
                {typeOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setType(value)}
                    className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${
                      type === value
                        ? "border-[#1B3A5C] bg-[#1B3A5C] text-white"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meta */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thông tin</p>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tác giả / Đơn vị</p>
                <Input
                  placeholder="VD: Ban Lãnh đạo"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày ban hành</p>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Giờ</p>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function ThongBaoPage() {
  const [anns, setAnns] = useState<AnnItem[]>(initialAnns);
  const [editing, setEditing] = useState<AnnItem | "new" | null>(null);
  const [deleteItem, setDeleteItem] = useState<AnnItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleSave = (data: AnnItem) => {
    setAnns((prev) => {
      const exists = prev.find((a) => a.id === data.id);
      return exists ? prev.map((a) => (a.id === data.id ? data : a)) : [data, ...prev];
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setAnns((p) => p.filter((a) => a.id !== deleteItem.id));
    setDeleteItem(null);
  };

  if (editing !== null) {
    return (
      <AnnEditor
        initial={editing}
        onBack={() => setEditing(null)}
        onSave={handleSave}
      />
    );
  }

  const filtered = anns.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.type === filterType;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Thông báo</h1>
        <Button
          className="bg-[#1B3A5C] hover:bg-[#142d4a] text-white gap-2 px-5 h-10 rounded-xl text-sm font-semibold shadow-sm"
          onClick={() => setEditing("new")}
        >
          <Plus className="w-4 h-4" /> Thêm thông báo
        </Button>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm thông báo, tác giả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="urgent">Khẩn</option>
            <option value="important">Quan trọng</option>
            <option value="normal">Thường</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Nháp</option>
          </select>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1B3A5C]" />
          <h2 className="text-sm font-semibold text-gray-800">Danh sách thông báo</h2>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} thông báo</span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr style={{ background: "#1B3A5C" }}>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs rounded-tl-xl">Tiêu đề</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Mức độ</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Tác giả</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Ngày</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Trạng thái</th>
                  <th className="px-4 py-3 rounded-tr-xl" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[300px]">
                      <p className="truncate">{a.title}</p>
                      <span className="text-[10px] text-gray-400 font-mono">{a.id}</span>
                    </td>
                    <td className="px-4 py-3">{typeBadge(a.type)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{a.author}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{a.date}</td>
                    <td className="px-4 py-3">{statusBadge(a.status)}</td>
                    <td className="px-4 py-3">
                      <ActionMenu actions={[
                        { icon: Edit2, label: "Chỉnh sửa", onClick: () => setEditing(a) },
                        { icon: Trash2, label: "Xóa thông báo", onClick: () => setDeleteItem(a), danger: true, separator: true },
                      ]} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      Không tìm thấy thông báo nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteItem}
        title={deleteItem?.title ?? ""}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
