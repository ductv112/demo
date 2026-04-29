"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Bell,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  Activity,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { statsCards, recentActivities, announcements, documents } from "@/lib/data";
import Link from "next/link";

const iconMap: Record<string, React.ElementType> = {
  FileText,
  Bell,
  BookOpen,
  ClipboardList,
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
};

const activityIconMap: Record<string, React.ElementType> = {
  document: FileText,
  announcement: Bell,
  library: BookOpen,
  process: CheckCircle2,
  form: ClipboardList,
};

const activityColorMap: Record<string, string> = {
  document: "bg-blue-100 text-blue-600",
  announcement: "bg-orange-100 text-orange-600",
  library: "bg-green-100 text-green-600",
  process: "bg-emerald-100 text-emerald-600",
  form: "bg-purple-100 text-purple-600",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const date = new Date();
  const dateStr = date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <MainLayout title="Trang chủ" subtitle={dateStr}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Welcome banner */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-6 text-white">
            <div className="absolute inset-0 opacity-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute border border-white/20 rounded-full"
                  style={{
                    width: `${i * 200}px`,
                    height: `${i * 200}px`,
                    top: "-50%",
                    right: "-5%",
                    transform: "translate(50%, 50%)",
                  }}
                />
              ))}
            </div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Xin chào,</p>
                <h2 className="text-2xl font-bold">Đại tá Trần Văn Đức</h2>
                <p className="text-blue-200 text-sm mt-1">
                  Giám đốc · Ban Giám đốc · Đăng nhập lúc 07:45
                </p>
              </div>
              <div className="hidden md:grid grid-cols-3 gap-3">
                {[
                  { label: "Văn bản chờ", value: "12", urgent: true },
                  { label: "Hạn hôm nay", value: "3", urgent: true },
                  { label: "Đã xử lý T3", value: "47", urgent: false },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`text-center px-4 py-2 rounded-xl border ${
                      s.urgent
                        ? "bg-red-500/20 border-red-400/30"
                        : "bg-white/10 border-white/20"
                    }`}
                  >
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-blue-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => {
            const Icon = iconMap[stat.icon];
            const colorCls = colorMap[stat.color];
            return (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">{stat.change} so với tuần trước</span>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorCls}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent documents */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Văn bản cần xử lý
                  </CardTitle>
                  <Link href="/van-ban">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      Xem tất cả <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {documents.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-muted-foreground">
                            {doc.soHieu}
                          </span>
                          <Badge
                            className={`text-[10px] h-4 px-1.5 border-0 ${
                              doc.doMat === "Tuyệt mật"
                                ? "bg-red-100 text-red-700"
                                : doc.doMat === "Mật"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {doc.doMat}
                          </Badge>
                          {doc.doKhan !== "Thường" && (
                            <Badge className="text-[10px] h-4 px-1.5 bg-red-50 text-red-600 border-red-200">
                              {doc.doKhan}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {doc.trichYeu}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {doc.coQuanBanHanh}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Hạn: {doc.hanXuLy}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] h-5 px-2 shrink-0 border-0 ${
                          doc.trangThai === "Đang xử lý"
                            ? "bg-yellow-100 text-yellow-700"
                            : doc.trangThai === "Đã xử lý"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {doc.trangThai}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right column */}
          <motion.div variants={item} className="space-y-4">
            {/* Urgent announcements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    Thông báo mới
                  </CardTitle>
                  <Link href="/thong-bao">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {announcements.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="px-5 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {!a.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                        )}
                        {a.isRead && <span className="w-1.5 h-1.5 mt-2 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          {a.type === "urgent" && (
                            <Badge className="bg-red-100 text-red-600 border-0 text-[10px] h-4 px-1.5 mb-1">
                              <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Khẩn
                            </Badge>
                          )}
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {a.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {a.author} · {a.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Thao tác nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {[
                  { label: "Soạn văn bản mới", href: "/van-ban", color: "blue" },
                  { label: "Đăng thông báo", href: "/thong-bao", color: "orange" },
                  { label: "Tìm tài liệu kỹ thuật", href: "/thu-vien", color: "green" },
                  { label: "Nộp biểu mẫu", href: "/bieu-mau", color: "purple" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-sm font-medium text-foreground group">
                      {action.label}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent activity */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivities.map((act) => {
                  const Icon = activityIconMap[act.type];
                  const colorCls = activityColorMap[act.type];
                  return (
                    <div
                      key={act.id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorCls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{act.user}</span>{" "}
                          <span className="text-muted-foreground">{act.action}</span>{" "}
                          <span className="font-medium">"{act.target}"</span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {act.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
