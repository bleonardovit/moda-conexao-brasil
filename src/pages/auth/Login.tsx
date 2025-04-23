
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Mock admin authentication
      if (email === 'admin@conexaobrasil.com' && password === 'admin123') {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo(a) à área administrativa.",
        });
        // Set session storage to mock admin login
        sessionStorage.setItem('user_role', 'admin');
        navigate('/admin/suppliers');
        return;
      }
      
      // Mock user authentication logic here
      console.log('Login com:', email, password);
      await new Promise(resolve => setTimeout(resolve, 1000));
      sessionStorage.setItem('user_role', 'user');
      navigate('/');
      
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand.dark px-4 py-12">
      <Card className="w-full max-w-md glass-morphism border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand.purple to-brand.pink bg-clip-text text-transparent">
            Conexão Brasil
          </CardTitle>
          <CardDescription className="text-base text-gray-300">
            Entre com seus dados para acessar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">Senha</Label>
                <Link 
                  to="/auth/reset-password" 
                  className="text-sm text-brand.purple hover:text-brand.pink transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-brand.purple/50"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-400">
                <p>Teste como administrador:</p>
                <p>Email: admin@conexaobrasil.com</p>
                <p>Senha: admin123</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand.purple to-brand.pink hover:opacity-90 transition-opacity" 
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="text-center text-sm text-gray-300">
              Não tem uma conta?{' '}
              <Link to="/auth/register" className="text-brand.purple hover:text-brand.pink transition-colors">
                Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
