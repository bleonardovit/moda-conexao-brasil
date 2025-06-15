import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SearchFilters, SupplierCreationPayload } from '@/types';
import { mapRawSupplierToDisplaySupplier, isValidSupplierResponse } from './mapper';
import { getSupplierCategories, associateSupplierWithCategories } from './categories';
import { getAverageRatingsForSupplierIds } from '../reviewService';
import { getUserTrialInfo, getAllowedSuppliersForTrial } from '../trialService';
import { isCurrentUserAdminCached } from '../optimizedDbFunctions';

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  console.log('supplierService: Fetching suppliers...');

  // Check if current user is admin to determine if we should include hidden suppliers
  const isAdmin = await isCurrentUserAdminCached();

  let query = supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .order('created_at', { ascending: false });

  // Only filter out hidden suppliers for non-admin users
  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching suppliers:', error.message);
    return [];
  }

  console.log('supplierService: Suppliers fetched successfully.');
  return data.map(supplier => mapRawSupplierToDisplaySupplier(supplier, false));
};

export const getSuppliers = async (userId?: string): Promise<Supplier[]> => {
  console.log('supplierService: Fetching suppliers with trial logic...');

  // Check if current user is admin to determine if we should include hidden suppliers
  const isAdmin = await isCurrentUserAdminCached();

  let query = supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .order('created_at', { ascending: false });

  // Only filter out hidden suppliers for non-admin users
  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching suppliers:', error.message);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('supplierService: No suppliers found.');
    return [];
  }

  // Get supplier IDs for rating calculation
  const supplierIds = data.map(supplier => supplier.id);
  
  // Get average ratings for all suppliers
  const averageRatings = await getAverageRatingsForSupplierIds(supplierIds);

  // Check trial status if user is provided (and not admin)
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
          console.log('supplierService: User in active trial, allowed suppliers:', allowedSupplierIds);
        } else if (trialInfo.trial_status === 'expired') {
          hasExpiredTrial = true;
          console.log('supplierService: User has expired trial, blocking all suppliers');
        }
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  }

  // Map suppliers with their average ratings and trial restrictions
  const suppliersWithRatings = data.map(supplier => {
    const averageRating = averageRatings.get(supplier.id);
    
    // Determine if supplier should be locked for trial users (admins never see locked suppliers)
    let isLocked = false;
    if (userId && !isAdmin) {
      if (hasExpiredTrial) {
        // For expired trial users, lock ALL suppliers
        isLocked = true;
      } else if (isInActiveTrial) {
        // For active trial users, lock suppliers not in the allowed list
        isLocked = !allowedSupplierIds.includes(supplier.id);
      }
    }
    
    return mapRawSupplierToDisplaySupplier(supplier, isLocked, averageRating);
  });

  console.log('supplierService: Suppliers with trial restrictions fetched successfully.');
  return suppliersWithRatings;
};

