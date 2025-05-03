
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Book, Briefcase } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check user role from session storage
    const userRole = sessionStorage.getItem('user_role');
    setIsAdmin(userRole === 'admin');
  }, []);

  const menuItems = [
    {
      icon: Home,
      label: 'Início',
      path: '/'
    }, 
    {
      icon: Briefcase,
      label: 'Fornecedores',
      path: '/suppliers'
    }, 
    {
      icon: Search,
      label: 'Buscar',
      path: '/search'
    }, 
    {
      icon: Heart,
      label: 'Favoritos',
      path: '/favorites'
    }, 
    {
      icon: Book,
      label: 'Dicas & Conteúdo',
      path: '/articles'
    }, 
    {
      icon: User,
      label: 'Perfil',
      path: '/profile'
    }
  ];

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="space-y-2 px-2 py-5">
      <div className="mb-4">
        <h2 className="px-4 text-lg font-semibold">Menu</h2>
      </div>
      {menuItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
            isActive(item.path)
              ? 'bg-[#9b87f5] text-white'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
