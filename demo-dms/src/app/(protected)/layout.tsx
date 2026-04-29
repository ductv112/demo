'use client';

// Doanh nghiệp A prototype: vô hiệu hóa prerender cho mọi trang trong nhóm (protected)
// vì authentication + mock data chạy client-side.
import React, { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from 'next-intl';
import { ProfileProvider } from '@/contexts/profile-context';
import { FullscreenLoading } from '@/components/fullscreen-loading';
import { AppSidebar } from '@/components/app-sidebar';
import { UserMenu } from '@/components/user-menu';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AppSwitcher } from '@/components/app-switcher';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';

// ─── Breadcrumb map (path prefix → page label) ───────────────────
// Đồng bộ với sidebar navigation; fallback về humanized segment nếu
// path không có trong map.
const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Trang chủ',
  '/documents': 'Quản lý tài liệu',
  '/folders': 'Thư mục',
  '/users': 'Người dùng',
  '/roles': 'Vai trò & Phân quyền',
  '/departments': 'Phòng ban',
  '/audit': 'Nhật ký hệ thống',
  '/chat': 'Trợ lý AI',
  '/ai-quality': 'Báo cáo chất lượng AI',
  '/glossary': 'Từ điển chuyên ngành',
  '/translate': 'Dịch thuật',
  '/translate/history': 'Lịch sử dịch',
  '/translate/stats': 'Thống kê dịch',
  '/settings': 'Hồ sơ cá nhân',
  '/profile': 'Hồ sơ cá nhân',
  '/permissions': 'Phân quyền',
};

const humanize = (seg: string) =>
  seg.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const t = useTranslations('breadcrumb');
  const tCommon = useTranslations('common');
  
  useEffect(() => {
    // Nếu không authenticated và không đang load → redirect to login
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, pathname, router]);
  
  // Đang load auth state → hiển thị fullscreen loading
  if (isLoading) {
    return <FullscreenLoading message={tCommon('checkingSession')} />;
  }
  
  // Chưa authenticated → không render gì (đang redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  // Map pathname to subtitle (đã giữ lại i18n strings hiện có)
  const getSubtitle = (): string | null => {
    if (pathname === '/') return t('dashboardSubtitle');
    if (pathname === '/roles') return t('rolesSubtitle');
    if (pathname === '/users') return t('usersSubtitle');
    if (pathname === '/departments') return t('departmentsSubtitle');
    if (pathname === '/documents') return t('documentsSubtitle');
    if (pathname === '/chat') return t('aiAssistantSubtitle');
    if (pathname === '/audit') return t('auditSubtitle');
    if (pathname === '/settings') return t('settingsSubtitle');
    if (pathname === '/ai-quality') return t('aiQualitySubtitle');
    if (pathname.startsWith('/glossary')) return t('glossarySubtitle');
    if (pathname === '/translate') return t('translateSubtitle');
    if (pathname === '/translate/history') return t('translateHistorySubtitle');
    if (pathname === '/translate/stats') return t('translateStatsSubtitle');
    return null;
  };

  // Build breadcrumb từ pathname + BREADCRUMB_MAP (có fallback humanize)
  const buildBreadcrumbs = (): Array<{ label: string; href: string | null }> => {
    if (pathname === '/') {
      return [{ label: BREADCRUMB_MAP['/'], href: '/' }];
    }
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: Array<{ label: string; href: string | null }> = [];
    segments.forEach((seg, idx) => {
      const pathUpTo = '/' + segments.slice(0, idx + 1).join('/');
      const isLast = idx === segments.length - 1;
      // Detect ID-like segment (uuid, numeric, hash…) → label "Chi tiết"
      const isIdLike =
        /^[0-9a-f]{8,}$/i.test(seg) ||
        /^\d+$/.test(seg) ||
        seg === 'new' ||
        seg === 'edit';
      const label = BREADCRUMB_MAP[pathUpTo] ?? (isIdLike ? 'Chi tiết' : humanize(seg));
      crumbs.push({ label, href: isLast ? null : pathUpTo });
    });
    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();
  const subtitle = getSubtitle();
  
  // Authenticated → render app layout with sidebar
  return (
    <ProfileProvider>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header: Sidebar trigger + Breadcrumb + Subtitle + User Menu */}
        <header className="sticky top-0 z-40 flex h-[3.75rem] shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 backdrop-blur-md px-4"
          style={{ boxShadow: '0 1px 0 0 color-mix(in oklch, var(--border) 50%, transparent), 0 4px 20px -4px color-mix(in oklch, var(--foreground) 5%, transparent)' }}>
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
          <Separator orientation="vertical" className="h-5 opacity-30" />

          {/* Page identity — left accent strip */}
          <div className="flex flex-col justify-center pl-3 border-l-2 border-primary" style={{ minWidth: 0, flex: '1 1 0', maxWidth: 'calc(100% - 240px)' }}>
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap gap-1 text-[13px]">
                {/* Home icon luôn ở đầu, link về / (trừ khi đang ở /) */}
                {pathname !== '/' && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href="/"
                        className="flex items-center text-muted-foreground hover:text-[#1B3A5C] transition-colors"
                      >
                        <Home className="h-3.5 w-3.5" />
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="opacity-50">
                      <ChevronRight className="h-3 w-3" />
                    </BreadcrumbSeparator>
                  </>
                )}
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <BreadcrumbSeparator className="opacity-50">
                        <ChevronRight className="h-3 w-3" />
                      </BreadcrumbSeparator>
                    )}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="text-[13px] font-semibold text-[#1B3A5C] tracking-tight whitespace-nowrap">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : crumb.href ? (
                        <BreadcrumbLink href={crumb.href} className="text-[13px] text-muted-foreground hover:text-[#1B3A5C] transition-colors font-medium whitespace-nowrap">
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-[13px] text-muted-foreground font-medium whitespace-nowrap">{crumb.label}</span>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground leading-none mt-[3px] truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* App Switcher + Language Switcher + User Menu ở góc phải */}
          <div className="ml-auto flex items-center gap-1.5">
            <AppSwitcher currentApp="dms" />
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </header>

        {/* Main content */}
        <main className={`flex flex-col flex-1 min-h-0 overflow-auto${
          ['/', '/users', '/documents', '/departments', '/chat', '/audit', '/roles', '/settings', '/ai-quality', '/glossary', '/translate', '/translate/history'].includes(pathname) ? '' : ' p-6'
        }`}>
          <Suspense fallback={<FullscreenLoading message={tCommon('loading')} />}>
            {children}
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
    </ProfileProvider>
  );
}
