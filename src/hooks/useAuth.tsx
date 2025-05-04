import { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuthStatus = () => {
      const storedUser = sessionStorage.getItem('user');
      const userRole = sessionStorage.getItem('user_role');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            ...parsedUser,
            role: userRole as 'user' | 'admin' || 'user'
          });
        } catch (e) {
          console.error('Erro ao analisar dados do usuário:', e);
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('user_role');
        }
      }
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock login para demonstração
      // Aqui seria a integração com API de autenticação

      // Autenticação do administrador
      if (email === 'admin@conexaobrasil.com' && password === 'admin123') {
        const adminUser: User = {
          id: 'admin-1',
          email: 'admin@conexaobrasil.com',
          full_name: 'Administrador',
          role: 'admin',
          subscription_status: 'active'
        };
        
        setUser(adminUser);
        sessionStorage.setItem('user', JSON.stringify(adminUser));
        sessionStorage.setItem('user_role', 'admin');
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo(a) à área administrativa.",
        });
        
        navigate('/admin/suppliers');
        return true;
      }
      
      // Autenticação de usuários comuns
      // Simulação de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: email,
        full_name: 'Usuário ' + email.split('@')[0],
        role: 'user',
        subscription_status: 'active'
      };
      
      setUser(mockUser);
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      sessionStorage.setItem('user_role', 'user');
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo(a) de volta.",
      });
      
      navigate('/home');
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro
  const register = async (
    fullName: string, 
    email: string, 
    password: string, 
    phone?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulação de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Criar novo usuário
      const newUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email,
        full_name: fullName,
        phone,
        role: 'user',
        subscription_status: 'active'
      };
      
      // Armazenar usuário no sessionStorage
      setUser(newUser);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      sessionStorage.setItem('user_role', 'user');
      
      toast({
        title: "Registro realizado com sucesso!",
        description: "Seja bem-vindo(a) à Conexão Brasil!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar conta",
        description: "Não foi possível criar sua conta. Tente novamente.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('user_role');
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
    navigate('/auth/login');
  };

  // Função de recuperação de senha
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulação de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Solicitação enviada",
        description: "Se o e-mail existir em nossa base de dados, você receberá instruções para redefinir sua senha.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar solicitação",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
