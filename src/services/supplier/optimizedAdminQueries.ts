
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

  // Query base para admins (vê todos os fornecedores)
  let query = supabase
    .from('suppliers')
    .select(`
      *,
      suppliers_categories!inner(category_id),
      reviews(rating)
    `);

  // Aplicar filtros
  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,code.ilike.%${filters.searchTerm}%`);
  }

  if (filters.hiddenFilter === 'visible') {
    query = query.eq('hidden', false);
  } else if (filters.hiddenFilter === 'hidden') {
    query = query.eq('hidden', true);
  }

  if (filters.featuredFilter === 'featured') {
    query = query.eq('featured', true);
  } else if (filters.featuredFilter === 'normal') {
    query = query.eq('featured', false);
  }

  // Contar total
  const countQuery = query;
  const { count } = await countQuery;
  const totalCount = count || 0;

  // Aplicar paginação e ordenação
  query = query
    .order('featured', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching admin suppliers:', error);
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
        isLockedForTrial: false // Admins nunca veem suppliers bloqueados
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

  console.log(`optimizedAdminQueries: Found ${suppliers.length} suppliers, total: ${totalCount}, hasMore: ${hasMore}`);

  return {
    suppliers,
    totalCount,
    hasMore
  };
};
