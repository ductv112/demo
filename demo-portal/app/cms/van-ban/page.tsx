"use client";

import { useState } from "react";
import {
  Plus, Edit2, Trash2, Search, ArrowLeft, Save, FileText,
} from "lucide-react";
import { ActionMenu } from "@/components/cms/action-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface DocItem {
  id: string;
  soHieu: string;
  trichYeu: string;
  loai: string;
  coQuan: string;
  ngay: string;
  body: string;
}

const initialDocs: DocItem[] = [
  {
    id: "VB001",
    soHieu: "25/QĐ-VTK",
    trichYeu: "Quyết định phân công nhiệm vụ đại tu radar 36D6 năm 2026",
    loai: "Quyết định",
    coQuan: "Nhà máy Z119",
    ngay: "14/03/2026",
    body: "Căn cứ Quyết định số 120/QĐ-BTL ngày 10/01/2026 của Bộ Tư lệnh PK-KQ về kế hoạch sửa chữa khí tài năm 2026.\nCăn cứ đề nghị của Trưởng phòng Kỹ thuật ngày 12/03/2026.\n\nQUYẾT ĐỊNH:\n\nĐiều 1. Phân công nhiệm vụ đại tu radar 36D6 cho Phân xưởng 1 chủ trì, phối hợp với Phân xưởng Điện tử và Phòng Kỹ thuật thực hiện.\nĐiều 2. Thời gian hoàn thành đại tu: trước ngày 30/09/2026.\nĐiều 3. Kinh phí thực hiện theo dự toán được phê duyệt tại Phụ lục kèm theo.\nĐiều 4. Quyết định này có hiệu lực kể từ ngày ký.",
  },
  {
    id: "VB002",
    soHieu: "102/CV-BTL",
    trichYeu: "Về việc tăng cường bảo mật thông tin trong hệ thống nội bộ",
    loai: "Công văn",
    coQuan: "Bộ Tư lệnh PK-KQ",
    ngay: "12/03/2026",
    body: "Kính gửi: Nhà máy Z119.\n\nBộ Tư lệnh PK-KQ thông báo về việc tăng cường công tác bảo mật thông tin trong các hệ thống nội bộ theo Chỉ thị theo Chỉ thị số 08/CT-BQP ngày 05/03/2026 của Bộ Quốc phòng.\n\n– Yêu cầu các đơn vị trực thuộc rà soát, kiểm tra định kỳ tất cả tài khoản truy cập hệ thống.\n– Cập nhật mật khẩu theo quy định mới (tối thiểu 12 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt).\n– Báo cáo kết quả thực hiện về Phòng Công nghệ Thông tin – BTL trước ngày 25/03/2026.",
  },
  {
    id: "VB003",
    soHieu: "07/TB-BTL",
    trichYeu: "Thông báo kế hoạch kiểm tra định kỳ các đơn vị trực thuộc năm 2026",
    loai: "Thông báo",
    coQuan: "Bộ Tư lệnh PK-KQ",
    ngay: "10/03/2026",
    body: "Căn cứ Kế hoạch công tác năm 2026 của Bộ Tư lệnh PK-KQ.\n\nBộ Tư lệnh PK-KQ thông báo kế hoạch kiểm tra định kỳ các đơn vị trực thuộc năm 2026 như sau:\n\n1. Thời gian: Quý II/2026 (từ tháng 4 đến tháng 6/2026).\n2. Nội dung kiểm tra: công tác chính trị tư tưởng, kỷ luật và kỷ cương, thực hiện các nhiệm vụ được giao, quản lý tài chính và tài sản.\n3. Thành phần đoàn kiểm tra: theo quyết định riêng của Tư lệnh.\n4. Các đơn vị chuẩn bị báo cáo và hồ sơ theo hướng dẫn tại Phụ lục đính kèm.",
  },
  {
    id: "VB004",
    soHieu: "15/ML-VTK",
    trichYeu: "Mệnh lệnh triển khai giai đoạn 2 dự án đại tu radar P-18",
    loai: "Mệnh lệnh",
    coQuan: "Nhà máy Z119",
    ngay: "08/03/2026",
    body: "LỆNH:\n\nCăn cứ hợp đồng ký kết giữa Nhà máy Z119 và Cục Kỹ thuật PK-KQ ngày 15/01/2026 về dự án đại tu radar P-18 cho Trung đoàn 291.\n\nĐiều 1. Triển khai giai đoạn 2 dự án đại tu radar P-18 kể từ ngày 10/03/2026.\nĐiều 2. Phân xưởng Sửa chữa Radar chủ trì, các phòng liên quan phối hợp theo phân công tại Kế hoạch chi tiết.\nĐiều 3. Thời gian hoàn thành giai đoạn 2: 30/06/2026.",
  },
  {
    id: "VB005",
    soHieu: "38/BC-P1",
    trichYeu: "Báo cáo tiến độ đại tu tổ hợp S-125 Pechora - Phân xưởng Tên lửa",
    loai: "Báo cáo",
    coQuan: "PX Sửa chữa Tên lửa",
    ngay: "05/03/2026",
    body: "Kính gửi: Giám đốc Nhà máy Z119.\n\nPX Sửa chữa Tên lửa báo cáo tiến độ thực hiện nhiệm vụ đại tu tổ hợp tên lửa S-125 Pechora tính đến ngày 05/03/2026:\n\nI. Kết quả đã đạt được\n– Hoàn thành 85% sửa chữa bệ phóng và hệ thống nạp đạn.\n– Hoàn thành 70% sửa chữa hệ thống dẫn đường.\n– Đang thực hiện sửa chữa hệ thống điều khiển hỏa lực (đạt 45%).\n\nII. Khó khăn, vướng mắc\n– Thiếu linh kiện thay thế cho khối điều khiển. Đề nghị Nhà máy hỗ trợ tìm kiếm từ nguồn đối tác quốc tế.\n\nIII. Kế hoạch thời gian tới\n– Hoàn thiện bệ phóng trước ngày 20/03/2026.\n– Hoàn thành hệ thống dẫn đường trước ngày 15/04/2026.",
  },
  {
    id: "VB006",
    soHieu: "12/KH-VTK",
    trichYeu: "Kế hoạch sản xuất tháng 3 năm 2026 của Nhà máy Z119",
    loai: "Kế hoạch",
    coQuan: "Nhà máy Z119",
    ngay: "01/03/2026",
    body: "Căn cứ Kế hoạch công tác năm 2026 của Nhà máy Z119.\n\nNhà máy Z119 ban hành kế hoạch công tác tháng 3/2026 như sau:\n\n1. Tiếp tục triển khai sửa chữa, đại tu các khí tài đang thực hiện theo tiến độ.\n2. Tổ chức Hội nghị Tổng kết công tác năm 2025 (ngày 20/3/2026).\n3. Kiểm tra an toàn thông tin nội bộ theo kế hoạch.\n4. Tiếp đón đoàn kiểm tra của Bộ Tư lệnh PK-KQ (dự kiến cuối tháng 3).\n5. Hoàn thiện báo cáo tiến độ gửi Cục Kỹ thuật PK-KQ trước ngày 25/03/2026.",
  },
  {
    id: "VB007",
    soHieu: "05/KH-VTK",
    trichYeu: "Kế hoạch đào tạo, bồi dưỡng cán bộ kỹ thuật năm 2026",
    loai: "Kế hoạch",
    coQuan: "Nhà máy Z119",
    ngay: "28/02/2026",
    body: "Căn cứ nhu cầu đào tạo cán bộ kỹ thuật và nguồn kinh phí được phân bổ năm 2026.\n\nNhà máy Z119 ban hành kế hoạch đào tạo, bồi dưỡng cán bộ kỹ thuật năm 2026:\n\n1. Cử 5 cán bộ học khóa chẩn đoán kỹ thuật radar nâng cao tại Hà Nội (Quý I/2026).\n2. Tổ chức 2 khóa bồi dưỡng nội bộ về ứng dụng công nghệ mới trong sửa chữa khí tài (Quý II và Quý III).\n3. Cử 2 cán bộ học tiếng Anh chuyên ngành kỹ thuật (cả năm).\n4. Tham quan học tập tại cơ sở sửa chữa khí tài trong nước 1 chuyến (Quý III).",
  },
];

