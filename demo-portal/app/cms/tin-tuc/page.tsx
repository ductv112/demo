"use client";

import { useState } from "react";
import {
  Plus, Edit2, Trash2, Search,
  ArrowLeft, Eye, ImageIcon, Tag, User, AlignLeft, FileText,
} from "lucide-react";
import { ActionMenu } from "@/components/cms/action-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type Status = "published" | "draft" | "pending";

interface NewsItem {
  id: string;
  title: string;
  category: string;
  author: string;
  authorTitle: string;
  date: string;
  views: number;
  status: Status;
  image: string;
  sapo: string;
  body: string;
  tags: string;
  isHot: boolean;
}

const CATEGORIES = ["Tin hoạt động", "Khoa học — Công nghệ", "Dự án sửa chữa", "Hợp tác quốc tế", "Sự kiện nổi bật", "Đảng ủy"];

const initialNews: NewsItem[] = [
  {
    id: "N001",
    title: "Doanh nghiệp A triển khai thành công hệ thống quản lý sửa chữa số",
    category: "Tin hoạt động",
    author: "Phòng Công nghệ thông tin",
    authorTitle: "Doanh nghiệp A",
    date: "15/03/2026",
    views: 342,
    status: "published",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&q=80&auto=format&fit=crop",
    sapo: "Ngày 15/3/2026, Doanh nghiệp A đã chính thức đưa vào vận hành Hệ thống Quản lý Sửa chữa Số (DRMS), đánh dấu bước chuyển mình quan trọng trong công cuộc chuyển đổi số của đơn vị.",
    body: "Sau hơn 18 tháng chuẩn bị và triển khai thử nghiệm, ngày 15/03/2026, Doanh nghiệp A đã chính thức tổ chức lễ khai trương và đưa vào vận hành Hệ thống Quản lý Sửa chữa Số (Digital Repair Management System – DRMS).\n\nHệ thống DRMS cho phép các trung tâm quản lý toàn bộ hồ sơ kỹ thuật từ giai đoạn tiếp nhận đến vận hành và nghiệm thu trên một nền tảng thống nhất.\n\nGiám đốc Trần Văn Đức đánh giá đây là thành quả của quá trình nỗ lực không ngừng của tập thể cán bộ, kỹ sư Doanh nghiệp A trong việc ứng dụng công nghệ cao vào công tác vận hành hệ thống monitoring.",
    tags: "Công nghệ số, DRMS, Chuyển đổi số",
    isHot: true,
  },
  {
    id: "N002",
    title: "Hội thảo khoa học ứng dụng AI trong vận hành hệ thống monitoring Việt Nam",
    category: "Khoa học — Công nghệ",
    author: "Trần Minh Đức",
    authorTitle: "Phòng Nghiên cứu KH",
    date: "12/03/2026",
    views: 218,
    status: "published",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
    sapo: "Hội thảo quy tụ hơn 40 chuyên gia trong và ngoài nước, tập trung thảo luận về tiềm năng ứng dụng trí tuệ nhân tạo vào các giai đoạn chẩn đoán và vận hành sản phẩm phần mềm hiện đại.",
    body: "Ngày 12/03/2026, Doanh nghiệp A tổ chức Hội thảo khoa học với chủ đề \"Ứng dụng trí tuệ nhân tạo trong vận hành hệ thống monitoring\".\n\nCác tham luận tập trung vào các chủ đề: chẩn đoán lỗi tự động bằng thuật toán học máy, ứng dụng AI trong kiểm tra tự động và phân tích tín hiệu monitoring.",
    tags: "AI, Trí tuệ nhân tạo, Vận hành thiết bị",
    isHot: false,
  },
  {
    id: "N003",
    title: "Trung tâm Phần mềm Alpha hoàn thành nâng cấp hệ thống monitoring P-18 cho Phòng Triển khai P291",
    category: "Dự án sửa chữa",
    author: "Lê Quang Nam",
    authorTitle: "Phòng Thiết kế 1",
    date: "10/03/2026",
    views: 195,
    status: "published",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
    sapo: "Sau 8 tháng triển khai, Trung tâm Phần mềm Alpha đã hoàn thành nâng cấp toàn bộ hệ thống monitoring P-18 cho Phòng Triển khai P291, đáp ứng đúng tiến độ và yêu cầu kỹ thuật đề ra.",
    body: "Phòng Thiết kế 1 vừa hoàn thành và bàn giao toàn bộ hệ thống monitoring P-18 sau nâng cấp cho Hội đồng Nghiệm thu kỹ thuật của Tổng công ty.\n\nHồ sơ bao gồm biên bản kiểm tra kỹ thuật, kết quả thử nghiệm các khối chức năng và tài liệu nghiệm thu theo tiêu chuẩn kỹ thuật doanh nghiệp.",
    tags: "Monitoring P-18, Phòng Triển khai P291, Doanh nghiệp A",
    isHot: false,
  },
  {
    id: "N004",
    title: "Kế hoạch đào tạo nâng cao kỹ thuật quý II/2026",
    category: "Tin hoạt động",
    author: "Phạm Thị Lan",
    authorTitle: "Phòng Tổ chức — Cán bộ",
    date: "09/03/2026",
    views: 0,
    status: "draft",
    image: "",
    sapo: "",
    body: "",
    tags: "",
    isHot: false,
  },
  {
    id: "N005",
    title: "Nghiên cứu ứng dụng công nghệ chẩn đoán radar tự động",
    category: "Khoa học — Công nghệ",
    author: "Nguyễn Văn Hùng",
    authorTitle: "Phòng Nghiên cứu KH",
    date: "08/03/2026",
    views: 0,
    status: "pending",
    image: "",
    sapo: "",
    body: "",
    tags: "",
    isHot: false,
  },
];

