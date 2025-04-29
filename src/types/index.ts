
// Tipos para usuários
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  subscription_status: 'active' | 'inactive' | 'pending';
  subscription_type?: 'monthly' | 'yearly';
  subscription_start_date?: string;
  subscription_history?: SubscriptionEvent[];
  last_login?: string;
  role: 'user' | 'admin';
}

// Tipos para eventos de assinatura
export interface SubscriptionEvent {
  id: string;
  user_id: string;
  event_type: 'created' | 'renewed' | 'cancelled' | 'changed' | 'payment_failed';
  date: string;
  details?: string;
}

// Tipos para pagamentos
export interface Payment {
  id: string;
  user_id: string;
  amount: string;
  date: string;
  status: 'success' | 'failed' | 'pending';
  method: 'card' | 'pix' | 'bankslip';
  details?: string;
}

// Tipos para fornecedores
export interface Supplier {
  id: string;
  code: string;
  name: string;
  description: string;
  images: string[];
  instagram?: string;
  whatsapp?: string;
  website?: string;
  min_order?: string;
  payment_methods: ('pix' | 'card' | 'bankslip')[];
  requires_cnpj: boolean;
  avg_price: 'low' | 'medium' | 'high';
  shipping_methods: ('correios' | 'delivery' | 'transporter')[];
  city: string;
  state: string;
  categories: string[];
  featured: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para avaliações
export interface Review {
  id: string;
  supplier_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
