import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChartIcon, LineChartIcon, PieChartIcon, FileSpreadsheet, DraftingCompass } from "lucide-react";
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
    { id: "trial_to_paid", name: "Conversão Teste > Pago", description: "Usuários que converteram do teste gratuito", category: "conversion" },
    { id: "retention_rate", name: "Taxa de Retenção", description: "Usuários que continuam ativos", category: "retention" },
    { id: "churn_rate", name: "Taxa de Cancelamento", description: "Usuários que cancelaram assinatura", category: "retention" },
    { id: "mrr", name: "Receita Mensal Recorrente", description: "Receita mensal de assinaturas", category: "revenue" },
    { id: "arpu", name: "Receita Média por Usuário", description: "Valor médio por usuário", category: "revenue" },
    { id: "ltv", name: "Valor de Vida do Cliente", description: "Receita esperada por cliente", category: "revenue" },
    { id: "blocked_free_users", name: "Usuários Gratuitos Bloqueados", description: "Usuários com teste expirado não convertidos", category: "conversion" },
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
      await exportReportToCSV('custom_report', timeRange, { 
        metrics: selectedMetrics.join(','),
        chart_type: chartType,
        // Potentially add other filters if available in UI
      });
      
      toast({
        title: "Relatório gerado com sucesso",
        description: "O relatório foi baixado para o seu computador.", // This is a mock download
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: (error as Error).message || "Não foi possível gerar o relatório solicitado.",
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
    // This is a placeholder for saving report configurations
    toast({
      title: "Relatório salvo (simulado)",
      description: "O modelo de relatório foi salvo para uso futuro (funcionalidade pendente).",
    });
  };
  
  const renderChartIcon = () => {
    switch(chartType) {
      case 'bar': return <BarChartIcon className="h-16 w-16 text-primary" />;
      case 'line': return <LineChartIcon className="h-16 w-16 text-primary" />;
      case 'pie': return <PieChartIcon className="h-16 w-16 text-primary" />;
      default: return <DraftingCompass className="h-16 w-16 text-muted-foreground" />;
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Construtor de Relatórios</span>
          <Button size="sm" onClick={handleSaveReport}>Salvar Modelo</Button>
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
                  <BarChartIcon className="h-4 w-4 mr-2" /> {/* Use Icon component */}
                  Barras
                </Button>
                <Button 
                  variant={chartType === "line" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setChartType("line")}
                  className="flex-1"
                >
                  <LineChartIcon className="h-4 w-4 mr-2" /> {/* Use Icon component */}
                  Linhas
                </Button>
                <Button 
                  variant={chartType === "pie" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setChartType("pie")}
                  className="flex-1"
                >
                  <PieChartIcon className="h-4 w-4 mr-2" /> {/* Use Icon component */}
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
              <Tabs defaultValue="engagement" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                  {Object.keys(metricsByCategory).map(categoryKey => (
                     <TabsTrigger 
                        key={categoryKey} 
                        value={categoryKey} 
                        className="text-xs py-1.5"
                      >
                        {categoryNames[categoryKey as keyof typeof categoryNames]}
                      </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(metricsByCategory).map(([category, metrics]) => (
                  <TabsContent key={category} value={category} className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                    {metrics.map(metric => (
                      <div key={metric.id} className="flex items-start gap-2 p-1 hover:bg-muted/50 rounded">
                        <Checkbox 
                          id={metric.id} 
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={() => toggleMetric(metric.id)}
                          aria-label={`Selecionar ${metric.name}`}
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
            <div className="border rounded-md p-4 min-h-[350px] flex flex-col items-center justify-center bg-muted/30">
              {selectedMetrics.length > 0 ? (
                <>
                  <div className="mb-4">
                    {renderChartIcon()}
                  </div>
                  <p className="text-lg font-medium mb-2">
                    Prévia: Gráfico de {chartType === "bar" ? "Barras" : chartType === "line" ? "Linhas" : "Pizza"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Período: {
                      {
                        "7days": "Últimos 7 dias",
                        "30days": "Últimos 30 dias",
                        "90days": "Últimos 90 dias",
                        "year": "Este ano"
                      }[timeRange]
                    }
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Métricas Selecionadas:</p>
                  {selectedMetrics.length > 0 && (
                    <ul className="flex flex-wrap gap-2 justify-center max-w-md">
                      {selectedMetrics.map(id => {
                        const metric = metricOptions.find(m => m.id === id);
                        return metric ? (
                          <li key={id} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                            {metric.name}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <DraftingCompass className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-lg font-medium mb-2">Prévia do Relatório</p>
                  <p className="text-sm text-muted-foreground">
                    Selecione tipo de visualização, período e pelo menos uma métrica para visualizar.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={clearSelection} disabled={selectedMetrics.length === 0}>Limpar Seleção</Button>
              <Button onClick={generateReport} disabled={selectedMetrics.length === 0 || isGenerating}>
                {isGenerating ? (
                  "Gerando..."
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Gerar Relatório CSV
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
