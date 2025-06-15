
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/types';

interface SupplierFilters {
  searchTerm?: string;
  category?: string;
  state?: string;
  city?: string;
  price?: string;
  cnpj?: string;
  favorites?: string[];
}

interface PaginatedSupplierResult {
  suppliers: Supplier[];
  totalCount: number;
  hasMore: boolean;
}

export const getSuppliersWithPagination = async (
  userId?: string,
  offset: number = 0,
  limit: number = 20,
  filters: SupplierFilters = {}
): Promise<PaginatedSupplierResult> => {
  console.log('optimizedPaginatedQueries: Starting fetch with params:', {
    userId,
    offset,
    limit,
    filters
  });

  try {
    // Primeiro tentar com a função SQL otimizada
    const { data, error } = await supabase.rpc('get_suppliers_paginated', {
      p_user_id: userId || null,
      p_offset: offset,
      p_limit: limit,
      p_search_term: filters.searchTerm || null,
      p_category_id: filters.category && filters.category !== 'all' ? filters.category : null,
      p_state: filters.state && filters.state !== 'all' ? filters.state : null,
      p_city: filters.city && filters.city !== 'all' ? filters.city : null,
      p_price: filters.price && filters.price !== 'all' ? filters.price : null,
      p_requires_cnpj: filters.cnpj && filters.cnpj !== 'all' ? filters.cnpj === 'true' : null,
      p_favorites: filters.favorites && filters.favorites.length > 0 ? filters.favorites : null
    });

    if (error) {
      console.error('Error with SQL function, falling back to direct query:', error);
      return await fallbackQuery(userId, offset, limit, filters);
    }

    if (!data || data.length === 0) {
      console.log('optimizedPaginatedQueries: No data returned from SQL function, trying fallback');
      return await fallbackQuery(userId, offset, limit, filters);
    }

    // Processar dados da função SQL
    const suppliers = data.map((row: any) => ({
      ...row,
      averageRating: row.average_rating,
      isLockedForTrial: row.is_locked_for_trial
    })) as Supplier[];

    const totalCount = data[0]?.total_count || 0;
    const hasMore = data[0]?.has_more || false;

    console.log(`optimizedPaginatedQueries: SUCCESS - Returned ${suppliers.length} suppliers, total: ${totalCount}, hasMore: ${hasMore}`);
    
    return {
      suppliers,
      totalCount,
      hasMore
    };
  } catch (error) {
    console.error('Exception in getSuppliersWithPagination, using fallback:', error);
    return await fallbackQuery(userId, offset, limit, filters);
  }
};

// Fallback para query direta quando a função SQL falhar
const fallbackQuery = async (
  userId?: string,
  offset: number = 0,
  limit: number = 20,
  filters: SupplierFilters = {}
): Promise<PaginatedSupplierResult> => {
  console.log('optimizedPaginatedQueries: Using fallback direct query');

  try {
    // Build query direta
    let query = supabase
      .from('suppliers')
      .select(`
        *,
        suppliers_categories!inner(category_id),
        reviews(rating)
      `);

    // Aplicar filtros básicos
    query = query.eq('hidden', false);

    // Aplicar filtro de busca
    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,code.ilike.%${filters.searchTerm}%`);
    }

    // Aplicar filtro de categoria
    if (filters.category && filters.category !== 'all') {
      query = query.eq('suppliers_categories.category_id', filters.category);
    }

    // Aplicar filtro de estado
    if (filters.state && filters.state !== 'all') {
      query = query.eq('state', filters.state);
    }

    // Aplicar filtro de cidade
    if (filters.city && filters.city !== 'all') {
      query = query.eq('city', filters.city);
    }

    // Aplicar filtro de preço
    if (filters.price && filters.price !== 'all') {
      query = query.eq('avg_price', filters.price);
    }

    // Aplicar filtro de CNPJ
    if (filters.cnpj && filters.cnpj !== 'all') {
      query = query.eq('requires_cnpj', filters.cnpj === 'true');
    }

    // Aplicar filtro de favoritos
    if (filters.favorites && filters.favorites.length > 0) {
      query = query.in('id', filters.favorites);
    }

    // Aplicar paginação e ordenação
    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error in fallback query:', error);
      return { suppliers: [], totalCount: 0, hasMore: false };
    }

    if (!data || data.length === 0) {
      console.log('optimizedPaginatedQueries: No data from fallback query');
      return { suppliers: [], totalCount: 0, hasMore: false };
    }

    // Processar dados da query direta
    const processedSuppliers = new Map<string, any>();

    data.forEach((row: any) => {
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

      // Adicionar categoria ao fornecedor
      if (row.suppliers_categories?.category_id) {
        const supplier = processedSuppliers.get(row.id);
        if (!supplier.categories.includes(row.suppliers_categories.category_id)) {
          supplier.categories.push(row.suppliers_categories.category_id);
        }
      }
    });

    const suppliers = Array.from(processedSuppliers.values()) as Supplier[];
    const totalCount = count || 0;
    const hasMore = offset + limit < totalCount;

    console.log(`optimizedPaginatedQueries: FALLBACK SUCCESS - Returned ${suppliers.length} suppliers, total: ${totalCount}, hasMore: ${hasMore}`);
    
    return {
      suppliers,
      totalCount,
      hasMore
    };
  } catch (error) {
    console.error('Exception in fallback query:', error);
    return { suppliers: [], totalCount: 0, hasMore: false };
  }
};
