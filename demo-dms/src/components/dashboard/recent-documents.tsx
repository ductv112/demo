'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import type { RecentDocument } from '@/types/dashboard';
import { getFileIconConfig } from '@/lib/file-icon';
import { useTranslations } from 'next-intl';

interface RecentDocumentsProps {
  documents: RecentDocument[];
  loading?: boolean;
}

function formatFileSize(bytes: string | number | bigint): string {
  const n = typeof bytes === 'bigint' ? Number(bytes) : Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function RecentDocuments({ documents, loading = false }: RecentDocumentsProps) {
  const router = useRouter();
  const t = useTranslations('dashboard');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-5 space-y-4">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
              <div className="flex gap-3 items-start">
                <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-5">
      <div className="mb-5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {t('recentDocuments')}
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
          {t('recentDocumentsEmpty')}
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[320px] pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc) => {
              const { icon: Icon, color, bg } = getFileIconConfig(doc.mimeType, doc.fileName);
              return (
                <button
                  key={doc.id}
                  className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 hover:shadow-md hover:bg-slate-50/50 transition-all text-left cursor-pointer group flex flex-col h-full min-h-[100px]"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (doc.folderId) params.set('folder', doc.folderId);
                    params.set('highlight', doc.id);
                    router.push(`/documents?${params.toString()}`);
                  }}
                >
                  <div className="flex gap-3 items-start flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}
                    >
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                  </div>

                  {doc.department && (
                    <span className="inline-block text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold mt-2 max-w-[120px] truncate ring-1 ring-blue-100">
                      {doc.department.name}
                    </span>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2">
                    <span className="truncate max-w-[120px]">{doc.uploader.fullName}</span>
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
