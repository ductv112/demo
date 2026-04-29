'use client';

import { SystemLogo } from './system-logo';

interface FullscreenLoadingProps {
  message?: string;
}

export function FullscreenLoading({ message = 'Đang tải...' }: FullscreenLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Logo/Icon */}
      <div className="mb-6">
        <SystemLogo size={80} />
      </div>
      
      {/* Spinner */}
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      
      {/* Message */}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
