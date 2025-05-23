
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { getCohortData, ReportData } from '@/services/reportService'; // Import ReportData
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";


// Helper function to get cell color based on retention value
const getCellColor = (value: number | null) => {
  if (value === null) return "bg-muted/20 text-muted-foreground";
  if (value === 100) return "bg-primary/10 text-primary-foreground"; // Primary for 100%
  if (value >= 80) return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (value >= 60) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"; // Adjusted threshold
  if (value >= 40) return "bg-orange-500/20 text-orange-700 dark:text-orange-400"; // Adjusted threshold
  return "bg-red-500/20 text-red-700 dark:text-red-400";
};

export function CohortAnalysis() {
  const [cohortType, setCohortType] = useState("retention"); // Currently only retention is implemented with data
  
  const { data: cohortData, isLoading, error } = useQuery<ReportData['cohortData']>({ // Typed query
    queryKey: ['cohort-data-detailed'], // Changed queryKey to reflect new data structure if any
    queryFn: getCohortData
  });
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            Erro ao carregar dados de coortes: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartableCohortData = cohortData?.map(cohort => ({
    name: cohort.month,
    M0: cohort.m0,
    M1: cohort.m1,
    M2: cohort.m2,
    M3: cohort.m3,
    M4: cohort.m4,
    M5: cohort.m5,
  })).reverse(); // Reverse for chart display (oldest to newest)

  const getBestPerformingCohort = () => {
    if (!cohortData || cohortData.length === 0) return { month: 'N/A', m1Retention: 0 };
    // Find cohort with highest M1 retention (excluding cohorts too new for M1)
    const validCohorts = cohortData.filter(c => c.m1 !== null);
    if (validCohorts.length === 0) return { month: cohortData[0]?.month || 'N/A', m1Retention: cohortData[0]?.m1 || 0 };
    
    const sorted = [...validCohorts].sort((a, b) => (b.m1 || 0) - (a.m1 || 0));
    return { month: sorted[0].month, m1Retention: sorted[0].m1 };
  }

  const bestCohort = getBestPerformingCohort();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Análise de Coortes de {cohortType === "retention" ? "Retenção de Usuários" : cohortType}</span>
          <Select 
            value={cohortType} 
            onValueChange={setCohortType}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de análise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retention">Retenção de Usuários</SelectItem>
              {/* <SelectItem value="revenue" disabled>Receita por Coorte</SelectItem> */}
              {/* <SelectItem value="activity" disabled>Atividade por Coorte</SelectItem> */}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="heatmap">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="heatmap">Heatmap de Retenção</TabsTrigger>
              <TabsTrigger value="chart">Gráfico de Linhas</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="heatmap">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left min-w-[120px]">Coorte (Mês de Inscrição)</TableHead>
                      <TableHead className="text-center min-w-[80px]">Tamanho</TableHead>
                      {[...Array(6)].map((_, i) => (
                        <TableHead key={`month-${i}`} className="text-center min-w-[80px]">Mês {i}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cohortData?.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium text-left">{row.month}</TableCell>
                        <TableCell className="text-center">{row.cohortSize}</TableCell>
                        <TableCell className={`text-center font-semibold ${getCellColor(row.m0)}`}>
                          {row.m0 !== null ? `${row.m0}%` : '-'}
                        </TableCell>
                        {[row.m1, row.m2, row.m3, row.m4, row.m5].map((monthVal, index) => (
                           <TableCell key={`${row.month}-m${index+1}`} className={`text-center ${getCellColor(monthVal)}`}>
                             {monthVal !== null ? `${monthVal}%` : '-'}
                           </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="mt-6 flex items-center justify-center gap-x-6 gap-y-2 flex-wrap">
              <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-sm ${getCellColor(85).split(' ')[0]}`}></div><span className="text-xs">≥80%</span></div>
              <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-sm ${getCellColor(65).split(' ')[0]}`}></div><span className="text-xs">60-79%</span></div>
              <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-sm ${getCellColor(45).split(' ')[0]}`}></div><span className="text-xs">40-59%</span></div>
              <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-sm ${getCellColor(25).split(' ')[0]}`}></div><span className="text-xs">&lt;40%</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-muted/20"></div><span className="text-xs">N/A</span></div>
            </div>
          </TabsContent>
          
          <TabsContent value="chart">
            {isLoading ? <Skeleton className="h-[350px] w-full" /> : 
              chartableCohortData && chartableCohortData.length > 0 ? (
              <ChartContainer config={{}} className="h-[350px] w-full">
                <ResponsiveContainer>
                  <LineChart data={chartableCohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: '% Retenção', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {Object.keys(chartableCohortData[0] || {}).filter(key => key.startsWith('M') && key !== 'M0').map((key, index) => (
                       <Line 
                         key={key} 
                         type="monotone" 
                         dataKey={key} 
                         stroke={`hsl(var(--chart-${index+1}))`} // Using shadcn chart colors
                         name={`Retenção ${key}`} 
                         connectNulls 
                       />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[350px] flex justify-center items-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Sem dados de coorte para exibir o gráfico.</p>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-3">Insights Chave de Retenção</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm font-medium">Melhor Coorte (Mês 1)</CardTitle></CardHeader>
                  <CardContent>
                    {isLoading ? <Skeleton className="h-6 w-3/4 mb-1" /> : <div className="text-2xl font-bold">{bestCohort.month}</div>}
                    {isLoading ? <Skeleton className="h-4 w-1/2" /> : <p className="text-sm text-muted-foreground">{bestCohort.m1Retention}% de retenção após 1 mês</p>}
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm font-medium">Média de Retenção Mês 1</CardTitle></CardHeader>
                  <CardContent>
                    {isLoading ? <Skeleton className="h-6 w-1/2 mb-1" /> : 
                      (() => {
                        const validM1s = cohortData?.map(c => c.m1).filter(m1 => m1 !== null) as number[] || [];
                        const avgM1 = validM1s.length > 0 ? (validM1s.reduce((a, b) => a + b, 0) / validM1s.length).toFixed(1) : 0;
                        return <div className="text-2xl font-bold">{avgM1}%</div>;
                      })()
                    }
                    {isLoading ? <Skeleton className="h-4 w-3/4" /> : <p className="text-sm text-muted-foreground">Média de retenção para todas as coortes após o primeiro mês.</p>}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

