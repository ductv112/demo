'use client';

import { useTranslations } from 'next-intl';
import { Globe, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import type { ChatSession } from '@/types/chat';

interface ChatHeaderProps {
  session: ChatSession | null;
  messageCount: number;
  // Phase 72.1.1 (D-01..D-06) — Chỉ báo "Tiếp tục từ DD/MM/YYYY, HH:mm"
  lastMessageAt?: string | null;
  isStreaming: boolean;
  // Phase 49 — Multi-language
  multiLanguageEnabled: boolean;
  queryLanguage: string;
  responseLanguage: string;
  onToggleMultiLanguage: (enabled: boolean) => void;
  onQueryLanguageChange: (lang: string) => void;
  onResponseLanguageChange: (lang: string) => void;
  // Phase 70 — Session summary
  onGenerateSummary?: () => void;
  isGeneratingSummary?: boolean;
  // Responsive panel toggles
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  citationsPanelOpen?: boolean;
  onToggleCitationsPanel?: () => void;
  hasCitations?: boolean;
  // Phase 72.1.1 (D-10) — Panel mở được khi có tài liệu đã dùng dù không có citations
  hasReferencedDocs?: boolean;
}

/**
 * Phase 72.1.1 (D-02, D-03) — Format ISO timestamp → "DD/MM/YYYY, HH:mm" tiếng Việt.
 * Ví dụ: '2026-04-14T09:30:00.000Z' → '14/04/2026, 09:30'
 */
function formatLastMessageAt(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null; // guard invalid date
  const date = d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date}, ${time}`;
}

export function ChatHeader({
  session,
  messageCount,
  lastMessageAt,
  isStreaming,
  multiLanguageEnabled,
  queryLanguage,
  responseLanguage,
  onToggleMultiLanguage,
  onQueryLanguageChange,
  onResponseLanguageChange,
  onGenerateSummary,
  isGeneratingSummary,
  sidebarOpen,
  onToggleSidebar,
  citationsPanelOpen,
  onToggleCitationsPanel,
  hasCitations,
  hasReferencedDocs,
}: ChatHeaderProps) {
  const t = useTranslations('chat');

  if (!session) {
    return (
      <div className="px-4 py-3 border-b shrink-0 flex items-center gap-2 bg-gradient-to-r from-background to-slate-50/50 dark:to-zinc-900/50">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onToggleSidebar}
            title={sidebarOpen ? 'Đóng lịch sử hội thoại' : 'Mở lịch sử hội thoại'}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        )}
        <p className="text-sm text-muted-foreground">
          {t('selectOrCreate')}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 border-b shrink-0 bg-gradient-to-r from-background via-background to-indigo-50/30 dark:to-indigo-950/20 relative">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-indigo-400 to-violet-400 opacity-70" />
      {/* Row 1: Title + Status + Toggle */}
      <div className="flex items-center gap-2">
        {/* Nút toggle sidebar trái */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onToggleSidebar}
            title={sidebarOpen ? 'Đóng lịch sử hội thoại' : 'Mở lịch sử hội thoại'}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg truncate">
            {session.title ?? t('newSessionTitle')}
          </h2>
          {/* Phase 72.1.1 (D-01..D-06) — Chỉ báo tiếp tục hội thoại */}
          {lastMessageAt && messageCount > 0 && (() => {
            const formatted = formatLastMessageAt(lastMessageAt);
            if (!formatted) return null;
            return (
              <p className="text-xs italic text-muted-foreground leading-tight">
                Tiếp tục từ {formatted}
              </p>
            );
          })()}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isStreaming && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                {t('activeNow')}
              </span>
            </div>
          )}
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {t('messageCount', { count: messageCount })}
          </span>

          {/* Phase 49 — Multi-language toggle */}
          <div className="flex items-center gap-1.5 border-l pl-3">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <Label
              htmlFor="multi-lang-toggle"
              className="text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap hidden sm:block"
            >
              {t('multiLanguage.toggle')}
            </Label>
            <Switch
              id="multi-lang-toggle"
              checked={multiLanguageEnabled}
              onCheckedChange={onToggleMultiLanguage}
              disabled={isStreaming}
              className="scale-75"
              style={!multiLanguageEnabled ? { backgroundColor: '#a1a1aa' } : undefined}
            />
          </div>

          {/* Phase 70 — Nút tạo tóm tắt phiên */}
          {onGenerateSummary && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 shrink-0 gap-1.5 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-400 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/40 disabled:opacity-50"
              onClick={onGenerateSummary}
              disabled={isGeneratingSummary || isStreaming}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Tóm tắt phiên</span>
            </Button>
          )}

          {/* Nút toggle panel tham chiếu phải */}
          {onToggleCitationsPanel && (hasCitations || hasReferencedDocs) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 border-l pl-3 rounded-none"
              onClick={onToggleCitationsPanel}
              title={citationsPanelOpen ? 'Đóng tham chiếu' : 'Mở tham chiếu'}
            >
              {citationsPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: Language dropdowns (chỉ hiện khi toggle BẬT) */}
      {multiLanguageEnabled && (
        <div className="flex items-center gap-3 mt-1.5 pb-0.5">
          <span className="text-xs text-muted-foreground">{t('multiLanguage.queryLanguage')}:</span>
          <Select
            value={queryLanguage}
            onValueChange={onQueryLanguageChange}
            disabled={isStreaming}
          >
            <SelectTrigger className="h-7 text-xs w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-xs">
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground">{t('multiLanguage.responseLanguage')}:</span>
          <Select
            value={responseLanguage}
            onValueChange={onResponseLanguageChange}
            disabled={isStreaming}
          >
            <SelectTrigger className="h-7 text-xs w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-xs">
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
