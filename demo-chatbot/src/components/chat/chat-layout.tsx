'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Upload } from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import { SessionList } from './session-list';
import { ChatHeader } from './chat-header';
import { ChatArea } from './chat-area';
import { ChatInput } from './chat-input';
import { CitationsPanel } from './citations-panel';
import { DocumentPreviewDialog } from '@/components/documents/document-preview-dialog';
import { SummarizeDocumentDialog } from './summarize-document-dialog';
import { DiffVersionDialog } from './diff-version-dialog';
import { CompareDocumentsDialog } from './compare-documents-dialog';
import { TranslateDialog } from './translate-dialog';
import { CitationTextDialog } from './citation-text-dialog';
import { ContextWindowBanner } from './context-window-banner';
import { getDocumentById } from '@/lib/documents-api';
import { toast } from 'sonner';
import { getReferencedDocuments } from '@/lib/chat-api';
import type { Document } from '@/types/document';
import type { Citation, ReferencedDocument } from '@/types/chat';

export function ChatLayout() {
  const t = useTranslations('chat');
  const {
    sessions,
    selectedSessionId,
    messages,
    citations,
    isStreaming,
    isLoadingSessions,
    isLoadingMessages,
    sendMessage,
    sendSummarize,
    sendDiff,
    sendCompare,
    sendTranslate,
    updateFeedback,
    submitFeedback,
    updateLanguage,
    loadSessions,
    selectSession,
    createSession,
    deleteSession,
    updateSessionTitle,
    generateSessionTitle,
    generatingTitleIds,
    generateSessionSummary,
    isGeneratingSummary,
    cancelStreaming,
    retryMessage,
  } = useChat();

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

  // State quản lý citation đang được highlight trong sidebar
  const [activeCitationId, setActiveCitationId] = useState<string | null>(null);

  // State quản lý message AI đang được chọn để hiển thị citations
  // null = hiển thị citations của message AI cuối cùng (mặc định)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // State quản lý document preview dialog
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [highlightText, setHighlightText] = useState<string | null>(null);

  // Phase 72.1.1 (D-07..D-12) — Tab "Tài liệu đã dùng"
  const [referencedDocs, setReferencedDocs] = useState<ReferencedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Phase 59 — Drag handlers từ ChatInput cho drop zone toàn bộ chat area
  const dragHandlersRef = useRef<{
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Phase 65 — Suggestion card pre-fill
  const [prefillText, setPrefillText] = useState<string | undefined>(undefined);

  const handleDragHandlersReady = useCallback((handlers: typeof dragHandlersRef.current) => {
    dragHandlersRef.current = handlers;
  }, []);

  // Phase 40 — Summarize document dialog state
  const [summarizeDialogOpen, setSummarizeDialogOpen] = useState(false);

  // Phase 44 — Diff version dialog state
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);

  // Phase 61 — Translate dialog state
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);

  // Phase 64.1 — Citation text dialog state
  const [citationTextDialogOpen, setCitationTextDialogOpen] = useState(false);
  const [citationTextDocId, setCitationTextDocId] = useState<string | null>(null);
  const [citationTextDocName, setCitationTextDocName] = useState<string | undefined>(undefined);
  const [citationTextChunk, setCitationTextChunk] = useState<string | null>(null);
  const [citationTextChunkIndex, setCitationTextChunkIndex] = useState<number | undefined>(undefined);

  // Phase 44.1 — Compare documents dialog state
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [comparePreSelectedDocId, setComparePreSelectedDocId] = useState<string | undefined>(undefined);
  const [comparePreSelectedDocName, setComparePreSelectedDocName] = useState<string | undefined>(undefined);

  // Phase 49 — Multi-language state
  const [multiLangEnabled, setMultiLangEnabled] = useState(false);
  const [queryLang, setQueryLang] = useState('vi');
  const [responseLang, setResponseLang] = useState('vi');

  // Sync language state từ session mỗi khi session thay đổi
  useEffect(() => {
    if (selectedSession) {
      setMultiLangEnabled(selectedSession.multiLanguageEnabled ?? false);
      setQueryLang(selectedSession.queryLanguage ?? 'vi');
      setResponseLang(selectedSession.responseLanguage ?? 'vi');
    } else {
      // Reset về mặc định khi không có session
      setMultiLangEnabled(false);
      setQueryLang('vi');
      setResponseLang('vi');
    }
  }, [selectedSession?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 44.1 — Đọc URL params từ context menu "So sánh với tài liệu khác"
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const compareDocId = searchParams.get('compare');
    const compareDocName = searchParams.get('compareName');
    if (compareDocId) {
      setComparePreSelectedDocId(compareDocId);
      setComparePreSelectedDocName(compareDocName || undefined);
      setCompareDialogOpen(true);
      // Clear params để tránh re-trigger
      router.replace('/chat');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xác định message AI đang được focus: message được click, hoặc message cuối cùng
  const focusedAiMessage = useMemo(() => {
    if (selectedMessageId) {
      const selected = messages.find((m) => m.id === selectedMessageId && m.role === 'ASSISTANT');
      if (selected) return selected;
    }
    // Mặc định: message AI cuối cùng
    return [...messages].reverse().find((m) => m.role === 'ASSISTANT') ?? null;
  }, [selectedMessageId, messages]);

  // Lấy citations từ message AI đang focus
  // Logic:
  //   1. Mỗi message AI có sources riêng (message.sources) — đây là nguồn chính
  //   2. citations state (từ SSE) chỉ dùng khi message cuối ĐANG stream và chưa có sources trong object
  //   3. KHÔNG fallback sang message cũ — mỗi message hiển thị citations CỦA CHÍNH NÓ
  const referencedCitations = useMemo(() => {
    const lastAiMsg = [...messages].reverse().find((m) => m.role === 'ASSISTANT');
    const isFocusingLastMsg = !selectedMessageId || focusedAiMessage?.id === lastAiMsg?.id;

    // 1. Ưu tiên sources đã lưu trong message object (per-message, chính xác nhất)
    let effectiveCitations = focusedAiMessage?.sources ?? [];

    // 2. Nếu đang focus message cuối VÀ message cuối chưa có sources trong object
    //    (đang stream hoặc vừa stream xong, SSE citations event đã đến nhưng chưa lưu vào message)
    //    → dùng citations state từ SSE real-time
    if (effectiveCitations.length === 0 && isFocusingLastMsg && citations.length > 0) {
      effectiveCitations = citations;
    }

    // KHÔNG fallback sang message cũ — nếu message được focus không có sources, panel ẩn
    if (effectiveCitations.length === 0) return [];

    // 3. Lọc citations chỉ giữ những cái thực sự được reference trong nội dung message
    const targetMsg = focusedAiMessage;
    if (!targetMsg?.content) return effectiveCitations;

    const referencedNums = new Set<number>();
    const inlinePattern = /\[(\d{1,2})\]/g;
    let match;
    while ((match = inlinePattern.exec(targetMsg.content)) !== null) {
      const n = parseInt(match[1], 10);
      if (n >= 1 && n <= 20) referencedNums.add(n);
    }

    // Nếu không tìm thấy [N] nào → hiện hết
    if (referencedNums.size === 0) return effectiveCitations;

    return effectiveCitations.filter((c) => {
      const segNum = (c as { segment_number?: number }).segment_number;
      if (segNum !== undefined) return referencedNums.has(segNum);
      const idx = effectiveCitations.indexOf(c) + 1;
      return referencedNums.has(idx);
    });
  }, [citations, messages, focusedAiMessage, selectedMessageId]);

  // Tạo map doc_id → index (1-based) từ referencedCitations
  const citationIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    referencedCitations.forEach((c, i) => map.set(c.doc_id, i + 1));
    return map;
  }, [referencedCitations]);

  // Handler mở DocumentPreviewDialog bằng cách fetch document theo docId
  const handleOpenDocumentPreview = useCallback(async (docId: string, textToHighlight?: string) => {
    try {
      const doc = await getDocumentById(docId);
      setPreviewDocument(doc);
      setHighlightText(textToHighlight || null);
      setPreviewOpen(true);
    } catch {
      toast.error(t('toast.cannotLoadDoc'));
    }
  }, [t]);

  // Wrapper callback từ CitationsPanel — tìm chunk_text từ citation để highlight
  const handleCitationDocumentOpen = useCallback((docId: string) => {
    const citation = referencedCitations.find((c) => c.doc_id === docId);
    handleOpenDocumentPreview(docId, citation?.chunk_text || undefined);
  }, [referencedCitations, handleOpenDocumentPreview]);

  // Phase 64.1 — Mở CitationTextDialog cho một citation
  const openCitationTextDialog = useCallback((citation: Citation) => {
    setCitationTextDocId(citation.doc_id);
    setCitationTextDocName(citation.file_name);
    setCitationTextChunk(citation.chunk_text ?? null);
    setCitationTextChunkIndex(citation.chunk_index);
    setCitationTextDialogOpen(true);
  }, []);

  // Callback khi click citation badge trong chat — highlight sidebar card VÀ mở CitationTextDialog
  const handleCitationClick = useCallback((docIdOrSegment: string) => {
    if (docIdOrSegment.startsWith('segment:')) {
      // Inline citation click — highlight bằng segment number (index trong citations array)
      const segNum = parseInt(docIdOrSegment.replace('segment:', ''), 10);
      // Tìm citation có segment_number === segNum (nếu có) hoặc dùng index 1-based
      const matchCitation = referencedCitations.find(
        (c) => (c as { segment_number?: number }).segment_number === segNum,
      );
      if (matchCitation) {
        setActiveCitationId(`${matchCitation.doc_id}:${segNum}`);
        setTimeout(() => setActiveCitationId(null), 3000);
        openCitationTextDialog(matchCitation);
      } else if (segNum >= 1 && segNum <= referencedCitations.length) {
        // Fallback: dùng index 1-based nếu không có segment_number
        const fallback = referencedCitations[segNum - 1];
        setActiveCitationId(`${fallback.doc_id}:${segNum}`);
        setTimeout(() => setActiveCitationId(null), 3000);
        openCitationTextDialog(fallback);
      }
    } else {
      // Legacy: doc_id click — highlight sidebar card VÀ mở CitationTextDialog
      setActiveCitationId(docIdOrSegment);
      setTimeout(() => setActiveCitationId(null), 3000);
      const citation = referencedCitations.find((c) => c.doc_id === docIdOrSegment);
      if (citation) {
        openCitationTextDialog(citation);
      } else {
        openCitationTextDialog({ doc_id: docIdOrSegment, file_name: '', chunk_text: undefined, score: 0 });
      }
    }
  }, [referencedCitations, openCitationTextDialog]);

  // Phase 40 — Handler confirm tóm tắt tài liệu
  const handleSummarizeConfirm = useCallback(
    (documentId: string, documentName: string) => {
      sendSummarize(documentId, documentName);
    },
    [sendSummarize],
  );

  // Phase 44 — Handler confirm so sánh phiên bản
  const handleDiffConfirm = useCallback(
    (documentId: string, documentName: string, oldVersionNumber: number, newVersionNumber: number) => {
      sendDiff(documentId, documentName, oldVersionNumber, newVersionNumber);
      setDiffDialogOpen(false);
    },
    [sendDiff],
  );

  // Phase 44.1 — Handler confirm so sánh 2 tài liệu
  const handleCompareConfirm = useCallback(
    (docAId: string, docAName: string, docBId: string, docBName: string) => {
      sendCompare(docAId, docAName, docBId, docBName);
      setCompareDialogOpen(false);
    },
    [sendCompare],
  );

  // Phase 47 — Handler retry: thay cặp user+AI cũ bằng cặp mới (ChatGPT style)
  const handleRetry = useCallback(
    (assistantMessageId: string) => {
      retryMessage(assistantMessageId);
    },
    [retryMessage],
  );

  // Phase 71 — Handler gửi follow-up "Giải thích thêm"
  // nhận documentIds + documentNames từ message.sources của AI message được click
  const handleExplainMore = useCallback(
    (documentIds: string[], documentNames: string[]) => {
      sendMessage('Giải thích thêm', {
        requestType: 'explain',
        ...(documentIds.length > 0
          ? { contextDocumentIds: documentIds, contextDocumentNames: documentNames }
          : {}),
      });
    },
    [sendMessage],
  );

  // Phase 71 — Handler gửi follow-up "Xem ví dụ"
  const handleShowExample = useCallback(
    (documentIds: string[], documentNames: string[]) => {
      sendMessage('Cho tôi xem ví dụ', {
        requestType: 'example',
        ...(documentIds.length > 0
          ? { contextDocumentIds: documentIds, contextDocumentNames: documentNames }
          : {}),
      });
    },
    [sendMessage],
  );

  // Phase 49 — Handler toggle đa ngôn ngữ
  const handleToggleMultiLanguage = useCallback(
    async (enabled: boolean) => {
      setMultiLangEnabled(enabled);
      if (selectedSessionId) {
        await updateLanguage(selectedSessionId, {
          multiLanguageEnabled: enabled,
          queryLanguage: enabled ? queryLang : null,
          responseLanguage: enabled ? responseLang : null,
        });
      }
    },
    [selectedSessionId, queryLang, responseLang, updateLanguage],
  );

  // Phase 49 — Handler thay đổi ngôn ngữ hỏi
  const handleQueryLanguageChange = useCallback(
    async (lang: string) => {
      setQueryLang(lang);
      if (selectedSessionId && multiLangEnabled) {
        await updateLanguage(selectedSessionId, {
          multiLanguageEnabled: true,
          queryLanguage: lang,
          responseLanguage: responseLang,
        });
      }
    },
    [selectedSessionId, multiLangEnabled, responseLang, updateLanguage],
  );

  // Phase 49 — Handler thay đổi ngôn ngữ trả lời
  const handleResponseLanguageChange = useCallback(
    async (lang: string) => {
      setResponseLang(lang);
      if (selectedSessionId && multiLangEnabled) {
        await updateLanguage(selectedSessionId, {
          multiLanguageEnabled: true,
          queryLanguage: queryLang,
          responseLanguage: lang,
        });
      }
    },
    [selectedSessionId, multiLangEnabled, queryLang, updateLanguage],
  );

  // Phase 49 + 56 + 59 + 68.1 — Wrap sendMessage để inject language params + mention context + files + requestType
  const handleSend = useCallback(
    (query: string, contextDocumentIds?: string[], contextDocumentNames?: string[], files?: File[], requestType?: string) => {
      const options: Parameters<typeof sendMessage>[1] = {
        ...(multiLangEnabled
          ? { queryLanguage: queryLang, responseLanguage: responseLang }
          : {}),
        ...(requestType ? { requestType: requestType as 'rag' | 'summarize' | 'diff' | 'compare' | 'translate' | 'help' } : {}),
      };

      // @mention file context — truyền document IDs qua metadata
      // KHÔNG set requestType, để orchestrator tự detect intent (rag/summarize/translate...)
      if (contextDocumentIds && contextDocumentIds.length > 0) {
        options.contextDocumentIds = contextDocumentIds;
        options.contextDocumentNames = contextDocumentNames;
      }

      // Phase 59 — pass File blobs, sendMessage sẽ upload + gửi cùng lúc
      if (files && files.length > 0) {
        options.files = files;
      }

      return sendMessage(query, Object.keys(options).length > 0 ? options : undefined);
    },
    [sendMessage, multiLangEnabled, queryLang, responseLang],
  );

  // Handler khi user click vào message AI để xem citations
  const handleMessageSelect = useCallback((messageId: string | null) => {
    setSelectedMessageId(messageId);
  }, []);

  // Reset activeCitationId và selectedMessageId khi chuyển session
  useEffect(() => {
    setActiveCitationId(null);
    setSelectedMessageId(null);
  }, [selectedSessionId]);

  // Reset activeCitationId khi messages thay đổi (gửi message mới)
  useEffect(() => {
    setActiveCitationId(null);
  }, [messages.length]);

  // Phase 65 — Handler khi click suggestion card
  const handleSuggestionSelect = useCallback((text: string) => {
    setPrefillText(text);
  }, []);

  // Phase 65 — Clear prefill sau khi ChatInput đã consume
  const handlePrefillConsumed = useCallback(() => {
    setPrefillText(undefined);
  }, []);

  // Responsive panel collapse — tự động đóng khi màn hình nhỏ hơn 1024px
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [citationsPanelOpen, setCitationsPanelOpen] = useState(true);

  useEffect(() => {
    const BREAKPOINT = 1024;
    const handleResize = () => {
      const isLarge = window.innerWidth >= BREAKPOINT;
      if (!isLarge) {
        setSidebarOpen(false);
        setCitationsPanelOpen(false);
      } else {
        setSidebarOpen(true);
        // Không tự mở citations panel khi resize lớn lên để tôn trọng ý người dùng
      }
    };
    handleResize(); // kiểm tra ngay khi mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Phase 72.1.1 (D-08) — fetch referenced documents khi session thay đổi
  useEffect(() => {
    if (!selectedSessionId) {
      setReferencedDocs([]);
      setIsLoadingDocs(false);
      return;
    }
    let cancelled = false;
    setIsLoadingDocs(true);
    getReferencedDocuments(selectedSessionId)
      .then((res) => {
        if (cancelled) return;
        setReferencedDocs(res.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setReferencedDocs([]); // D-12 silent fail → empty state
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingDocs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSessionId]);

  // Auto-mở citations panel khi có citations HOẶC referenced docs mới trên màn hình lớn
  useEffect(() => {
    if ((referencedCitations.length > 0 || referencedDocs.length > 0) && window.innerWidth >= 1024) {
      setCitationsPanelOpen(true);
    }
  }, [referencedCitations.length, referencedDocs.length]);

  // Trên màn hình nhỏ: chỉ 1 panel được mở cùng lúc (loại trừ lẫn nhau)
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((v) => {
      const next = !v;
      if (next && window.innerWidth < 1024) setCitationsPanelOpen(false);
      return next;
    });
  }, []);

  const handleToggleCitationsPanel = useCallback(() => {
    setCitationsPanelOpen((v) => {
      const next = !v;
      if (next && window.innerWidth < 1024) setSidebarOpen(false);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden w-full">
      {/* Cột trái: Session list — ẩn khi sidebarOpen=false */}
      {sidebarOpen && (
        <div className="w-[280px] border-r flex-shrink-0 flex flex-col overflow-hidden">
          <SessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            isLoading={isLoadingSessions}
            onSelect={selectSession}
            onCreate={createSession}
            onDelete={deleteSession}
            onUpdateTitle={updateSessionTitle}
            onSearch={loadSessions}
            onGenerateTitle={generateSessionTitle}
            generatingTitleIds={generatingTitleIds}
            onGenerateSummary={generateSessionSummary}
            isGeneratingSummary={isGeneratingSummary}
            isStreaming={isStreaming}
          />
        </div>
      )}

      {/* Cột giữa: Chat area — drop zone toàn bộ vùng chat */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
        onDragEnter={(e) => dragHandlersRef.current?.onDragEnter(e)}
        onDragLeave={(e) => dragHandlersRef.current?.onDragLeave(e)}
        onDragOver={(e) => dragHandlersRef.current?.onDragOver(e)}
        onDrop={(e) => dragHandlersRef.current?.onDrop(e)}
      >
        {/* Drag overlay — bao phủ toàn bộ chat area */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary/40 rounded-lg m-2 pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload className="h-10 w-10" />
              <p className="text-base font-medium">{t('upload.dropHere')}</p>
            </div>
          </div>
        )}
        <ChatHeader
          session={selectedSession}
          messageCount={messages.length}
          lastMessageAt={selectedSession?.lastMessage?.createdAt ?? null}
          isStreaming={isStreaming}
          multiLanguageEnabled={multiLangEnabled}
          queryLanguage={queryLang}
          responseLanguage={responseLang}
          onToggleMultiLanguage={handleToggleMultiLanguage}
          onQueryLanguageChange={handleQueryLanguageChange}
          onResponseLanguageChange={handleResponseLanguageChange}
          onGenerateSummary={selectedSessionId ? () => generateSessionSummary(selectedSessionId) : undefined}
          isGeneratingSummary={isGeneratingSummary}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          citationsPanelOpen={citationsPanelOpen}
          onToggleCitationsPanel={handleToggleCitationsPanel}
          hasCitations={referencedCitations.length > 0}
          hasReferencedDocs={referencedDocs.length > 0}
        />
        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          isLoading={isLoadingMessages}
          onCitationClick={handleCitationClick}
          citationIndexMap={citationIndexMap}
          sseCitations={citations}
          onFeedbackChange={updateFeedback}
          onFeedbackSubmit={submitFeedback}
          onRetry={handleRetry}
          onMessageSelect={handleMessageSelect}
          selectedMessageId={selectedMessageId}
          onSuggestionSelect={handleSuggestionSelect}
          isGeneratingSummary={isGeneratingSummary}
          onExplainMore={handleExplainMore}
          onShowExample={handleShowExample}
        />
        {/* Issue #122 — ContextWindowBanner: cảnh báo/chặn khi phiên đạt giới hạn 50 tin nhắn */}
        <ContextWindowBanner
          messageCount={messages.length}
          onNewSession={createSession}
        />
        <ChatInput
          onSend={handleSend}
          isStreaming={isStreaming}
          onCancel={cancelStreaming}
          onSummarizeClick={() => setSummarizeDialogOpen(true)}
          onDiffClick={() => setDiffDialogOpen(true)}
          onCompareClick={() => setCompareDialogOpen(true)}
          onTranslateClick={() => setTranslateDialogOpen(true)}
          onDragHandlersReady={handleDragHandlersReady}
          onDraggingChange={setIsDraggingOver}
          prefillText={prefillText}
          onPrefillConsumed={handlePrefillConsumed}
          onNewSession={createSession}
          isSessionLimitReached={messages.length >= 50}
        />
      </div>

      {/* Cột phải: Citations panel — hiện khi có citations HOẶC referenced docs VÀ citationsPanelOpen=true */}
      {(referencedCitations.length > 0 || referencedDocs.length > 0) && citationsPanelOpen && (
        <div className="w-[320px] min-w-[250px] border-l flex-shrink-0 flex flex-col overflow-hidden">
          <CitationsPanel
            citations={referencedCitations}
            activeCitationId={activeCitationId}
            onDocumentOpen={handleCitationDocumentOpen}
            referencedDocs={referencedDocs}
            isLoadingDocs={isLoadingDocs}
          />
        </div>
      )}

      {/* Phase 40 — Summarize document dialog */}
      <SummarizeDocumentDialog
        open={summarizeDialogOpen}
        onOpenChange={setSummarizeDialogOpen}
        onConfirm={handleSummarizeConfirm}
        isStreaming={isStreaming}
      />

      {/* Phase 44 — Diff version dialog */}
      <DiffVersionDialog
        open={diffDialogOpen}
        onOpenChange={setDiffDialogOpen}
        onConfirm={handleDiffConfirm}
        isStreaming={isStreaming}
      />

      {/* Phase 44.1 — Compare documents dialog */}
      <CompareDocumentsDialog
        open={compareDialogOpen}
        onOpenChange={(open) => {
          setCompareDialogOpen(open);
          if (!open) {
            setComparePreSelectedDocId(undefined);
            setComparePreSelectedDocName(undefined);
          }
        }}
        onConfirm={handleCompareConfirm}
        isStreaming={isStreaming}
        preSelectedDocId={comparePreSelectedDocId}
        preSelectedDocName={comparePreSelectedDocName}
      />

      {/* Phase 61 — Translate dialog */}
      <TranslateDialog
        open={translateDialogOpen}
        onOpenChange={setTranslateDialogOpen}
        onConfirm={(sourceText, targetLanguage, categoryId) => sendTranslate(sourceText, targetLanguage, categoryId)}
        isStreaming={isStreaming}
      />

      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setHighlightText(null);
        }}
        document={previewDocument}
        mode="preview"
        highlightText={highlightText}
      />

      {/* Phase 64.1 — Citation text dialog: hiển thị extracted text + highlight chunk */}
      <CitationTextDialog
        open={citationTextDialogOpen}
        onOpenChange={setCitationTextDialogOpen}
        docId={citationTextDocId}
        docName={citationTextDocName}
        chunkText={citationTextChunk}
        chunkIndex={citationTextChunkIndex}
      />
    </div>
  );
}

