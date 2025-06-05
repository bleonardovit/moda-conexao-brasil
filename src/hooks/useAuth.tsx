import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { debounce, isEqual } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, phone?: string, city?: string, state?: string) => Promise<boolean>;
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

// SECURITY: Helper function to validate user profile exists and is active
const validateUserProfile = async (userId: string): Promise<{ isValid: boolean; profile?: any; reason?: string }> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found - orphaned auth user
        console.warn(`SECURITY ALERT: Orphaned auth user detected: ${userId}`);
        return { isValid: false, reason: 'ORPHANED_USER' };
      }
      console.error('Error validating user profile:', error);
      return { isValid: false, reason: 'PROFILE_ERROR' };
    }
    
    if (!profile) {
      console.warn(`SECURITY ALERT: No profile found for user: ${userId}`);
      return { isValid: false, reason: 'NO_PROFILE' };
    }
    
    // Check if user is deactivated/banned
    if (profile.subscription_status === 'inactive' && profile.role !== 'admin') {
      console.warn(`SECURITY ALERT: Deactivated user attempted login: ${userId}`);
      return { isValid: false, reason: 'DEACTIVATED_USER' };
    }
    
    return { isValid: true, profile };
  } catch (error) {
    console.error('Error in validateUserProfile:', error);
    return { isValid: false, reason: 'VALIDATION_ERROR' };
  }
};

