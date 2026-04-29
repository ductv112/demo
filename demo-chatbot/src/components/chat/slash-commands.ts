export interface SlashCommandItem {
  command: string; // key dung de map requestType, vi du 'summarize'
  label: string; // hien thi trong badge, vi du '/summarize'
  description: string; // mo ta tieng Viet trong popup
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  { command: 'summarize', label: '/summarize', description: 'Tóm tắt nội dung tài liệu' },
  { command: 'translate', label: '/translate', description: 'Dịch văn bản sang ngôn ngữ khác' },
  { command: 'diff', label: '/diff', description: 'So sánh 2 phiên bản tài liệu' },
  { command: 'compare', label: '/compare', description: 'Đối chiếu 2 tài liệu khác nhau' },
  { command: 'help', label: '/help', description: 'Hướng dẫn sử dụng chatbot' },
  { command: 'new', label: '/new', description: 'Tạo phiên hội thoại mới' },
];

export type SlashCommandKey = (typeof SLASH_COMMANDS)[number]['command'];

/** Map slash command key -> requestType cho sendMessage(). Tra undefined neu command la UI-only action. */
export function commandToRequestType(
  command: string,
): 'summarize' | 'translate' | 'diff' | 'compare' | 'help' | undefined {
  const map: Record<string, 'summarize' | 'translate' | 'diff' | 'compare' | 'help'> = {
    summarize: 'summarize',
    translate: 'translate',
    diff: 'diff',
    compare: 'compare',
    help: 'help',
  };
  return map[command];
}
