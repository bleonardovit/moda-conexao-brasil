
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/types';

interface AdminSuppliersResult {
  suppliers: Supplier[];
  totalCount: number;
  hasMore: boolean;
}

interface AdminFilters {
  searchTerm?: string;
  hiddenFilter?: 'all' | 'visible' | 'hidden';
  featuredFilter?: 'all' | 'featured' | 'normal';
}

export const getOptimizedAdminSuppliers = async (
  offset: number = 0,
  limit: number = 20,
  filters: AdminFilters = {}
): Promise<AdminSuppliersResult> => {
  console.log('optimizedAdminQueries: Fetching admin suppliers with filters:', filters);
  console.log('optimizedAdminQueries: Pagination - offset:', offset, 'limit:', limit);

  // Query base separada para contagem (sem joins complexos)
  let countQuery = supabase
    .from('suppliers')
    .select('id', { count: 'exact', head: true });

  // Aplicar filtros na query de contagem
  if (filters.searchTerm) {
    countQuery = countQuery.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,code.ilike.%${filters.searchTerm}%`);
  }

  if (filters.hiddenFilter === 'visible') {
    countQuery = countQuery.eq('hidden', false);
  } else if (filters.hiddenFilter === 'hidden') {
    countQuery = countQuery.eq('hidden', true);
  }

  if (filters.featuredFilter === 'featured') {
    countQuery = countQuery.eq('featured', true);
  } else if (filters.featuredFilter === 'normal') {
    countQuery = countQuery.eq('featured', false);
  }

  // Executar query de contagem
  const { count, error: countError } = await countQuery;
  
  if (countError) {
    console.error('Error counting admin suppliers:', countError);
    return { suppliers: [], totalCount: 0, hasMore: false };
  }

  const totalCount = count || 0;
  console.log('optimizedAdminQueries: Total count from database:', totalCount);

  // Query principal para buscar dados
  let dataQuery = supabase
    .from('suppliers')
    .select(`
      *,
      suppliers_categories!left(category_id),
      reviews!left(rating)
    `);

  // Aplicar os mesmos filtros na query de dados
  if (filters.searchTerm) {
    dataQuery = dataQuery.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,code.ilike.%${filters.searchTerm}%`);
  }

  if (filters.hiddenFilter === 'visible') {
    dataQuery = dataQuery.eq('hidden', false);
  } else if (filters.hiddenFilter === 'hidden') {
    dataQuery = dataQuery.eq('hidden', true);
  }

  if (filters.featuredFilter === 'featured') {
    dataQuery = dataQuery.eq('featured', true);
  } else if (filters.featuredFilter === 'normal') {
    dataQuery = dataQuery.eq('featured', false);
  }

  // Aplicar paginação e ordenação
  dataQuery = dataQuery
    .order('featured', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await dataQuery;

  if (error) {
    console.error('Error fetching admin suppliers data:', error);
    return { suppliers: [], totalCount, hasMore: false };
  }

  console.log('optimizedAdminQueries: Raw data length:', data?.length || 0);

  // Processar suppliers (remover duplicatas por join)
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
        isLockedForTrial: false // Admins nunca veem suppliers bloqueados
      });
    }

    // Adicionar categoria se existir
    if (row.suppliers_categories?.category_id) {
      const supplier = processedSuppliers.get(row.id);
      if (!supplier.categories.includes(row.suppliers_categories.category_id)) {
        supplier.categories.push(row.suppliers_categories.category_id);
      }
    }
  });

  const suppliers = Array.from(processedSuppliers.values());
  const hasMore = offset + limit < totalCount;

  console.log(`optimizedAdminQueries: Processed ${suppliers.length} suppliers`);
  console.log(`optimizedAdminQueries: Total count: ${totalCount}, hasMore: ${hasMore}`);
  console.log(`optimizedAdminQueries: Current range: ${offset + 1}-${Math.min(offset + limit, totalCount)} of ${totalCount}`);

  return {
    suppliers,
    totalCount,
    hasMore
  };
};
