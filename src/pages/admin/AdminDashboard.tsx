
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, FileText, Shield, Users, Store, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const adminFeatures = [
  {
    title: 'Gerenciar Usuários',
    description: 'Visualize e gerencie todos os usuários da plataforma.',
    path: '/admin/users',
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Gerenciar Fornecedores',
    description: 'Adicione, edite e gerencie os fornecedores.',
    path: '/admin/suppliers',
    icon: <Store className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Gerenciar Artigos',
    description: 'Crie, edite e publique artigos e conteúdo.',
    path: '/admin/articles',
    icon: <Book className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Moderar Avaliações',
    description: 'Aprove ou rejeite avaliações de fornecedores.',
    path: '/admin/reviews-moderation',
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Relatórios',
    description: 'Acesse relatórios e métricas de uso.',
    path: '/admin/reports',
    icon: <FileText className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Segurança',
    description: 'Monitore a segurança e atividades suspeitas.',
    path: '/admin/security-monitoring',
    icon: <Shield className="h-6 w-6 text-primary" />,
  },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Helmet>
        <title>Dashboard Admin | Os Fornecedores</title>
      </Helmet>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard do Administrador</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Bem-vindo ao painel de administração. Aqui você pode gerenciar os principais aspectos da plataforma.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <Link to={feature.path} key={feature.path} className="block hover:scale-[1.02] transition-transform">
            <Card className="hover:bg-accent/50 transition-colors h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                {feature.icon}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
