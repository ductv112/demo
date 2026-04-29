/**
 * Utility module để parse FileList từ webkitdirectory thành tree structure.
 * Dùng cho folder upload feature (Plan 64.2-01).
 */

// ---------------------------------------------------------------------------
// Blocked extensions (shared với document-upload-dialog.tsx — Plan 02 sẽ refactor import)
// ---------------------------------------------------------------------------

export const BLOCKED_EXTENSIONS = new Set([
  '.sh', '.bash', '.exe', '.bat', '.cmd', '.ps1',
  '.msi', '.vbs', '.jar', '.py', '.php', '.rb',
  '.pl', '.com', '.scr', '.pif',
]);

export function hasBlockedExtension(filename: string): boolean {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return false;
  return BLOCKED_EXTENSIONS.has(filename.slice(lastDot).toLowerCase());
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileNode {
  type: 'file';
  name: string;
  path: string;           // full relative path: "myFolder/sub1/file.pdf"
  relativePath: string;   // same as path, dùng cho progress label
  file: File;
  hasWarning: boolean;    // true nếu blocked extension
}

export interface FolderNode {
  type: 'folder';
  name: string;
  path: string;           // "myFolder/sub1"
  children: TreeNode[];
  fileCount: number;      // direct files only (không recursive)
}

export type TreeNode = FolderNode | FileNode;

export interface ParsedFolderResult {
  rootName: string;
  tree: FolderNode;
  totalFiles: number;
  totalFolders: number;
}

// ---------------------------------------------------------------------------
// parseFolderFiles
// ---------------------------------------------------------------------------

/**
 * Parse FileList từ webkitdirectory input thành tree structure.
 *
 * Mỗi File có `webkitRelativePath` dạng "rootFolder/sub1/file.pdf".
 * Hàm build cây FolderNode/FileNode từ các path đó.
 */
export function parseFolderFiles(files: FileList): ParsedFolderResult {
  if (!files || files.length === 0) {
    const emptyRoot: FolderNode = {
      type: 'folder',
      name: '',
      path: '',
      children: [],
      fileCount: 0,
    };
    return { rootName: '', tree: emptyRoot, totalFiles: 0, totalFolders: 0 };
  }

  // Map từ folder path -> FolderNode (dùng để reuse khi nhiều file share cùng folder)
  const folderMap = new Map<string, FolderNode>();

  let rootName = '';

  // Đảm bảo FolderNode tồn tại cho một path, tạo mới nếu chưa có
  function ensureFolder(path: string, name: string): FolderNode {
    if (folderMap.has(path)) return folderMap.get(path)!;
    const node: FolderNode = {
      type: 'folder',
      name,
      path,
      children: [],
      fileCount: 0,
    };
    folderMap.set(path, node);
    return node;
  }

  // Duyệt từng file trong FileList
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relativePath = file.webkitRelativePath || file.name;
    const segments = relativePath.split('/');

    if (segments.length === 0) continue;

    // Root folder là segment đầu tiên
    if (!rootName) rootName = segments[0];

    // Đảm bảo root folder tồn tại
    ensureFolder(segments[0], segments[0]);

    // Tạo tất cả folder trung gian
    for (let depth = 1; depth < segments.length - 1; depth++) {
      const folderPath = segments.slice(0, depth + 1).join('/');
      const parentPath = segments.slice(0, depth).join('/');
      ensureFolder(folderPath, segments[depth]);

      // Thêm vào parent nếu chưa có
      const parent = folderMap.get(parentPath)!;
      const alreadyAdded = parent.children.some(
        c => c.type === 'folder' && c.path === folderPath
      );
      if (!alreadyAdded) {
        parent.children.push(folderMap.get(folderPath)!);
      }
    }

    // Tạo FileNode và thêm vào folder cha
    const fileNode: FileNode = {
      type: 'file',
      name: segments[segments.length - 1],
      path: relativePath,
      relativePath,
      file,
      hasWarning: hasBlockedExtension(file.name),
    };

    const parentPath = segments.slice(0, segments.length - 1).join('/');
    const parentFolder = folderMap.get(parentPath);
    if (parentFolder) {
      parentFolder.children.push(fileNode);
      parentFolder.fileCount += 1;
    }
  }

  // Sort: FolderNode trước FileNode, mỗi nhóm sort alphabet theo name
  function sortChildren(folder: FolderNode): void {
    folder.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    // Recursive sort
    for (const child of folder.children) {
      if (child.type === 'folder') sortChildren(child);
    }
  }

  const root = folderMap.get(rootName)!;
  sortChildren(root);

  // Đếm totalFiles và totalFolders
  let totalFiles = 0;
  let totalFolders = 0;

  function countNodes(folder: FolderNode, isRoot: boolean): void {
    if (!isRoot) totalFolders += 1;
    for (const child of folder.children) {
      if (child.type === 'file') {
        totalFiles += 1;
      } else {
        countNodes(child, false);
      }
    }
  }

  countNodes(root, true);

  return { rootName, tree: root, totalFiles, totalFolders };
}

// ---------------------------------------------------------------------------
// getAllFiles
// ---------------------------------------------------------------------------

/**
 * Flatten tree thành danh sách file theo thứ tự depth-first.
 * Dùng cho batch upload.
 */
export function getAllFiles(tree: FolderNode): FileNode[] {
  const result: FileNode[] = [];

  function traverse(node: FolderNode): void {
    for (const child of node.children) {
      if (child.type === 'folder') {
        traverse(child);
      } else {
        result.push(child);
      }
    }
  }

  traverse(tree);
  return result;
}
