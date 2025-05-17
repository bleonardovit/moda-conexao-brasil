import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type PlanType = 'monthly' | 'yearly';

// Plan details should be consistent with what's configured in Stripe Products and Prices
const planDetails = {
  monthly: { name: 'Plano Mensal', price: 'R$ 9,70', id: 'prod_SKDr4FhH8ZMx1z' }, // Corresponds to MONTHLY_PLAN_ID in edge function
  yearly: { name: 'Plano Anual', price: 'R$ 87,00', id: 'prod_SKDstDNOxG1OOV', originalPrice: 'R$ 116,40' }, // Corresponds to YEARLY_PLAN_ID
};

export default function Payment() {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly'); // Default plan
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const planFromUrl = queryParams.get('plan') as PlanType;
    if (planFromUrl === 'monthly' || planFromUrl === 'yearly') {
      setSelectedPlan(planFromUrl);
      console.log("Plano selecionado via URL:", planFromUrl);
    } else {
      console.log("Nenhum plano válido na URL, usando default:", selectedPlan);
    }
    
    const success = queryParams.get('payment_success');
    const cancelled = queryParams.get('payment_cancelled');

    if (success === 'true') {
        setIsComplete(true);
        toast({
            title: "Pagamento processado com sucesso!",
            description: "Sua assinatura está ativa. Bem-vindo à Conexão Brasil!",
        });
        setTimeout(() => {
            navigate('/suppliers');
        }, 3000);
    } else if (cancelled === 'true') {
        toast({
            variant: "destructive",
            title: "Pagamento cancelado",
            description: "Você cancelou o processo de pagamento. Sua assinatura não foi ativada.",
        });
        // navigate('/'); // Redirect to home or pricing. Keep them on payment to allow retry or plan change.
    }
  }, [location.search, navigate, toast, selectedPlan]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({
            variant: "destructive",
            title: "Usuário não autenticado",
            description: "Por favor, faça login para continuar.",
        });
        navigate('/auth/login');
        return;
    }
    setIsLoading(true);
    
    try {
      console.log("Iniciando pagamento para o plano:", selectedPlan);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType: selectedPlan }
      });

      if (error) {
        console.error('Erro ao invocar create-checkout:', error);
        throw new Error(error.message || 'Falha ao iniciar o checkout.');
      }

      if (data && data.url) {
        console.log("Redirecionando para URL do Stripe:", data.url);
        window.location.href = data.url;
      } else {
        console.error("Resposta da função create-checkout não continha URL:", data);
        throw new Error('Não foi possível obter a URL de checkout do Stripe.');
      }
    } catch (error) {
      console.error('Erro no processo de pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
      });
      setIsLoading(false); // Only set to false if an error occurs before redirection
    }
    // setIsLoading(false) is typically not called here if redirection happens,
    // but added above in catch for safety.
  };

  const currentPlanDetails = planDetails[selectedPlan];

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
        <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
              Pagamento Confirmado!
            </CardTitle>
            <CardDescription className="text-gray-200"> {/* Legibility Change */}
              Sua conta foi ativada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="py-8 text-white">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-xl mb-1">Assinatura Ativada!</p>
              <p className="text-gray-300"> {/* Legibility Change */}
                Seu pagamento foi processado com sucesso e sua conta está ativa.
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white" 
              onClick={() => navigate('/suppliers')}
            >
              Acessar a plataforma
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
      <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Finalizar Assinatura
          </CardTitle>
          <CardDescription className="text-gray-200"> {/* Legibility Change */}
            Você está assinando o <span className="font-semibold text-white">{currentPlanDetails.name}</span>.
            {selectedPlan === 'yearly' && planDetails.yearly.originalPrice && (
              <span className="block text-sm text-gray-300"> {/* Legibility Change */}
                De <span className="line-through">{planDetails.yearly.originalPrice}</span> por {planDetails.yearly.price} à vista.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handlePayment}>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-100"> {/* Legibility Change */}
              Você será redirecionado para o ambiente seguro do Stripe para finalizar o pagamento.
            </p>
            <div className="flex justify-center space-x-2 mt-4">
                <Button 
                    type="button"
                    variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
                    onClick={() => { setSelectedPlan('monthly'); navigate('/auth/payment?plan=monthly', { replace: true }); }}
                    className={selectedPlan === 'monthly' ? "bg-gradient-to-r from-brand.purple to-brand.pink text-white" : "text-gray-300 border-white/20 hover:bg-white/5"}
                >
                    Mudar para Mensal ({planDetails.monthly.price})
                </Button>
                <Button 
                    type="button"
                    variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
                    onClick={() => { setSelectedPlan('yearly'); navigate('/auth/payment?plan=yearly', { replace: true }); }}
                    className={selectedPlan === 'yearly' ? "bg-gradient-to-r from-brand.purple to-brand.pink text-white" : "text-gray-300 border-white/20 hover:bg-white/5"}
                >
                    Mudar para Anual ({planDetails.yearly.price})
                </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-gray-300 mb-2"> {/* Legibility Change */}
              Total: <span className="text-white font-bold">{currentPlanDetails.price}</span>
            </p>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white" 
              disabled={isLoading}
            >
              {isLoading ? (
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
            
            <p className="text-xs text-center text-gray-400 mt-2"> {/* Legibility Change */}
              Seus dados estão seguros. Utilizamos criptografia de ponta a ponta.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
