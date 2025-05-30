import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/types';
import { mapRawSupplierToDisplaySupplier, isValidSupplierResponse } from './mapper';
import { getSupplierCategories, associateSupplierWithCategories } from './categories';
import { getAverageRatingsForSupplierIds } from '../reviewService';

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

export const getSuppliers = async (userId?: string): Promise<Supplier[]> => {
  console.log('supplierService: Fetching suppliers with average ratings...');

  const { data, error } = await supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .order('created_at', { ascending: false });

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

  // Map suppliers with their average ratings
  const suppliersWithRatings = data.map(supplier => {
    const averageRating = averageRatings.get(supplier.id);
    const isLocked = userId ? false : false; // Determine locking logic based on userId if needed
    return mapRawSupplierToDisplaySupplier(supplier, isLocked, averageRating);
  });

  console.log('supplierService: Suppliers with ratings fetched successfully.');
  return suppliersWithRatings;
};

export const searchSuppliers = async (searchTerm: string, userId?: string): Promise<Supplier[]> => {
  console.log('supplierService: Searching suppliers with term:', searchTerm);

  const { data, error } = await supabase
    .from('suppliers')
    .select('*, categories_data:suppliers_categories(category_id)')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching suppliers:', error.message);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('supplierService: No suppliers found for search term.');
    return [];
  }

  // Get supplier IDs for rating calculation
  const supplierIds = data.map(supplier => supplier.id);
  
  // Get average ratings for all suppliers
  const averageRatings = await getAverageRatingsForSupplierIds(supplierIds);

  // Map suppliers with their average ratings
  const suppliersWithRatings = data.map(supplier => {
    const averageRating = averageRatings.get(supplier.id);
    const isLocked = userId ? false : false; // Determine locking logic based on userId if needed
    return mapRawSupplierToDisplaySupplier(supplier, isLocked, averageRating);
  });

  console.log('supplierService: Search completed successfully.');
  return suppliersWithRatings;
};

export const getSupplierById = async (id: string, isLocked: boolean = false, averageRating?: number): Promise<Supplier | null> => {
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
  return mapRawSupplierToDisplaySupplier(data, isLocked, averageRating);
};

export const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
  console.log('supplierService: Creating new supplier:', supplierData);
  
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      code: supplierData.code,
      name: supplierData.name,
      description: supplierData.description,
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
      city: supplierData.city,
      state: supplierData.state,
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
