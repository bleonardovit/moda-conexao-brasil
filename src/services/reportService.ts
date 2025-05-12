
import { supabase } from "@/integrations/supabase/client";

// Types for statistics
export interface UserStatistics {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  growthRate: number;
  activeUsers: number[];
  monthlyGrowth: Array<{month: string, users: number}>;
}

export interface SupplierStatistics {
  totalSuppliers: number;
  newSuppliers: number;
  topSuppliers: Array<{id: string, name: string, views: number}>;
  byCategories: Array<{category: string, views: number}>;
  byState: Array<{state: string, count: number, percentage: number, growth: number}>;
}

export interface ConversionStatistics {
  visitToRegister: number;
  registerToSubscription: number;
  visitToSubscription: number;
  churnRate: number;
  retentionRates: {
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
    annual: number;
  };
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
    conversions: Array<{state: string, rate: number, change: number}>;
  };
  cohortData: Array<{
    month: string;
    m0: number;
    m1: number | null;
    m2: number | null;
    m3: number | null;
    m4: number | null;
    m5: number | null;
  }>;
}

// Fetch user statistics
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

    // Calculate growth rate
    const growthRate = previousPeriodUsers > 0 
      ? ((newUsersLast7Days - previousPeriodUsers) / previousPeriodUsers) * 100 
      : 0;

    // Get active users for the last 7 days
    const activeUsersData: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const currentDay = new Date();
      currentDay.setDate(currentDay.getDate() - i);
      const nextDay = new Date(currentDay);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // In a real system, we would check login data or user activity
      // For now, we'll estimate based on a percentage of total users
      const randomPercentage = 0.3 + Math.random() * 0.15; // Between 30% and 45%
      activeUsersData.push(Math.floor(totalUsers * randomPercentage));
    }

    // Generate monthly growth data for the past 12 months
    const monthlyGrowth = [];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = currentDate.getMonth() - i;
      const year = currentDate.getFullYear();
      const adjustedMonth = month < 0 ? month + 12 : month;
      const adjustedYear = month < 0 ? year - 1 : year;
      
      // This would be a real query in a production system
      // For now, generate realistic-looking growth data
      const baseValue = 78;
      const growthFactor = Math.pow(1.08, i); // 8% compound growth
      
      monthlyGrowth.push({
        month: monthNames[adjustedMonth],
        users: Math.floor(baseValue * growthFactor)
      });
    }

    return {
      totalUsers: totalUsers || 0,
      newUsersLast7Days: newUsersLast7Days || 0,
      newUsersLast30Days: newUsersLast30Days || 0,
      growthRate: parseFloat(growthRate.toFixed(1)),
      activeUsers: activeUsersData,
      monthlyGrowth
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    throw error;
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
    // For now, we're just getting featured suppliers as a proxy for "popular"
    const { data: topSupplierData, error: topError } = await supabase
      .from('suppliers')
      .select('id, name, featured')
      .eq('featured', true)
      .limit(3);

    if (topError) throw topError;

    // Transform supplier data to include view count (mock data)
    const topSuppliers = topSupplierData?.map((supplier, index) => {
      // Generate some random view counts that decrease by position
      const baseViews = 900 - index * 100;
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      return {
        id: supplier.id,
        name: supplier.name,
        views: Math.floor(baseViews * randomFactor)
      };
    }) || [];

    // Get supplier counts by category
    // In a real system this would calculate actual view counts
    const byCategories = [
      { category: "Casual", views: 342 },
      { category: "Fitness", views: 256 },
      { category: "Plus Size", views: 187 },
      { category: "Acessórios", views: 143 },
      { category: "Praia", views: 98 }
    ];

    // Get supplier count by state
    const { data: suppliersByState, error: stateError } = await supabase
      .from('suppliers')
      .select('state');
    
    if (stateError) throw stateError;

    // Count suppliers by state
    const stateCounts: Record<string, number> = {};
    suppliersByState?.forEach(supplier => {
      if (supplier.state) {
        stateCounts[supplier.state] = (stateCounts[supplier.state] || 0) + 1;
      }
    });

    // Convert to the required format and calculate percentages
    const total = Object.values(stateCounts).reduce((sum, count) => sum + count, 0);
    const byState = Object.entries(stateCounts)
      .map(([state, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        // Generate a random growth rate between -2 and +10
        const growth = (Math.random() * 12 - 2).toFixed(1);
        
        return {
          state,
          count,
          percentage: parseFloat(percentage.toFixed(1)),
          growth: parseFloat(growth)
        };
      })
      .sort((a, b) => b.count - a.count) // Sort by count, descending
      .slice(0, 5); // Get top 5 states

    return {
      totalSuppliers: totalSuppliers || 0,
      newSuppliers: newSuppliers || 0,
      topSuppliers,
      byCategories,
      byState
    };
  } catch (error) {
    console.error("Error fetching supplier statistics:", error);
    throw error;
  }
}

