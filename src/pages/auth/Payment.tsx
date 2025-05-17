import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Banknote, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { useAuth } from '@/hooks/useAuth'; // To check if user is authenticated

type PlanType = 'monthly' | 'yearly';

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState('card'); // Default to card, Stripe handles this
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false); // For post-payment success message
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const plan = queryParams.get('plan') as PlanType;
    if (plan === 'monthly' || plan === 'yearly') {
      setSelectedPlan(plan);
    }
    // Check for Stripe success/cancel query params
    const success = queryParams.get('payment_success');
    const cancelled = queryParams.get('payment_cancelled');

    if (success === 'true') {
        setIsComplete(true);
        toast({
            title: "Pagamento processado com sucesso!",
            description: "Sua assinatura está ativa. Bem-vindo à Conexão Brasil!",
        });
        // Optionally fetch subscription status from backend here
        setTimeout(() => {
            navigate('/suppliers'); // Or profile page
        }, 3000);
    } else if (cancelled === 'true') {
        toast({
            variant: "destructive",
            title: "Pagamento cancelado",
            description: "Você cancelou o processo de pagamento. Sua assinatura não foi ativada.",
        });
        navigate('/'); // Redirect to home or pricing
    }

  }, [location.search, navigate, toast]);

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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType: selectedPlan }
      });

      if (error) {
        console.error('Stripe Checkout Error:', error);
        throw new Error(error.message || 'Falha ao iniciar o checkout.');
      }

      if (data && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Não foi possível obter a URL de checkout do Stripe.');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
      });
      setIsLoading(false);
    }
    // setIsLoading(false) is not called here because the user is redirected
  };

  const planDetails = {
    monthly: { name: 'Plano Mensal', price: 'R$ 9,70', id: 'prod_SKDr4FhH8ZMx1z' },
    yearly: { name: 'Plano Anual', price: 'R$ 87,00', id: 'prod_SKDstDNOxG1OOV', originalPrice: 'R$ 116,40' },
  };

  const currentPlan = planDetails[selectedPlan];

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
        <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
              Pagamento Confirmado!
            </CardTitle>
            <CardDescription className="text-gray-300">
              Sua conta foi ativada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="py-8 text-white">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-xl mb-1">Assinatura Ativada!</p>
              <p className="text-gray-400">
                Seu pagamento foi processado com sucesso e sua conta está ativa.
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity" 
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
          <CardDescription className="text-gray-300">
            Você está assinando o <span className="font-semibold text-white">{currentPlan.name}</span>.
            {selectedPlan === 'yearly' && planDetails.yearly.originalPrice && (
              <span className="block text-sm">De <span className="line-through">{planDetails.yearly.originalPrice}</span> por {planDetails.yearly.price} à vista.</span>
            )}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handlePayment}>
          <CardContent className="space-y-4">
            <p className="text-center text-white">
              Você será redirecionado para o ambiente seguro do Stripe para finalizar o pagamento.
            </p>
            <div className="flex justify-center space-x-2 mt-4">
                <Button 
                    type="button"
                    variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setSelectedPlan('monthly')}
                    className={selectedPlan === 'monthly' ? "bg-gradient-to-r from-brand.purple to-brand.pink text-white" : "text-gray-300 border-white/20 hover:bg-white/5"}
                >
                    Mudar para Mensal (R$ 9,70)
                </Button>
                <Button 
                    type="button"
                    variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
                    onClick={() => setSelectedPlan('yearly')}
                    className={selectedPlan === 'yearly' ? "bg-gradient-to-r from-brand.purple to-brand.pink text-white" : "text-gray-300 border-white/20 hover:bg-white/5"}
                >
                    Mudar para Anual (R$ 87,00)
                </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-gray-400 mb-2">
              Total: <span className="text-white font-bold">{currentPlan.price}</span>
            </p>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity" 
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
            
            <p className="text-xs text-center text-gray-400 mt-2">
              Seus dados estão seguros. Utilizamos criptografia de ponta a ponta.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
