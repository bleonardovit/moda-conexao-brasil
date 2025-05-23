import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Users, 
  Store, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileSpreadsheet,
  UserX, // For Blocked Users
  UserCheck, // For Trial to Paid
  DollarSign
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart as RechartsBarChart, // Aliased to avoid conflict with lucide icon
  Line,
  LineChart as RechartsLineChart, // Aliased
  Pie,
  PieChart as RechartsPieChart, // Aliased
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip, // Aliased
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { KPIGrid } from '@/components/reports/KPICards';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { GeoInsights } from '@/components/reports/GeoInsights';
import { CohortAnalysis } from '@/components/reports/CohortAnalysis';
import { getReportData, exportReportToCSV, ReportData } from '@/services/reportService';

// Cores para os gráficos
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

// Default empty stats structure, matching ReportData for consistency
const defaultStats: ReportData = {
  users: { totalUsers: 0, newUsersLast7Days: 0, newUsersLast30Days: 0, growthRate: 0, activeUsers: Array(7).fill(0), monthlyGrowth: [] },
  suppliers: { totalSuppliers: 0, newSuppliers: 0, topSuppliers: [], byCategories: [], byState: [] },
  conversions: { visitToRegister: 0, registerToSubscription: 0, visitToSubscription: 0, churnRate: 0, retentionRates: { thirtyDays: 0, sixtyDays: 0, ninetyDays: 0, annual: 0 }, trialToPaidRate: 0, blockedFreeUsers: 0 },
  totalLogins: 0,
  subscriptionDistribution: [{ name: 'Mensal', value: 0 }, { name: 'Anual', value: 0 }],
  regionData: { users: [], suppliers: [], conversions: [] },
  cohortData: []
};

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'year'>('30days');
  const [categoryFilter, setCategoryFilter] = useState('all'); // Not fully implemented in backend queries yet
  const [locationFilter, setLocationFilter] = useState('all'); // Not fully implemented in backend queries yet
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Fetch report data based on filters
  const { data: reportData, isLoading, error } = useQuery<ReportData>({
    queryKey: ['report-data', dateRange, categoryFilter, locationFilter],
    queryFn: () => getReportData(dateRange, categoryFilter, locationFilter),
    placeholderData: defaultStats, // Provide initial structure
  });
  
  // Function to export reports
  const exportReport = useCallback(async () => {
    try {
      toast({
        title: "Exportando relatório",
        description: "Gerando arquivo para download...",
      });
      
      // Pass current filters to export function
      await exportReportToCSV(activeTab, dateRange, { 
        category: categoryFilter, 
        location: locationFilter,
        tab: activeTab // Could be used by export function to tailor CSV
      });
      
      toast({
        title: "Relatório exportado (simulado)",
        description: "O download do relatório CSV foi simulado com sucesso.",
      });
    } catch (err) {
      toast({
        title: "Erro ao exportar",
        description: (err as Error).message || "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    }
  }, [dateRange, categoryFilter, locationFilter, toast, activeTab]);
  
  // Generate pie chart data for states
  const generatePieChartData = useCallback((data: Array<{name: string, value: number}> | undefined) => {
    if (!data) return [];
    return data.map(item => ({
      name: item.name,
      value: item.value
    }));
  }, []);

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-50 text-red-600 rounded-md">
          <h2 className="text-lg font-bold mb-2">Erro ao carregar relatórios</h2>
          <p>{(error as Error).message}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  const dailyNewUsersChartData = useMemo(() => {
    // Assuming activeUsers also includes new user registrations for that day as a rough estimate
    // Or if userStatistics provided daily new users, that would be better.
    // For now, using a fraction of active users as a proxy for "new users" in the daily chart.
    // This should ideally come from a dedicated daily new users metric.
    return reportData?.users.activeUsers.map((value, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        date: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        count: Math.max(0, Math.floor(value * 0.1)) // Placeholder: 10% of DAU are new
      };
    });
  }, [reportData?.users.activeUsers]);

  const dailyActiveUsersChartData = useMemo(() => {
    return reportData?.users.activeUsers.map((value, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        date: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        active: value
      };
    });
  }, [reportData?.users.activeUsers]);

  // Mock monthly revenue data (as real data source is not available yet)
  const monthlyRevenueData = [
      { month: "Jan", value: 5800 }, { month: "Fev", value: 6200 },
      { month: "Mar", value: 6800 }, { month: "Abr", value: 7100 },
      { month: "Mai", value: 7500 }, { month: "Jun", value: 8200 },
      { month: "Jul", value: 8700 }, { month: "Ago", value: 9300 },
      { month: "Set", value: 9800 }, { month: "Out", value: 10500 },
      { month: "Nov", value: 11200 }, { month: "Dez", value: 12000 }
  ];

  const stats = reportData || defaultStats; // Use fetched data or default structure
  
  return (
    <AdminLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-2xl font-bold">Dashboard & Relatórios</h1>
          {activeTab === 'dashboard' && ( // Show export only on dashboard or make it generic
            <Button onClick={exportReport} disabled={isLoading}>
              {isLoading ? "Carregando..." : <><FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Dashboard CSV</>}
            </Button>
          )}
        </div>
        
        {/* Tabs principais */}
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="space-y-4">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 overflow-x-auto">
              <TabsTrigger value="dashboard" className="whitespace-nowrap rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">Dashboard</TabsTrigger>
              <TabsTrigger value="builder" className="whitespace-nowrap rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">Construtor de Relatórios</TabsTrigger>
              <TabsTrigger value="cohorts" className="whitespace-nowrap rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">Análise de Coortes</TabsTrigger>
              <TabsTrigger value="geo" className="whitespace-nowrap rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary">Insights Geográficos</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Dashboard principal */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Filtros (apenas visíveis no dashboard) */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Select 
                  value={dateRange} 
                  onValueChange={(value: '7days' | '30days' | '90days' | 'year') => setDateRange(value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="90days">Últimos 90 dias</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={categoryFilter} 
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Categoria (Fornecedor)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {/* These categories should ideally come from backend or a shared constant */}
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="plussize">Plus Size</SelectItem>
                    <SelectItem value="praia">Praia</SelectItem>
                    <SelectItem value="acessorios">Acessórios</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={locationFilter} 
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Localização (Usuário/Fornecedor)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos estados</SelectItem>
                    {/* These states should ideally come from a shared constant like brazilian-states.ts */}
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="BA">Bahia</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* KPIGrid can be refactored or replaced by individual cards below */}
            {/* <KPIGrid /> */} 
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* These cards will now use stats from the updated reportData */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuárias</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.users.newUsersLast30Days.toLocaleString()} no último mês
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novas Usuárias (7d)</CardTitle>
                  {stats.users.growthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{stats.users.newUsersLast7Days.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.users.growthRate >= 0 ? '+' : ''}{stats.users.growthRate.toFixed(1)}% vs. 7d anteriores
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.suppliers.totalSuppliers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.suppliers.newSuppliers.toLocaleString()} no último mês
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Logins (Est.)</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLogins.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Estimativa histórica
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Metrics de conversão - Updated with new metrics */}
            <Card>
              <CardHeader><CardTitle>Métricas de Conversão Chave</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Visita → Cadastro (Est.)", value: stats.conversions.visitToRegister, icon: <Users className="h-5 w-5 text-blue-500"/>, colorClass: "bg-blue-500" },
                  { title: "Cadastro → Assinatura", value: stats.conversions.registerToSubscription, icon: <UserCheck className="h-5 w-5 text-green-500"/>, colorClass: "bg-green-500" },
                  { title: "Trial → Assinatura", value: stats.conversions.trialToPaidRate, icon: <UserCheck className="h-5 w-5 text-teal-500"/>, colorClass: "bg-teal-500" },
                  { title: "Conversão Total (Est.)", value: stats.conversions.visitToSubscription, icon: <TrendingUp className="h-5 w-5 text-indigo-500"/>, colorClass: "bg-indigo-500" },
                  { title: "Taxa de Cancelamento", value: stats.conversions.churnRate, icon: <UserX className="h-5 w-5 text-red-500"/>, colorClass: "bg-red-500" },
                  { title: "Trials Expirados (Não Conv.)", value: stats.conversions.blockedFreeUsers, unit: "usuários", icon: <UserX className="h-5 w-5 text-orange-500"/>, colorClass: "bg-orange-500" },
                ].map(metric => (
                  <div key={metric.title} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
                      {metric.icon}
                    </div>
                    <div className={`text-2xl font-bold ${metric.colorClass.replace('bg-', 'text-')}`}>
                      {metric.value.toFixed(1)}{metric.unit ? '' : '%'}
                      {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                    </div>
                    {!metric.unit && (
                      <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${metric.colorClass}`} style={{ width: `${Math.min(100, metric.value)}%` }}></div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Tabs de dados detalhados */}
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
                <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
                {/* <TabsTrigger value="locations">Localidades</TabsTrigger> */} {/* Covered by GeoInsights tab */}
              </TabsList>
              
              {/* Tab de usuários */}
              <TabsContent value="users" className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle>Novos Usuários (Diário - Proxy)</CardTitle></CardHeader>
                    <CardContent className="px-0">
                      <ChartContainer config={{ newUsers: { label: "Novos Usuários", theme: { light: "#8884d8", dark: "#a4a0e5" } } }} className="h-80">
                        <RechartsBarChart data={dailyNewUsersChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" name="newUsers" fill="var(--color-newUsers, hsl(var(--chart-1)))" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader><CardTitle>Usuários Ativos (Diário)</CardTitle></CardHeader>
                    <CardContent className="px-0">
                      <ChartContainer config={{ activeUsers: { label: "Usuários Ativos", theme: { light: "#82ca9d", dark: "#65ba83" } } }} className="h-80">
                        <RechartsLineChart data={dailyActiveUsersChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="active" name="activeUsers" stroke="var(--color-activeUsers, hsl(var(--chart-2)))" activeDot={{ r: 8 }} />
                        </RechartsLineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader><CardTitle>Crescimento de Usuários (Mensal)</CardTitle></CardHeader>
                  <CardContent className="px-0">
                    <ChartContainer config={{ monthlyUsers: { label: "Novos Usuários", theme: { light: "#8884d8", dark: "#a4a0e5" } } }} className="h-80">
                      <RechartsBarChart data={stats.users.monthlyGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="users" name="monthlyUsers" fill="var(--color-monthlyUsers, hsl(var(--chart-1)))" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </CardContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Tab de assinaturas */}
              <TabsContent value="subscriptions" className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle>Distribuição de Assinaturas Ativas</CardTitle></CardHeader>
                    <CardContent className="px-0">
                      <ChartContainer config={{ subscriptions: { label: "Assinaturas", theme: { light: "#8884d8", dark: "#a4a0e5" } } }} className="h-80">
                        <RechartsPieChart>
                          <Pie data={stats.subscriptionDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}%`}>
                            {stats.subscriptionDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
                          <Legend />
                        </RechartsPieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Métricas de Retenção Geral (Plataforma)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(stats.conversions.retentionRates).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>Retenção {key === 'thirtyDays' ? '30 dias' : key === 'sixtyDays' ? '60 dias' : key === 'ninetyDays' ? '90 dias' : 'Anual'}</span>
                            <span className="font-medium text-green-500">{value.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${value}%` }}></div>
                          </div>
                        </div>
                      ))}
                       <p className="text-xs text-muted-foreground pt-2">Nota: Estas são taxas de retenção gerais da plataforma, não específicas de coortes. Veja "Análise de Coortes" para detalhes.</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader className="flex justify-between items-center">
                     <CardTitle>Receita Mensal (Últimos 12 Meses - Mock)</CardTitle>
                     <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-0">
                    <ChartContainer config={{ revenue: { label: "Receita (R$)", theme: { light: "#82ca9d", dark: "#65ba83" } } }} className="h-80">
                      <RechartsLineChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="revenue" stroke="var(--color-revenue, hsl(var(--chart-2)))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      </RechartsLineChart>
                    </ChartContainer>
                     <p className="text-xs text-muted-foreground p-4 text-center">Nota: Os dados de receita mensal são ilustrativos (mock). A integração com dados reais de transações é necessária para valores precisos.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Tab de fornecedores */}
              <TabsContent value="suppliers" className="space-y-4">
                 <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Fornecedores Mais Populares (Proxy)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                        {stats.suppliers.topSuppliers.length > 0 ? stats.suppliers.topSuppliers.map((supplier, index) => (
                            <div key={supplier.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2"><span className="text-xs font-bold">{index + 1}</span></div>
                                <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs">{supplier.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{supplier.views.toLocaleString()} views</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${(supplier.views / (stats.suppliers.topSuppliers[0]?.views || 1)) * 100}%` }}></div>
                            </div>
                            </div>
                        )) : <p className="text-muted-foreground">Sem dados de fornecedores populares.</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Visualizações por Categoria (Proxy)</CardTitle></CardHeader>
                        <CardContent className="px-0">
                        <ChartContainer config={{ categoryViews: { label: "Visualizações", theme: { light: "#8884d8", dark: "#a4a0e5" } } }} className="h-[320px]"> {/* Adjusted height */}
                            <RechartsBarChart data={stats.suppliers.byCategories} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 12 }} />
                            <RechartsTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="views" name="categoryViews" fill="var(--color-categoryViews, hsl(var(--chart-1)))" radius={[0, 4, 4, 0]} barSize={20} />
                            </RechartsBarChart>
                        </ChartContainer>
                        </CardContent>
                    </Card>
                 </div>
              </TabsContent>
              
              {/* Tab de localidades */}
              <TabsContent value="locations">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estados com Mais Usuárias</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ChartContainer config={{
                        usersByState: { label: "Usuárias", theme: { light: "#8884d8", dark: "#a4a0e5" } }
                      }} className="h-80">
                        <PieChart>
                          <Pie
                            data={generatePieChartData(reportData?.regionData.users)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {generatePieChartData(reportData?.regionData.users).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                          <Legend />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Fornecedores por Estado</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ChartContainer config={{
                        suppliersByState: { label: "Fornecedores", theme: { light: "#82ca9d", dark: "#65ba83" } }
                      }} className="h-80">
                        <BarChart 
                          data={reportData?.regionData.suppliers.map(item => ({
                            state: item.state,
                            suppliers: item.count
                          }))} 
                          layout="vertical" 
                          margin={{ left: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="state" type="category" />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar 
                            dataKey="suppliers" 
                            name="suppliersByState" 
                            fill="#82ca9d" 
                            radius={[0, 4, 4, 0]} 
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          {/* Report Builder */}
          <TabsContent value="builder">
            <ReportBuilder />
          </TabsContent>
          
          {/* Cohort Analysis */}
          <TabsContent value="cohorts">
            <CohortAnalysis />
          </TabsContent>
          
          {/* Geographic Insights */}
          <TabsContent value="geo">
            <GeoInsights />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
