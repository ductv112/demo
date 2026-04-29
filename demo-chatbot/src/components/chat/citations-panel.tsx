'use client';

import { useTranslations } from 'next-intl';
import { CitationCard } from './citation-card';
import { FileTypeIcon } from '@/lib/file-icon';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Citation, ReferencedDocument } from '@/types/chat';

interface CitationsPanelProps {
  citations: Citation[];
  /** doc_id của citation đang được highlight (sau khi click badge trong chat) */
  activeCitationId?: string | null;
  /** Callback khi click card/nút Mở để mở preview tài liệu */
  onDocumentOpen?: (docId: string) => void;
  // Phase 72.1.1 (D-07..D-12) — Tab "Tài liệu đã dùng"
  /** Danh sách tài liệu đã dùng trong phiên (đã sort A-Z backend side — D-17) */
  referencedDocs?: ReferencedDocument[];
  /** True khi đang fetch /chat/sessions/:id/referenced-documents */
  isLoadingDocs?: boolean;
}

export function CitationsPanel({
  citations,
  activeCitationId,
  onDocumentOpen,
  referencedDocs = [],
  isLoadingDocs = false,
}: CitationsPanelProps) {
  const t = useTranslations('chat');

  // D-11 — defensive client-side sort (backend đã sort A-Z D-17, nhưng phòng stale data)
  const sortedDocs = [...referencedDocs].sort((a, b) =>
    a.documentName.localeCompare(b.documentName, 'vi'),
  );

  // Tab mặc định: citations ưu tiên, fallback documents nếu không có citations
  const defaultTab = citations.length > 0 ? 'citations' : 'documents';

  return (
    <div className="flex flex-col h-full">
      {/* Header — giữ nguyên gradient + tiêu đề panel */}
      <div className="px-4 py-3 border-b shrink-0 bg-gradient-to-r from-background to-indigo-50/30 dark:to-indigo-950/20">
        <h3 className="font-bold text-sm uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
          {t('citations.title')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('citations.titleCount', { count: citations.length })}
        </p>
      </div>

      {/* Phase 72.1.1 (D-07) — Tabs 2 tab */}
      <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 grid grid-cols-2">
          <TabsTrigger value="citations" className="text-xs">
            Trích dẫn
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            Tài liệu đã dùng
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Trích dẫn — giữ nguyên behavior hiện tại */}
        <TabsContent value="citations" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0">
          {citations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('citations.noSources')}
            </p>
          ) : (
            citations.map((citation, index) => (
              <CitationCard
                key={`${citation.doc_id}-${index}`}
                citation={citation}
                index={index + 1}
                isHighlighted={
                  activeCitationId === citation.doc_id ||
                  activeCitationId === `${citation.doc_id}:${index + 1}`
                }
                onDocumentOpen={onDocumentOpen}
              />
            ))
          )}
        </TabsContent>

        {/* Tab 2: Tài liệu đã dùng — D-09, D-11, D-12 */}
        <TabsContent value="documents" className="flex-1 overflow-y-auto p-3 mt-0">
          {isLoadingDocs ? (
            /* Loading state: 3 skeleton rows (UI-SPEC) */
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : sortedDocs.length === 0 ? (
            /* Empty state D-12 */
            <p className="text-sm text-muted-foreground text-center py-8">
              Chưa có tài liệu nào được tham chiếu trong phiên này
            </p>
          ) : (
            /* Document list D-09, D-11 */
            <div className="space-y-1">
              {sortedDocs.map((doc) => (
                <div
                  key={doc.documentId}
                  className="flex items-center gap-2 py-2 px-3 border rounded-md hover:bg-muted/50"
                >
                  <FileTypeIcon
                    mimeType="application/octet-stream"
                    fileName={doc.fileName || doc.documentName}
                    className="w-4 h-4"
                  />
                  <p className="flex-1 text-sm truncate min-w-0" title={doc.documentName}>
                    {doc.documentName}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs shrink-0"
                    aria-label={`Xem ${doc.documentName}`}
                    onClick={() => onDocumentOpen?.(doc.documentId)}
                  >
                    Xem
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
