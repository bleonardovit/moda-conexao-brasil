import { supabase } from '@/integrations/supabase/client';
import { ActiveSession, BlockedIP, DailyLoginStat, LoginLog, LoginStats, SecuritySetting } from '@/types';
import { executeAdminQuery, isCurrentUserAdmin } from './adminSecurityService';

// Get active sessions with user details
export const getActiveSessions = async (): Promise<ActiveSession[]> => {
  console.log('🔍 Fetching active sessions...');
  
  return executeAdminQuery(
    async () => {
      const { data: sessions, error } = await supabase
        .from('active_sessions')
        .select('*')
        .order('last_active', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching active sessions:', error);
        throw error;
      }
      
      if (!sessions) {
        console.warn('⚠️ No sessions data returned');
        return { data: [], error: null };
      }
      
      console.log(`✅ Found ${sessions.length} active sessions`);
      
      // Fetch user details for each session
      const sessionsWithUserData = await Promise.all(
        sessions.map(async (session) => {
          try {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', session.user_id)
              .single();
              
            return {
              ...session,
              full_name: userData?.full_name || 'Unknown',
              user_email: `user-${session.user_id.substring(0, 8)}@system.local`
            };
          } catch (err) {
            console.warn('⚠️ Error fetching user data for session:', session.user_id, err);
            return {
              ...session,
              full_name: 'Unknown',
              user_email: `user-${session.user_id.substring(0, 8)}@system.local`
            };
          }
        })
      );
      
      return { data: sessionsWithUserData, error: null };
    },
    []
  );
};

// Get login logs with filtering options
export const getLoginLogs = async (
  page = 1, 
  pageSize = 10, 
  filters: { 
    userEmail?: string, 
    ipAddress?: string, 
    success?: boolean, 
    startDate?: string, 
    endDate?: string 
  } = {}
): Promise<{ data: LoginLog[], count: number }> => {
  console.log('🔍 Fetching login logs...', { page, pageSize, filters });
  
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.warn('⚠️ User is not admin, returning empty login logs');
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('login_logs')
      .select('*', { count: 'exact' });
      
    // Apply filters
    if (filters.userEmail) {
      query = query.ilike('user_email', `%${filters.userEmail}%`);
    }
    
    if (filters.ipAddress) {
      query = query.eq('ip_address', filters.ipAddress);
    }
    
    if (filters.success !== undefined) {
      query = query.eq('success', filters.success);
    }
    
    if (filters.startDate) {
      query = query.gte('attempted_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('attempted_at', filters.endDate);
    }
    
    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query
      .order('attempted_at', { ascending: false })
      .range(from, to);
      
    if (error) {
      console.error('❌ Error fetching login logs:', error);
      return { data: [], count: 0 };
    }
    
    console.log(`✅ Found ${data?.length || 0} login logs (total: ${count})`);
    
    return {
      data: data || [],
      count: count || 0
    };
  } catch (error) {
    console.error('❌ Error in getLoginLogs:', error);
    return { data: [], count: 0 };
  }
};

// Get blocked IPs
export const getBlockedIPs = async (): Promise<BlockedIP[]> => {
  console.log('🔍 Fetching blocked IPs...');
  
  return executeAdminQuery(
    async () => {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });
        
      if (error) {
        console.error('❌ Error fetching blocked IPs:', error);
        throw error;
      }
      
      console.log(`✅ Found ${data?.length || 0} blocked IPs`);
      return { data: data || [], error: null };
    },
    []
  );
};

// Manually block an IP
export const blockIP = async (
  ipAddress: string, 
  reason: string, 
  durationMinutes: number
): Promise<boolean> => {
  try {
    const blockUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('blocked_ips')
      .insert({
        ip_address: ipAddress,
        blocked_until: blockUntil,
        reason: reason,
        attempts_count: 0
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error blocking IP:', error);
    return false;
  }
};

// Unblock an IP
export const unblockIP = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('blocked_ips')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error unblocking IP:', error);
    return false;
  }
};

// Get security settings
export const getSecuritySettings = async (): Promise<SecuritySetting[]> => {
  console.log('🔍 Fetching security settings...');
  
  return executeAdminQuery(
    async () => {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*');
        
      if (error) {
        console.error('❌ Error fetching security settings:', error);
        throw error;
      }
      
      console.log(`✅ Found ${data?.length || 0} security settings`);
      return { data: data || [], error: null };
    },
    []
  );
};

// Update security setting
export const updateSecuritySetting = async (
  id: number, 
  value: string, 
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('security_settings')
      .update({
        value: value,
        updated_at: new Date().toISOString(),
        updated_by: userId
      })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating security setting:', error);
    return false;
  }
};

