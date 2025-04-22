
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

export function MobileFooterNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around px-2 z-50">
      <Link 
        to="/suppliers" 
        className={`flex flex-col items-center justify-center ${isActive('/suppliers') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Home size={20} />
        <span className="text-xs mt-0.5">Início</span>
      </Link>
      <Link 
        to="/search" 
        className={`flex flex-col items-center justify-center ${isActive('/search') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Search size={20} />
        <span className="text-xs mt-0.5">Buscar</span>
      </Link>
      <Link 
        to="/favorites" 
        className={`flex flex-col items-center justify-center ${isActive('/favorites') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Heart size={20} />
        <span className="text-xs mt-0.5">Favoritos</span>
      </Link>
      <Link 
        to="/profile" 
        className={`flex flex-col items-center justify-center ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <User size={20} />
        <span className="text-xs mt-0.5">Perfil</span>
      </Link>
    </div>
  );
}
