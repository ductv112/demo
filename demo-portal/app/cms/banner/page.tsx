"use client";

import { useState } from "react";
import { Pin, PinOff, Calendar, MapPin, Star, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { portalEvents, type PortalEvent } from "@/lib/portal-data";

const EVENT_TYPES = ["Hội nghị", "Hội thảo", "Lễ kỷ niệm", "Triển lãm", "Hội đồng", "Khác"];

export default function BannerPage() {
  const [events, setEvents] = useState<PortalEvent[]>(portalEvents);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPinned, setFilterPinned] = useState("all");

  const toggleFeatured = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, featured: !e.featured } : e))
    );
  };

  const pinnedCount = events.filter((e) => e.featured).length;

  const filtered = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    const matchType = filterType === "all" || e.type === filterType;
    const matchPinned =
      filterPinned === "all" ||
      (filterPinned === "pinned" && e.featured) ||
      (filterPinned === "unpinned" && !e.featured);
    return matchSearch && matchStatus && matchType && matchPinned;
  });

  const statusBadge = (status: PortalEvent["status"]) => {
    if (status === "upcoming")
      return <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B3A5C] border border-[#bfdbfe] bg-[#e8eef6] px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-[#e8eef6]0 inline-block" />Sắp diễn ra</span>;
    if (status === "ongoing")
      return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Đang diễn ra</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 border border-gray-200 bg-gray-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Đã kết thúc</span>;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#1B3A5C]">Quản lý Banner</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chọn các sự kiện để ghim lên banner trang chủ.{" "}
          <span className="font-semibold text-[#1B3A5C]">{pinnedCount} đang hiển thị</span>
          {" "}/ {events.length} sự kiện.
        </p>
      </div>

      {/* Preview strip */}
      {pinnedCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#D4A843]" /> Banner đang hiển thị trên trang chủ
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {events.filter((e) => e.featured).map((e, i) => (
                <div key={e.id} className="relative shrink-0 w-48 h-28 rounded-lg overflow-hidden border-2 border-[#D4A843]">
                  {e.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.image} alt={e.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1B3A5C]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded font-mono">#{i + 1}</span>
                  </div>
                  <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold line-clamp-2 leading-tight">
                    {e.title}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
          <select
            value={filterPinned}
            onChange={(e) => setFilterPinned(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
          >
            <option value="all">Tất cả</option>
            <option value="pinned">Đang ghim</option>
            <option value="unpinned">Chưa ghim</option>
          </select>
        </CardContent>
      </Card>

      {/* Events list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Không tìm thấy sự kiện nào.</p>
        )}
        {filtered.map((ev) => (
          <Card
            key={ev.id}
            className={`transition-all ${ev.featured ? "border-[#D4A843] shadow-sm" : ""}`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {ev.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1B3A5C]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-mono text-gray-400">{ev.id}</span>
                  {statusBadge(ev.status)}
                  <Badge className="bg-[#e8eef6] text-[#1B3A5C] border-[#bfdbfe] text-[10px]">{ev.type}</Badge>
                  {ev.featured && (
                    <Badge className="bg-[#fdf5e0] text-[#8a6a00] border-[#e8d08a] text-[10px] flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" /> Đang ghim
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {ev.date}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3" /> {ev.location}
                  </span>
                </div>
              </div>

              {/* Action */}
              <Button
                size="sm"
                variant={ev.featured ? "outline" : "default"}
                className={
                  ev.featured
                    ? "border-[#D4A843] text-[#8a6a00] hover:bg-[#fdf5e0] gap-1.5 shrink-0"
                    : "bg-[#1B3A5C] hover:bg-[#142d4a] text-white gap-1.5 shrink-0"
                }
                onClick={() => toggleFeatured(ev.id)}
              >
                {ev.featured ? (
                  <><PinOff className="w-3.5 h-3.5" /> Bỏ ghim</>
                ) : (
                  <><Pin className="w-3.5 h-3.5" /> Ghim lên banner</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
