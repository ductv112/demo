'use client';

import { useState, useEffect, useRef } from 'react';
import { defaultUrlTransform } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { FileText, GitCompareArrows, Languages, BookOpen, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ChatMessage, Citation } from '@/types/chat';
import { MessageActionBar } from './message-action-bar';
import { FileCardBubble } from './file-card-bubble';
import { ImageLightbox } from './image-lightbox';
import { getUploadDownloadUrl } from '@/lib/api/chat-upload';

/** Ảnh load qua fetch + Bearer token (img src không gửi auth header) */
function AuthImage({ fileId, alt, className, onClick }: {
  fileId: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let revoke: string | null = null;
    const token = localStorage.getItem('dms_access_token');
    const url = getUploadDownloadUrl(fileId);
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (!cancelled && blob) {
          revoke = URL.createObjectURL(blob);
          setBlobUrl(revoke);
        }
      })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; if (revoke) URL.revokeObjectURL(revoke); };
  }, [fileId]);

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-muted text-xs text-muted-foreground">
        📷 {alt}
      </div>
    );
  }
  if (!blobUrl) {
    return <div className="w-[200px] h-[120px] rounded-lg bg-muted animate-pulse" />;
  }
  return (
    <button type="button" onClick={onClick} className="block rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={blobUrl} alt={alt} className={className} loading="lazy" />
    </button>
  );
}

interface ClarifyPayload {
  question: string;
  options: string[];
  allow_free_text: boolean;
}

function parseClarifyNeeded(content: string): ClarifyPayload | null {
  const match = content.match(/^CLARIFY_NEEDED:\s*(\{[\s\S]*\})\s*$/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as ClarifyPayload;
  } catch {
    return null;
  }
}

