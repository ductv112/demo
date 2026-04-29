import { latestNews, featuredNews, newsContent } from "@/lib/portal-data";
import ArticleDetailClient from "./client";

export function generateStaticParams() {
  const articleIds = [featuredNews, ...latestNews].map((a) => a.id);
  const contentIds = Object.keys(newsContent);
  const allIds = Array.from(new Set([...articleIds, ...contentIds]));
  return allIds.map((id) => ({ id }));
}

export default function ArticleDetailPage() {
  return <ArticleDetailClient />;
}
