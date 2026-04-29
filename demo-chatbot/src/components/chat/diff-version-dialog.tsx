'use client';

import { useState, useEffect, useCallback } from 'react';
import { GitCompareArrows, Search, Loader2, FileText, ChevronLeft, ChevronRight, ChevronDown, FolderOpen, User } from 'lucide-react';
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
import { getDocuments, listDocumentVersions } from '@/lib/documents-api';
import { getDepartmentTree } from '@/lib/departments-api';
import type { Document } from '@/types/document';
import type { DocumentVersion } from '@/types/document';
import type { DepartmentTreeNode } from '@/types/department';
import { cn } from '@/lib/utils';

interface DiffVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    documentId: string,
    documentName: string,
    oldVersionNumber: number,
    newVersionNumber: number,
  ) => void;
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
          {t('diff.departments')}
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
          <span className="font-medium">{t('diff.allDocuments')}</span>
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
          <span className="font-medium">{t('diff.personalDocuments')}</span>
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
            {t('diff.noDepartments')}
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
// Helper — format relative time
// ──────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
}

// ──────────────────────────────────────────────────
// DiffVersionDialog — main component
// ──────────────────────────────────────────────────

export function DiffVersionDialog({
  open,
  onOpenChange,
  onConfirm,
  isStreaming,
}: DiffVersionDialogProps) {
  const t = useTranslations('chat');
  // Step state
  const [step, setStep] = useState<'document' | 'version'>('document');

  // Document step state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Department tree state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [departmentTree, setDepartmentTree] = useState<DepartmentTreeNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  // Version step state
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedOldVersion, setSelectedOldVersion] = useState<number | null>(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // ── Load documents ────────────────────────────────
  const loadDocuments = useCallback(async (search: string, pageNum: number, deptId?: string | null) => {
    setIsLoadingDocs(true);
    try {
      const result = await getDocuments({
        search: search || undefined,
        page: pageNum,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        departmentId: deptId ?? undefined,
      });
      setDocuments(result.data);
      setTotalPages(result.meta.totalPages);
    } catch {
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

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

  // ── Load versions for selected document ───────────
  const loadVersions = useCallback(async (documentId: string) => {
    setIsLoadingVersions(true);
    try {
      const result = await listDocumentVersions(documentId);
      setVersions(result);
    } catch {
      setVersions([]);
    } finally {
      setIsLoadingVersions(false);
    }
  }, []);

  // ── Reset on dialog close ─────────────────────────
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset all state when dialog closes
      setStep('document');
      setSearchQuery('');
      setDebouncedSearch('');
      setDocuments([]);
      setSelectedDocument(null);
      setVersions([]);
      setSelectedOldVersion(null);
      setPage(1);
      setTotalPages(1);
      setSelectedDepartmentId(null);
    }
    onOpenChange(isOpen);
  };

  // ── Load documents and department tree when dialog opens ──
  useEffect(() => {
    if (open) {
      setSelectedDepartmentId(null);
      loadDocuments('', 1, null);
      loadDepartmentTree();
    }
  }, [open, loadDocuments, loadDepartmentTree]);

  // ── Debounce search 300ms ─────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Load documents khi debouncedSearch hoặc selectedDepartmentId thay đổi ──
  useEffect(() => {
    if (!open || step !== 'document') return;
    const timer = setTimeout(() => {
      setPage(1);
      loadDocuments(debouncedSearch, 1, selectedDepartmentId);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, selectedDepartmentId, open, step, loadDocuments]);

  // ── Handle department selection ────────────────────
  const handleSelectDepartment = (deptId: string | null) => {
    setSelectedDepartmentId(deptId);
    setPage(1);
  };

  // ── When document selected → go to version step ───
  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setSelectedOldVersion(null);
    setVersions([]);
    setStep('version');
    loadVersions(doc.id);
  };

  // ── Confirm → call onConfirm with version numbers ─
  const handleConfirm = () => {
    if (!selectedDocument || selectedOldVersion === null) return;

    const latestVersion = versions[0];
    if (!latestVersion) return;

    const newVersionNumber = parseInt(latestVersion.versionNumber, 10);

    onConfirm(selectedDocument.id, selectedDocument.fileName, selectedOldVersion, newVersionNumber);
    handleOpenChange(false);
  };

  // ── Page change ───────────────────────────────────
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadDocuments(debouncedSearch, newPage, selectedDepartmentId);
  };

  // ── Derive latest version number ──────────────────
  const latestVersionNumber = versions.length > 0 ? parseInt(versions[0].versionNumber, 10) : null;

  // ── Empty message based on context ────────────────
  const getEmptyMessage = () => {
    if (searchQuery) return t('diff.noDocumentsSearch');
    if (selectedDepartmentId && selectedDepartmentId !== 'personal') {
      return t('diff.noDocumentsDept');
    }
    return t('diff.noDocuments');
  };

  // ── Document Step ─────────────────────────────────
  const DocumentStep = (
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
            placeholder={t('diff.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto min-h-[180px]">
          {isLoadingDocs ? (
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
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelectDocument(doc)}
                  className="w-full text-left px-3 py-2.5 hover:bg-accent/50 transition-colors flex items-start gap-3"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {doc.fileSize < 1024
                          ? `${doc.fileSize} B`
                          : doc.fileSize < 1024 * 1024
                          ? `${(doc.fileSize / 1024).toFixed(1)} KB`
                          : `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                      </span>
                      {doc.department && (
                        <span className="text-xs text-muted-foreground">
                          • {doc.department.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-2 border-t shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              {t('diff.prevPage')}
            </Button>
            <span className="text-xs text-muted-foreground self-center">
              {t('diff.pageInfo', { page, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              {t('diff.nextPage')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // ── Version Step ──────────────────────────────────
  const VersionStep = (
    <>
      {isLoadingVersions ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : versions.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <GitCompareArrows className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm text-center">
            {t('diff.notEnoughVersions', { count: versions.length === 0 ? '0' : '1' })}
            <br />
            {t('diff.notEnoughVersionsCannotCompare')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Current version info */}
          <div className="rounded-md bg-muted/50 px-3 py-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">{t('diff.currentVersion')}</p>
            <p className="text-sm font-semibold">
              v{versions[0].versionNumber}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                — {formatRelativeTime(versions[0].createdAt)}
              </span>
            </p>
            {versions[0].changeNote && (
              <p className="text-xs text-muted-foreground italic mt-0.5">
                &ldquo;{versions[0].changeNote}&rdquo;
              </p>
            )}
          </div>

          {/* Old version selection */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('diff.selectOldVersion')}</p>
            <div className="space-y-1 max-h-[240px] overflow-y-auto">
              {versions.slice(1).map((version) => {
                const vNum = parseInt(version.versionNumber, 10);
                const isSelected = selectedOldVersion === vNum;

                return (
                  <button
                    key={version.id}
                    type="button"
                    onClick={() => setSelectedOldVersion(vNum)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md border transition-colors flex items-start gap-3',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800/50',
                    )}
                  >
                    {/* Radio indicator */}
                    <div
                      className={cn(
                        'mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                        isSelected ? 'border-indigo-600' : 'border-muted-foreground/40',
                      )}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </div>

                    {/* Version info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        v{version.versionNumber}
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                          — {formatRelativeTime(version.createdAt)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {version.changeNote ? (
                          <span className="italic">&ldquo;{version.changeNote}&rdquo;</span>
                        ) : (
                          <span className="opacity-60">{t('diff.noChangeNote')}</span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5" />
            {step === 'document'
              ? t('diff.title')
              : t('diff.titleVersion', { docName: selectedDocument?.fileName ?? '' })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-0 flex-1 min-h-0">
          {step === 'document' ? DocumentStep : VersionStep}
        </div>

        <DialogFooter>
          {step === 'version' && (
            <Button
              variant="ghost"
              onClick={() => {
                setStep('document');
                setSelectedOldVersion(null);
              }}
              className="mr-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('diff.back')}
            </Button>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('diff.cancel')}
          </Button>
          {step === 'version' && (
            <Button
              onClick={handleConfirm}
              disabled={
                selectedOldVersion === null ||
                latestVersionNumber === null ||
                versions.length < 2 ||
                isStreaming
              }
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('diff.processing')}
                </>
              ) : (
                <>
                  <GitCompareArrows className="h-4 w-4 mr-2" />
                  {t('diff.compare')}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