function ClarificationCard({ payload, onSelect }: { payload: ClarifyPayload; onSelect?: (text: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">{payload.question}</p>
      <div className="flex flex-wrap gap-2">
        {payload.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect?.(opt)}
            className="px-3 py-1.5 text-sm rounded-full border border-primary/40 hover:bg-primary/10 text-primary transition-colors cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
      {payload.allow_free_text && (
        <p className="text-xs text-muted-foreground">Hoặc nhập câu trả lời tùy ý bên dưới</p>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  /** true khi message này đang được stream — dùng plain text để tránh markdown parse lỗi mid-stream */
  isStreaming?: boolean;
  /** Callback khi người dùng click vào citation badge */
  onCitationClick?: (docId: string) => void;
  /** Map doc_id → số thứ tự (1-based) để hiển thị trên badge */
  citationIndexMap?: Map<string, number>;
  /** Tất cả messages trong session (để infer messageType từ context) */
  allMessages?: ChatMessage[];
  /** Index của message này trong allMessages */
  messageIndex?: number;
  /** Tất cả citations của session hiện tại — dùng cho tooltip lookup */
  citations?: Citation[];
  /** Phase 47 — Callback khi user thay đổi like/dislike */
  onFeedbackChange?: (messageId: string, feedbackType: 'like' | 'dislike' | null) => void;
  /** Phase 47 — Callback khi user submit feedback chi tiết */
  onFeedbackSubmit?: (messageId: string, tags: string[], text: string) => Promise<void>;
  /** Phase 47 — Callback khi user click retry */
  onRetry?: () => void;
  /** Phase 47 — true khi bất kỳ message nào đang stream (để disable Retry) */
  globalIsStreaming?: boolean;
  /** Callback khi user click vào message AI để xem citations */
  onMessageSelect?: (messageId: string | null) => void;
  /** true khi message này đang được chọn để hiển thị citations */
  isSelected?: boolean;
  /** Callback khi user chọn option trong clarification card */
  onSuggestionSelect?: (text: string) => void;
  /** Phase 71 — Callback khi user click "Giải thích thêm" */
  onExplainMore?: (documentIds: string[], documentNames: string[]) => void;
  /** Phase 71 — Callback khi user click "Xem ví dụ" */
  onShowExample?: (documentIds: string[], documentNames: string[]) => void;
}

interface CitationBadgeProps {
  fileName: string;
  docId: string;
  index: number;
  onCitationClick?: (docId: string) => void;
  chunkText?: string;
}

function CitationBadge({ fileName, docId, index, onCitationClick, chunkText }: CitationBadgeProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onCitationClick?.(docId)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5
            bg-primary/10 hover:bg-primary/20 text-primary
            rounded-md text-xs font-medium transition-colors
            border border-primary/20 cursor-pointer align-baseline"
        >
          <span className="text-[10px] font-bold bg-primary text-primary-foreground
            rounded-full w-4 h-4 inline-flex items-center justify-center shrink-0">
            {index}
          </span>
          <span className="truncate max-w-[150px]">{fileName}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[300px] p-3 text-left">
        <p className="text-xs font-medium mb-1">{fileName}</p>
        {chunkText && (
          <p className="text-xs text-muted-foreground italic line-clamp-6">
            &ldquo;{chunkText.slice(0, 200)}{chunkText.length > 200 ? '...' : ''}&rdquo;
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Infer messageType từ context messages khi messageType không có trong DB.
 * Heuristic: nếu user message trước đó bắt đầu bằng "Tóm tắt tài liệu:"
 * thì ASSISTANT message tiếp theo là summarize.
 * Phase 44: nếu user message trước đó bắt đầu bằng "So sánh phiên bản"
 * thì ASSISTANT message tiếp theo là diff.
 */
function inferMessageType(
  message: ChatMessage,
  allMessages: ChatMessage[],
  index: number,
): 'rag' | 'summarize' | 'diff' | 'compare' | 'translate' | 'explain' | 'example' | undefined {
  if (message.messageType === 'translate') return 'translate';
  if (message.messageType) return message.messageType as 'rag' | 'summarize' | 'diff' | 'compare' | 'translate' | 'explain' | 'example';
  if (message.role === 'ASSISTANT' && index > 0) {
    const prevMsg = allMessages[index - 1];
    if (prevMsg?.role === 'USER' && prevMsg.content.startsWith('Tóm tắt tài liệu:')) {
      return 'summarize';
    }
    // Phase 44 — detect diff messages from heuristic
    if (prevMsg?.role === 'USER' && prevMsg.content.startsWith('So sánh phiên bản')) {
      return 'diff';
    }
    // Phase 44.1 — detect compare messages from heuristic
    if (prevMsg?.role === 'USER' && prevMsg.content.startsWith('So sánh tài liệu:')) {
      return 'compare';
    }
    // Phase 61 — detect translate messages: AI message has translate citations
    if (message.sources?.some((s: { citation_type?: string }) => s.citation_type === 'translate')) {
      return 'translate';
    }
  }
  if (message.role === 'USER' && message.content.startsWith('Tóm tắt tài liệu:')) {
    return 'summarize';
  }
  return undefined;
}

/**
 * Xóa các internal reasoning/note tags mà LLM có thể thêm vào response.
 * Ví dụ: <think>...</think>, <note>...</note>
 */
const LLM_TAG_PATTERN =
  /<(think|thinking|reasoning|note|thôngbáo|thong-bao|internal|system)[^>]*>[\s\S]*?<\/\1>/gi;

/**
 * Pattern nhận diện citation link dạng [tên file](doc_id: uuid) do LLM generate.
 * ReactMarkdown không parse `doc_id:` là valid URL scheme nên cần pre-process
 * thành `citation://uuid` để ReactMarkdown tạo được <a> tag cho override.
 */
const CITATION_LINK_PATTERN = /\[([^\]]+)\]\(doc_id:\s*([a-f0-9-]+)\)/g;

function cleanContent(content: string): string {
  return content.replace(LLM_TAG_PATTERN, '').trim();
}

/**
 * Chuyển đổi `[tên_file](doc_id: uuid)` → `[tên_file](citation://uuid)`
 * để ReactMarkdown parse thành <a href="citation://uuid"> và override renderer
 * có thể detect + render thành CitationBadge.
 */
function preprocessCitations(content: string): string {
  return content.replace(CITATION_LINK_PATTERN, (_, fileName, docId) => {
    return `[${fileName}](citation://${docId.trim()})`;
  });
}

/**
 * Chuyển đổi inline citation numbers [1], [2], [3]... thành
 * markdown links đặc biệt để ReactMarkdown có thể override render.
 *
 * Pattern: [N] (N là số 1-99, đứng một mình hoặc sau text)
 * Chuyển thành: [↗N](cite://N) — ReactMarkdown sẽ tạo <a href="cite://N">
 *
 * KHÔNG chuyển [N] nếu nó nằm trong:
 * - Đầu một markdown link: [text](url)
 * - Đã là citation link
 */
function preprocessInlineCitations(content: string): string {
  // Bước 1: Normalize [Đoạn N] → [N] (LLM đôi khi sinh sai format)
  const normalized = content.replace(
    /\[Đoạn (\d{1,2})\](?!\()/g,
    (match, num) => {
      const n = parseInt(num, 10);
      if (n < 1 || n > 20) return match;
      return `[${num}]`;
    },
  );
  // Bước 2: Convert [N] → cite:// link
  // Negative lookahead: không match nếu sau đó là ( (tránh [1](url))
  // Lưu ý: không dùng negative lookbehind cho ] vì sẽ bỏ sót [2][3]
  // khi chúng đứng ngay sau [1] (] từ citation trước kích hoạt lookbehind).
  // AI không bao giờ tạo reference-style Markdown links [text][N] nên an toàn.
  return normalized.replace(
    /\[(\d{1,2})\](?!\()/g,
    (match, num) => {
      const n = parseInt(num, 10);
      if (n < 1 || n > 20) return match; // Chỉ xử lý 1-20
      return `[↗${num}](cite://${num})`;
    },
  );
}

/**
 * ThinkingIndicator — hiển thị trạng thái "đang suy nghĩ" kiểu ChatGPT/Claude.
 * Có đếm thời gian elapsed và thay đổi message theo thời gian chờ.
 */
function ThinkingIndicator() {
  const t = useTranslations('chat');
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Progressive messages based on wait time
  const getMessage = () => {
    if (elapsed < 5) return t('streaming.thinking');
    if (elapsed < 15) return t('streaming.analyzing');
    if (elapsed < 30) return t('streaming.processing');
    return t('streaming.longWait');
  };

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Animated wave dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full bg-amber-500"
            style={{
              animation: 'thinking-bounce 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
        {getMessage()}
      </span>

      {/* Elapsed timer */}
      {elapsed >= 10 && (
        <span className="text-xs text-muted-foreground/50 tabular-nums">
          {t('streaming.elapsed', { seconds: elapsed })}
        </span>
      )}
    </div>
  );
}

export function MessageBubble({
  message,
  isStreaming = false,
  onCitationClick,
  citationIndexMap,
  allMessages = [],
  messageIndex = 0,
  citations = [],
  onFeedbackChange,
  onFeedbackSubmit,
  onRetry,
  globalIsStreaming = false,
  onMessageSelect,
  isSelected = false,
  onSuggestionSelect,
  onExplainMore,
  onShowExample,
}: MessageBubbleProps) {
  const t = useTranslations('chat');
  const isUser = message.role === 'USER';

  // Phase 59 — Lightbox state cho ảnh upload
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  // Infer messageType nếu chưa có (từ DB không lưu messageType)
  const effectiveMessageType = inferMessageType(message, allMessages, messageIndex);

  // Parse CLARIFY_NEEDED format từ AI service
  const clarifyPayload = !isUser ? parseClarifyNeeded(message.content) : null;

  // Phase 59 — Separate images and non-image files from uploadFiles
  const uploadImages = message.uploadFiles?.filter((f) => f.isImage) ?? [];
  const uploadDocs = message.uploadFiles?.filter((f) => !f.isImage) ?? [];

  const handleImageClick = async (fileId: string, fileName: string) => {
    try {
      const url = getUploadDownloadUrl(fileId);
      const token = localStorage.getItem('dms_access_token');
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const blob = await res.blob();
      setLightboxSrc(URL.createObjectURL(blob));
      setLightboxAlt(fileName);
    } catch {
      // Nếu không lấy được URL, ignore
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] min-w-0">
          {/* Phase 59 — Upload files hiển thị trên text */}
          {(uploadImages.length > 0 || uploadDocs.length > 0) && (
            <div className="mb-1.5 flex flex-wrap gap-1.5 justify-end">
              {uploadImages.map((img) => (
                <AuthImage
                  key={img.id}
                  fileId={img.id}
                  alt={img.fileName}
                  className="max-w-[300px] max-h-[200px] object-cover rounded-lg"
                  onClick={() => handleImageClick(img.id, img.fileName)}
                />
              ))}
              {uploadDocs.map((doc) => (
                <FileCardBubble key={doc.id} file={doc} />
              ))}
            </div>
          )}
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
            <p
              className="text-sm leading-relaxed"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {message.content}
            </p>
            {/* Phase 56 — Mention tags trong user messages (ẩn khi explain — xử lý ngầm) */}
            {message.contextDocumentIds && (message.contextDocumentIds as string[]).length > 0 && message.messageType !== 'explain' && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(message.contextDocumentIds as string[]).map((docId, idx) => {
                  const docName = (message.contextDocumentNames as string[])?.[idx] || 'Tài liệu';
                  return (
                    <span
                      key={docId}
                      className="inline-flex items-center gap-1 px-2 py-0.5
                        bg-blue-100/20 text-blue-200
                        rounded-md text-xs font-medium border border-blue-200/30"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{docName}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formatTime(message.createdAt)}
          </p>
        </div>
        {/* Phase 59 — Image lightbox */}
        {lightboxSrc && (
          <ImageLightbox
            src={lightboxSrc}
            alt={lightboxAlt}
            open={!!lightboxSrc}
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </div>
    );
  }

  const cleaned = preprocessInlineCitations(
    preprocessCitations(cleanContent(message.content)),
  );

  // Handler click vào message AI để hiển thị citations tương ứng
  const handleMessageClick = (e: React.MouseEvent) => {
    // Không xử lý nếu click vào button (action bar, citation badge, etc.)
    if ((e.target as HTMLElement).closest('button')) return;
    if (message.role !== 'ASSISTANT' || isStreaming) return;
    // Toggle: click lại message đang chọn → bỏ chọn (hiện citations message cuối)
    onMessageSelect?.(isSelected ? null : message.id);
  };

  return (
    <div className="flex justify-start min-w-0">
      <div
        className={`flex-1 min-w-0 overflow-hidden ${
          message.role === 'ASSISTANT' && !isStreaming
            ? 'cursor-pointer group/msg'
            : ''
        }`}
        onClick={handleMessageClick}
      >
        {/* Phase 40 — Badge "Tóm tắt" cho summarize messages */}
        {effectiveMessageType === 'summarize' && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
              <FileText className="h-3 w-3" />
              {t('badges.summarize')}
            </span>
          </div>
        )}
        {/* Phase 44 — Badge tím "So sánh" cho diff messages */}
        {(effectiveMessageType === 'diff' || effectiveMessageType === 'compare') && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
              <GitCompareArrows className="h-3 w-3" />
              {t('badges.diff')}
            </span>
          </div>
        )}
        {/* Phase 61 — Badge xanh lá "Dịch thuật" cho translate messages */}
        {effectiveMessageType === 'translate' && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
              <Languages className="h-3 w-3" />
              {t('badges.translate')}
            </span>
          </div>
        )}
        {/* Phase 71 — Badge sky "Giải thích" cho explain messages */}
        {effectiveMessageType === 'explain' && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-full text-xs font-medium">
              <BookOpen className="h-3 w-3" />
              {t('badges.explain')}
            </span>
          </div>
        )}
        {/* Phase 71 — Badge amber "Ví dụ" cho example messages */}
        {effectiveMessageType === 'example' && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
              <Lightbulb className="h-3 w-3" />
              {t('badges.example')}
            </span>
          </div>
        )}
        {/* Phase 70 — Badge amber "Tóm tắt phiên" cho SYSTEM_SUMMARY messages */}
        {message.role === 'SYSTEM_SUMMARY' && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
              <FileText className="h-3 w-3" />
              {t('badges.sessionSummary')}
            </span>
          </div>
        )}
        {/* Phase 59 — Upload files hiển thị trước text content */}
        {(uploadImages.length > 0 || uploadDocs.length > 0) && (
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {uploadImages.map((img) => (
              <AuthImage
                key={img.id}
                fileId={img.id}
                alt={img.fileName}
                className="max-w-[300px] max-h-[200px] object-cover rounded-lg"
                onClick={() => handleImageClick(img.id, img.fileName)}
              />
            ))}
            {uploadDocs.map((doc) => (
              <FileCardBubble key={doc.id} file={doc} />
            ))}
          </div>
        )}
        <div className={`rounded-2xl rounded-bl-md px-4 py-3 overflow-hidden transition-all border-l-4 ${
          isSelected
            ? 'bg-amber-50 dark:bg-amber-950/30 border-l-amber-500 shadow-sm'
            : 'bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-zinc-800 dark:to-zinc-800/80 border-l-amber-300 dark:border-l-amber-600 group-hover/msg:border-l-amber-500 dark:group-hover/msg:border-l-amber-400'
        }`}>
          {clarifyPayload ? (
            <ClarificationCard payload={clarifyPayload} onSelect={onSuggestionSelect} />
          ) : isStreaming ? (
            cleaned.trim() ? (
              // Đã nhận chunk — hiển thị text + blinking cursor
              <p
                className="text-sm leading-relaxed"
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
              >
                {cleaned}
                <span className="inline-block w-0.5 h-4 bg-foreground/60 ml-0.5 animate-pulse align-middle" />
              </p>
            ) : (
              // Chưa nhận chunk — thinking animation với elapsed timer
              <ThinkingIndicator />
            )
          ) : (
            // Stream xong: render full markdown với citation badges
            <TooltipProvider>
              <div
                className="prose prose-sm dark:prose-invert max-w-none
                  prose-p:my-1.5 prose-p:leading-relaxed
                  prose-headings:font-semibold prose-headings:leading-snug
                  prose-h1:text-base prose-h1:mt-4 prose-h1:mb-2
                  prose-h2:text-sm prose-h2:mt-3 prose-h2:mb-1.5
                  prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1
                  prose-ul:my-1.5 prose-ul:ml-4
                  prose-ol:my-1.5 prose-ol:ml-4
                  prose-li:my-0.5 prose-li:leading-relaxed
                  prose-blockquote:border-l-4 prose-blockquote:border-primary/40
                  prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground
                  prose-a:text-primary prose-a:underline prose-a:underline-offset-2
                  prose-table:text-xs prose-th:font-semibold
                  prose-hr:border-border
                  [&_*]:break-words
                  [&_pre]:my-2 [&_pre]:rounded-xl [&_pre]:overflow-x-auto
                  [&_pre]:bg-slate-50 [&_pre]:dark:bg-zinc-800
                  [&_pre]:border [&_pre]:border-slate-200 [&_pre]:dark:border-zinc-700
                  [&_pre]:shadow-sm
                  [&_pre_code]:bg-transparent [&_pre_code]:p-0
                  [&_pre_code]:text-xs [&_pre_code]:font-mono [&_pre_code]:leading-relaxed
                  [&_:not(pre)>code]:text-xs [&_:not(pre)>code]:font-mono
                  [&_:not(pre)>code]:bg-slate-100 [&_:not(pre)>code]:dark:bg-zinc-700
                  [&_:not(pre)>code]:text-slate-700 [&_:not(pre)>code]:dark:text-zinc-200
                  [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-md
                  [&_:not(pre)>code]:before:content-none [&_:not(pre)>code]:after:content-none"
              >
                <MarkdownRenderer
                  rehypePlugins={[rehypeHighlight]}
                  urlTransform={(url) => {
                    // Cho phép citation:// và cite:// scheme pass qua, các URL khác dùng default sanitize
                    if (url.startsWith('citation://')) return url;
                    if (url.startsWith('cite://')) return url; // Inline citation [N]
                    return defaultUrlTransform(url);
                  }}
                  components={{
                    // Override link renderer để detect citation links (href dạng "citation://uuid")
                    a: ({ href, children, ...props }) => {
                      // Inline citation number badge [N] — từ preprocessInlineCitations
                      if (href && href.startsWith('cite://')) {
                        const segNum = parseInt(href.replace('cite://', ''), 10);
                        // Lookup citation bằng segment_number hoặc index 1-based
                        const citation =
                          citations.find(
                            (c) => (c as { segment_number?: number }).segment_number === segNum,
                          ) || citations[segNum - 1];
                        return (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  // Trigger highlight citation card có segment_number === segNum
                                  onCitationClick?.(`segment:${segNum}`);
                                }}
                                className="inline-flex items-center justify-center
                                  w-5 h-5 mx-0.5 rounded-full
                                  bg-primary/15 hover:bg-primary/25
                                  text-primary text-[10px] font-bold
                                  transition-colors cursor-pointer
                                  align-super"
                              >
                                {segNum}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[300px] p-3 text-left">
                              <p className="text-xs font-medium mb-1">
                                {citation?.file_name || `Trích dẫn [${segNum}]`}
                              </p>
                              {citation?.chunk_text && (
                                <>
                                  <p className="text-xs text-muted-foreground italic line-clamp-6">
                                    &ldquo;{citation.chunk_text.slice(0, 200)}{citation.chunk_text.length > 200 ? '...' : ''}&rdquo;
                                  </p>
                                  {citation.chunk_text.length > 200 && (
                                    <p className="text-[10px] text-primary mt-1">{t('citations.viewMore')}</p>
                                  )}
                                </>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      if (href && href.startsWith('citation://')) {
                        const docId = href.replace('citation://', '').trim();
                        const fileName =
                          typeof children === 'string'
                            ? children
                            : Array.isArray(children)
                              ? children
                                  .map((c) => (typeof c === 'string' ? c : ''))
                                  .join('')
                              : String(children ?? '');
                        const index = citationIndexMap?.get(docId) ?? 0;
                        // Lookup chunk_text từ citations array
                        const matchingCitation = citations.find((c) => c.doc_id === docId);
                        return (
                          <CitationBadge
                            fileName={fileName}
                            docId={docId}
                            index={index}
                            onCitationClick={onCitationClick}
                            chunkText={matchingCitation?.chunk_text}
                          />
                        );
                      }
                      // Link thường — render bình thường
                      return (
                        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {cleaned}
                </MarkdownRenderer>
              </div>
            </TooltipProvider>
          )}
        </div>
        {/* Phase 47 — Action bar: chỉ render cho ASSISTANT messages sau khi stream xong */}
        {message.role === 'ASSISTANT' && !isStreaming && onFeedbackChange && onFeedbackSubmit && (
          <MessageActionBar
            messageId={message.id}
            content={message.content}
            feedbackType={message.feedbackType ?? null}
            feedbackTags={message.feedbackTags}
            feedbackText={message.feedbackText}
            onFeedbackChange={onFeedbackChange}
            onFeedbackSubmit={onFeedbackSubmit}
            onRetry={onRetry}
            isStreaming={globalIsStreaming}
            // Phase 71 — extract unique doc_ids + tên file từ sources của message AI này
            sourceDocIds={
              message.sources
                ? Array.from(new Map(message.sources.filter(s => s.doc_id).map(s => [s.doc_id, s])).keys())
                : []
            }
            sourceDocNames={
              message.sources
                ? Array.from(new Map(message.sources.filter(s => s.doc_id).map(s => [s.doc_id, s])).values()).map(s => s.file_name || '')
                : []
            }
            onExplainMore={onExplainMore ?? (() => {})}
            onShowExample={onShowExample ?? (() => {})}
          />
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(message.createdAt)}
        </p>
      </div>
      {/* Phase 59 — Image lightbox */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          open={!!lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}
