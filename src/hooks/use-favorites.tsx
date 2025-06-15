
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useTrialStatus } from '@/hooks/use-trial-status';

type FavoriteItem = {
  id: string;
  user_id: string;
  supplier_id: string;
  created_at: string;
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const isAuthenticated = !!user;
  const { isFeatureAllowed, hasExpired } = useTrialStatus();

  const getAccessDeniedMessage = useCallback(() => {
    return hasExpired 
      ? "Seu período de teste expirou. Assine para gerenciar seus favoritos."
      : "A funcionalidade de favoritos não está disponível no seu plano atual. Considere fazer um upgrade.";
  }, [hasExpired]);

  // Verificar se usuário atingiu o limite de favoritos
  const checkFavoritesLimit = useCallback(async (): Promise<{ canAdd: boolean; message?: string }> => {
    if (!isAuthenticated) {
      // Para usuários não logados, usar limite local
      if (favorites.length >= 5) {
        return { 
          canAdd: false, 
          message: "Você atingiu o limite de 5 favoritos. Faça login ou assine para favoritos ilimitados." 
        };
      }
      return { canAdd: true };
    }

    // Para usuários logados, verificar regras de acesso
    try {
      const { data: accessRules } = await supabase
        .from('feature_access_rules')
        .select('*')
        .eq('feature_key', 'favorites')
        .single();

      if (!accessRules) {
        return { canAdd: true }; // Se não há regras, permitir
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('subscription_status, trial_status')
        .eq('id', user.id)
        .single();

      // Usuários com assinatura ativa têm acesso ilimitado
      if (userProfile?.subscription_status === 'active') {
        return { canAdd: true };
      }

      // Usuários em trial: verificar se há limite
      if (userProfile?.trial_status === 'active') {
        if (accessRules.trial_access_level === 'full') {
          return { canAdd: true };
        }
        if (accessRules.trial_access_level === 'limited_count' && accessRules.trial_limit_value) {
          if (favorites.length >= accessRules.trial_limit_value) {
            return { 
              canAdd: false, 
              message: accessRules.trial_message_locked || "Você atingiu o limite de favoritos do seu trial." 
            };
          }
        }
        return { canAdd: true };
      }

      // Usuários não-assinantes
      if (accessRules.non_subscriber_access_level === 'limited_count' && accessRules.non_subscriber_limit_value) {
        if (favorites.length >= accessRules.non_subscriber_limit_value) {
          return { 
            canAdd: false, 
            message: accessRules.non_subscriber_message_locked || "Você atingiu o limite de favoritos." 
          };
        }
      }

      return { canAdd: true };
    } catch (error) {
      console.error('Erro ao verificar limite de favoritos:', error);
      return { canAdd: true }; // Em caso de erro, permitir para não bloquear
    }
  }, [favorites.length, isAuthenticated, user?.id]);

  // Carregar favoritos do banco de dados ou localStorage
  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);

      const canAccessFavorites = await isFeatureAllowed('favorites');
      if (!canAccessFavorites) {
        setFavorites([]);
        localStorage.removeItem('supplier-favorites');
        setIsLoading(false);
        return;
      }
      
      if (!isAuthenticated) {
        const savedFavorites = localStorage.getItem('supplier-favorites');
        setFavorites(savedFavorites ? JSON.parse(savedFavorites) : []);
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('supplier_id')
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        const supplierIds = data.map(item => item.supplier_id);
        setFavorites(supplierIds);
        localStorage.setItem('supplier-favorites', JSON.stringify(supplierIds));
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        const savedFavorites = localStorage.getItem('supplier-favorites');
        setFavorites(savedFavorites ? JSON.parse(savedFavorites) : []);
        toast({
          variant: "destructive",
          title: "Erro ao carregar favoritos",
          description: "Não foi possível carregar seus favoritos. Usando dados em cache."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated, user?.id, toast, isFeatureAllowed]);

  const addFavorite = async (supplierId: string) => {
    const canAccessFavorites = await isFeatureAllowed('favorites');
    if (!canAccessFavorites) {
      toast({
        variant: "default",
        title: "Acesso Negado",
        description: getAccessDeniedMessage()
      });
      return;
    }

    if (favorites.includes(supplierId)) return;

    // Verificar limite antes de adicionar
    const limitCheck = await checkFavoritesLimit();
    if (!limitCheck.canAdd) {
      toast({
        variant: "default",
        title: "Limite Atingido",
        description: limitCheck.message
      });
      return;
    }
    
    setFavorites(prev => [...prev, supplierId]);
    localStorage.setItem('supplier-favorites', JSON.stringify([...favorites, supplierId]));
    
    if (isAuthenticated) {
      try {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            supplier_id: supplierId
          });
        
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Erro ao adicionar favorito:', error);
        const updatedFavorites = favorites.filter(id => id !== supplierId);
        setFavorites(updatedFavorites);
        localStorage.setItem('supplier-favorites', JSON.stringify(updatedFavorites));
        toast({
          variant: "destructive",
          title: "Erro ao adicionar favorito",
          description: "Não foi possível adicionar este fornecedor aos favoritos."
        });
      }
    }
  };

  const removeFavorite = async (supplierId: string) => {
    const canAccessFavorites = await isFeatureAllowed('favorites');
    if (!canAccessFavorites) {
      toast({
        variant: "default",
        title: "Acesso Negado",
        description: getAccessDeniedMessage()
      });
      return;
    }

    const updatedFavorites = favorites.filter(id => id !== supplierId);
    setFavorites(updatedFavorites);
    localStorage.setItem('supplier-favorites', JSON.stringify(updatedFavorites));
    
    if (isAuthenticated) {
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('supplier_id', supplierId);
        
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Erro ao remover favorito:', error);
        setFavorites([...favorites]);
        localStorage.setItem('supplier-favorites', JSON.stringify(favorites));
        toast({
          variant: "destructive",
          title: "Erro ao remover favorito",
          description: "Não foi possível remover este fornecedor dos favoritos."
        });
      }
    }
  };

  const toggleFavorite = async (supplierId: string) => {
    const canAccessFavorites = await isFeatureAllowed('favorites');
    if (!canAccessFavorites) {
      toast({
        variant: "default",
        title: "Acesso Negado",
        description: getAccessDeniedMessage()
      });
      return;
    }

    if (isFavorite(supplierId)) {
      await removeFavorite(supplierId);
    } else {
      await addFavorite(supplierId);
    }
  };

  const isFavorite = (supplierId: string) => {
    return favorites.includes(supplierId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
