'use client';

import 'katex/dist/katex.min.css';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import katex from 'katex';
// Sanitize KaTeX output — chống XSS injection qua biểu thức toán học độc hại
import DOMPurify from 'dompurify';
import type { PluggableList } from 'unified';

interface MarkdownRendererProps {
  children: string;
  className?: string;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  components?: Components;
  urlTransform?: (url: string) => string;
}

/**
 * KaTeX render trực tiếp qua dangerouslySetInnerHTML — tránh thẻ HTML
 * không chuẩn (<insert>, <annotation>) mà rehype-katex tạo ra gây lỗi React.
 */
function MathBlock({ children }: { children?: React.ReactNode }) {
  const math = String(children ?? '');
  try {
    const html = katex.renderToString(math, {
      displayMode: true,
      throwOnError: false,
    });
    // Sanitize KaTeX output trước khi render — KaTeX chỉ tạo span/annotation nên DOMPurify mặc định cho phép
    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
  } catch {
    return <div className="text-red-500">{math}</div>;
  }
}

function MathInline({ children }: { children?: React.ReactNode }) {
  const math = String(children ?? '');
  try {
    const html = katex.renderToString(math, {
      displayMode: false,
      throwOnError: false,
    });
    // Sanitize KaTeX output trước khi render — chống XSS trong inline math
    return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
  } catch {
    return <code>{math}</code>;
  }
}

/**
 * urlTransform mặc định: cho phép data:image URI (ảnh base64 từ OCR/DOCX),
 * block javascript: (XSS), pass-through các protocol hợp lệ còn lại.
 * react-markdown v10 mặc định chỉ cho phép http/https/mailto — data: bị strip.
 */
function defaultUrlTransform(url: string): string {
  if (url.startsWith('data:image/')) return url;
  if (/^javascript:/i.test(url)) return '';
  return url;
}

/** Components mặc định cho math + image rendering */
const mathComponents: Components = {
  // Bỏ qua ảnh có src rỗng — Docling đôi khi output ![alt]() khi picture không có data
  img({ src, alt, ...props }) {
    if (!src) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ''} {...props} style={{ maxWidth: '100%' }} />;
  },
  // remark-math tạo <pre><code class="language-math"> cho display math
  // và <code class="language-math"> (inline) cho inline math
  pre({ children, ...props }) {
    // Kiểm tra child là <code class="language-math">
    const child = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    if (child?.props?.className === 'language-math math-display') {
      return <MathBlock>{child.props.children}</MathBlock>;
    }
    return <pre {...props}>{children}</pre>;
  },
  code({ children, className, ...props }) {
    if (className === 'language-math math-inline') {
      return <MathInline>{children}</MathInline>;
    }
    if (className === 'language-math math-display') {
      return <MathBlock>{children}</MathBlock>;
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

/**
 * MarkdownRenderer — Shared component tập trung cấu hình ReactMarkdown
 *
 * Base plugins: remarkGfm, remarkMath
 * Math rendering: KaTeX trực tiếp qua custom components (không dùng rehype-katex)
 * Caller có thể truyền thêm remarkPlugins/rehypePlugins/components (merge vào base).
 *
 * Nếu className được truyền → wrap trong <div className={className}>
 * Nếu không → render ReactMarkdown trực tiếp (tránh double wrapping)
 */
export function MarkdownRenderer({
  children,
  className,
  remarkPlugins = [],
  rehypePlugins = [],
  components,
  urlTransform,
}: MarkdownRendererProps) {
  // Merge math components với caller components — caller overrides nếu trùng key
  const mergedComponents: Components = {
    ...mathComponents,
    ...components,
  };

  const content = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, ...remarkPlugins]}
      rehypePlugins={[...rehypePlugins]}
      components={mergedComponents}
      urlTransform={urlTransform ?? defaultUrlTransform}
    >
      {children}
    </ReactMarkdown>
  );

  return className ? <div className={className}>{content}</div> : content;
}
