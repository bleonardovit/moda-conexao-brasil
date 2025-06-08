
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSEOSettings, updateSEOSettings } from '@/services/seoService';
import { SEOSettings, SEOUpdateData } from '@/types/seo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSEOSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data, error } = await supabase.rpc('get_current_user_id');
        if (error) {
          console.error('Error getting current user ID:', error);
          return;
        }
        setCurrentUserId(data);
      } catch (error) {
        console.error('Error in getCurrentUser:', error);
      }
    };

    getCurrentUser();
  }, []);

  const {
    data: seoSettings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: getSEOSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: SEOUpdateData) => {
      if (!seoSettings?.id || !currentUserId) {
        throw new Error('SEO settings ID or user ID not available');
      }
      return updateSEOSettings(seoSettings.id, updates, currentUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: "Sucesso",
        description: "Configurações de SEO atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating SEO settings:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar configurações de SEO.",
      });
    },
  });

  return {
    seoSettings,
    isLoading,
    error,
    updateSEOSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
