import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { getRegionalData, ReportData } from '@/services/reportService'; // Import ReportData
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart as BarChartIcon, PieChart as PieChartIcon, MapPin, Users, Store, TrendingUp, TrendingDown } from 'lucide-react'; // Aliased lucide icons
import { ResponsiveContainer, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, BarChart as RechartsBarChartComponent } from 'recharts'; // Imported BarChart as RechartsBarChartComponent
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function GeoInsights() {
  const { data: regionalData, isLoading, error } = useQuery<ReportData['regionData']>({
    queryKey: ['regional-data'],
    queryFn: getRegionalData
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-500">
          Erro ao carregar insights geográficos: {(error as Error).message}
        </CardContent>
      </Card>
    );
  }

  const usersByStateChartData = regionalData?.users
    .filter(u => u.state !== "Não informado") // Optionally filter out "Não informado" for cleaner charts
    .map(item => ({ name: item.state, value: item.count })) || [];
  
  const suppliersByStateChartData = regionalData?.suppliers
    .map(item => ({ name: item.state, value: item.count })) || [];

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="users">Usuários por Estado</TabsTrigger>
        <TabsTrigger value="suppliers">Fornecedores por Estado</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Principais Estados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Com Mais Usuários</h3>
                  {regionalData?.users.slice(0, 3).map(u => (
                    <div key={`user-${u.state}`} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>{u.state}</span>
                      <span className="font-semibold">{u.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Com Mais Fornecedores</h3>
                   {regionalData?.suppliers.slice(0, 3).map(s => (
                    <div key={`supplier-${s.state}`} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>{s.state}</span>
                      <span className="font-semibold">{s.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Distribuição de Usuários por Estado</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full" /> : usersByStateChartData.length > 0 ? (
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChartIcon>
                      <Pie data={usersByStateChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {usersByStateChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                      <RechartsLegend />
                    </PieChartIcon>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : <p className="text-muted-foreground text-center py-10">Sem dados de usuários por estado para exibir.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChartIcon className="h-5 w-5"/> Top Estados por Usuários</CardTitle></CardHeader>
            <CardContent>
               {isLoading ? <Skeleton className="h-[300px] w-full" /> : regionalData?.users && regionalData.users.length > 0 ? (
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChartComponent data={regionalData.users.slice(0,10)} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis type="number" />
                       <YAxis dataKey="state" type="category" width={80} />
                       <Tooltip content={<ChartTooltipContent />} />
                       <Bar dataKey="count" name="Usuários" fill="var(--color-users, hsl(var(--chart-1)))" radius={[0, 4, 4, 0]} />
                    </RechartsBarChartComponent>
                  </ResponsiveContainer>
                </ChartContainer>
               ) : <p className="text-muted-foreground text-center py-10">Sem dados de usuários por estado para exibir.</p>}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Detalhes de Usuários por Estado</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? <Skeleton className="h-40 w-full" /> : regionalData?.users && regionalData.users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Usuários</TableHead>
                  <TableHead className="text-right">% do Total</TableHead>
                  <TableHead className="text-right">Crescimento (Mock)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionalData?.users.map(item => (
                  <TableRow key={item.state}>
                    <TableCell>{item.state}</TableCell>
                    <TableCell className="text-right">{item.count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                        {item.growth >= 0 ? <TrendingUp className="h-4 w-4 text-green-500 mr-1" /> : <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
                        {item.growth.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : <p className="text-muted-foreground text-center py-10">Sem dados de usuários por estado para exibir.</p>}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="suppliers" className="space-y-4">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5"/> Distribuição de Fornecedores por Estado</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full" /> : suppliersByStateChartData.length > 0 ? (
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChartIcon>
                      <Pie data={suppliersByStateChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {suppliersByStateChartData.map((entry, index) => (
                          <Cell key={`cell-supplier-${index}`} fill={COLORS[(index + 2) % COLORS.length]} /> // Offset colors
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                      <RechartsLegend />
                    </PieChartIcon>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : <p className="text-muted-foreground text-center py-10">Sem dados de fornecedores por estado para exibir.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChartIcon className="h-5 w-5"/> Top Estados por Fornecedores</CardTitle></CardHeader>
            <CardContent>
               {isLoading ? <Skeleton className="h-[300px] w-full" /> : regionalData?.suppliers && regionalData.suppliers.length > 0 ? (
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChartComponent data={regionalData.suppliers.slice(0,10)} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis type="number" />
                       <YAxis dataKey="state" type="category" width={80} />
                       <Tooltip content={<ChartTooltipContent />} />
                       <Bar dataKey="count" name="Fornecedores" fill="var(--color-suppliers, hsl(var(--chart-2)))" radius={[0, 4, 4, 0]} />
                    </RechartsBarChartComponent>
                  </ResponsiveContainer>
                </ChartContainer>
               ) : <p className="text-muted-foreground text-center py-10">Sem dados de fornecedores por estado para exibir.</p>}
            </CardContent>
          </Card>
        </div>
         <Card>
          <CardHeader><CardTitle>Detalhes de Fornecedores por Estado</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? <Skeleton className="h-40 w-full" /> : regionalData?.suppliers && regionalData.suppliers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Fornecedores</TableHead>
                  <TableHead className="text-right">% do Total</TableHead>
                  <TableHead className="text-right">Crescimento (Mock)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionalData?.suppliers.map(item => (
                  <TableRow key={`sup-${item.state}`}>
                    <TableCell>{item.state}</TableCell>
                    <TableCell className="text-right">{item.count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                        {item.growth >= 0 ? <TrendingUp className="h-4 w-4 text-green-500 mr-1" /> : <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
                        {item.growth.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : <p className="text-muted-foreground text-center py-10">Sem dados de fornecedores por estado para exibir.</p>}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
