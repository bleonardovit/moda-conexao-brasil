
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [planType, setPlanType] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      // Validar primeiro passo
      if (password !== confirmPassword) {
        alert('As senhas não conferem');
        return;
      }
      setCurrentStep(2);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Implementar registro com Supabase e redirecionamento para pagamento
      console.log('Registro com:', { fullName, email, phone, password, planType });
      
      // Simular atraso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar para página de pagamento
      window.location.href = '/auth/payment';
    } catch (error) {
      console.error('Erro no registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-primary">Criar Conta</CardTitle>
          <CardDescription>
            {currentStep === 1 
              ? 'Preencha seus dados para criar sua conta' 
              : 'Escolha seu plano de assinatura'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRegister}>
          {currentStep === 1 ? (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Escolha seu plano</Label>
                <Tabs defaultValue="monthly" value={planType} onValueChange={setPlanType}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Mensal</TabsTrigger>
                    <TabsTrigger value="yearly">Anual (20% OFF)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="monthly" className="mt-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">R$ 49,90<span className="text-sm font-normal">/mês</span></div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Acesso a todos os fornecedores
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="yearly" className="mt-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">R$ 479,90<span className="text-sm font-normal">/ano</span></div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Economia de R$ 118,80 por ano
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          )}
          
          <CardFooter className="flex flex-col space-y-4">
            {currentStep === 1 ? (
              <Button 
                type="submit" 
                className="w-full bg-primary"
              >
                Continuar
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="w-full bg-primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Finalizar e Pagar'}
              </Button>
            )}
            
            <div className="text-center text-sm">
              Já tem uma conta?{' '}
              <Link to="/auth/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </div>
            
            {currentStep === 2 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(1)}
                className="mt-2"
              >
                Voltar
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
