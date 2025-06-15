
import { supabase } from '@/integrations/supabase/client';
import { isCurrentUserAdminCached } from '../optimizedDbFunctions';

export const getDistinctCitiesOptimized = async (): Promise<string[]> => {
  console.log('optimizedFilters: Fetching distinct cities from view...');

  const isAdmin = await isCurrentUserAdminCached();

  let query = supabase
    .from('suppliers_with_categories')
    .select('city')
    .not('city', 'is', null)
    .neq('city', '');

  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching distinct cities:', error.message);
    return [];
  }

  const cities = [...new Set(data.map(item => item.city).filter(Boolean))].sort();
  console.log('optimizedFilters: Distinct cities fetched successfully.');
  return cities;
};

export const getDistinctStatesOptimized = async (): Promise<string[]> => {
  console.log('optimizedFilters: Fetching distinct states from view...');

  const isAdmin = await isCurrentUserAdminCached();

  let query = supabase
    .from('suppliers_with_categories')
    .select('state')
    .not('state', 'is', null)
    .neq('state', '');

  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching distinct states:', error.message);
    return [];
  }

  const states = [...new Set(data.map(item => item.state).filter(Boolean))].sort();
  console.log('optimizedFilters: Distinct states fetched successfully.');
  return states;
};
