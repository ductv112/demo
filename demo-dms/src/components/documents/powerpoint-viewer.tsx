'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  Loader2,
  Maximize2,
  Minimize2,
  Presentation,
  RotateCcw,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { api } from '@/lib/api';
import { downloadDocument } from '@/lib/documents-api';
import { fetchPublicPptxToImages } from '@/lib/public-links-api';
import { toast } from 'sonner';

interface SlideData {
  page: number;
  data: string; // base64 PNG
}

interface PowerpointViewerProps {
  url: string;
  fileName: string;
  documentId?: string;
  publicToken?: string;
}

/**
 * PowerpointViewer — hiển thị PPTX dưới dạng slide carousel/grid.
 *
 * Flow:
 * 1. Fetch blob từ url prop
 * 2. POST file đến AI service /convert/pptx-to-images
 * 3. Render carousel (1 slide tại 1 thời điểm) hoặc grid overview
 */
export function PowerpointViewer({ url, fileName, documentId, publicToken }: PowerpointViewerProps) {
  const t = useTranslations('documents');
  const [slides, setSlides] = useState<string[]>([]); // data:image/png;base64,...
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0); // 0-indexed
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [zoom, setZoom] = useState(1); // 1 = fit-width
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideInput, setSlideInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert PPTX khi mount
  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    async function convertPptx() {
      try {
        setLoading(true);
        setError(null);

        let result: { total: number; slides: SlideData[] };

        if (documentId) {
          // Path 1: Authenticated — proxy qua backend (Axios tự gắn Bearer token)
          const response = await api.post<{ total: number; slides: SlideData[] }>(
            `/documents/${documentId}/pptx-to-images`,
            undefined,
            { timeout: 120_000 }, // 2 phút cho conversion
          );
          result = response.data;
        } else if (publicToken) {
          // Path 2: Public link — proxy qua backend endpoint (tránh browser gọi AI service trực tiếp)
          result = await fetchPublicPptxToImages(publicToken);
        } else {
          // Path 3: Fallback dev-only — fetch blob rồi gửi thẳng AI service
          const AI_SERVICE_URL =
            typeof window !== 'undefined'
              ? (process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000')
              : 'http://localhost:8000';

          const blobResponse = await fetch(url);
          if (!blobResponse.ok) {
            throw new Error(t('preview.pptLoadError'));
          }
          const blob = await blobResponse.blob();

          const formData = new FormData();
          const file = new File([blob], fileName, {
            type: blob.type || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          });
          formData.append('file', file);

          const convertResponse = await fetch(`${AI_SERVICE_URL}/convert/pptx-to-images`, {
            method: 'POST',
            body: formData,
          });

          if (!convertResponse.ok) {
            let errorMsg = 'Không thể convert file PowerPoint';
            try {
              const errorData = await convertResponse.json();
              errorMsg = errorData?.detail?.message || errorData?.message || errorMsg;
            } catch { /* ignore */ }
            throw new Error(errorMsg);
          }
          result = await convertResponse.json();
        }

        if (cancelled) return;

        // Step 3: Convert base64 → data URLs
        const slideUrls = (result.slides as SlideData[]).map(
          (s) => `data:image/png;base64,${s.data}`
        );

        setSlides(slideUrls);
        setCurrentSlide(0);
        setLoading(false);
      } catch (err: unknown) {
        if (cancelled) return;
        // Axios error có response.data.message, Error thường có message
        const axiosMsg = (err as any)?.response?.data?.message;
        const message = axiosMsg || (err instanceof Error ? err.message : t('preview.pptDisplayError'));
        setError(message);
        setLoading(false);
      }
    }

    convertPptx();
    return () => { cancelled = true; };
  }, [url, fileName, documentId, publicToken]);

  // Keyboard navigation
  useEffect(() => {
    if (viewMode !== 'carousel' || slides.length === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'Home') {
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        setCurrentSlide(slides.length - 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, slides.length]);

  // Fullscreen change listener
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
  }, [slides.length]);

  const goToFirst = useCallback(() => {
    setCurrentSlide(0);
  }, []);

  const goToLast = useCallback(() => {
    setCurrentSlide(slides.length - 1);
  }, [slides.length]);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handleSlideInputSubmit = useCallback(() => {
    if (!slideInput.trim()) return;
    const parsed = parseInt(slideInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= slides.length) {
      setCurrentSlide(parsed - 1);
    }
    setSlideInput('');
  }, [slideInput, slides.length]);

  const handleSlideInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSlideInputSubmit();
      }
    },
    [handleSlideInputSubmit]
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentSlide(index);
    setViewMode('carousel');
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleDownload = async () => {
    if (!documentId) return;
    try {
      await downloadDocument(documentId, fileName);
      toast.success(t('toast.downloaded', { name: fileName }));
    } catch {
      toast.error(t('preview.downloadError'));
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-base font-medium">{t('preview.pptConverting')}</p>
          <p className="text-sm mt-1">{t('preview.pptConvertingHint')}</p>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-destructive">{t('preview.pptDisplayError')}</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        {documentId && (
            <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('preview.downloadToView')}
          </Button>
        )}
      </div>
    );
  }

  // --- Carousel view ---
  if (viewMode === 'carousel') {
    return (
      <div
        ref={containerRef}
        className={`flex flex-col h-full${isFullscreen ? ' bg-background' : ''}`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b bg-muted/30 shrink-0">
          <TooltipProvider delayDuration={300}>
            {/* Nhóm 1 — Navigation */}
            <div className="flex items-center gap-0.5">
              {/* SkipBack */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={goToFirst}
                    disabled={currentSlide === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.slideFirst')}</p></TooltipContent>
              </Tooltip>

              {/* ChevronLeft */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={goToPrev}
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.slidePrev')}</p></TooltipContent>
              </Tooltip>

              {/* Slide input */}
              <Input
                type="text"
                className="h-7 w-14 text-center text-sm px-1"
                placeholder={`${currentSlide + 1}`}
                value={slideInput}
                onChange={(e) => setSlideInput(e.target.value)}
                onKeyDown={handleSlideInputKeyDown}
                onBlur={handleSlideInputSubmit}
              />
              <span className="text-xs text-muted-foreground mx-0.5">/ {slides.length}</span>

              {/* ChevronRight */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={goToNext}
                    disabled={currentSlide === slides.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.slideNext')}</p></TooltipContent>
              </Tooltip>

              {/* SkipForward */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={goToLast}
                    disabled={currentSlide === slides.length - 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.slideLast')}</p></TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Nhóm 2 — Zoom */}
            <div className="flex items-center gap-0.5">
              {/* ZoomOut */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.zoomOut')}</p></TooltipContent>
              </Tooltip>

              {/* Zoom percentage — clickable reset */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={resetZoom}
                    className="text-xs w-12 text-center hover:text-foreground text-muted-foreground transition-colors rounded px-1 py-0.5 hover:bg-accent"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.resetZoom')}</p></TooltipContent>
              </Tooltip>

              {/* ZoomIn */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.zoomIn')}</p></TooltipContent>
              </Tooltip>

              {/* RotateCcw — reset zoom */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={resetZoom}
                    disabled={zoom === 1}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.resetZoomFull')}</p></TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Nhóm 3 — Actions */}
            <div className="flex items-center gap-0.5 ml-auto">
              {/* Fullscreen toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? t('preview.exitFullScreen') : t('preview.fullScreen')}</p>
                </TooltipContent>
              </Tooltip>

              {/* LayoutGrid — toggle grid view */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.slideOverview')}</p></TooltipContent>
              </Tooltip>

              {/* Download — only when documentId exists */}
              {documentId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{t('preview.download')}</p></TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        {/* Slide display */}
        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-gray-100 p-4">
          {slides[currentSlide] && (
            <img
              src={slides[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              className="max-w-full max-h-full object-contain shadow-lg"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease',
              }}
            />
          )}
        </div>

        {/* Bottom navigation hint */}
        <div className="text-center py-2 text-xs text-muted-foreground shrink-0 border-t">
          {t('preview.slideKeyboardHint')}
        </div>
      </div>
    );
  }

  // --- Grid/Thumbnail view ---
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
        <span className="text-sm font-medium text-muted-foreground">
          {t('preview.slideOverview')} — {slides.length} slides
        </span>
        <div className="flex items-center gap-2">
          {documentId && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('preview.download')}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('carousel')}
            className="gap-1.5"
          >
            <Presentation className="h-4 w-4" />
            {t('preview.slideCarousel')}
          </Button>
        </div>
      </div>

      {/* Grid of thumbnails */}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {slides.map((slideUrl, index) => (
            <button
              key={index}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary ${
                index === currentSlide
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-transparent hover:border-primary/50'
              }`}
              onClick={() => handleThumbnailClick(index)}
              title={`Xem slide ${index + 1}`}
            >
              <img
                src={slideUrl}
                alt={`Slide ${index + 1}`}
                className="w-full h-auto object-contain bg-white"
                loading="lazy"
              />
              {/* Page number badge */}
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
