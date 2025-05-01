
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Key, ArrowLeft } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await resetPassword(email);
      if (success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
      <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-gray-300">
            {!isSubmitted 
              ? 'Digite seu email para receber um link de recuperação de senha' 
              : 'Verifique seu email para instruções de recuperação'}
          </CardDescription>
        </CardHeader>
        
        {!isSubmitted ? (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Key size={18} />
                    Enviar Link de Recuperação
                  </span>
                )}
              </Button>
              <div className="text-center text-sm">
                <Link to="/auth/login" className="text-brand.purple hover:text-brand.pink transition-colors flex items-center gap-2 justify-center">
                  <ArrowLeft size={16} />
                  Voltar para o login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4 text-center">
            <div className="py-8 text-white">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Key size={24} className="text-green-500" />
              </div>
              <p className="text-lg mb-1">Email enviado!</p>
              <p className="text-gray-400">
                Enviamos um email para <strong className="text-white">{email}</strong> com instruções para recuperar sua senha.
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity" 
              onClick={() => window.location.href = "/auth/login"}
            >
              <span className="flex items-center gap-2">
                <ArrowLeft size={18} />
                Voltar para o login
              </span>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
