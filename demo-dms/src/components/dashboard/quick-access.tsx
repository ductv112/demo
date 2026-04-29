'use client';

import { useRouter } from 'next/navigation';
import { Clock, File } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { RecentDocument } from '@/types/dashboard';
import { getFileIconConfig } from '@/lib/file-icon';
import { useTranslations } from 'next-intl';

interface QuickAccessProps {
  documents: RecentDocument[];
  loading?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function QuickAccess({ documents, loading = false }: QuickAccessProps) {
  const router = useRouter();
  const t = useTranslations('dashboard');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-5 space-y-3">
        <Skeleton className="h-4 w-48" />
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <Skeleton className="h-7 w-7 rounded-lg flex-shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24 hidden sm:block" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-3.5 w-3.5 text-slate-400" />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {t('quickAccess')}
        </p>
        {documents.length > 0 && (
          <span className="ml-auto text-[11px] text-slate-400 font-medium">
            {t('quickAccessCount', { count: documents.length })}
          </span>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-28 text-slate-400 gap-2">
          <File className="h-8 w-8 opacity-25" />
          <p className="text-sm">{t('quickAccessEmpty')}</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-80 pr-1 divide-y divide-slate-50">
          {documents.map((doc) => {
            const { icon: Icon, color, bg, label } = getFileIconConfig(doc.mimeType, doc.fileName);
            return (
              <button
                key={doc.id}
                className="w-full flex items-center gap-3 py-2.5 px-2 hover:bg-slate-50 rounded-xl transition-colors text-left group cursor-pointer"
                onClick={() => router.push(`/documents?highlight=${doc.id}`)}
              >
                {/* File icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>

                {/* Tên tài liệu */}
                <p className="text-sm text-slate-700 line-clamp-1 flex-1 min-w-0 group-hover:text-blue-600 transition-colors font-medium">
                  {doc.title}
                </p>

                {/* Loại file badge */}
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 flex-shrink-0">
                  {label}
                </span>

                {/* Người upload */}
                <span className="hidden md:block text-xs text-slate-400 flex-shrink-0 w-28 truncate text-right">
                  {doc.uploader.fullName}
                </span>

                {/* Ngày tạo */}
                <span className="text-xs text-slate-400 flex-shrink-0 w-20 text-right tabular-nums">
                  {formatDate(doc.createdAt)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
