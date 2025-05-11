import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserNotifications, markNotificationAsRead, deleteUserNotification } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Check, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  // Otimizado: Adicionado staleTime e reuso do cache do dropdown quando possível
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      const result = await getUserNotifications(user.id);
      return result;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    // Reusando dados do dropdown quando disponíveis e recentes
    initialData: () => {
      const dropdownData = queryClient.getQueryData(['notifications-dropdown']);
      if (dropdownData) {
        return dropdownData;
      }
      return undefined;
    }
  });

  useEffect(() => {
    if (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Não foi possível carregar suas notificações');
    }
  }, [error]);

  const markAsReadMutation = useMutation({
    mutationFn: ({ userId, notificationId }: { userId: string; notificationId: string }) =>
      markNotificationAsRead(userId, notificationId),
    onSuccess: () => {
      // Invalidar ambas as queries para manter consistência
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-dropdown'] });
      toast.success('Notificação marcada como lida.');
    },
    onError: (error) => {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Erro ao marcar notificação como lida.');
    },
  });

  const deleteUserNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => {
      if (!user?.id) {
        toast.error('Usuário não autenticado.');
        throw new Error('Usuário não autenticado para exclusão');
      }
      return deleteUserNotification(user.id, notificationId);
    },
    onSuccess: () => {
      // Invalidar ambas as queries para manter consistência
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-dropdown'] });
      toast.success('Notificação excluída com sucesso.');
      setIsDeleteDialogOpen(false);
      setNotificationToDelete(null);
    },
    onError: (error) => {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Erro ao excluir notificação.');
      setIsDeleteDialogOpen(false);
      setNotificationToDelete(null);
    },
  });

  const handleMarkAsRead = (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    event.preventDefault();
    if (user?.id) {
      markAsReadMutation.mutate({ userId: user.id, notificationId });
    }
  };

  const handleOpenDeleteDialog = (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    event.preventDefault();
    setNotificationToDelete(notificationId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteUserNotificationMutation.mutate(notificationToDelete);
    }
  };

  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

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
                      <div className="flex items-center space-x-2">
                        {notification.read === false && (
                          <Badge variant="outline" className="bg-primary/20 text-primary">
                            Nova
                          </Badge>
                        )}
                        {notification.read === false && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            disabled={markAsReadMutation.isPending && markAsReadMutation.variables?.notificationId === notification.id}
                            className="flex items-center gap-1 text-xs h-auto py-1 px-2"
                          >
                            <Check className="h-3 w-3" />
                            Marcar como lida
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleOpenDeleteDialog(e, notification.id)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                          title="Excluir notificação"
                          disabled={deleteUserNotificationMutation.isPending && deleteUserNotificationMutation.variables === notification.id}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta notificação? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNotificationToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={deleteUserNotificationMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserNotificationMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
