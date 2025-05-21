
import { Button } from "@/components/ui/button";
import { Timer, Lock } from "lucide-react";
import { useTrialStatus } from "@/hooks/use-trial-status";
import { Link } from "react-router-dom";

export function TrialBanner() {
  const { isInTrial, daysRemaining, hoursRemaining } = useTrialStatus();

  if (!isInTrial) return null;

  const isNearingEnd = daysRemaining === 0 && hoursRemaining < 12;

  return (
    <div className={`rounded-md p-4 mb-6 ${isNearingEnd ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800' : 'bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800'}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Timer className={`h-5 w-5 ${isNearingEnd ? 'text-amber-500' : 'text-blue-500'}`} />
          <span className="font-medium">
            {daysRemaining > 0 ? (
              `Período de teste: ${daysRemaining} dias restantes`
            ) : hoursRemaining > 0 ? (
              `Período de teste: ${hoursRemaining} horas restantes`
            ) : (
              'Seu período de teste está acabando!'
            )}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/pricing">Ver planos</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth/payment">Assinar agora</Link>
          </Button>
        </div>
      </div>
      
      <p className="mt-2 text-sm text-muted-foreground">
        Você tem acesso a 3 fornecedores que mudam a cada 24h. Assine para ter acesso completo a todos os fornecedores.
      </p>
    </div>
  );
}