// Fetch conversion statistics
export async function getConversionStatistics(): Promise<ConversionStatistics> {
  // In a real system, these would be calculated from actual user events
  // For now, we're returning realistic mock data
  return {
    visitToRegister: 12.3,
    registerToSubscription: 43.7,
    visitToSubscription: 5.2,
    churnRate: 2.8,
    retentionRates: {
      thirtyDays: 95.4,
      sixtyDays: 87.2,
      ninetyDays: 78.6,
      annual: 67.5
    }
  };
}

// Fetch regional data
export async function getRegionalData() {
  try {
    // Get user counts by state
    const { data: usersByState, error: userStateError } = await supabase
      .from('profiles')
      .select('id');
    
    if (userStateError) throw userStateError;

    // In a real system, we would have state data for users
    // For now, we'll distribute them based on realistic population distribution
    const stateDistribution = {
      'SP': 0.36, 'RJ': 0.18, 'CE': 0.14, 'MG': 0.12, 'GO': 0.08, 'Outros': 0.12
    };
    
    const totalUsers = usersByState?.length || 0;
    const usersData = Object.entries(stateDistribution).map(([state, proportion]) => {
      const count = Math.round(totalUsers * proportion);
      // Generate a random growth rate between -2 and +10
      const growth = (Math.random() * 12 - 2).toFixed(1);
      
      return {
        state,
        count,
        percentage: parseFloat((proportion * 100).toFixed(1)),
        growth: parseFloat(growth)
      };
    });

    // Get supplier counts by state (we already calculated this in getSupplierStatistics)
    const { byState: suppliersData } = await getSupplierStatistics();

    // For conversion rates by state, we would need actual analytics data
    // For now, generate realistic mock data
    const conversionData = [
      { state: "SP", rate: 12.3, change: 1.2 },
      { state: "RJ", rate: 10.8, change: -0.5 },
      { state: "CE", rate: 14.7, change: 2.8 },
      { state: "MG", rate: 9.6, change: 0.3 },
      { state: "GO", rate: 11.2, change: 1.7 }
    ];

    return { users: usersData, suppliers: suppliersData, conversions: conversionData };
  } catch (error) {
    console.error("Error fetching regional data:", error);
    throw error;
  }
}

// Generate cohort analysis data
export async function getCohortData() {
  // In a real system, this would be calculated from actual user retention data
  // For now, we're returning realistic mock data
  
  // Create the last 6 months of cohorts
  const cohorts = [];
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = currentDate.getMonth() - i;
    const year = currentDate.getFullYear();
    const adjustedMonth = month < 0 ? month + 12 : month;
    const adjustedYear = month < 0 ? year - 1 : year;
    
    // Create a realistic retention curve
    // Month 0 is always 100%
    const cohort = {
      month: `${monthNames[adjustedMonth]} ${adjustedYear}`,
      m0: 100,
      m1: i < 5 ? 83 + Math.floor(Math.random() * 8) : null,
      m2: i < 4 ? 76 + Math.floor(Math.random() * 6) : null,
      m3: i < 3 ? 72 + Math.floor(Math.random() * 5) : null,
      m4: i < 2 ? 68 + Math.floor(Math.random() * 4) : null,
      m5: i < 1 ? 66 + Math.floor(Math.random() * 3) : null
    };
    
    cohorts.push(cohort);
  }

  return cohorts;
}

// Main function to get all report data
export async function getReportData(
  dateRange: '7days' | '30days' | '90days' | 'year' = '30days',
  categoryFilter: string = 'all',
  locationFilter: string = 'all'
): Promise<ReportData> {
  try {
    // Fetch all the required data
    const users = await getUserStatistics();
    const suppliers = await getSupplierStatistics();
    const conversions = await getConversionStatistics();
    const regionData = await getRegionalData();
    const cohortData = await getCohortData();
    
    // Calculate subscription distribution
    // In a real system, this would come from actual subscription data
    const subscriptionDistribution = [
      { name: 'Mensal', value: 65 },
      { name: 'Anual', value: 35 }
    ];

    // In a real system, this would be calculated from actual login events
    // For now, generate a reasonable number based on user count
    const totalLogins = users.totalUsers * 7; // Assuming each user logs in ~7 times
    
    return {
      users,
      suppliers,
      conversions,
      totalLogins,
      subscriptionDistribution,
      regionData,
      cohortData
    };
  } catch (error) {
    console.error("Error fetching report data:", error);
    throw error;
  }
}

// Function to generate CSV export
export async function exportReportToCSV(
  reportType: string,
  dateRange: string,
  filters: Record<string, string>
): Promise<string> {
  // In a real system, this would generate and return a CSV file
  // For now, we'll just return a success message
  
  // This function would typically:
  // 1. Fetch the appropriate data based on parameters
  // 2. Format it into CSV
  // 3. Return either the CSV string or a download URL
  
  console.log(`Exporting ${reportType} report with date range ${dateRange} and filters:`, filters);
  
  return "report_data.csv";
}
