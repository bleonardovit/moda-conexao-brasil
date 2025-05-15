
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getUserNotifications } from '@/services/notificationService';
import { Notification } from '@/types/notification';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface NotificationsRealtimeState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useNotificationsRealtime(userId: string | undefined) {
  const [state, setState] = useState<NotificationsRealtimeState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    error: null
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    // Inicializa com os dados existentes
    const fetchInitialData = async () => {
      if (!userId) return;
      
      try {
        const result = await getUserNotifications(userId);
        setState(prev => ({
          ...prev,
          notifications: result.notifications,
          unreadCount: result.unreadCount,
          isLoading: false
        }));
        
        // Atualiza o cache do React Query com os dados iniciais
        queryClient.setQueryData(['notifications'], result);
        queryClient.setQueryData(['notifications-dropdown'], result);
      } catch (error) {
        console.error('Erro ao carregar notificações iniciais:', error);
        setState(prev => ({ ...prev, error: error as Error, isLoading: false }));
      }
    };

    fetchInitialData();

    // Configura o canal para as notificações do usuário
    const channel = supabase
      .channel('user-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Alteração em user_notifications detectada:', payload);
          
          // Recarrega os dados sempre que houver uma alteração
          try {
            const result = await getUserNotifications(userId);
            setState(prev => ({
              ...prev,
              notifications: result.notifications,
              unreadCount: result.unreadCount
            }));
            
            // Atualiza o cache do React Query
            queryClient.setQueryData(['notifications'], result);
            queryClient.setQueryData(['notifications-dropdown'], result);
            
            // Mostra toast apenas para novos itens
            if (payload.eventType === 'INSERT') {
              toast.info('Nova notificação recebida');
            }
          } catch (error) {
            console.error('Erro ao atualizar notificações após evento realtime:', error);
          }
        }
      )
      .subscribe();

    // Limpeza ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return state;
}
