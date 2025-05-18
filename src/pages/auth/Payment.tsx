import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, Loader2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type PlanType = 'monthly' | 'yearly';

// Define more specific types for each plan to help TypeScript
interface MonthlyPlan {
  name: string;
  price: string;
  id: string;
  description: string;
  features: string[];
  originalPrice?: undefined; // Explicitly state originalPrice is not on monthly
}

interface YearlyPlan {
  name: string;
  price: string;
  id: string;
  originalPrice: string;
  description: string;
  features: string[];
}

type PlanDetailsType = {
  monthly: MonthlyPlan;
  yearly: YearlyPlan;
};

const planDetails: PlanDetailsType = {
  monthly: {
    name: 'Plano Mensal',
    price: 'R$ 9,70',
    id: 'prod_SKDr4FhH8ZMx1z', 
    description: 'Acesso completo por um mês.',
    features: ['Acesso a todos os fornecedores', 'Suporte prioritário', 'Atualizações mensais']
  },
  yearly: {
    name: 'Plano Anual',
    price: 'R$ 87,00',
    id: 'prod_SKDstDNOxG1OOV',
    originalPrice: 'R$ 116,40',
    description: 'Economize com o plano anual.',
    features: ['Acesso a todos os fornecedores', 'Suporte prioritário', 'Atualizações mensais', 'Desconto de 20%']
  } 
};

export default function Payment() {
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly'); 

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const planFromUrl = queryParams.get('plan') as PlanType;
    if (planFromUrl === 'monthly' || planFromUrl === 'yearly') {
      setSelectedPlan(planFromUrl);
    }

    const success = queryParams.get('payment_success');
    const cancelled = queryParams.get('payment_cancelled');

    if (success === 'true') {
      setIsComplete(true);
      toast({
        title: "Pagamento processado com sucesso!",
        description: "Sua assinatura está ativa. Bem-vindo à Conexão Brasil!"
      });

      if (user && user.id) {
        const updateProfileWithSubscription = async () => {
          try {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_type: selectedPlan, 
                subscription_start_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            if (updateError) throw updateError;
          } catch (e) {
            console.error("Erro ao atualizar perfil após pagamento:", e);
            toast({
              variant: "destructive",
              title: "Erro ao finalizar configuração",
              description: "Seu pagamento foi processado, mas houve um problema ao atualizar seu status. Contate o suporte.",
            });
          }
        };
        
        updateProfileWithSubscription().finally(() => {
          setTimeout(() => navigate('/suppliers'), 3000);
        });
      } else {
        console.warn("User context not available after successful payment for profile update.");
        setTimeout(() => navigate('/suppliers'), 3000);
      }
    } else if (cancelled === 'true') {
      toast({
        variant: "destructive",
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento. Sua assinatura não foi ativada."
      });
    }
  }, [location.search, navigate, toast, user, selectedPlan]);

  const handlePayment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Usuário não autenticado", description: "Por favor, faça login para continuar." });
      navigate('/auth/login');
      return;
    }
    setIsLoadingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType: selectedPlan, userEmail: user.email, userId: user.id }
      });
      if (error) throw new Error(error.message || 'Falha ao iniciar o checkout.');
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Não foi possível obter a URL de checkout do Stripe.');
      }
    } catch (error) {
      console.error('Erro no processo de pagamento:', error);
      toast({ variant: "destructive", title: "Erro no Processamento", description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente." });
      setIsLoadingPayment(false); 
    }
  }, [user, selectedPlan, toast, navigate]);

  const currentPlanDetails = planDetails[selectedPlan];

  const handlePlanSelection = (plan: PlanType) => {
    setSelectedPlan(plan);
    navigate(`/auth/payment?plan=${plan}`, { replace: true });
  };

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: '#a164f1' }}>
        <Card className="w-full max-w-md bg-slate-900 shadow-2xl rounded-xl border-slate-700">
          <CardHeader className="space-y-2 text-center p-6 sm:p-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
              Pagamento Confirmado!
            </CardTitle>
            <CardDescription className="text-base text-slate-400">
              Sua conta foi ativada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center p-6 sm:p-8">
            <div className="py-8 text-white">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 ring-2 ring-green-500">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="text-xl mb-1 font-semibold text-slate-100">Assinatura Ativada!</p>
              <p className="text-slate-300">
                Seu pagamento foi processado e sua conta está ativa.
              </p>
            </div>
            <Button className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white" onClick={() => navigate('/home')}>
              Acessar a plataforma
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: '#a164f1' }}>
      <Card className="w-full max-w-lg bg-slate-900 shadow-2xl rounded-xl border-slate-700">
        <CardHeader className="space-y-2 text-center p-6 sm:p-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Escolha seu Plano
          </CardTitle>
          <CardDescription className="text-base text-slate-400">
            Selecione o plano que melhor se adapta às suas necessidades.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handlePayment}>
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Object.keys(planDetails) as PlanType[]).map((planKey) => {
                const plan = planDetails[planKey];
                const isSelected = selectedPlan === planKey;
                return (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelection(planKey)}
                    className={cn(
                      "cursor-pointer rounded-lg border-2 p-6 transition-all transform hover:scale-[1.02] bg-slate-800/70 hover:bg-slate-700/90",
                      isSelected ? "border-brand.purple shadow-lg ring-2 ring-brand.pink" : "border-slate-700 hover:border-brand.lightPurple"
                    )}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                      {isSelected && (
                        <div className="bg-brand.purple text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <Check size={14} className="mr-1" /> SELECIONADO
                        </div>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                      {plan.price}
                      <span className="text-sm font-normal text-slate-400">{planKey === 'monthly' ? '/mês' : '/ano'}</span>
                    </p>
                    {planKey === 'yearly' && plan.originalPrice && (
                      <p className="text-sm text-slate-400 mb-3">
                        De <span className="line-through text-red-400">{plan.originalPrice}</span>
                      </p>
                    )}
                    <p className="text-sm text-slate-300 mb-4">{plan.description}</p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle size={16} className="text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center pt-4">
                <p className="text-sm text-slate-300">
                Total: <span className="font-bold text-slate-100 text-lg">{currentPlanDetails.price}</span>
                  {selectedPlan === 'yearly' && currentPlanDetails.originalPrice && (
                    <span className="block text-xs text-slate-500 mt-1">
                      (Economia de R$ { (parseFloat(currentPlanDetails.originalPrice.replace('R$ ', '').replace(',', '.')) - parseFloat(currentPlanDetails.price.replace('R$ ', '').replace(',', '.'))).toFixed(2).replace('.',',')} )
                    </span>
                  )}
                </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 p-6 sm:p-8">
            <Button type="submit" className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white text-lg py-3" disabled={isLoadingPayment}>
              {isLoadingPayment ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <CreditCard size={20} className="mr-2" />
                  Pagar com Stripe ({currentPlanDetails.price})
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-slate-500 pt-2">
              Seus dados estão seguros. Utilizamos criptografia de ponta a ponta. Pagamento processado por Stripe.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
