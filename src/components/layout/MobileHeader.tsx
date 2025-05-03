import { Link } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileNav } from './MobileNav';
import { HeaderSearch } from '@/components/search/HeaderSearch';

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <MobileNav />
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2">
          <Link to="/" className="mr-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">CB</span>
            </div>
          </Link>
          <HeaderSearch />
        </div>
      </div>
    </header>
  );
}
