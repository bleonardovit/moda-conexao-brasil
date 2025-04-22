
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Store, BarChart, List, Settings } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Usuários', path: '/admin/users', icon: <User className="h-5 w-5" /> },
    { name: 'Fornecedores', path: '/admin/suppliers', icon: <Store className="h-5 w-5" /> },
    { name: 'Relatórios', path: '/admin/reports', icon: <BarChart className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted">
        <div className="p-4 border-b">
          <Link to="/admin" className="font-bold text-lg text-primary">
            Admin Conexão Brasil
          </Link>
        </div>
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-secondary text-secondary-foreground'
                    : 'hover:bg-secondary/50'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <Link 
            to="/" 
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/50"
          >
            <Settings className="h-5 w-5" />
            Voltar ao app
          </Link>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Header para mobile */}
        <header className="md:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <Link to="/admin" className="font-bold text-lg text-primary">
              Admin
            </Link>
            <div className="flex items-center">
              <Link to="/" className="px-3 py-2 text-sm">Voltar ao app</Link>
            </div>
          </div>
        </header>

        {/* Menu para mobile */}
        <div className="md:hidden border-b sticky top-14 z-40 bg-background">
          <div className="container overflow-auto flex">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'border-b-2 border-primary font-medium'
                    : ''
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
