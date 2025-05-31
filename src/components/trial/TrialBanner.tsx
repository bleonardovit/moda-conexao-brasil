
import { Button } from "@/components/ui/button";
import { Timer, Lock, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { useTrialStatus } from "@/hooks/use-trial-status";
import { Link } from "react-router-dom";

export function TrialBanner() {
  const { isInTrial, daysRemaining, hoursRemaining, hasExpired, isVerified } = useTrialStatus();

  // Não renderizar nada até que a verificação seja concluída
  if (!isVerified) {
    return null;
  }

  if (hasExpired) {
    return (
      <div className="rounded-md p-4 mb-6 bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-700 dark:text-red-300">
              Seu período de teste gratuito expirou!
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/pricing">Ver planos</Link>
            </Button>
            <Button size="sm" asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link to="/auth/payment">Assinar agora</Link>
            </Button>
          </div>
        </div>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Assine para recuperar o acesso completo a todos os fornecedores e funcionalidades.
        </p>
      </div>
    );
  }

  if (!isInTrial) {
    // Not in trial and not expired (e.g., subscribed or never started trial)
    return null;
  }

  // If in trial and not expired:
  const isNearingEnd = daysRemaining === 0 && hoursRemaining < 12 && hoursRemaining > 0;
  const isLastHours = daysRemaining === 0 && hoursRemaining <= 0; // Should be covered by hasExpired, but good for text

  let messageText = "";
  if (daysRemaining > 0) {
    messageText = `Período de teste: ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''} restante${daysRemaining > 1 ? 's' : ''}`;
  } else if (hoursRemaining > 0) {
    messageText = `Período de teste: ${hoursRemaining} hora${hoursRemaining > 1 ? 's' : ''} restante${hoursRemaining > 1 ? 's' : ''}`;
  } else {
    messageText = 'Seu período de teste está acabando!';
  }
  
  // Handle case where trial might be active but time is up (before next interval updates hasExpired)
  if (daysRemaining === 0 && hoursRemaining === 0 && !hasExpired) {
      messageText = 'Seu período de teste terminou. Atualizando...';
  }


  return (
    <div className={`rounded-md p-4 mb-6 ${isNearingEnd ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800' : 'bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800'}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Timer className={`h-5 w-5 ${isNearingEnd ? 'text-amber-500' : 'text-blue-500'}`} />
          <span className="font-medium">
            {messageText}
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
