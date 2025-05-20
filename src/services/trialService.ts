
import { supabase } from '@/integrations/supabase/client';
import type { UserTrialInfo, FreeTrialConfig, TrialStatus } from '@/types';
import type { Supplier } from '@/types';

const TRIAL_DURATION_DAYS = 3;
const SUPPLIER_ROTATION_HOURS = 24;
const TRIAL_SUPPLIER_COUNT = 3;

export const startUserTrial = async (userId: string): Promise<UserTrialInfo | null> => {
  try {
    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialStartDate.getDate() + TRIAL_DURATION_DAYS);

    const { data: profileUpdate, error: profileError } = await supabase
      .from('profiles')
      .update({
        trial_status: 'active',
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
      })
      .eq('id', userId)
      .select('trial_status, trial_start_date, trial_end_date')
      .single();

    if (profileError) {
      console.error('Error starting user trial in profiles:', profileError);
      throw profileError;
    }

    // Initialize free_trial_config. If it fails, the trial status in profiles is still set.
    // The allowed suppliers can be populated on the first request.
    await initializeAllowedSuppliers(userId, TRIAL_SUPPLIER_COUNT);
    
    console.log(`Trial started for user ${userId}. Ends on ${trialEndDate.toISOString()}`);
    return {
      userId,
      status: profileUpdate.trial_status as TrialStatus,
      startDate: profileUpdate.trial_start_date,
      endDate: profileUpdate.trial_end_date,
    };
  } catch (error) {
    console.error('Error in startUserTrial:', error);
    return null;
  }
};

export const getUserTrialInfo = async (userId: string): Promise<UserTrialInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('trial_status, trial_start_date, trial_end_date')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user trial info:', error);
      return null;
    }
    if (!data) return null;

    let trialInfo: UserTrialInfo = {
      userId,
      status: data.trial_status as TrialStatus,
      startDate: data.trial_start_date,
      endDate: data.trial_end_date,
    };

    // If trial is active, check if it has actually expired
    if (trialInfo.status === 'active' && trialInfo.endDate && new Date(trialInfo.endDate) < new Date()) {
      // Update status to expired if it hasn't been already
      await supabase.from('profiles').update({ trial_status: 'expired' }).eq('id', userId);
      trialInfo.status = 'expired';
    }
    
    return trialInfo;
  } catch (error) {
    console.error('Error in getUserTrialInfo:', error);
    return null;
  }
};

async function getRandomSuppliers(count: number, excludeIds: string[] = []): Promise<Pick<Supplier, 'id'>[]> {
  // This is a simplified version. Supabase doesn't directly support random order on large datasets efficiently without extensions.
  // For a more robust solution, consider a DB function or fetching a larger set and picking randomly in JS.
  // This version fetches all non-hidden suppliers and picks randomly. Might be slow for many suppliers.
  const { data, error } = await supabase
    .from('suppliers')
    .select('id')
    .eq('hidden', false)
    .not('id', 'in', `(${excludeIds.join(',')})`); // Basic exclusion if needed

  if (error) {
    console.error('Error fetching random suppliers:', error);
    return [];
  }
  if (!data || data.length === 0) return [];

  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function initializeAllowedSuppliers(userId: string, count: number): Promise<string[]> {
    const randomSuppliers = await getRandomSuppliers(count);
    const supplierIds = randomSuppliers.map(s => s.id);

    const { error: configError } = await supabase
        .from('free_trial_config')
        .upsert({
            user_id: userId,
            allowed_supplier_ids: supplierIds,
            last_rotation_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    if (configError) {
        console.error('Error initializing/updating free_trial_config:', configError);
        return [];
    }
    return supplierIds;
}


export const getAllowedSuppliersForTrial = async (userId: string): Promise<string[]> => {
  try {
    const { data: trialConfig, error: fetchError } = await supabase
      .from('free_trial_config')
      .select('allowed_supplier_ids, last_rotation_at')
      .eq('user_id', userId)
      .single<FreeTrialConfig>();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: single row not found
      console.error('Error fetching allowed suppliers config:', fetchError);
      return [];
    }

    const now = new Date();
    if (!trialConfig || !trialConfig.last_rotation_at || 
        (new Date(trialConfig.last_rotation_at).getTime() < now.getTime() - (SUPPLIER_ROTATION_HOURS * 60 * 60 * 1000))) {
      // Needs initialization or rotation
      console.log(`Rotating suppliers for user ${userId}. Previous rotation: ${trialConfig?.last_rotation_at}`);
      return await initializeAllowedSuppliers(userId, TRIAL_SUPPLIER_COUNT);
    }
    
    return trialConfig.allowed_supplier_ids || [];
  } catch (error) {
    console.error('Error in getAllowedSuppliersForTrial:', error);
    return [];
  }
};

export const isSupplierAllowedForTrial = async (userId: string, supplierId: string): Promise<boolean> => {
  const allowedIds = await getAllowedSuppliersForTrial(userId);
  return allowedIds.includes(supplierId);
};

