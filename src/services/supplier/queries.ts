
import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SearchFilters } from '@/types';
import { mapRawSupplierToDisplaySupplier, isValidSupplierResponse } from './mapper';
import { getSupplierCategories, associateSupplierWithCategories } from './categories';

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  console.log('supplierService: Fetching suppliers...');

  const { data, error } = await supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suppliers:', error.message);
    return [];
  }

  console.log('supplierService: Suppliers fetched successfully.');
  return data.map(supplier => mapRawSupplierToDisplaySupplier(supplier, false));
};

// Alias for backward compatibility
export const getSuppliers = async (userId?: string): Promise<Supplier[]> => {
  console.log('supplierService: Fetching suppliers with user context...');

  const { data, error } = await supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suppliers:', error.message);
    return [];
  }

  console.log('supplierService: Suppliers fetched successfully.');
  
  // Apply trial locking logic if needed
  // For now, we'll return all suppliers without locking
  return data.map(supplier => mapRawSupplierToDisplaySupplier(supplier, false));
};

export const searchSuppliers = async (filters: SearchFilters): Promise<Supplier[]> => {
  console.log('supplierService: Searching suppliers with filters:', filters);

  let query = supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .eq('hidden', false);

  // Apply search term filter
  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,code.ilike.%${filters.searchTerm}%`);
  }

  // Apply category filter
  if (filters.categoryId && filters.categoryId !== 'all') {
    // Get supplier IDs that match the category first
    const { data: categoryMatches } = await supabase
      .from('suppliers_categories')
      .select('supplier_id')
      .eq('category_id', filters.categoryId);

    if (categoryMatches && categoryMatches.length > 0) {
      const supplierIds = categoryMatches.map(item => item.supplier_id);
      query = query.in('id', supplierIds);
    } else {
      // No suppliers match this category, return empty
      return [];
    }
  }

  // Apply state filter
  if (filters.state) {
    query = query.eq('state', filters.state);
  }

  // Apply city filter
  if (filters.city) {
    query = query.eq('city', filters.city);
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
      query = query.not('website', 'is', null);
    } else {
      query = query.is('website', null);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching suppliers:', error.message);
    return [];
  }

  console.log('supplierService: Suppliers search completed.');
  return data.map(supplier => mapRawSupplierToDisplaySupplier(supplier, false));
};

export const getDistinctStates = async (): Promise<string[]> => {
  console.log('supplierService: Fetching distinct states...');

  const { data, error } = await supabase
    .from('suppliers')
    .select('state')
    .eq('hidden', false)
    .not('state', 'is', null);

  if (error) {
    console.error('Error fetching distinct states:', error.message);
    return [];
  }

  const uniqueStates = Array.from(new Set(data.map(item => item.state))).filter(Boolean);
  console.log('supplierService: Distinct states fetched:', uniqueStates);
  return uniqueStates;
};

export const getDistinctCities = async (): Promise<string[]> => {
  console.log('supplierService: Fetching distinct cities...');

  const { data, error } = await supabase
    .from('suppliers')
    .select('city')
    .eq('hidden', false)
    .not('city', 'is', null);

  if (error) {
    console.error('Error fetching distinct cities:', error.message);
    return [];
  }

  const uniqueCities = Array.from(new Set(data.map(item => item.city))).filter(Boolean);
  console.log('supplierService: Distinct cities fetched:', uniqueCities);
  return uniqueCities;
};

export const getSupplierById = async (id: string, userId?: string, averageRating?: number): Promise<Supplier | null> => {
  console.log(`supplierService: Fetching supplier by ID: ${id}`);

  const { data, error } = await supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching supplier ${id}:`, error.message);
    return null;
  }

  if (!data) {
    console.log(`Supplier with ID ${id} not found.`);
    return null;
  }

  console.log(`supplierService: Supplier ${id} fetched successfully.`);
  
  // Apply trial locking if needed based on userId
  const isLocked = false; // For now, we'll not apply locking
  
  return mapRawSupplierToDisplaySupplier(data, isLocked, averageRating);
};
