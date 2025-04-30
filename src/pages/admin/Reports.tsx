import { useState } from 'react';
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
  Calendar 
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

// Mocks para dados de gráficos e estatísticas
const MOCK_STATS = {
  totalUsers: 1250,
  newUsers7Days: 42,
  newUsers30Days: 127,
  growthRate: 8.5,
  totalSuppliers: 87,
  topSuppliers: [
    { id: '1', name: 'Moda Fashion SP', views: 856 },
    { id: '3', name: 'Plus Size Goiânia', views: 743 },
    { id: '2', name: 'Brindes Fortaleza', views: 521 }
  ],
  topLocations: [
    { state: 'SP', users: 450 },
    { state: 'RJ', users: 230 },
    { state: 'CE', users: 175 },
    { state: 'MG', users: 153 },
    { state: 'GO', users: 102 }
  ],
  totalLogins: 8947
};

// Dados para gráfico de novos usuários (últimos 7 dias)
const MOCK_USERS_CHART_DATA = [
  { date: '01/07', count: 5 },
  { date: '02/07', count: 8 },
  { date: '03/07', count: 12 },
  { date: '04/07', count: 3 },
  { date: '05/07', count: 7 },
  { date: '06/07', count: 10 },
  { date: '07/07', count: 15 }
];

// Dados para gráfico de usuários mensais (últimos 12 meses)
const MOCK_MONTHLY_USERS_DATA = [
  { month: 'Jan', users: 78 },
  { month: 'Fev', users: 91 },
  { month: 'Mar', users: 103 },
  { month: 'Abr', users: 87 },
  { month: 'Mai', users: 99 },
  { month: 'Jun', users: 112 },
  { month: 'Jul', users: 127 },
  { month: 'Ago', users: 135 },
  { month: 'Set', users: 142 },
  { month: 'Out', users: 156 },
  { month: 'Nov', users: 178 },
  { month: 'Dez', users: 204 }
];

// Dados para gráfico de visualizações por categoria
const MOCK_CATEGORY_VIEWS = [
  { category: 'Casual', views: 342 },
  { category: 'Fitness', views: 256 },
  { category: 'Plus Size', views: 187 },
  { category: 'Acessórios', views: 143 },
  { category: 'Praia', views: 98 }
];

// Distribuição de assinaturas
const MOCK_SUBSCRIPTION_DATA = [
  { name: 'Mensal', value: 65 },
  { name: 'Anual', value: 35 }
];

// Dados para métricas de conversão
const MOCK_CONVERSION_DATA = {
  visitToRegister: 12.3,
  registerToSubscription: 43.7,
  visitToSubscription: 5.2,
  churnRate: 2.8
};

// Dados para gráfico de usuários ativos
const MOCK_ACTIVE_USERS_DATA = [
  { date: '01/07', active: 452 },
  { date: '02/07', active: 478 },
  { date: '03/07', active: 492 },
  { date: '04/07', active: 481 },
  { date: '05/07', active: 503 },
  { date: '06/07', active: 527 },
  { date: '07/07', active: 542 }
];

// Dados para distribuição por estados
const generatePieChartData = (data: Array<{state: string, users: number}>) => {
  return data.map(item => ({
    name: item.state,
    value: item.users
  }));
};

// Cores para os gráficos
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('7days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dados formatados para exibição
  const stats = MOCK_STATS;
  
  // Função para exportar relatórios
  const exportReport = () => {
    console.log('Exportando relatório com filtros:', { dateRange, categoryFilter, locationFilter });
    
    toast({
      title: "Relatório exportado",
      description: "O relatório foi gerado e baixado com sucesso.",
    });
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard & Relatórios</h1>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
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
                  onValueChange={setDateRange}
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
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.newUsers30Days} no último mês
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Novas Usuárias
                  </CardTitle>
                  {stats.growthRate > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{stats.newUsers7Days}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}% em relação ao período anterior
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
                  <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
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
                  <div className="text-xl font-bold">{MOCK_CONVERSION_DATA.visitToRegister}%</div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${MOCK_CONVERSION_DATA.visitToRegister}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Cadastro → Assinatura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{MOCK_CONVERSION_DATA.registerToSubscription}%</div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${MOCK_CONVERSION_DATA.registerToSubscription}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Conversão Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{MOCK_CONVERSION_DATA.visitToSubscription}%</div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${MOCK_CONVERSION_DATA.visitToSubscription}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Taxa de Cancelamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{MOCK_CONVERSION_DATA.churnRate}%</div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${MOCK_CONVERSION_DATA.churnRate}%` }}
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
                        <BarChart data={MOCK_USERS_CHART_DATA}>
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
                        <LineChart data={MOCK_ACTIVE_USERS_DATA}>
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
                      <BarChart data={MOCK_MONTHLY_USERS_DATA}>
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
                            data={MOCK_SUBSCRIPTION_DATA}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.name}: ${entry.value}%`}
                          >
                            {MOCK_SUBSCRIPTION_DATA.map((entry, index) => (
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
                      <CardTitle>Métricas de Assinatura</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Retenção de 30 dias</div>
                            <div className="text-sm font-medium text-green-500">95.4%</div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: "95.4%" }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Retenção de 60 dias</div>
                            <div className="text-sm font-medium text-green-500">87.2%</div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: "87.2%" }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Retenção de 90 dias</div>
                            <div className="text-sm font-medium text-green-500">78.6%</div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: "78.6%" }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Taxa de renovação anual</div>
                            <div className="text-sm font-medium text-green-500">67.5%</div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: "67.5%" }}></div>
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
                        {stats.topSuppliers.map((supplier, index) => (
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
                                style={{ width: `${(supplier.views / stats.topSuppliers[0].views) * 100}%` }}
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
                          data={MOCK_CATEGORY_VIEWS} 
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
                            data={generatePieChartData(stats.topLocations)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {stats.topLocations.map((entry, index) => (
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
                          data={[
                            { state: 'SP', suppliers: 32 },
                            { state: 'CE', suppliers: 18 },
                            { state: 'GO', suppliers: 15 },
                            { state: 'MG', suppliers: 12 },
                            { state: 'PE', suppliers: 10 }
                          ]} 
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
