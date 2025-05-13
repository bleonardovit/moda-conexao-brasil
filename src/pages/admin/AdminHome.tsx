
import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  PackageSearch, 
  Bell, 
  FileText, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  const adminMenuItems = [
    {
      title: 'Gerenciar Usuários',
      description: 'Adicionar, editar e gerenciar usuários do sistema',
      icon: <Users className="h-8 w-8 text-primary" />,
      link: '/admin/users'
    },
    {
      title: 'Gerenciar Fornecedores',
      description: 'Gerenciar cadastros de fornecedores',
      icon: <PackageSearch className="h-8 w-8 text-primary" />,
      link: '/admin/suppliers'
    },
    {
      title: 'Notificações',
      description: 'Gerenciar notificações do sistema',
      icon: <Bell className="h-8 w-8 text-primary" />,
      link: '/admin/notifications'
    },
    {
      title: 'Gerenciar Artigos',
      description: 'Criar e editar artigos do blog',
      icon: <FileText className="h-8 w-8 text-primary" />,
      link: '/admin/articles'
    },
    {
      title: 'Relatórios',
      description: 'Visualizar relatórios e métricas',
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      link: '/admin/reports'
    },
    {
      title: 'Configurações de Rastreamento',
      description: 'Configurar scripts de rastreamento do site',
      icon: <Settings className="h-8 w-8 text-primary" />,
      link: '/admin/tracking-settings'
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel administrativo do Conexão Brasil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <CardTitle>{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{item.description}</CardDescription>
                <Link 
                  to={item.link}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Acessar
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHome;
