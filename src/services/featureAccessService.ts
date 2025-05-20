
import { supabase } from '@/integrations/supabase/client';
import type { FeatureAccessRule, AccessCheckResult, FeatureAccessLevel } from '@/types';
import type { User } from '@/types/user'; // Assuming User type has subscription_status and trial_status

// Helper function to get user profile details relevant for access checks
async function getUserProfileForAccessCheck(userId: string): Promise<Partial<User> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status, trial_status, trial_end_date')
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
      // console.warn(`Rule not found or error for featureKey ${featureKey}:`, error.message);
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
    // Default to no access if rule is not defined, or handle as per application policy
    console.warn(`No access rule found for feature: ${featureKey}. Defaulting to no access.`);
    return { access: 'none', message: 'Funcionalidade indisponível.' };
  }

  if (!userId) { // For anonymous users or before user data is loaded
    // Apply non_subscriber_access_level for anonymous users or if userId is not available
    // This might need refinement based on how you want to treat purely anonymous vs logged-out trial-expired users
    return {
        access: rule.non_subscriber_access_level,
        limit: rule.non_subscriber_access_level === 'limited_count' ? rule.trial_limit_value : null, // Assuming trial_limit_value applies here too
        message: rule.non_subscriber_message_locked,
    };
  }
  
  const userProfile = await getUserProfileForAccessCheck(userId);

  if (!userProfile) {
     // If user profile can't be fetched, default to restricted access
    return { access: 'none', message: 'Não foi possível verificar seu acesso. Tente novamente.' };
  }

  // Subscribers always get full access
  if (userProfile.subscription_status === 'active') {
    return { access: 'full' };
  }

  // Check trial status
  if (userProfile.trial_status === 'active') {
    // Check if trial is expired based on trial_end_date
    if (userProfile.trial_end_date && new Date(userProfile.trial_end_date) < new Date()) {
      // Trial effectively expired, treat as non-subscriber
      return {
        access: rule.non_subscriber_access_level,
        limit: rule.non_subscriber_access_level === 'limited_count' ? rule.trial_limit_value : null,
        message: rule.non_subscriber_message_locked,
      };
    }
    // Active trial
    return {
      access: rule.trial_access_level,
      limit: rule.trial_access_level === 'limited_count' ? rule.trial_limit_value : null,
      message: rule.trial_message_locked,
    };
  }

  // Not subscribed, and trial is not active (expired, not_started, converted but subscription lapsed)
  return {
    access: rule.non_subscriber_access_level,
    limit: rule.non_subscriber_access_level === 'limited_count' ? rule.trial_limit_value : null,
    message: rule.non_subscriber_message_locked,
  };
};

