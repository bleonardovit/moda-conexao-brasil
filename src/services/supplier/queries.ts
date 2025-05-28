
import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SearchFilters } from '@/types';
import { getUserTrialInfo, getAllowedSuppliersForTrial } from '@/services/trialService';
import { getAverageRatingsForSupplierIds } from '@/services/reviewService';
import { mapRawSupplierToDisplaySupplier } from './mapper';

// Fetch all suppliers, optionally filtered by user if RLS is on user_id
// Data will be sanitized if user is in trial and supplier is not allowed
export const getSuppliers = async (userId?: string): Promise<Supplier[]> => {
  console.log(`supplierService: Fetching all suppliers. UserID: ${userId}`);
  // Fetch categories along with supplier data
  let query = supabase.from('suppliers').select('*, categories_data:suppliers_categories(category_id)').order('created_at', { ascending: false });

  const { data: rawSuppliers, error } = await query;

  if (error) {
    console.error('Error fetching suppliers:', error.message);
    throw new Error(`Failed to fetch suppliers: ${error.message}`);
  }
  console.log("supplierService: Raw suppliers fetched successfully:", rawSuppliers?.length);

  if (!rawSuppliers || rawSuppliers.length === 0) return [];

  const supplierIds = rawSuppliers.map(s => s.id);
  const averageRatingsMap = await getAverageRatingsForSupplierIds(supplierIds);

  const processSuppliers = async () => {
    return Promise.all((rawSuppliers).map(async rawSupplier => {
      let isLocked = false;
      if (userId) { // Apply trial logic only if userId is present
        const trialInfo = await getUserTrialInfo(userId);
        if (trialInfo) {
          if (trialInfo.trial_status === 'expired') {
            isLocked = true;
          } else if (trialInfo.trial_status === 'active') {
            const allowedSupplierIdsForTrial = await getAllowedSuppliersForTrial(userId);
            isLocked = !allowedSupplierIdsForTrial.includes(rawSupplier.id);
          }
        }
      }
      return mapRawSupplierToDisplaySupplier(rawSupplier, isLocked, averageRatingsMap.get(rawSupplier.id));
    }));
  };
  
  return processSuppliers();
};

// Fetch a single supplier by ID, optionally considering userId for RLS
// Data will be sanitized if user is in trial and supplier is not allowed
export const getSupplierById = async (id: string, userId?: string): Promise<Supplier | null> => {
  console.log(`supplierService: Fetching supplier by ID: ${id}. UserID: ${userId}`);
  // Fetch categories along with supplier data
  const { data: rawSupplier, error } = await supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .eq('id', id)
    .maybeSingle(); 

  if (error) {
    console.error(`Error fetching supplier with ID ${id}:`, error.message);
    throw new Error(`Failed to fetch supplier: ${error.message}`);
  }
  
  if (!rawSupplier) {
    return null;
  }

  const averageRatingsMap = await getAverageRatingsForSupplierIds([id]);
  const averageRating = averageRatingsMap.get(id);

  let isLocked = false;
  if (userId) { // Apply trial logic only if userId is present
    const trialInfo = await getUserTrialInfo(userId);
    if (trialInfo) {
      if (trialInfo.trial_status === 'expired') {
        isLocked = true;
      } else if (trialInfo.trial_status === 'active') {
        const allowedSupplierIdsForTrial = await getAllowedSuppliersForTrial(userId);
        isLocked = !allowedSupplierIdsForTrial.includes(rawSupplier.id);
      }
    }
  }
  console.log(`supplierService: Supplier ${id} fetched. Is locked: ${isLocked} for user ${userId} with trial_status ${userId ? (await getUserTrialInfo(userId))?.trial_status : 'N/A'}`);
  return mapRawSupplierToDisplaySupplier(rawSupplier, isLocked, averageRating);
};

