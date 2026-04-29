"use client";

import { useState } from "react";
import {
  Plus, Edit2, Trash2, ArrowLeft, Save, Search, Calendar,
} from "lucide-react";
import { ActionMenu } from "@/components/cms/action-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type EventStatus = "upcoming" | "ongoing" | "ended";

interface EventItem {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  location: string;
  image: string;
  status: EventStatus;
  featured: boolean;
}

const initialEvents: EventItem[] = [
  {
    id: "SK001",
    title: "Nhà máy Z119 kỷ niệm 60 năm Ngày truyền thống và đón nhận Huân chương Bảo vệ Tổ quốc hạng Nhì",
    description: "Sáng 07/8/2025, Nhà máy Z119 tổ chức lễ kỷ niệm 60 năm thành lập (1965–2025) và đón nhận Huân chương Bảo vệ Tổ quốc hạng Nhì. Buổi lễ có sự tham dự của Thượng tướng Lê Huy Vịnh, Thiếu tướng Vũ Hồng Sơn — Tư lệnh Quân chủng PK-KQ. Bộ trưởng Bộ Quốc phòng gửi Thư khen.",
    type: "Lễ kỷ niệm",
    date: "2025-08-07",
    location: "Hội trường Nhà máy",
    image: "",
    status: "ended",
    featured: true,
  },
  {
    id: "SK002",
    title: "Hội thảo khoa học ứng dụng AI trong sửa chữa khí tài phòng không",
    description: "Hội thảo khoa học với chủ đề ứng dụng Trí tuệ nhân tạo và học máy trong quá trình sửa chữa khí tài phòng không hiện đại. Các báo cáo khoa học đến từ Nhà máy Z119, Học viện Kỹ thuật Quân sự và các chuyên gia trong ngành.",
    type: "Hội thảo",
    date: "2026-03-12",
    location: "Hội trường Nhà máy",
    image: "",
    status: "ended",
    featured: false,
  },
  {
    id: "SK003",
    title: "Hội nghị Tổng kết công tác năm 2025",
    description: "Hội nghị tổng kết công tác năm 2025 và triển khai nhiệm vụ năm 2026. Thành phần dự: toàn thể cán bộ chủ chốt các phòng, ban thuộc Nhà máy. Nội dung: đánh giá kết quả công tác năm 2025, xác định phương hướng nhiệm vụ năm 2026.",
    type: "Hội nghị",
    date: "2026-03-20",
    location: "Hội trường Nhà máy Z119",
    image: "",
    status: "upcoming",
    featured: true,
  },
  {
    id: "SK004",
    title: "Triển lãm IMDEX Asia 2026 – Singapore",
    description: "Đoàn đại biểu Nhà máy tham dự Triển lãm Quốc phòng INDO Defence 2026 tại Indonesia. Đây là cơ hội giao lưu, học tập kinh nghiệm và tìm kiếm đối tác hợp tác quốc tế trong lĩnh vực sửa chữa khí tài phòng không.",
    type: "Triển lãm",
    date: "2026-03-06",
    location: "Changi, Singapore",
    image: "",
    status: "ended",
    featured: false,
  },
  {
    id: "SK005",
    title: "Lễ kết nạp đảng viên mới đợt 26/3",
    description: "Lễ kết nạp đảng viên mới nhân kỷ niệm ngày thành lập Đoàn TNCS Hồ Chí Minh 26/3. Chi bộ Nhà máy tổ chức lễ kết nạp cho các quần chúng ưu tú hoàn thành chương trình học cảm tình Đảng.",
    type: "Lễ kỷ niệm",
    date: "2026-03-26",
    location: "Hội trường Nhà máy",
    image: "",
    status: "upcoming",
    featured: false,
  },
  {
    id: "SK006",
    title: "Nghiệm thu đề tài NCKH cấp Bộ Quốc phòng",
    description: "Hội đồng nghiệm thu cấp Bộ Quốc phòng tiến hành đánh giá, nghiệm thu đề tài nghiên cứu khoa học về nâng cao tầm phát hiện cho radar P-37 trong điều kiện nhiễu phức tạp do Nhà máy Z119 chủ trì thực hiện.",
    type: "Hội đồng",
    date: "2026-03-06",
    location: "Bộ Quốc phòng, Hà Nội",
    image: "",
    status: "ended",
    featured: false,
  },
];

const EVENT_TYPES = ["Lễ kỷ niệm", "Hội thảo", "Hội nghị", "Triển lãm", "Hội đồng", "Khác"];

