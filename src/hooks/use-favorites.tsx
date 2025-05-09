
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

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

  // Carregar favoritos do banco de dados quando o usuário estiver autenticado
  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated) {
        // Se não estiver autenticado, carrega do localStorage
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
        
        // Extrair apenas os IDs dos fornecedores
        const supplierIds = data.map(item => item.supplier_id);
        setFavorites(supplierIds);
        
        // Sincronizar com localStorage para uso offline
        localStorage.setItem('supplier-favorites', JSON.stringify(supplierIds));
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        // Fallback para localStorage
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
  }, [isAuthenticated, user?.id, toast]);

  const addFavorite = async (supplierId: string) => {
    if (favorites.includes(supplierId)) return;
    
    // Adicionar imediatamente à lista local para feedback instantâneo
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
        // Reverter a alteração local se houver erro no banco de dados
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
    // Remover imediatamente da lista local para feedback instantâneo
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
        // Reverter a alteração local se houver erro no banco de dados
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

  const toggleFavorite = (supplierId: string) => {
    if (isFavorite(supplierId)) {
      removeFavorite(supplierId);
    } else {
      addFavorite(supplierId);
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