// Search suppliers with filters
export const searchSuppliers = async (filters: SearchFilters, userId?: string): Promise<Supplier[]> => {
  console.log("supplierService: Searching suppliers with filters:", filters, "UserId:", userId);
  
  let selectString = '*, categories_data:suppliers_categories(category_id)';
  // If filtering by category, we need an inner join to ensure the category exists for the supplier.
  // And the filter will be applied on the joined data.
  if (filters.categoryId && filters.categoryId !== 'all') {
    selectString = '*, categories_data:suppliers_categories!inner(category_id)';
  }
  
  let query = supabase.from('suppliers').select(selectString);

  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }
  
  if (filters.categoryId && filters.categoryId !== 'all') {
    // Filter on the joined 'suppliers_categories' data.
    // The alias 'categories_data' is for the selected data, the filter applies to the source.
    query = query.eq('categories_data.category_id', filters.categoryId);
  }
  
  if (filters.state && filters.state !== 'all') {
    query = query.eq('state', filters.state);
  }
  
  if (filters.city && filters.city.trim() !== '') {
    query = query.ilike('city', `%${filters.city.trim()}%`);
  }
  
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    query = query.overlaps('payment_methods', filters.paymentMethods as string[]);
  }

  if (filters.requiresCnpj !== null && filters.requiresCnpj !== undefined) {
    query = query.eq('requires_cnpj', filters.requiresCnpj);
  }

  if (filters.shippingMethods && filters.shippingMethods.length > 0) {
    query = query.overlaps('shipping_methods', filters.shippingMethods as string[]);
  }

  if (filters.hasWebsite !== null && filters.hasWebsite !== undefined) {
    if (filters.hasWebsite) {
      query = query.not('website', 'is', null).neq('website', '');
    } else {
      query = query.or('website.is.null,website.eq.');
    }
  }

  const minOrderColumnExpression = `NULLIF(regexp_replace(min_order, '[^0-9.,]', '', 'g'), '')::numeric`;

  if (filters.minOrderMin !== undefined && filters.minOrderMin !== null) {
    try {
        query = query.filter(minOrderColumnExpression, 'gte', filters.minOrderMin);
    } catch (e) {
        console.warn("Could not apply minOrderMin due to potential non-numeric min_order values or filter error", e);
    }
  }
  if (filters.minOrderMax !== undefined && filters.minOrderMax !== null) {
     try {
        query = query.filter(minOrderColumnExpression, 'lte', filters.minOrderMax);
    } catch (e) {
        console.warn("Could not apply minOrderMax due to potential non-numeric min_order values or filter error", e);
    }
  }
  
  query = query.eq('hidden', false); // Ensure only non-hidden suppliers are fetched
  query = query.order('featured', { ascending: false }) // Prioritize featured suppliers
               .order('created_at', { ascending: false }); // Then by creation date

  const { data: rawSuppliers, error } = await query;

  if (error) {
    console.error('Error searching suppliers:', error.message);
    throw new Error(`Failed to search suppliers: ${error.message}`);
  }
  console.log("supplierService: Suppliers search completed. Raw found:", rawSuppliers?.length);
  
  if (!rawSuppliers || rawSuppliers.length === 0) return [];

  const supplierIds = rawSuppliers.map(s => s.id);
  const averageRatingsMap = await getAverageRatingsForSupplierIds(supplierIds);

  const processSuppliers = async () => {
    return Promise.all((rawSuppliers).map(async rawSupplier => {
      let isLocked = false;
      if (userId) { // Apply trial logic only if userId is present
        const trialInfo = await getUserTrialInfo(userId);
        if (trialInfo) {
          if (trialInfo.trial_status === 'expired') {
            isLocked = true;
          } else if (trialInfo.trial_status === 'active') {
            const allowedSupplierIdsForTrial = await getAllowedSuppliersForTrial(userId);
            isLocked = !allowedSupplierIdsForTrial.includes(rawSupplier.id);
          }
        }
      }
      return mapRawSupplierToDisplaySupplier(rawSupplier, isLocked, averageRatingsMap.get(rawSupplier.id));
    }));
  };

  return processSuppliers();
};

// Helper function to get distinct states from suppliers
export const getDistinctStates = async (): Promise<string[]> => {
  const { data: allSuppliers, error: supplierError } = await supabase.from('suppliers').select('state');
  if (supplierError) {
    console.error('Error fetching distinct states from suppliers table:', supplierError);
    return [];
  }
  if (!allSuppliers) return [];
  const states = new Set(allSuppliers.map(s => s.state).filter(Boolean) as string[]);
  return Array.from(states).sort();
};

// Helper function to get distinct cities from suppliers
export const getDistinctCities = async (state?: string): Promise<string[]> => {
  let query = supabase.from('suppliers').select('city').neq('city', ''); 
  if (state && state !== 'all') {
    query = query.eq('state', state);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching distinct cities:', error);
    return [];
  }
  if (!data) return []; 

  const cityValues = data
    .map(s => s.city) 
    .filter((city): city is string => typeof city === 'string' && city.trim() !== ''); 

  return Array.from(new Set(cityValues)).sort();
};