// SECURITY: Helper function to clean up orphaned auth users
const handleOrphanedUser = async (userId: string, email: string) => {
  try {
    console.warn(`SECURITY: Cleaning up orphaned auth user: ${email} (${userId})`);
    
    // Sign out the orphaned user immediately
    await supabase.auth.signOut();
    
    // Optionally, you could delete the auth user entirely, but this requires service role
    // For now, we just ensure they can't proceed with the login
    
  } catch (error) {
    console.error('Error handling orphaned user:', error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const lastProcessedSessionId = useRef<string | null>(null);
  const processingAuthChange = useRef<boolean>(false);

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

  useEffect(() => {
    if (user) {
      const updateActivity = debounce(async () => {
        try {
          await supabase.rpc('update_session_last_active', { user_uuid: user.id });
        } catch (error) {
          console.error('Error updating last active timestamp:', error);
        }
      }, 60000);
      
      const updateActivityInterval = setInterval(updateActivity, 60000);
      return () => clearInterval(updateActivityInterval);
    }
  }, [user]);

  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log(`Evento de autenticação: ${event}`);
    
    if (processingAuthChange.current) {
      console.log('Skipping auth event processing, already in progress');
      return;
    }
    
    if (session?.access_token && session.access_token === lastProcessedSessionId.current) {
      console.log('Skipping duplicate session processing');
      return;
    }
    
    try {
      processingAuthChange.current = true;
      
      if (!session) {
        console.log('Sem sessão, definindo usuário como nulo');
        setUser(null);
        sessionStorage.removeItem('user_role');
        return;
      }
      
      lastProcessedSessionId.current = session.access_token;
      
      // SECURITY: Validate user profile before allowing access
      const validation = await validateUserProfile(session.user.id);
      
      if (!validation.isValid) {
        console.error(`SECURITY: Invalid user profile detected for ${session.user.email} - Reason: ${validation.reason}`);
        
        // Handle different validation failure reasons
        if (validation.reason === 'ORPHANED_USER') {
          await handleOrphanedUser(session.user.id, session.user.email);
        }
        
        // Force sign out for any invalid user
        await supabase.auth.signOut();
        setUser(null);
        sessionStorage.removeItem('user_role');
        return;
      }
      
      const profile = validation.profile;
      
      if (event === 'SIGNED_IN') {
        setTimeout(async () => {
          await updateLastLogin(session.user.id);
          const ipAddress = await getClientIP();
          await manageActiveSession(session.user.id, ipAddress);
        }, 0);
      }
      
      const userRole = profile.role || 'user';
      sessionStorage.setItem('user_role', userRole);
      
      const newUser: User = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: profile.full_name || session.user.user_metadata?.full_name || '',
        phone: profile.phone || session.user.phone || '',
        city: profile.city || session.user.user_metadata?.city || '',
        state: profile.state || session.user.user_metadata?.state || '',
        role: userRole as 'user' | 'admin',
        subscription_status: profile.subscription_status as 'active' | 'inactive' | 'pending' || 'inactive',
        subscription_type: profile.subscription_type as ('monthly' | 'yearly' | undefined),
        subscription_start_date: profile.subscription_start_date || undefined,
      };
      
      setUser(prevUser => {
        if (!isEqual(prevUser, newUser)) {
          console.log('Usuário autenticado:', session.user.email);
          return newUser;
        }
        return prevUser;
      });
    } catch (error) {
      console.error('Erro ao processar alteração de autenticação:', error);
      // On any error, ensure user is signed out for security
      await supabase.auth.signOut();
      setUser(null);
      sessionStorage.removeItem('user_role');
    } finally {
      processingAuthChange.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('Inicializando provedor de autenticação');
    
    const initializeAuth = async () => {
      setIsInitializing(true);
      
      try {
        const debouncedAuthChangeHandler = debounce((event: string, session: any) => {
          console.log(`Evento de autenticação detectado: ${event}`);
          setTimeout(() => {
            handleAuthChange(event, session);
          }, 0);
        }, 300);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(debouncedAuthChangeHandler);
        
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
  }, [handleAuthChange]);

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
      const ipAddress = await getClientIP();
      
      const isBlocked = await checkIPBlocked(ipAddress);
      if (isBlocked) {
        toast({
          variant: "destructive",
          title: "Acesso bloqueado",
          description: "Seu endereço IP foi bloqueado temporariamente por motivos de segurança.",
        });
        await recordLoginAttempt(email, null, ipAddress, false);
        return false;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error.message);
        await recordLoginAttempt(email, null, ipAddress, false);
        await checkAndBlockIP(ipAddress);
        
        throw error;
      }

      if (data.user) {
        // SECURITY: Validate profile exists before considering login successful
        const validation = await validateUserProfile(data.user.id);
        
        if (!validation.isValid) {
          console.error(`SECURITY: Login blocked for ${email} - Reason: ${validation.reason}`);
          
          // Record failed attempt due to security validation
          await recordLoginAttempt(email, data.user.id, ipAddress, false);
          
          // Handle orphaned user
          if (validation.reason === 'ORPHANED_USER') {
            await handleOrphanedUser(data.user.id, email);
            toast({
              variant: "destructive",
              title: "Conta não encontrada",
              description: "Esta conta não existe mais no sistema. Entre em contato com o suporte se necessário.",
            });
          } else if (validation.reason === 'DEACTIVATED_USER') {
            toast({
              variant: "destructive",
              title: "Conta desativada",
              description: "Sua conta foi desativada. Entre em contato com o suporte para reativação.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro de acesso",
              description: "Não foi possível validar sua conta. Tente novamente ou entre em contato com o suporte.",
            });
          }
          
          // Force sign out
          await supabase.auth.signOut();
          return false;
        }
        
        // Record successful login only after profile validation
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

  const register = async (
    fullName: string, 
    email: string, 
    password: string, 
    phone?: string,
    city?: string,
    state?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            city: city,
            state: state
          },
        }
      });

      if (error) {
        throw error;
      }
      
      if (data.user) {
        const ipAddress = await getClientIP();
        await recordLoginAttempt(email, data.user.id, ipAddress, true);
      }

      toast({
        title: "Registro realizado com sucesso!",
        description: "Seja bem-vindo(a) à Conexão Brasil! Verifique seu email para confirmar sua conta.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      let description = error.message || "Não foi possível criar sua conta. Tente novamente.";
      if (error.message?.includes("User already registered")) {
        description = "Este email já está cadastrado. Tente fazer login ou recuperar sua senha.";
      } else if (error.message?.includes("Password should be at least 6 characters")) {
        description = "A senha deve ter pelo menos 6 caracteres.";
      }
      toast({
        variant: "destructive",
        title: "Erro ao registrar conta",
        description: description,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await supabase
          .from('active_sessions')
          .delete()
          .eq('user_id', user.id);
      }
      
      await supabase.auth.signOut();
      setUser(null);
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
