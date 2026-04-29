"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, Printer, Lock, BookOpen, BookMarked,
  Star, FileText, FileSpreadsheet, Clock, CheckCircle2, List,
  ChevronRight,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { technicalDocs, docContent } from "@/lib/data";

/* ── helpers ── */
function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const catConfig: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Tiêu chuẩn quốc gia": { color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200", icon: BookMarked },
  "Quy chuẩn kỹ thuật":  { color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",  icon: BookOpen },
  "Tài liệu nội bộ":     { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200",icon: Lock },
  "Tiêu chuẩn quốc tế":  { color: "text-cyan-700",   bg: "bg-cyan-50",   border: "border-cyan-200",  icon: Star },
  "Tiêu chuẩn quân sự":  { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",   icon: Shield },
};

function FileIcon({ type }: { type: string }) {
  const base = "w-12 h-12 rounded-xl flex items-center justify-center shrink-0";
  if (type === "xlsx") return <div className={`${base} bg-emerald-50 border border-emerald-200`}><FileSpreadsheet className="w-6 h-6 text-emerald-600" /></div>;
  if (type === "docx") return <div className={`${base} bg-blue-50 border border-blue-200`}><FileText className="w-6 h-6 text-blue-600" /></div>;
  return <div className={`${base} bg-red-50 border border-red-200`}><FileText className="w-6 h-6 text-red-600" /></div>;
}

export default function ThuVienDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [downloadMsg, setDownloadMsg] = useState("");

  const doc = technicalDocs.find((d) => d.id === id);
  const content = docContent[id];

  const handleDownload = () => {
    setDownloadMsg("Đang tải tài liệu...");
    setTimeout(() => setDownloadMsg(""), 3000);
  };

  if (!doc) {
    return (
      <PortalLayout>
        <Breadcrumb items={[{ label: "Thư viện Kỹ thuật", href: "/thu-vien" }, { label: "Không tìm thấy" }]} />
        <div className="bg-white border border-gray-200 rounded-xl py-24 flex flex-col items-center gap-3 text-gray-400">
          <BookOpen className="w-14 h-14 opacity-30" />
          <p className="font-semibold text-lg">Tài liệu không tồn tại</p>
          <Link href="/thu-vien">
            <Button variant="outline" className="mt-2 gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Quay lại thư viện
            </Button>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const cfg = catConfig[doc.category] ?? { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: BookOpen };
  const CatIcon = cfg.icon;

  const relatedDocs = content?.relatedIds
    ? technicalDocs.filter((d) => content.relatedIds.includes(d.id))
    : [];

  return (
    <PortalLayout>
      <Breadcrumb items={[
        { label: "Thư viện Kỹ thuật", href: "/thu-vien" },
        { label: doc.title },
      ]} />

      {/* Download toast */}
      {downloadMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#1B3A5C] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <Download className="w-4 h-4 animate-bounce" />
          {downloadMsg}
        </div>
      )}

      {/* Top action bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1B3A5C] font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9 text-sm"
            onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> In
          </Button>
          <Button size="sm" className="gap-2 rounded-xl h-9 text-sm text-white"
            style={{ backgroundColor: "#1B3A5C" }}
            onClick={handleDownload}>
            <Download className="w-4 h-4" /> Tải xuống
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: main content (2/3) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <FileIcon type={doc.type} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className={`border text-xs ${cfg.bg} ${cfg.color} ${cfg.border} flex items-center gap-1`}>
                    <CatIcon className="w-3 h-3" /> {doc.category}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200 border text-xs font-mono uppercase">
                    {doc.type}
                  </Badge>
                  {doc.restricted && (
                    <Badge className="bg-red-50 text-red-600 border-red-200 border text-xs gap-1 flex items-center">
                      <Lock className="w-3 h-3" /> Tài liệu nội bộ
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900 leading-snug">{doc.title}</h1>
              </div>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
              <span className="flex items-center gap-1.5">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Phiên bản</span>
                <span className="font-semibold text-gray-700">v{doc.version}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold text-gray-700">{doc.lastUpdated}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold text-gray-700">{doc.downloads} lượt tải</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Dung lượng</span>
                <span className="font-semibold text-gray-700">{doc.size}</span>
              </span>
            </div>
          </div>

          {content ? (
            <>
              {/* Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1B3A5C]" /> Tóm tắt
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 pl-4"
                  style={{ borderColor: "#D4A843" }}>
                  {content.summary}
                </p>
              </div>

              {/* Key points */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3A5C]" /> Nội dung chính
                </h2>
                <ul className="space-y-2.5">
                  {content.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Table of contents */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <List className="w-4 h-4 text-[#1B3A5C]" /> Mục lục
                </h2>
                <ol className="space-y-2">
                  {content.tableOfContents.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-400 italic">Chưa có thông tin chi tiết cho tài liệu này.</p>
            </div>
          )}
        </div>

        {/* Right: sidebar (1/3) */}
        <div className="space-y-4">

          {/* Document info card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3" style={{ color: "#1B3A5C" }}>
              Thông tin tài liệu
            </h3>
            <div className="space-y-3">
              {[
                ["Mã tài liệu", doc.id],
                ["Loại file", doc.type.toUpperCase()],
                ["Dung lượng", doc.size],
                ["Phiên bản", `v${doc.version}`],
                ["Cập nhật", doc.lastUpdated],
                ["Lượt tải", `${doc.downloads} lần`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-500 text-xs">{k}</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[60%]">{v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 text-xs">Phân loại</span>
                <Badge className={`border text-[10px] ${cfg.bg} ${cfg.color} ${cfg.border}`}>{doc.category}</Badge>
              </div>
              {doc.restricted && (
                <div className="flex items-center gap-2 bg-red-50 rounded-xl p-2.5 border border-red-100 mt-1">
                  <Lock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 font-medium">Tài liệu có hạn chế phân phối</p>
                </div>
              )}
            </div>
          </div>

          {/* Related docs */}
          {relatedDocs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold mb-3" style={{ color: "#1B3A5C" }}>
                Tài liệu liên quan
              </h3>
              <div className="space-y-2">
                {relatedDocs.map((rd) => {
                  const rdCfg = catConfig[rd.category] ?? { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: BookOpen };
                  return (
                    <Link key={rd.id} href={`/thu-vien/${rd.id}`}>
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-200">
                        <div className={`w-7 h-7 rounded-lg ${rdCfg.bg} ${rdCfg.border} border flex items-center justify-center shrink-0`}>
                          <FileText className={`w-3.5 h-3.5 ${rdCfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 group-hover:text-[#1B3A5C] line-clamp-2 leading-snug">
                            {rd.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{rd.category}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1B3A5C] shrink-0 mt-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sidebar download button */}
          <Button className="w-full gap-2 rounded-xl h-10 text-white font-semibold"
            style={{ backgroundColor: "#1B3A5C" }}
            onClick={handleDownload}>
            <Download className="w-4 h-4" /> Tải xuống tài liệu
          </Button>
        </div>
      </div>
    </PortalLayout>
  );
}
