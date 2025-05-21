import { supabase } from '@/integrations/supabase/client';
import type { FeatureAccessRule, AccessCheckResult, FeatureAccessLevel } from '@/types';
import type { User } from '@/types/user'; // Assuming User type has subscription_status and trial_status

// Helper function to get user profile details relevant for access checks
// Exporting this function to make it available for other services
export async function getUserProfileForAccessCheck(userId: string): Promise<Partial<User> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status, trial_status, trial_start_date, trial_end_date, role') // Added role for completeness if needed by rules
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
    console.warn(`No access rule found for feature: ${featureKey}. Defaulting to full access as a fallback. Consider defining a rule.`);
    // Defaulting to full access if no rule is found can be risky.
    // Consider defaulting to 'none' or a specific restricted level.
    // For now, matching previous behavior of defaulting to 'none' if rule is missing for non-anonymous.
    // If rule is truly not found, this path means only anonymous might get some access based on below.
    // Let's refine this: if no rule, it's 'none' unless it's an anonymous user scenario handled below.
     if (!userId) { // For anonymous users, rely on non_subscriber_access_level if rule found, or be restrictive.
        // This case needs a rule to define anonymous access. If no rule, access is 'none'.
        // This part is a bit tricky without a specific "anonymous_access_level" in the rule.
        // Let's assume non_subscriber_access_level is for non-logged-in users too.
        // But if the rule itself is missing, it's an issue.
        // For safety, if rule is missing, it's 'none'.
        return { access: 'none', message: 'Funcionalidade indisponível (sem regra definida).' };
    }
    // Logged-in user but no rule:
    return { access: 'none', message: 'Funcionalidade indisponível (sem regra definida para usuários logados).' };
  }

  // Handle anonymous users (userId is null or undefined)
  if (!userId) {
    return {
        access: rule.non_subscriber_access_level, // Using non_subscriber_access_level for anonymous users
        limit: rule.non_subscriber_access_level === 'limited_count' ? rule.trial_limit_value : null, // Assuming trial_limit_value makes sense here or needs own field
        message: rule.non_subscriber_message_locked,
        // allowedIds: rule.non_subscriber_access_level === 'limited_count' ? rule.non_subscriber_allowed_ids : null, // If you add allowed IDs for non-subscribers
    };
  }
  
  const userProfile = await getUserProfileForAccessCheck(userId);

  if (!userProfile) {
    return { access: 'none', message: 'Não foi possível verificar seu acesso. Tente novamente.' };
  }

  // Subscribers always get full access, overriding any rule
  if (userProfile.subscription_status === 'active' || userProfile.subscription_status === 'trialing') { // 'trialing' from Stripe often means active subscription trial
    return { access: 'full' };
  }

  // Check trial status from profiles table
  if (userProfile.trial_status === 'active') {
    // Check if trial is expired based on trial_end_date
    if (userProfile.trial_end_date && new Date(userProfile.trial_end_date) < new Date()) {
      // Trial effectively expired, treat as non-subscriber (based on the rule for non-subscribers)
      // Here, we might want to update the user's trial_status in DB to 'expired' via a separate service call if not already handled.
      return {
        access: rule.non_subscriber_access_level,
        limit: rule.non_subscriber_access_level === 'limited_count' ? rule.trial_limit_value : null, // Or a specific non_subscriber_limit_value
        message: rule.non_subscriber_message_locked,
        // allowedIds: rule.non_subscriber_access_level === 'limited_count' ? rule.non_subscriber_allowed_ids : null,
      };
    }
    // Active trial, apply trial rules
    return {
      access: rule.trial_access_level,
      limit: rule.trial_access_level === 'limited_count' ? rule.trial_limit_value : null,
      message: rule.trial_message_locked,
      // allowedIds: rule.trial_access_level === 'limited_count' ? rule.trial_allowed_ids : null, // Assuming FeatureAccessRule could have trial_allowed_ids
    };
  }

  // Not subscribed, and trial is not 'active' (e.g., 'expired', 'not_started', or 'converted' but subscription lapsed)
  // Apply non-subscriber rules
  return {
    access: rule.non_subscriber_access_level,
    limit: rule.non_subscriber_access_level === 'limited_count' ? rule.trial_limit_value : null, // Or non_subscriber_limit_value
    message: rule.non_subscriber_message_locked,
    // allowedIds: rule.non_subscriber_access_level === 'limited_count' ? rule.non_subscriber_allowed_ids : null,
  };
};
