/**
 * Orchestrator thực hiện folder upload:
 * 1. Tạo folder hierarchy depth-first với merge khi folder đã tồn tại
 * 2. Upload files với concurrency = 3, partial failure không dừng batch
 * 3. Hỗ trợ cancel mid-upload qua cancelRef
 */

import { createFolder, getFolderTree } from './folders-api';
import { uploadDocument } from './documents-api';
import { getAllFiles, type FolderNode, type FileNode } from './folder-upload-utils';
import type { FolderTreeNode } from '@/types/folder';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FolderUploadMetadata {
  description?: string;
  referenceNumber?: string;
  securityLevel: 'NORMAL' | 'CONFIDENTIAL';
}

export interface FolderUploadProgress {
  completedFiles: number;
  totalFiles: number;
  currentFilePath: string;
}

export interface FolderUploadResult {
  successFiles: string[];
  failedFiles: { path: string; error: string }[];
  cancelled: boolean;
  totalFiles: number;
}

export interface FolderUploadOptions {
  tree: FolderNode;
  targetFolderId?: string | null;
  departmentId?: string | null;
  metadata: FolderUploadMetadata;
  onProgress: (progress: FolderUploadProgress) => void;
  cancelRef: { current: boolean };
}

// ---------------------------------------------------------------------------
// Build existing folders map từ FolderTreeNode[]
// key = `${parentId ?? 'root'}::${name}` → folderId
// ---------------------------------------------------------------------------

function buildExistingFoldersMap(
  nodes: FolderTreeNode[],
  map: Map<string, string>,
): void {
  for (const node of nodes) {
    const parentKey = node.parentId ?? 'root';
    const key = `${parentKey}::${node.name}`;
    map.set(key, node.id);
    if (node.children && node.children.length > 0) {
      buildExistingFoldersMap(node.children, map);
    }
  }
}

// ---------------------------------------------------------------------------
// createFolderHierarchy — depth-first, merge nếu folder đã tồn tại
// ---------------------------------------------------------------------------

async function createFolderHierarchy(
  folder: FolderNode,
  parentFolderId: string | null | undefined,
  departmentId: string | null | undefined,
  existingFoldersMap: Map<string, string>,
  folderIdMap: Map<string, string>,
): Promise<void> {
  for (const child of folder.children) {
    if (child.type !== 'folder') continue;

    const parentKey = parentFolderId ?? 'root';
    const existingKey = `${parentKey}::${child.name}`;

    let childFolderId: string;

    if (existingFoldersMap.has(existingKey)) {
      // Merge: dùng folder đã tồn tại, không tạo mới
      childFolderId = existingFoldersMap.get(existingKey)!;
    } else {
      // Tạo folder mới
      const payload: { name: string; parentId?: string; departmentId?: string | null } = {
        name: child.name,
        departmentId: departmentId ?? null,
      };
      if (parentFolderId) payload.parentId = parentFolderId;

      const response = await createFolder(payload);
      childFolderId = response.data.id;

      // Cập nhật existingFoldersMap để subfolder con có thể merge đúng
      existingFoldersMap.set(existingKey, childFolderId);
    }

    // Lưu path -> folderId để file upload dùng đúng folderId
    folderIdMap.set(child.path, childFolderId);

    // Đệ quy depth-first cho subfolder
    await createFolderHierarchy(child, childFolderId, departmentId, existingFoldersMap, folderIdMap);
  }
}

// ---------------------------------------------------------------------------
// uploadFilesWithConcurrency — pool pattern, concurrency = 3
// ---------------------------------------------------------------------------

