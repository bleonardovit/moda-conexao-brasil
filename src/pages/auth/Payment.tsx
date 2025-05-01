
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Banknote, QrCode, CheckCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulação de processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsComplete(true);
      
      toast({
        title: "Pagamento processado com sucesso!",
        description: "Sua assinatura está ativa. Bem-vindo à Conexão Brasil!",
      });
      
      // Redirecionar após um curto atraso
      setTimeout(() => {
        navigate('/suppliers');
      }, 3000);
    } catch (error) {
      console.error('Erro no pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro no processamento do pagamento",
        description: "Por favor, tente novamente ou use outro método de pagamento.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i=0, len=match.length; i<len; i+=4) {
      parts.push(match.substring(i, i+4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
      <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            {isComplete ? 'Pagamento Confirmado!' : 'Finalizar Assinatura'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isComplete ? 'Sua conta foi ativada com sucesso' : 'Escolha seu método de pagamento preferido'}
          </CardDescription>
        </CardHeader>
        
        {!isComplete ? (
          <form onSubmit={handlePayment}>
            <CardContent className="space-y-4">
              <Tabs defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/40">
                  <TabsTrigger 
                    value="card" 
                    className="data-[state=active]:bg-gradient-to-r from-brand.purple to-brand.pink data-[state=active]:text-white"
                  >
                    <CreditCard size={16} className="mr-2" /> Cartão
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pix" 
                    className="data-[state=active]:bg-gradient-to-r from-brand.purple to-brand.pink data-[state=active]:text-white"
                  >
                    <QrCode size={16} className="mr-2" /> Pix
                  </TabsTrigger>
                  <TabsTrigger 
                    value="boleto" 
                    className="data-[state=active]:bg-gradient-to-r from-brand.purple to-brand.pink data-[state=active]:text-white"
                  >
                    <Banknote size={16} className="mr-2" /> Boleto
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="card" className="mt-4 border-none">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-white">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50"
                        maxLength={19}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardName" className="text-white">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        type="text"
                        placeholder="Nome completo"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry" className="text-white">Validade</Label>
                        <Input
                          id="cardExpiry"
                          type="text"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50"
                          maxLength={5}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cardCVC" className="text-white">CVC</Label>
                        <Input
                          id="cardCVC"
                          type="text"
                          placeholder="000"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pix" className="mt-4 border-none">
                  <div className="flex flex-col items-center py-4">
                    <div className="h-48 w-48 bg-white p-2 rounded-lg mb-4">
                      <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InJlZCIvPjwvc3ZnPg==')]" />
                    </div>
                    <p className="text-white text-center">
                      Escaneie este código QR com o seu aplicativo bancário ou carteira digital para efetuar o pagamento.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="boleto" className="mt-4 border-none">
                  <div className="flex flex-col items-center py-4">
                    <div className="h-20 w-full bg-white/90 rounded flex items-center justify-center mb-4">
                      <div className="text-black font-mono text-xs">
                        34191.79001 01043.510047 91020.150008 8 94750000029990
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="border-white/20 text-gray-300 hover:bg-white/5 hover:text-white"
                      onClick={() => {
                        toast({
                          title: "Boleto gerado",
                          description: "O boleto foi copiado para a área de transferência.",
                        });
                      }}
                    >
                      Copiar código
                    </Button>
                    <p className="text-white text-center mt-4">
                      O boleto será enviado para o seu email. O acesso será liberado após a confirmação do pagamento (1-3 dias úteis).
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-gray-400 mb-2">
                Total: <span className="text-white font-bold">R$ {paymentMethod === "boleto" ? "49,90" : "49,90"}</span>
              </p>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {paymentMethod === "pix" ? <QrCode size={18} /> : 
                     paymentMethod === "boleto" ? <Banknote size={18} /> : 
                     <CreditCard size={18} />}
                    Finalizar Pagamento
                  </span>
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-400 mt-2">
                Seus dados estão seguros. Utilizamos criptografia de ponta a ponta.
              </p>
            </CardFooter>
          </form>
        ) : (
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
        )}
      </Card>
    </div>
  );
}
