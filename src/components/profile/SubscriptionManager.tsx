
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { User } from '@/types';

// Define planos disponíveis
const PLANS = [
  { 
    id: 'monthly', 
    name: 'Plano Mensal', 
    price: 'R$ 49,90/mês',
    description: 'Acesso a todas as funcionalidades com pagamento mensal.'
  },
  { 
    id: 'annual', 
    name: 'Plano Anual', 
    price: 'R$ 479,90/ano',
    description: 'Economize 20% com pagamento anual.'
  }
];

interface SubscriptionManagerProps {
  user: User;
}

export function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(user.subscription_type);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const handlePlanChange = (newPlan: string) => {
    setSelectedPlan(newPlan);
  };
  
  const handleChangePlan = async () => {
    if (selectedPlan === user.subscription_type) {
      setIsDialogOpen(false);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Plano alterado para ${selectedPlan === 'monthly' ? 'Mensal' : 'Anual'} com sucesso!`);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao alterar plano");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Assinatura cancelada com sucesso!");
    } catch (error) {
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sua Assinatura</CardTitle>
        <CardDescription>
          Detalhes do seu plano atual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">
                Plano {user.subscription_type === 'monthly' ? 'Mensal' : 'Anual'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            <SubscriptionBadge status={user.subscription_status} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Data de Início</h3>
            <p>{user.subscription_start_date ? formatDate(user.subscription_start_date) : 'N/A'}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Próxima cobrança</h3>
            <p>
              {user.subscription_start_date 
                ? (() => {
                    const nextDate = new Date(user.subscription_start_date);
                    nextDate.setMonth(nextDate.getMonth() + (user.subscription_type === 'monthly' ? 1 : 12));
                    return formatDate(nextDate.toISOString());
                  })()
                : 'N/A'
              }
            </p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Valor</h3>
            <p>{user.subscription_type === 'monthly' ? 'R$ 49,90/mês' : 'R$ 479,90/ano'}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full ${user.subscription_status === 'active' ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></span>
              <span>{user.subscription_status === 'active' ? 'Ativa' : 'Pendente'}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Gerenciar assinatura
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Assinatura</DialogTitle>
              <DialogDescription>
                Escolha ou altere seu plano de assinatura
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <RadioGroup value={selectedPlan} onValueChange={handlePlanChange}>
                {PLANS.map(plan => (
                  <div key={plan.id} className="flex items-center space-x-2 border rounded-md p-3 my-2">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                      <div>
                        <span className="font-medium">{plan.name}</span>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="font-semibold text-brand-purple">{plan.price}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processando..." : "Cancelar assinatura"}
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
                Fechar
              </Button>
              <Button onClick={handleChangePlan} disabled={isProcessing || selectedPlan === user.subscription_type}>
                {isProcessing ? "Processando..." : "Confirmar alteração"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <p className="text-xs text-muted-foreground text-center">
          Você pode alterar seu plano ou método de pagamento a qualquer momento.
        </p>
      </CardFooter>
    </Card>
  );
}

function SubscriptionBadge({ status }: { status: string }) {
  const className = status === 'active' 
    ? 'bg-green-500' 
    : 'bg-amber-500';
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${className}`}>
      {status === 'active' ? 'Ativo' : 'Pendente'}
    </span>
  );
}
