/**
 * Glossary API — mock rút gọn cho prototype Chatbot (translate dialog).
 */

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export interface GlossaryCategory {
  id: string;
  name: string;
  description: string | null;
  termCount: number;
}

const MOCK_CATEGORIES: GlossaryCategory[] = [
  { id: 'gen', name: 'Thuật ngữ chung', description: 'Từ điển chung', termCount: 120 },
  { id: 'monitoring', name: 'Hệ thống monitoring', description: 'Thuật ngữ vận hành hệ thống', termCount: 82 },
  { id: 'product', name: 'Sản phẩm phần mềm', description: 'Module và sản phẩm phần mềm', termCount: 64 },
];

export async function getGlossaryCategories(): Promise<{ data: GlossaryCategory[] }> {
  await delay(60);
  return { data: MOCK_CATEGORIES };
}
