/**
 * Mock data — ngữ cảnh Nhà máy Z119 (PKKQ).
 * Dùng cho prototype Chatbot: sessions, messages, citations, AI Quality stats.
 */

import type {
  ChatSession,
  ChatMessage,
  Citation,
  ReferencedDocument,
} from '@/types/chat';
import type {
  AiQualityStats,
  AiQualityTrendItem,
  AiQualityFeedback,
  UsageStats,
  UsageTrendItem,
  UsageByDeptItem,
  IntentBreakdownResponse,
  RetryStats,
  UserStatsResponse,
} from '@/types/ai-quality';

// ═══════════════════════════════════════════════════════════════════════
// DEMO USER & REPLY
// ═══════════════════════════════════════════════════════════════════════

export const DEMO_USER = {
  id: 'user-director',
  username: 'pqhung',
  fullName: 'Đại tá Phạm Quốc Hưng',
  email: 'pqhung@z119.mil.vn',
  phone: '0912 345 678',
  avatarUrl: null,
  role: 'Giám đốc Nhà máy',
  department: 'Ban Giám đốc',
};

/**
 * Câu trả lời cố định của AI — demo disclaimer.
 * Gộp với 1 câu mở đầu tùy nội dung câu hỏi (đôi khi).
 */
export const DEMO_REPLY =
  'Cảm ơn câu hỏi của bạn. Đây là hệ thống demo với dữ liệu giả lập.';

// ═══════════════════════════════════════════════════════════════════════
// MOCK DOCUMENTS (Z119)
// ═══════════════════════════════════════════════════════════════════════

export interface MockDocument {
  id: string;
  fileName: string;
  title: string;
  mimeType: string;
  fileSize: number;
  department: string;
  excerpt: string;
}

