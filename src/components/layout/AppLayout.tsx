
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileFooterNav } from './MobileFooterNav';
import { DesktopSidebar } from './DesktopSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-brand.dark text-white">
        {!isMobile && <DesktopSidebar />}
        <div className="flex-1 flex flex-col">
          <MobileHeader />
          
          {/* Search Component - Only visible on desktop */}
          {!isMobile && (
            <div className="container py-5">
              <div className="flex items-center gap-4 max-w-3xl mx-auto">
                <div className="glass-morphism flex flex-1 items-center gap-2 px-4 py-2 rounded-full">
                  <Search className="w-5 h-5 text-gray-400" />
                  <Input 
                    placeholder="Pesquisar..." 
                    className="bg-transparent border-none shadow-none h-9 focus-visible:ring-0 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input id="reportsOnly" type="checkbox" className="rounded-sm bg-transparent border-white/20" />
                  <label htmlFor="reportsOnly" className="text-sm text-gray-300">Somente relatórios</label>
                </div>
              </div>
            </div>
          )}
          
          <main className="flex-1 container py-4 pb-20 md:pb-4">
            {/* Content wrapper with glass effect */}
            <div className="glass-morphism rounded-lg p-4 animate-fade-in">
              {children}
            </div>
          </main>
          
          <footer className="py-4 border-t border-white/10 text-center text-sm text-gray-400 hidden md:block">
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
