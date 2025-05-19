
// Types for users
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  city?: string; // Novo campo
  state?: string; // Novo campo
  subscription_status: 'active' | 'inactive' | 'pending';
  subscription_type?: 'monthly' | 'yearly';
  subscription_start_date?: string;
  subscription_history?: SubscriptionEvent[];
  last_login?: string;
  role: 'user' | 'admin';
}

// Types for subscription events
export interface SubscriptionEvent {
  id: string;
  user_id: string;
  event_type: 'created' | 'renewed' | 'cancelled' | 'changed' | 'payment_failed';
  date: string;
  details?: string;
}

// Types for payments
export interface Payment {
  id: string;
  user_id: string;
  amount: string;
  date: string;
  status: 'success' | 'failed' | 'pending';
  method: 'card' | 'pix' | 'bankslip';
  details?: string;
}
