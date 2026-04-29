'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Sparkles, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ChatSession } from '@/types/chat';

interface SessionListProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void | Promise<void>;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  /** Callback để tìm kiếm sessions theo từ khóa */
  onSearch: (search?: string) => void;
  onGenerateTitle: (id: string) => void;
  generatingTitleIds: Set<string>;
  onGenerateSummary?: (id: string) => void;
  isGeneratingSummary?: boolean;
  isStreaming?: boolean;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export function SessionList({
  sessions,
  selectedSessionId,
  isLoading,
  onSelect,
  onCreate,
  onDelete,
  onUpdateTitle,
  onSearch,
  onGenerateTitle,
  generatingTitleIds,
  onGenerateSummary,
  isGeneratingSummary = false,
  isStreaming = false,
}: SessionListProps) {
  const t = useTranslations('chat');
  const [searchValue, setSearchValue] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(value || undefined);
      }, 300);
    },
    [onSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleRenameOpen = (session: ChatSession) => {
    setRenameTargetId(session.id);
    setRenameValue(session.title ?? '');
  };

  const handleRenameConfirm = () => {
    if (renameTargetId && renameValue.trim()) {
      onUpdateTitle(renameTargetId, renameValue.trim());
    }
    setRenameTargetId(null);
    setRenameValue('');
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
    }
    setDeleteTargetId(null);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-background dark:from-zinc-900 dark:to-background">
      {/* Nút tạo hội thoại mới */}
      <div className="p-3 border-b shrink-0">
        <Button
          onClick={onCreate}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
        >
          <Plus className="h-4 w-4" />
          {t('newSession')}
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('searchSessions')}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('noSessions')}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {sessions.map((session, index) => {
              const isActive = session.id === selectedSessionId;
              return (
                <div key={session.id}>
                  {index > 0 && <div className="mx-3 h-px bg-border/50" />}
                <div
                  onClick={() => onSelect(session.id)}
                  className={`group relative px-3 py-2.5 cursor-pointer transition-all hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50/50 dark:from-indigo-950/50 dark:to-violet-950/30 border-l-2 border-l-indigo-500'
                      : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      {generatingTitleIds.has(session.id) ? (
                        <Skeleton className="h-4 w-3/4" />
                      ) : (
                        <p className="font-medium text-sm truncate leading-tight">
                          {session.title ?? t('newSessionTitle')}
                        </p>
                      )}

                      {/* Snippet */}
                      {session.lastMessage ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-tight">
                          {session.lastMessage.content}
                        </p>
                      ) : null}

                      {/* Footer: timestamp */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(session.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                          data-testid="session-action-menu-trigger"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="right">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameOpen(session);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          {t('renameSession')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateTitle(session.id);
                          }}
                          disabled={generatingTitleIds.has(session.id)}
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-2" />
                          {t('autoTitle')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateSummary?.(session.id);
                          }}
                          disabled={isGeneratingSummary || isStreaming}
                        >
                          <FileText className="h-3.5 w-3.5 mr-2" />
                          Xem tóm tắt
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetId(session.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteSession')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename dialog (chỉ cho real sessions) */}
      <AlertDialog
        open={renameTargetId !== null}
        onOpenChange={(open) => !open && setRenameTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('renameSession')}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="px-1">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={t('renameNewTitle')}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenameConfirm} disabled={!renameValue.trim()}>
              {t('save')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
