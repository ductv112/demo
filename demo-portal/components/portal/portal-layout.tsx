import { PortalHeader } from "./portal-header";
import { PortalNav } from "./portal-nav";
import { PortalFooter } from "./portal-footer";
import { PortalLayoutStateProvider } from "./portal-layout-state";

interface PortalLayoutProps {
  children: React.ReactNode;
  /**
   * When true, the layout renders header only (no built-in nav, no main padding,
   * no max-width). The page is responsible for its own width constraints and
   * for placing <PortalNav /> wherever it wants. Used by the homepage so the
   * showcase can be rendered full-bleed.
   */
  slim?: boolean;
}

export function PortalLayout({ children, slim = false }: PortalLayoutProps) {
  return (
    <PortalLayoutStateProvider>
      <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
        <PortalHeader />
        {!slim && <PortalNav variant="primary" />}
        {slim ? (
          <main className="flex-1 w-full">{children}</main>
        ) : (
          <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-6">{children}</main>
        )}
        <PortalFooter />
      </div>
    </PortalLayoutStateProvider>
  );
}
