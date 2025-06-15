
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSuppliersWithPagination } from "@/services/supplier/optimizedPaginatedQueries";
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

  return useInfiniteQuery<SuppliersPage, Error>({
    queryKey: [
      "suppliers-paginated",
      userId,
      filters.searchTerm,
      filters.category,
      filters.state,
      filters.city,
      filters.price,
      filters.cnpj,
      filters.favorites,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('useInfiniteSuppliers: Fetching page:', pageParam);
      const offset = Number(pageParam) * PAGE_SIZE;
      
      const result = await getSuppliersWithPagination(
        userId,
        offset,
        PAGE_SIZE,
        filters
      );

      console.log('useInfiniteSuppliers: Page result:', {
        pageParam,
        offset,
        suppliersCount: result.suppliers.length,
        totalCount: result.totalCount,
        hasMore: result.hasMore
      });

      return {
        items: result.suppliers,
        hasMore: result.hasMore,
        totalCount: result.totalCount
      };
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
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos para debug
    gcTime: 1000 * 60 * 10, // Manter no cache por 10 minutos
    initialPageParam: 0,
  });
}
