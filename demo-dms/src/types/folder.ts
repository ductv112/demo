// Folder types cho API integration

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeNode extends Folder {
  documentCount: number;
  children: FolderTreeNode[];
  permissionLevel?: 'VIEWER' | 'EDITOR' | 'OWNER';
}

export interface FolderTreeResponse {
  data: FolderTreeNode[];
}

/** Item trong unified children response — FOLDER type */
export interface FolderChildFolderItem {
  id: string;
  name: string;
  type: 'FOLDER';
  parentId: string | null;
  documentCount: number;
  createdAt: string;
  createdBy: string;
  createdByUser: { id: string; username: string; fullName: string } | null;
  sortOrder: number;
  updatedAt: string;
  permissionLevel: 'VIEWER' | 'EDITOR' | 'OWNER';
}

/** Item trong unified children response — DOCUMENT type */
export interface FolderChildDocumentItem {
  id: string;
  title: string;
  type: 'DOCUMENT';
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  folderId: string | null;
  departmentId: string | null;
  uploadedBy: string;
  status: string;
  securityLevel: 'NORMAL' | 'CONFIDENTIAL';
  createdAt: string;
  updatedAt: string;
  permissionLevel: 'VIEWER' | 'EDITOR' | 'OWNER';
  uploader: { id: string; username: string; fullName: string; email: string };
  department: { id: string; name: string; code: string } | null;
}

export type FolderChildItem = FolderChildFolderItem | FolderChildDocumentItem;

export interface FolderChildrenResponse {
  data: FolderChildItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  folderCount: number;
}
