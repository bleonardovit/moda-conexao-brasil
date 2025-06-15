
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSuppliersWithPagination } from "@/services/supplier/optimizedPaginatedQueries";
import { useOptimizedCache } from "./useOptimizedCache";
import { sanitizeUUID, validateUUIDArray } from "@/utils/uuidValidation";
import type { Supplier } from "@/types";

const PAGE_SIZE = 20;

interface UseInfiniteSuppliersProps {
  userId?: string;
  filters: {
    searchTerm?: string;
    category?: string;
    state?: string;
    city?: string;
    price?: string;
    cnpj?: string;
    favorites?: string[];
  };
}

interface SuppliersPage {
  items: Supplier[];
  hasMore: boolean;
  totalCount: number;
}

export function useInfiniteSuppliers({ userId, filters }: UseInfiniteSuppliersProps) {
  console.log('useInfiniteSuppliers: Hook called with:', { userId, filters });
  
  const { get, set } = useOptimizedCache();
  
  // Sanitizar userId e favorites
  const sanitizedUserId = sanitizeUUID(userId);
  const sanitizedFavorites = filters.favorites ? validateUUIDArray(filters.favorites) : undefined;

  const queryKey = [
    "infinite-suppliers-optimized",
    sanitizedUserId,
    filters.searchTerm,
    filters.category,
    filters.state,
    filters.city,
    filters.price,
    filters.cnpj,
    sanitizedFavorites,
  ];

  return useInfiniteQuery<SuppliersPage, Error>({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      console.log('useInfiniteSuppliers: Fetching page:', pageParam);
      const offset = Number(pageParam) * PAGE_SIZE;
      
      // Verificar cache para esta página específica
      const cacheKey = `page-${queryKey.join('-')}-${pageParam}`;
      const cachedPage = get<SuppliersPage>(cacheKey, 2 * 60 * 1000); // 2 minutos
      
      if (cachedPage) {
        console.log('useInfiniteSuppliers: Using cached page:', pageParam);
        return cachedPage;
      }

      const startTime = performance.now();
      
      const result = await getSuppliersWithPagination(
        sanitizedUserId || undefined,
        offset,
        PAGE_SIZE,
        {
          ...filters,
          favorites: sanitizedFavorites
        }
      );

      const page: SuppliersPage = {
        items: result.suppliers,
        hasMore: result.hasMore,
        totalCount: result.totalCount
      };

      const duration = performance.now() - startTime;
      
      // Cache com prioridade baseada na performance
      const priority = duration < 500 ? 3 : duration < 1000 ? 2 : 1;
      set(cacheKey, page, 2 * 60 * 1000, priority);

      console.log('useInfiniteSuppliers: Page result:', {
        pageParam,
        offset,
        suppliersCount: result.suppliers.length,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        duration: `${duration.toFixed(2)}ms`,
        cached: false
      });

      return page;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.hasMore) {
        const nextPage = allPages.length;
        console.log('useInfiniteSuppliers: Next page param:', nextPage);
        return nextPage;
      }
      console.log('useInfiniteSuppliers: No more pages');
      return undefined;
    },
    staleTime: 1000 * 60 * 3, // 3 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos no cache do React Query
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry logic mais inteligente
      if (failureCount >= 3) return false;
      
      // Não retry em erros de UUID
      if (error.message.includes('invalid input syntax for type uuid')) {
        console.error('UUID error detected, not retrying:', error);
        return false;
      }
      
      return true;
    }
  });
}
