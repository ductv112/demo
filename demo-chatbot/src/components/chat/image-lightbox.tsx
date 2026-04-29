'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageLightboxProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog xem ảnh full size — click thumbnail trong chat bubble mở lightbox.
 * Max 90vw x 90vh, object-contain, click outside hoặc X để đóng.
 */
export function ImageLightbox({ src, alt, open, onClose }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-[90vw] max-h-[90vh] p-2 flex items-center justify-center bg-background/95 border-none shadow-2xl"
        onPointerDownOutside={onClose}
      >
        <VisuallyHidden>
          <DialogTitle>{alt}</DialogTitle>
        </VisuallyHidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-md"
        />
      </DialogContent>
    </Dialog>
  );
}