async function uploadFilesWithConcurrency(
  files: FileNode[],
  folderIdMap: Map<string, string>,
  targetFolderId: string | null | undefined,
  departmentId: string | null | undefined,
  metadata: FolderUploadMetadata,
  onProgress: (progress: FolderUploadProgress) => void,
  cancelRef: { current: boolean },
  concurrency = 3,
): Promise<{ successFiles: string[]; failedFiles: { path: string; error: string }[]; cancelled: boolean }> {
  const successFiles: string[] = [];
  const failedFiles: { path: string; error: string }[] = [];
  let completedFiles = 0;
  const totalFiles = files.length;

  // Pool pattern: running = Set của Promise, queue = còn lại
  const queue = [...files];
  const running = new Set<Promise<void>>();

  async function uploadOne(fileNode: FileNode): Promise<void> {
    // Tính folderId cho file này: lấy folder cha từ path
    const segments = fileNode.path.split('/');
    const parentPath = segments.slice(0, segments.length - 1).join('/');
    const folderId = folderIdMap.get(parentPath) ?? targetFolderId ?? null;

    try {
      await uploadDocument(
        fileNode.file,
        undefined,
        metadata.description,
        folderId,
        undefined,
        departmentId ?? null,
        metadata.referenceNumber,
        metadata.securityLevel,
      );
      successFiles.push(fileNode.path);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failedFiles.push({ path: fileNode.path, error: message });
    } finally {
      completedFiles++;
      onProgress({
        completedFiles,
        totalFiles,
        currentFilePath: fileNode.path,
      });
    }
  }

  while (queue.length > 0 && !cancelRef.current) {
    const fileNode = queue.shift()!;
    const promise = uploadOne(fileNode).then(() => {
      running.delete(promise);
    });
    running.add(promise);

    if (running.size >= concurrency) {
      await Promise.race(running);
    }
  }

  // Đợi tất cả promise đang chạy hoàn thành
  if (running.size > 0) {
    await Promise.all(running);
  }

  return { successFiles, failedFiles, cancelled: cancelRef.current };
}

// ---------------------------------------------------------------------------
// executeFolderUpload — entry point
// ---------------------------------------------------------------------------

export async function executeFolderUpload(options: FolderUploadOptions): Promise<FolderUploadResult> {
  const { tree, targetFolderId, departmentId, metadata, onProgress, cancelRef } = options;

  // Bước 1: Lấy existing folders để build merge map
  const treeResponse = await getFolderTree(departmentId ?? undefined);
  const existingFoldersMap = new Map<string, string>();

  // Nếu có targetFolderId, root của tree upload là con của targetFolderId
  // existingFoldersMap cần phản ánh đúng parentId
  // Đơn giản hoá: flatten toàn bộ tree response vào map
  buildExistingFoldersMap(treeResponse.data, existingFoldersMap);

  // Bước 2: Tạo root folder trước, rồi tạo hierarchy bên trong
  const folderIdMap = new Map<string, string>();

  // Tạo root folder (tree.name) dưới targetFolderId — merge nếu đã tồn tại
  const rootParentKey = targetFolderId ?? 'root';
  const rootExistingKey = `${rootParentKey}::${tree.name}`;
  let rootFolderId: string;

  if (existingFoldersMap.has(rootExistingKey)) {
    rootFolderId = existingFoldersMap.get(rootExistingKey)!;
  } else {
    const rootPayload: { name: string; parentId?: string; departmentId?: string | null } = {
      name: tree.name,
      departmentId: departmentId ?? null,
    };
    if (targetFolderId) rootPayload.parentId = targetFolderId;
    const rootResponse = await createFolder(rootPayload);
    rootFolderId = rootResponse.data.id;
    existingFoldersMap.set(rootExistingKey, rootFolderId);
  }

  folderIdMap.set(tree.path, rootFolderId);

  await createFolderHierarchy(tree, rootFolderId, departmentId ?? null, existingFoldersMap, folderIdMap);

  // Bước 3: Flatten tree thành danh sách file và upload
  const allFiles = getAllFiles(tree);
  const totalFiles = allFiles.length;

  if (totalFiles === 0) {
    return { successFiles: [], failedFiles: [], cancelled: false, totalFiles: 0 };
  }

  const { successFiles, failedFiles, cancelled } = await uploadFilesWithConcurrency(
    allFiles,
    folderIdMap,
    targetFolderId,
    departmentId,
    metadata,
    onProgress,
    cancelRef,
  );

  return { successFiles, failedFiles, cancelled, totalFiles };
}
