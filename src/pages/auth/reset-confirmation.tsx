
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function ResetConfirmation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const handlePasswordReset = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (accessToken && type === 'recovery') {
        try {
          // This is a password reset request
          // You can show a form to let users enter a new password
          toast({
            title: "Sucesso",
            description: "Use o formulário para definir sua nova senha.",
          });
        } catch (error: any) {
          console.error('Erro ao processar recuperação de senha:', error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: error.message || "Ocorreu um erro ao processar sua solicitação.",
          });
          navigate('/auth/login');
        }
      }
    };
    
    handlePasswordReset();
  }, [navigate, toast]);
  
  const handleBackToLogin = () => {
    navigate('/auth/login');
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
      <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Redefinição de Senha
          </CardTitle>
          <CardDescription className="text-gray-300">
            Siga as instruções para definir sua nova senha
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-white">
            Seu link de redefinição de senha foi processado com sucesso. 
            Por favor, entre em contato conosco caso precise de mais assistência.
          </p>
          
          <Button
            onClick={handleBackToLogin}
            className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Voltar para o Login
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
