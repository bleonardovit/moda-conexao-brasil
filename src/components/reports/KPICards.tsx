
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  target?: number;
  unit?: string;
  description?: string;
}

export function KPICard({ title, value, change, target, unit, description }: KPICardProps) {
  const isPositive = change >= 0;
  const percentComplete = target ? Math.min(Number(value) / target * 100, 100) : null;
  
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
  const kpis = [
    {
      title: "Novas Usuárias",
      value: 156,
      change: 12.4,
      target: 200,
      description: "Novos registros este mês"
    },
    {
      title: "Taxa de Conversão",
      value: 8.7,
      change: 1.2,
      unit: "%",
      target: 10,
      description: "De visitante para assinante"
    },
    {
      title: "Receita Mensal",
      value: "R$ 12.540",
      change: 15.8,
      description: "Crescimento em relação ao mês anterior"
    },
    {
      title: "Retenção",
      value: 92.3,
      change: -1.5,
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
        />
      ))}
    </div>
  );
}
