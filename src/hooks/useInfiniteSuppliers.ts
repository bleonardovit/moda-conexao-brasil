
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSuppliers } from "@/services/supplierService";
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

// Defina o tipo de retorno da página
interface SuppliersPage {
  items: Supplier[];
  hasMore: boolean;
}

export function useInfiniteSuppliers({ userId, filters }: UseInfiniteSuppliersProps) {
  return useInfiniteQuery<SuppliersPage, Error>({
    queryKey: [
      "suppliers",
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
      const allSuppliers: Supplier[] = await getSuppliers(userId);
      let filtered = allSuppliers;

      if (filters.favorites && filters.favorites.length > 0) {
        filtered = filtered.filter(s => filters.favorites!.includes(s.id));
      }
      if (filters.searchTerm) {
        filtered = filtered.filter(s =>
          s.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          (s.description && s.description.toLowerCase().includes(filters.searchTerm!.toLowerCase())) ||
          (s.code && s.code.toLowerCase().includes(filters.searchTerm!.toLowerCase()))
        );
      }
      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter(s =>
          s.categories && s.categories.includes(filters.category!)
        );
      }
      if (filters.state && filters.state !== "all") {
        filtered = filtered.filter(s => s.state === filters.state);
      }
      if (filters.city && filters.city !== "all") {
        filtered = filtered.filter(s => s.city === filters.city);
      }
      if (filters.price && filters.price !== "all") {
        filtered = filtered.filter(s => s.avg_price === filters.price);
      }
      if (filters.cnpj && filters.cnpj !== "all") {
        filtered = filtered.filter(s => s.requires_cnpj === (filters.cnpj === "true"));
      }

      const start = Number(pageParam) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const currentPage = filtered.slice(start, end);

      return {
        items: currentPage,
        hasMore: end < filtered.length
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.hasMore) {
        return allPages.length;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
    initialPageParam: 0, // ADICIONADO conforme necessário pelo React Query v5+
  });
}
