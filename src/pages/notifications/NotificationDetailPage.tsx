
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  getNotification,
  markNotificationAsRead
} from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/types/notification';

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Otimizado: Adicionado staleTime e reutilização de dados do cache
  const { data: notification, isLoading, error } = useQuery({
    queryKey: ['notification', id],
    queryFn: async () => {
      if (!id) return null;
      return getNotification(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    initialData: () => {
      // Tenta usar dados do cache de listagens, se o ID corresponder
      const notificationsData = queryClient.getQueryData<{notifications: Notification[]}>(['notifications']);
      if (notificationsData?.notifications) {
        const foundNotification = notificationsData.notifications.find(n => n.id === id);
        if (foundNotification) return foundNotification;
      }
      
      const dropdownData = queryClient.getQueryData<{notifications: Notification[]}>(['notifications-dropdown']);
      if (dropdownData?.notifications) {
        const foundNotification = dropdownData.notifications.find(n => n.id === id);
        if (foundNotification) return foundNotification;
      }
      
      return undefined;
    }
  });
  
  // Verificar erro
  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar detalhes da notificação');
      console.error('Error fetching notification:', error);
    }
  }, [error]);
  
  // Otimizado: Adicionado limitação para não marcar como lida repetidamente
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user?.id) return false;
      return markNotificationAsRead(user.id, id);
    },
    onSuccess: () => {
      // Invalidar ambas as queries para manter consistência
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-dropdown'] });
      // Não exibimos o toast aqui para não interromper a experiência do usuário
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  });
  
  // Marcar como lida automaticamente ao visualizar, apenas se ainda não estiver lida
  useEffect(() => {
    if (notification && id && user?.id && notification.read === false) {
      markAsReadMutation.mutate();
    }
  }, [notification, id, user]);
  
  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), "d 'de' MMMM, yyyy 'às' HH:mm", {
      locale: ptBR
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificação</h1>
            <p className="text-muted-foreground">
              Detalhes da notificação recebida
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ) : notification ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{notification.title}</CardTitle>
              <CardDescription>
                {formatDate(notification.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>{notification.message}</p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/notifications')}
              >
                Voltar para notificações
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground text-center">
                Notificação não encontrada.
              </p>
              <Button 
                onClick={() => navigate('/notifications')} 
                variant="outline" 
                className="mt-4"
              >
                Voltar para notificações
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
