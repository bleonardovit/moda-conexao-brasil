
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, LayoutDashboard, Users, FileText, Book, LogOut, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function MobileNav() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const { logout } = useAuth();
  
  useEffect(() => {
    // SECURITY: Use standardized admin role checking function
    const checkAdminRole = async () => {
      try {
        const { data, error } = await supabase.rpc('is_current_user_admin');
        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(data === true);
      } catch (error) {
        console.error('Error in admin role check:', error);
        setIsAdmin(false);
      }
    };

    // Check on component mount
    checkAdminRole();

    // Setup listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Define menu items for regular users
  const regularMenuItems = [
    {
      icon: Home,
      label: 'Início',
      path: '/home'
    }, 
    {
      icon: Users,
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
  
  // Define additional menu items for admin users
  const adminMenuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard Admin',
      path: '/admin'
    },
    {
      icon: Users,
      label: 'Usuários',
      path: '/admin/users'
    },
    {
      icon: FileText,
      label: 'Relatórios',
      path: '/admin/reports'
    },
    {
      icon: Activity,
      label: 'Performance',
      path: '/performance'
    },
    {
      icon: Book,
      label: 'Gerenciar Artigos',
      path: '/admin/articles'
    }
  ];

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center space-x-2 p-4">
        <Link to="/" className="flex items-center space-x-2 font-bold">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
            <span className="text-white font-bold text-sm">OF</span>
          </div>
          <span className="text-xl">Os Fornecedores</span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="space-y-1">
            {regularMenuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive(item.path) ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
          
          {isAdmin && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground px-2">
                  Administração
                </p>
                {adminMenuItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant={isActive(item.path) ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button variant="outline" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-5 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