// Get login statistics
export const getLoginStats = async (days = 7): Promise<LoginStats> => {
  console.log('🔍 Fetching login stats for', days, 'days...');
  
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.warn('⚠️ User is not admin, returning empty stats');
    return {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      uniqueIPs: 0,
      blockedIPs: 0
    };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get total logins in period
    const { data: totalLoginsData, error: totalError } = await supabase
      .from('login_logs')
      .select('id', { count: 'exact' })
      .gte('attempted_at', startDate.toISOString());
      
    if (totalError) {
      console.error('❌ Error fetching total logins:', totalError);
      throw totalError;
    }
    
    // Get successful logins in period
    const { data: successfulLoginsData, error: successError } = await supabase
      .from('login_logs')
      .select('id', { count: 'exact' })
      .eq('success', true)
      .gte('attempted_at', startDate.toISOString());
      
    if (successError) {
      console.error('❌ Error fetching successful logins:', successError);
      throw successError;
    }
    
    // Get failed logins in period
    const { data: failedLoginsData, error: failedError } = await supabase
      .from('login_logs')
      .select('id', { count: 'exact' })
      .eq('success', false)
      .gte('attempted_at', startDate.toISOString());
      
    if (failedError) {
      console.error('❌ Error fetching failed logins:', failedError);
      throw failedError;
    }
    
    // Get unique IPs
    const { data: uniqueIPsData, error: uniqueIPsError } = await supabase
      .from('login_logs')
      .select('ip_address')
      .gte('attempted_at', startDate.toISOString());
      
    if (uniqueIPsError) {
      console.error('❌ Error fetching unique IPs:', uniqueIPsError);
      throw uniqueIPsError;
    }
    
    const uniqueIPs = new Set(uniqueIPsData?.map(log => log.ip_address)).size;
    
    // Get blocked IPs
    const { data: blockedIPsData, error: blockedError } = await supabase
      .from('blocked_ips')
      .select('id', { count: 'exact' });
      
    if (blockedError) {
      console.error('❌ Error fetching blocked IPs count:', blockedError);
      throw blockedError;
    }
    
    const stats = {
      totalLogins: totalLoginsData?.length || 0,
      successfulLogins: successfulLoginsData?.length || 0,
      failedLogins: failedLoginsData?.length || 0,
      uniqueIPs: uniqueIPs,
      blockedIPs: blockedIPsData?.length || 0
    };
    
    console.log('✅ Login stats:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error getting login stats:', error);
    return {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      uniqueIPs: 0,
      blockedIPs: 0
    };
  }
};

// Get daily login stats for a chart
export const getDailyLoginStats = async (days = 7): Promise<DailyLoginStat[]> => {
  console.log('🔍 Fetching daily login stats for', days, 'days...');
  
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.warn('⚠️ User is not admin, returning empty daily stats');
    return [];
  }

  try {
    const result: DailyLoginStat[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      try {
        // Get total logs for this day
        const { data: totalLogs, error: totalError } = await supabase
          .from('login_logs')
          .select('id', { count: 'exact' })
          .gte('attempted_at', startOfDay.toISOString())
          .lte('attempted_at', endOfDay.toISOString());
          
        if (totalError) throw totalError;
        
        // Get successful logs for this day
        const { data: successLogs, error: successError } = await supabase
          .from('login_logs')
          .select('id', { count: 'exact' })
          .eq('success', true)
          .gte('attempted_at', startOfDay.toISOString())
          .lte('attempted_at', endOfDay.toISOString());
          
        if (successError) throw successError;
        
        // Get failed logs for this day
        const { data: failedLogs, error: failedError } = await supabase
          .from('login_logs')
          .select('id', { count: 'exact' })
          .eq('success', false)
          .gte('attempted_at', startOfDay.toISOString())
          .lte('attempted_at', endOfDay.toISOString());
          
        if (failedError) throw failedError;
        
        result.push({
          date: date.toISOString().split('T')[0],
          total: totalLogs?.length || 0,
          successful: successLogs?.length || 0,
          failed: failedLogs?.length || 0
        });
      } catch (dayError) {
        console.warn(`⚠️ Error getting stats for ${date.toDateString()}:`, dayError);
        result.push({
          date: date.toISOString().split('T')[0],
          total: 0,
          successful: 0,
          failed: 0
        });
      }
    }
    
    console.log('✅ Daily login stats:', result);
    return result;
  } catch (error) {
    console.error('❌ Error getting daily login stats:', error);
    return [];
  }
};

// Export login logs to CSV
export const exportLoginLogsToCSV = async (filters: any = {}): Promise<string> => {
  try {
    let query = supabase
      .from('login_logs')
      .select('*');
      
    // Apply filters
    if (filters.userEmail) {
      query = query.ilike('user_email', `%${filters.userEmail}%`);
    }
    
    if (filters.ipAddress) {
      query = query.eq('ip_address', filters.ipAddress);
    }
    
    if (filters.success !== undefined) {
      query = query.eq('success', filters.success);
    }
    
    if (filters.startDate) {
      query = query.gte('attempted_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('attempted_at', filters.endDate);
    }
    
    const { data, error } = await query.order('attempted_at', { ascending: false });
    
    if (error) throw error;
    if (!data || data.length === 0) return '';
    
    // Create CSV header
    let csv = 'ID,User ID,User Email,IP Address,Success,Attempted At\n';
    
    // Add data rows
    data.forEach(log => {
      csv += `${log.id},${log.user_id || ''},${log.user_email || ''},${log.ip_address},${log.success},${log.attempted_at}\n`;
    });
    
    return csv;
  } catch (error) {
    console.error('Error exporting login logs to CSV:', error);
    return '';
  }
};
