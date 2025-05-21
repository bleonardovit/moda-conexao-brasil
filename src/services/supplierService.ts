
import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SearchFilters, Review, PaymentMethod, ShippingMethod, SupplierCreationPayload, SupplierUpdatePayload } from '@/types';

// Helper to ensure data matches Supplier type, especially for array enums
const mapRawSupplierToSupplier = (rawSupplier: any): Supplier => {
  // Make sure payment_methods and shipping_methods are of the correct type
  const validPaymentMethods = (rawSupplier.payment_methods || []).filter(
    (method: string) => ['pix', 'card', 'bankslip'].includes(method)
  ) as PaymentMethod[];
  
  const validShippingMethods = (rawSupplier.shipping_methods || []).filter(
    (method: string) => ['correios', 'delivery', 'transporter', 'excursion', 'air', 'custom'].includes(method)
  ) as ShippingMethod[];
  
  return {
    ...rawSupplier,
    payment_methods: validPaymentMethods,
    shipping_methods: validShippingMethods,
    categories: (rawSupplier.categories || []) as string[],
    images: (rawSupplier.images || []) as string[],
    // Cast to ensure type safety for Supplier object
    avg_price: (rawSupplier.avg_price || 'medium') as 'low' | 'medium' | 'high',
  } as Supplier;
};

// Fetch all suppliers, optionally filtered by user if RLS is on user_id
export const getSuppliers = async (userId?: string): Promise<Supplier[]> => {
  console.log(`supplierService: Fetching all suppliers. UserID: ${userId}`);
  let query = supabase.from('suppliers').select('*').order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching suppliers:', error.message);
    throw new Error(`Failed to fetch suppliers: ${error.message}`);
  }
  console.log("supplierService: Suppliers fetched successfully:", data?.length);
  
  return (data || []).map(mapRawSupplierToSupplier);
};

// Fetch a single supplier by ID, optionally considering userId for RLS
export const getSupplierById = async (id: string, userId?: string): Promise<Supplier | null> => {
  console.log(`supplierService: Fetching supplier by ID: ${id}. UserID: ${userId}`);
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .maybeSingle(); 

  if (error) {
    console.error(`Error fetching supplier with ID ${id}:`, error.message);
    throw new Error(`Failed to fetch supplier: ${error.message}`);
  }
  console.log(`supplierService: Supplier ${id} fetched successfully.`);
  
  return data ? mapRawSupplierToSupplier(data) : null;
};

// Search suppliers with filters
export const searchSuppliers = async (filters: SearchFilters): Promise<Supplier[]> => {
  console.log("supplierService: Searching suppliers with filters:", filters);
  let query = supabase.from('suppliers').select('*');

  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }
  
  if (filters.categoryId) {
    console.warn("Category filtering in searchSuppliers might need adjustment based on join table logic.");
  }
  
  if (filters.state) {
    query = query.eq('state', filters.state);
  }
  
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  
  // Other filter conditions remain the same
  if (filters.minOrderRange) {
    // This needs a numeric column or parsing. Assuming min_order is text.
    // console.log("Min order range filter needs specific implementation based on data type of 'min_order'");
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
    if (filters.hasWebsite) {
      query = query.not('website', 'is', null).neq('website', '');
    } else {
      query = query.or('website.is.null,website.eq.');
    }
  }
  
  query = query.eq('hidden', false);
  query = query.order('featured', { ascending: false })
               .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error searching suppliers:', error.message);
    throw new Error(`Failed to search suppliers: ${error.message}`);
  }
  console.log("supplierService: Suppliers search completed. Found:", data?.length);
  
  return (data || []).map(mapRawSupplierToSupplier);
};


// Fetch categories for a specific supplier
export const getSupplierCategories = async (supplierId: string): Promise<string[]> => {
  console.log(`supplierService: Fetching categories for supplier ID: ${supplierId}`);
  
  // Since we don't have a direct categories column in suppliers,
  // we need to query the suppliers_categories join table
  const { data, error } = await supabase
    .from('suppliers_categories')
    .select('category_id')
    .eq('supplier_id', supplierId);

  if (error) {
    console.error(`Error fetching categories for supplier ${supplierId}:`, error.message);
    return []; 
  }
  
  // Extract category IDs from the result
  const categoryIds = data?.map(row => row.category_id) || [];
  console.log(`supplierService: Categories for supplier ${supplierId} fetched:`, categoryIds);
  return categoryIds;
};