function statusBadge(s: Status) {
  if (s === "published")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Đã đăng</span>;
  if (s === "draft")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 border border-gray-200 bg-gray-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Nháp</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Chờ duyệt</span>;
}

function emptyItem(): NewsItem {
  return {
    id: `N${Date.now()}`,
    title: "", category: CATEGORIES[0],
    author: "", authorTitle: "",
    date: new Date().toLocaleDateString("vi-VN"),
    views: 0, status: "draft",
    image: "", sapo: "", body: "", tags: "", isHot: false,
  };
}

/* ── Article Editor (full-page) ─────────────────────────────── */
function ArticleEditor({
  item,
  mode,
  onSave,
  onCancel,
}: {
  item: NewsItem;
  mode: "add" | "edit";
  onSave: (data: NewsItem) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<NewsItem>({ ...item });
  const set = <K extends keyof NewsItem>(k: K, v: NewsItem[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const statusOptions: { value: Status; label: string }[] = [
    { value: "draft", label: "Nháp" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "published", label: "Đã đăng" },
  ];

  return (
    <div className="space-y-5">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A5C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700">
            {mode === "add" ? "Bài viết mới" : "Chỉnh sửa bài viết"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Hủy</Button>
          <Button
            size="sm"
            style={{ background: "#1B3A5C" }}
            className="text-white hover:opacity-90"
            onClick={() => onSave(draft)}
          >
            {mode === "add" ? "Tạo bài viết" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Tiêu đề */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                <FileText className="w-3.5 h-3.5" /> Tiêu đề bài viết
              </div>
              <textarea
                rows={2}
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 leading-snug"
              />
            </CardContent>
          </Card>

          {/* Sapo */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                <AlignLeft className="w-3.5 h-3.5" /> Sapo / Mở đầu bài viết
              </div>
              <textarea
                rows={3}
                value={draft.sapo}
                onChange={(e) => set("sapo", e.target.value)}
                placeholder="Đoạn mở đầu ngắn gọn, súc tích (hiển thị nổi bật đầu bài)..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 italic resize-none focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30"
                style={{ borderLeft: "3px solid #D4A843" }}
              />
            </CardContent>
          </Card>

          {/* Ảnh đại diện */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                <ImageIcon className="w-3.5 h-3.5" /> Ảnh đại diện
              </div>
              <Input
                placeholder="/ten-anh.jpg hoặc https://..."
                value={draft.image}
                onChange={(e) => set("image", e.target.value)}
              />
              {draft.image && (
                <div className="relative rounded-lg overflow-hidden h-48 bg-gray-100 border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={draft.image}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nội dung */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                <AlignLeft className="w-3.5 h-3.5" /> Nội dung bài viết
              </div>
              <p className="text-[11px] text-gray-400 -mt-1 mb-2">Mỗi đoạn văn cách nhau bằng một dòng trống (Enter 2 lần)</p>
              <textarea
                rows={18}
                value={draft.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder="Nhập nội dung bài viết đầy đủ..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 leading-relaxed font-sans"
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Right: metadata ── */}
        <div className="space-y-4">

          {/* Trạng thái + nổi bật */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</p>
              <div className="flex flex-col gap-1.5">
                {statusOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => set("status", value)}
                    className={`text-sm px-3 py-2 rounded-lg border text-left transition-colors ${
                      draft.status === value
                        ? "border-[#1B3A5C] bg-[#1B3A5C] text-white font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <input
                  type="checkbox"
                  id="isHot"
                  checked={draft.isHot}
                  onChange={(e) => set("isHot", e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: "#D4A843" }}
                />
                <label htmlFor="isHot" className="text-xs text-gray-600 cursor-pointer">
                  Đánh dấu <strong>Nổi bật</strong>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Danh mục */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Danh mục</p>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => set("category", c)}
                    className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${
                      draft.category === c
                        ? "border-[#1B3A5C] bg-[#e8eef6] text-[#1B3A5C] font-semibold"
                        : "border-gray-100 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tác giả */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <User className="w-3.5 h-3.5" /> Tác giả
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Tên tác giả / Đơn vị</p>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={draft.author}
                  onChange={(e) => set("author", e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Chức vụ / Phòng ban</p>
                <Input
                  placeholder="Phòng Công nghệ thông tin"
                  value={draft.authorTitle}
                  onChange={(e) => set("authorTitle", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <Tag className="w-3.5 h-3.5" /> Tags
              </div>
              <Input
                placeholder="AI, Công nghệ số, Vận hành..."
                value={draft.tags}
                onChange={(e) => set("tags", e.target.value)}
              />
              <p className="text-[11px] text-gray-400">Phân cách bằng dấu phẩy</p>
              {draft.tags && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {draft.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save button */}
          <Button
            className="w-full text-white hover:opacity-90"
            style={{ background: "#1B3A5C" }}
            onClick={() => onSave(draft)}
          >
            {mode === "add" ? "Tạo bài viết" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm delete dialog ──────────────────────────────────── */
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

/* ── Main page ──────────────────────────────────────────────── */
export default function TinTucPage() {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [editing, setEditing] = useState<NewsItem | "new" | null>(null);
  const [deleteItem, setDeleteItem] = useState<NewsItem | null>(null);

  const filtered = news.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || n.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: NewsItem) => {
    if (editing === "new") {
      setNews((p) => [data, ...p]);
    } else {
      setNews((p) => p.map((n) => (n.id === data.id ? data : n)));
    }
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setNews((p) => p.filter((n) => n.id !== deleteItem.id));
    setDeleteItem(null);
  };

  /* Editor view */
  if (editing !== null) {
    const item = editing === "new" ? emptyItem() : editing;
    const mode = editing === "new" ? "add" : "edit";
    return (
      <ArticleEditor
        item={item}
        mode={mode}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  /* List view */
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Tin tức</h1>
        <Button
          className="bg-[#1B3A5C] hover:bg-[#142d4a] text-white gap-2 px-5 h-10 rounded-xl text-sm font-semibold shadow-sm"
          onClick={() => setEditing("new")}
        >
          <Plus className="w-4 h-4" /> Thêm tin tức
        </Button>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm tin tức..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | Status)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="pending">Chờ duyệt</option>
            <option value="draft">Nháp</option>
          </select>
          <p className="text-xs text-gray-400 ml-auto">
            {filtered.length} / {news.length} bài viết
          </p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1B3A5C]" />
          <h2 className="text-sm font-semibold text-gray-800">Danh sách bài viết</h2>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} bài viết</span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr style={{ background: "#1B3A5C" }}>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs rounded-tl-xl">Tiêu đề</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Danh mục</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Tác giả</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Ngày</th>
                  <th className="text-center px-4 py-3 font-bold text-white text-xs">Lượt xem</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Trạng thái</th>
                  <th className="px-4 py-3 rounded-tr-xl" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 max-w-[260px]">
                      <p className="font-medium text-gray-800 truncate">{n.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-mono">{n.id}</span>
                        {n.isHot && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: "#fde8eb", color: "#D4A843" }}>
                            Nổi bật
                          </span>
                        )}
                        {n.sapo && <span className="text-[9px] text-gray-400">· Có sapo</span>}
                        {n.body && <span className="text-[9px] text-gray-400">· Có nội dung</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-[#e8eef6] text-[#1B3A5C] border-[#bfdbfe] text-[10px]">{n.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{n.author || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{n.date}</td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs font-semibold">
                      {n.views > 0 ? n.views.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">{statusBadge(n.status)}</td>
                    <td className="px-4 py-3">
                      <ActionMenu actions={[
                        { icon: Edit2, label: "Chỉnh sửa", onClick: () => setEditing(n) },
                        { icon: Eye, label: "Xem trước", onClick: () => {} },
                        { icon: Trash2, label: "Xóa bài viết", onClick: () => setDeleteItem(n), danger: true, separator: true },
                      ]} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                      Không tìm thấy tin tức nào.
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
