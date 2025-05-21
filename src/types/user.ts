
export type UserRole = 'user' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'pending' | 'canceled' | 'trialing';
export type SubscriptionType = 'monthly' | 'yearly' | undefined;
export type TrialStatus = 'not_started' | 'active' | 'expired' | 'converted';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  city?: string;
  state?: string;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  subscription_status?: SubscriptionStatus;
  subscription_id?: string;
  subscription_type?: SubscriptionType;
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_status?: TrialStatus;
  trial_start_date?: string | null;
  trial_end_date?: string | null;
}

export interface UserProfileUpdate {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  city?: string;
  state?: string;
}

