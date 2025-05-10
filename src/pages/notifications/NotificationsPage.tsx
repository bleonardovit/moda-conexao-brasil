
import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserNotifications } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return getUserNotifications(user.id);
    },
    enabled: !!user?.id
  });

  // Mostrar erro se houver
  useEffect(() => {
    if (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Não foi possível carregar suas notificações');
    }
  }, [error]);

  // Formatar a data relativa (ex: "há 2 horas")
  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

  // Formatar data absoluta (ex: "10 de maio, 2025 - 14:30")
  const formatAbsoluteDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy - HH:mm", {
      locale: ptBR
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie suas notificações recebidas.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.notifications && data.notifications.length > 0 ? (
          <div className="space-y-4">
            {data.notifications.map((notification) => (
              <Link
                key={notification.id}
                to={`/notifications/${notification.id}`}
                className="block transition-shadow hover:shadow-md"
              >
                <Card className={`${notification.read === false ? 'border-l-4 border-l-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <div className="flex space-x-2">
                        {notification.read === false && (
                          <Badge variant="outline" className="bg-primary/20 text-primary">
                            Nova
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {formatAbsoluteDate(notification.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground text-center">
                Você não possui notificações.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
