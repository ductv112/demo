import { documents } from "@/lib/data";
import VanBanDetailClient from "./client";

export function generateStaticParams() {
  return documents.map((d) => ({ id: d.id }));
}

export default function VanBanDetailPage() {
  return <VanBanDetailClient />;
}
