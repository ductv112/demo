'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { FolderTreeNode } from '@/types/folder';

interface FolderBreadcrumbProps {
  folderTree: FolderTreeNode[];
  selectedFolderId: string | null;
  onNavigateToFolder: (folderId: string | null) => void;
  rootLabel?: string;
}

function buildPath(tree: FolderTreeNode[], targetId: string): FolderTreeNode[] {
  for (const node of tree) {
    if (node.id === targetId) return [node];
    if (node.children.length > 0) {
      const child = buildPath(node.children, targetId);
      if (child.length > 0) return [node, ...child];
    }
  }
  return [];
}

/** Tên folder: truncate max-w + tooltip nếu dài */
function FolderLabel({ name, maxW = 'max-w-[110px]' }: { name: string; maxW?: string }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`${maxW} truncate block`}>{name}</span>
        </TooltipTrigger>
        <TooltipContent><p>{name}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Breadcrumb navigation — chỉ hiện: root > … > parent > current
 * Nếu depth ≥ 3 thì collapse các cấp giữa thành "…" (tooltip = full path)
 */
export function FolderBreadcrumb({
  folderTree,
  selectedFolderId,
  onNavigateToFolder,
  rootLabel,
}: FolderBreadcrumbProps) {
  const t = useTranslations('documents');
  const path = selectedFolderId ? buildPath(folderTree, selectedFolderId) : [];

  // Các cấp bị ẩn (giữa root và parent)
  const collapsed = path.length > 2 ? path.slice(0, path.length - 2) : [];
  // Cấp cha trực tiếp (chỉ khi depth >= 2)
  const parent = path.length >= 2 ? path[path.length - 2] : null;
  // Cấp hiện tại
  const current = path.length >= 1 ? path[path.length - 1] : null;

  const rootName = rootLabel || t('allDocuments');
  const isRoot = selectedFolderId === null;

  return (
    <div className="flex items-center min-w-0 overflow-hidden">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">

          {/* Root */}
          <BreadcrumbItem>
            {isRoot ? (
              <BreadcrumbPage className="font-semibold text-sm text-foreground">
                <FolderLabel name={rootName} maxW="max-w-[140px]" />
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                onClick={() => onNavigateToFolder(null)}
                className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <FolderLabel name={rootName} maxW="max-w-[100px]" />
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {/* Collapsed "…" */}
          {collapsed.length > 0 && (
            <>
              <BreadcrumbSeparator><ChevronRight className="h-3.5 w-3.5" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onNavigateToFolder(collapsed[collapsed.length - 1].id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{collapsed.map(f => f.name).join(' › ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </BreadcrumbItem>
            </>
          )}

          {/* Parent (depth >= 2) */}
          {parent && (
            <>
              <BreadcrumbSeparator><ChevronRight className="h-3.5 w-3.5" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => onNavigateToFolder(parent.id)}
                  className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <FolderLabel name={parent.name} />
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {/* Current */}
          {current && (
            <>
              <BreadcrumbSeparator><ChevronRight className="h-3.5 w-3.5" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-sm text-foreground">
                  <FolderLabel name={current.name} />
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}

        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
