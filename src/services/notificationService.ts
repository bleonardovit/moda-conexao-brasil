
import { Notification, UserNotification } from "@/types/notification";

// Dados simulados para notificações
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Bem-vindo ao Conexão Brasil",
    message: "Estamos felizes por você se juntar à nossa plataforma. Explore novos fornecedores e oportunidades de negócio!",
    created_at: "2025-05-01T10:00:00Z",
    target_roles: ["user", "admin"],
    views_count: 0
  },
  {
    id: "2",
    title: "Novos fornecedores adicionados",
    message: "Confira os 15 novos fornecedores de moda feminina que foram adicionados recentemente.",
    created_at: "2025-04-30T14:30:00Z",
    target_roles: ["user"],
    target_subscription_types: ["monthly", "yearly"],
    views_count: 5
  },
  {
    id: "3",
    title: "Manutenção programada",
    message: "Informamos que haverá uma manutenção programada no sistema no dia 10/05/2025, entre 02h e 04h da manhã. Durante este período o sistema poderá ficar indisponível.",
    created_at: "2025-04-29T09:15:00Z",
    target_roles: ["user", "admin"],
    views_count: 12
  }
];

// Dados simulados para notificações de usuário
let MOCK_USER_NOTIFICATIONS: UserNotification[] = [
  {
    id: "u1",
    user_id: "current-user",
    notification_id: "1",
    read: false,
    created_at: "2025-05-01T10:00:00Z"
  },
  {
    id: "u2",
    user_id: "current-user",
    notification_id: "2",
    read: false,
    created_at: "2025-04-30T14:30:00Z"
  },
  {
    id: "u3",
    user_id: "current-user",
    notification_id: "3",
    read: true,
    read_at: "2025-04-29T10:15:00Z",
    created_at: "2025-04-29T09:15:00Z"
  }
];

// Obter todas as notificações para um usuário
export const getUserNotifications = async (userId: string): Promise<{notifications: Notification[], unreadCount: number}> => {
  // Na implementação real, isso seria uma chamada API para buscar notificações do banco de dados
  
  // Simular algum atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const userNotificationsMap = MOCK_USER_NOTIFICATIONS
    .filter(un => un.user_id === userId)
    .reduce((acc, un) => {
      acc[un.notification_id] = un;
      return acc;
    }, {} as Record<string, UserNotification>);
  
  const notifications = MOCK_NOTIFICATIONS
    .filter(n => Object.keys(userNotificationsMap).includes(n.id))
    .map(n => ({
      ...n,
      read: userNotificationsMap[n.id].read,
      read_at: userNotificationsMap[n.id].read_at
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {notifications, unreadCount};
};

// Obter uma notificação específica
export const getNotification = async (notificationId: string): Promise<Notification | null> => {
  // Simular algum atraso de rede
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const notification = MOCK_NOTIFICATIONS.find(n => n.id === notificationId);
  
  if (!notification) return null;
  
  return notification;
};

// Marcar notificação como lida
export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<boolean> => {
  // Simular algum atraso de rede
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const userNotificationIndex = MOCK_USER_NOTIFICATIONS.findIndex(
    un => un.user_id === userId && un.notification_id === notificationId
  );
  
  if (userNotificationIndex === -1) return false;
  
  MOCK_USER_NOTIFICATIONS[userNotificationIndex] = {
    ...MOCK_USER_NOTIFICATIONS[userNotificationIndex],
    read: true,
    read_at: new Date().toISOString()
  };
  
  return true;
};

// Admin: Obter todas as notificações
export const getAllNotifications = async (): Promise<Notification[]> => {
  // Simular algum atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [...MOCK_NOTIFICATIONS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

// Admin: Criar nova notificação
export const createNotification = async (notification: Omit<Notification, 'id' | 'views_count' | 'created_at'>): Promise<Notification> => {
  // Simular algum atraso de rede
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const newNotification: Notification = {
    ...notification,
    id: `${MOCK_NOTIFICATIONS.length + 1}`,
    created_at: new Date().toISOString(),
    views_count: 0
  };
  
  MOCK_NOTIFICATIONS.push(newNotification);
  
  // Criar entradas para os usuários alvo
  // Na implementação real, isso seria feito pelo backend
  
  return newNotification;
};

// Admin: Atualizar notificação
export const updateNotification = async (notificationId: string, data: Partial<Notification>): Promise<Notification | null> => {
  // Simular algum atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
  
  if (index === -1) return null;
  
  MOCK_NOTIFICATIONS[index] = {
    ...MOCK_NOTIFICATIONS[index],
    ...data
  };
  
  return MOCK_NOTIFICATIONS[index];
};

// Admin: Excluir notificação (soft delete)
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  // Simular algum atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
  
  if (index === -1) return false;
  
  // Em uma implementação real, faríamos soft delete
  // Aqui vamos simplesmente remover da array
  MOCK_NOTIFICATIONS.splice(index, 1);
  
  return true;
};
