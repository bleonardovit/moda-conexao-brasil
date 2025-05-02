
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

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Buscar detalhes da notificação
  const { data: notification, isLoading } = useQuery({
    queryKey: ['notification', id],
    queryFn: async () => {
      if (!id) return null;
      return getNotification(id);
    },
    enabled: !!id
  });
  
  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!id) return false;
      // Em um aplicativo real, 'current-user' seria o ID do usuário logado
      return markNotificationAsRead('current-user', id);
    },
    onSuccess: () => {
      // Invalidar a cache para atualizar contadores
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificação marcada como lida');
    },
    onError: () => {
      toast.error('Erro ao marcar notificação como lida');
    }
  });
  
  // Marcar como lida automaticamente ao visualizar
  useEffect(() => {
    if (notification && id) {
      markAsReadMutation.mutate();
    }
  }, [notification, id]);
  
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
