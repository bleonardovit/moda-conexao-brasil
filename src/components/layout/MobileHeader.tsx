
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
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
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
              </Button>
              
              <ThemeToggle />
              
              <NotificationDropdown />
              
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-morphism border-border">
                  <div className="flex flex-col space-y-4 pt-6 px-6">
                    <Link to="/suppliers" className="text-lg font-medium py-2 text-foreground hover:text-[#9b87f5]" onClick={() => setIsOpen(false)}>
                      Fornecedores
                    </Link>
                    <Link to="/favorites" className="text-lg font-medium py-2 text-foreground hover:text-[#9b87f5]" onClick={() => setIsOpen(false)}>
                      Favoritos
                    </Link>
                    <Link to="/notifications" className="text-lg font-medium py-2 text-foreground hover:text-[#9b87f5]" onClick={() => setIsOpen(false)}>
                      Notificações
                    </Link>
                    <Link to="/profile" className="text-lg font-medium py-2 text-foreground hover:text-[#9b87f5]" onClick={() => setIsOpen(false)}>
                      Meu Perfil
                    </Link>
                    <hr className="border-border" />
                    <Button className="w-full bg-[#9b87f5] hover:bg-[#9b87f5]/80 text-white" onClick={() => {
                      setIsOpen(false);
                      // Adicionar lógica de logout
                    }}>
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
