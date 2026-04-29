"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Tab 1: Thông tin cổng ────────────────────────────────────────────────────

interface SiteInfo {
  tenDonVi: string;
  tenVietTat: string;
  slogan: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
}

function TabSiteInfo() {
  const [form, setForm] = useState<SiteInfo>({
    tenDonVi: "Nhà máy Z119",
    tenVietTat: "Z119",
    slogan: "Sáng tạo — Chính xác — Tận tâm phục vụ Tổ quốc",
    soDienThoai: "(024) 3864 xxxx",
    email: "z119@qpvn.mil.vn",
    diaChi: "Số 2 Nguyễn Tri Phương, Hai Bà Trưng, Hà Nội",
  });
  const [saved, setSaved] = useState(false);

  const field = (
    label: string,
    key: keyof SiteInfo,
    placeholder?: string
  ) => (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <Input
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {field("Tên đơn vị", "tenDonVi")}
      {field("Tên viết tắt", "tenVietTat")}
      {field("Slogan", "slogan")}
      {field("Số điện thoại", "soDienThoai")}
      {field("Email", "email")}
      {field("Địa chỉ", "diaChi")}
      <div className="pt-2">
        <Button
          size="sm"
          onClick={handleSave}
          style={{ backgroundColor: "#1B3A5C", color: "#fff" }}
        >
          {saved ? "Đã lưu!" : "Lưu thông tin"}
        </Button>
      </div>
    </div>
  );
}

// ─── Tab 2: Hiển thị ──────────────────────────────────────────────────────────

interface DisplaySettings {
  ticker: boolean;
  bannerSlider: boolean;
  heThongTichHop: boolean;
  thanhThongKe: boolean;
  soTinTuc: number;
  soThongBao: number;
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer select-none">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded"
        style={{ accentColor: "#1B3A5C" }}
      />
    </label>
  );
}

function TabDisplay() {
  const [settings, setSettings] = useState<DisplaySettings>({
    ticker: true,
    bannerSlider: true,
    heThongTichHop: true,
    thanhThongKe: true,
    soTinTuc: 5,
    soThongBao: 6,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof DisplaySettings) => (v: boolean) =>
    setSettings((s) => ({ ...s, [key]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-0">
        <ToggleRow
          label="Hiển thị ticker thông báo trang chủ"
          checked={settings.ticker}
          onChange={toggle("ticker")}
        />
        <ToggleRow
          label="Hiển thị banner slider"
          checked={settings.bannerSlider}
          onChange={toggle("bannerSlider")}
        />
        <ToggleRow
          label="Hiển thị khối Hệ thống tích hợp"
          checked={settings.heThongTichHop}
          onChange={toggle("heThongTichHop")}
        />
        <ToggleRow
          label="Hiển thị thanh thống kê"
          checked={settings.thanhThongKe}
          onChange={toggle("thanhThongKe")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            Số tin tức hiển thị trang chủ
          </p>
          <Input
            type="number"
            min={1}
            max={20}
            value={settings.soTinTuc}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                soTinTuc: Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">
            Số thông báo hiển thị trang chủ
          </p>
          <Input
            type="number"
            min={1}
            max={20}
            value={settings.soThongBao}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                soThongBao: Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          size="sm"
          onClick={handleSave}
          style={{ backgroundColor: "#1B3A5C", color: "#fff" }}
        >
          {saved ? "Đã lưu!" : "Lưu cài đặt"}
        </Button>
      </div>
    </div>
  );
}

// ─── Tab 3: Bảo mật ───────────────────────────────────────────────────────────

interface SecuritySettings {
  sessionTimeout: number;
  passwordChangeDays: number;
  maxLoginAttempts: number;
  twoFactor: boolean;
  activityLog: boolean;
}

const LOG_ROWS = [
  {
    time: "18/03/2026 09:12",
    user: "Nguyễn Văn Hùng",
    action: "Đăng nhập",
    ip: "192.168.1.10",
  },
  {
    time: "18/03/2026 09:15",
    user: "Nguyễn Văn Hùng",
    action: "Tạo tin tức mới",
    ip: "192.168.1.10",
  },
  {
    time: "17/03/2026 14:30",
    user: "Trần Minh Tuấn",
    action: "Chỉnh sửa văn bản VB003",
    ip: "192.168.1.22",
  },
  {
    time: "17/03/2026 08:55",
    user: "Trần Minh Tuấn",
    action: "Đăng nhập",
    ip: "192.168.1.22",
  },
  {
    time: "16/03/2026 16:40",
    user: "Nguyễn Văn Hùng",
    action: "Xóa thông báo A2",
    ip: "192.168.1.10",
  },
];

function TabSecurity() {
  const [sec, setSec] = useState<SecuritySettings>({
    sessionTimeout: 60,
    passwordChangeDays: 90,
    maxLoginAttempts: 5,
    twoFactor: false,
    activityLog: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Security fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Thời gian phiên đăng nhập (phút)
            </p>
            <Input
              type="number"
              min={1}
              value={sec.sessionTimeout}
              onChange={(e) =>
                setSec((s) => ({ ...s, sessionTimeout: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Yêu cầu đổi mật khẩu định kỳ (ngày)
            </p>
            <Input
              type="number"
              min={1}
              value={sec.passwordChangeDays}
              onChange={(e) =>
                setSec((s) => ({
                  ...s,
                  passwordChangeDays: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Số lần đăng nhập sai tối đa
            </p>
            <Input
              type="number"
              min={1}
              value={sec.maxLoginAttempts}
              onChange={(e) =>
                setSec((s) => ({
                  ...s,
                  maxLoginAttempts: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-0">
          <ToggleRow
            label="Bắt buộc xác thực 2 yếu tố"
            checked={sec.twoFactor}
            onChange={(v) => setSec((s) => ({ ...s, twoFactor: v }))}
          />
          <ToggleRow
            label="Ghi nhật ký hoạt động người dùng"
            checked={sec.activityLog}
            onChange={(v) => setSec((s) => ({ ...s, activityLog: v }))}
          />
        </div>

        <div className="pt-1">
          <Button
            size="sm"
            onClick={handleSave}
            style={{ backgroundColor: "#1B3A5C", color: "#fff" }}
          >
            {saved ? "Đã lưu!" : "Lưu bảo mật"}
          </Button>
        </div>
      </div>

      {/* System log table */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Nhật ký hệ thống
        </p>
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#1B3A5C" }}>
                {["Thời gian", "Người dùng", "Hành động", "IP"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs tracking-wide font-semibold uppercase"
                    style={{ color: "#fff" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOG_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2 text-xs text-gray-500 font-mono whitespace-nowrap">
                    {row.time}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {row.user}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {row.action}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500 font-mono">
                    {row.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CaiDatPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black" style={{ color: "#1B3A5C" }}>
        Cài đặt hệ thống
      </h1>

      <Tabs defaultValue="site-info">
        <TabsList className="mb-4">
          <TabsTrigger value="site-info">Thông tin cổng</TabsTrigger>
          <TabsTrigger value="display">Hiển thị</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="site-info">
          <Card>
            <CardContent className="p-6">
              <TabSiteInfo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardContent className="p-6">
              <TabDisplay />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardContent className="p-6">
              <TabSecurity />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
