
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
  { icon: Home, label: 'Início', path: '/suppliers' },
  { icon: Search, label: 'Buscar', path: '/search' },
  { icon: Heart, label: 'Favoritos', path: '/favorites' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-white/20 bg-white/50 backdrop-blur-sm">
      <SidebarContent>
        <div className="p-6 mb-4">
          <Link to="/" className="block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
              Conexão Brasil
            </h1>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    className={`transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-brand.purple to-brand.pink text-white'
                        : 'hover:bg-brand.light'
                    }`}
                    asChild
                  >
                    <Link to={item.path} className="flex items-center gap-3 px-4 py-2 rounded-lg">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