const DOC_TYPES = ["Quyết định", "Công văn", "Mệnh lệnh", "Thông báo", "Báo cáo", "Kế hoạch"];

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
function DocEditor({
  initial,
  onBack,
  onSave,
}: {
  initial: DocItem | "new";
  onBack: () => void;
  onSave: (data: DocItem) => void;
}) {
  const blank = initial === "new";
  const src = blank ? null : (initial as DocItem);

  const [soHieu, setSoHieu] = useState(src?.soHieu ?? "");
  const [trichYeu, setTrichYeu] = useState(src?.trichYeu ?? "");
  const [loai, setLoai] = useState(src?.loai ?? "Quyết định");
  const [coQuan, setCoQuan] = useState(src?.coQuan ?? "");
  const [ngay, setNgay] = useState(src?.ngay ?? "");
  const [body, setBody] = useState(src?.body ?? "");

  const handleSave = () => {
    if (!soHieu.trim() || !trichYeu.trim()) return;
    if (blank) {
      onSave({ id: `VB${Date.now()}`, soHieu, trichYeu, loai, coQuan, ngay, body });
    } else {
      onSave({ ...(src as DocItem), soHieu, trichYeu, loai, coQuan, ngay, body });
    }
    onBack();
  };

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
            {blank ? "Tạo văn bản" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-black text-[#1B3A5C]">
        {blank ? "Thêm văn bản mới" : "Chỉnh sửa văn bản"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">
                  Trích yếu <span className="text-red-500">*</span>
                </p>
                <textarea
                  rows={2}
                  placeholder="Nhập trích yếu nội dung văn bản..."
                  value={trichYeu}
                  onChange={(e) => setTrichYeu(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500 font-medium">Nội dung văn bản</p>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Định dạng văn bản hành chính (mỗi đoạn một dòng)
                  </span>
                </div>
                <textarea
                  rows={20}
                  placeholder={"Căn cứ ...\n\nQUYẾT ĐỊNH:\n\nĐiều 1. ...\nĐiều 2. ...\n\nNơi nhận:\n– Lưu VT."}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          {/* Document info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thông tin văn bản</p>
              <div>
                <p className="text-xs text-gray-500 mb-1">Số hiệu <span className="text-red-500">*</span></p>
                <Input
                  placeholder="VD: 25/QĐ-VTK"
                  value={soHieu}
                  onChange={(e) => setSoHieu(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Loại văn bản</p>
                <select
                  value={loai}
                  onChange={(e) => setLoai(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cơ quan ban hành</p>
                <Input
                  placeholder="VD: Nhà máy Z119 / BTL PK-KQ"
                  value={coQuan}
                  onChange={(e) => setCoQuan(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày ban hành</p>
                <Input
                  type="date"
                  value={ngay}
                  onChange={(e) => setNgay(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Formatting hint */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Hướng dẫn định dạng</p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li><span className="font-mono text-gray-700">Điều 1.</span> → In đậm tự động</li>
                <li><span className="font-mono text-gray-700">Kính gửi</span> → In đậm</li>
                <li><span className="font-mono text-gray-700">Căn cứ</span> → Thụt lề trái</li>
                <li><span className="font-mono text-gray-700">– Nội dung</span> → Thụt lề</li>
                <li><span className="font-mono text-gray-700">1. Mục</span> → Danh sách</li>
                <li><span className="font-mono text-gray-700">CHỮ HOA</span> → In đậm</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function VanBanPage() {
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState("all");
  const [editing, setEditing] = useState<DocItem | "new" | null>(null);
  const [deleteItem, setDeleteItem] = useState<DocItem | null>(null);

  const filtered = docs.filter((d) => {
    const matchSearch =
      d.trichYeu.toLowerCase().includes(search.toLowerCase()) ||
      d.soHieu.toLowerCase().includes(search.toLowerCase());
    const matchLoai = filterLoai === "all" || d.loai === filterLoai;
    return matchSearch && matchLoai;
  });

  const handleSave = (data: DocItem) => {
    setDocs((prev) => {
      const exists = prev.find((d) => d.id === data.id);
      return exists ? prev.map((d) => (d.id === data.id ? data : d)) : [data, ...prev];
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setDocs((p) => p.filter((d) => d.id !== deleteItem.id));
    setDeleteItem(null);
  };

  if (editing !== null) {
    return (
      <DocEditor
        initial={editing}
        onBack={() => setEditing(null)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Văn bản – Chỉ đạo</h1>
        <Button
          className="bg-[#1B3A5C] hover:bg-[#142d4a] text-white gap-2 px-5 h-10 rounded-xl text-sm font-semibold shadow-sm"
          onClick={() => setEditing("new")}
        >
          <Plus className="w-4 h-4" /> Thêm văn bản
        </Button>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm văn bản..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterLoai}
            onChange={(e) => setFilterLoai(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
          >
            <option value="all">Tất cả loại</option>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1B3A5C]" />
          <h2 className="text-sm font-semibold text-gray-800">Danh sách văn bản</h2>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} văn bản</span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr style={{ background: "#1B3A5C" }}>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs rounded-tl-xl">Số hiệu</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Trích yếu</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Loại</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Cơ quan ban hành</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs">Ngày</th>
                  <th className="px-4 py-3 rounded-tr-xl" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
                      <p>{doc.soHieu}</p>
                      <span className="text-[10px] text-gray-400">{doc.id}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[240px]">
                      <p className="truncate text-xs">{doc.trichYeu}</p>
                      {doc.body && (
                        <span className="text-[10px] text-gray-400">Có nội dung</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-[#e8eef6] text-[#1B3A5C] border-[#bfdbfe] text-[10px]">{doc.loai}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[140px]">
                      <p className="truncate">{doc.coQuan}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{doc.ngay}</td>
                    <td className="px-4 py-3">
                      <ActionMenu actions={[
                        { icon: Edit2, label: "Chỉnh sửa", onClick: () => setEditing(doc) },
                        { icon: Trash2, label: "Xóa văn bản", onClick: () => setDeleteItem(doc), danger: true, separator: true },
                      ]} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      Không tìm thấy văn bản nào.
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
        title={deleteItem?.soHieu ?? ""}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
