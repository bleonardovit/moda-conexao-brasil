
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="font-bold text-xl text-primary">
          Conexão Brasil
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="px-0">
              <div className="flex flex-col space-y-4 pt-6 px-6">
                <Link 
                  to="/suppliers" 
                  className="text-lg font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Fornecedores
                </Link>
                <Link 
                  to="/favorites" 
                  className="text-lg font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Favoritos
                </Link>
                <Link 
                  to="/profile" 
                  className="text-lg font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Meu Perfil
                </Link>
                <hr className="my-2" />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    // Adicionar lógica de logout
                  }}
                >
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
