
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/types';
import { isCurrentUserAdminCached } from '../optimizedDbFunctions';

interface FavoritesResult {
  suppliers: Supplier[];
  totalCount: number;
  hasMore: boolean;
}

export const getOptimizedFavorites = async (
  userId: string,
  favoriteIds: string[],
  searchTerm: string = '',
  offset: number = 0,
  limit: number = 20
): Promise<FavoritesResult> => {
  console.log('optimizedFavoritesQueries: Fetching favorites for user:', userId);

  if (!favoriteIds || favoriteIds.length === 0) {
    return { suppliers: [], totalCount: 0, hasMore: false };
  }

  const isAdmin = await isCurrentUserAdminCached();

  // Query otimizada que filtra favoritos direto no SQL
  let query = supabase
    .from('suppliers')
    .select(`
      *,
      suppliers_categories!inner(category_id),
      reviews(rating)
    `)
    .in('id', favoriteIds);

  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  // Aplicar filtro de busca se necessário
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  // Contar total primeiro
  const countQuery = query;
  const { count } = await countQuery;
  const totalCount = count || 0;

  // Aplicar paginação
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching favorites:', error);
    return { suppliers: [], totalCount: 0, hasMore: false };
  }

  // Processar suppliers
  const processedSuppliers = new Map<string, any>();

  (data || []).forEach((row: any) => {
    if (!processedSuppliers.has(row.id)) {
      // Calcular rating médio
      const ratings = row.reviews?.map((r: any) => r.rating).filter(Boolean) || [];
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
        : undefined;

      processedSuppliers.set(row.id, {
        ...row,
        categories: [],
        averageRating,
        isLockedForTrial: false
      });
    }

    if (row.suppliers_categories?.category_id) {
      const supplier = processedSuppliers.get(row.id);
      if (!supplier.categories.includes(row.suppliers_categories.category_id)) {
        supplier.categories.push(row.suppliers_categories.category_id);
      }
    }
  });

  const suppliers = Array.from(processedSuppliers.values());
  const hasMore = offset + limit < totalCount;

  console.log(`optimizedFavoritesQueries: Found ${suppliers.length} favorites, total: ${totalCount}, hasMore: ${hasMore}`);

  return {
    suppliers,
    totalCount,
    hasMore
  };
};
