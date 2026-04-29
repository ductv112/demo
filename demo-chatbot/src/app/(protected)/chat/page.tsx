'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { FullscreenLoading } from '@/components/fullscreen-loading';
import { ChatLayout } from '@/components/chat/chat-layout';

export default function ChatPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (user && !hasPermission('chat:read')) {
      router.replace('/');
    }
  }, [user, hasPermission, router]);

  if (!hasPermission('chat:read')) {
    return <FullscreenLoading />;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-4">
      <div className="flex-1 min-h-0 overflow-hidden flex border rounded-lg bg-background shadow-sm">
        <ChatLayout />
      </div>
    </div>
  );
}
