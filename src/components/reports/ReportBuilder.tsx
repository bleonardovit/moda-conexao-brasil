import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, LineChart, PieChart, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportReportToCSV } from "@/services/reportService";

type ChartType = "bar" | "line" | "pie";
type TimeRange = "7days" | "30days" | "90days" | "year";

interface MetricOption {
  id: string;
  name: string;
  description: string;
  category: "engagement" | "conversion" | "retention" | "revenue";
}

export function ReportBuilder() {
  const { toast } = useToast();
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["new_users"]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Mock metric options
  const metricOptions: MetricOption[] = [
    { id: "new_users", name: "Novos Usuários", description: "Total de novos registros", category: "engagement" },
    { id: "active_users", name: "Usuários Ativos", description: "Usuários com login recente", category: "engagement" },
    { id: "visit_conversion", name: "Conversão de Visitantes", description: "Visitas que resultaram em registro", category: "conversion" },
    { id: "retention_rate", name: "Taxa de Retenção", description: "Usuários que continuam ativos", category: "retention" },
    { id: "churn_rate", name: "Taxa de Cancelamento", description: "Usuários que cancelaram assinatura", category: "retention" },
    { id: "mrr", name: "Receita Mensal Recorrente", description: "Receita mensal de assinaturas", category: "revenue" },
    { id: "arpu", name: "Receita Média por Usuário", description: "Valor médio por usuário", category: "revenue" },
    { id: "ltv", name: "Valor de Vida do Cliente", description: "Receita esperada por cliente", category: "revenue" }
  ];
  
  // Function to handle metric selection
  const toggleMetric = (id: string) => {
    if (selectedMetrics.includes(id)) {
      setSelectedMetrics(selectedMetrics.filter(metricId => metricId !== id));
    } else {
      setSelectedMetrics([...selectedMetrics, id]);
    }
  };
  
  // Grouped metrics by category
  const metricsByCategory = metricOptions.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, MetricOption[]>);
  
  // Category display names
  const categoryNames = {
    engagement: "Engajamento",
    conversion: "Conversão",
    retention: "Retenção",
    revenue: "Receita"
  };

  // Function to generate report
  const generateReport = async () => {
    if (selectedMetrics.length === 0) {
      toast({
        title: "Nenhuma métrica selecionada",
        description: "Selecione pelo menos uma métrica para gerar o relatório",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      toast({
        title: "Gerando relatório",
        description: "O relatório está sendo preparado...",
      });
      
      // Call the real export function
      await exportReportToCSV('custom', timeRange, { 
        metrics: selectedMetrics.join(','),
        chart_type: chartType
      });
      
      toast({
        title: "Relatório gerado com sucesso",
        description: "O relatório foi baixado para o seu computador.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório solicitado.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to clear selection
  const clearSelection = () => {
    setSelectedMetrics([]);
  };
  
  const handleSaveReport = async () => {
    toast({
      title: "Relatório salvo",
      description: "O modelo de relatório foi salvo para uso futuro",
    });
  };
  
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Construtor de Relatórios</span>
          <Button size="sm" onClick={handleSaveReport}>Salvar Relatório</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tipo de Visualização</h3>
              <div className="flex gap-2">
                <Button 
                  variant={chartType === "bar" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setChartType("bar")}
                  className="flex-1"
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Barras
                </Button>
                <Button 
                  variant={chartType === "line" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setChartType("line")}
                  className="flex-1"
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  Linhas
                </Button>
                <Button 
                  variant={chartType === "pie" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setChartType("pie")}
                  className="flex-1"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Pizza
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Período de Tempo</h3>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="90days">Últimos 90 dias</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Métricas</h3>
              <Tabs defaultValue="engagement">
                <TabsList className="grid grid-cols-4 h-auto">
                  <TabsTrigger value="engagement" className="text-xs py-1.5">Engajamento</TabsTrigger>
                  <TabsTrigger value="conversion" className="text-xs py-1.5">Conversão</TabsTrigger>
                  <TabsTrigger value="retention" className="text-xs py-1.5">Retenção</TabsTrigger>
                  <TabsTrigger value="revenue" className="text-xs py-1.5">Receita</TabsTrigger>
                </TabsList>
                
                {Object.entries(metricsByCategory).map(([category, metrics]) => (
                  <TabsContent key={category} value={category} className="space-y-2 mt-2">
                    {metrics.map(metric => (
                      <div key={metric.id} className="flex items-start gap-2">
                        <Checkbox 
                          id={metric.id} 
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={() => toggleMetric(metric.id)}
                        />
                        <div>
                          <label htmlFor={metric.id} className="text-sm font-medium cursor-pointer block">
                            {metric.name}
                          </label>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
          
          {/* Preview Panel */}
          <div className="md:col-span-2">
            <div className="border rounded-md p-4 h-[350px] flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Prévia do Relatório</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMetrics.length > 0 ? (
                    <>
                      Visualização de {chartType === "bar" ? "barras" : chartType === "line" ? "linhas" : "pizza"} para {selectedMetrics.length} métricas
                    </>
                  ) : (
                    "Selecione pelo menos uma métrica para visualizar"
                  )}
                </p>
                <div className="mt-4">
                  {selectedMetrics.length > 0 && (
                    <ul className="inline-flex flex-wrap gap-2 justify-center">
                      {selectedMetrics.map(id => {
                        const metric = metricOptions.find(m => m.id === id);
                        return metric ? (
                          <li key={id} className="text-xs px-2 py-1 bg-secondary rounded-full">
                            {metric.name}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={clearSelection}>Limpar Seleção</Button>
              <Button onClick={generateReport} disabled={selectedMetrics.length === 0 || isGenerating}>
                {isGenerating ? (
                  "Gerando..."
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
