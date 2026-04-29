'use client';

import { AlertTriangle, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Constants ──────────────────────────────────────────────────────────────

const SESSION_LIMIT = 50;
const WARNING_THRESHOLD = 45; // Hiện cảnh báo khi còn 5 tin nhắn

// ─── Props ──────────────────────────────────────────────────────────────────

interface ContextWindowBannerProps {
  /** Số tin nhắn hiện tại trong phiên */
  messageCount: number;
  /** Callback tạo phiên mới */
  onNewSession: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Issue #122 — Banner cảnh báo/chặn khi phiên đạt giới hạn 50 tin nhắn (BRD Mục 1.3).
 *
 * - warning state (45–49 tin nhắn): cảnh báo màu vàng, còn X tin nhắn
 * - limit state (≥50 tin nhắn): chặn màu đỏ, nút "Bắt đầu phiên mới"
 */
export function ContextWindowBanner({ messageCount, onNewSession }: ContextWindowBannerProps) {
  const isLimitReached = messageCount >= SESSION_LIMIT;
  const isWarning = !isLimitReached && messageCount >= WARNING_THRESHOLD;

  if (!isWarning && !isLimitReached) return null;

  const remaining = SESSION_LIMIT - messageCount;

  if (isLimitReached) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg mx-4 mb-2">
        <XCircle className="h-5 w-5 text-destructive shrink-0" />
        <p className="text-sm text-destructive flex-1">
          Phiên hội thoại đã đạt giới hạn 50 tin nhắn. Vui lòng bắt đầu phiên mới.
        </p>
        <Button
          size="sm"
          variant="destructive"
          onClick={onNewSession}
          className="shrink-0 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Bắt đầu phiên mới
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40 rounded-lg mx-4 mb-2">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Phiên này còn <strong>{remaining}</strong> tin nhắn trước khi đạt giới hạn 50.
      </p>
    </div>
  );
}
