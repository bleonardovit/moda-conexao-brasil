
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Download, Users, Store, TrendingUp, TrendingDown } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Mocks para dados de gráficos e estatísticas
const MOCK_STATS = {
  totalUsers: 1250,
  newUsers7Days: 42,
  newUsers30Days: 127,
  growthRate: 8.5, // percentual de crescimento
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

// Dados para gráfico de visualizações por categoria
const MOCK_CATEGORY_VIEWS = [
  { category: 'Casual', views: 342 },
  { category: 'Fitness', views: 256 },
  { category: 'Plus Size', views: 187 },
  { category: 'Acessórios', views: 143 },
  { category: 'Praia', views: 98 }
];

export default function Reports() {
  const [dateRange, setDateRange] = useState('7days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  // Dados formatados para exibição
  const stats = MOCK_STATS;
  
  // Função para exportar relatórios
  const exportReport = () => {
    console.log('Exportando relatório com filtros:', { dateRange, categoryFilter, locationFilter });
    // Implementar lógica de exportação
    alert('Relatório exportado em formato CSV!');
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
        
        {/* Filtros */}
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
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogins}</div>
              <p className="text-xs text-muted-foreground">
                Histórico completo
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs de dados detalhados */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="locations">Localidades</TabsTrigger>
          </TabsList>
          
          {/* Tab de usuários */}
          <TabsContent value="users">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Novos Usuários (últimos 7 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Substitua isso por um componente de gráfico real */}
                  <div className="h-[200px] flex items-end justify-between">
                    {MOCK_USERS_CHART_DATA.map((day, index) => (
                      <div key={index} className="relative h-full flex flex-col items-center">
                        <div 
                          className="w-10 bg-primary/80 hover:bg-primary rounded-t" 
                          style={{ height: `${(day.count / 15) * 100}%` }}
                        ></div>
                        <span className="text-xs mt-2">{day.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento de Usuários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Últimos 7 dias</div>
                      <div className={`text-sm font-medium ${stats.growthRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stats.growthRate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(stats.growthRate) * 3}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Distribuição por tipo de assinatura</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs">Mensal</div>
                          <div className="text-xs font-medium">65%</div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs">Anual</div>
                          <div className="text-xs font-medium">35%</div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab de fornecedores */}
          <TabsContent value="suppliers">
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
                <CardContent>
                  <div className="space-y-4">
                    {MOCK_CATEGORY_VIEWS.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{category.category}</span>
                          <span className="text-sm">{category.views}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(category.views / MOCK_CATEGORY_VIEWS[0].views) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <CardContent>
                  <div className="space-y-4">
                    {stats.topLocations.map((location, index) => (
                      <div key={location.state} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                              <span className="text-xs font-bold">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium">{location.state}</span>
                          </div>
                          <span className="text-sm">{location.users} usuárias</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(location.users / stats.topLocations[0].users) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Fornecedores por Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SP</span>
                        <span className="text-sm">32 fornecedores</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CE</span>
                        <span className="text-sm">18 fornecedores</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '56%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">GO</span>
                        <span className="text-sm">15 fornecedores</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '47%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">MG</span>
                        <span className="text-sm">12 fornecedores</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '37%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">PE</span>
                        <span className="text-sm">10 fornecedores</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '31%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
