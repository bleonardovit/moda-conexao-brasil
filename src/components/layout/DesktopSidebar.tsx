
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, LayoutDashboard, Users, FileText, Book, Shield, Activity } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function DesktopSidebar() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
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
    },
    {
      icon: Shield,
      label: 'Segurança',
      path: '/admin/security-monitoring'
    }
  ];

  // Combine menu items based on user role
  const menuItems = isAdmin 
    ? [...regularMenuItems, ...adminMenuItems] 
    : regularMenuItems;

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="w-16 hover:w-64 transition-width duration-300">
      <SidebarContent>
        <div className="flex justify-center p-4 mb-6">
          <Link to="/" className="block">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
              <span className="text-white font-bold">CB</span>
            </div>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {menuItems.map(item => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  isActive={isActive(item.path)} 
                  tooltip={item.label} 
                  className={`transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-[#9b87f5] text-white' 
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`} 
                  asChild
                >
                  <Link to={item.path} className="flex items-center gap-3 px-4 py-2">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
