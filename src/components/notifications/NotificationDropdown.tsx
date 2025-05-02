
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, BellDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getUserNotifications } from '@/services/notificationService';
import type { Notification } from '@/types/notification';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Em um aplicativo real, 'current-user' seria o ID do usuário logado
        const userId = 'current-user';
        const { notifications, unreadCount } = await getUserNotifications(userId);
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast.error('Não foi possível carregar suas notificações');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Simular atualização periódica de notificações
    const interval = setInterval(fetchNotifications, 60000); // A cada minuto
    
    return () => clearInterval(interval);
  }, []);

  // Formatar a data relativa (ex: "há 2 horas")
  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

  // Renderização de notificação
  const renderNotification = (notification: Notification) => (
    <DropdownMenuItem key={notification.id} asChild>
      <Link 
        to={`/notifications/${notification.id}`}
        className="flex flex-col gap-1 py-3 cursor-pointer hover:bg-accent rounded-md px-2"
        onClick={() => setIsOpen(false)}
      >
        <div className="flex justify-between items-start w-full">
          <span className="font-medium">{notification.title}</span>
          {notification.read === false && (
            <Badge variant="outline" className="bg-primary/20 text-primary text-xs ml-2">
              Nova
            </Badge>
          )}
        </div>
        <span className="text-muted-foreground text-xs">
          {formatRelativeDate(notification.created_at)}
        </span>
      </Link>
    </DropdownMenuItem>
  );

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
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Carregando...</div>
            ) : notifications.length > 0 ? (
              <div className="py-2">
                {notifications.map(renderNotification)}
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
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Carregando...</div>
            ) : notifications.length > 0 ? (
              notifications.map(renderNotification)
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
