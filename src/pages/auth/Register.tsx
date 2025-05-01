
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [planType, setPlanType] = useState('monthly');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const { register, isLoading } = useAuth();

  const validatePasswordMatch = () => {
    if (password !== confirmPassword) {
      setPasswordError('As senhas não conferem');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar primeiro passo
    if (currentStep === 1) {
      if (!validatePasswordMatch()) {
        return;
      }
      setCurrentStep(2);
      return;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== 2) return;
    
    try {
      const success = await register(fullName, email, password, phone);
      if (success) {
        // Simulação de redirecionamento para o checkout
        setTimeout(() => {
          navigate('/auth/payment');
        }, 1000);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
      <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-gray-300">
            {currentStep === 1 
              ? 'Preencha seus dados para criar sua conta' 
              : 'Escolha seu plano de assinatura'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={currentStep === 1 ? handleNext : handleRegister}>
          {currentStep === 1 ? (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (confirmPassword) validatePasswordMatch();
                    }}
                    className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50 pr-12"
                    required
                  />
                  <button 
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (password) validatePasswordMatch();
                    }}
                    className={`bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50 pr-12 ${
                      passwordError ? "border-red-500" : ""
                    }`}
                    required
                  />
                  <button 
                    type="button"
                    onClick={toggleShowConfirmPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Escolha seu plano</Label>
                <Tabs defaultValue="monthly" value={planType} onValueChange={setPlanType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/40">
                    <TabsTrigger 
                      value="monthly" 
                      className="data-[state=active]:bg-gradient-to-r from-brand.purple to-brand.pink data-[state=active]:text-white"
                    >
                      Mensal
                    </TabsTrigger>
                    <TabsTrigger 
                      value="yearly" 
                      className="data-[state=active]:bg-gradient-to-r from-brand.purple to-brand.pink data-[state=active]:text-white"
                    >
                      Anual (20% OFF)
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="monthly" className="mt-4 border-none">
                    <Card className="glass-morphism border-white/10">
                      <CardContent className="pt-4 pb-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">R$ 49,90<span className="text-sm font-normal text-gray-300">/mês</span></div>
                          <p className="text-sm text-gray-300 mt-1">
                            Acesso a todos os fornecedores
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="yearly" className="mt-4 border-none">
                    <Card className="glass-morphism border-white/10">
                      <CardContent className="pt-4 pb-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">R$ 479,90<span className="text-sm font-normal text-gray-300">/ano</span></div>
                          <p className="text-sm text-gray-300 mt-1">
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
                className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity"
              >
                <span className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Continuar
                </span>
              </Button>
            ) : (
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
                    <UserPlus size={18} />
                    Finalizar e Pagar
                  </span>
                )}
              </Button>
            )}
            
            <div className="text-center text-sm text-gray-300">
              Já tem uma conta?{' '}
              <Link to="/auth/login" className="text-brand.purple hover:text-brand.pink transition-colors">
                Faça login
              </Link>
            </div>
            
            {currentStep === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="mt-2 border-white/20 text-gray-300 hover:bg-white/5 hover:text-white"
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
