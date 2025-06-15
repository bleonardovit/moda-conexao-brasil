
import { supabase } from '@/integrations/supabase/client';
import { isCurrentUserAdminCached } from '../optimizedDbFunctions';

interface NavigationSupplier {
  id: string;
  name: string;
  featured: boolean;
}

interface NavigationResult {
  previous?: NavigationSupplier;
  next?: NavigationSupplier;
  total: number;
  position: number;
}

export const getOptimizedSupplierNavigation = async (
  currentSupplierId: string,
  userId?: string
): Promise<NavigationResult> => {
  console.log('optimizedNavigationQueries: Getting navigation for supplier:', currentSupplierId);

  const isAdmin = await isCurrentUserAdminCached();

  // Query para obter apenas IDs ordenados (mais eficiente)
  let idsQuery = supabase
    .from('suppliers')
    .select('id, name, featured, created_at')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (!isAdmin) {
    idsQuery = idsQuery.eq('hidden', false);
  }

  const { data: suppliers, error } = await idsQuery;

  if (error || !suppliers) {
    console.error('Error fetching supplier navigation:', error);
    return { total: 0, position: 0 };
  }

  const currentIndex = suppliers.findIndex(s => s.id === currentSupplierId);
  
  if (currentIndex === -1) {
    return { total: suppliers.length, position: 0 };
  }

  const result: NavigationResult = {
    total: suppliers.length,
    position: currentIndex + 1
  };

  // Fornecedor anterior
  if (currentIndex > 0) {
    const prev = suppliers[currentIndex - 1];
    result.previous = {
      id: prev.id,
      name: prev.name,
      featured: prev.featured
    };
  }

  // Próximo fornecedor
  if (currentIndex < suppliers.length - 1) {
    const next = suppliers[currentIndex + 1];
    result.next = {
      id: next.id,
      name: next.name,
      featured: next.featured
    };
  }

  console.log(`optimizedNavigationQueries: Position ${result.position}/${result.total}`);

  return result;
};
