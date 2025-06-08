
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Store, BarChart, List, Settings, ChevronRight, Book, Bell, Code, Shield, MessageSquare, Search } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Usuários', path: '/admin/users', icon: <User className="h-5 w-5" /> },
    { name: 'Fornecedores', path: '/admin/suppliers', icon: <Store className="h-5 w-5" /> },
    { name: 'Moderar Avaliações', path: '/admin/reviews-moderation', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Notificações', path: '/admin/notifications', icon: <Bell className="h-5 w-5" /> },
    { name: 'Artigos', path: '/admin/articles', icon: <Book className="h-5 w-5" /> },
    { name: 'Relatórios', path: '/admin/reports', icon: <BarChart className="h-5 w-5" /> },
    { name: 'Segurança', path: '/admin/security-monitoring', icon: <Shield className="h-5 w-5" /> },
    { name: 'SEO', path: '/admin/seo', icon: <Search className="h-5 w-5" /> },
    { name: 'Configurações de Rastreamento', path: '/admin/tracking-settings', icon: <Code className="h-5 w-5" /> },
  ];
  
  // Get current page title for breadcrumbs
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    
    if (currentPath === '/admin' || currentPath === '/admin/') return 'Dashboard';
    
    const currentMenuItem = menuItems.find(item => 
      currentPath === item.path || currentPath.startsWith(`${item.path}/`)
    );
    
    return currentMenuItem?.name || 'Admin';
  };

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background/50">
        <div className="p-4 border-b border-border">
          <Link to="/admin" className="font-bold text-lg text-primary">
            Admin Os Fornecedores
          </Link>
        </div>
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-brand-purple text-white'
                    : 'hover:bg-accent/50 text-foreground hover:text-primary'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          <Link 
            to="/suppliers" 
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent/50 hover:text-primary text-foreground"
          >
            <Settings className="h-5 w-5" />
            Voltar ao app
          </Link>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Header para mobile */}
        <header className="md:hidden sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <Link to="/admin" className="font-bold text-lg text-primary">
              Admin
            </Link>
            <div className="flex items-center">
              <Link to="/suppliers" className="px-3 py-2 text-sm text-foreground">Voltar ao app</Link>
            </div>
          </div>
        </header>

        {/* Menu para mobile */}
        <div className="md:hidden border-b border-border sticky top-14 z-40 bg-background">
          <div className="container overflow-auto flex">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap ${
                  isActive(item.path)
                    ? 'border-b-2 border-primary font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex px-4 py-2 bg-background/90">
          <ol className="flex items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link to="/admin" className="hover:text-foreground">
                Admin
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="font-medium text-foreground">
              {getCurrentPageTitle()}
            </li>
          </ol>
        </nav>

        {/* Conteúdo */}
        <main className="flex-1 p-4 glass-morphism m-4 rounded-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
