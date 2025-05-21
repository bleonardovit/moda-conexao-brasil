
import { supabase } from '@/integrations/supabase/client';
import type { User, UserRole, TrialStatus, SubscriptionStatus, SubscriptionType } from '@/types/user';
import type { Payment } from '@/types/payment'; // Import Payment type

// UserProfileUpdate was from a potentially missing validator. Using Pick for relevant fields.
type UserProfileUpdateData = Partial<Pick<User, 'full_name' | 'email' | 'phone' | 'avatar_url' | 'city' | 'state'>>;


export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return (data as User[]) || []; // Cast to User[]
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // console.error('Error fetching user by ID:', error); // Log is fine, but throwing might be better for query hook
      return null;
    }

    return (data as User) || null; // Cast to User
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};

export const countTotalUsers = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Error counting total users:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in countTotalUsers:', error);
    return 0;
  }
};

export const getUsersWithPagination = async (page: number, pageSize: number): Promise<{ users: User[], totalCount: number }> => {
  try {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching users with pagination:', error);
      throw error;
    }

    const totalCount = count || 0;

    return { users: (data as User[]) || [], totalCount }; // Cast to User[]
  } catch (error) {
    console.error('Error in getUsersWithPagination:', error);
    return { users: [], totalCount: 0 };
  }
};

// Get user payment history
export const getUserPayments = async (userId: string): Promise<Payment[]> => {
  try {
    // This is a placeholder implementation.
    // You'll need a 'payments' table in your Supabase schema with appropriate columns.
    // Example: id, user_id, date, amount, method, status
    console.warn(`getUserPayments is a placeholder. No 'payments' table interaction is implemented yet for user ${userId}.`);
    // const { data, error } = await supabase
    //   .from('payments') // Assuming 'payments' table exists
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false });

    // if (error) {
    //   console.error('Error fetching payment history:', error);
    //   throw error;
    // }
    // return (data as Payment[]) || [];
    return Promise.resolve([]); // Return empty array for now
  } catch (error) {
    console.error('Error in getUserPayments:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, profileData: UserProfileUpdateData): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    if (!data) {
      throw new Error('User profile not found after update');
    }

    return data as User; // Cast to User
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // This typically means a soft delete or an actual deletion.
    // For now, let's assume it's an actual deletion from profiles.
    // If it's a different kind of "delete" (e.g., auth user), adjust accordingly.
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    // Consider re-throwing or handling more gracefully
  }
};

export const banUser = async (userId: string): Promise<void> => {
  try {
    // Since 'is_banned' column doesn't exist, we'll set subscription_status to 'inactive'.
    // This is an approximation of "banning".
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: 'inactive' as SubscriptionStatus })
      .eq('id', userId);

    if (error) {
      console.error('Error banning user (setting status to inactive):', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in banUser:', error);
  }
};

export const unbanUser = async (userId: string): Promise<void> => {
  try {
    // Reverses the "ban" by setting subscription_status back to 'active'.
    // This might need more complex logic based on the user's previous actual status.
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' as SubscriptionStatus })
      .eq('id', userId);

    if (error) {
      console.error('Error unbanning user (setting status to active):', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in unbanUser:', error);
  }
};

export const changeUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in changeUserRole:', error);
  }
};

export const updateUserTrialStatus = async (
  userId: string,
  trialStatus: TrialStatus,
  trialEndDate?: string | null
): Promise<void> => {
  try {
    const updates: { trial_status: TrialStatus; trial_end_date?: string | null } = {
      trial_status: trialStatus,
    };

    // Only include trial_end_date if it's explicitly provided (even if null)
    if (typeof trialEndDate !== 'undefined') {
      updates.trial_end_date = trialEndDate;
    }


    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user trial status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateUserTrialStatus:', error);
  }
};

export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', `%${searchTerm}%`) // Assuming full_name exists
      // .or(`email.ilike.%${searchTerm}%`) // Example if you want to search email too
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      throw error;
    }

    return (data as User[]) || []; // Cast to User[]
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return [];
  }
};

export const getRecentRegistrations = async (days: number = 7): Promise<User[]> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateISO = cutoffDate.toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', cutoffDateISO)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent registrations:', error);
      throw error;
    }

    return (data as User[]) || []; // Cast to User[]
  } catch (error) {
    console.error('Error in getRecentRegistrations:', error);
    return [];
  }
};

export const setUserLastLogin = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error setting user last login:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in setUserLastLogin:', error);
  }
};

// Function to update subscription details
export const updateSubscription = async (userId: string, subscriptionType: SubscriptionType, subscriptionStatus: SubscriptionStatus): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_type: subscriptionType,
        subscription_status: subscriptionStatus 
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    throw error;
  }
};

// Function to "deactivate" a user (e.g., set subscription to inactive)
export const deactivateUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: 'inactive' as SubscriptionStatus }) // Mark as inactive
      .eq('id', userId);

    if (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deactivateUser:', error);
    throw error;
  }
};

// Commenting out unused/undefined type related functions for now
// export const recordSubscriptionEvent = async ( ... )
// export const logUserActivity = async ( ... )
// export const getUserActivityLog = async ( ... )

