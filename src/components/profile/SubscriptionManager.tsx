
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Calendar, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import { User } from '@/types';

interface SubscriptionManagerProps {
  user: User;
}

export function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  
  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulating opening a payment portal
      window.open('https://example.com/payment', '_blank');
      
      toast({
        title: 'Portal de pagamento aberto',
        description: 'Você foi redirecionado para o portal de gerenciamento de assinatura.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar o portal de assinatura. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangePlan = async () => {
    setIsChangingPlan(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Plano alterado',
        description: user.subscription_type === 'monthly' 
          ? 'Seu plano foi alterado para anual com sucesso!' 
          : 'Seu plano foi alterado para mensal com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o plano. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsChangingPlan(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const getNextBillingDate = () => {
    if (!user.subscription_start_date) return 'N/A';
    
    const startDate = new Date(user.subscription_start_date);
    const nextDate = new Date(startDate);
    
    if (user.subscription_type === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    
    return formatDate(nextDate.toISOString());
  };
  
  const getPlanValue = () => {
    return user.subscription_type === 'monthly' ? 'R$ 49,90/mês' : 'R$ 479,90/ano';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sua Assinatura</CardTitle>
        <CardDescription>
          Detalhes do seu plano atual e opções de gerenciamento
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Plano {user.subscription_type === 'monthly' ? 'Mensal' : 'Anual'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            <span 
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.subscription_status === 'active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
              }`}
            >
              {user.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Data de Início
            </h3>
            <p>{user.subscription_start_date ? formatDate(user.subscription_start_date) : 'N/A'}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Próxima cobrança
            </h3>
            <p>{getNextBillingDate()}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <CreditCard className="h-4 w-4 mr-1" /> Valor
            </h3>
            <p>{getPlanValue()}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" /> Status
            </h3>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <span>Ativa</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleChangePlan}
            disabled={isChangingPlan}
          >
            {isChangingPlan ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Mudar para plano {user.subscription_type === 'monthly' ? 'anual' : 'mensal'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          onClick={handleManageSubscription} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : 'Gerenciar método de pagamento'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Você pode alterar seu plano ou método de pagamento a qualquer momento.
        </p>
      </CardFooter>
    </Card>
  );
}
