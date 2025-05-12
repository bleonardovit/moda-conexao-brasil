import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getReportData } from "@/services/reportService";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  target?: number;
  unit?: string;
  description?: string;
  isLoading?: boolean;
}

export function KPICard({ title, value, change, target, unit, description, isLoading = false }: KPICardProps) {
  const isPositive = change >= 0;
  const percentComplete = target ? Math.min(Number(value) / target * 100, 100) : null;
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 pt-3">
          <div className="flex justify-between items-center mb-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          {target && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          )}
          {description && <Skeleton className="mt-2 h-4 w-full" />}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4 pt-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={`flex items-center text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {change > 0 ? '+' : ''}{change}%
          </div>
        </div>
        
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        
        {target && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{value} / {target} {unit}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${percentComplete! >= 100 ? "bg-green-500" : "bg-primary"}`}
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {description && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function KPIGrid() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['report-data'],
    queryFn: () => getReportData()
  });
  
  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-500">
        Erro ao carregar dados dos KPIs: {(error as Error).message}
      </div>
    );
  }

  const kpis = [
    {
      title: "Novas Usuárias",
      value: isLoading ? 0 : data?.users.newUsersLast30Days || 0,
      change: isLoading ? 0 : data?.users.growthRate || 0,
      target: 200,
      description: "Novos registros este mês"
    },
    {
      title: "Taxa de Conversão",
      value: isLoading ? 0 : data?.conversions.visitToRegister || 0,
      change: isLoading ? 0 : data?.conversions.registerToSubscription > data?.conversions.visitToRegister ? 1.2 : -0.8,
      unit: "%",
      target: 10,
      description: "De visitante para assinante"
    },
    {
      title: "Receita Mensal",
      value: isLoading ? "R$ 0" : `R$ ${Math.floor((data?.users.totalUsers || 0) * 25).toLocaleString()}`,
      change: isLoading ? 0 : data?.users.growthRate || 0,
      description: "Crescimento em relação ao mês anterior"
    },
    {
      title: "Retenção",
      value: isLoading ? 0 : data?.conversions.retentionRates.thirtyDays || 0,
      change: isLoading ? 0 : data?.conversions.churnRate > 3 ? -1.5 : 0.7,
      unit: "%",
      target: 95,
      description: "Taxa de retenção de usuárias"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard 
          key={index}
          title={kpi.title}
          value={kpi.value}
          change={kpi.change}
          unit={kpi.unit}
          target={kpi.target}
          description={kpi.description}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
