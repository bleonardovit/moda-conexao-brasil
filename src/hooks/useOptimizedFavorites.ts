
import { useState, useEffect, useMemo } from 'react';
import { getOptimizedFavorites } from '@/services/supplier/optimizedFavoritesQueries';
import { useFavorites } from '@/hooks/use-favorites';
import type { Supplier } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface FavoritesResult {
  suppliers: Supplier[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  search: (term: string) => void;
}

export function useOptimizedFavorites(): FavoritesResult {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(0);
  
  const { favorites } = useFavorites();
  const { user } = useAuth();

  const loadFavorites = async (reset: boolean = false) => {
    if (!user?.id || !favorites.length) {
      setSuppliers([]);
      setTotalCount(0);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      const result = await getOptimizedFavorites(
        user.id,
        favorites,
        searchTerm,
        currentOffset,
        20
      );

      if (reset) {
        setSuppliers(result.suppliers);
        setOffset(20);
      } else {
        setSuppliers(prev => [...prev, ...result.suppliers]);
        setOffset(prev => prev + 20);
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar favoritos quando mudarem
  useEffect(() => {
    setOffset(0);
    loadFavorites(true);
  }, [favorites, searchTerm, user?.id]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadFavorites(false);
    }
  };

  const search = (term: string) => {
    setSearchTerm(term);
    setOffset(0);
  };

  return useMemo(() => ({
    suppliers,
    totalCount,
    hasMore,
    isLoading,
    loadMore,
    search
  }), [suppliers, totalCount, hasMore, isLoading]);
}
