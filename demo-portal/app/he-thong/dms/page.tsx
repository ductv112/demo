"use client";

import Link from "next/link";
import { FileStack, ArrowRight } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";

export default function DmsPage() {
  return (
    <PortalLayout>
      <Breadcrumb items={[{ label: "Hệ thống tích hợp", href: "/he-thong" }, { label: "DMS — Quản lý tài liệu" }]} />
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#e8eef6] border-2 border-[#bfdbfe] flex items-center justify-center">
          <FileStack className="w-8 h-8 text-[#1B3A5C]" />
        </div>
        <h1 className="text-xl font-black text-[#1B3A5C]">DMS — Quản lý tài liệu</h1>
        <p className="text-gray-500 text-sm max-w-md">Hệ thống quản lý văn bản điện tử đã được tích hợp vào module Văn bản — Chỉ đạo của cổng thông tin.</p>
        <Link href="/van-ban">
          <button className="flex items-center gap-2 bg-[#1B3A5C] hover:bg-[#2d5a8e] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Đến trang Văn bản — Chỉ đạo <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </PortalLayout>
  );
}
