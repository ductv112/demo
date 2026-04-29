'use client';

import { useEffect, useRef, useState } from 'react';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getDocumentExtractedText, getChunkOriginalText } from '@/lib/documents-api';

export interface CitationTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docId: string | null;
  docName?: string;
  chunkText?: string | null;
  chunkIndex?: number;   // Qdrant chunk_index (0-based) — nếu có sẽ lấy full text
}

export function CitationTextDialog({
  open,
  onOpenChange,
  docId,
  docName,
  chunkText,
  chunkIndex,
}: CitationTextDialogProps) {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullChunkText, setFullChunkText] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !docId) return;
    setExtractedText(null);
    setError(null);
    setIsLoading(true);
    getDocumentExtractedText(docId)
      .then((data) => setExtractedText(data.extractedText ?? null))
      .catch(() => setError('Không thể tải nội dung tài liệu. Vui lòng thử lại.'))
      .finally(() => setIsLoading(false));
  }, [open, docId]);

  function cleanChunkText(chunk: string): string {
    return chunk
      .replace(/^[""\u201c\u201d]+/, '')
      .replace(/[""\u201c\u201d]+$/, '')
      .replace(/^\d+\s+/, '')
      .trim();
  }

  // Tách chunk thành các câu nhỏ, lọc câu quá ngắn
  function splitSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?:;])\s+|\n+|\|\|/)  // split cả trên || — rows trong OCR CSV thường nối bằng ||
      .map((s) => s.trim())
      .filter((s) => s.length >= 15)
      // Lọc bỏ separator rows (chỉ có dấu - và |) — remark-gfm không render chúng ra DOM
      .filter((s) => !/^[\s|:\-]+$/.test(s));
  }

  /**
   * Normalize text để matching: bỏ ký tự markdown (|), collapse whitespace, lowercase.
   * chunk_text từ CSV/table chứa "|" nhưng DOM textContent của <tr> thì không.
   */
  // Xóa | và toàn bộ whitespace để so sánh — cells trong DOM bị nối liền không có separator
  function norm(text: string): string {
    return text.replace(/[|\s]/g, '').toLowerCase();
  }

  function sentenceMatches(sentence: string, blockText: string): boolean {
    const ns = norm(sentence);
    const nb = norm(blockText);
    if (nb.includes(ns)) return true;
    // Fallback: 40 ký tự đầu (đủ distinctive)
    const key = ns.slice(0, 40);
    return key.length >= 10 && nb.includes(key);
  }

  /**
   * DOM post-processing: highlight các block-level elements (tr, p, li, h1-h6)
   * có chứa bất kỳ sentence nào từ chunk_text.
   *
   * Tương tự cách version-diff-viewer highlight diffs — render markdown trước,
   * sau đó walk DOM để tô màu. Cách này không động vào markdown source nên
   * table luôn được parse đúng bởi remark-gfm.
   */
  function applyHighlights(containerEl: HTMLElement, sentences: string[]): HTMLElement | null {
    if (sentences.length === 0) return null;

    let firstHighlighted: HTMLElement | null = null;

    const markEl = (el: HTMLElement) => {
      el.style.backgroundColor = 'rgb(254 240 138)';
      // Tô màu cả td/th bên trong — Tailwind prose set bg trên <th> sẽ override <tr> bg
      el.querySelectorAll<HTMLElement>('td, th').forEach((cell) => {
        cell.style.backgroundColor = 'rgb(254 240 138)';
      });
      el.setAttribute('data-citation-highlight', 'true');
      if (!firstHighlighted) firstHighlighted = el;
    };

    // Table rows — bao gồm cả header
    for (const row of Array.from(containerEl.querySelectorAll<HTMLElement>('tr'))) {
      const text = row.textContent ?? '';
      if (sentences.some((s) => sentenceMatches(s, text))) markEl(row);
    }

    // Paragraphs — bỏ qua nếu cha là table cell (đã covered bởi tr)
    for (const p of Array.from(containerEl.querySelectorAll<HTMLElement>('p'))) {
      if (p.closest('td, th')) continue;
      const text = p.textContent ?? '';
      if (sentences.some((s) => sentenceMatches(s, text))) {
        markEl(p);
        p.style.borderRadius = '4px';
        p.style.padding = '2px 6px';
      }
    }

    // List items
    for (const li of Array.from(containerEl.querySelectorAll<HTMLElement>('li'))) {
      const text = li.textContent ?? '';
      if (sentences.some((s) => sentenceMatches(s, text))) markEl(li);
    }

    // Headings
    for (const h of Array.from(containerEl.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6'))) {
      const text = h.textContent ?? '';
      if (sentences.some((s) => sentenceMatches(s, text))) {
        markEl(h);
        h.style.borderRadius = '4px';
        h.style.padding = '2px 6px';
      }
    }

    return firstHighlighted;
  }

  // Fetch full original_text từ Qdrant khi có chunkIndex
  useEffect(() => {
    if (!open || !docId || chunkIndex === undefined || chunkIndex === null) {
      setFullChunkText(null);
      return;
    }
    let cancelled = false;
    getChunkOriginalText(docId, chunkIndex)
      .then(({ original_text }) => {
        if (!cancelled) setFullChunkText(original_text);
      })
      .catch(() => {
        if (!cancelled) setFullChunkText(null);
      });
    return () => { cancelled = true; };
  }, [open, docId, chunkIndex]);

  // Áp dụng highlight sau khi markdown render xong
  useEffect(() => {
    const effectiveChunk = fullChunkText ?? chunkText;
    if (!extractedText || !effectiveChunk || !containerRef.current) return;

    const cleanChunk = cleanChunkText(effectiveChunk);
    const sentences = splitSentences(cleanChunk);

    if (sentences.length === 0) return;

    // Đợi 1 tick để MarkdownRenderer render xong DOM
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const first = applyHighlights(containerRef.current, sentences);
      if (first) {
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [extractedText, fullChunkText, chunkText]);

  // Đếm số elements đã highlight để hiển thị badge
  const [highlightCount, setHighlightCount] = useState(0);
  useEffect(() => {
    if (!containerRef.current) return;
    const timer = setTimeout(() => {
      const count = containerRef.current?.querySelectorAll('[data-citation-highlight]').length ?? 0;
      setHighlightCount(count);
    }, 200);
    return () => clearTimeout(timer);
  }, [extractedText, fullChunkText, chunkText]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">
            {docName ?? 'Nội dung tài liệu'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading && (
            <p className="text-muted-foreground text-sm">Đang tải nội dung...</p>
          )}
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          {!isLoading && !error && extractedText && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Toàn bộ nội dung{' '}
                {highlightCount > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    · {highlightCount} đoạn được đánh dấu
                  </span>
                )}
              </p>
              <div
                ref={containerRef}
                className="prose prose-sm dark:prose-invert max-w-none
                  prose-headings:text-base prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
                  prose-h1:text-base prose-h2:text-base prose-h3:text-sm"
              >
                <MarkdownRenderer>{extractedText}</MarkdownRenderer>
              </div>
            </div>
          )}
          {!isLoading && !error && !extractedText && (
            <p className="text-muted-foreground text-sm">Tài liệu này chưa có nội dung trích xuất.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}