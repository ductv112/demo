'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  url: string;
  fileName: string;
}

/**
 * Image viewer — mặc định fit vừa container, zoom/rotate/pan
 */
export function ImageViewer({ url, fileName }: ImageViewerProps) {
  const t = useTranslations('documents');
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoomIn = () => { setScale((prev) => Math.min(prev + 0.25, 4.0)); setPosition({ x: 0, y: 0 }); };
  const zoomOut = () => { setScale((prev) => Math.max(prev - 0.25, 0.25)); setPosition({ x: 0, y: 0 }); };
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const resetView = () => {
    setScale(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === 'r' || e.key === 'R') rotateRight();
      if (e.key === '0') resetView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">{t('preview.cannotDisplay')}</p>
          <p className="text-sm mt-2">{t('preview.downloadHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.25}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            onClick={resetView}
            className="text-sm text-muted-foreground min-w-[60px] text-center hover:text-foreground transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 4.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={rotateLeft} title={t('preview.rotateLeft')}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={rotateRight} title={t('preview.rotateRight')}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div
        className={cn(
          'flex-1 min-h-0 overflow-auto bg-muted/10 relative',
          scale > 1 && 'cursor-move'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-[400px] w-[600px]" />
          </div>
        )}
        <div className="flex items-center justify-center min-h-full p-4">
          <img
            src={url}
            alt={fileName}
            className={cn(
              'select-none',
              loading && 'hidden',
              // Mặc định fit vừa container, không tràn
              scale <= 1 && 'max-w-full max-h-full object-contain',
            )}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              translate: scale > 1 ? `${position.x}px ${position.y}px` : undefined,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out, translate 0.2s ease-out',
              transformOrigin: 'center center',
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
