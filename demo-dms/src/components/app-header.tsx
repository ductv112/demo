'use client';

import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {UserMenu} from './user-menu';
import {SystemLogo} from './system-logo';

export function AppHeader() {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + App Name */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <SystemLogo size={32} />
            <span className="text-lg font-semibold">{t('appName')}</span>
        </Link>
        
        {/* Right: User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
