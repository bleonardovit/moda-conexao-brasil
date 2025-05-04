
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { MobileNav } from './MobileNav';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  
  // Verificar se estamos na landing page
  const isLandingPage = location.pathname === '/';
  
  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border ${isLandingPage ? 'bg-white/90 backdrop-blur-md' : 'bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60'}`}>
      <div className="container flex h-14 items-center justify-between">
        {showSearch ? (
          <div className="flex-1 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowSearch(false)}>
              <X className="h-5 w-5" />
            </Button>
            <Input placeholder="Pesquisar..." className="border-border h-8" autoFocus />
          </div>
        ) : (
          <>
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="ml-2 font-bold text-xl text-gradient"></span>
            </Link>

            <div className="flex items-center gap-2">
              {!isLandingPage && (
                <>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" onClick={() => setShowSearch(true)}>
                    <Search className="h-5 w-5" />
                  </Button>
                  
                  <ThemeToggle />
                  
                  <NotificationDropdown />
                </>
              )}
              
              <Link to={isLandingPage ? "/auth/login" : "/profile"}>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              
              <div className="block md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-gradient-to-br from-[#9b87f5] to-[#D946EF] bg-opacity-95 border-none shadow-xl">
                    <MobileNav />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
