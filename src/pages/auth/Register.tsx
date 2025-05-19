import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Tabs is no longer needed as plan selection is removed from this page
import { Eye, EyeOff, UserPlus, Mail, Lock, UserCircle, Phone, MapPin, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    register,
    isLoading
  } = useAuth();
  const validatePasswordMatch = useCallback(() => {
    if (password !== confirmPassword) {
      setPasswordError('As senhas não conferem');
      return false;
    }
    setPasswordError('');
    return true;
  }, [password, confirmPassword]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !city.trim() || !state.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios, incluindo Cidade e Estado."
      });
      return;
    }
    if (!validatePasswordMatch()) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "As senhas não conferem. Por favor, verifique."
      });
      return;
    }
    try {
      const success = await register(fullName, email, password, phone, city, state);
      if (success) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você será redirecionado para a página de pagamento."
        });
        navigate(`/auth/payment?plan=monthly`);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      // Error toast is handled by useAuth
    }
  }, [validatePasswordMatch, fullName, email, password, phone, city, state, register, navigate, toast]);
  return <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{
    backgroundColor: '#a164f1'
  }}>
      <Card className="w-full max-w-md bg-slate-900 shadow-2xl rounded-xl border-slate-700">
        <CardHeader className="space-y-2 text-center p-6 sm:p-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-slate-50">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-base text-slate-400">
            Preencha seus dados para criar sua conta
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRegister}>
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
              <Label htmlFor="city" className="text-sm font-medium text-slate-300">Cidade</Label>
              <div className="relative flex items-center">
                <Building className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input id="city" type="text" placeholder="Sua cidade" value={city} onChange={e => setCity(e.target.value)} className="pl-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-slate-300">Estado (UF)</Label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input id="state" type="text" placeholder="UF" value={state} onChange={e => setState(e.target.value)} className="pl-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" maxLength={2} required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-300">Senha</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => {
                setPassword(e.target.value);
                if (confirmPassword) validatePasswordMatch();
              }} className="pl-10 pr-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-white transition-colors" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">Confirmar Senha</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={e => {
                setConfirmPassword(e.target.value);
                if (password) validatePasswordMatch();
              }} className={`pl-10 pr-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50 ${passwordError ? "border-red-500" : ""}`} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 text-slate-400 hover:text-white transition-colors" aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p className="text-red-400 text-xs mt-1">{passwordError}</p>}
            </div>
          </CardContent>
          {/* Plan selection UI (Tabs) is removed */}
          
          <CardFooter className="flex flex-col space-y-4 p-6 sm:p-8">
            <Button type="submit" className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white" disabled={isLoading}>
              {isLoading ? <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Processando...
                </> : <>
                  <UserPlus size={18} className="mr-2" />
                  Criar Conta e Pagar
                </>}
            </Button>
            
            <div className="text-center text-sm text-slate-400">
              Já tem uma conta?{' '}
              <Link to="/auth/login" className="font-semibold text-brand.purple hover:text-brand.pink transition-colors">
                Faça login
              </Link>
            </div>
            {/* "Voltar" button is removed as it's a single step process */}
          </CardFooter>
        </form>
      </Card>
    </div>;
}
