'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Loader2, ChevronRight, ChevronDown, FolderOpen, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocuments } from '@/lib/documents-api';
import { getDepartmentTree } from '@/lib/departments-api';
import type { Document } from '@/types/document';
import type { DepartmentTreeNode } from '@/types/department';
import { cn } from '@/lib/utils';

interface SummarizeDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (documentId: string, documentName: string) => void;
  isStreaming: boolean;
}

// ──────────────────────────────────────────────────
// MiniDepartmentTree — inline component (không tách file riêng)
// ──────────────────────────────────────────────────

interface MiniDepartmentTreeProps {
  tree: DepartmentTreeNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading: boolean;
}

interface MiniNodeProps {
  node: DepartmentTreeNode;
  level: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function MiniNode({ node, level, selectedId, onSelect }: MiniNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand 2 levels đầu
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={cn(
          'w-full flex items-center gap-1 py-1 rounded-sm text-xs transition-colors text-left',
          isSelected
            ? 'bg-indigo-600 text-white'
            : 'hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-foreground',
        )}
        style={{ paddingLeft: `${8 + level * 12}px`, paddingRight: '6px' }}
      >
        {/* Expand/collapse toggle */}
        <span
          className="shrink-0 w-3.5 h-3.5 flex items-center justify-center"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : null}
        </span>

        {/* Department name */}
        <span className="flex-1 truncate">{node.name}</span>
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <MiniNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MiniDepartmentTree({ tree, selectedId, onSelect, isLoading }: MiniDepartmentTreeProps) {
  const t = useTranslations('chat');
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1.5 border-b shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('summarize.departments')}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {/* "Tất cả tài liệu" */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            'w-full flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs transition-colors text-left',
            selectedId === null
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground',
          )}
        >
          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{t('summarize.allDocuments')}</span>
        </button>

        {/* "Tài liệu cá nhân" */}
        <button
          type="button"
          onClick={() => onSelect('personal')}
          className={cn(
            'w-full flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs transition-colors text-left',
            selectedId === 'personal'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground',
          )}
        >
          <User className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{t('summarize.personalDocuments')}</span>
        </button>

        {/* Separator */}
        {(isLoading || tree.length > 0) && <div className="border-t my-1" />}

        {/* Department tree */}
        {isLoading ? (
          <div className="space-y-1 px-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-5 rounded-sm bg-muted animate-pulse"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-1">
            {t('summarize.noDepartments')}
          </p>
        ) : (
          <div className="space-y-0.5">
            {tree.map((node) => (
              <MiniNode
                key={node.id}
                node={node}
                level={0}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// SummarizeDocumentDialog — main component
// ──────────────────────────────────────────────────

export function SummarizeDocumentDialog({
  open,
  onOpenChange,
  onConfirm,
  isStreaming,
}: SummarizeDocumentDialogProps) {
  const t = useTranslations('chat');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Department tree state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [departmentTree, setDepartmentTree] = useState<DepartmentTreeNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  // Load documents theo quyền xem + departmentId (không filter extractionStatus, disable client-side)
  const loadDocuments = useCallback(async (searchTerm: string, pageNum: number, deptId: string | null) => {
    setIsLoading(true);
    try {
      const result = await getDocuments({
        search: searchTerm || undefined,
        page: pageNum,
        limit: 20,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        departmentId: deptId ?? undefined,
      });
      setDocuments(result.data);
      setTotalPages(result.meta.totalPages);
    } catch {
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load department tree
  const loadDepartmentTree = useCallback(async () => {
    setIsLoadingTree(true);
    try {
      const response = await getDepartmentTree();
      setDepartmentTree(response.data);
    } catch {
      setDepartmentTree([]);
    } finally {
      setIsLoadingTree(false);
    }
  }, []);

  // Load khi dialog mở
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedDocId(null);
      setPage(1);
      setSelectedDepartmentId(null);
      loadDocuments('', 1, null);
      loadDepartmentTree();
    }
  }, [open, loadDocuments, loadDepartmentTree]);

  // Debounce search 300ms — kết hợp với selectedDepartmentId
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setPage(1);
      loadDocuments(search, 1, selectedDepartmentId);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedDepartmentId, open, loadDocuments]);

  const handleSelectDepartment = (deptId: string | null) => {
    setSelectedDepartmentId(deptId);
    setPage(1);
    // useEffect [search, selectedDepartmentId] sẽ trigger loadDocuments
  };

  const handleConfirm = () => {
    const selected = documents.find((d) => d.id === selectedDocId);
    if (selected) {
      onConfirm(selected.id, selected.fileName);
      onOpenChange(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadDocuments(search, newPage, selectedDepartmentId);
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Empty state message
  const getEmptyMessage = () => {
    if (search) return t('summarize.noDocumentsSearch');
    if (selectedDepartmentId && selectedDepartmentId !== 'personal') {
      return t('summarize.noDocumentsDept');
    }
    return t('summarize.noDocuments');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('summarize.title')}
          </DialogTitle>
        </DialogHeader>

        {/* 2-panel layout: cây phòng ban trái + danh sách tài liệu phải */}
        <div className="flex gap-0 flex-1 min-h-0 border rounded-md overflow-hidden">
          {/* Panel trái — cây phòng ban */}
          <div className="w-[200px] border-r overflow-y-auto shrink-0">
            <MiniDepartmentTree
              tree={departmentTree}
              selectedId={selectedDepartmentId}
              onSelect={handleSelectDepartment}
              isLoading={isLoadingTree}
            />
          </div>

          {/* Panel phải — search + document list + pagination */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Search input */}
            <div className="relative p-2 border-b shrink-0">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('summarize.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Document list */}
            <div className="flex-1 overflow-y-auto min-h-[180px]">
              {isLoading ? (
                <div className="p-3 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-md" />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                  <FileText className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-sm">{getEmptyMessage()}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {documents.map((doc) => {
                    const isNotReady = doc.extractionStatus !== 'COMPLETED';
                    return (
                    <button
                      key={doc.id}
                      type="button"
                      disabled={isNotReady}
                      onClick={() => {
                        if (!isNotReady) setSelectedDocId(doc.id);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2.5 transition-colors flex items-start gap-3',
                        selectedDocId === doc.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 border-l-2 border-l-indigo-500'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-l-2 border-l-transparent',
                        isNotReady && 'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent',
                      )}
                    >
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatSize(doc.fileSize)}</span>
                          {doc.department && (
                            <span className="text-xs text-muted-foreground">
                              • {doc.department.name}
                            </span>
                          )}
                          {isNotReady && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              {t('summarize.notReady')}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedDocId === doc.id && (
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                          <svg
                            className="h-3 w-3 text-primary-foreground"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                  })}
                </div>
              )}
            </div>

            {/* Pagination nếu nhiều trang */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-2 border-t shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  {t('summarize.prevPage')}
                </Button>
                <span className="text-xs text-muted-foreground self-center">
                  {t('summarize.pageInfo', { page, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  {t('summarize.nextPage')}
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('summarize.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedDocId || isStreaming} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0">
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('summarize.processing')}
              </>
            ) : (
              t('summarize.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
