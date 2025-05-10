import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, BellDot, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getUserNotifications, deleteUserNotification } from '@/services/notificationService';
import type { Notification } from '@/types/notification';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications-dropdown'],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return getUserNotifications(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Atualizar a cada minuto
  });
  
  useEffect(() => {
    if (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, [error]);

  // Mutação para excluir notificação do usuário
  const deleteUserNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => {
      if (!user?.id) {
        toast.error('Usuário não autenticado.');
        throw new Error('Usuário não autenticado para exclusão');
      }
      return deleteUserNotification(user.id, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificação excluída com sucesso.');
    },
    onError: (error) => {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Erro ao excluir notificação.');
    },
  });

  const handleDeleteNotification = (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    event.preventDefault();
    if (user?.id) {
      deleteUserNotificationMutation.mutate(notificationId);
    } else {
      toast.error('Usuário não autenticado.');
    }
  };

  // Formatar a data relativa (ex: "há 2 horas")
  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

  // Renderização de notificação para versão desktop
  const renderNotificationItem = (notification: Notification) => (
    <DropdownMenuItem key={notification.id} asChild className="p-0 focus:bg-transparent">
      <div className="flex items-center justify-between w-full hover:bg-accent rounded-md px-2 py-3">
        <Link
          to={`/notifications/${notification.id}`}
          className="flex flex-col gap-1 cursor-pointer flex-grow"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex justify-between items-start w-full">
            <span className="font-medium text-sm leading-tight">{notification.title}</span>
            {notification.read === false && (
              <Badge variant="outline" className="bg-primary/20 text-primary text-xs ml-2 self-start">
                Nova
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground text-xs">
            {formatRelativeDate(notification.created_at)}
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive shrink-0"
          onClick={(e) => handleDeleteNotification(e, notification.id)}
          disabled={deleteUserNotificationMutation.isPending && deleteUserNotificationMutation.variables === notification.id}
          title="Excluir notificação"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </DropdownMenuItem>
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Usando Popover em vez de DropdownMenu para mobile, para UX melhor
  if (isMobile) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            {unreadCount > 0 ? (
              <>
                <BellDot className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              </>
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="outline" className="bg-primary/10">
                {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <ScrollArea className="max-h-[300px]" type="always">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Carregando...</div>
            ) : notifications.length > 0 ? (
              <div className="py-2">
                {notifications.map(notification => {
                  return (
                    <div key={notification.id} className="flex items-center justify-between w-full hover:bg-accent px-4 py-3">
                      <Link
                        to={`/notifications/${notification.id}`}
                        className="flex flex-col gap-1 cursor-pointer flex-grow"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="font-medium text-sm leading-tight">{notification.title}</span>
                          {notification.read === false && (
                            <Badge variant="outline" className="bg-primary/20 text-primary text-xs ml-2 self-start">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {formatRelativeDate(notification.created_at)}
                        </span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        disabled={deleteUserNotificationMutation.isPending && deleteUserNotificationMutation.variables === notification.id}
                        title="Excluir notificação"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma notificação
              </div>
            )}
          </ScrollArea>
          
          <div className="p-2 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setIsOpen(false)}
              asChild
            >
              <Link to="/notifications">Ver todas</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Versão desktop usando DropdownMenu
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Badge variant="outline" className="bg-primary/10">
              {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[300px]">
          <DropdownMenuGroup>
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Carregando...</div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => renderNotificationItem(notification))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma notificação
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setIsOpen(false)}
            asChild
          >
            <Link to="/notifications">Ver todas</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
