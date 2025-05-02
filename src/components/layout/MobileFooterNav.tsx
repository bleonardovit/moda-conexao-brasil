
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, LayoutDashboard, Book } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MobileFooterNav() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check user role from session storage
    const userRole = sessionStorage.getItem('user_role');
    setIsAdmin(userRole === 'admin');
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 neo-blur border-t flex items-center justify-around px-2 z-50">
      <Link 
        to="/suppliers" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/suppliers') ? 'text-[#9b87f5]' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Home size={24} />
        <span className="text-xs mt-0.5">Início</span>
      </Link>
      
      <Link 
        to="/search" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/search') ? 'text-[#9b87f5]' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Search size={24} />
        <span className="text-xs mt-0.5">Buscar</span>
      </Link>
      
      <Link 
        to="/articles" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/articles') ? 'text-[#9b87f5]' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Book size={24} />
        <span className="text-xs mt-0.5">Conteúdo</span>
      </Link>
      
      <Link 
        to="/favorites" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/favorites') ? 'text-[#9b87f5]' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Heart size={24} />
        <span className="text-xs mt-0.5">Favoritos</span>
      </Link>
      
      {isAdmin && (
        <Link 
          to="/admin" 
          className={`flex flex-col items-center justify-center transition-colors ${
            isActive('/admin') ? 'text-[#9b87f5]' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard size={24} />
          <span className="text-xs mt-0.5">Admin</span>
        </Link>
      )}
      
      <Link 
        to="/profile" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/profile') ? 'text-[#9b87f5]' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <User size={24} />
        <span className="text-xs mt-0.5">Perfil</span>
      </Link>
    </div>
  );
}
