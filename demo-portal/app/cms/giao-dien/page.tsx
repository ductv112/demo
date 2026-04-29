"use client";

import { useState } from "react";
import {
  Palette, Type, Layout, Eye, Save, RotateCcw,
  Check, ChevronUp, ChevronDown, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ── Types ── */
type ThemeColor = { label: string; value: string };

const presetPalettes: { name: string; primary: string; accent: string; red: string }[] = [
  { name: "Mặc định (PK-KQ)", primary: "#1B3A5C", accent: "#D4A843", red: "#D4A843" },
  { name: "Xanh dương đậm",      primary: "#1e3a6e", accent: "#f59e0b", red: "#dc2626" },
  { name: "Xanh lá quân sự",     primary: "#1a3a2a", accent: "#d4a017", red: "#b91c1c" },
  { name: "Xám thép",            primary: "#2d3748", accent: "#e2a91a", red: "#D4A843" },
];

const fontOptions = [
  { label: "Inter (Mặc định)", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Be Vietnam Pro", value: "Be Vietnam Pro" },
  { label: "Open Sans", value: "Open Sans" },
];

const defaultSections = [
  { id: "hero",          label: "Banner / Hero slider",         enabled: true },
  { id: "stats",         label: "Thống kê nhanh (4 số liệu)",   enabled: true },
  { id: "featured_news", label: "Tin tức nổi bật",              enabled: true },
  { id: "news_grid",     label: "Lưới tin tức mới nhất",        enabled: true },
  { id: "announcements", label: "Thông báo nội bộ",             enabled: true },
  { id: "documents",     label: "Văn bản mới nhất",             enabled: true },
  { id: "quick_links",   label: "Liên kết nhanh",               enabled: true },
  { id: "systems",       label: "Phần mềm nghiệp vụ",           enabled: false },
];

export default function GiaoDienPage() {
  const [primaryColor, setPrimaryColor] = useState("#1B3A5C");
  const [accentColor,  setAccentColor]  = useState("#D4A843");
  const [redColor,     setRedColor]     = useState("#D4A843");
  const [selectedFont, setSelectedFont] = useState(fontOptions[0].value);
  const [sections, setSections]         = useState(defaultSections);
  const [saved, setSaved]               = useState(false);

  const applyPreset = (p: typeof presetPalettes[0]) => {
    setPrimaryColor(p.primary);
    setAccentColor(p.accent);
    setRedColor(p.red);
  };

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setPrimaryColor("#1B3A5C");
    setAccentColor("#D4A843");
    setRedColor("#D4A843");
    setSelectedFont(fontOptions[0].value);
    setSections(defaultSections);
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Color palette ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#1B3A5C]" />
          <h2 className="font-semibold text-gray-800">Bảng màu chủ đề</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Preset quick-apply */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Bộ màu nhanh</p>
            <div className="grid grid-cols-2 gap-2">
              {presetPalettes.map((p) => {
                const active = p.primary === primaryColor && p.accent === accentColor;
                return (
                  <button key={p.name} onClick={() => applyPreset(p)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      active ? "border-[#1B3A5C] bg-[#1B3A5C]/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="flex gap-1 shrink-0">
                      <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: p.primary }} />
                      <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: p.accent }} />
                      <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: p.red }} />
                    </div>
                    <span className={`text-xs font-medium ${active ? "text-[#1B3A5C]" : "text-gray-700"}`}>{p.name}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#1B3A5C] ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Custom color pickers */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Tùy chỉnh màu</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Màu chính (Navy)",   value: primaryColor, setter: setPrimaryColor },
                { label: "Màu nhấn (Vàng)",    value: accentColor,  setter: setAccentColor },
                { label: "Màu cảnh báo (Đỏ)",  value: redColor,     setter: setRedColor },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 shrink-0 cursor-pointer shadow-sm">
                      <div className="absolute inset-0" style={{ background: value }} />
                      <input type="color" value={value} onChange={(e) => setter(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </div>
                    <input value={value} onChange={(e) => setter(e.target.value)}
                      className="flex-1 text-xs font-mono border border-gray-200 rounded-lg px-2 py-1.5 w-0 min-w-0 focus:outline-none focus:ring-1 focus:ring-[#1B3A5C]/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live preview strip */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="h-10 flex items-center px-4 gap-3" style={{ background: primaryColor }}>
              <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
              <span className="text-white text-xs font-semibold">Xem trước header</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: accentColor, color: primaryColor }}>
                Mẫu nút
              </span>
            </div>
            <div className="bg-white px-4 py-3 flex items-center gap-3">
              <div className="w-6 h-1 rounded-full" style={{ background: accentColor }} />
              <span className="text-xs font-bold" style={{ color: primaryColor }}>Tiêu đề trang</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full border text-white text-[10px]"
                style={{ background: redColor, borderColor: redColor }}>Khẩn</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Typography ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Type className="w-4 h-4 text-[#1B3A5C]" />
          <h2 className="font-semibold text-gray-800">Kiểu chữ</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {fontOptions.map((f) => (
              <button key={f.value} onClick={() => setSelectedFont(f.value)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  selectedFont === f.value
                    ? "border-[#1B3A5C] bg-[#1B3A5C]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">{f.label}</span>
                  {selectedFont === f.value && <Check className="w-3.5 h-3.5 text-[#1B3A5C]" />}
                </div>
                <p className="text-sm font-bold text-gray-800" style={{ fontFamily: f.value }}>
                  Nhà máy Z119
                </p>
                <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: f.value }}>
                  Cổng thông tin nội bộ
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Homepage sections ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Layout className="w-4 h-4 text-[#1B3A5C]" />
          <h2 className="font-semibold text-gray-800">Bố cục trang chủ</h2>
          <span className="ml-auto text-xs text-gray-400">Kéo thả để sắp xếp thứ tự</span>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {sections.map((sec, i) => (
              <div key={sec.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  sec.enabled ? "border-gray-200 bg-white" : "border-dashed border-gray-200 bg-gray-50"
                }`}>
                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
                <span className={`flex-1 text-sm ${sec.enabled ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                  {sec.label}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSection(sec.id, -1)} disabled={i === 0}
                    className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSection(sec.id, 1)} disabled={i === sections.length - 1}
                    className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Toggle switch */}
                <button onClick={() => toggleSection(sec.id)}
                  className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                    sec.enabled ? "bg-[#1B3A5C]" : "bg-gray-300"
                  }`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    sec.enabled ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {sections.filter((s) => s.enabled).length} / {sections.length} mục đang hiển thị trên trang chủ
          </p>
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center gap-3 pb-2">
        <Button onClick={handleSave}
          className={`gap-2 rounded-xl px-6 transition-all ${
            saved ? "bg-green-600 hover:bg-green-700" : "bg-[#1B3A5C] hover:bg-[#2d5a8e]"
          } text-white`}>
          {saved ? <><Check className="w-4 h-4" /> Đã lưu!</> : <><Save className="w-4 h-4" /> Lưu thay đổi</>}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2 rounded-xl">
          <RotateCcw className="w-4 h-4" /> Khôi phục mặc định
        </Button>
      </div>
    </div>
  );
}
