import { supabase } from "@/integrations/supabase/client";
import { Notification, UserNotification } from "@/types/notification";

// Obter todas as notificações para um usuário
export const getUserNotifications = async (userId: string): Promise<{notifications: Notification[], unreadCount: number}> => {
  try {
    // Buscar as notificações do usuário no Supabase
    const { data: userNotifications, error: userNotificationsError } = await supabase
      .from('user_notifications')
      .select('*, notification:notification_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (userNotificationsError) {
      throw userNotificationsError;
    }
    
    if (!userNotifications || userNotifications.length === 0) {
      return { notifications: [], unreadCount: 0 };
    }
    
    // Transformar os dados para o formato esperado pelo frontend
    const notifications: Notification[] = userNotifications.map(un => {
      const notification = un.notification as any;
      return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        created_at: notification.created_at,
        read: un.read,
        read_at: un.read_at,
        target_roles: notification.target_roles,
        target_subscription_types: notification.target_subscription_types,
        views_count: notification.views_count
      };
    });
    
    const unreadCount = notifications.filter(n => n.read === false).length;
    
    return { notifications, unreadCount };
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

// Obter uma notificação específica
export const getNotification = async (notificationId: string): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }
    
    return data as Notification;
  } catch (error) {
    console.error("Error fetching notification:", error);
    throw error;
  }
};

// Marcar notificação como lida
export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('notification_id', notificationId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Admin: Obter todas as notificações
export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as Notification[];
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    throw error;
  }
};

// Admin: Criar nova notificação
export const createNotification = async (notification: Omit<Notification, 'id' | 'views_count' | 'created_at'>): Promise<Notification> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: notification.title,
        message: notification.message,
        target_roles: notification.target_roles,
        target_subscription_types: notification.target_subscription_types
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Admin: Atualizar notificação
export const updateNotification = async (notificationId: string, data: Partial<Notification>): Promise<Notification | null> => {
  try {
    const { data: updatedData, error } = await supabase
      .from('notifications')
      .update({
        title: data.title,
        message: data.message,
        target_roles: data.target_roles,
        target_subscription_types: data.target_subscription_types
      })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return updatedData as Notification;
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
};

// Admin: Excluir notificação
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Usuário: Excluir uma notificação de usuário
export const deleteUserNotification = async (userId: string, notificationId: string): Promise<boolean> => {
  try {
    // Primeiro, precisamos encontrar o ID da entrada em user_notifications
    // com base no userId e no notificationId (que é o ID da notificação original).
    // Isso é necessário se a tabela user_notifications tem seu próprio ID primário e você não o tem diretamente na UI.
    // No entanto, o Supabase permite deletar com base em múltiplas colunas.

    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('user_id', userId)
      .eq('notification_id', notificationId);

    if (error) {
      console.error("Error deleting user notification:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteUserNotification:", error);
    throw error;
  }
};
