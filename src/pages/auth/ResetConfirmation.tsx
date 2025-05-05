
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function ResetConfirmation() {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();
  const { isInitializing } = useAuth();
  
  // Countdown timer and auto-redirect
  useEffect(() => {
    // Certifique-se de que o sistema de auth inicializou antes de iniciar o contador
    if (isInitializing) {
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          navigate('/auth/login');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate, isInitializing]);
  
  // Aguarde até que a inicialização seja concluída para renderizar
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand.dark">
        <Card className="w-full max-w-md glass-morphism border-white/10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
              Redefinição de Senha
            </CardTitle>
            <CardDescription className="text-base text-slate-400">
              Carregando...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
      <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Redefinição de Senha
          </CardTitle>
          <CardDescription className="text-base text-slate-400">
            Verifique seu email para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="py-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-brand.purple/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand.purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-white">
            Enviamos um email com instruções para redefinir sua senha.
            Por favor, verifique sua caixa de entrada.
          </p>
          <p className="text-white">
            Se você não receber o email em alguns minutos, verifique sua pasta de spam.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-gray-400">
            Redirecionando para a página de login em {countdown} segundos...
          </p>
          <Button 
            onClick={() => navigate('/auth/login')} 
            className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity"
          >
            Voltar para o login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
