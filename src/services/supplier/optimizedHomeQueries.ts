
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/types';
import { getUserTrialInfo, getAllowedSuppliersForTrial } from '../trialService';
import { isCurrentUserAdminCached } from '../optimizedDbFunctions';

interface HomeSupplierResult {
  featuredSuppliers: Supplier[];
  recentSuppliers: Supplier[];
}

export const getOptimizedHomeSuppiers = async (
  userId?: string,
  featuredLimit: number = 6,
  recentLimit: number = 8
): Promise<HomeSupplierResult> => {
  console.log('optimizedHomeQueries: Fetching home suppliers...');

  const isAdmin = await isCurrentUserAdminCached();
  
  // Query para fornecedores em destaque
  let featuredQuery = supabase
    .from('suppliers')
    .select(`
      *,
      suppliers_categories!inner(category_id),
      reviews(rating)
    `)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(featuredLimit);

  // Query para fornecedores recentes
  let recentQuery = supabase
    .from('suppliers')
    .select(`
      *,
      suppliers_categories!inner(category_id),
      reviews(rating)
    `)
    .order('created_at', { ascending: false })
    .limit(recentLimit);

  if (!isAdmin) {
    featuredQuery = featuredQuery.eq('hidden', false);
    recentQuery = recentQuery.eq('hidden', false);
  }

  const [featuredResult, recentResult] = await Promise.all([
    featuredQuery,
    recentQuery
  ]);

  if (featuredResult.error) {
    console.error('Error fetching featured suppliers:', featuredResult.error);
  }

  if (recentResult.error) {
    console.error('Error fetching recent suppliers:', recentResult.error);
  }

  // Processar suppliers com trial logic
  const processSuppliers = (data: any[]): Supplier[] => {
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

      if (row.suppliers_categories?.category_id) {
        const supplier = processedSuppliers.get(row.id);
        if (!supplier.categories.includes(row.suppliers_categories.category_id)) {
          supplier.categories.push(row.suppliers_categories.category_id);
        }
      }
    });

    return Array.from(processedSuppliers.values());
  };

  const featuredSuppliers = processSuppliers(featuredResult.data || []);
  const recentSuppliers = processSuppliers(recentResult.data || []);

  // Aplicar trial logic se necessário
  if (userId && !isAdmin) {
    try {
      const trialInfo = await getUserTrialInfo(userId);
      
      if (trialInfo?.trial_status === 'expired') {
        // Para trial expirado, bloquear todos
        featuredSuppliers.forEach(s => s.isLockedForTrial = true);
        recentSuppliers.forEach(s => s.isLockedForTrial = true);
      } else if (trialInfo?.trial_status === 'active') {
        // Para trial ativo, bloquear os não permitidos
        const allowedSupplierIds = await getAllowedSuppliersForTrial(userId);
        featuredSuppliers.forEach(s => s.isLockedForTrial = !allowedSupplierIds.includes(s.id));
        recentSuppliers.forEach(s => s.isLockedForTrial = !allowedSupplierIds.includes(s.id));
      }
    } catch (error) {
      console.error('Error applying trial logic:', error);
    }
  }

  console.log(`optimizedHomeQueries: Found ${featuredSuppliers.length} featured, ${recentSuppliers.length} recent suppliers`);

  return {
    featuredSuppliers,
    recentSuppliers
  };
};
