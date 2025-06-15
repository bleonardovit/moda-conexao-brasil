
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAuthActions() {
  const { toast } = useToast();

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  }, []);

  return { signOut, signIn, signUp };
}
