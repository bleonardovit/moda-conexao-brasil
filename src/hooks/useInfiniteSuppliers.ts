
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSuppliersOptimized } from "@/services/supplier/optimizedQueries";
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
  return useInfiniteQuery<SuppliersPage, Error>({
    queryKey: [
      "suppliers-optimized",
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
      const offset = Number(pageParam) * PAGE_SIZE;
      
      const result = await getSuppliersOptimized(
        userId,
        offset,
        PAGE_SIZE,
        filters
      );

      return {
        items: result.suppliers,
        hasMore: result.hasMore,
        totalCount: result.totalCount
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.hasMore) {
        return allPages.length;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    initialPageParam: 0,
  });
}
