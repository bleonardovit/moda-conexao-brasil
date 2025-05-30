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

  // Carregar favoritos do banco de dados ou localStorage
  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);

      const canAccessFavorites = await isFeatureAllowed('favorites');
      if (!canAccessFavorites) {
        // Se o usuário não pode acessar, limpa os favoritos locais e do estado.
        // Não mostra toast aqui, pois a UI (FavoritesList) cuidará da mensagem.
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
  }, [isAuthenticated, user?.id, toast, isFeatureAllowed, getAccessDeniedMessage]); // Removed getAccessDeniedMessage as it's not used here directly for toast

  const addFavorite = async (supplierId: string) => {
    const canAccessFavorites = await isFeatureAllowed('favorites');
    if (!canAccessFavorites) {
      toast({
        variant: "default", // Changed from "warning"
        title: "Acesso Negado",
        description: getAccessDeniedMessage()
      });
      return;
    }

    if (favorites.includes(supplierId)) return;
    
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
        variant: "default", // Changed from "warning"
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
        setFavorites([...favorites]); // Revert to original favorites before this attempt
        localStorage.setItem('supplier-favorites', JSON.stringify(favorites)); // Revert localStorage
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
        variant: "default", // Changed from "warning"
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
