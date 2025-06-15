
import { supabase } from '@/integrations/supabase/client';
import { isCurrentUserAdmin } from './adminSecurityService';

export interface ReportData {
  totalUsers: number;
  activeUsers: number;
  totalSuppliers: number;
  activeSuppliers: number;
  totalReviews: number;
  averageRating: number;
  loginStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export const getReportData = async (): Promise<ReportData> => {
  console.log('🔍 Fetching report data...');
  
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.warn('⚠️ User is not admin, returning empty report data');
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalSuppliers: 0,
      activeSuppliers: 0,
      totalReviews: 0,
      averageRating: 0,
      loginStats: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      }
    };
  }

  try {
    // Get user counts
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    if (usersError) {
      console.error('❌ Error fetching users count:', usersError);
    }

    // Get supplier counts
    const { data: suppliersData, error: suppliersError } = await supabase
      .from('suppliers')
      .select('id, hidden', { count: 'exact' });

    if (suppliersError) {
      console.error('❌ Error fetching suppliers:', suppliersError);
    }

    const activeSuppliers = suppliersData?.filter(s => !s.hidden).length || 0;

    // Get reviews data
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating', { count: 'exact' });

    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError);
    }

    const averageRating = reviewsData && reviewsData.length > 0 
      ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length 
      : 0;

    // Get login stats
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const loginQueries = await Promise.allSettled([
      supabase
        .from('login_logs')
        .select('id', { count: 'exact' })
        .eq('success', true)
        .gte('attempted_at', todayStart.toISOString()),
      
      supabase
        .from('login_logs')
        .select('id', { count: 'exact' })
        .eq('success', true)
        .gte('attempted_at', weekStart.toISOString()),
      
      supabase
        .from('login_logs')
        .select('id', { count: 'exact' })
        .eq('success', true)
        .gte('attempted_at', monthStart.toISOString())
    ]);

    const loginStats = {
      today: loginQueries[0].status === 'fulfilled' ? (loginQueries[0].value.data?.length || 0) : 0,
      thisWeek: loginQueries[1].status === 'fulfilled' ? (loginQueries[1].value.data?.length || 0) : 0,
      thisMonth: loginQueries[2].status === 'fulfilled' ? (loginQueries[2].value.data?.length || 0) : 0,
    };

    const reportData: ReportData = {
      totalUsers: usersData?.length || 0,
      activeUsers: usersData?.length || 0, // Simplified - all users are considered active
      totalSuppliers: suppliersData?.length || 0,
      activeSuppliers,
      totalReviews: reviewsData?.length || 0,
      averageRating: Number(averageRating.toFixed(1)),
      loginStats
    };

    console.log('✅ Report data:', reportData);
    return reportData;

  } catch (error) {
    console.error('❌ Error getting report data:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalSuppliers: 0,
      activeSuppliers: 0,
      totalReviews: 0,
      averageRating: 0,
      loginStats: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      }
    };
  }
};

export const getGrowthData = async (days: number = 30) => {
  console.log('🔍 Fetching growth data for', days, 'days...');
  
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.warn('⚠️ User is not admin, returning empty growth data');
    return [];
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching growth data:', error);
      return [];
    }

    // Group by day
    const growthByDay = (data || []).reduce((acc, profile) => {
      const date = new Date(profile.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(growthByDay).map(([date, count]) => ({
      date,
      users: count
    }));

    console.log('✅ Growth data:', result);
    return result;

  } catch (error) {
    console.error('❌ Error getting growth data:', error);
    return [];
  }
};
