import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SearchFilters } from '@/types'; // Added SearchFilters

// Fetch all suppliers, optionally filtered by user if RLS is on user_id
export const getSuppliers = async (userId?: string): Promise<Supplier[]> => {
  console.log(`supplierService: Fetching all suppliers. UserID: ${userId}`);
  let query = supabase.from('suppliers').select('*').order('created_at', { ascending: false });

  // If your RLS for suppliers depends on a user_id column or similar,
  // and you want to fetch all for admin or specific for user, handle logic here.
  // For now, this fetches all suppliers and relies on RLS to filter if userId is implicitly used by Supabase.
  // If userId is explicitly needed for a join or filter:
  // if (userId) {
  //   query = query.eq('user_id_column', userId); // Example
  // }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching suppliers:', error.message);
    throw new Error(`Failed to fetch suppliers: ${error.message}`);
  }
  console.log("supplierService: Suppliers fetched successfully:", data?.length);
  return data || [];
};

// Fetch a single supplier by ID, optionally considering userId for RLS
export const getSupplierById = async (id: string, userId?: string): Promise<Supplier | null> => {
  console.log(`supplierService: Fetching supplier by ID: ${id}. UserID: ${userId}`);
  // RLS should handle visibility based on the authenticated user (userId is implicitly used by Supabase policies)
  // If you need to explicitly use userId in the query for some reason (e.g. a join on a user-specific table related to suppliers),
  // you would modify the query here.
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .maybeSingle(); // Use maybeSingle to return null if not found, instead of an empty array

  if (error) {
    console.error(`Error fetching supplier with ID ${id}:`, error.message);
    throw new Error(`Failed to fetch supplier: ${error.message}`);
  }
  console.log(`supplierService: Supplier ${id} fetched successfully.`);
  return data;
};

// Search suppliers with filters
export const searchSuppliers = async (filters: SearchFilters, userId?: string): Promise<Supplier[]> => {
  console.log("supplierService: Searching suppliers with filters:", filters, "UserID:", userId);
  let query = supabase.from('suppliers').select('*');

  if (filters.searchTerm) {
    // Using or for searching in name or description. Adjust based on your FTS setup or preference.
    // For basic text search, ilike is simpler. For advanced, use textSearch with a tsvector column.
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }
  if (filters.categoryId) {
    query = query.contains('categories', [filters.categoryId]);
  }
  if (filters.state) {
    query = query.eq('state', filters.state);
  }
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  if (filters.minOrderRange) {
    // Assuming min_order is stored as a number or text that can be cast.
    // This is a simplified example; actual min_order filtering can be complex.
    // query = query.gte('min_order_numeric', filters.minOrderRange[0]); 
    // query = query.lte('min_order_numeric', filters.minOrderRange[1]);
    // For text `min_order` like "R$ 100,00", you'd need to parse and compare, or store numerically.
    // Placeholder: console.log("Min order range filter needs specific implementation based on data type of 'min_order'");
  }
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    query = query.overlaps('payment_methods', filters.paymentMethods);
  }
  if (filters.requiresCnpj !== null && filters.requiresCnpj !== undefined) {
    query = query.eq('requires_cnpj', filters.requiresCnpj);
  }
  if (filters.shippingMethods && filters.shippingMethods.length > 0) {
    query = query.overlaps('shipping_methods', filters.shippingMethods);
  }
  if (filters.hasWebsite !== null && filters.hasWebsite !== undefined) {
    // This assumes 'website' column is populated or NULL.
    // If 'true', check for non-empty website. If 'false', check for NULL or empty.
    if (filters.hasWebsite) {
      query = query.not('website', 'is', null).neq('website', '');
    } else {
      query = query.or('website.is.null,website.eq.'); // website is null OR website is empty string
    }
  }
  
  // Always filter out hidden suppliers for general search
  query = query.eq('hidden', false);

  query = query.order('featured', { ascending: false })
               .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error searching suppliers:', error.message);
    throw new Error(`Failed to search suppliers: ${error.message}`);
  }
  console.log("supplierService: Suppliers search completed. Found:", data?.length);
  return data || [];
};


// Fetch categories for a specific supplier
export const getSupplierCategories = async (supplierId: string): Promise<string[]> => {
  console.log(`supplierService: Fetching categories for supplier ID: ${supplierId}`);
  const { data, error } = await supabase
    .from('suppliers')
    .select('categories')
    .eq('id', supplierId)
    .single();

  if (error) {
    console.error(`Error fetching categories for supplier ${supplierId}:`, error.message);
    // Consider if this should throw or return empty array on error/not found
    return []; 
  }
  console.log(`supplierService: Categories for supplier ${supplierId} fetched:`, data?.categories);
  return data?.categories || [];
};

// Create a new supplier
export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
  console.log("supplierService: Creating a new supplier:", supplier);
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplier])
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error.message);
    throw new Error(`Failed to create supplier: ${error.message}`);
  }
  console.log("supplierService: Supplier created successfully:", data);
  return data;
};

// Update an existing supplier
export const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<Supplier | null> => {
  console.log(`supplierService: Updating supplier with ID: ${id}`, updates);
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating supplier with ID ${id}:`, error.message);
    throw new Error(`Failed to update supplier: ${error.message}`);
  }
  console.log(`supplierService: Supplier ${id} updated successfully:`, data);
  return data;
};

// Delete a supplier
export const deleteSupplier = async (id: string): Promise<boolean> => {
  console.log(`supplierService: Deleting supplier with ID: ${id}`);
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting supplier with ID ${id}:`, error.message);
    throw new Error(`Failed to delete supplier: ${error.message}`);
  }
  console.log(`supplierService: Supplier ${id} deleted successfully.`);
  return true;
};
