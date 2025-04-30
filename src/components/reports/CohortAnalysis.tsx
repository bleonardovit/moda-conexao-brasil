
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock cohort data - Retention percentages by month
const COHORT_DATA = [
  { month: "Jan 2025", m0: 100, m1: 83, m2: 76, m3: 72, m4: 68, m5: 66 },
  { month: "Fev 2025", m0: 100, m1: 85, m2: 78, m3: 74, m4: 70, m5: null },
  { month: "Mar 2025", m0: 100, m1: 87, m2: 79, m3: 75, m4: null, m5: null },
  { month: "Abr 2025", m0: 100, m1: 88, m2: 81, m3: null, m4: null, m5: null },
  { month: "Mai 2025", m0: 100, m1: 90, m2: null, m3: null, m4: null, m5: null },
  { month: "Jun 2025", m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null },
];

// Helper function to get cell color based on retention value
const getCellColor = (value: number | null) => {
  if (value === null) return "bg-muted/20";
  if (value === 100) return "bg-primary/10 text-primary";
  if (value >= 90) return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (value >= 80) return "bg-green-400/20 text-green-600 dark:text-green-300";
  if (value >= 70) return "bg-yellow-400/20 text-yellow-700 dark:text-yellow-400";
  if (value >= 60) return "bg-orange-400/20 text-orange-700 dark:text-orange-400";
  return "bg-red-400/20 text-red-700 dark:text-red-400";
};

export function CohortAnalysis() {
  const [cohortType, setCohortType] = useState("retention");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Análise de Coortes</span>
          <Select 
            value={cohortType} 
            onValueChange={setCohortType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de análise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retention">Retenção</SelectItem>
              <SelectItem value="revenue">Receita</SelectItem>
              <SelectItem value="activity">Atividade</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="heatmap">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="heatmap">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Coorte</TableHead>
                    <TableHead className="text-center">Mês 0</TableHead>
                    <TableHead className="text-center">Mês 1</TableHead>
                    <TableHead className="text-center">Mês 2</TableHead>
                    <TableHead className="text-center">Mês 3</TableHead>
                    <TableHead className="text-center">Mês 4</TableHead>
                    <TableHead className="text-center">Mês 5</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COHORT_DATA.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className={`text-center ${getCellColor(row.m0)}`}>
                        {row.m0 !== null ? `${row.m0}%` : '-'}
                      </TableCell>
                      <TableCell className={`text-center ${getCellColor(row.m1)}`}>
                        {row.m1 !== null ? `${row.m1}%` : '-'}
                      </TableCell>
                      <TableCell className={`text-center ${getCellColor(row.m2)}`}>
                        {row.m2 !== null ? `${row.m2}%` : '-'}
                      </TableCell>
                      <TableCell className={`text-center ${getCellColor(row.m3)}`}>
                        {row.m3 !== null ? `${row.m3}%` : '-'}
                      </TableCell>
                      <TableCell className={`text-center ${getCellColor(row.m4)}`}>
                        {row.m4 !== null ? `${row.m4}%` : '-'}
                      </TableCell>
                      <TableCell className={`text-center ${getCellColor(row.m5)}`}>
                        {row.m5 !== null ? `${row.m5}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-green-500/20"></div>
                <span className="text-xs">90%+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-yellow-400/20"></div>
                <span className="text-xs">70-89%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-orange-400/20"></div>
                <span className="text-xs">60-69%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-red-400/20"></div>
                <span className="text-xs">&lt;60%</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chart">
            <div className="h-[300px] flex justify-center items-center border rounded-md bg-muted/20">
              <div className="text-center p-4">
                <p className="text-lg font-medium mb-2">Visualização de Coortes</p>
                <p className="text-sm text-muted-foreground">
                  Gráfico de {cohortType === "retention" ? "retenção" : cohortType === "revenue" ? "receita" : "atividade"} por coorte
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Insights de {cohortType === "retention" ? "Retenção" : cohortType === "revenue" ? "Receita" : "Atividade"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Melhor coorte</div>
                    <div className="text-xl font-bold">Maio 2025</div>
                    <div className="text-sm">90% retenção após primeiro mês</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Tendência geral</div>
                    <div className="text-xl font-bold text-green-500">↗ Melhorando</div>
                    <div className="text-sm">+2% por mês desde Janeiro</div>
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
