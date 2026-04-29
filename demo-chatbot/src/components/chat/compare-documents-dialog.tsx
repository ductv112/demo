'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Search, Loader2, FileText, ChevronLeft, ChevronRight, ChevronDown, FolderOpen, User } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { getDocuments } from '@/lib/documents-api';
import { getDepartmentTree } from '@/lib/departments-api';
import type { Document } from '@/types/document';
import type { DepartmentTreeNode } from '@/types/department';
import { cn } from '@/lib/utils';

interface CompareDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (docAId: string, docAName: string, docBId: string, docBName: string) => void;
  isStreaming: boolean;
  /** Pre-select document A (từ context menu) */
  preSelectedDocId?: string;
  preSelectedDocName?: string;
}

// ──────────────────────────────────────────────────
// MiniDepartmentTree — inline component (giống pattern trong diff-version-dialog)
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
  const [isExpanded, setIsExpanded] = useState(level < 2);
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
        <span className="flex-1 truncate">{node.name}</span>
      </button>

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
      <div className="px-2 py-1.5 border-b shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('compare.departments')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
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
          <span className="font-medium">{t('compare.allDocuments')}</span>
        </button>

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
          <span className="font-medium">{t('compare.personalDocuments')}</span>
        </button>

        {(isLoading || tree.length > 0) && <div className="border-t my-1" />}

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
            {t('compare.noDepartments')}
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
// DocumentPanel — panel chọn tài liệu (dùng cho cả A và B)
// ──────────────────────────────────────────────────

interface DocumentPanelProps {
  label: string;
  tree: DepartmentTreeNode[];
  isLoadingTree: boolean;
  documents: Document[];
  isLoadingDocs: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedDeptId: string | null;
  onSelectDept: (id: string | null) => void;
  selectedDocId: string | null;
  selectedDocName: string | null;
  onSelectDoc: (id: string, name: string) => void;
  /** ID tài liệu đã chọn ở panel kia (để disable nếu trùng) */
  otherSelectedDocId: string | null;
  /** Nếu là panel trái được pre-selected, disable selection */
  isPreSelected?: boolean;
}

