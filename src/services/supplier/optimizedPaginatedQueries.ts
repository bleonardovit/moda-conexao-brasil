
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
  console.log('optimizedPaginatedQueries: Fetching suppliers with SQL function...');

  try {
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
      console.error('Error fetching suppliers with SQL function:', error.message);
      return { suppliers: [], totalCount: 0, hasMore: false };
    }

    if (!data || data.length === 0) {
      console.log('optimizedPaginatedQueries: No suppliers found.');
      return { suppliers: [], totalCount: 0, hasMore: false };
    }

    // A função SQL já retorna tudo processado
    const suppliers = data.map((row: any) => ({
      ...row,
      averageRating: row.average_rating,
      isLockedForTrial: row.is_locked_for_trial
    })) as Supplier[];

    const totalCount = data[0]?.total_count || 0;
    const hasMore = data[0]?.has_more || false;

    console.log(`optimizedPaginatedQueries: Returned ${suppliers.length} suppliers, total: ${totalCount}, hasMore: ${hasMore}`);
    
    return {
      suppliers,
      totalCount,
      hasMore
    };
  } catch (error) {
    console.error('Exception in getSuppliersWithPagination:', error);
    return { suppliers: [], totalCount: 0, hasMore: false };
  }
};
