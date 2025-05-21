
import { supabase } from '@/integrations/supabase/client';
import type { FeatureAccessLevel } from '@/types/featureAccess';

// Get trial information for a user
export const getUserTrialInfo = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('trial_status, trial_start_date, trial_end_date')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching trial info:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserTrialInfo:', error);
    return null;
  }
};

// Start trial for a user
export const startUserTrial = async (userId: string) => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 3); // 3-day trial

    const { error } = await supabase
      .from('profiles')
      .update({
        trial_status: 'active',
        trial_start_date: startDate.toISOString(),
        trial_end_date: endDate.toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error starting trial:', error);
      return false;
    }

    // Set initial suppliers for the trial
    await rotateTrialSuppliers(userId);
    return true;
  } catch (error) {
    console.error('Error in startUserTrial:', error);
    return false;
  }
};

// Get allowed suppliers for a user in trial
export const getAllowedSuppliersForTrial = async (userId: string) => {
  try {
    // Check if we need to rotate suppliers
    await checkAndRotateTrialSuppliers(userId);
    
    const { data, error } = await supabase
      .from('free_trial_config')
      .select('allowed_supplier_ids')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching allowed suppliers:', error);
      return [];
    }

    return data?.allowed_supplier_ids || [];
  } catch (error) {
    console.error('Error in getAllowedSuppliersForTrial:', error);
    return [];
  }
};

// Check if a specific supplier is allowed for a trial user
export const isSupplierAllowedForTrial = async (userId: string, supplierId: string) => {
  try {
    const allowedIds = await getAllowedSuppliersForTrial(userId);
    return allowedIds.includes(supplierId);
  } catch (error) {
    console.error('Error in isSupplierAllowedForTrial:', error);
    return false;
  }
};

// Rotate suppliers for a trial user
export const rotateTrialSuppliers = async (userId: string) => {
  try {
    // Get 3 random suppliers
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('id')
      .eq('hidden', false)
      .order('created_at');

    if (error || !suppliers) {
      console.error('Error fetching suppliers for rotation:', error);
      return false;
    }

    // Shuffle array and take first 3
    const shuffled = [...suppliers].sort(() => 0.5 - Math.random());
    const selectedSuppliers = shuffled.slice(0, 3).map(s => s.id);

    // Update or insert trial config
    const { data, error: upsertError } = await supabase
      .from('free_trial_config')
      .upsert({
        user_id: userId,
        allowed_supplier_ids: selectedSuppliers,
        last_rotation_at: new Date().toISOString()
      })
      .select();

    if (upsertError) {
      console.error('Error updating trial suppliers:', upsertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in rotateTrialSuppliers:', error);
    return false;
  }
};

// Check if suppliers need to be rotated and do it if necessary
export const checkAndRotateTrialSuppliers = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('free_trial_config')
      .select('last_rotation_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no record exists, create one
      if (error.code === 'PGRST116') {
        return await rotateTrialSuppliers(userId);
      }
      console.error('Error checking last rotation:', error);
      return false;
    }

    if (!data?.last_rotation_at) {
      return await rotateTrialSuppliers(userId);
    }

    const lastRotation = new Date(data.last_rotation_at);
    const now = new Date();
    const diffHours = (now.getTime() - lastRotation.getTime()) / (1000 * 60 * 60);

    // Rotate if it's been more than 24 hours
    if (diffHours >= 24) {
      return await rotateTrialSuppliers(userId);
    }

    return true;
  } catch (error) {
    console.error('Error in checkAndRotateTrialSuppliers:', error);
    return false;
  }
};

// Check if a feature is accessible in trial
export const isFeatureAccessibleInTrial = async (userId: string, featureKey: string) => {
  try {
    // First check if the user is in trial
    const trialInfo = await getUserTrialInfo(userId);
    if (!trialInfo || trialInfo.trial_status !== 'active') {
      return true; // Not in trial, so allow access
    }

    // Check feature access rules
    const { data, error } = await supabase
      .from('feature_access_rules')
      .select('trial_access_level, trial_limit_value')
      .eq('feature_key', featureKey)
      .single();

    if (error) {
      console.error(`Error fetching access rules for feature ${featureKey}:`, error);
      return true; // Default to allowing access if there's an error
    }

    // Process based on access level
    const accessLevel = data?.trial_access_level as FeatureAccessLevel;
    switch (accessLevel) {
      case 'none':
        return false; // No access in trial
      case 'limited_count':
      case 'limited_blurred':
        // For limited access, we would need additional logic based on the feature
        // This is a simplified example - expand as needed
        return true;
      case 'full':
        return true; // Full access in trial
      default:
        return true; // Default to access if no rule found
    }
  } catch (error) {
    console.error('Error in isFeatureAccessibleInTrial:', error);
    return true; // Default to allowing access if there's an error
  }
};

// End trial
export const endUserTrial = async (userId: string, converted: boolean = false) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        trial_status: converted ? 'converted' : 'expired'
      })
      .eq('id', userId);

    if (error) {
      console.error('Error ending trial:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in endUserTrial:', error);
    return false;
  }
};

// Auto-start trial for new users
export const autoStartTrialForUser = async (userId: string) => {
  try {
    // Check if user already has trial status
    const { data, error } = await supabase
      .from('profiles')
      .select('trial_status')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking user trial status:', error);
      return false;
    }
    
    // Only start trial if user doesn't have an active trial
    if (data?.trial_status === 'not_started') {
      return await startUserTrial(userId);
    }
    
    return true;
  } catch (error) {
    console.error('Error in autoStartTrialForUser:', error);
    return false;
  }
};

// Check if trial has expired and update status
export const checkAndUpdateTrialStatus = async (userId: string) => {
  try {
    const trialInfo = await getUserTrialInfo(userId);
    
    if (!trialInfo || trialInfo.trial_status !== 'active') {
      return; // No active trial to check
    }
    
    if (trialInfo.trial_end_date) {
      const endDate = new Date(trialInfo.trial_end_date);
      const now = new Date();
      
      if (now > endDate) {
        // Trial has expired, update status
        await supabase
          .from('profiles')
          .update({ trial_status: 'expired' })
          .eq('id', userId);
      }
    }
  } catch (error) {
    console.error('Error in checkAndUpdateTrialStatus:', error);
  }
};