const MIME = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: 'doc-001',
    fileName: 'Quy trình sửa chữa radar P-18.pdf',
    title: 'Quy trình sửa chữa radar P-18',
    mimeType: MIME.pdf,
    fileSize: 2_457_600,
    department: 'Phân xưởng Sửa chữa Radar (PX1)',
    excerpt:
      'Quy trình kiểm tra, tháo lắp và sửa chữa đài radar cảnh giới P-18. Bao gồm các bước kiểm tra nguồn, anten, máy phát-thu...',
  },
  {
    id: 'doc-002',
    fileName: 'Biên bản nghiệm thu đại tu S-75.docx',
    title: 'Biên bản nghiệm thu đại tu S-75',
    mimeType: MIME.docx,
    fileSize: 184_320,
    department: 'Phòng KCS & Đảm bảo CL',
    excerpt:
      'Biên bản nghiệm thu đại tu tên lửa S-75 Dvina cho Trung đoàn 261, sư đoàn 361. Các hạng mục đã kiểm tra, thông số đo được...',
  },
  {
    id: 'doc-003',
    fileName: 'Thông số kỹ thuật radar 36D6.xlsx',
    title: 'Thông số kỹ thuật radar 36D6',
    mimeType: MIME.xlsx,
    fileSize: 96_256,
    department: 'Phòng Kỹ thuật',
    excerpt:
      'Thông số kỹ thuật chi tiết radar 36D6: tần số, công suất phát, cự ly phát hiện, độ chính xác...',
  },
  {
    id: 'doc-004',
    fileName: 'Quy định an toàn phân xưởng PX1.pdf',
    title: 'Quy định an toàn phân xưởng PX1',
    mimeType: MIME.pdf,
    fileSize: 712_704,
    department: 'Phân xưởng Sửa chữa Radar (PX1)',
    excerpt:
      'Quy định an toàn lao động và vận hành thiết bị tại phân xưởng PX1 — Sửa chữa Radar. Các điểm cần tuân thủ...',
  },
  {
    id: 'doc-005',
    fileName: 'Hướng dẫn vận hành tên lửa S-125.pdf',
    title: 'Hướng dẫn vận hành tên lửa S-125',
    mimeType: MIME.pdf,
    fileSize: 3_276_800,
    department: 'Phân xưởng Sửa chữa Tên lửa (PX2)',
    excerpt:
      'Hướng dẫn vận hành tổ hợp tên lửa S-125 Pechora. Quy trình triển khai, thu hồi, bảo quản đạn...',
  },
  {
    id: 'doc-006',
    fileName: 'Báo cáo kiểm định Q4-2025.xlsx',
    title: 'Báo cáo kiểm định Q4-2025',
    mimeType: MIME.xlsx,
    fileSize: 215_040,
    department: 'Trung tâm Đo lường Quân khu',
    excerpt:
      'Báo cáo kết quả kiểm định thiết bị đo lường quý 4/2025: máy hiện sóng Tektronix, máy phân tích phổ...',
  },
  {
    id: 'doc-007',
    fileName: 'Lệnh sản xuất LSX-2026-0142.pdf',
    title: 'Lệnh sản xuất LSX-2026-0142',
    mimeType: MIME.pdf,
    fileSize: 128_000,
    department: 'Phòng Kế hoạch',
    excerpt:
      'Lệnh sản xuất LSX-2026-0142 — sửa chữa đài radar P-37 cho Sư đoàn 363. Thời hạn hoàn thành 30/06/2026...',
  },
  {
    id: 'doc-008',
    fileName: 'Sơ đồ khối radar ST-68.pdf',
    title: 'Sơ đồ khối radar ST-68',
    mimeType: MIME.pdf,
    fileSize: 1_638_400,
    department: 'Phòng Kỹ thuật',
    excerpt:
      'Sơ đồ khối chi tiết đài radar đo cao ST-68: khối máy phát, khối máy thu, khối xử lý tín hiệu...',
  },
  {
    id: 'doc-009',
    fileName: 'Quy trình đại tu động cơ.docx',
    title: 'Quy trình đại tu động cơ',
    mimeType: MIME.docx,
    fileSize: 245_760,
    department: 'Phân xưởng Cơ khí (PX3)',
    excerpt:
      'Quy trình đại tu động cơ cho các thiết bị cơ khí của đài radar và tổ hợp tên lửa...',
  },
  {
    id: 'doc-010',
    fileName: 'Thông số S-300PMU.xlsx',
    title: 'Thông số S-300PMU',
    mimeType: MIME.xlsx,
    fileSize: 204_800,
    department: 'Phòng Kỹ thuật',
    excerpt:
      'Thông số kỹ thuật tổ hợp tên lửa phòng không S-300PMU: cự ly, độ cao, tốc độ mục tiêu tiêu diệt...',
  },
  {
    id: 'doc-011',
    fileName: 'Hướng dẫn Tektronix.pdf',
    title: 'Hướng dẫn sử dụng Tektronix',
    mimeType: MIME.pdf,
    fileSize: 1_945_600,
    department: 'Phân xưởng Điện tử (PX4)',
    excerpt:
      'Hướng dẫn sử dụng máy hiện sóng Tektronix cho đo lường, kiểm tra thiết bị điện tử phòng không...',
  },
  {
    id: 'doc-012',
    fileName: 'Báo cáo sự cố PX2.docx',
    title: 'Báo cáo sự cố PX2 tháng 12/2025',
    mimeType: MIME.docx,
    fileSize: 163_840,
    department: 'Phân xưởng Sửa chữa Tên lửa (PX2)',
    excerpt:
      'Báo cáo tổng hợp các sự cố kỹ thuật tại phân xưởng PX2 trong tháng 12/2025. Hướng xử lý và kiến nghị...',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// MOCK CHAT SESSIONS
// ═══════════════════════════════════════════════════════════════════════

interface SessionSeed {
  id: string;
  title: string;
  /** Cặp Q/A */
  turns: Array<{ q: string; hint?: string; docIds?: string[] }>;
  /** Offset ngày so với now (âm = trong quá khứ) */
  daysAgo: number;
}

const SESSION_SEEDS: SessionSeed[] = [
  {
    id: 'sess-001',
    title: 'Hỏi về quy trình sửa chữa radar P-18',
    daysAgo: 0,
    turns: [
      {
        q: 'Cho tôi quy trình sửa chữa đài radar P-18 của đơn vị?',
        hint: 'Quy trình bao gồm kiểm tra nguồn, anten, máy phát và máy thu.',
        docIds: ['doc-001', 'doc-004'],
      },
      {
        q: 'Bước kiểm tra anten cần lưu ý những gì?',
        hint: 'Lưu ý kiểm tra các điểm tiếp xúc cơ khí và cáp RF.',
        docIds: ['doc-001'],
      },
    ],
  },
  {
    id: 'sess-002',
    title: 'Tìm tài liệu nghiệm thu S-75',
    daysAgo: 0,
    turns: [
      {
        q: 'Tìm biên bản nghiệm thu đại tu tên lửa S-75 cho Trung đoàn 261',
        hint: 'Biên bản nghiệm thu S-75 đã lập cho Trung đoàn 261, Sư đoàn 361.',
        docIds: ['doc-002'],
      },
    ],
  },
  {
    id: 'sess-003',
    title: 'So sánh thông số 36D6 và P-37',
    daysAgo: 1,
    turns: [
      {
        q: 'So sánh thông số radar 36D6 và P-37',
        hint: '36D6 phát hiện mục tiêu, P-37 dẫn đường — dải tần và cự ly khác nhau.',
        docIds: ['doc-003'],
      },
      {
        q: 'Radar nào phù hợp cho nhiệm vụ cảnh giới tầm xa hơn?',
        hint: '36D6 có cự ly phát hiện xa hơn P-37.',
        docIds: ['doc-003'],
      },
    ],
  },
  {
    id: 'sess-004',
    title: 'Tra cứu quy định an toàn phân xưởng PX1',
    daysAgo: 1,
    turns: [
      {
        q: 'Cho tôi các quy định an toàn khi làm việc tại phân xưởng PX1',
        hint: 'Các quy định an toàn tại PX1 tập trung vào vận hành thiết bị điện cao áp.',
        docIds: ['doc-004'],
      },
    ],
  },
  {
    id: 'sess-005',
    title: 'Hướng dẫn đại tu tên lửa S-125 Pechora',
    daysAgo: 2,
    turns: [
      {
        q: 'Cho tôi hướng dẫn đại tu tên lửa S-125 Pechora',
        hint: 'Hướng dẫn đại tu S-125 bao gồm triển khai, thu hồi và bảo quản đạn.',
        docIds: ['doc-005', 'doc-009'],
      },
      {
        q: 'Thời gian đại tu trung bình là bao lâu?',
        hint: 'Thời gian đại tu trung bình khoảng 45-60 ngày.',
      },
    ],
  },
  {
    id: 'sess-006',
    title: 'Tìm lệnh sản xuất LSX-2026-0142',
    daysAgo: 3,
    turns: [
      {
        q: 'Tìm cho tôi lệnh sản xuất LSX-2026-0142',
        hint: 'Lệnh LSX-2026-0142 là sửa chữa radar P-37 cho Sư đoàn 363.',
        docIds: ['doc-007'],
      },
    ],
  },
  {
    id: 'sess-007',
    title: 'Thông số S-300PMU và bảo dưỡng',
    daysAgo: 4,
    turns: [
      {
        q: 'Thông số tổ hợp S-300PMU và chu kỳ bảo dưỡng?',
        hint: 'S-300PMU có cự ly đến 150 km, bảo dưỡng định kỳ 6 tháng/lần.',
        docIds: ['doc-010'],
      },
    ],
  },
  {
    id: 'sess-008',
    title: 'Quy trình KCS nghiệm thu',
    daysAgo: 5,
    turns: [
      {
        q: 'Quy trình KCS nghiệm thu sản phẩm sau sửa chữa như thế nào?',
        hint: 'Quy trình KCS gồm kiểm tra chức năng, đo thông số, thử nghiệm và lập biên bản.',
        docIds: ['doc-002', 'doc-006'],
      },
    ],
  },
  {
    id: 'sess-009',
    title: 'Kiểm định Tektronix Q4-2025',
    daysAgo: 6,
    turns: [
      {
        q: 'Báo cáo kiểm định máy hiện sóng Tektronix quý 4/2025?',
        hint: 'Máy Tektronix đã kiểm định, đạt yêu cầu kỹ thuật.',
        docIds: ['doc-006', 'doc-011'],
      },
    ],
  },
  {
    id: 'sess-010',
    title: 'Báo cáo sự cố PX2 T12-2025',
    daysAgo: 7,
    turns: [
      {
        q: 'Tổng hợp sự cố kỹ thuật tại PX2 tháng 12/2025?',
        hint: 'Có 3 sự cố chính tại PX2 trong tháng 12/2025, đã xử lý 2/3.',
        docIds: ['doc-012'],
      },
    ],
  },
  {
    id: 'sess-011',
    title: 'Biên bản họp BGĐ Z119',
    daysAgo: 9,
    turns: [
      {
        q: 'Tóm tắt biên bản họp Ban Giám đốc Z119 tuần trước',
        hint: 'Nội dung chính xoay quanh tiến độ sửa chữa và kế hoạch Q1-2026.',
      },
    ],
  },
  {
    id: 'sess-012',
    title: 'Quy trình vận hành ST-68',
    daysAgo: 11,
    turns: [
      {
        q: 'Quy trình vận hành đài radar đo cao ST-68?',
        hint: 'ST-68 là radar đo cao, vận hành cần 3 người trong ca trực.',
        docIds: ['doc-008'],
      },
      {
        q: 'Chỉ báo khối máy phát có những dấu hiệu nào bất thường?',
        hint: 'Các dấu hiệu bất thường thường gặp: đèn báo đỏ, công suất ra giảm.',
        docIds: ['doc-008'],
      },
    ],
  },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function pickCitations(docIds: string[] | undefined): Citation[] {
  if (!docIds?.length) return [];
  return docIds.map((id, idx) => {
    const doc = MOCK_DOCUMENTS.find((d) => d.id === id);
    return {
      doc_id: id,
      file_name: doc?.fileName ?? 'Tài liệu',
      chunk_text: doc?.excerpt,
      score: 0.9 - idx * 0.05,
      page_numbers: [idx + 1],
      segment_number: idx + 1,
      chunk_index: idx,
      citation_type: 'rag' as const,
    };
  });
}

export function buildMockSessions(): ChatSession[] {
  return SESSION_SEEDS.map((s) => {
    const createdAt = isoDaysAgo(s.daysAgo + 0.1);
    const updatedAt = isoDaysAgo(s.daysAgo);
    const lastTurn = s.turns[s.turns.length - 1];
    return {
      id: s.id,
      userId: DEMO_USER.id,
      title: s.title,
      createdAt,
      updatedAt,
      _count: { messages: s.turns.length * 2 },
      lastMessage: {
        content: lastTurn.hint ? `${lastTurn.hint} ${DEMO_REPLY}` : DEMO_REPLY,
        createdAt: updatedAt,
        role: 'ASSISTANT',
      },
      multiLanguageEnabled: false,
      queryLanguage: 'vi',
      responseLanguage: 'vi',
      messageCount: s.turns.length * 2,
    };
  });
}

export function buildMockMessages(sessionId: string): ChatMessage[] {
  const seed = SESSION_SEEDS.find((s) => s.id === sessionId);
  if (!seed) return [];

  const base = new Date();
  base.setDate(base.getDate() - seed.daysAgo);

  const messages: ChatMessage[] = [];
  seed.turns.forEach((turn, idx) => {
    const userAt = new Date(base.getTime() + idx * 60_000).toISOString();
    const aiAt = new Date(base.getTime() + idx * 60_000 + 15_000).toISOString();
    messages.push({
      id: `${sessionId}-msg-${idx * 2}`,
      sessionId,
      role: 'USER',
      content: turn.q,
      sources: null,
      createdAt: userAt,
      messageType: 'rag',
    });
    const reply = turn.hint ? `${turn.hint}\n\n${DEMO_REPLY}` : DEMO_REPLY;
    messages.push({
      id: `${sessionId}-msg-${idx * 2 + 1}`,
      sessionId,
      role: 'ASSISTANT',
      content: reply,
      sources: pickCitations(turn.docIds),
      createdAt: aiAt,
      messageType: 'rag',
      feedbackType: idx === 0 && seed.daysAgo > 2 ? 'like' : null,
      feedbackTags: null,
      feedbackText: null,
      feedbackAt: null,
    });
  });
  return messages;
}

export function buildReferencedDocs(sessionId: string): ReferencedDocument[] {
  const seed = SESSION_SEEDS.find((s) => s.id === sessionId);
  if (!seed) return [];
  const counts = new Map<string, number>();
  seed.turns.forEach((turn) => {
    turn.docIds?.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  });
  return Array.from(counts.entries())
    .map(([id, count]) => {
      const doc = MOCK_DOCUMENTS.find((d) => d.id === id);
      if (!doc) return null;
      return {
        documentId: doc.id,
        documentName: doc.title,
        fileName: doc.fileName,
        referenceCount: count,
      };
    })
    .filter((x): x is ReferencedDocument => x !== null)
    .sort((a, b) => a.documentName.localeCompare(b.documentName, 'vi'));
}

/** Random 1-2 citations cho tin nhắn mới (không match docs trong seed) */
export function randomCitations(): Citation[] {
  const pool = [...MOCK_DOCUMENTS].sort(() => Math.random() - 0.5);
  const n = 1 + Math.floor(Math.random() * 2);
  return pool.slice(0, n).map((doc, idx) => ({
    doc_id: doc.id,
    file_name: doc.fileName,
    chunk_text: doc.excerpt,
    score: 0.88 - idx * 0.06,
    page_numbers: [1 + idx],
    segment_number: idx + 1,
    chunk_index: idx,
    citation_type: 'rag' as const,
  }));
}

// ═══════════════════════════════════════════════════════════════════════
// AI QUALITY STATS
// ═══════════════════════════════════════════════════════════════════════

export function buildAiQualityStats(): AiQualityStats {
  return {
    totalRated: 305,
    likes: 265,
    dislikes: 40,
    satisfactionRate: 87,
    feedbackDetailRate: 62,
  };
}

export function buildAiQualityTrend(period: string): AiQualityTrendItem[] {
  const days = period === '7d' ? 7 : period === '3m' ? 90 : 30;
  const items: AiQualityTrendItem[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const total = 50 + Math.floor(Math.random() * 70);
    const likes = Math.round(total * (0.82 + Math.random() * 0.1));
    const dislikes = total - likes;
    items.push({ date: dateStr, likes, dislikes, total });
  }
  return items;
}

export function buildAiQualityFeedbacks(page: number, limit: number, search?: string) {
  const feedbacks: AiQualityFeedback[] = [];
  const samples = [
    {
      q: 'Cho tôi quy trình sửa chữa radar P-18',
      a: 'Quy trình bao gồm kiểm tra nguồn, anten, máy phát và máy thu. ' + DEMO_REPLY,
      type: 'like' as const,
      tags: ['Chính xác', 'Hữu ích'],
    },
    {
      q: 'Tìm biên bản nghiệm thu S-75',
      a: 'Biên bản nghiệm thu S-75 cho Trung đoàn 261. ' + DEMO_REPLY,
      type: 'like' as const,
      tags: ['Đúng tài liệu cần tìm'],
    },
    {
      q: 'So sánh 36D6 và P-37',
      a: '36D6 phát hiện, P-37 dẫn đường. ' + DEMO_REPLY,
      type: 'dislike' as const,
      tags: ['Thiếu thông tin'],
    },
    {
      q: 'Quy định an toàn PX1',
      a: 'Quy định an toàn tập trung vào điện cao áp. ' + DEMO_REPLY,
      type: 'like' as const,
      tags: ['Chính xác'],
    },
    {
      q: 'Hướng dẫn S-125 Pechora',
      a: 'S-125 Pechora — triển khai, thu hồi, bảo quản. ' + DEMO_REPLY,
      type: 'like' as const,
      tags: ['Đầy đủ'],
    },
  ];

  const total = 62;
  const filtered = search
    ? samples.filter((s) => s.q.includes(search) || s.a.includes(search))
    : samples;
  const startIdx = (page - 1) * limit;

  for (let i = 0; i < Math.min(limit, filtered.length); i++) {
    const s = filtered[i % filtered.length];
    const idx = startIdx + i;
    feedbacks.push({
      id: `fb-${idx.toString().padStart(4, '0')}`,
      content: s.a,
      userQuery: s.q,
      feedbackType: s.type,
      feedbackTags: s.tags,
      feedbackText: s.type === 'dislike' ? 'Cần bổ sung chi tiết hơn.' : null,
      feedbackAt: isoDaysAgo(idx * 0.5),
      createdAt: isoDaysAgo(idx * 0.5 + 0.1),
      user: {
        id: 'user-' + (idx % 5),
        fullName:
          ['Đại tá Phạm Quốc Hưng', 'Hoàng Minh Tuấn', 'Nguyễn Văn Hải', 'Trần Quốc Vinh', 'Lê Thành Nam'][idx % 5],
        email: `user${idx % 5}@z119.mil.vn`,
      },
    });
  }

  return {
    data: feedbacks,
    meta: {
      page,
      limit,
      total: search ? filtered.length : total,
      totalPages: Math.ceil((search ? filtered.length : total) / limit),
    },
  };
}

export function buildUsageStats(): UsageStats {
  return {
    totalQuestions: { value: 2340, change: 12 },
    activeUsers: { value: 78, change: 8 },
    avgQuestionsPerUser: 30,
    activeDepartments: { value: 5, change: 0 },
    period: '30d',
  };
}

export function buildUsageTrend(period: string): UsageTrendItem[] {
  const days = period === '7d' ? 7 : period === '3m' ? 90 : 30;
  const items: UsageTrendItem[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    items.push({
      date: d.toISOString().slice(0, 10),
      total: 50 + Math.floor(Math.random() * 70),
    });
  }
  return items;
}

export function buildUsageByDept(): UsageByDeptItem[] {
  return [
    { departmentId: 'PKT', departmentName: 'Phòng Kỹ thuật', totalQuestions: 936, activeUsers: 18 },
    { departmentId: 'PX1', departmentName: 'PX1 — Sửa chữa Radar', totalQuestions: 515, activeUsers: 14 },
    { departmentId: 'PX2', departmentName: 'PX2 — Sửa chữa Tên lửa', totalQuestions: 421, activeUsers: 12 },
    { departmentId: 'PKCDB', departmentName: 'Phòng KCS & Đảm bảo CL', totalQuestions: 281, activeUsers: 8 },
    { departmentId: 'PKH', departmentName: 'Phòng Kế hoạch', totalQuestions: 187, activeUsers: 6 },
  ];
}

export function buildIntentBreakdown(): IntentBreakdownResponse {
  const total = 2340;
  return {
    total,
    items: [
      { intent: 'Tra cứu tài liệu kỹ thuật', count: 819, percentage: 35.0 },
      { intent: 'Quy trình sửa chữa', count: 515, percentage: 22.0 },
      { intent: 'Kiểm tra nghiệm thu', count: 421, percentage: 18.0 },
      { intent: 'Thông số thiết bị', count: 351, percentage: 15.0 },
      { intent: 'Khác', count: 234, percentage: 10.0 },
    ],
  };
}

export function buildRetryStats(): RetryStats {
  return {
    retryCount: 87,
    totalMessages: 2340,
    retryRate: 3.7,
    retryRateChange: -0.4,
    period: '30d',
  };
}

export function buildUserStats(page: number, limit: number): UserStatsResponse {
  const users = [
    { id: 'u-01', name: 'Hoàng Minh Tuấn', email: 'hmtuan@z119.mil.vn', total: 187, sess: 62, fb: 68, rt: 2.1 },
    { id: 'u-02', name: 'Nguyễn Văn Hải', email: 'nvhai@z119.mil.vn', total: 164, sess: 54, fb: 72, rt: 3.0 },
    { id: 'u-03', name: 'Trần Quốc Vinh', email: 'tqvinh@z119.mil.vn', total: 142, sess: 48, fb: 65, rt: 4.2 },
    { id: 'u-04', name: 'Lê Thành Nam', email: 'ltnam@z119.mil.vn', total: 128, sess: 44, fb: 58, rt: 5.5 },
    { id: 'u-05', name: 'Phạm Quốc Hưng', email: 'pqhung@z119.mil.vn', total: 121, sess: 39, fb: 71, rt: 1.6 },
    { id: 'u-06', name: 'Đỗ Xuân Bình', email: 'dxbinh@z119.mil.vn', total: 97, sess: 33, fb: 55, rt: 3.8 },
    { id: 'u-07', name: 'Vũ Quang Trường', email: 'vqtruong@z119.mil.vn', total: 88, sess: 30, fb: 48, rt: 4.0 },
    { id: 'u-08', name: 'Bùi Công Toàn', email: 'bctoan@z119.mil.vn', total: 74, sess: 27, fb: 40, rt: 6.1 },
  ];

  const start = (page - 1) * limit;
  const slice = users.slice(start, start + limit);
  return {
    data: slice.map((u) => ({
      userId: u.id,
      userName: u.name,
      email: u.email,
      totalMessages: u.total,
      totalSessions: u.sess,
      feedbackRate: u.fb,
      retryRate: u.rt,
    })),
    meta: { page, limit, total: users.length, totalPages: Math.ceil(users.length / limit) },
  };
}

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD STATS (cho trang chủ chatbot)
// ═══════════════════════════════════════════════════════════════════════

export const CHATBOT_DASHBOARD_STATS = {
  totalSessions: 156,
  activeUsersToday: 34,
  avgSessionLength: 4.5, // phút
  satisfaction: 87, // %
};

/** Chuỗi 30 ngày — số câu hỏi mỗi ngày (cho BarChart dashboard) */
export function buildDashboardTrend(): Array<{ date: string; value: number }> {
  const arr: Array<{ date: string; value: number }> = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push({
      date: d.toISOString().slice(0, 10),
      value: 50 + Math.floor(Math.random() * 70),
    });
  }
  return arr;
}