// Create a new supplier
export const createSupplier = async (supplierInput: SupplierCreationPayload): Promise<Supplier> => {
  console.log("supplierService: Creating a new supplier:", supplierInput);

  // Runtime validation for 'code'
  if (!supplierInput.code || supplierInput.code.trim() === '') {
    console.error('Error creating supplier: Code is required and cannot be empty.');
    throw new Error('Supplier code is required and cannot be empty.');
  }

  // Runtime validation for 'name'
  if (!supplierInput.name || supplierInput.name.trim() === '') {
    console.error('Error creating supplier: Name is required and cannot be empty.');
    throw new Error('Supplier name is required and cannot be empty.');
  }
  
  const { categories, ...baseSupplierData } = supplierInput;
  
  // Ensure code and name are passed correctly after validation
  const supplierDataForTable = {
    ...baseSupplierData,
    code: supplierInput.code, // Explicitly use the validated code
    name: supplierInput.name, // Explicitly use the validated name
    images: baseSupplierData.images || [],
    payment_methods: baseSupplierData.payment_methods || [],
    shipping_methods: baseSupplierData.shipping_methods || [],
    featured: baseSupplierData.featured || false,
    hidden: baseSupplierData.hidden || false,
  };

  const { data: newSupplierData, error } = await supabase
    .from('suppliers')
    .insert([supplierDataForTable])
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error.message);
    // Check if the error is due to unique constraint violation for 'code'
    if (error.message.includes('duplicate key value violates unique constraint "suppliers_code_key"')) {
      throw new Error(`Failed to create supplier: Code '${supplierInput.code}' already exists.`);
    }
    // Consider similar checks for other unique constraints if 'name' becomes one.
    throw new Error(`Failed to create supplier: ${error.message}`);
  }
  
  const createdSupplierId = newSupplierData.id;
  
  // If there are categories, associate them with the supplier
  if (categories && categories.length > 0) {
    await associateSupplierWithCategories(createdSupplierId, categories);
  }
  
  // Fetch the complete supplier data, including any DB defaults and the potentially updated categories
  const finalSupplier = await getSupplierById(createdSupplierId);
  if (!finalSupplier) {
    // This case should ideally not happen if creation was successful
    console.error('Critical error: Failed to retrieve supplier immediately after creation.');
    throw new Error('Failed to retrieve supplier after creation.');
  }
  console.log("supplierService: Supplier created successfully:", finalSupplier);
  return finalSupplier;
};

// Helper function to associate supplier with categories
const associateSupplierWithCategories = async (supplierId: string, categoryIds: string[]): Promise<void> => {
  console.log(`supplierService: Associating supplier ${supplierId} with categories:`, categoryIds);
  
  // Create array of category associations
  const categoryAssociations = categoryIds.map(categoryId => ({
    supplier_id: supplierId,
    category_id: categoryId
  }));
  
  // Insert into the join table
  const { error } = await supabase
    .from('suppliers_categories')
    .insert(categoryAssociations);
    
  if (error) {
    console.error('Error associating supplier with categories:', error.message);
    // We don't throw here to prevent failing the main supplier creation/update
    // But we log it for debugging purposes
  }
};

// Update an existing supplier
export const updateSupplier = async (id: string, updates: SupplierUpdatePayload): Promise<Supplier | null> => {
  console.log(`supplierService: Updating supplier with ID: ${id}`, updates);
  
  const { categories, ...supplierUpdatesForTable } = updates;

  if (Object.keys(supplierUpdatesForTable).length > 0) {
    const { data: updatedDataBase, error } = await supabase
      .from('suppliers')
      .update(supplierUpdatesForTable)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating supplier base data with ID ${id}:`, error.message);
      throw new Error(`Failed to update supplier base data: ${error.message}`);
    }
  }
  
  // If categories were provided (even an empty array, meaning clear them), update the associations
  if (categories !== undefined) {
    await supabase
      .from('suppliers_categories')
      .delete()
      .eq('supplier_id', id);
      
    if (categories.length > 0) {
      await associateSupplierWithCategories(id, categories);
    }
  }
  
  // Fetch the complete supplier data after updates
  const finalSupplier = await getSupplierById(id);
  if (!finalSupplier) {
    console.error(`Failed to retrieve supplier ${id} after update.`);
    return null; 
  }

  console.log(`supplierService: Supplier ${id} updated successfully:`, finalSupplier);
  return finalSupplier;
};

// Delete a supplier
export const deleteSupplier = async (id: string): Promise<boolean> => {
  console.log(`supplierService: Deleting supplier with ID: ${id}`);
  
  // First delete category associations
  await supabase
    .from('suppliers_categories')
    .delete()
    .eq('supplier_id', id);
    
  // Then delete the supplier
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

// Toggle supplier featured status
export const toggleSupplierFeatured = async (id: string, featured: boolean): Promise<void> => {
  console.log(`supplierService: Toggling featured status of supplier ${id} to ${featured}`);
  
  const { error } = await supabase
    .from('suppliers')
    .update({ featured })
    .eq('id', id);
    
  if (error) {
    console.error(`Error toggling featured status for supplier ${id}:`, error.message);
    throw new Error(`Failed to update featured status: ${error.message}`);
  }
  
  console.log(`supplierService: Featured status for supplier ${id} updated successfully.`);
};

// Toggle supplier visibility
export const toggleSupplierVisibility = async (id: string, hidden: boolean): Promise<void> => {
  console.log(`supplierService: Toggling visibility of supplier ${id} to hidden=${hidden}`);
  
  const { error } = await supabase
    .from('suppliers')
    .update({ hidden })
    .eq('id', id);
    
  if (error) {
    console.error(`Error toggling visibility for supplier ${id}:`, error.message);
    throw new Error(`Failed to update visibility: ${error.message}`);
  }
  
  console.log(`supplierService: Visibility for supplier ${id} updated successfully.`);
};
