import { announcements } from "@/lib/data";
import ThongBaoDetailClient from "./client";

export function generateStaticParams() {
  return announcements.map((a) => ({ id: a.id }));
}

export default function ThongBaoDetailPage() {
  return <ThongBaoDetailClient />;
}
