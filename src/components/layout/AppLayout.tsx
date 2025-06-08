
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileFooterNav } from './MobileFooterNav';
import { DesktopSidebar } from './DesktopSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlobalSEO } from '@/components/seo/GlobalSEO';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  image?: string;
}

export function AppLayout({ children, title, description, image }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <GlobalSEO title={title} description={description} image={image} />
      
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {!isMobile && <DesktopSidebar />}
        <div className="flex-1 flex flex-col">
          <MobileHeader />
          
          <main className="flex-1 container py-4 pb-20 md:pb-4">
            {/* Content wrapper with glass effect */}
            <div className="glass-morphism rounded-lg p-4 animate-fade-in">
              {children}
            </div>
          </main>
          
          <footer className="py-4 border-t border-border text-center text-sm text-muted-foreground hidden md:block">
            <div className="container">
              © {new Date().getFullYear()} Os Fornecedores
            </div>
          </footer>
          
          {isMobile && <MobileFooterNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}
