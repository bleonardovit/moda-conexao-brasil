import { supabase } from '@/integrations/supabase/client';
// import { Payment, SubscriptionEvent } from '@/types'; // Types 'Payment' and 'SubscriptionEvent' are not exported from @/types
import type { User, TrialStatus } from '@/types/user';
import { UserProfileUpdate } from '@/lib/validators/user-profile';


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

    return data || [];
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
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return data || null;
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

    return { users: data || [], totalCount };
  } catch (error) {
    console.error('Error in getUsersWithPagination:', error);
    return { users: [], totalCount: 0 };
  }
};

// // Get user payment history - Commenting out as 'Payment' type is not defined
// export const getUserPaymentHistory = async (userId: string): Promise<Payment[]> => {
//   try {
//     const { data, error } = await supabase
//       .from('payments') // Assuming 'payments' table exists
//       .select('*')
//       .eq('user_id', userId)
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error fetching payment history:', error);
//       throw error;
//     }
//     return data || [];
//   } catch (error) {
//     console.error('Error in getUserPaymentHistory:', error);
//     throw error;
//   }
// };

export const updateUserProfile = async (userId: string, profileData: Partial<UserProfileUpdate>): Promise<User> => {
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
      throw new Error('User profile not found');
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
  }
};

export const banUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId);

    if (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in banUser:', error);
  }
};

export const unbanUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false })
      .eq('id', userId);

    if (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in unbanUser:', error);
  }
};

export const changeUserRole = async (userId: string, newRole: 'user' | 'admin' | 'moderator'): Promise<void> => {
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

    if (trialEndDate) {
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
      .ilike('full_name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      throw error;
    }

    return data || [];
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

    return data || [];
  } catch (error) {
    console.error('Error in getRecentRegistrations:', error);
    return [];
  }
};

// // Record a subscription event - Commenting out as 'SubscriptionEvent' type is not defined and 'subscription_events' table might not exist
// export const recordSubscriptionEvent = async (
//   userId: string,
//   eventType: string,
//   eventData: any
// ): Promise<SubscriptionEvent> => {
//   try {
//     const { data, error } = await supabase
//       .from('subscription_events') // Assuming 'subscription_events' table exists
//       .insert([{ user_id: userId, event_type: eventType, event_data: eventData, created_at: new Date().toISOString() }])
//       .select()
//       .single();

//     if (error) {
//       console.error('Error recording subscription event:', error);
//       throw error;
//     }
//     return data;
//   } catch (error) {
//     console.error('Error in recordSubscriptionEvent:', error);
//     throw error;
//   }
// };


// // Log user activity - Commenting out as 'activity_log' table might not exist
// export const logUserActivity = async (
//   userId: string,
//   activityType: string,
//   details?: any
// ): Promise<void> => {
//   try {
//     const { error } = await supabase
//       .from('activity_log') // Assuming 'activity_log' table exists
//       .insert([{ user_id: userId, activity_type: activityType, details, timestamp: new Date().toISOString() }]);

//     if (error) {
//       console.error('Error logging user activity:', error);
//     }
//   } catch (error) {
//     console.error('Error in logUserActivity:', error);
//   }
// };


// // Get user activity log - Commenting out as 'activity_log' table might not exist
// export const getUserActivityLog = async (userId: string, limit: number = 50): Promise<any[]> => {
//   try {
//     const { data, error } = await supabase
//       .from('activity_log') // Assuming 'activity_log' table exists
//       .select('*')
//       .eq('user_id', userId)
//       .order('timestamp', { ascending: false })
//       .limit(limit);

//     if (error) {
//       console.error('Error fetching user activity log:', error);
//       throw error;
//     }
//     return data || [];
//   } catch (error) {
//     console.error('Error in getUserActivityLog:', error);
//   }
// };

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
