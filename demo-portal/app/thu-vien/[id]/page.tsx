import { technicalDocs } from "@/lib/data";
import ThuVienDetailClient from "./client";

export function generateStaticParams() {
  return technicalDocs.map((d) => ({ id: d.id }));
}

export default function ThuVienDetailPage() {
  return <ThuVienDetailClient />;
}
