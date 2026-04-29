'use client';

import {useState} from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import type {FolderNode, FileNode, TreeNode} from '@/lib/folder-upload-utils';

// ---------------------------------------------------------------------------
// FolderTreeNode — recursive render of a single tree node (internal)
// ---------------------------------------------------------------------------

interface FolderTreeNodeProps {
  node: TreeNode;
  level: number;
  expanded: boolean;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}

function FolderTreeNode({node, level, expanded, expandedPaths, onToggle}: FolderTreeNodeProps) {
  if (node.type === 'folder') {
    return (
      <>
        <div
          className="flex items-center gap-2 py-1 text-sm"
          style={{paddingLeft: level * 16}}
        >
          <button
            type="button"
            onClick={() => onToggle(node.path)}
            className="shrink-0 focus:outline-none"
            aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {expanded
              ? <ChevronDown className="h-3.5 w-3.5 text-slate-400 cursor-pointer shrink-0" />
              : <ChevronRight className="h-3.5 w-3.5 text-slate-400 cursor-pointer shrink-0" />
            }
          </button>
          {expanded
            ? <FolderOpen className="h-4 w-4 text-slate-500 shrink-0" />
            : <Folder className="h-4 w-4 text-slate-500 shrink-0" />
          }
          <span className="font-medium text-slate-700 truncate min-w-0" title={node.name}>{node.name}</span>
          <span className="text-xs text-slate-400 ml-auto shrink-0">({node.fileCount} files)</span>
        </div>
        {expanded && node.children.map((child, idx) => (
          <FolderTreeNode
            key={child.path + idx}
            node={child}
            level={level + 1}
            expanded={child.type === 'folder' ? expandedPaths.has(child.path) : false}
            expandedPaths={expandedPaths}
            onToggle={onToggle}
          />
        ))}
      </>
    );
  }

  // File node
  const fileNode = node as FileNode;
  return (
    <div
      className="flex items-center gap-2 py-1 text-sm"
      style={{paddingLeft: level * 16}}
    >
      {/* Spacer để align với folder icon row */}
      <span className="w-3.5 shrink-0" />
      {fileNode.hasWarning
        ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        : <FileText className="h-4 w-4 text-slate-400 shrink-0" />
      }
      <span className={`truncate min-w-0 ${fileNode.hasWarning ? 'text-amber-700' : 'text-slate-600'}`} title={fileNode.name}>
        {fileNode.name}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FolderTreePreview — container quản lý expanded state
// ---------------------------------------------------------------------------

interface FolderTreePreviewProps {
  tree: FolderNode;
  totalFiles: number;
  totalFolders: number;
}

export function FolderTreePreview({tree}: FolderTreePreviewProps) {
  // Khởi tạo: expand root (level 0) và direct folder children của root (level 1)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Root luôn expanded
    initial.add(tree.path);
    // Level 1: direct folder children của root
    for (const child of tree.children) {
      if (child.type === 'folder') {
        initial.add(child.path);
      }
    }
    return initial;
  });

  const handleToggle = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div
      className="rounded-md border border-slate-200 bg-slate-50 p-2 max-h-[240px] overflow-y-auto"
      data-testid="folder-tree-preview"
    >
      <FolderTreeNode
        node={tree}
        level={0}
        expanded={expandedPaths.has(tree.path)}
        expandedPaths={expandedPaths}
        onToggle={handleToggle}
      />
    </div>
  );
}
