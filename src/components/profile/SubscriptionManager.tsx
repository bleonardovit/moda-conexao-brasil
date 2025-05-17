
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, CheckCircle, CreditCard, AlertCircle, ExternalLink } from 'lucide-react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

interface SubscriptionManagerProps {
  user: User;
}

export function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.url) {
        window.open(data.url, '_blank');
        toast({
          title: 'Portal de Gerenciamento Aberto',
          description: 'Você foi redirecionado para gerenciar sua assinatura.',
        });
      } else {
        throw new Error('Não foi possível obter a URL do portal de gerenciamento.');
      }
    } catch (error) {
      console.error('Erro ao gerenciar assinatura:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível acessar o portal. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const getNextBillingDate = () => {
    if (!user.subscription_start_date) return 'N/A';
    
    const startDate = new Date(user.subscription_start_date);
    const nextDate = new Date(startDate);
    
    if (user.subscription_type === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (user.subscription_type === 'yearly') { // Corrected to 'yearly'
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
        return 'N/A';
    }
    
    return formatDate(nextDate.toISOString());
  };
  
  const getPlanValue = () => {
    if (user.subscription_type === 'monthly') return 'R$ 9,70/mês';
    if (user.subscription_type === 'yearly') return 'R$ 87,00/ano'; // Corrected to 'yearly'
    return 'N/A';
  };

  const getPlanName = () => {
    if (user.subscription_type === 'monthly') return 'Plano Mensal';
    if (user.subscription_type === 'yearly') return 'Plano Anual'; // Corrected to 'yearly'
    return 'Nenhum plano ativo';
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sua Assinatura</CardTitle>
        <CardDescription>
          Detalhes do seu plano atual e opções de gerenciamento.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium flex items-center">
                {user.subscription_status === 'active' ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />}
                {getPlanName()}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.subscription_status === 'active' ? 'Ativo' : 
                 user.subscription_status === 'pending' ? 'Pendente' : 'Inativo'}
              </p>
            </div>
            <span 
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.subscription_status === 'active' ? 'bg-green-500 text-white' : 
                user.subscription_status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
              }`}
            >
              {user.subscription_status === 'active' ? 'Ativo' : 
               user.subscription_status === 'pending' ? 'Pendente' : 'Inativo'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Data de Início
            </h3>
            <p>{formatDate(user.subscription_start_date)}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Próxima cobrança
            </h3>
            <p>{user.subscription_status === 'active' ? getNextBillingDate() : 'N/A'}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <CreditCard className="h-4 w-4 mr-1" /> Valor
            </h3>
            <p>{user.subscription_status === 'active' ? getPlanValue() : 'N/A'}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" /> Status
            </h3>
            <div className="flex items-center">
              {user.subscription_status === 'active' && <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>}
              {user.subscription_status === 'inactive' && <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>}
              {user.subscription_status === 'pending' && <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>}
              <span>{user.subscription_status === 'active' ? 'Ativa' : user.subscription_status === 'pending' ? 'Pendente' : 'Inativa'}</span>
            </div>
          </div>
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
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Gerenciar Assinatura e Pagamento
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Você será redirecionado ao portal do Stripe para gerenciar seu plano ou método de pagamento.
        </p>
      </CardFooter>
    </Card>
  );
}

