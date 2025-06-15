
import { useState, useEffect, useMemo } from 'react';
import { getOptimizedSearchResults } from '@/services/supplier/optimizedSearchQueries';
import type { Supplier } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface SearchResult {
  suppliers: Supplier[];
  articles: any[];
  isLoading: boolean;
}

export function useOptimizedSearch(query: string, limit: number = 10): SearchResult {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Debounce da query
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuppliers([]);
      setArticles([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const results = await getOptimizedSearchResults(debouncedQuery, user?.id, limit);
        setSuppliers(results.suppliers);
        setArticles(results.articles);
      } catch (error) {
        console.error('Error in optimized search:', error);
        setSuppliers([]);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, user?.id, limit]);

  return useMemo(() => ({
    suppliers,
    articles,
    isLoading
  }), [suppliers, articles, isLoading]);
}
