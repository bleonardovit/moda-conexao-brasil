import { supabase } from "@/integrations/supabase/client";

// Types for statistics
export interface UserStatistics {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  growthRate: number;
  activeUsers: number[]; // This is daily active users for the last 7 days
  monthlyGrowth: Array<{month: string, users: number}>;
}

export interface SupplierStatistics {
  totalSuppliers: number;
  newSuppliers: number; // New in last 30 days
  topSuppliers: Array<{id: string, name: string, views: number}>;
  byCategories: Array<{category: string, views: number}>;
  byState: Array<{state: string, count: number, percentage: number, growth: number}>;
}

export interface ConversionStatistics {
  visitToRegister: number; // Remains estimated
  registerToSubscription: number; // Users with active subscription / total users
  visitToSubscription: number; // Remains estimated
  churnRate: number; // (Expired or Cancelled Subscriptions) / (Active + Expired/Cancelled Subscriptions)
  retentionRates: { // These are general platform retention, not cohort-specific
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
    annual: number;
  };
  trialToPaidRate: number; // New: (Converted Trials) / (Converted Trials + Expired Trials not Converted)
  blockedFreeUsers: number; // New: Count of users with trial_status = 'expired' and not subscribed
}

export interface ReportData {
  users: UserStatistics;
  suppliers: SupplierStatistics;
  conversions: ConversionStatistics;
  totalLogins: number;
  subscriptionDistribution: Array<{name: string, value: number}>;
  regionData: {
    users: Array<{state: string, count: number, percentage: number, growth: number}>;
    suppliers: Array<{state: string, count: number, percentage: number, growth: number}>;
    conversions: Array<{state: string, rate: number, change: number}>; // This will remain somewhat mock/estimated
  };
  cohortData: Array<{
    month: string;
    cohortSize: number; // Added cohort size for clarity
    m0: number; // %
    m1: number | null; // %
    m2: number | null; // %
    m3: number | null; // %
    m4: number | null; // %
    m5: number | null; // %
  }>;
}

