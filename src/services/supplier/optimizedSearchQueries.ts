
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/types';
import { isCurrentUserAdminCached } from '../optimizedDbFunctions';

interface SearchResult {
  suppliers: Supplier[];
  articles: any[];
}

export const getOptimizedSearchResults = async (
  query: string,
  userId?: string,
  limit: number = 10
): Promise<SearchResult> => {
  console.log('optimizedSearchQueries: Fetching search results for:', query);

  const isAdmin = await isCurrentUserAdminCached();
  
  // Query otimizada para busca - apenas campos necessários
  let suppliersQuery = supabase
    .from('suppliers')
    .select(`
      id,
      name,
      description,
      city,
      state,
      featured,
      suppliers_categories!inner(category_id)
    `)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!isAdmin) {
    suppliersQuery = suppliersQuery.eq('hidden', false);
  }

  // Query para artigos
  const articlesQuery = supabase
    .from('articles')
    .select('id, title, summary, category')
    .eq('published', true)
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  const [suppliersResult, articlesResult] = await Promise.all([
    suppliersQuery,
    articlesQuery
  ]);

  if (suppliersResult.error) {
    console.error('Error in suppliers search:', suppliersResult.error);
  }

  if (articlesResult.error) {
    console.error('Error in articles search:', articlesResult.error);
  }

  // Processar suppliers com estrutura otimizada
  const processedSuppliers = new Map<string, any>();
  
  (suppliersResult.data || []).forEach((row: any) => {
    if (!processedSuppliers.has(row.id)) {
      processedSuppliers.set(row.id, {
        ...row,
        categories: []
      });
    }

    if (row.suppliers_categories?.category_id) {
      const supplier = processedSuppliers.get(row.id);
      if (!supplier.categories.includes(row.suppliers_categories.category_id)) {
        supplier.categories.push(row.suppliers_categories.category_id);
      }
    }
  });

  console.log(`optimizedSearchQueries: Found ${processedSuppliers.size} suppliers, ${articlesResult.data?.length || 0} articles`);

  return {
    suppliers: Array.from(processedSuppliers.values()),
    articles: articlesResult.data || []
  };
};
