
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/types';
import { mapRawSupplierToDisplaySupplier } from './mapper';
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
  console.log('optimizedQueries: Fetching suppliers with SQL pagination...');

  // Preparar parâmetros para a função SQL
  const categoryId = filters.category && filters.category !== 'all' ? filters.category : null;
  const state = filters.state && filters.state !== 'all' ? filters.state : null;
  const city = filters.city && filters.city !== 'all' ? filters.city : null;
  const avgPrice = filters.price && filters.price !== 'all' ? filters.price : null;
  const requiresCnpj = filters.cnpj && filters.cnpj !== 'all' ? (filters.cnpj === 'true') : null;
  const favoriteIds = filters.favorites && filters.favorites.length > 0 ? filters.favorites : null;

  // Chamar a função SQL otimizada
  const { data, error } = await supabase.rpc('get_suppliers_paginated', {
    p_user_id: userId || null,
    p_offset: offset,
    p_limit: limit,
    p_search_term: filters.searchTerm || null,
    p_category_id: categoryId,
    p_state: state,
    p_city: city,
    p_avg_price: avgPrice,
    p_requires_cnpj: requiresCnpj,
    p_favorite_ids: favoriteIds
  });

  if (error) {
    console.error('Error fetching suppliers with optimized query:', error.message);
    return { suppliers: [], totalCount: 0, hasMore: false };
  }

  if (!data || data.length === 0) {
    console.log('optimizedQueries: No suppliers found.');
    return { suppliers: [], totalCount: 0, hasMore: false };
  }

  // O total_count é o mesmo para todos os registros na página
  const totalCount = data[0]?.total_count || 0;
  const hasMore = offset + limit < totalCount;

  // Verificar status de trial para determinar suppliers bloqueados
  let allowedSupplierIds: string[] = [];
  let isInActiveTrial = false;
  let hasExpiredTrial = false;
  
  const isAdmin = await isCurrentUserAdminCached();
  
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

  // Mapear os dados para o formato esperado pelo frontend
  const suppliers = data.map(supplier => {
    // Determinar se supplier deve ser bloqueado para trial users
    let isLocked = false;
    if (userId && !isAdmin) {
      if (hasExpiredTrial) {
        isLocked = true;
      } else if (isInActiveTrial) {
        isLocked = !allowedSupplierIds.includes(supplier.id);
      }
    }

    // Mapear os dados da view para o formato de Supplier
    const mappedSupplier = {
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      description: supplier.description,
      images: supplier.images || [],
      instagram: supplier.instagram,
      whatsapp: supplier.whatsapp,
      website: supplier.website,
      min_order: supplier.min_order,
      payment_methods: supplier.payment_methods || [],
      requires_cnpj: supplier.requires_cnpj,
      avg_price: supplier.avg_price,
      shipping_methods: supplier.shipping_methods || [],
      custom_shipping_method: supplier.custom_shipping_method,
      city: supplier.city,
      state: supplier.state,
      categories: supplier.category_ids || [],
      featured: supplier.featured,
      hidden: supplier.hidden,
      created_at: supplier.created_at,
      updated_at: supplier.updated_at,
      isLockedForTrial: isLocked,
      averageRating: supplier.average_rating ? Number(supplier.average_rating) : undefined
    };

    return mappedSupplier as Supplier;
  });

  // Aplicar ordenação para priorizar suppliers desbloqueados
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
