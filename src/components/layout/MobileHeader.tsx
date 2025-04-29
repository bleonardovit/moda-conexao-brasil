import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {showSearch ? <div className="flex-1 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-gray-400" onClick={() => setShowSearch(false)}>
              <X className="h-5 w-5" />
            </Button>
            <Input placeholder="Pesquisar..." className="bg-transparent border-white/10 h-8" autoFocus />
          </div> : <>
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="ml-2 font-bold text-xl text-gradient">Conexão Brasil</span>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-gray-400" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
              </Button>
              
              <ThemeToggle />
              
              <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
                <Bell className="h-5 w-5" />
              </Button>
              
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-morphism border-white/10">
                  <div className="flex flex-col space-y-4 pt-6 px-6">
                    <Link to="/suppliers" className="text-lg font-medium py-2 text-white/80 hover:text-white" onClick={() => setIsOpen(false)}>
                      Fornecedores
                    </Link>
                    <Link to="/favorites" className="text-lg font-medium py-2 text-white/80 hover:text-white" onClick={() => setIsOpen(false)}>
                      Favoritos
                    </Link>
                    <Link to="/profile" className="text-lg font-medium py-2 text-white/80 hover:text-white" onClick={() => setIsOpen(false)}>
                      Meu Perfil
                    </Link>
                    <hr className="border-white/10" />
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white" onClick={() => {
                  setIsOpen(false);
                  // Adicionar lógica de logout
                }}>
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>}
      </div>
    </header>;
}