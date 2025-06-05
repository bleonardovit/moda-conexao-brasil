
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Check, Mail, Lock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [securityAlert, setSecurityAlert] = useState('');
  const {
    login,
    isLoading,
    user,
    isInitializing
  } = useAuth();
  const navigate = useNavigate();

  // Verificar se o usuário já está autenticado e redirecionar
  useEffect(() => {
    // Somente redirecionar se o usuário estiver autenticado e a verificação inicial de auth estiver concluída
    if (user && !isInitializing) {
      console.log('Usuário autenticado, redirecionando para /home');
      navigate('/home');
    }
  }, [user, navigate, isInitializing]);

  // Usando useCallback para memoizar a função de login
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSecurityAlert('');

    // Validar campos antes de submeter
    if (!email.trim()) {
      setFormError('Email é obrigatório');
      return;
    }
    if (!password.trim()) {
      setFormError('Senha é obrigatória');
      return;
    }

    // Evitar submissão duplicada ou durante inicialização
    if (localSubmitting || isLoading || isInitializing) {
      console.log('Submissão bloqueada: já está em andamento ou sistema inicializando');
      return;
    }
    
    setLocalSubmitting(true);
    try {
      console.log('Iniciando processo de login para:', email);
      const success = await login(email, password);
      
      if (success) {
        console.log('Login bem sucedido');
        // Não precisamos navegar aqui, o useEffect vai cuidar disso
      } else {
        // Se o login falhou, pode ser por questões de segurança
        // Verificar se é um caso específico de usuário órfão
        if (email.includes('teste@teste.com')) {
          setSecurityAlert('Esta conta foi removida do sistema por questões de segurança. Se você acredita que isso é um erro, entre em contato com o suporte.');
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Tratar erros específicos de segurança
      if (error.message?.includes('ORPHANED_USER') || error.message?.includes('DEACTIVATED_USER')) {
        setSecurityAlert('Sua conta não está mais ativa no sistema. Entre em contato com o suporte para mais informações.');
      } else {
        setFormError('Erro ao fazer login. Verifique suas credenciais.');
      }
    } finally {
      setLocalSubmitting(false);
    }
  }, [email, password, localSubmitting, isLoading, isInitializing, login]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Aguarde até que a inicialização seja concluída para renderizar
  if (isInitializing) {
    return <div className="flex min-h-screen items-center justify-center" style={{
      backgroundColor: '#a164f1'
    }}>
        <Card className="w-full max-w-md bg-slate-900 shadow-2xl rounded-xl border-slate-700">
          <CardHeader className="space-y-1 text-center p-6 sm:p-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
              Os Fornecedores
            </CardTitle>
            <CardDescription className="text-base text-slate-400">
              Carregando...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </CardContent>
        </Card>
      </div>;
  }

  return <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{
    backgroundColor: '#a164f1'
  }}>
      <Card className="w-full max-w-md bg-slate-900 shadow-2xl rounded-xl border-slate-700">
        <CardHeader className="space-y-2 text-center p-6 sm:p-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-slate-50">Os Fornecedores</CardTitle>
          <CardDescription className="text-base text-slate-400">
            Entre com seus dados para acessar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 p-6 sm:p-8">
            {/* Alert de segurança prioritário */}
            {securityAlert && (
              <Alert className="border-amber-600/50 bg-amber-700/30">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-200">
                  {securityAlert}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Erro geral do formulário */}
            {formError && !securityAlert && (
              <div className="bg-red-700/30 border border-red-600/50 text-red-200 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="pl-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" 
                  required 
                  disabled={localSubmitting || isLoading} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">Senha</Label>
                <Link to="/auth/reset-password" className="text-sm text-brand.purple hover:text-brand.pink transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="pl-10 pr-10 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand.purple/50" 
                  required 
                  disabled={localSubmitting || isLoading} 
                />
                <button 
                  type="button" 
                  onClick={toggleShowPassword} 
                  className="absolute right-3 text-slate-400 hover:text-white transition-colors" 
                  disabled={localSubmitting || isLoading} 
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6 sm:p-8">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity text-white" 
              disabled={localSubmitting || isLoading}
            >
              {localSubmitting || isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check size={18} />
                  Entrar
                </span>
              )}
            </Button>
            <div className="text-center text-sm text-slate-400">
              Não tem uma conta?{' '}
              <Link to="/auth/register" className="font-semibold text-brand.purple hover:text-brand.pink transition-colors">
                Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>;
}
