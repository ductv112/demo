'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker từ CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  fileName: string;
  /** Text cần highlight trong PDF (substring match, lấy 30 chars đầu để match spans) */
  highlightText?: string | null;
}

/**
 * PDF viewer — hiển thị TẤT CẢ trang trên 1 màn, scroll liên tục (giống Chrome PDF viewer)
 */
export function PdfViewer({ url, fileName, highlightText }: PdfViewerProps) {
  const t = useTranslations('documents');
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError(t('preview.cannotDisplayPdf'));
    setLoading(false);
  };

  // Highlight text trong PDF text layer sau khi render xong
  useEffect(() => {
    if (!highlightText || numPages === 0) return;

    const timer = setTimeout(() => {
      const container = document.querySelector('.react-pdf__Document');
      if (!container) return;

      const textSpans = container.querySelectorAll('.react-pdf__Page__textContent span');
      let firstMatch: Element | null = null;
      // Lấy 30 chars đầu (lowercase) để match các spans trong PDF text layer
      const searchText = highlightText.toLowerCase().slice(0, 30);

      textSpans.forEach((span) => {
        const text = span.textContent?.toLowerCase() || '';
        if (searchText.length > 0 && text.includes(searchText)) {
          (span as HTMLElement).style.backgroundColor = 'rgba(250, 204, 21, 0.5)';
          (span as HTMLElement).style.borderRadius = '2px';
          if (!firstMatch) firstMatch = span;
        }
      });

      if (firstMatch) {
        (firstMatch as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500); // Đợi 500ms cho text layer render xong

    return () => clearTimeout(timer);
  }, [highlightText, numPages]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.25));
  const resetZoom = () => setScale(1.0);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm mt-2">{t('preview.downloadHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-muted/30">
        <span className="text-sm text-muted-foreground">
          {numPages > 0 ? `${numPages} ${t('preview.pages')}` : t('preview.loading')}
        </span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.25}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            onClick={resetZoom}
            className="text-sm text-muted-foreground min-w-[60px] text-center hover:text-foreground transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Container — scroll tất cả trang */}
      <div className="flex-1 overflow-auto bg-muted/10">
        <div className="flex flex-col items-center gap-4 py-6 px-4">
          {loading && (
            <div className="space-y-4 w-full max-w-4xl">
              <Skeleton className="h-[800px] w-full" />
              <Skeleton className="h-[800px] w-full" />
            </div>
          )}
          <Document
            file={url}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={handleDocumentLoadError}
            loading={null}
          >
            {Array.from({ length: numPages }, (_, index) => (
              <div key={`page_${index + 1}`} className="mb-4">
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
