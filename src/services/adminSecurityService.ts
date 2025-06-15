
import { supabase } from '@/integrations/supabase/client';

// Função segura para verificar se o usuário atual é admin
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.role === 'admin';
  } catch (error) {
    console.error('Error in isCurrentUserAdmin:', error);
    return false;
  }
};

// Função para verificar permissões e executar query com fallback
export const executeAdminQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackValue: T
): Promise<T> => {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.warn('User is not admin, returning fallback value');
      return fallbackValue;
    }

    const { data, error } = await queryFn();
    
    if (error) {
      console.error('Query error:', error);
      return fallbackValue;
    }

    return data || fallbackValue;
  } catch (error) {
    console.error('Error in executeAdminQuery:', error);
    return fallbackValue;
  }
};
