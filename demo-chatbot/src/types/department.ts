export interface DepartmentTreeNode {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  children: DepartmentTreeNode[];
  fullName?: string;
  level?: number;
}
