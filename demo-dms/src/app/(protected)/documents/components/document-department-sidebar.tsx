'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, User } from 'lucide-react';
import { getDepartmentTree } from '@/lib/departments-api';
import { getDocumentCountByDepartment } from '@/lib/documents-api';
import type { DepartmentTreeNode } from '@/types/department';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ──────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────

interface DocumentDepartmentSidebarProps {
  /** null = 'Tất cả tài liệu', 'personal' = cá nhân, UUID = phòng ban cụ thể */
  selectedDepartmentId: string | null;
  onSelectDepartment: (departmentId: string | null, departmentName?: string) => void;
  refreshKey?: number;
}

interface SidebarNodeProps {
  node: DepartmentTreeNode;
  level: number;
  selectedDepartmentId: string | null;
  onSelectDepartment: (departmentId: string | null, departmentName?: string) => void;
  documentCounts: Record<string, number>;
}

// ──────────────────────────────────────────────────
// Helper: flatten tất cả IDs trong tree
// ──────────────────────────────────────────────────

function flattenDepartmentIds(nodes: DepartmentTreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children?.length) {
      ids.push(...flattenDepartmentIds(node.children));
    }
  }
  return ids;
}

// ──────────────────────────────────────────────────
// SidebarNode — recursive tree node
// ──────────────────────────────────────────────────

function SidebarNode({
  node,
  level,
  selectedDepartmentId,
  onSelectDepartment,
  documentCounts,
}: SidebarNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand 2 levels đầu
  const hasChildren = node.children && node.children.length > 0;
  const docCount = documentCounts[node.id] ?? 0;
  const isSelected = selectedDepartmentId === node.id;

  return (
    <div>
      <button
        onClick={() => onSelectDepartment(node.id, node.name)}
        className={cn(
          'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
          isSelected
            ? 'bg-indigo-50 text-indigo-700'
            : 'hover:bg-indigo-50 text-foreground'
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {/* Expand/collapse toggle */}
        <span
          className="shrink-0 w-4 h-4 flex items-center justify-center"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : null}
        </span>

        {/* Department name */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1 truncate font-medium min-w-0">{node.name}</span>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{node.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Document count badge */}
        {docCount > 0 && (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs shrink-0 h-5 px-1.5',
              isSelected ? 'text-indigo-700 bg-indigo-100 border-indigo-200' : 'text-indigo-600 bg-indigo-50 border-indigo-200'
            )}
          >
            {docCount}
          </Badge>
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <SidebarNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedDepartmentId={selectedDepartmentId}
              onSelectDepartment={onSelectDepartment}
              documentCounts={documentCounts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────
// DocumentDepartmentSidebar — main component
// ──────────────────────────────────────────────────

export function DocumentDepartmentSidebar({
  selectedDepartmentId,
  onSelectDepartment,
  refreshKey = 0,
}: DocumentDepartmentSidebarProps) {
  const [tree, setTree] = useState<DepartmentTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch department tree
      const treeResponse = await getDepartmentTree();
      const newTree = treeResponse.data;
      setTree(newTree);

      // Fetch document counts cho tất cả departments
      const allIds = flattenDepartmentIds(newTree);
      if (allIds.length > 0) {
        const counts = await getDocumentCountByDepartment(allIds);
        setDocumentCounts(counts);
      }
    } catch (error) {
      console.error('[DocDeptSidebar] Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const treeResponse = await getDepartmentTree();
        if (cancelled) return;
        const newTree = treeResponse.data;
        setTree(newTree);

        const allIds = flattenDepartmentIds(newTree);
        if (allIds.length > 0) {
          const counts = await getDocumentCountByDepartment(allIds);
          if (!cancelled) setDocumentCounts(counts);
        }
      } catch (error) {
        if (!cancelled) console.error('[DocDeptSidebar] Failed to fetch data:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/70">
      {/* Header */}
      <div className="px-3 border-b shrink-0 bg-white border-blue-100 h-[52px] flex items-center">
        <p className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">
          Phòng ban
        </p>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* "Tất cả tài liệu" — root node */}
        <button
          onClick={() => onSelectDepartment(null)}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
            selectedDepartmentId === null
              ? 'bg-indigo-50 text-indigo-700'
              : 'hover:bg-indigo-50 text-foreground'
          )}
        >
          <FolderOpen className={cn('h-4 w-4 shrink-0', selectedDepartmentId === null ? 'text-indigo-500' : 'text-blue-500')} />
          <span className="font-medium">Tất cả tài liệu</span>
        </button>

        {/* "Tài liệu cá nhân" — node đặc biệt */}
        <button
          onClick={() => onSelectDepartment('personal')}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
            selectedDepartmentId === 'personal'
              ? 'bg-indigo-50 text-indigo-700'
              : 'hover:bg-indigo-50 text-foreground'
          )}
        >
          <User className={cn('h-4 w-4 shrink-0', selectedDepartmentId === 'personal' ? 'text-indigo-500' : 'text-violet-500')} />
          <span className="font-medium">Tài liệu cá nhân</span>
        </button>

        {/* Separator */}
        {tree.length > 0 && <div className="border-t border-blue-100 my-1.5" />}

        {/* Department tree */}
        {isLoading ? (
          <div className="space-y-1 px-2 pt-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-7 rounded-md bg-muted animate-pulse"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-2">
            Chưa có phòng ban nào
          </p>
        ) : (
          <div className="space-y-0.5">
            {tree.map((node) => (
              <SidebarNode
                key={node.id}
                node={node}
                level={0}
                selectedDepartmentId={selectedDepartmentId}
                onSelectDepartment={onSelectDepartment}
                documentCounts={documentCounts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
