'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getSessions,
  createSession as apiCreateSession,
  deleteSession as apiDeleteSession,
  getSessionMessages,
  updateSession as apiUpdateSession,
  updateMessageFeedback,
  updateSessionLanguage,
  generateSessionTitle as apiGenerateSessionTitle,
  generateSessionSummary as apiGenerateSessionSummary,
} from '@/lib/chat-api';
import { uploadChatFiles, getSessionUploads } from '@/lib/api/chat-upload';
import type { ChatSession, ChatMessage, Citation } from '@/types/chat';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [streamingSessionIds, setStreamingSessionIds] = useState<Set<string>>(new Set());
  const [generatingTitleIds, setGeneratingTitleIds] = useState<Set<string>>(new Set());
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Computed: session hiện tại có đang streaming không
  const isStreaming = selectedSessionId ? streamingSessionIds.has(selectedSessionId) : false;

  const abortControllerRef = useRef<AbortController | null>(null);
  // Phase 69 — Deduplication guard: tránh auto-trigger generateTitle 2 lần cùng session
  const autoTitledSessionsRef = useRef<Set<string>>(new Set());

  // ─── Load sessions ──────────────────────────────────────────────────────────
  const loadSessions = useCallback(async (search?: string) => {
    try {
      setIsLoadingSessions(true);
      const result = await getSessions({ search, limit: 50 });
      setSessions(result.data);
    } catch {
      toast.error('Không thể tải danh sách hội thoại');
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // ─── Select session + load messages ─────────────────────────────────────────
  const selectSession = useCallback(async (id: string) => {
    setSelectedSessionId(id);
    try {
      setIsLoadingMessages(true);
      const result = await getSessionMessages(id, { limit: 100 });
      let loadedMessages = result.data;

      // Phase 59 — Load session uploads và gắn vào USER messages
      try {
        const uploads = await getSessionUploads(id);
        if (uploads.length > 0) {
          // Gắn upload files vào message USER đầu tiên (message gửi kèm file)
          const firstUserMsgIdx = loadedMessages.findIndex((m) => m.role === 'USER');
          if (firstUserMsgIdx >= 0) {
            loadedMessages = loadedMessages.map((m, i) =>
              i === firstUserMsgIdx ? { ...m, uploadFiles: uploads } : m,
            );
          }
        }
      } catch {
        // Ignore upload load errors — không ảnh hưởng chat
      }

      setMessages(loadedMessages);

      // Lấy citations từ AI message CUỐI CÙNG (không fallback sang message cũ).
      const lastAssistantMsg = [...loadedMessages]
        .reverse()
        .find((m) => m.role === 'ASSISTANT');
      if (lastAssistantMsg?.sources && Array.isArray(lastAssistantMsg.sources) && lastAssistantMsg.sources.length > 0) {
        setCitations(lastAssistantMsg.sources as Citation[]);
      } else {
        setCitations([]);
      }
    } catch {
      toast.error('Không thể tải tin nhắn');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // ─── Create session — gọi API ngay, không dùng draft ────────────────────────
  const createSession = useCallback(async () => {
    try {
      const newSession = await apiCreateSession();
      setSessions((prev) => [newSession, ...prev]);
      setSelectedSessionId(newSession.id);
      setMessages([]);
      setCitations([]);
    } catch {
      toast.error('Không thể tạo hội thoại mới');
    }
  }, []);

  // ─── Delete session ──────────────────────────────────────────────────────────
  const deleteSession = useCallback(
    async (id: string) => {
      try {
        await apiDeleteSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (selectedSessionId === id) {
          setSelectedSessionId(null);
          setMessages([]);
          setCitations([]);
        }
        toast.success('Đã xóa hội thoại');
      } catch {
        toast.error('Không thể xóa hội thoại');
      }
    },
    [selectedSessionId],
  );

  // ─── Update session title ────────────────────────────────────────────────────
  const updateSessionTitle = useCallback(async (id: string, title: string) => {
    try {
      const updated = await apiUpdateSession(id, title);
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success('Đã cập nhật tiêu đề');
    } catch {
      toast.error('Không thể cập nhật tiêu đề');
    }
  }, []);

  // ─── Generate AI title ──────────────────────────────────────────────────────
  // silent=true: fire-and-forget từ auto-trigger — không skeleton, không toast
  const generateSessionTitle = useCallback(async (id: string, silent = false) => {
    if (!silent) {
      setGeneratingTitleIds((prev) => new Set(prev).add(id));
    }
    try {
      const result = await apiGenerateSessionTitle(id);
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: result.title } : s)),
      );
      if (!silent) {
        toast.success('Đã đặt tên tự động');
      }
    } catch (err) {
      if (!silent) {
        toast.error('Không thể đặt tên tự động');
      } else {
        console.warn('[useChat] Auto-generate title thất bại cho session', id, err);
      }
    } finally {
      if (!silent) {
        setGeneratingTitleIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  }, []);

  // ─── Generate AI summary ────────────────────────────────────────────────────
  const generateSessionSummary = useCallback(async (id: string) => {
    setIsGeneratingSummary(true);
    try {
      const result = await apiGenerateSessionSummary(id);
      // Thêm summary message vào messages list (nếu đang xem session này)
      if (selectedSessionId === id) {
        setMessages((prev) => [
          ...prev,
          {
            id: `summary-${Date.now()}`,
            sessionId: id,
            role: 'SYSTEM_SUMMARY' as const,
            content: result.summary,
            sources: null,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      toast.success('Đã tạo tóm tắt phiên');
    } catch {
      toast.error('Không thể tạo tóm tắt phiên');
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [selectedSessionId]);

  // ─── Cancel streaming ────────────────────────────────────────────────────────
  const cancelStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // ─── Send message (SSE streaming) ────────────────────────────────────────────
  const sendMessage = useCallback(
    async (
      query: string,
      options?: {
        requestType?: 'rag' | 'summarize' | 'diff' | 'compare' | 'translate' | 'help' | 'explain' | 'example';
        targetLanguage?: string;      // Phase 61 — Translation target language
        documentId?: string;
        documentName?: string;
        oldVersionNumber?: number;  // Phase 44 — Version Diff
        newVersionNumber?: number;  // Phase 44 — Version Diff
        secondDocumentId?: string;  // Phase 44.1 — Cross-Document Compare
        secondDocumentName?: string; // Phase 44.1 — Cross-Document Compare
        contextDocumentIds?: string[];   // Phase 56 — @mention file context
        contextDocumentNames?: string[]; // Phase 56 — @mention file context
        queryLanguage?: string;     // Phase 49 — Multi-language
        responseLanguage?: string;  // Phase 49 — Multi-language
        files?: File[];             // Phase 59 — Chat file upload (blobs, chưa upload)
        glossaryCategoryId?: string; // Phase 61 — Glossary category filter
        isRetry?: boolean;           // Phase 72 — Retry tracking
      },
    ) => {
      // Guard: không cho gửi nếu session hiện tại đang streaming
      if (selectedSessionId && streamingSessionIds.has(selectedSessionId)) return;

      // Hủy stream trước đó nếu còn
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      // Timeout 5 phút cho chat request (AI Service có thể xử lý lâu: RAG multi-step, summarize, diff)
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort('timeout');
      }, 300_000); // 5 phút

      // Nếu chưa có session, tạo session thật trước khi gửi
      let currentSessionId = selectedSessionId;
      if (!currentSessionId) {
        try {
          const newSession = await apiCreateSession();
          currentSessionId = newSession.id;
          setSessions((prev) => [newSession, ...prev]);
          setSelectedSessionId(newSession.id);
        } catch {
          toast.error('Không thể tạo hội thoại mới');
          clearTimeout(timeoutId);
          return;
        }
      }

      // Snapshot sessionId tại thời điểm gửi — luôn là real UUID
      const sendingSessionId = currentSessionId;
      setStreamingSessionIds((prev) => new Set(prev).add(sendingSessionId));
      setCitations([]);

      const effectiveRequestType = options?.requestType || 'rag';
      const messageType = effectiveRequestType;

      // Thêm user message (optimistic)
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId: sendingSessionId,
        role: 'USER',
        content: query,
        sources: null,
        createdAt: new Date().toISOString(),
        messageType,
        // Phase 56 — @mention context
        contextDocumentIds: options?.contextDocumentIds,
        contextDocumentNames: options?.contextDocumentNames,
      };
      setMessages((prev) => [...prev, userMsg]);

      // Thêm placeholder AI message
      const aiMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sessionId: sendingSessionId,
          role: 'ASSISTANT' as const,
          content: '',
          sources: null,
          createdAt: new Date().toISOString(),
          messageType,
        },
      ]);

      try {
        // Phase 59 — Nếu có files, upload trước khi gửi
        let uploadFileIds: string[] | undefined;
        if (options?.files && options.files.length > 0) {
          const uploadResults = await uploadChatFiles(
            sendingSessionId,
            options.files,
          );
          uploadFileIds = uploadResults.map((r) => r.id);

          // Gắn upload files vào user message để hiển thị file card trong bubble
          setMessages((prev) =>
            prev.map((m) =>
              m.id === userMsg.id ? { ...m, uploadFiles: uploadResults } : m,
            ),
          );
        }

        // Lấy token từ localStorage
        const token = localStorage.getItem('dms_access_token');

        const response = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query,
            sessionId: sendingSessionId,
            ...(effectiveRequestType !== 'rag' && { requestType: effectiveRequestType }),
            ...(options?.documentId && { documentId: options.documentId }),
            ...(options?.documentName && { documentName: options.documentName }),
            ...(options?.oldVersionNumber !== undefined && { oldVersionNumber: options.oldVersionNumber }),
            ...(options?.newVersionNumber !== undefined && { newVersionNumber: options.newVersionNumber }),
            ...(options?.secondDocumentId && { secondDocumentId: options.secondDocumentId }),
            ...(options?.secondDocumentName && { secondDocumentName: options.secondDocumentName }),
            ...(options?.contextDocumentIds?.length && { contextDocumentIds: options.contextDocumentIds }),
            ...(options?.contextDocumentNames?.length && { contextDocumentNames: options.contextDocumentNames }),
            ...(options?.queryLanguage && { queryLanguage: options.queryLanguage }),
            ...(options?.responseLanguage && { responseLanguage: options.responseLanguage }),
            ...(uploadFileIds?.length && { uploadFileIds }),
            ...(options?.targetLanguage && { targetLanguage: options.targetLanguage }),
            ...(options?.glossaryCategoryId && { glossaryCategoryId: options.glossaryCategoryId }),
            ...(options?.isRetry ? { isRetry: true } : {}),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Bạn không có quyền truy cập tài liệu này');
          }
          // Issue #122 — Giới hạn 50 tin nhắn/phiên
          if (response.status === 422) {
            const body = await response.json().catch(() => ({}));
            const code = body?.error?.code;
            if (code === 'SESSION_LIMIT_REACHED') {
              throw new Error('SESSION_LIMIT_REACHED');
            }
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // X-Session-Id header — backend có thể trả về session ID (confirm, không cần migrate)
        const headerSessionId = response.headers.get('X-Session-Id');
        if (headerSessionId && headerSessionId !== sendingSessionId) {
          // Hiếm gặp: backend tạo session mới (không nên xảy ra vì ta đã gửi sessionId)
          currentSessionId = headerSessionId;
          setSelectedSessionId(headerSessionId);
          setStreamingSessionIds((prev) => {
            const next = new Set(prev);
            next.delete(sendingSessionId);
            next.add(headerSessionId);
            return next;
          });
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sendingSessionId
                ? { ...s, id: headerSessionId, updatedAt: new Date().toISOString() }
                : s,
            ),
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.id === userMsg.id ? { ...m, sessionId: headerSessionId } : m,
            ),
          );
        }

        // Parse SSE stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const handleSSEEvent = (eventType: string, data: string) => {
          switch (eventType) {
            case 'chunk':
              // Append token tới AI message
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'ASSISTANT') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: updated[lastIdx].content + data,
                  };
                }
                return updated;
              });
              break;

            case 'citations':
              try {
                const parsed = JSON.parse(data);
                setCitations(parsed);
                // Cập nhật sources của AI message
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'ASSISTANT') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      sources: parsed,
                    };
                  }
                  return updated;
                });
              } catch {
                // ignore parse error
              }
              break;

            case 'session_id':
              // Backend xác nhận session ID (không cần thay đổi vì đã gửi sessionId)
              break;

            case 'processing':
              // Backend xác nhận đã nhận request, đang chuyển tới AI Service
              break;

            case 'done':
              setStreamingSessionIds((prev) => {
                const next = new Set(prev);
                next.delete(sendingSessionId);
                if (currentSessionId !== sendingSessionId) next.delete(currentSessionId!);
                return next;
              });
              break;

            case 'error':
              toast.error(data || 'Dịch vụ AI gặp lỗi. Vui lòng thử lại.');
              setStreamingSessionIds((prev) => {
                const next = new Set(prev);
                next.delete(sendingSessionId);
                if (currentSessionId !== sendingSessionId) next.delete(currentSessionId!);
                return next;
              });
              break;

            default:
              break;
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events từ buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Giữ dòng chưa hoàn chỉnh

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
                  handleSSEEvent(currentEvent, data);
                }
              }
              currentEvent = '';
              currentDataParts = [];
            }
          }
        }

        // Sau khi stream xong, xóa placeholder nếu AI không trả lời gì
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'ASSISTANT' && last.content === '') {
            return prev.slice(0, -1);
          }
          return prev;
        });

        // Reload messages từ DB để lấy content đúng (có đầy đủ \n\n)
        const sessionToReload = currentSessionId;
        if (sessionToReload) {
          try {
            const result = await getSessionMessages(sessionToReload, { limit: 100 });
            let reloadedMessages = result.data;

            // Phase 59 — Gắn lại uploadFiles sau reload
            try {
              const uploads = await getSessionUploads(sessionToReload);
              if (uploads.length > 0) {
                const firstUserMsgIdx = reloadedMessages.findIndex((m) => m.role === 'USER');
                if (firstUserMsgIdx >= 0) {
                  reloadedMessages = reloadedMessages.map((m, i) =>
                    i === firstUserMsgIdx ? { ...m, uploadFiles: uploads } : m,
                  );
                }
              }
            } catch {
              // Ignore
            }

            // Phase 61 — Preserve messageType từ optimistic messages khi reload
            setMessages((prev) => {
              const messageTypeMap = new Map<string, string>();
              prev.forEach((m) => {
                if (m.messageType) {
                  const key = `${m.role}:${m.content.slice(0, 100)}`;
                  messageTypeMap.set(key, m.messageType);
                }
              });
              if (messageType && messageType !== 'rag') {
                return reloadedMessages.map((m) => {
                  const key = `${m.role}:${m.content.slice(0, 100)}`;
                  return {
                    ...m,
                    messageType: (messageTypeMap.get(key) || messageType) as ChatMessage['messageType'],
                  };
                });
              }
              return reloadedMessages.map((m) => {
                const key = `${m.role}:${m.content.slice(0, 100)}`;
                const preserved = messageTypeMap.get(key);
                return preserved ? { ...m, messageType: preserved as ChatMessage['messageType'] } : m;
              });
            });

            const lastAssistantMsg = [...result.data]
              .reverse()
              .find((m) => m.role === 'ASSISTANT');
            if (lastAssistantMsg?.sources && lastAssistantMsg.sources.length > 0) {
              setCitations(lastAssistantMsg.sources);
            } else {
              setCitations([]);
            }

            // Refresh sessions list để update title + snippet
            // PHẢI chạy TRƯỚC auto-trigger để tránh race: loadSessions overwrite title
            await loadSessions();

            // Phase 69 — Auto-trigger generate title sau tin nhắn đầu tiên
            // Điều kiện: vừa gửi tin đầu tiên (2 messages = 1 USER + 1 ASSISTANT),
            // và chưa trigger cho session này (deduplication guard)
            const isFirstMessagePair = result.data.length === 2;
            // WR-01: deduplication guard — tránh double-trigger do React Strict Mode hoặc rapid send
            if (isFirstMessagePair && !autoTitledSessionsRef.current.has(sendingSessionId)) {
              autoTitledSessionsRef.current.add(sendingSessionId);
              // Fire-and-forget silent: không await, không skeleton, không toast
              generateSessionTitle(sendingSessionId, true).catch(() => {
                // Logged inside generateSessionTitle silent catch
              });
            }
          } catch {
            // Nếu reload lỗi, giữ nguyên state từ stream
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          const signal = abortControllerRef.current?.signal;
          const isTimeout = signal?.reason === 'timeout';
          if (isTimeout) {
            toast.error('AI xử lý quá lâu. Vui lòng thử lại với câu hỏi ngắn hơn.');
          }
          // User cancel → không toast
        } else if (err instanceof Error && err.message === 'SESSION_LIMIT_REACHED') {
          // Issue #122 — Phiên đã đạt 50 tin nhắn, không toast (banner đã hiển thị)
        } else if (err instanceof TypeError && err.message.includes('fetch')) {
          toast.error('Lỗi kết nối. Kiểm tra kết nối mạng.');
        } else {
          toast.error('Không thể kết nối dịch vụ AI. Vui lòng thử lại sau.');
        }
        // Xóa placeholder AI message nếu không có content
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'ASSISTANT' && last.content === '') {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        clearTimeout(timeoutId);
        setStreamingSessionIds((prev) => {
          const next = new Set(prev);
          next.delete(sendingSessionId);
          if (currentSessionId && currentSessionId !== sendingSessionId) {
            next.delete(currentSessionId);
          }
          return next;
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [streamingSessionIds, selectedSessionId, loadSessions, generateSessionTitle],
  );

  // ─── Phase 49: Update language settings ─────────────────────────────────────
  const updateLanguage = useCallback(
    async (
      sessionId: string,
      data: {
        multiLanguageEnabled: boolean;
        queryLanguage?: string | null;
        responseLanguage?: string | null;
      },
    ) => {
      try {
        const updated = await updateSessionLanguage(sessionId, data);
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, ...data } : s)),
        );
        return updated;
      } catch {
        toast.error('Không thể cập nhật cài đặt ngôn ngữ');
      }
    },
    [],
  );

  // ─── Retry: thay thế cặp user+AI cũ bằng cặp mới (ChatGPT style) ───────────
  const retryMessage = useCallback(
    (assistantMessageId: string) => {
      const msgIndex = messages.findIndex((m) => m.id === assistantMessageId);
      if (msgIndex <= 0) return;
      const userMsg = messages.slice(0, msgIndex).reverse().find((m) => m.role === 'USER');
      if (!userMsg) return;
      const userMsgIndex = messages.findIndex((m) => m.id === userMsg.id);
      // Xoá từ user message trở đi → sendMessage sẽ thêm lại cặp user+AI mới
      setMessages((prev) => prev.slice(0, userMsgIndex));
      sendMessage(userMsg.content, { isRetry: true });
    },
    [messages, sendMessage],
  );

  // ─── Send summarize request (wrapper cho sendMessage) ────────────────────────
  const sendSummarize = useCallback(
    (documentId: string, documentName: string) => {
      return sendMessage(`Tóm tắt tài liệu: ${documentName}`, {
        requestType: 'summarize',
        documentId,
        documentName,
      });
    },
    [sendMessage],
  );

  // ─── Send diff request (wrapper cho sendMessage) ─────────────────────────────
  const sendDiff = useCallback(
    (documentId: string, documentName: string, oldVersionNumber: number, newVersionNumber: number) => {
      return sendMessage(
        `So sánh phiên bản ${oldVersionNumber} và ${newVersionNumber} của: ${documentName}`,
        {
          requestType: 'diff',
          documentId,
          documentName,
          oldVersionNumber,
          newVersionNumber,
        },
      );
    },
    [sendMessage],
  );

  // ─── Send compare request (wrapper cho sendMessage) — Phase 44.1 ─────────────
  const sendCompare = useCallback(
    (documentId: string, documentName: string, secondDocumentId: string, secondDocumentName: string) => {
      return sendMessage(`So sánh tài liệu: ${documentName} ↔ ${secondDocumentName}`, {
        requestType: 'compare',
        documentId,
        documentName,
        secondDocumentId,
        secondDocumentName,
      });
    },
    [sendMessage],
  );

  // ─── Phase 61: Send translate request (wrapper cho sendMessage) ─────────────
  const sendTranslate = useCallback(
    async (sourceText: string, targetLanguage: string, categoryId?: string) => {
      if (selectedSessionId && streamingSessionIds.has(selectedSessionId)) return;
      return sendMessage(sourceText, {
        requestType: 'translate',
        targetLanguage,
        glossaryCategoryId: categoryId,
      });
    },
    [sendMessage, streamingSessionIds, selectedSessionId],
  );

  // ─── Phase 47: Update like/dislike feedback ──────────────────────────────────
  const updateFeedback = useCallback(
    async (messageId: string, feedbackType: 'like' | 'dislike' | null) => {
      const prevFeedbackType = messages.find((m) => m.id === messageId)?.feedbackType ?? null;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedbackType } : m)),
      );
      try {
        await updateMessageFeedback(messageId, { feedbackType });
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, feedbackType: prevFeedbackType } : m,
          ),
        );
        toast.error('Không thể cập nhật đánh giá');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages],
  );

  // ─── Phase 47: Submit detailed feedback ─────────────────────────────────────
  const submitFeedback = useCallback(
    async (messageId: string, tags: string[], text: string) => {
      try {
        await updateMessageFeedback(messageId, {
          feedbackTags: tags.length > 0 ? tags : undefined,
          feedbackText: text || undefined,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  feedbackTags: tags,
                  feedbackText: text,
                  feedbackAt: new Date().toISOString(),
                }
              : m,
          ),
        );
        toast.success('Cảm ơn phản hồi của bạn!');
      } catch {
        toast.error('Không thể gửi phản hồi');
      }
    },
    [],
  );

  // ─── Load sessions on mount ─────────────────────────────────────────────────
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ─── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
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
  };
}
