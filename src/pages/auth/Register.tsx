
import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, UserPlus, Mail, Lock, UserCircle, Phone } from 'lucide-react'; // Added Mail, Lock, UserCircle, Phone
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isLoading } = useAuth();

  const validatePasswordMatch = useCallback(() => {
    if (password !== confirmPassword) {
      setPasswordError('As senhas não conferem');
      return false;
    }
    setPasswordError('');
    return true;
  }, [password, confirmPassword]);

  const handleNext = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        toast({ variant: "destructive", title: "Campos obrigatórios", description: "Por favor, preencha todos os campos obrigatórios." });
        return;
      }
      if (!validatePasswordMatch()) {
        return;
      }
      setCurrentStep(2);
    }
  }, [currentStep, fullName, email, password, confirmPassword, validatePasswordMatch, toast]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 2) return;
    if (!validatePasswordMatch()) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "As senhas não conferem. Por favor, verifique."
      });
      setCurrentStep(1);
      return;
    }
    try {
      const success = await register(fullName, email, password, phone);
      if (success) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você será redirecionado para a página de pagamento."
        });
        navigate(`/auth/payment?plan=${planType}`);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      // Error toast is handled by useAuth
    }
  }, [currentStep, validatePasswordMatch, fullName, email, password, phone, planType, register, navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: '#a164f1' }}>
      <Card className="w-full max-w-md bg-slate-900 shadow-2xl rounded-xl border-slate-700">
        <CardHeader className="space-y-2 text-center p-6 sm:p-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-base text-slate-400">
            {currentStep === 1 ? 'Preencha seus dados para criar sua conta' : 'Escolha seu plano de assinatura'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={currentStep === 1 ? handleNext : handleRegister}>
          {currentStep === 1 ? (
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-300">Nome Completo</Label>
                <div className="relative flex items-center">
                  <UserCircle className="absolute left-3 h-5 w-5 text-slate-400" />
                  <Input id="fullName" type="text" placeholder="Seu nome completo" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email</Label>
                 <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-5 w-5 text-slate-400" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-300">Telefone (opcional)</Label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 h-5 w-5 text-slate-400" />
                  <Input id="phone" type="tel" placeholder="(11) 98765-4321" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">Senha</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-5 w-5 text-slate-400" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); if (confirmPassword) validatePasswordMatch(); }} className="pl-10 pr-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-white transition-colors" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">Confirmar Senha</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-5 w-5 text-slate-400" />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); if (password) validatePasswordMatch(); }} className={`pl-10 pr-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50 ${passwordError ? "border-red-500" : ""}`} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 text-slate-400 hover:text-white transition-colors" aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <p className="text-red-400 text-xs mt-1">{passwordError}</p>}
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Escolha seu plano</Label>
                <Tabs defaultValue="monthly" value={planType} onValueChange={value => setPlanType(value as 'monthly' | 'yearly')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700 p-1">
                    <TabsTrigger value="monthly" className="text-slate-400 data-[state=active]:bg-gradient-to-r from-brand.purple to-brand.pink data-[state=active]:text-white data-[state=active]:shadow-md rounded-sm">
                      Mensal
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="text-slate-400 data-[state=active]:bg-gradient-to-r from-brand.purple to-brand.pink data-[state=active]:text-white data-[state=active]:shadow-md rounded-sm">
                      Anual (20% OFF)
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="monthly" className="mt-4 border-none p-0">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-4 pb-2 text-center">
                        <div className="text-2xl font-bold text-white">R$ 9,70<span className="text-sm font-normal text-slate-400">/mês</span></div>
                        <p className="text-sm text-slate-400 mt-1">
                          Acesso a todos os fornecedores. Cobrança recorrente mensal.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="yearly" className="mt-4 border-none p-0">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-4 pb-2 text-center">
                        <div className="text-2xl font-bold text-white">R$ 87,00<span className="text-sm font-normal text-slate-400">/ano</span></div>
                        <p className="text-sm text-slate-400 mt-1">
                          Economia de R$ 29,40 por ano. Cobrança recorrente anual.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          )}
          
          <CardFooter className="flex flex-col space-y-4 p-6 sm:p-8">
            <Button type="submit" className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white" disabled={isLoading && currentStep === 2}>
              {currentStep === 1 ? (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Continuar
                </>
              ) : isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Processando...
                </>
              ) : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Finalizar e Pagar
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-slate-400">
              Já tem uma conta?{' '}
              <Link to="/auth/login" className="font-semibold text-brand.purple hover:text-brand.pink transition-colors">
                Faça login
              </Link>
            </div>
            
            {currentStep === 2 && (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="w-full mt-2 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-white">
                Voltar
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
