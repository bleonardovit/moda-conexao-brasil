
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

export function MobileFooterNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 neo-blur border-t border-white/10 flex items-center justify-around px-2 z-50">
      <Link 
        to="/suppliers" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/suppliers')
            ? 'text-brand.purple'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Home size={24} />
        <span className="text-xs mt-0.5">Início</span>
      </Link>
      <Link 
        to="/search" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/search')
            ? 'text-brand.purple'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Search size={24} />
        <span className="text-xs mt-0.5">Buscar</span>
      </Link>
      <Link 
        to="/favorites" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/favorites')
            ? 'text-brand.purple'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Heart size={24} />
        <span className="text-xs mt-0.5">Favoritos</span>
      </Link>
      <Link 
        to="/profile" 
        className={`flex flex-col items-center justify-center transition-colors ${
          isActive('/profile')
            ? 'text-brand.purple'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <User size={24} />
        <span className="text-xs mt-0.5">Perfil</span>
      </Link>
    </div>
  );
}
