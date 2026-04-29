"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Eye, Clock, Printer, Share2, ChevronRight, Tag } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Breadcrumb } from "@/components/portal/breadcrumb";
import { latestNews, featuredNews, newsContent } from "@/lib/portal-data";

const NAVY = "#1B3A5C";
const GOLD = "#D4A843";
const RED  = "#D4A843";

/* Merge all articles into one lookup map */
const allArticles = [featuredNews, ...latestNews];

export default function ArticleDetailClient() {
  const { id } = useParams<{ id: string }>();

  const article = allArticles.find((a) => a.id === id) ?? null;
  const content = id ? newsContent[id] ?? null : null;

  /* Related: up to 4 articles that are not the current one */
  const related = allArticles.filter((a) => a.id !== id).slice(0, 4);

  /* Category quick links */
  const categoryLinks = [
    { label: "Tin hoạt động", href: "/tin-tuc/hoat-dong" },
    { label: "Khoa học – Công nghệ", href: "/tin-tuc" },
    { label: "Dự án thiết kế", href: "/tin-tuc" },
    { label: "Hợp tác quốc tế", href: "/tin-tuc" },
    { label: "Sự kiện nổi bật", href: "/tin-tuc/su-kien" },
    { label: "Đảng ủy", href: "/tin-tuc" },
  ];

  if (!article || !content) {
    return (
      <PortalLayout>
        <Breadcrumb
          items={[
            { label: "Tin tức — Sự kiện", href: "/tin-tuc" },
            { label: "Không tìm thấy bài viết" },
          ]}
        />
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "64px 32px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 48, marginBottom: 16 }}>404</p>
          <p style={{ fontWeight: 700, fontSize: 18, color: NAVY, marginBottom: 8 }}>
            Không tìm thấy bài viết
          </p>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
            Bài viết với mã <strong>{id}</strong> không tồn tại hoặc đã bị gỡ xuống.
          </p>
          <Link href="/tin-tuc">
            <span
              style={{
                display: "inline-block",
                background: RED,
                color: "#fff",
                padding: "8px 24px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Quay lại Tin tức
            </span>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <Breadcrumb
        items={[
          { label: "Tin tức — Sự kiện", href: "/tin-tuc" },
          { label: article.category, href: "/tin-tuc" },
          { label: article.title },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="lg:grid-cols-[2fr_1fr]">
        {/* ── Left column: article ── */}
        <main
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Category + meta bar */}
          <div
            style={{
              borderBottom: "1px solid #f3f4f6",
              padding: "14px 28px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: RED,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 4,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {article.category}
            </span>
            <span style={{ color: "#9ca3af", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Clock style={{ width: 13, height: 13 }} /> {article.date}
            </span>
            <span style={{ color: "#9ca3af", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Eye style={{ width: 13, height: 13 }} />
              {"views" in article ? (article as { views: number }).views : 0} lượt xem
            </span>

            {/* Action buttons */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 12,
                  color: "#6b7280",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <Printer style={{ width: 13, height: 13 }} /> In
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 12,
                  color: "#6b7280",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <Share2 style={{ width: 13, height: 13 }} /> Chia sẻ
              </button>
            </div>
          </div>

          {/* Article body */}
          <div style={{ padding: "28px 28px 32px" }}>
            {/* Title */}
            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: NAVY,
                lineHeight: 1.3,
                marginBottom: 18,
              }}
            >
              {article.title}
            </h1>

            {/* Sapo */}
            <p
              style={{
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 15,
                color: "#374151",
                lineHeight: 1.7,
                borderLeft: `4px solid ${GOLD}`,
                paddingLeft: 16,
                marginBottom: 22,
              }}
            >
              {content.sapo}
            </p>

            {/* Feature image */}
            <div
              style={{
                width: "100%",
                aspectRatio: "16/7",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 24,
                background: `linear-gradient(135deg, ${NAVY}, #2d5a8e)`,
              }}
            >
              <img
                src={article.image}
                alt={article.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                }}
              />
            </div>

            {/* Body paragraphs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {content.body.map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "#1f2937",
                    textAlign: "justify",
                  }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Author / source bar */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 16,
                borderTop: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${NAVY}, #2d5a8e)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: GOLD,
                  fontWeight: 900,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {content.author.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: NAVY }}>
                  {content.author}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280" }}>{content.authorTitle}</p>
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <Tag style={{ width: 14, height: 14, color: "#9ca3af", flexShrink: 0 }} />
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "#f3f4f6",
                    color: "#374151",
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontWeight: 500,
                    cursor: "default",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </main>

        {/* ── Right sidebar ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Related articles */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: NAVY,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: 4, height: 16, background: GOLD, borderRadius: 2 }} />
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Tin liên quan
              </h2>
            </div>
            <div style={{ padding: "4px 0" }}>
              {related.map((item) => (
                <Link key={item.id} href={`/tin-tuc/${item.id}`}>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 14px",
                      borderBottom: "1px solid #f9fafb",
                      cursor: "pointer",
                    }}
                    className="hover:bg-gray-50 group transition-colors"
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: 72,
                        height: 52,
                        borderRadius: 6,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${NAVY}, #2d5a8e)`,
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: NAVY,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        className="group-hover:text-[#D4A843] transition-colors"
                      >
                        {item.title}
                      </p>
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock style={{ width: 11, height: 11 }} /> {item.date}
                      </p>
                    </div>
                    <ChevronRight style={{ width: 14, height: 14, color: "#d1d5db", flexShrink: 0, alignSelf: "center" }} />
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ padding: "10px 14px" }}>
              <Link href="/tin-tuc">
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: RED,
                    cursor: "pointer",
                  }}
                >
                  Xem tất cả tin tức <ChevronRight style={{ width: 13, height: 13 }} />
                </span>
              </Link>
            </div>
          </div>

          {/* Category quick links */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#2d5a8e",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: 4, height: 16, background: GOLD, borderRadius: 2 }} />
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Danh mục
              </h2>
            </div>
            <div style={{ padding: "4px 0" }}>
              {categoryLinks.map((cat) => (
                <Link key={cat.label} href={cat.href}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 14px",
                      borderBottom: "1px solid #f9fafb",
                      cursor: "pointer",
                    }}
                    className="hover:bg-gray-50 group transition-colors"
                  >
                    <ChevronRight style={{ width: 13, height: 13, color: RED, flexShrink: 0 }} />
                    <span
                      style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}
                      className="group-hover:text-[#D4A843] transition-colors"
                    >
                      {cat.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PortalLayout>
  );
}
