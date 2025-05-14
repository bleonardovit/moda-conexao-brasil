import { supabase } from '@/integrations/supabase/client';
import { ActiveSession, BlockedIP, DailyLoginStat, LoginLog, LoginStats, SecuritySetting } from '@/types';

export interface LoginLog {
  id: number;
  user_id: string | null;
  user_email: string | null;
  ip_address: string;
  success: boolean;
  attempted_at: string;
}

export interface ActiveSession {
  id: number;
  user_id: string;
  ip_address: string;
  login_at: string;
  last_active: string;
  user_email?: string;
  full_name?: string;
}

export interface BlockedIP {
  id: number;
  ip_address: string;
  blocked_at: string;
  blocked_until: string;
  reason: string | null;
  attempts_count: number;
}

export interface SecuritySetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface LoginStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueIPs: number;
  blockedIPs: number;
}

export interface DailyLoginStat {
  date: string;
  total: number;
  successful: number;
  failed: number;
}

// Get active sessions with user details
export const getActiveSessions = async (): Promise<ActiveSession[]> => {
  try {
    // Fetch active sessions
    const { data: sessions, error } = await supabase
      .from('active_sessions')
      .select('*')
      .order('last_active', { ascending: false });
    
    if (error) throw error;
    if (!sessions) return [];
    
    // Fetch user details for each session
    const sessionsWithUserData = await Promise.all(
      sessions.map(async (session) => {
        const { data: userData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user_id)
          .single();
          
        // We need to get the email but it's not in the profiles table
        // Let's use a default value with the user ID instead
        return {
          ...session,
          full_name: userData?.full_name || 'Unknown',
          user_email: `user-${session.user_id}@example.com` // Default placeholder email since we can't access auth.users
        };
      })
    );
    
    return sessionsWithUserData;
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return [];
  }
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
      
    if (error) throw error;
    
    return {
      data: data || [],
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching login logs:', error);
    return { data: [], count: 0 };
  }
};

// Get blocked IPs
export const getBlockedIPs = async (): Promise<BlockedIP[]> => {
  try {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .order('blocked_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching blocked IPs:', error);
    return [];
  }
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
  try {
    const { data, error } = await supabase
      .from('security_settings')
      .select('*');
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return [];
  }
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
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get total logins in period
    const { data: totalLoginsData, error: totalError } = await supabase
      .from('login_logs')
      .select('id', { count: 'exact' })
      .gte('attempted_at', startDate.toISOString());
      
    if (totalError) throw totalError;
    
    // Get successful logins in period
    const { data: successfulLoginsData, error: successError } = await supabase
      .from('login_logs')
      .select('id', { count: 'exact' })
      .eq('success', true)
      .gte('attempted_at', startDate.toISOString());
      
    if (successError) throw successError;
    
    // Get failed logins in period
    const { data: failedLoginsData, error: failedError } = await supabase
      .from('login_logs')
      .select('id', { count: 'exact' })
      .eq('success', false)
      .gte('attempted_at', startDate.toISOString());
      
    if (failedError) throw failedError;
    
    // Get unique IPs
    const { data: uniqueIPsData, error: uniqueIPsError } = await supabase
      .from('login_logs')
      .select('ip_address')
      .gte('attempted_at', startDate.toISOString());
      
    if (uniqueIPsError) throw uniqueIPsError;
    
    const uniqueIPs = new Set(uniqueIPsData?.map(log => log.ip_address)).size;
    
    // Get blocked IPs
    const { data: blockedIPsData, error: blockedError } = await supabase
      .from('blocked_ips')
      .select('id', { count: 'exact' });
      
    if (blockedError) throw blockedError;
    
    return {
      totalLogins: totalLoginsData?.length || 0,
      successfulLogins: successfulLoginsData?.length || 0,
      failedLogins: failedLoginsData?.length || 0,
      uniqueIPs: uniqueIPs,
      blockedIPs: blockedIPsData?.length || 0
    };
  } catch (error) {
    console.error('Error getting login stats:', error);
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
    }
    
    return result;
  } catch (error) {
    console.error('Error getting daily login stats:', error);
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
