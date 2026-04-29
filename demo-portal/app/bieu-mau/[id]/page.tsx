import { forms } from "@/lib/data";
import BieuMauDetailClient from "./client";

export function generateStaticParams() {
  return forms.map((f) => ({ id: f.id }));
}

export default function BieuMauDetailPage() {
  return <BieuMauDetailClient />;
}
