import { useNavigate, Link } from 'react-router-dom'; // Adicionado Link
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Gem } from 'lucide-react'; // Icons for plans

const plans = [
  {
    id: 'free',
    name: 'Plano Grátis',
    price: 'R$0',
    frequency: 'Acesso limitado',
    features: [
      'Acesso a fornecedores básicos',
      'Busca limitada',
      'Suporte comunitário',
    ],
    icon: <CheckCircle className="h-6 w-6 text-green-500 mb-4" />,
    action: () => '/home',
    buttonLabel: 'Começar Gratuitamente',
    bgColor: 'bg-slate-800',
    borderColor: 'border-slate-700',
    textColor: 'text-slate-50',
    buttonClass: 'bg-slate-600 hover:bg-slate-500 text-white'
  },
  {
    id: 'monthly',
    name: 'Plano Mensal',
    price: 'R$14,70',
    frequency: '/mês',
    features: [
      'Acesso completo a fornecedores',
      'Busca avançada e filtros',
      'Suporte prioritário',
      'Conteúdo exclusivo',
    ],
    icon: <Zap className="h-6 w-6 text-yellow-400 mb-4" />,
    action: () => '/auth/payment?plan=monthly', // Assuming payment page handles plan query
    buttonLabel: 'Assinar Plano Mensal',
    bgColor: 'bg-slate-900',
    borderColor: 'border-brand-purple',
    textColor: 'text-slate-50',
    highlight: true,
    buttonClass: 'bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 text-white'
  },
  {
    id: 'yearly',
    name: 'Plano Anual',
    price: 'R$87,00',
    frequency: '/ano (Economize 50%)',
    features: [
      'Todos os benefícios do Mensal',
      'Desconto de 50% comparado ao mensal',
      'Acesso antecipado a novidades',
    ],
    icon: <Gem className="h-6 w-6 text-pink-500 mb-4" />,
    action: () => '/auth/payment?plan=yearly',
    buttonLabel: 'Assinar Plano Anual',
    bgColor: 'bg-slate-800',
    borderColor: 'border-slate-700',
    textColor: 'text-slate-50',
    buttonClass: 'bg-slate-600 hover:bg-slate-500 text-white'

  },
];

const SelectPlan = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planAction: () => string) => {
    // Here you would typically update user's profile with selected plan if 'free'
    // or initiate payment process for paid plans.
    // For now, just navigate.
    const path = planAction();
    if (path.startsWith('/auth/payment')) {
      // TODO: Potentially pass user ID or other necessary info to payment page
      // For now, we assume payment page can fetch user or has context.
      navigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: '#6d28d9' /* purple-700 */ }}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Escolha seu Plano</h1>
        <p className="text-xl text-slate-300">Comece a encontrar os melhores fornecedores hoje mesmo!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {plans.map((plan) => (
          <Card key={plan.id} className={`shadow-2xl rounded-xl flex flex-col ${plan.bgColor} ${plan.borderColor} ${plan.highlight ? 'border-2' : 'border'}`}>
            <CardHeader className="text-center p-6">
              {plan.icon}
              <CardTitle className={`text-2xl font-semibold ${plan.textColor}`}>{plan.name}</CardTitle>
              <CardDescription className="text-3xl font-bold text-brand-purple my-2">
                {plan.price} <span className="text-sm font-normal text-slate-400">{plan.frequency}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-6 space-y-3">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className={`flex items-center text-sm ${plan.textColor}`}>
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-6">
              <Button
                onClick={() => handleSelectPlan(plan.action)}
                className={`w-full font-semibold py-3 ${plan.buttonClass}`}
              >
                {plan.buttonLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-400">
        Dúvidas? <Link to="/contact" className="underline hover:text-white">Fale conosco</Link>.
      </p>
    </div>
  );
};

export default SelectPlan;
