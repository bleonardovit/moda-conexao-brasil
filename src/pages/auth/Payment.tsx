
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input'; // No inputs on this page for the new layout
// import { Label } from '@/components/ui/label'; // No labels on this page for the new layout
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Not used directly in new layout, plan buttons instead
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type PlanType = 'monthly' | 'yearly';

const planDetails = {
  monthly: {
    name: 'Plano Mensal',
    price: 'R$ 9,70',
    id: 'prod_SKDr4FhH8ZMx1z' 
  },
  yearly: {
    name: 'Plano Anual',
    price: 'R$ 87,00',
    id: 'prod_SKDstDNOxG1OOV',
    originalPrice: 'R$ 116,40'
  } 
};

export default function Payment() {
  const [isLoadingPayment, setIsLoadingPayment] = useState(false); // Renamed to avoid conflict if useAuth.isLoading is used
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
                subscription_type: selectedPlan, // Use the selectedPlan from state, which is updated from URL
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
        setTimeout(() => navigate('/suppliers'), 3000);
      }
    } else if (cancelled === 'true') {
      toast({
        variant: "destructive",
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento. Sua assinatura não foi ativada."
      });
    }
  }, [location.search, navigate, toast, user, selectedPlan]); // Added selectedPlan to dependency array

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
            <Button className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white" onClick={() => navigate('/suppliers')}>
              Acessar a plataforma
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: '#a164f1' }}>
      <Card className="w-full max-w-md bg-slate-900 shadow-2xl rounded-xl border-slate-700">
        <CardHeader className="space-y-2 text-center p-6 sm:p-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Finalizar Assinatura
          </CardTitle>
          <CardDescription className="text-base text-slate-400">
            Você está assinando o <span className="font-semibold text-brand.lightPurple">{currentPlanDetails.name}</span>.
            {selectedPlan === 'yearly' && 'originalPrice' in planDetails.yearly && (
              <span className="block text-sm text-slate-500">
                De <span className="line-through text-red-400">{planDetails.yearly.originalPrice}</span> por {planDetails.yearly.price} à vista.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handlePayment}>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <p className="text-center text-slate-300">
              Você será redirecionado para o ambiente seguro do Stripe para finalizar o pagamento.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                <Button 
                  type="button" 
                  variant={selectedPlan === 'monthly' ? 'default' : 'outline'} 
                  onClick={() => {
                    setSelectedPlan('monthly');
                    navigate('/auth/payment?plan=monthly', { replace: true });
                  }} 
                  className={`w-full sm:w-auto ${selectedPlan === 'monthly' ? "bg-gradient-to-r from-brand.purple to-brand.pink text-white" : "text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-white bg-slate-800"}`}
                >
                    Mensal ({planDetails.monthly.price})
                </Button>
                <Button 
                  type="button" 
                  variant={selectedPlan === 'yearly' ? 'default' : 'outline'} 
                  onClick={() => {
                    setSelectedPlan('yearly');
                    navigate('/auth/payment?plan=yearly', { replace: true });
                  }} 
                  className={`w-full sm:w-auto ${selectedPlan === 'yearly' ? "bg-gradient-to-r from-brand.purple to-brand.pink text-white" : "text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-white bg-slate-800"}`}
                >
                    Anual ({planDetails.yearly.price})
                </Button>
            </div>
             <div className="text-center pt-4">
                <p className="text-sm text-slate-300">
                Total: <span className="font-bold text-slate-100 text-lg">{currentPlanDetails.price}</span>
                </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 p-6 sm:p-8">
            <Button type="submit" className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white" disabled={isLoadingPayment}>
              {isLoadingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <CreditCard size={18} className="mr-2" />
                  Pagar com Stripe
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-slate-500 pt-2">
              Seus dados estão seguros. Utilizamos criptografia de ponta a ponta.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