export const searchSuppliers = async (filters: SearchFilters, userId?: string): Promise<Supplier[]> => {
  console.log('supplierService: Searching suppliers with filters:', filters);

  // Check if current user is admin to determine if we should include hidden suppliers
  const isAdmin = await isCurrentUserAdminCached();

  let query = supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)');

  // Only filter out hidden suppliers for non-admin users
  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  // Apply search term filter
  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,code.ilike.%${filters.searchTerm}%`);
  }

  // Apply category filter
  if (filters.categoryId) {
    query = query.eq('suppliers_categories.category_id', filters.categoryId);
  }

  // Apply state filter
  if (filters.state) {
    query = query.eq('state', filters.state);
  }

  // Apply city filter
  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  // Apply min order filters
  if (filters.minOrderMin !== undefined || filters.minOrderMax !== undefined) {
    if (filters.minOrderMin !== undefined && filters.minOrderMax !== undefined) {
      query = query.gte('min_order::integer', filters.minOrderMin).lte('min_order::integer', filters.minOrderMax);
    } else if (filters.minOrderMin !== undefined) {
      query = query.gte('min_order::integer', filters.minOrderMin);
    } else if (filters.minOrderMax !== undefined) {
      query = query.lte('min_order::integer', filters.minOrderMax);
    }
  }

  // Apply payment methods filter
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    query = query.overlaps('payment_methods', filters.paymentMethods);
  }

  // Apply CNPJ requirement filter
  if (filters.requiresCnpj !== null && filters.requiresCnpj !== undefined) {
    query = query.eq('requires_cnpj', filters.requiresCnpj);
  }

  // Apply shipping methods filter
  if (filters.shippingMethods && filters.shippingMethods.length > 0) {
    query = query.overlaps('shipping_methods', filters.shippingMethods);
  }

  // Apply website filter
  if (filters.hasWebsite !== null && filters.hasWebsite !== undefined) {
    if (filters.hasWebsite) {
      query = query.not('website', 'is', null).neq('website', '');
    } else {
      query = query.or('website.is.null,website.eq.');
    }
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error searching suppliers:', error.message);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('supplierService: No suppliers found for search filters.');
    return [];
  }

  // Get supplier IDs for rating calculation
  const supplierIds = data.map(supplier => supplier.id);
  
  // Get average ratings for all suppliers
  const averageRatings = await getAverageRatingsForSupplierIds(supplierIds);

  // Check trial status if user is provided (and not admin)
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
      console.error('Error checking trial status in search:', error);
    }
  }

  // Map suppliers with their average ratings and trial restrictions
  const suppliersWithRatings = data.map(supplier => {
    const averageRating = averageRatings.get(supplier.id);
    
    // Determine if supplier should be locked for trial users (admins never see locked suppliers)
    let isLocked = false;
    if (userId && !isAdmin) {
      if (hasExpiredTrial) {
        // For expired trial users, lock ALL suppliers
        isLocked = true;
      } else if (isInActiveTrial) {
        // For active trial users, lock suppliers not in the allowed list
        isLocked = !allowedSupplierIds.includes(supplier.id);
      }
    }
    
    return mapRawSupplierToDisplaySupplier(supplier, isLocked, averageRating);
  });

  console.log('supplierService: Search completed successfully with trial restrictions.');
  return suppliersWithRatings;
};

export const getDistinctCities = async (): Promise<string[]> => {
  console.log('supplierService: Fetching distinct cities...');

  // Check if current user is admin to determine if we should include hidden suppliers
  const isAdmin = await isCurrentUserAdminCached();

  let query = supabase
    .from('suppliers')
    .select('city')
    .not('city', 'is', null)
    .neq('city', '');

  // Only filter out hidden suppliers for non-admin users
  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching distinct cities:', error.message);
    return [];
  }

  const cities = [...new Set(data.map(item => item.city).filter(Boolean))].sort();
  console.log('supplierService: Distinct cities fetched successfully.');
  return cities;
};

export const getDistinctStates = async (): Promise<string[]> => {
  console.log('supplierService: Fetching distinct states...');

  // Check if current user is admin to determine if we should include hidden suppliers
  const isAdmin = await isCurrentUserAdminCached();

  let query = supabase
    .from('suppliers')
    .select('state')
    .not('state', 'is', null)
    .neq('state', '');

  // Only filter out hidden suppliers for non-admin users
  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching distinct states:', error.message);
    return [];
  }

  const states = [...new Set(data.map(item => item.state).filter(Boolean))].sort();
  console.log('supplierService: Distinct states fetched successfully.');
  return states;
};

export const getSupplierById = async (id: string, isLocked: boolean = false, averageRating?: number): Promise<Supplier | null> => {
  console.log(`supplierService: Fetching supplier by ID: ${id}`);

  // Check if current user is admin to determine if we should include hidden suppliers
  const isAdmin = await isCurrentUserAdminCached();

  let query = supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .eq('id', id);

  // Only filter out hidden suppliers for non-admin users
  if (!isAdmin) {
    query = query.eq('hidden', false);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error(`Error fetching supplier ${id}:`, error.message);
    return null;
  }

  if (!data) {
    console.log(`Supplier with ID ${id} not found.`);
    return null;
  }

  console.log(`supplierService: Supplier ${id} fetched successfully.`);
  return mapRawSupplierToDisplaySupplier(data, isLocked, averageRating);
};

export const createSupplier = async (supplierData: SupplierCreationPayload): Promise<Supplier> => {
  console.log('supplierService: Creating new supplier:', supplierData);
  
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      code: supplierData.code || '',
      name: supplierData.name || '',
      description: supplierData.description || '',
      images: supplierData.images || [],
      instagram: supplierData.instagram,
      whatsapp: supplierData.whatsapp,
      website: supplierData.website,
      min_order: supplierData.min_order,
      payment_methods: supplierData.payment_methods || [],
      requires_cnpj: supplierData.requires_cnpj ?? false,
      avg_price: supplierData.avg_price || 'medium',
      shipping_methods: supplierData.shipping_methods || [],
      custom_shipping_method: supplierData.custom_shipping_method,
      city: supplierData.city || '',
      state: supplierData.state || '',
      featured: supplierData.featured ?? false,
      hidden: supplierData.hidden ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error.message);
    throw new Error(`Error creating supplier: ${error.message}`);
  }

  if (!isValidSupplierResponse(data)) {
    console.error('Invalid supplier response:', data);
    throw new Error('Invalid response when creating supplier');
  }

  console.log('supplierService: Supplier created successfully:', data.id);

  // Associate with categories if provided
  if (supplierData.categories && supplierData.categories.length > 0) {
    await associateSupplierWithCategories(data.id, supplierData.categories);
  }

  return mapRawSupplierToDisplaySupplier(data, false);
};

export const updateSupplier = async (id: string, supplierData: Partial<Supplier>): Promise<Supplier> => {
  console.log('supplierService: Updating supplier:', id);
  
  const { data, error } = await supabase
    .from('suppliers')
    .update({
      code: supplierData.code,
      name: supplierData.name,
      description: supplierData.description,
      images: supplierData.images,
      instagram: supplierData.instagram,
      whatsapp: supplierData.whatsapp,
      website: supplierData.website,
      min_order: supplierData.min_order,
      payment_methods: supplierData.payment_methods,
      requires_cnpj: supplierData.requires_cnpj,
      avg_price: supplierData.avg_price,
      shipping_methods: supplierData.shipping_methods,
      custom_shipping_method: supplierData.custom_shipping_method,
      city: supplierData.city,
      state: supplierData.state,
      featured: supplierData.featured,
      hidden: supplierData.hidden,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating supplier:', error.message);
    throw new Error(`Error updating supplier: ${error.message}`);
  }

  if (!isValidSupplierResponse(data)) {
    console.error('Invalid supplier response:', data);
    throw new Error('Invalid response when updating supplier');
  }

  console.log('supplierService: Supplier updated successfully:', data.id);

  // Handle categories update
  if (supplierData.categories !== undefined) {
    // Clear existing categories
    await supabase
      .from('suppliers_categories')
      .delete()
      .eq('supplier_id', data.id);
    
    // Add new categories if any
    if (supplierData.categories.length > 0) {
      await associateSupplierWithCategories(data.id, supplierData.categories);
    }
  }

  return mapRawSupplierToDisplaySupplier(data, false);
};

export const deleteSupplier = async (id: string): Promise<void> => {
  console.log('supplierService: Deleting supplier:', id);
  
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting supplier:', error.message);
    throw new Error(`Error deleting supplier: ${error.message}`);
  }

  console.log('supplierService: Supplier deleted successfully:', id);
};

export const updateSupplierFeaturedStatus = async (id: string, featured: boolean): Promise<void> => {
  console.log(`supplierService: Updating featured status for supplier ${id} to ${featured}`);
  
  const { error } = await supabase
    .from('suppliers')
    .update({ featured: featured })
    .eq('id', id);

  if (error) {
    console.error(`Error updating featured status for supplier ${id}:`, error.message);
    throw new Error(`Error updating featured status for supplier ${id}: ${error.message}`);
  }

  console.log(`supplierService: Updated featured status for supplier ${id} to ${featured}`);
};

export const updateSupplierHiddenStatus = async (id: string, hidden: boolean): Promise<void> => {
  console.log(`supplierService: Updating hidden status for supplier ${id} to ${hidden}`);
  
  const { error } = await supabase
    .from('suppliers')
    .update({ hidden: hidden })
    .eq('id', id);

  if (error) {
    console.error(`Error updating hidden status for supplier ${id}:`, error.message);
    throw new Error(`Error updating hidden status for supplier ${id}: ${error.message}`);
  }

  console.log(`supplierService: Updated hidden status for supplier ${id} to ${hidden}`);
};
