'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import { useTranslations } from 'next-intl';
import {DiffEditor, type MonacoDiffEditor} from '@monaco-editor/react';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import {Eye, FileText, Loader2, Sparkles, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {getVersionText} from '@/lib/documents-api';

interface VersionDiffViewerProps {
  documentId: string;
  documentName: string;
  oldVersionNumber: number;
  newVersionNumber: number;
  onClose: () => void;
}

/**
 * Loại bỏ ảnh khỏi text để dùng cho Monaco diff editor (raw mode).
 */
function stripImagesForDiff(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<img[^>]*\/?>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Lấy text content của element, bỏ qua tất cả thẻ <img>.
 * Dùng để so sánh text thuần mà không bị ảnh ảnh hưởng.
 */
function getTextWithoutImages(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll('img').forEach(img => img.remove());
  return clone.textContent?.trim() ?? '';
}

/**
 * Highlight khác biệt giữa 2 cột rendered markdown bằng DOM post-processing.
 * So sánh text content của các block-level elements (tr, p, li, h1-h6) giữa 2 container.
 * Elements chỉ chứa ảnh (không có text) sẽ bị bỏ qua — ảnh vẫn hiển thị bình thường.
 */
function highlightDiffs(leftEl: HTMLElement, rightEl: HTMLElement) {
  // So sánh table rows
  const leftRows = Array.from(leftEl.querySelectorAll('tr'));
  const rightRows = Array.from(rightEl.querySelectorAll('tr'));
  const maxRows = Math.max(leftRows.length, rightRows.length);
  for (let i = 0; i < maxRows; i++) {
    const leftText = leftRows[i] ? getTextWithoutImages(leftRows[i]) : '';
    const rightText = rightRows[i] ? getTextWithoutImages(rightRows[i]) : '';
    if (leftText !== rightText) {
      if (leftRows[i]) leftRows[i].style.backgroundColor = 'rgb(254 202 202)';
      if (rightRows[i]) rightRows[i].style.backgroundColor = 'rgb(254 240 138)';
    }
  }

  // So sánh paragraphs — lọc bỏ elements chỉ chứa ảnh để tránh lệch index
  const allLeftPs = Array.from(leftEl.querySelectorAll(':scope > .prose > p, :scope > .prose > div > p'));
  const allRightPs = Array.from(rightEl.querySelectorAll(':scope > .prose > p, :scope > .prose > div > p'));
  const leftPs = allLeftPs.filter(p => getTextWithoutImages(p) !== '');
  const rightPs = allRightPs.filter(p => getTextWithoutImages(p) !== '');
  const maxPs = Math.max(leftPs.length, rightPs.length);
  for (let i = 0; i < maxPs; i++) {
    const leftText = leftPs[i] ? getTextWithoutImages(leftPs[i]) : '';
    const rightText = rightPs[i] ? getTextWithoutImages(rightPs[i]) : '';
    if (leftText !== rightText) {
      if (leftPs[i]) {
        (leftPs[i] as HTMLElement).style.backgroundColor = 'rgb(254 202 202)';
        (leftPs[i] as HTMLElement).style.borderRadius = '4px';
        (leftPs[i] as HTMLElement).style.padding = '2px 4px';
      }
      if (rightPs[i]) {
        (rightPs[i] as HTMLElement).style.backgroundColor = 'rgb(254 240 138)';
        (rightPs[i] as HTMLElement).style.borderRadius = '4px';
        (rightPs[i] as HTMLElement).style.padding = '2px 4px';
      }
    }
  }

  // So sánh list items
  const leftLis = Array.from(leftEl.querySelectorAll('li'));
  const rightLis = Array.from(rightEl.querySelectorAll('li'));
  const maxLis = Math.max(leftLis.length, rightLis.length);
  for (let i = 0; i < maxLis; i++) {
    const leftText = leftLis[i] ? getTextWithoutImages(leftLis[i]) : '';
    const rightText = rightLis[i] ? getTextWithoutImages(rightLis[i]) : '';
    if (leftText !== rightText) {
      if (leftLis[i]) leftLis[i].style.backgroundColor = 'rgb(254 202 202)';
      if (rightLis[i]) rightLis[i].style.backgroundColor = 'rgb(254 240 138)';
    }
  }

  // So sánh headings
  for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
    const leftHs = Array.from(leftEl.querySelectorAll(tag));
    const rightHs = Array.from(rightEl.querySelectorAll(tag));
    const maxHs = Math.max(leftHs.length, rightHs.length);
    for (let i = 0; i < maxHs; i++) {
      const leftText = leftHs[i] ? getTextWithoutImages(leftHs[i]) : '';
      const rightText = rightHs[i] ? getTextWithoutImages(rightHs[i]) : '';
      if (leftText !== rightText) {
        if (leftHs[i]) (leftHs[i] as HTMLElement).style.backgroundColor = 'rgb(254 202 202)';
        if (rightHs[i]) (rightHs[i] as HTMLElement).style.backgroundColor = 'rgb(254 240 138)';
      }
    }
  }
}

export function VersionDiffViewer({
  documentId,
  documentName,
  oldVersionNumber,
  newVersionNumber,
  onClose,
}: VersionDiffViewerProps) {
  const t = useTranslations('documents');
  const [oldText, setOldText] = useState<string | null>(null); // stripped, for Monaco raw diff
  const [newText, setNewText] = useState<string | null>(null); // stripped, for Monaco raw diff
  const [oldDisplayText, setOldDisplayText] = useState<string | null>(null); // original with images, for rendered view
  const [newDisplayText, setNewDisplayText] = useState<string | null>(null); // original with images, for rendered view
  const [isLoadingTexts, setIsLoadingTexts] = useState<boolean>(true);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isStreamingSummary, setIsStreamingSummary] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'raw' | 'rendered'>('rendered');

  const abortControllerRef = useRef<AbortController | null>(null);
  const diffEditorRef = useRef<MonacoDiffEditor | null>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  // Cleanup DiffEditor khi component unmount
  useEffect(() => {
    return () => {
      if (diffEditorRef.current) {
        try { diffEditorRef.current.dispose(); } catch { /* ignore */ }
        diffEditorRef.current = null;
      }
    };
  }, []);

  // Dispose Monaco trước khi chuyển sang rendered mode
  const switchToRendered = useCallback(() => {
    if (diffEditorRef.current) {
      try { diffEditorRef.current.dispose(); } catch { /* ignore */ }
      diffEditorRef.current = null;
    }
    setViewMode('rendered');
  }, []);

  // Highlight diffs sau khi rendered mode mount xong
  useEffect(() => {
    if (viewMode !== 'rendered' || !leftColRef.current || !rightColRef.current) return;
    // Đợi 1 tick để MarkdownRenderer render xong
    const timer = setTimeout(() => {
      if (leftColRef.current && rightColRef.current) {
        highlightDiffs(leftColRef.current, rightColRef.current);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [viewMode, oldDisplayText, newDisplayText]);

  // Fetch cả 2 version texts song song khi mount
  useEffect(() => {
    let cancelled = false;

    const fetchTexts = async () => {
      setIsLoadingTexts(true);
      setError(null);
      setOldText(null);
      setNewText(null);
      setOldDisplayText(null);
      setNewDisplayText(null);
      setAiSummary('');
      setIsStreamingSummary(false);

      try {
        const [oldResult, newResult] = await Promise.all([
          getVersionText(documentId, oldVersionNumber),
          getVersionText(documentId, newVersionNumber),
        ]);

        if (cancelled) return;

        if (oldResult === null) {
          setError(t('diff.noOldContent', { version: oldVersionNumber }));
          setIsLoadingTexts(false);
          return;
        }

        if (newResult === null) {
          setError(t('diff.noNewContent', { version: newVersionNumber }));
          setIsLoadingTexts(false);
          return;
        }

        setOldText(stripImagesForDiff(oldResult));
        setNewText(stripImagesForDiff(newResult));
        setOldDisplayText(oldResult);
        setNewDisplayText(newResult);
        setIsLoadingTexts(false);
      } catch {
        if (!cancelled) {
          setError(t('diff.loadError'));
          setIsLoadingTexts(false);
        }
      }
    };

    fetchTexts();

    return () => {
      cancelled = true;
    };
  }, [documentId, oldVersionNumber, newVersionNumber]);

  // Auto-stream AI summary khi cả 2 texts đã tải xong
  const streamAiSummary = useCallback(async () => {
    if (oldText === null || newText === null) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAiSummary('');
    setIsStreamingSummary(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `So sánh phiên bản ${oldVersionNumber} và ${newVersionNumber} của: ${documentName}`,
          requestType: 'diff',
          documentId,
          documentName,
          oldVersionNumber,
          newVersionNumber,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        setIsStreamingSummary(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let currentEvent = '';
        let currentDataParts: string[] = [];

        for (const rawLine of lines) {
          const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;

          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const raw = line.slice(5);
            const dataPart = raw.startsWith(' ') ? raw.slice(1) : raw;
            currentDataParts.push(dataPart);
          } else if (line === '') {
            if (currentDataParts.length > 0) {
              const data = currentDataParts.join('\n');
              if (data) {
                if (currentEvent === 'chunk') {
                  setAiSummary((prev) => prev + data);
                } else if (currentEvent === 'done') {
                  setIsStreamingSummary(false);
                } else if (currentEvent === 'error') {
                  setIsStreamingSummary(false);
                }
              }
            }
            currentEvent = '';
            currentDataParts = [];
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setIsStreamingSummary(false);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsStreamingSummary(false);
      }
    }
  }, [oldText, newText, documentId, documentName, oldVersionNumber, newVersionNumber]);

  useEffect(() => {
    if (oldText !== null && newText !== null) {
      streamAiSummary();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [oldText, newText]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-slate-50 to-sky-50/30 shrink-0">
        <span className="text-sm font-semibold text-slate-700">
          {t('diff.title')}: v{oldVersionNumber} ↔ v{newVersionNumber}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={switchToRendered}
              className={`gap-1 h-7 text-xs transition-colors ${viewMode === 'rendered'
                ? 'bg-white text-blue-700 shadow-sm border border-blue-200 hover:bg-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              <Eye className="h-3 w-3" />
              Hiển thị
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('raw')}
              className={`gap-1 h-7 text-xs transition-colors ${viewMode === 'raw'
                ? 'bg-white text-violet-700 shadow-sm border border-violet-200 hover:bg-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              <FileText className="h-3 w-3" />
              Dạng thô
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-1 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300"
          >
            <X className="h-4 w-4" />
            {t('diff.close')}
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center flex-1 p-8 text-center text-muted-foreground">
          <div className="space-y-2">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoadingTexts && !error && (
        <div className="flex items-center justify-center flex-1 gap-2 p-4 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">{t('diff.loading')}</span>
        </div>
      )}

      {/* Diff content + AI Summary */}
      {!isLoadingTexts && !error && oldDisplayText !== null && newDisplayText !== null && oldText !== null && newText !== null && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Diff content — 60% height */}
          <div style={{ flex: '3 1 0', minHeight: 0 }}>
            {viewMode === 'rendered' ? (
              <div className="flex h-full min-h-0">
                {/* Cột trái - phiên bản cũ */}
                <div className="flex-1 flex flex-col overflow-hidden border-r">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-red-50 dark:bg-red-900/20 border-b shrink-0">
                    v{oldVersionNumber} (cũ)
                  </div>
                  <div ref={leftColRef} className="flex-1 overflow-y-auto p-4">
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer>{oldDisplayText}</MarkdownRenderer>
                    </div>
                  </div>
                </div>
                {/* Cột phải - phiên bản mới */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-green-50 dark:bg-green-900/20 border-b shrink-0">
                    v{newVersionNumber} (mới)
                  </div>
                  <div ref={rightColRef} className="flex-1 overflow-y-auto p-4">
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer>{newDisplayText}</MarkdownRenderer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <DiffEditor
                height="100%"
                language="plaintext"
                original={oldText}
                modified={newText}
                onMount={(editor) => {
                  diffEditorRef.current = editor;
                }}
                options={{
                  readOnly: true,
                  renderSideBySide: true,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
                theme="vs-light"
              />
            )}
          </div>

          {/* AI Summary Panel — 40% height */}
          {(isStreamingSummary || aiSummary) && (
            <div className="border-t flex flex-col" style={{ flex: '2 1 0', minHeight: '200px' }}>
              {/* Panel Header */}
              <div className="px-4 py-2 border-b bg-purple-50 dark:bg-purple-900/20 flex items-center gap-2 shrink-0">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                   {t('diff.aiSummary')}
                </span>
                {isStreamingSummary && (
                  <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
                )}
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer>
                    {aiSummary || t('diff.analyzing')}
                  </MarkdownRenderer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