// Fetch real user statistics from Supabase
export async function getUserStatistics(): Promise<UserStatistics> {
  try {
    // Get total users count
    const { count: totalUsers, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get new users in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: newUsersLast7Days, error: new7Error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (new7Error) throw new7Error;

    // Get new users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: newUsersLast30Days, error: new30Error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (new30Error) throw new30Error;

    // Calculate growth rate (comparing last 7 days to previous 7 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const { count: previousPeriodUsers, error: prevError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fourteenDaysAgo.toISOString())
      .lt('created_at', sevenDaysAgo.toISOString());

    if (prevError) throw prevError;

    const growthRate = previousPeriodUsers > 0 
      ? (((newUsersLast7Days || 0) - (previousPeriodUsers || 0)) / previousPeriodUsers) * 100 
      : (newUsersLast7Days || 0) > 0 ? 100 : 0; // Handle case where previousPeriodUsers is 0

    // Get login activity for active users estimation (daily for last 7 days)
    // For true daily active users, we'd need a logins table with timestamps.
    // We'll use `last_login` for a proxy of users active on a given day.
    const activeUsersData: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const { count, error: activeError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('last_login', startOfDay.toISOString())
        .lte('last_login', endOfDay.toISOString());
      
      if (activeError) {
        console.error(`Error fetching active users for day ${i}:`, activeError);
        activeUsersData.push(0);
      } else {
        activeUsersData.push(count || 0);
      }
    }
    
    // Generate monthly growth data based on real profile creation dates
    const monthlyGrowthData = [];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = currentDate.getMonth() - i;
      const year = currentDate.getFullYear();
      const adjustedMonth = month < 0 ? month + 12 : month;
      const adjustedYear = month < 0 ? year - 1 : year;
      
      const startOfMonth = new Date(adjustedYear, adjustedMonth, 1);
      const endOfMonth = new Date(adjustedYear, adjustedMonth + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999); // Ensure end of day
      
      const { count: monthUsers, error: monthError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());
      
      if (monthError) {
        console.error("Error getting monthly user data:", monthError);
        monthlyGrowthData.push({
          month: monthNames[adjustedMonth],
          users: 0
        });
      } else {
        monthlyGrowthData.push({
          month: monthNames[adjustedMonth],
          users: monthUsers || 0
        });
      }
    }

    return {
      totalUsers: totalUsers || 0,
      newUsersLast7Days: newUsersLast7Days || 0,
      newUsersLast30Days: newUsersLast30Days || 0,
      growthRate: parseFloat(growthRate.toFixed(1)),
      activeUsers: activeUsersData,
      monthlyGrowth: monthlyGrowthData
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    // Return fallback data if queries fail
    return {
      totalUsers: 0,
      newUsersLast7Days: 0,
      newUsersLast30Days: 0,
      growthRate: 0,
      activeUsers: Array(7).fill(0),
      monthlyGrowth: []
    };
  }
}

// Fetch supplier statistics
export async function getSupplierStatistics(): Promise<SupplierStatistics> {
  try {
    // Get total suppliers count
    const { count: totalSuppliers, error: countError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get new suppliers in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: newSuppliers, error: newError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (newError) throw newError;

    // Get top suppliers (this would ideally be based on actual view/click metrics)
    // For this example, we're getting featured suppliers as a proxy for "popular"
    const { data: topSupplierData, error: topError } = await supabase
      .from('suppliers')
      .select('id, name, featured') // Assuming 'views' is not a real column, using featured as proxy
      .order('created_at', { ascending: false }) // Example: order by creation date if no views
      .limit(5); // Increased to 5

    if (topError) throw topError;

    // Transform supplier data to include view count (mock data for now, or use a real field if available)
    const topSuppliers = topSupplierData?.map((supplier, index) => {
      // Generate view counts that decrease by position
      const baseViews = 1000 - index * 100;
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      return {
        id: supplier.id,
        name: supplier.name,
        // If there's a real views column, use it: supplier.views_count || Math.floor(baseViews * randomFactor)
        views: Math.floor(baseViews * randomFactor) 
      };
    }) || [];

    // Get categories from supplier_categories table and count
    const { data: categoryData, error: categoryError } = await supabase
      .from('suppliers_categories')
      .select(`
        category_id,
        categories (
          name
        )
      `);

    if (categoryError) throw categoryError;

    // Count occurrences of each category
    const categoryCounts: Record<string, number> = {};
    categoryData?.forEach(item => {
      if (item.categories?.name) {
        const categoryName = item.categories.name;
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      }
    });

    // Convert to category view data format
    const byCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        views: count * 50 + Math.floor(Math.random() * 50) // Mock views based on supplier count
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5); 

    // Get supplier count by state
    const { data: suppliersByStateRaw, error: stateError } = await supabase
      .from('suppliers')
      .select('state');
    
    if (stateError) throw stateError;

    const stateCounts: Record<string, number> = {};
    suppliersByStateRaw?.forEach(supplier => {
      if (supplier.state) {
        stateCounts[supplier.state] = (stateCounts[supplier.state] || 0) + 1;
      }
    });

    const totalStateSuppliers = Object.values(stateCounts).reduce((sum, count) => sum + count, 0);
    const byState = Object.entries(stateCounts)
      .map(([state, count]) => {
        const percentage = totalStateSuppliers > 0 ? (count / totalStateSuppliers) * 100 : 0;
        const growth = (Math.random() * 12 - 2); // Mock growth
        
        return {
          state,
          count,
          percentage: parseFloat(percentage.toFixed(1)),
          growth: parseFloat(growth.toFixed(1))
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSuppliers: totalSuppliers || 0,
      newSuppliers: newSuppliers || 0,
      topSuppliers,
      byCategories,
      byState
    };
  } catch (error) {
    console.error("Error fetching supplier statistics:", error);
    return {
      totalSuppliers: 0,
      newSuppliers: 0,
      topSuppliers: [],
      byCategories: [],
      byState: []
    };
  }
}

// Calculate conversion statistics based on available data
export async function getConversionStatistics(): Promise<ConversionStatistics> {
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, subscription_status, trial_status, created_at');

    if (profilesError) throw profilesError;
    if (!profiles) {
        throw new Error("Could not fetch profiles for conversion stats");
    }

    const totalProfiles = profiles.length;
    const subscribedProfiles = profiles.filter(p => p.subscription_status === 'active').length;
    
    const convertedTrials = profiles.filter(p => p.trial_status === 'converted').length;
    const expiredTrialsNotConverted = profiles.filter(p => p.trial_status === 'expired' && p.subscription_status !== 'active').length;
    const blockedFreeUsers = expiredTrialsNotConverted; // Definition of "blocked"

    const trialToPaidRate = (convertedTrials + expiredTrialsNotConverted) > 0
      ? (convertedTrials / (convertedTrials + expiredTrialsNotConverted)) * 100
      : 0;

    const registerToSubscription = totalProfiles > 0 
      ? (subscribedProfiles / totalProfiles) * 100 
      : 0;
    
    const estimatedVisits = totalProfiles * 10; // This remains an estimation
    const visitToRegister = estimatedVisits > 0 
      ? (totalProfiles / estimatedVisits) * 100 
      : 0;
    
    const visitToSubscription = estimatedVisits > 0 
      ? (subscribedProfiles / estimatedVisits) * 100 
      : 0;
    
    const cancelledOrExpiredSubscriptions = profiles.filter(
      p => p.subscription_status === 'expired' || p.subscription_status === 'canceled' // Assuming 'canceled' status exists
    ).length;
    
    const churnRateBase = subscribedProfiles + cancelledOrExpiredSubscriptions;
    const churnRate = churnRateBase > 0 
      ? (cancelledOrExpiredSubscriptions / churnRateBase) * 100 
      : 0;
    
    // Simplified retention rates (these are not cohort-based yet, but general platform rates)
    // For more accurate retention, we need to track users over time from their signup date.
    // This is a placeholder for general platform health, true cohort retention is in getCohortData.
    const baseRetention = 80.0; // Adjusted base retention assumption

    return {
      visitToRegister: parseFloat(visitToRegister.toFixed(1)),
      registerToSubscription: parseFloat(registerToSubscription.toFixed(1)),
      visitToSubscription: parseFloat(visitToSubscription.toFixed(1)),
      churnRate: parseFloat(churnRate.toFixed(1)),
      retentionRates: { // These are mock general retention rates
        thirtyDays: baseRetention,
        sixtyDays: baseRetention - 10,
        ninetyDays: baseRetention - 20,
        annual: baseRetention - 35
      },
      trialToPaidRate: parseFloat(trialToPaidRate.toFixed(1)),
      blockedFreeUsers: blockedFreeUsers,
    };
  } catch (error) {
    console.error("Error calculating conversion statistics:", error);
    return {
      visitToRegister: 0,
      registerToSubscription: 0,
      visitToSubscription: 0,
      churnRate: 0,
      retentionRates: { thirtyDays: 0, sixtyDays: 0, ninetyDays: 0, annual: 0 },
      trialToPaidRate: 0,
      blockedFreeUsers: 0,
    };
  }
}

// Get regional distribution of users and suppliers
export async function getRegionalData() {
  try {
    // Get user counts by state from 'profiles' table
    const { data: userProfiles, error: userStateError } = await supabase
      .from('profiles')
      .select('state');
    
    if (userStateError) throw userStateError;

    const userStateCounts: Record<string, number> = {};
    userProfiles?.forEach(profile => {
      if (profile.state && profile.state.trim() !== "") {
        userStateCounts[profile.state] = (userStateCounts[profile.state] || 0) + 1;
      } else {
        userStateCounts["Não informado"] = (userStateCounts["Não informado"] || 0) + 1;
      }
    });
    
    const totalUsersWithState = Object.values(userStateCounts).reduce((sum, count) => sum + count, 0);
    const usersData = Object.entries(userStateCounts)
      .map(([state, count]) => {
        const percentage = totalUsersWithState > 0 ? (count / totalUsersWithState) * 100 : 0;
        const growth = parseFloat((Math.random() * 12 - 2).toFixed(1)); // Mock growth
        return {
          state,
          count,
          percentage: parseFloat(percentage.toFixed(1)),
          growth
        };
      })
      .sort((a,b) => b.count - a.count) // Sort by count
      .slice(0, 10); // Top 10 states or all if less

    // Get supplier counts by state (already calculated in getSupplierStatistics, reuse part of its logic)
    const { byState: suppliersData } = await getSupplierStatistics(); // This already returns formatted data

    // Generate conversion data by state using the same states (still mock)
    const topUserStates = usersData.map(ud => ud.state).slice(0,5);
    const conversionData = topUserStates.map((state) => {
        return {
          state,
          rate: parseFloat((8 + Math.random() * 8).toFixed(1)), // 8-16% conversion rate
          change: parseFloat((-2 + Math.random() * 4).toFixed(1)) // -2 to +2% change
        };
      });

    return {
      users: usersData,
      suppliers: suppliersData, // This is already top 5 from getSupplierStatistics
      conversions: conversionData
    };
  } catch (error) {
    console.error("Error fetching regional data:", error);
    return {
      users: [],
      suppliers: [],
      conversions: []
    };
  }
}

// Generate cohort analysis data
export async function getCohortData(): Promise<ReportData['cohortData']> {
  try {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentDate = new Date();
    const cohortsResult: ReportData['cohortData'] = [];

    // Fetch all profiles with necessary fields for cohort analysis
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, created_at, subscription_status, last_login, trial_end_date'); // Added trial_end_date

    if (profilesError) {
      console.error("Error fetching profiles for cohort data:", profilesError);
      return [];
    }
    if (!allProfiles) return [];

    for (let i = 5; i >= 0; i--) { // Last 6 months
      const cohortMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const cohortMonthStart = new Date(cohortMonthDate.getFullYear(), cohortMonthDate.getMonth(), 1);
      const cohortMonthEnd = new Date(cohortMonthDate.getFullYear(), cohortMonthDate.getMonth() + 1, 0);
      cohortMonthEnd.setHours(23, 59, 59, 999);

      const cohortUsers = allProfiles.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= cohortMonthStart && createdAt <= cohortMonthEnd;
      });

      const cohortSize = cohortUsers.length;
      if (cohortSize === 0) {
        cohortsResult.push({
          month: `${monthNames[cohortMonthDate.getMonth()]} ${cohortMonthDate.getFullYear()}`,
          cohortSize: 0, m0: 0, m1: null, m2: null, m3: null, m4: null, m5: null,
        });
        continue;
      }

      const retentionMonths = [100]; // M0 is always 100%

      for (let monthOffset = 1; monthOffset <= 5; monthOffset++) {
        if (i < monthOffset) { // Cohort is too recent to have data for this month offset
          retentionMonths.push(null);
          continue;
        }

        const checkMonthStart = new Date(cohortMonthStart.getFullYear(), cohortMonthStart.getMonth() + monthOffset, 1);
        const checkMonthEnd = new Date(cohortMonthStart.getFullYear(), cohortMonthStart.getMonth() + monthOffset + 1, 0);
        checkMonthEnd.setHours(23,59,59,999);

        let retainedUsers = 0;
        cohortUsers.forEach(user => {
          // Condition for being retained: active subscription OR recent login during that month
          // OR if their trial_end_date falls within this month and they are subscribed
          const lastLogin = user.last_login ? new Date(user.last_login) : null;
          const trialEndDate = user.trial_end_date ? new Date(user.trial_end_date) : null;

          const isActiveSubscriber = user.subscription_status === 'active';
          const loggedInThisMonth = lastLogin && lastLogin >= checkMonthStart && lastLogin <= checkMonthEnd;
          
          // A more robust check might involve looking at subscription history if available.
          // For now, being an active subscriber at any point or logging in during the check month.
          // This is an approximation.
          if (isActiveSubscriber || loggedInThisMonth) {
             // A simple check: if they are 'active' now, assume they were active.
             // A more accurate check would be: was subscription_status 'active' during checkMonthStart to checkMonthEnd?
             // This requires subscription history which we don't have.
             // So, if user.subscription_status === 'active' now, or they logged in during checkMonth, count as retained.
             // This is an approximation.
            retainedUsers++;
          }
        });
        retentionMonths.push(parseFloat(((retainedUsers / cohortSize) * 100).toFixed(1)));
      }
      
      cohortsResult.push({
        month: `${monthNames[cohortMonthDate.getMonth()]} ${cohortMonthDate.getFullYear()}`,
        cohortSize,
        m0: retentionMonths[0],
        m1: retentionMonths[1],
        m2: retentionMonths[2],
        m3: retentionMonths[3],
        m4: retentionMonths[4],
        m5: retentionMonths[5],
      });
    }
    return cohortsResult.reverse(); // Show newest cohorts first in table, or oldest? User preference. Keep as is for now.
  } catch (error) {
    console.error("Error calculating cohort data:", error);
    return [];
  }
}