function StatusBadge({ status }: { status: EventStatus }) {
  if (status === "upcoming")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B3A5C] border border-[#bfdbfe] bg-[#e8eef6] px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-[#e8eef6]0 inline-block" />Sắp diễn ra</span>;
  if (status === "ongoing")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Đang diễn ra</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 border border-gray-200 bg-gray-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Đã kết thúc</span>;
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
function EventEditor({
  initial,
  onBack,
  onSave,
}: {
  initial: EventItem | "new";
  onBack: () => void;
  onSave: (data: EventItem) => void;
}) {
  const blank = initial === "new";
  const src = blank ? null : (initial as EventItem);

  const [title, setTitle] = useState(src?.title ?? "");
  const [description, setDescription] = useState(src?.description ?? "");
  const [type, setType] = useState(src?.type ?? "Hội nghị");
  const [date, setDate] = useState(src?.date ?? "");
  const [location, setLocation] = useState(src?.location ?? "");
  const [image, setImage] = useState(src?.image ?? "");
  const [status, setStatus] = useState<EventStatus>(src?.status ?? "upcoming");
  const [featured, setFeatured] = useState(src?.featured ?? false);

  const handleSave = () => {
    if (!title.trim()) return;
    if (blank) {
      onSave({
        id: `SK${Date.now()}`,
        title, description, type, date, location, image, status, featured,
      });
    } else {
      onSave({ ...(src as EventItem), title, description, type, date, location, image, status, featured });
    }
    onBack();
  };

  const statusOptions: { value: EventStatus; label: string }[] = [
    { value: "upcoming", label: "Sắp diễn ra" },
    { value: "ongoing", label: "Đang diễn ra" },
    { value: "ended", label: "Đã kết thúc" },
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
            {blank ? "Tạo sự kiện" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-black text-[#1B3A5C]">
        {blank ? "Thêm sự kiện mới" : "Chỉnh sửa sự kiện"}
      </h1>

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
                  placeholder="Nhập tiêu đề sự kiện..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 leading-relaxed"
                />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Mô tả chi tiết</p>
                <textarea
                  rows={12}
                  placeholder="Nhập mô tả nội dung sự kiện..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 leading-relaxed"
                />
              </div>

              {/* Image */}
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Ảnh sự kiện (URL)</p>
                <Input
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="text-xs"
                />
                {image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="preview" className="w-full h-48 object-cover" />
                  </div>
                )}
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
                {statusOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStatus(value)}
                    className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${
                      status === value
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

          {/* Type */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Loại sự kiện</p>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Time & location */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thời gian & Địa điểm</p>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày diễn ra</p>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Địa điểm</p>
                <Input
                  placeholder="VD: Hội trường Nhà máy"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured */}
          <Card>
            <CardContent className="p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#1B3A5C]"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Sự kiện nổi bật</p>
                  <p className="text-xs text-gray-400">Hiển thị ở vị trí ưu tiên trên cổng thông tin</p>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function SuKienPage() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editing, setEditing] = useState<EventItem | "new" | null>(null);
  const [deleteItem, setDeleteItem] = useState<EventItem | null>(null);

  const filtered = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || e.type === filterType;
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleSave = (data: EventItem) => {
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === data.id);
      return exists ? prev.map((e) => (e.id === data.id ? data : e)) : [data, ...prev];
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setEvents((p) => p.filter((e) => e.id !== deleteItem.id));
    setDeleteItem(null);
  };

  if (editing !== null) {
    return (
      <EventEditor
        initial={editing}
        onBack={() => setEditing(null)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Sự kiện</h1>
        <Button
          className="bg-[#1B3A5C] hover:bg-[#142d4a] text-white gap-2 px-5 h-10 rounded-xl text-sm font-semibold shadow-sm"
          onClick={() => setEditing("new")}
        >
          <Plus className="w-4 h-4" /> Thêm sự kiện
        </Button>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm sự kiện..."
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
            <option value="all">Tất cả loại</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ongoing">Đang diễn ra</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1B3A5C]" />
          <h2 className="text-sm font-semibold text-gray-800">Danh sách sự kiện</h2>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} sự kiện</span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr style={{ background: "#1B3A5C" }}>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs rounded-tl-xl">Tiêu đề</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Loại</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Ngày</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Địa điểm</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Trạng thái</th>
                  <th className="text-center px-4 py-3 font-bold text-white text-xs">Nổi bật</th>
                  <th className="px-4 py-3 rounded-tr-xl" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[260px]">
                      <p className="truncate">{ev.title}</p>
                      <span className="text-[10px] text-gray-400 font-mono">{ev.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-[#e8eef6] text-[#1B3A5C] border-[#bfdbfe] text-[10px]">{ev.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{ev.date}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px]">
                      <p className="truncate">{ev.location}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                    <td className="px-4 py-3 text-center">
                      {ev.featured ? (
                        <span className="text-yellow-500 text-base">★</span>
                      ) : (
                        <span className="text-gray-300 text-base">☆</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu actions={[
                        { icon: Edit2, label: "Chỉnh sửa", onClick: () => setEditing(ev) },
                        { icon: Trash2, label: "Xóa sự kiện", onClick: () => setDeleteItem(ev), danger: true, separator: true },
                      ]} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                      Không tìm thấy sự kiện nào.
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
