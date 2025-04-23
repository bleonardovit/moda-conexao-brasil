
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, LayoutDashboard, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
  { icon: Home, label: 'Início', path: '/suppliers' },
  { icon: Search, label: 'Buscar', path: '/search' },
  { icon: Heart, label: 'Favoritos', path: '/favorites' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="w-16 hover:w-64 transition-width duration-300">
      <SidebarContent>
        <div className="flex justify-center p-4 mb-6">
          <Link to="/" className="block">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand.purple to-brand.pink flex items-center justify-center">
              <span className="text-white font-bold">CB</span>
            </div>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  tooltip={item.label}
                  className={`transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-brand.purple text-white'
                      : 'hover:bg-white/5'
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
