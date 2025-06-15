
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/types';
import { getUserTrialInfo, getAllowedSuppliersForTrial } from '../trialService';
import { isCurrentUserAdminCached } from '../optimizedDbFunctions';

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

export const getSuppliersOptimized = async (
  userId?: string,
  offset: number = 0,
  limit: number = 20,
  filters: SupplierFilters = {}
): Promise<PaginatedSupplierResult> => {
  console.log('optimizedQueries: Fetching suppliers with optimized query...');

  const isAdmin = await isCurrentUserAdminCached();
  
  // Build base query with suppliers and their categories
  let query = supabase
    .from('suppliers')
    .select(`
      *,
      suppliers_categories!inner(
        category_id
      ),
      reviews(rating)
    `);

  // Apply visibility filter (admin sees all, users see only non-hidden)
  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  // Apply search filter
  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,code.ilike.%${filters.searchTerm}%`);
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    query = query.eq('suppliers_categories.category_id', filters.category);
  }

  // Apply state filter
  if (filters.state && filters.state !== 'all') {
    query = query.eq('state', filters.state);
  }

  // Apply city filter
  if (filters.city && filters.city !== 'all') {
    query = query.eq('city', filters.city);
  }

  // Apply price filter
  if (filters.price && filters.price !== 'all') {
    query = query.eq('avg_price', filters.price);
  }

  // Apply CNPJ filter
  if (filters.cnpj && filters.cnpj !== 'all') {
    query = query.eq('requires_cnpj', filters.cnpj === 'true');
  }

  // Apply favorites filter
  if (filters.favorites && filters.favorites.length > 0) {
    query = query.in('id', filters.favorites);
  }

  // Get total count first
  const countQuery = query;
  const { count } = await countQuery;
  const totalCount = count || 0;

  // Apply pagination and ordering
  query = query
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching suppliers with optimized query:', error.message);
    return { suppliers: [], totalCount: 0, hasMore: false };
  }

  if (!data || data.length === 0) {
    console.log('optimizedQueries: No suppliers found.');
    return { suppliers: [], totalCount: 0, hasMore: false };
  }

  const hasMore = offset + limit < totalCount;

  // Verificar status de trial para determinar suppliers bloqueados
  let allowedSupplierIds: string[] = [];
  let isInActiveTrial = false;
  let hasExpiredTrial = false;
  
  if (userId && !isAdmin) {
    try {
      const trialInfo = await getUserTrialInfo(userId);
      
      if (trialInfo) {
        if (trialInfo.trial_status === 'active') {
          isInActiveTrial = true;
          allowedSupplierIds = await getAllowedSuppliersForTrial(userId);
        } else if (trialInfo.trial_status === 'expired') {
          hasExpiredTrial = true;
        }
      }
    } catch (error) {
      console.error('Error checking trial status in optimized query:', error);
    }
  }

  // Process and map the suppliers
  const processedSuppliers = new Map<string, any>();

  data.forEach((row: any) => {
    if (!processedSuppliers.has(row.id)) {
      // Calculate average rating
      const ratings = row.reviews?.map((r: any) => r.rating).filter(Boolean) || [];
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
        : undefined;

      // Determine if supplier should be locked for trial users
      let isLocked = false;
      if (userId && !isAdmin) {
        if (hasExpiredTrial) {
          isLocked = true;
        } else if (isInActiveTrial) {
          isLocked = !allowedSupplierIds.includes(row.id);
        }
      }

      processedSuppliers.set(row.id, {
        ...row,
        categories: [],
        averageRating,
        isLockedForTrial: isLocked
      });
    }

    // Add category to the supplier
    if (row.suppliers_categories?.category_id) {
      const supplier = processedSuppliers.get(row.id);
      if (!supplier.categories.includes(row.suppliers_categories.category_id)) {
        supplier.categories.push(row.suppliers_categories.category_id);
      }
    }
  });

  const suppliers = Array.from(processedSuppliers.values()) as Supplier[];

  // Sort to prioritize unlocked suppliers
  suppliers.sort((a, b) => {
    if (a.isLockedForTrial && !b.isLockedForTrial) return 1;
    if (!a.isLockedForTrial && b.isLockedForTrial) return -1;
    return 0;
  });

  console.log(`optimizedQueries: Returned ${suppliers.length} suppliers, total: ${totalCount}, hasMore: ${hasMore}`);
  
  return {
    suppliers,
    totalCount,
    hasMore
  };
};