function DocumentPanel({
  label,
  tree,
  isLoadingTree,
  documents,
  isLoadingDocs,
  searchQuery,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
  selectedDeptId,
  onSelectDept,
  selectedDocId,
  selectedDocName,
  onSelectDoc,
  otherSelectedDocId,
  isPreSelected,
}: DocumentPanelProps) {
  const t = useTranslations('chat');
  const getEmptyMessage = () => {
    if (searchQuery) return t('compare.noDocumentsSearch');
    if (selectedDeptId && selectedDeptId !== 'personal') {
      return t('compare.noDocumentsDept');
    }
    return t('compare.noDocuments');
  };

  return (
    <div className="flex flex-col border rounded-md overflow-hidden" style={{ minHeight: 0 }}>
      {/* Panel header */}
      <div className="px-3 py-2 bg-muted/30 border-b shrink-0">
        <p className="text-sm font-semibold">{label}</p>
        {selectedDocName && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate mt-0.5 font-medium" title={selectedDocName}>
            ✓ {selectedDocName}
          </p>
        )}
      </div>

      {/* Body: department tree + document list */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Cây phòng ban */}
        <div className="w-[140px] border-r shrink-0 overflow-y-auto">
          <MiniDepartmentTree
            tree={tree}
            selectedId={selectedDeptId}
            onSelect={onSelectDept}
            isLoading={isLoadingTree}
          />
        </div>

        {/* Danh sách tài liệu */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search */}
          <div className="relative p-2 border-b shrink-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t('compare.search')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-7 text-xs"
            />
          </div>

          {/* Documents */}
          <div className="flex-1 overflow-y-auto min-h-[160px]">
            {isLoadingDocs ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[160px] text-muted-foreground">
                <FileText className="h-8 w-8 mb-1.5 opacity-40" />
                <p className="text-xs">{getEmptyMessage()}</p>
              </div>
            ) : (
              <div className="divide-y">
                {documents.map((doc) => {
                  const isSelectedHere = selectedDocId === doc.id;
                  const isSameAsOther = otherSelectedDocId === doc.id;
                  const isNotExtracted = doc.extractionStatus !== 'COMPLETED';
                  const isDisabled = (isPreSelected && isSelectedHere) || isNotExtracted;

                  return (
                    <button
                      key={doc.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) onSelectDoc(doc.id, doc.fileName);
                      }}
                      className={cn(
                        'w-full text-left px-2.5 py-2 transition-colors flex items-start gap-2',
                        isSelectedHere
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 border-l-2 border-indigo-500'
                          : isSameAsOther
                          ? 'bg-amber-50 dark:bg-amber-950/20 border-l-2 border-amber-400'
                          : isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-l-2 border-l-transparent',
                      )}
                      title={
                        isNotExtracted
                          ? t('compare.notDigitized')
                          : isSameAsOther
                          ? t('compare.selectedInOtherPanel')
                          : undefined
                      }
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {doc.department && (
                            <span className="text-xs text-muted-foreground truncate">
                              {doc.department.name}
                            </span>
                          )}
                          {isNotExtracted && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-amber-400 text-amber-600 bg-amber-50">
                              {t('compare.notDigitizedBadge')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 p-1.5 border-t shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground self-center">
                {page}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// CompareDocumentsDialog — main component
// ──────────────────────────────────────────────────

export function CompareDocumentsDialog({
  open,
  onOpenChange,
  onConfirm,
  isStreaming,
  preSelectedDocId,
  preSelectedDocName,
}: CompareDocumentsDialogProps) {
  const t = useTranslations('chat');
  // Shared department tree state
  const [departmentTree, setDepartmentTree] = useState<DepartmentTreeNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  // Panel A state
  const [searchA, setSearchA] = useState('');
  const [debouncedSearchA, setDebouncedSearchA] = useState('');
  const [documentsA, setDocumentsA] = useState<Document[]>([]);
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [pageA, setPageA] = useState(1);
  const [totalPagesA, setTotalPagesA] = useState(1);
  const [selectedDeptA, setSelectedDeptA] = useState<string | null>(null);
  const [selectedDocAId, setSelectedDocAId] = useState<string | null>(preSelectedDocId || null);
  const [selectedDocAName, setSelectedDocAName] = useState<string | null>(preSelectedDocName || null);

  // Panel B state
  const [searchB, setSearchB] = useState('');
  const [debouncedSearchB, setDebouncedSearchB] = useState('');
  const [documentsB, setDocumentsB] = useState<Document[]>([]);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const [pageB, setPageB] = useState(1);
  const [totalPagesB, setTotalPagesB] = useState(1);
  const [selectedDeptB, setSelectedDeptB] = useState<string | null>(null);
  const [selectedDocBId, setSelectedDocBId] = useState<string | null>(null);
  const [selectedDocBName, setSelectedDocBName] = useState<string | null>(null);

  // ── Load department tree ───────────────────────────
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

  // ── Load documents for panel A ─────────────────────
  const loadDocumentsA = useCallback(async (search: string, pageNum: number, deptId?: string | null) => {
    setIsLoadingA(true);
    try {
      const result = await getDocuments({
        search: search || undefined,
        page: pageNum,
        limit: 8,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        departmentId: deptId ?? undefined,
      });
      setDocumentsA(result.data);
      setTotalPagesA(result.meta.totalPages);
    } catch {
      setDocumentsA([]);
    } finally {
      setIsLoadingA(false);
    }
  }, []);

  // ── Load documents for panel B ─────────────────────
  const loadDocumentsB = useCallback(async (search: string, pageNum: number, deptId?: string | null) => {
    setIsLoadingB(true);
    try {
      const result = await getDocuments({
        search: search || undefined,
        page: pageNum,
        limit: 8,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        departmentId: deptId ?? undefined,
      });
      setDocumentsB(result.data);
      setTotalPagesB(result.meta.totalPages);
    } catch {
      setDocumentsB([]);
    } finally {
      setIsLoadingB(false);
    }
  }, []);

  // ── Reset on dialog close ─────────────────────────
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchA('');
      setDebouncedSearchA('');
      setDocumentsA([]);
      setPageA(1);
      setTotalPagesA(1);
      setSelectedDeptA(null);
      setSelectedDocAId(null);
      setSelectedDocAName(null);

      setSearchB('');
      setDebouncedSearchB('');
      setDocumentsB([]);
      setPageB(1);
      setTotalPagesB(1);
      setSelectedDeptB(null);
      setSelectedDocBId(null);
      setSelectedDocBName(null);
    }
    onOpenChange(isOpen);
  };

  // ── Load on open ──────────────────────────────────
  useEffect(() => {
    if (open) {
      loadDepartmentTree();
      loadDocumentsA('', 1, null);
      loadDocumentsB('', 1, null);

      // Pre-select nếu được truyền vào
      if (preSelectedDocId && preSelectedDocName) {
        setSelectedDocAId(preSelectedDocId);
        setSelectedDocAName(preSelectedDocName);
      }
    }
  }, [open, loadDepartmentTree, loadDocumentsA, loadDocumentsB, preSelectedDocId, preSelectedDocName]);

  // ── Debounce search A ─────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchA(searchA), 300);
    return () => clearTimeout(timer);
  }, [searchA]);

  // ── Debounce search B ─────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchB(searchB), 300);
    return () => clearTimeout(timer);
  }, [searchB]);

  // ── Reload panel A khi search/dept thay đổi ───────
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setPageA(1);
      loadDocumentsA(debouncedSearchA, 1, selectedDeptA);
    }, 0);
    return () => clearTimeout(timer);
  }, [debouncedSearchA, selectedDeptA, open, loadDocumentsA]);

  // ── Reload panel B khi search/dept thay đổi ───────
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setPageB(1);
      loadDocumentsB(debouncedSearchB, 1, selectedDeptB);
    }, 0);
    return () => clearTimeout(timer);
  }, [debouncedSearchB, selectedDeptB, open, loadDocumentsB]);

  // ── Handlers ──────────────────────────────────────
  const handleSelectDocA = (id: string, name: string) => {
    setSelectedDocAId(id);
    setSelectedDocAName(name);
  };

  const handleSelectDocB = (id: string, name: string) => {
    setSelectedDocBId(id);
    setSelectedDocBName(name);
  };

  const handleConfirm = () => {
    if (!selectedDocAId || !selectedDocAName || !selectedDocBId || !selectedDocBName) return;
    onConfirm(selectedDocAId, selectedDocAName, selectedDocBId, selectedDocBName);
    handleOpenChange(false);
  };

  const isSameDoc = selectedDocAId && selectedDocBId && selectedDocAId === selectedDocBId;
  const canConfirm =
    !!selectedDocAId && !!selectedDocBId && !isSameDoc && !isStreaming;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            {t('compare.title')}
          </DialogTitle>
        </DialogHeader>

        {/* 2-panel body */}
        <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Panel A */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <DocumentPanel
              label={t('compare.docA')}
              tree={departmentTree}
              isLoadingTree={isLoadingTree}
              documents={documentsA}
              isLoadingDocs={isLoadingA}
              searchQuery={searchA}
              onSearchChange={setSearchA}
              page={pageA}
              totalPages={totalPagesA}
              onPageChange={(p) => {
                setPageA(p);
                loadDocumentsA(debouncedSearchA, p, selectedDeptA);
              }}
              selectedDeptId={selectedDeptA}
              onSelectDept={(id) => setSelectedDeptA(id)}
              selectedDocId={selectedDocAId}
              selectedDocName={selectedDocAName}
              onSelectDoc={handleSelectDocA}
              otherSelectedDocId={selectedDocBId}
              isPreSelected={!!preSelectedDocId && selectedDocAId === preSelectedDocId}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center shrink-0">
            <div className="w-px h-full bg-border" />
          </div>

          {/* Panel B */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <DocumentPanel
              label={t('compare.docB')}
              tree={departmentTree}
              isLoadingTree={isLoadingTree}
              documents={documentsB}
              isLoadingDocs={isLoadingB}
              searchQuery={searchB}
              onSearchChange={setSearchB}
              page={pageB}
              totalPages={totalPagesB}
              onPageChange={(p) => {
                setPageB(p);
                loadDocumentsB(debouncedSearchB, p, selectedDeptB);
              }}
              selectedDeptId={selectedDeptB}
              onSelectDept={(id) => setSelectedDeptB(id)}
              selectedDocId={selectedDocBId}
              selectedDocName={selectedDocBName}
              onSelectDoc={handleSelectDocB}
              otherSelectedDocId={selectedDocAId}
            />
          </div>
        </div>

        {/* Warning if same doc selected */}
        {isSameDoc && (
          <p className="text-xs text-amber-600 text-center">
            {t('compare.sameDocs')}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('compare.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0">
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('compare.processing')}
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                {t('compare.compare')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
