/**
 * Phase 49 — Danh sách ngôn ngữ hỗ trợ đa ngôn ngữ RAG
 * 10 ngôn ngữ cường quốc quân sự/hải quân
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'Tiếng Anh', flag: '🇺🇸' },
  { code: 'ru', name: 'Tiếng Nga', flag: '🇷🇺' },
  { code: 'zh', name: 'Tiếng Trung', flag: '🇨🇳' },
  { code: 'ja', name: 'Tiếng Nhật', flag: '🇯🇵' },
  { code: 'ko', name: 'Tiếng Hàn', flag: '🇰🇷' },
  { code: 'fr', name: 'Tiếng Pháp', flag: '🇫🇷' },
  { code: 'de', name: 'Tiếng Đức', flag: '🇩🇪' },
  { code: 'hi', name: 'Tiếng Hindi', flag: '🇮🇳' },
  { code: 'tr', name: 'Tiếng Thổ Nhĩ Kỳ', flag: '🇹🇷' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