// Main function to get all report data
export async function getReportData(
  dateRange: '7days' | '30days' | '90days' | 'year' = '30days',
  categoryFilter: string = 'all', // These filters are not deeply implemented in all sub-functions yet
  locationFilter: string = 'all'  // These filters are not deeply implemented in all sub-functions yet
): Promise<ReportData> {
  try {
    console.log(`Fetching report data with filters: date=${dateRange}, category=${categoryFilter}, location=${locationFilter}`);
    
    const [users, suppliers, conversions, regionData, cohortDataResult] = await Promise.all([
      getUserStatistics(),
      getSupplierStatistics(),
      getConversionStatistics(),
      getRegionalData(),
      getCohortData() // Call the updated getCohortData
    ]);
    
    // Calculate subscription distribution
    // In a real system, this would come from actual subscription data
    const { count: monthlyCount, error: monthlyError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_type', 'monthly')
      .eq('subscription_status', 'active'); // Count only active subscriptions
    
    if (monthlyError) console.error("Error fetching monthly subscriptions:", monthlyError);

    const { count: annualCount, error: annualError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_type', 'annual')
      .eq('subscription_status', 'active'); // Count only active subscriptions

    if (annualError) console.error("Error fetching annual subscriptions:", annualError);
    
    const totalSubscriptions = (monthlyCount || 0) + (annualCount || 0);
    let monthlyPercentage = 0;
    let annualPercentage = 0;
    
    if (totalSubscriptions > 0) {
      monthlyPercentage = Math.round(((monthlyCount || 0) / totalSubscriptions) * 100);
      annualPercentage = 100 - monthlyPercentage;
    } else if (users.totalUsers > 0) { // Fallback if no active subscriptions but users exist
        monthlyPercentage = 65; 
        annualPercentage = 35;
    }
    
    const subscriptionDistribution = [
      { name: 'Mensal', value: monthlyPercentage },
      { name: 'Anual', value: annualPercentage }
    ];

    const totalLogins = users.totalUsers * 7; // This is still a rough estimate
    
    return {
      users,
      suppliers,
      conversions,
      totalLogins,
      subscriptionDistribution,
      regionData,
      cohortData: cohortDataResult // Use the result from the updated function
    };
  } catch (error) {
    console.error("Error fetching report data:", error);
    // Provide a default structure for ReportData on error to prevent app crash
    return {
        users: { totalUsers: 0, newUsersLast7Days: 0, newUsersLast30Days: 0, growthRate: 0, activeUsers: Array(7).fill(0), monthlyGrowth: [] },
        suppliers: { totalSuppliers: 0, newSuppliers: 0, topSuppliers: [], byCategories: [], byState: [] },
        conversions: { visitToRegister: 0, registerToSubscription: 0, visitToSubscription: 0, churnRate: 0, retentionRates: { thirtyDays: 0, sixtyDays: 0, ninetyDays: 0, annual: 0 }, trialToPaidRate: 0, blockedFreeUsers: 0 },
        totalLogins: 0,
        subscriptionDistribution: [{ name: 'Mensal', value: 0 }, { name: 'Anual', value: 0 }],
        regionData: { users: [], suppliers: [], conversions: [] },
        cohortData: []
    };
  }
}

// Function to export report as CSV
export async function exportReportToCSV(
  reportType: string,
  dateRange: string,
  filters: Record<string, string>
): Promise<string> {
  // Log export attempt
  console.log(`Exporting ${reportType} report with date range ${dateRange} and filters:`, filters);
  
  try {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const filename = `relatorio_${reportType}_${dateStr}.csv`;
    
    // In a real app, this would generate and return actual CSV data or trigger download
    // For now, it simulates success.
    // Actual data fetching for CSV should use getReportData or specific queries.
    const dataToExport = await getReportData(dateRange as any, filters.category, filters.location);
    // Here you would format dataToExport into a CSV string.
    // Example: Papa.unparse(dataToExport.users.monthlyGrowth);
    // For brevity, this step is omitted.

    return filename;
  } catch (error) {
    console.error("Error exporting report:", error);
    throw new Error("Falha ao exportar relatório");
  }
}
