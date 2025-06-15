
import { supabase } from '@/integrations/supabase/client';
import type { FeatureAccessRule, AccessCheckResult, FeatureAccessLevel } from '@/types';
import type { User } from '@/types/user';

// Helper function to get user profile details relevant for access checks
export async function getUserProfileForAccessCheck(userId: string): Promise<Partial<User> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status, trial_status, trial_start_date, trial_end_date, role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile for access check:', error);
    return null;
  }
  return data as Partial<User>;
}

export const getFeatureAccessRule = async (featureKey: string): Promise<FeatureAccessRule | null> => {
  try {
    const { data, error } = await supabase
      .from('feature_access_rules')
      .select('*')
      .eq('feature_key', featureKey)
      .single();

    if (error) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching feature access rule:', error);
    return null;
  }
};

export const checkFeatureAccess = async (userId: string | null | undefined, featureKey: string): Promise<AccessCheckResult> => {
  const rule = await getFeatureAccessRule(featureKey);

  if (!rule) {
    console.warn(`No access rule found for feature: ${featureKey}. Defaulting to full access.`);
    return { access: 'full' };
  }

  // Handle anonymous users
  if (!userId) {
    return {
      access: rule.non_subscriber_access_level,
      limit: rule.non_subscriber_access_level === 'limited_count' ? rule.non_subscriber_limit_value : null,
      message: rule.non_subscriber_message_locked,
    };
  }
  
  const userProfile = await getUserProfileForAccessCheck(userId);

  if (!userProfile) {
    return { access: 'none', message: 'Não foi possível verificar seu acesso. Tente novamente.' };
  }

  // Subscribers always get full access
  if (userProfile.subscription_status === 'active' || userProfile.subscription_status === 'trialing') {
    return { access: 'full' };
  }

  // Check trial status
  if (userProfile.trial_status === 'active') {
    // Check if trial is expired based on trial_end_date
    if (userProfile.trial_end_date && new Date(userProfile.trial_end_date) < new Date()) {
      // Trial expired, treat as non-subscriber
      return {
        access: rule.non_subscriber_access_level,
        limit: rule.non_subscriber_access_level === 'limited_count' ? rule.non_subscriber_limit_value : null,
        message: rule.non_subscriber_message_locked,
      };
    }
    // Active trial, apply trial rules
    return {
      access: rule.trial_access_level,
      limit: rule.trial_access_level === 'limited_count' ? rule.trial_limit_value : null,
      message: rule.trial_message_locked,
    };
  }

  // Not subscribed and no active trial - apply non-subscriber rules
  return {
    access: rule.non_subscriber_access_level,
    limit: rule.non_subscriber_access_level === 'limited_count' ? rule.non_subscriber_limit_value : null,
    message: rule.non_subscriber_message_locked,
  };
};
