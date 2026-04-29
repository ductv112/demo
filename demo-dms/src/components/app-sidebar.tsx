'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronRight,
  FileText,
  History,
  Languages,
  LayoutDashboard,
  MessageSquareText,
  ScrollText,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import {useAuth} from '@/contexts/auth-context';
import {usePermissions} from '@/hooks/use-permissions';
import {useTranslations} from 'next-intl';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from '@/components/ui/collapsible';
import {Tooltip, TooltipContent, TooltipTrigger,} from '@/components/ui/tooltip';
import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: string;
  requiredResource?: string; // Hiển thị nếu có BẤT KỲ quyền nào trên resource
}

interface CollapsibleGroup {
  type: 'collapsible';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface SingleItem {
  type: 'single';
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: string;
  requiredResource?: string;
}

type NavEntry = CollapsibleGroup | SingleItem;

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { hasPermission: checkPermission, hasAnyResourcePermission } = usePermissions();
  const { state } = useSidebar();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  // Dùng mounted + state để tránh hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isCollapsed = mounted && state === 'collapsed';

  // Doanh nghiệp A prototype: chỉ hiện Dashboard + Quản lý tài liệu.
  // Các nhóm khác vẫn còn trong mã nguồn, chỉ ẩn khỏi sidebar. Routes
  // tương ứng vẫn truy cập được qua URL. Để bật lại, thêm id vào đây.
  const VISIBLE_NAV_IDS = new Set<string>(['dashboard', 'documents']);

  const allEntries: Array<NavEntry & { id: string }> = [
    {
      id: 'dashboard',
      type: 'single',
      title: t('dashboard'),
      href: '/',
      icon: LayoutDashboard,
    },
    {
      id: 'system-management',
      type: 'collapsible',
      title: t('systemManagement'),
      icon: Settings,
      items: [
        {
          title: t('roles'),
          href: '/roles',
          icon: Shield,
          requiredResource: 'roles',
        },
        {
          title: t('users'),
          href: '/users',
          icon: Users,
          requiredPermission: 'users:read',
        },
        {
          title: t('departments'),
          href: '/departments',
          icon: Building2,
          requiredPermission: 'departments:read',
        },
        {
          title: t('auditLog'),
          href: '/audit',
          icon: ScrollText,
          requiredPermission: 'audit:read',
        },
      ],
    },
    {
      id: 'documents',
      type: 'single',
      title: t('documents'),
      href: '/documents',
      icon: FileText,
      requiredPermission: 'documents:read',
    },
    {
      id: 'smart-assistant',
      type: 'collapsible',
      title: t('smartAssistantGroup'),
      icon: MessageSquareText,
      items: [
        {
          title: t('aiAssistant'),
          href: '/chat',
          icon: MessageSquareText,
          requiredPermission: 'chat:read',
        },
        {
          title: t('aiQuality'),
          href: '/ai-quality',
          icon: BarChart3,
          requiredPermission: 'chat:report',
        },
      ],
    },
    {
      id: 'translate-tools',
      type: 'collapsible',
      title: t('translateToolsGroup'),
      icon: Languages,
      items: [
        {
          title: t('glossary'),
          href: '/glossary',
          icon: BookOpen,
          requiredPermission: 'glossary:read',
        },
        {
          title: t('translate'),
          href: '/translate',
          icon: Languages,
          requiredPermission: 'translation:read',
        },
        {
          title: t('translateHistory'),
          href: '/translate/history',
          icon: History,
          requiredPermission: 'translation:history',
        },
        {
          title: t('translateStats'),
          href: '/translate/stats',
          icon: BarChart3,
          requiredPermission: 'translation:stats',
        },
      ],
    },
  ];

  const navEntries: NavEntry[] = allEntries.filter((e) => VISIBLE_NAV_IDS.has(e.id));

  const canSeeItem = (item: NavItem): boolean => {
    if (item.requiredResource) return hasAnyResourcePermission(item.requiredResource);
    if (!item.requiredPermission) return true;
    if (checkPermission(item.requiredPermission)) return true;
    // departments:read fallback: user có dept:read trong bất kỳ phòng ban nào cũng được xem menu
    return false;
  };

  const isGroupActive = (group: CollapsibleGroup): boolean => {
    return group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header: Logo + App Name */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group-data-[collapsible=icon]:justify-center"
        >
          <div
            className="shrink-0 flex items-center justify-center w-9 h-9 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
            style={{
              borderRadius: 10,
              background: 'linear-gradient(135deg, #D4A843 0%, #f0d890 100%)',
              boxShadow: '0 4px 12px rgba(212, 168, 67, 0.35)',
              color: '#0a1628',
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: '-0.3px',
            }}
          >
            DA
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-[14px] font-bold leading-tight text-white">Quản lý Tài liệu</span>
            <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {tCommon('orgName')}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Content: Navigation */}
      <SidebarContent className="px-2 py-2">
        <SidebarGroup className="group-data-[collapsible=icon]:px-0">
          <SidebarMenu>
            {navEntries.map((entry) => {
              // --- Single top-level item ---
              if (entry.type === 'single') {
                if (entry.requiredResource && !hasAnyResourcePermission(entry.requiredResource)) {
                  return null;
                }
                if (entry.requiredPermission && !checkPermission(entry.requiredPermission)) {
                  return null;
                }
                const isActive = pathname === entry.href;
                return (
                  <SidebarMenuItem key={entry.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={entry.title}
                      size="lg"
                      className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-0"
                    >
                      <Link href={entry.href}>
                        <entry.icon className="h-5 w-5 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{entry.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              // --- Collapsible group ---
              const visibleItems = entry.items.filter(canSeeItem);
              if (visibleItems.length === 0) return null;
              const groupActive = isGroupActive(entry);

              // COLLAPSED: Popover submenu (chỉ render khi đã mounted và collapsed)
              if (isCollapsed) {
                return (
                  <SidebarMenuItem key={entry.title}>
                    <Popover>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <SidebarMenuButton
                              isActive={groupActive}
                              size="lg"
                              className="justify-center !px-0"
                            >
                              <entry.icon className="h-5 w-5 shrink-0" />
                            </SidebarMenuButton>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                          {entry.title}
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent
                        side="right"
                        align="start"
                        sideOffset={8}
                        className="w-52 p-1 bg-sidebar border-sidebar-border text-sidebar-foreground"
                      >
                        <div className="px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                          {entry.title}
                        </div>
                        <div className="mt-1 flex flex-col gap-0.5">
                          {visibleItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                data-active={isActive}
                                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors"
                              >
                                <item.icon className="h-4 w-4 shrink-0" />
                                <span>{item.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </SidebarMenuItem>
                );
              }

              // EXPANDED: Collapsible group (mặc định khi chưa mounted hoặc expanded)
              return (
                <Collapsible
                  key={entry.title}
                  asChild
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={groupActive} size="lg">
                        <entry.icon className="h-5 w-5 shrink-0" />
                        <span>{entry.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {visibleItems.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <SidebarMenuSubItem key={item.href}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <SidebarMenuSubButton asChild isActive={isActive}>
                                    <Link href={item.href}>
                                      <item.icon className="h-4 w-4 shrink-0" />
                                      <span className="truncate">{item.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                  {item.title}
                                </TooltipContent>
                              </Tooltip>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
