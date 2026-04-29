/**
 * Departments API — mock rút gọn cho prototype Chatbot.
 * Chỉ giữ getDepartmentTree (được dùng bởi chat dialogs).
 */

import type { DepartmentTreeNode } from '@/types/department';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const Z119_DEPTS: DepartmentTreeNode[] = [
  { id: 'BGD', code: 'BGĐ', name: 'Ban Giám đốc', parentId: null, children: [] },
  { id: 'PKT', code: 'P.KT', name: 'Phòng Kỹ thuật', parentId: null, children: [] },
  { id: 'PKCDB', code: 'P.QA', name: 'Phòng QA & Đảm bảo CL', parentId: null, children: [] },
  { id: 'PKH', code: 'P.KH', name: 'Phòng Kế hoạch', parentId: null, children: [] },
  { id: 'PX1', code: 'TT1', name: 'Trung tâm Hệ thống Monitoring', parentId: null, children: [] },
  { id: 'PX2', code: 'TT2', name: 'Trung tâm Phát triển Sản phẩm', parentId: null, children: [] },
  { id: 'PX3', code: 'TT3', name: 'Trung tâm Hạ tầng', parentId: null, children: [] },
  { id: 'PX4', code: 'TT4', name: 'Trung tâm DevOps', parentId: null, children: [] },
];

export async function getDepartmentTree(): Promise<{ data: DepartmentTreeNode[] }> {
  await delay(80);
  return { data: Z119_DEPTS };
}
