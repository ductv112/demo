/**
 * Chat API — mock cho prototype Doanh nghiệp A.
 * In-memory session store; replay messages + streaming giả lập.
 */

import type {
  ChatSession,
  ChatMessage,
  ChatSessionListResponse,
  ChatMessageListResponse,
  ReferencedDocument,
} from '@/types/chat';
import {
  DEMO_USER,
  DEMO_REPLY,
  buildMockSessions,
  buildMockMessages,
  buildReferencedDocs,
  randomCitations,
} from '@/lib/mock-data';

// ═══════════════════════════════════════════════════════════════════════
// In-memory store
// ═══════════════════════════════════════════════════════════════════════

let SESSIONS: ChatSession[] = buildMockSessions();
const MESSAGES: Record<string, ChatMessage[]> = {};
SESSIONS.forEach((s) => {
  MESSAGES[s.id] = buildMockMessages(s.id);
});

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function genId(prefix = 'sess'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ═══════════════════════════════════════════════════════════════════════
// Sessions
// ═══════════════════════════════════════════════════════════════════════

export async function getSessions(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ChatSessionListResponse> {
  await delay(120);
  const search = params?.search?.trim().toLowerCase();
  const filtered = search
    ? SESSIONS.filter((s) => s.title?.toLowerCase().includes(search))
    : SESSIONS;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  };
}

export async function createSession(title?: string): Promise<ChatSession> {
  await delay(80);
  const now = new Date().toISOString();
  const session: ChatSession = {
    id: genId('sess'),
    userId: DEMO_USER.id,
    title: title ?? null,
    createdAt: now,
    updatedAt: now,
    _count: { messages: 0 },
    multiLanguageEnabled: false,
    queryLanguage: 'vi',
    responseLanguage: 'vi',
    messageCount: 0,
  };
  SESSIONS = [session, ...SESSIONS];
  MESSAGES[session.id] = [];
  return session;
}

export async function getSession(id: string): Promise<ChatSession> {
  await delay(60);
  const s = SESSIONS.find((x) => x.id === id);
  if (!s) throw new Error('Session not found');
  return s;
}

export async function updateSession(id: string, title: string): Promise<ChatSession> {
  await delay(80);
  const s = SESSIONS.find((x) => x.id === id);
  if (!s) throw new Error('Session not found');
  s.title = title;
  s.updatedAt = new Date().toISOString();
  return s;
}

export async function generateSessionTitle(id: string): Promise<{ title: string }> {
  await delay(400);
  const msgs = MESSAGES[id] ?? [];
  const firstUser = msgs.find((m) => m.role === 'USER');
  const title = firstUser
    ? firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? '...' : '')
    : 'Phiên trò chuyện mới';
  const s = SESSIONS.find((x) => x.id === id);
  if (s) s.title = title;
  return { title };
}

export async function generateSessionSummary(id: string): Promise<{ summary: string }> {
  await delay(600);
  const msgs = MESSAGES[id] ?? [];
  const count = msgs.filter((m) => m.role === 'USER').length;
  return {
    summary: `Tóm tắt phiên: ${count} câu hỏi về các chủ đề kỹ thuật Doanh nghiệp A (hệ thống monitoring, module sản phẩm, quy trình). ${DEMO_REPLY}`,
  };
}

export async function deleteSession(id: string): Promise<void> {
  await delay(80);
  SESSIONS = SESSIONS.filter((s) => s.id !== id);
  delete MESSAGES[id];
}

export async function getSessionMessages(
  sessionId: string,
  _params?: { page?: number; limit?: number },
): Promise<ChatMessageListResponse> {
  await delay(100);
  const data = MESSAGES[sessionId] ?? [];
  return {
    data,
    meta: { page: 1, limit: data.length || 100, total: data.length, totalPages: 1 },
  };
}

export async function getReferencedDocuments(
  sessionId: string,
): Promise<{ data: ReferencedDocument[] }> {
  await delay(80);
  // Try seed first; fallback: accumulate from messages' sources
  const seedDocs = buildReferencedDocs(sessionId);
  if (seedDocs.length > 0) return { data: seedDocs };

  const msgs = MESSAGES[sessionId] ?? [];
  const counts = new Map<string, { name: string; fileName: string; count: number }>();
  msgs.forEach((m) => {
    m.sources?.forEach((c) => {
      const cur = counts.get(c.doc_id) ?? { name: c.file_name, fileName: c.file_name, count: 0 };
      cur.count += 1;
      counts.set(c.doc_id, cur);
    });
  });
  return {
    data: Array.from(counts.entries()).map(([docId, v]) => ({
      documentId: docId,
      documentName: v.name,
      fileName: v.fileName,
      referenceCount: v.count,
    })),
  };
}

export async function updateSessionLanguage(
  id: string,
  data: {
    multiLanguageEnabled: boolean;
    queryLanguage?: string | null;
    responseLanguage?: string | null;
  },
): Promise<ChatSession> {
  await delay(60);
  const s = SESSIONS.find((x) => x.id === id);
  if (!s) throw new Error('Session not found');
  s.multiLanguageEnabled = data.multiLanguageEnabled;
  s.queryLanguage = data.queryLanguage ?? null;
  s.responseLanguage = data.responseLanguage ?? null;
  return s;
}

