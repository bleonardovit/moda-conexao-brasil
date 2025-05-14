
import { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to get client IP address
const getClientIP = async (): Promise<string> => {
  try {
    // This service returns the client's IP address
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return 'unknown';
  }
};

// Helper function to check if IP is blocked
const checkIPBlocked = async (ip: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_ip_blocked', { check_ip: ip });
    if (error) {
      console.error('Error checking if IP is blocked:', error);
      return false;
    }
    return data === true;
  } catch (error) {
    console.error('Error in checkIPBlocked function:', error);
    return false;
  }
};

// Helper function to record login attempt
const recordLoginAttempt = async (
  userEmail: string,
  userId: string | null,
  ipAddress: string,
  success: boolean
) => {
  try {
    const { error } = await supabase
      .from('login_logs')
      .insert({
        user_id: userId,
        user_email: userEmail,
        ip_address: ipAddress,
        success: success
      });

    if (error) {
      console.error('Error recording login attempt:', error);
    }
  } catch (error) {
    console.error('Error in recordLoginAttempt function:', error);
  }
};

// Helper function to check and block IP if needed
const checkAndBlockIP = async (ipAddress: string) => {
  try {
    // Get max attempts setting
    const { data: settingsData } = await supabase
      .from('security_settings')
      .select('value')
      .eq('key', 'max_login_attempts')
      .single();
    
    const maxAttempts = settingsData ? parseInt(settingsData.value) : 3;
    
    // Get block duration setting
    const { data: durationData } = await supabase
      .from('security_settings')
      .select('value')
      .eq('key', 'block_duration_minutes')
      .single();
    
    const blockDurationMinutes = durationData ? parseInt(durationData.value) : 30;
    
    // Get failed attempts count
    const { data: attemptsCount } = await supabase.rpc(
      'get_failed_attempts_count', 
      { check_ip: ipAddress }
    );
    
    // If attempts exceed threshold, block the IP
    if (attemptsCount && attemptsCount >= maxAttempts) {
      const blockUntil = new Date(Date.now() + blockDurationMinutes * 60 * 1000).toISOString();
      
      await supabase
        .from('blocked_ips')
        .insert({
          ip_address: ipAddress,
          blocked_until: blockUntil,
          reason: `Exceeded ${maxAttempts} failed login attempts`,
          attempts_count: attemptsCount
        });
      
      console.log(`IP ${ipAddress} blocked until ${blockUntil}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in checkAndBlockIP function:', error);
    return false;
  }
};

// Helper function to manage active session
const manageActiveSession = async (userId: string, ipAddress: string) => {
  try {
    // First, delete any existing sessions for this user
    await supabase
      .from('active_sessions')
      .delete()
      .eq('user_id', userId);
    
    // Then, create a new session
    const { error } = await supabase
      .from('active_sessions')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        login_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating active session:', error);
    }
  } catch (error) {
    console.error('Error in manageActiveSession function:', error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função auxiliar para obter o perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  // Função para atualizar o último login
  const updateLastLogin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
        
      if (error) {
        console.error('Erro ao atualizar último login:', error);
      }
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  };

  // Update session last active periodically
  useEffect(() => {
    if (user) {
      const updateActivityInterval = setInterval(async () => {
        try {
          await supabase.rpc('update_session_last_active', { user_uuid: user.id });
        } catch (error) {
          console.error('Error updating last active timestamp:', error);
        }
      }, 60000); // Update every minute
      
      return () => clearInterval(updateActivityInterval);
    }
  }, [user]);

  // Manipulador de mudança de estado de autenticação
  const handleAuthChange = async (event: string, session: any) => {
    console.log(`Evento de autenticação: ${event}`);
    
    if (!session) {
      console.log('Sem sessão, definindo usuário como nulo');
      setUser(null);
      sessionStorage.removeItem('user_role');
      return;
    }
    
    try {
      // Buscar dados do perfil de forma assíncrona
      const profile = await fetchUserProfile(session.user.id);
      
      if (profile) {
        // Atualizar último login se necessário
        if (event === 'SIGNED_IN') {
          await updateLastLogin(session.user.id);
          // Get client IP and manage session
          const ipAddress = await getClientIP();
          await manageActiveSession(session.user.id, ipAddress);
        }
        
        // Obter a role do usuário e armazenar em sessionStorage
        const userRole = profile.role || 'user';
        sessionStorage.setItem('user_role', userRole);
        
        // Combinar dados de autenticação e perfil
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: profile.full_name || session.user.user_metadata?.full_name || '',
          phone: profile.phone || session.user.phone || '',
          role: userRole as 'user' | 'admin',
          subscription_status: profile.subscription_status as 'active' | 'inactive' | 'pending' || 'inactive'
        });
        
        console.log('Usuário autenticado:', session.user.email);
      } else {
        console.log('Perfil não encontrado para o usuário autenticado');
        setUser(null);
        sessionStorage.removeItem('user_role');
      }
    } catch (error) {
      console.error('Erro ao processar alteração de autenticação:', error);
    }
  };

  // Check auth status and set up listener for auth changes
  useEffect(() => {
    console.log('Inicializando provedor de autenticação');
    
    const initializeAuth = async () => {
      setIsInitializing(true);
      
      try {
        // Configurar listener de mudança de estado primeiro
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log(`Evento de autenticação detectado: ${event}`);
            
            // Use setTimeout para evitar bloqueios
            setTimeout(() => {
              handleAuthChange(event, session);
            }, 0);
          }
        );
        
        // Verificar sessão atual
        console.log('Verificando sessão atual');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Sessão existente encontrada');
          await handleAuthChange('INITIAL_SESSION', session);
        } else {
          console.log('Nenhuma sessão encontrada');
          setUser(null);
          sessionStorage.removeItem('user_role');
        }
        
        return subscription;
      } catch (error) {
        console.error('Erro durante a inicialização da autenticação:', error);
      } finally {
        setIsInitializing(false);
        console.log('Inicialização de autenticação concluída');
      }
    };
    
    const subscription = initializeAuth();
    
    return () => {
      if (subscription && typeof subscription.then === 'function') {
        subscription.then(sub => {
          if (sub) sub.unsubscribe();
        });
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Tentativa de login para:', email);
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Email e senha são obrigatórios.",
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      // Get client IP address
      const ipAddress = await getClientIP();
      
      // Check if IP is blocked
      const isBlocked = await checkIPBlocked(ipAddress);
      if (isBlocked) {
        toast({
          variant: "destructive",
          title: "Acesso bloqueado",
          description: "Seu endereço IP foi bloqueado temporariamente por motivos de segurança.",
        });
        // Record failed attempt
        await recordLoginAttempt(email, null, ipAddress, false);
        return false;
      }
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If login failed
      if (error) {
        console.error('Erro no login:', error.message);
        // Record failed attempt
        await recordLoginAttempt(email, null, ipAddress, false);
        // Check if we need to block this IP
        await checkAndBlockIP(ipAddress);
        
        throw error;
      }

      // Login successful
      if (data.user) {
        // Record successful attempt
        await recordLoginAttempt(email, data.user.id, ipAddress, true);
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo(a) de volta.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message === "Invalid login credentials" 
          ? "Credenciais inválidas. Verifique seu email e senha." 
          : error.message || "Verifique suas credenciais e tente novamente.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    fullName: string, 
    email: string, 
    password: string, 
    phone?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          },
        }
      });

      if (error) {
        throw error;
      }
      
      // Record successful registration
      if (data.user) {
        const ipAddress = await getClientIP();
        await recordLoginAttempt(email, data.user.id, ipAddress, true);
      }

      toast({
        title: "Registro realizado com sucesso!",
        description: "Seja bem-vindo(a) à Conexão Brasil!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar conta",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // If user exists, remove their active session
      if (user) {
        await supabase
          .from('active_sessions')
          .delete()
          .eq('user_id', user.id);
      }
      
      await supabase.auth.signOut();
      setUser(null);
      // Clear session storage when user logs out
      sessionStorage.removeItem('user_role');
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
      navigate('/auth/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível processar o logout. Tente novamente.",
      });
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-confirmation',
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Solicitação enviada",
        description: "Se o e-mail existir em nossa base de dados, você receberá instruções para redefinir sua senha.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar solicitação",
        description: error.message || "Não foi possível processar sua solicitação. Tente novamente.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isInitializing,
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
