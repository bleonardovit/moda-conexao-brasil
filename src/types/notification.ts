
export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read?: boolean;
  read_at?: string;
  target_roles?: ('user' | 'admin')[];
  target_subscription_types?: ('monthly' | 'yearly')[];
  views_count: number;
}

export interface UserNotification {
  id: string;
  user_id: string;
  notification_id: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}
