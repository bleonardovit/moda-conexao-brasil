
import { ReactNode } from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileFooterNav } from './MobileFooterNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MobileHeader />
      <main className="flex-1 container py-4 pb-20 md:pb-4">{children}</main>
      <footer className="py-4 border-t text-center text-sm text-gray-500 hidden md:block">
        <div className="container">
          © {new Date().getFullYear()} Conexão Brasil
        </div>
      </footer>
      <MobileFooterNav />
    </div>
  );
}
