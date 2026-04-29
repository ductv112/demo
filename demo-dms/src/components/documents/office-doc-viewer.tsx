'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import mammoth from 'mammoth';
// Sanitize HTML trước khi render — chống Stored XSS từ nội dung DOCX độc hại
import DOMPurify from 'dompurify';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';

interface OfficeDocViewerProps {
  url: string;
  fileName: string;
}

/**
 * DOCX viewer - convert to HTML using mammoth.js
 * Chỉ hỗ trợ .docx (Office Open XML), KHÔNG hỗ trợ .doc (binary format cũ)
 */
export function OfficeDocViewer({ url, fileName }: OfficeDocViewerProps) {
  const t = useTranslations('documents');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check nếu file là .doc cũ (binary format) → không hỗ trợ
    if (fileName.toLowerCase().endsWith('.doc') && !fileName.toLowerCase().endsWith('.docx')) {
      setError(t('preview.docOldFormatPreview'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) =>
        mammoth.convertToHtml(
          { arrayBuffer },
          {
            // Convert ảnh nhúng trong DOCX sang base64 data URI để hiển thị trên web
            convertImage: mammoth.images.imgElement((image) =>
              image.read('base64').then((base64) => ({
                src: `data:${image.contentType};base64,${base64}`,
              }))
            ),
          }
        )
      )
      .then((result) => {
        setHtmlContent(result.value);
        setLoading(false);
        
        // Log warnings nếu có (loss of formatting)
        if (result.messages.length > 0) {
          console.warn('Mammoth conversion warnings:', result.messages);
        }
      })
      .catch((err: any) => {
        console.error('DOCX conversion error:', err);
        setError(t('preview.wordLoadError'));
        setLoading(false);
      });
  }, [url, fileName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="space-y-4 w-full max-w-4xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>{t('preview.loadingDoc')}</span>
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={() => window.open(url, '_blank')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('preview.download')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-8">
        {/* Render HTML content với custom styling */}
        <style jsx>{`
          .docx-content {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.6;
            color: rgb(var(--foreground));
          }
          .docx-content h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }
          .docx-content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
          }
          .docx-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          .docx-content p {
            margin-bottom: 0.75rem;
          }
          .docx-content strong {
            font-weight: 700;
          }
          .docx-content em {
            font-style: italic;
          }
          .docx-content ul, .docx-content ol {
            margin-left: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .docx-content li {
            margin-bottom: 0.25rem;
          }
          .docx-content table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
          }
          .docx-content th, .docx-content td {
            border: 1px solid rgb(var(--border));
            padding: 0.5rem;
            text-align: left;
          }
          .docx-content th {
            background-color: rgb(var(--muted));
            font-weight: 600;
          }
        `}</style>
        <div
          className="docx-content"
          dangerouslySetInnerHTML={{
            // Sanitize HTML từ mammoth — chống XSS, cho phép style/class/img cần cho DOCX rendering
            __html: DOMPurify.sanitize(htmlContent, {
              ADD_TAGS: ['style'],
              ADD_ATTR: ['class', 'style', 'src', 'alt', 'width', 'height'],
            }),
          }}
        />
      </div>
    </ScrollArea>
  );
}
