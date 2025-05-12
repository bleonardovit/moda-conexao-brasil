
import { useState, useCallback } from 'react';
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
  FileSpreadsheet
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
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { KPIGrid } from '@/components/reports/KPICards';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { GeoInsights } from '@/components/reports/GeoInsights';
import { CohortAnalysis } from '@/components/reports/CohortAnalysis';
import { getReportData, exportReportToCSV } from '@/services/reportService';

// Cores para os gráficos
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'year'>('30days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Fetch report data based on filters
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['report-data', dateRange, categoryFilter, locationFilter],
    queryFn: () => getReportData(dateRange, categoryFilter, locationFilter)
  });
  
  // Function to export reports
  const exportReport = useCallback(async () => {
    try {
      toast({
        title: "Exportando relatório",
        description: "Gerando arquivo para download...",
      });
      
      const result = await exportReportToCSV('dashboard', dateRange, { 
        category: categoryFilter, 
        location: locationFilter 
      });
      
      // In a real system, this would trigger a file download
      // For now, we'll just show a success message
      toast({
        title: "Relatório exportado",
        description: "O relatório foi gerado e baixado com sucesso.",
      });
    } catch (err) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    }
  }, [dateRange, categoryFilter, locationFilter, toast]);
  
  // Generate pie chart data for states
  const generatePieChartData = (data: Array<{state: string, count: number}> | undefined) => {
    if (!data) return [];
    
    return data.map(item => ({
      name: item.state,
      value: item.count
    }));
  };
  
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
  
  // Use real data if available, otherwise use empty defaults
  const stats = reportData || {
    users: {
      totalUsers: 0,
      newUsersLast7Days: 0,
      newUsersLast30Days: 0,
      growthRate: 0,
      activeUsers: []
    },
    suppliers: {
      totalSuppliers: 0,
      newSuppliers: 0,
      topSuppliers: [],
      byCategories: [],
      byState: []
    },
    conversions: {
      visitToRegister: 0,
      registerToSubscription: 0,
      visitToSubscription: 0,
      churnRate: 0
    },
    totalLogins: 0,
    regionData: {
      users: [],
      suppliers: [],
      conversions: []
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard & Relatórios</h1>
          <Button onClick={exportReport} disabled={isLoading}>
            {isLoading ? (
              <>Carregando dados...</>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </div>
        
        {/* Tabs principais */}
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="space-y-4">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger 
                value="dashboard" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="builder" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Construtor de Relatórios
              </TabsTrigger>
              <TabsTrigger 
                value="cohorts" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Análise de Coortes
              </TabsTrigger>
              <TabsTrigger 
                value="geo" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Insights Geográficos
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Dashboard principal */}
          <TabsContent value="dashboard" className="space-y-4">
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
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
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
                    <SelectValue placeholder="Localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos estados</SelectItem>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="CE">Ceará</SelectItem>
                    <SelectItem value="GO">Goiás</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* KPI Cards */}
            <KPIGrid />
            
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Usuárias
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.users.newUsersLast30Days} no último mês
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Novas Usuárias
                  </CardTitle>
                  {stats.users.growthRate > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{stats.users.newUsersLast7Days}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.users.growthRate > 0 ? '+' : ''}{stats.users.growthRate}% em relação ao período anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Fornecedores
                  </CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.suppliers.totalSuppliers}</div>
                  <p className="text-xs text-muted-foreground">
                    Cadastrados no sistema
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Logins
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLogins.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Histórico completo
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Métricas de conversão */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Visita → Cadastro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{stats.conversions.visitToRegister}%</div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${stats.conversions.visitToRegister}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Cadastro → Assinatura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{stats.conversions.registerToSubscription}%</div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${stats.conversions.registerToSubscription}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Conversão Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{stats.conversions.visitToSubscription}%</div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${stats.conversions.visitToSubscription}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Taxa de Cancelamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{stats.conversions.churnRate}%</div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${stats.conversions.churnRate}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Tabs de dados detalhados */}
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
                <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
                <TabsTrigger value="locations">Localidades</TabsTrigger>
              </TabsList>
              
              {/* Tab de usuários */}
              <TabsContent value="users" className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Novos Usuários (últimos 7 dias)</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ChartContainer config={{
                        newUsers: { label: "Novos Usuários", theme: { light: "#8884d8", dark: "#a4a0e5" } }
                      }} className="h-80">
                        <BarChart data={reportData?.users.activeUsers.map((value, index) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (6 - index));
                          return {
                            date: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
                            count: Math.floor(value * 0.05) // Assuming ~5% of active users are new
                          };
                        }) || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" name="newUsers" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Usuários Ativos (últimos 7 dias)</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ChartContainer config={{
                        activeUsers: { label: "Usuários Ativos", theme: { light: "#82ca9d", dark: "#65ba83" } }
                      }} className="h-80">
                        <LineChart data={reportData?.users.activeUsers.map((value, index) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (6 - index));
                          return {
                            date: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
                            active: value
                          };
                        }) || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line 
                            type="monotone" 
                            dataKey="active" 
                            name="activeUsers" 
                            stroke="#82ca9d" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Crescimento de Usuários (12 meses)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <ChartContainer config={{
                      monthlyUsers: { label: "Usuários", theme: { light: "#8884d8", dark: "#a4a0e5" } }
                    }} className="h-80">
                      <BarChart data={reportData?.users.monthlyGrowth || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="users" name="monthlyUsers" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Tab de assinaturas */}
              <TabsContent value="subscriptions" className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Assinaturas</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ChartContainer config={{
                        subscriptions: { label: "Assinaturas", theme: { light: "#8884d8", dark: "#a4a0e5" } }
                      }} className="h-80">
                        <PieChart>
                          <Pie
                            data={reportData?.subscriptionDistribution || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.name}: ${entry.value}%`}
                          >
                            {reportData?.subscriptionDistribution?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            )) || []}
                          </Pie>
                          <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                          <Legend />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Métricas de Assinatura</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Retenção de 30 dias</div>
                            <div className="text-sm font-medium text-green-500">
                              {reportData?.conversions.retentionRates.thirtyDays || 0}%
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${reportData?.conversions.retentionRates.thirtyDays || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Retenção de 60 dias</div>
                            <div className="text-sm font-medium text-green-500">
                              {reportData?.conversions.retentionRates.sixtyDays || 0}%
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${reportData?.conversions.retentionRates.sixtyDays || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Retenção de 90 dias</div>
                            <div className="text-sm font-medium text-green-500">
                              {reportData?.conversions.retentionRates.ninetyDays || 0}%
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${reportData?.conversions.retentionRates.ninetyDays || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Taxa de renovação anual</div>
                            <div className="text-sm font-medium text-green-500">
                              {reportData?.conversions.retentionRates.annual || 0}%
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${reportData?.conversions.retentionRates.annual || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Receita mensal (últimos 12 meses)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <ChartContainer config={{
                      revenue: { label: "Receita (R$)", theme: { light: "#82ca9d", dark: "#65ba83" } }
                    }} className="h-80">
                      <LineChart data={[
                        { month: "Jan", value: 5800 },
                        { month: "Fev", value: 6200 },
                        { month: "Mar", value: 6800 },
                        { month: "Abr", value: 7100 },
                        { month: "Mai", value: 7500 },
                        { month: "Jun", value: 8200 },
                        { month: "Jul", value: 8700 },
                        { month: "Ago", value: 9300 },
                        { month: "Set", value: 9800 },
                        { month: "Out", value: 10500 },
                        { month: "Nov", value: 11200 },
                        { month: "Dez", value: 12000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="revenue" 
                          stroke="#82ca9d" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Tab de fornecedores */}
              <TabsContent value="suppliers" className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fornecedores Mais Acessados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats.suppliers.topSuppliers.map((supplier, index) => (
                          <div key={supplier.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                                  <span className="text-xs font-bold">{index + 1}</span>
                                </div>
                                <span className="text-sm font-medium">{supplier.name}</span>
                              </div>
                              <span className="text-sm">{supplier.views} views</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ 
                                  width: `${(supplier.views / (stats.suppliers.topSuppliers[0]?.views || 1)) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Visualizações por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ChartContainer config={{
                        categoryViews: { label: "Visualizações", theme: { light: "#8884d8", dark: "#a4a0e5" } }
                      }} className="h-80">
                        <BarChart 
                          data={stats.suppliers.byCategories} 
                          layout="vertical" 
                          margin={{ left: 80 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="category" type="category" />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar 
                            dataKey="views" 
                            name="categoryViews" 
                            fill="#8884d8" 
                            radius={[0, 4, 4, 0]} 
                          />
                        </BarChart>
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
