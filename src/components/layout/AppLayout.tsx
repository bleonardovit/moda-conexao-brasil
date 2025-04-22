
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileFooterNav } from './MobileFooterNav';
import { DesktopSidebar } from './DesktopSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {!isMobile && <DesktopSidebar />}
        <div className="flex-1 flex flex-col">
          <MobileHeader />
          <main className="flex-1 container py-4 pb-20 md:pb-4">{children}</main>
          <footer className="py-4 border-t text-center text-sm text-gray-500 hidden md:block">
            <div className="container">
              © {new Date().getFullYear()} Conexão Brasil
            </div>
          </footer>
          {isMobile && <MobileFooterNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}