export async function getMentionableDocuments(params?: {
  search?: string;
  limit?: number;
}): Promise<{
  data: { id: string; fileName: string; mimeType: string }[];
  meta: { total: number };
}> {
  await delay(80);
  const { MOCK_DOCUMENTS } = await import('@/lib/mock-data');
  const search = params?.search?.trim().toLowerCase();
  const filtered = search
    ? MOCK_DOCUMENTS.filter(
        (d) =>
          d.fileName.toLowerCase().includes(search) ||
          d.title.toLowerCase().includes(search),
      )
    : MOCK_DOCUMENTS;
  const limit = params?.limit ?? 20;
  return {
    data: filtered.slice(0, limit).map((d) => ({
      id: d.id,
      fileName: d.fileName,
      mimeType: d.mimeType,
    })),
    meta: { total: filtered.length },
  };
}

export async function updateMessageFeedback(
  messageId: string,
  data: {
    feedbackType?: 'like' | 'dislike' | null;
    feedbackTags?: string[];
    feedbackText?: string;
  },
): Promise<ChatMessage> {
  await delay(80);
  // Find message across sessions
  for (const sessionId of Object.keys(MESSAGES)) {
    const list = MESSAGES[sessionId];
    const msg = list.find((m) => m.id === messageId);
    if (msg) {
      if (data.feedbackType !== undefined) msg.feedbackType = data.feedbackType;
      if (data.feedbackTags !== undefined) msg.feedbackTags = data.feedbackTags;
      if (data.feedbackText !== undefined) msg.feedbackText = data.feedbackText;
      msg.feedbackAt = new Date().toISOString();
      return msg;
    }
  }
  throw new Error('Message not found');
}

// ═══════════════════════════════════════════════════════════════════════
// SSE streaming — mock
// ═══════════════════════════════════════════════════════════════════════

/**
 * Tạo SSE stream mock cho POST /chat.
 * Returns a Response-like object with readable body stream.
 */
export function createMockChatStream(params: {
  query: string;
  sessionId: string;
}): Response {
  const { sessionId, query } = params;
  const encoder = new TextEncoder();

  // Build reply — optional hint based on query keywords
  let hint = '';
  const q = query.toLowerCase();
  if (q.includes('monitoring') || q.includes('p-18') || q.includes('36d6') || q.includes('p-37')) {
    hint = 'Thông tin về hệ thống monitoring được lưu trong các tài liệu kỹ thuật Doanh nghiệp A. ';
  } else if (q.includes('module') || q.includes('s-75') || q.includes('s-125') || q.includes('s-300')) {
    hint = 'Các module sản phẩm được quản lý tại Trung tâm Phát triển Sản phẩm (TT2) — Doanh nghiệp A. ';
  } else if (q.includes('an toàn') || q.includes('quy định')) {
    hint = 'Quy định an toàn tại các Trung tâm phần mềm Doanh nghiệp A được cập nhật định kỳ. ';
  } else if (q.includes('nghiệm thu') || q.includes('qa') || q.includes('chất lượng')) {
    hint = 'Quy trình QA & nghiệm thu tại Doanh nghiệp A do Phòng QA đảm bảo chất lượng. ';
  }

  const fullReply = hint + DEMO_REPLY;

  // Split into 8-15 chunks (approx word boundaries)
  const words = fullReply.split(' ');
  const chunkCount = Math.min(15, Math.max(8, Math.floor(words.length / 2)));
  const chunkSize = Math.ceil(words.length / chunkCount);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    const slice = words.slice(i, i + chunkSize).join(' ');
    chunks.push(i + chunkSize >= words.length ? slice : slice + ' ');
  }

  const citations = randomCitations();

  // Save messages to store (user + AI)
  const userMsgId = genId('msg');
  const aiMsgId = genId('msg');
  const now = new Date().toISOString();
  const userMsg: ChatMessage = {
    id: userMsgId,
    sessionId,
    role: 'USER',
    content: query,
    sources: null,
    createdAt: now,
    messageType: 'rag',
  };
  const aiMsg: ChatMessage = {
    id: aiMsgId,
    sessionId,
    role: 'ASSISTANT',
    content: fullReply,
    sources: citations,
    createdAt: now,
    messageType: 'rag',
  };
  MESSAGES[sessionId] = [...(MESSAGES[sessionId] ?? []), userMsg, aiMsg];

  // Update session
  const session = SESSIONS.find((s) => s.id === sessionId);
  if (session) {
    session.updatedAt = now;
    session.lastMessage = { content: fullReply, createdAt: now, role: 'ASSISTANT' };
    session.messageCount = (session.messageCount ?? 0) + 2;
  }

  const stream = new ReadableStream({
    async start(controller) {
      // session_id
      controller.enqueue(encoder.encode(`event: session_id\ndata: ${sessionId}\n\n`));
      await delay(40);

      // processing
      controller.enqueue(encoder.encode(`event: processing\ndata: started\n\n`));
      await delay(80);

      // chunks
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`event: chunk\ndata: ${chunk}\n\n`));
        await delay(40 + Math.floor(Math.random() * 40));
      }

      // citations
      controller.enqueue(
        encoder.encode(`event: citations\ndata: ${JSON.stringify(citations)}\n\n`),
      );
      await delay(40);

      // done
      controller.enqueue(encoder.encode(`event: done\ndata: ok\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'X-Session-Id': sessionId,
    },
  });
}

// Intercept fetch calls to /chat (used by use-chat hook). Install lazily in browser only.
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (url.endsWith('/chat') && init?.method === 'POST') {
      try {
        const body = JSON.parse(typeof init.body === 'string' ? init.body : '{}');
        const { sessionId, query } = body;
        if (sessionId && typeof query === 'string') {
          return createMockChatStream({ sessionId, query });
        }
      } catch {
        /* fall through */
      }
    }
    return originalFetch(input, init);
  };
}
