
export type FeatureAccessLevel = 'full' | 'limited_count' | 'limited_blurred' | 'none';

export interface FeatureAccessRule {
  id: string;
  feature_key: string;
  trial_access_level: FeatureAccessLevel;
  trial_limit_value: number | null;
  trial_message_locked: string | null;
  non_subscriber_access_level: FeatureAccessLevel;
  non_subscriber_limit_value: number | null;  // Nova coluna adicionada
  non_subscriber_message_locked: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessCheckResult {
  access: FeatureAccessLevel;
  limit?: number | null;
  message?: string | null;
  allowedIds?: string[] | null;
}
