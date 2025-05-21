
import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SearchFilters, Review } from '@/types'; // Added Review

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
  
  // Add empty categories array since the database doesn't have this column
  const suppliersWithCategories = data?.map(supplier => ({
    ...supplier,
    categories: [] as string[]
  })) || [];
  
  return suppliersWithCategories;
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
  
  // Add empty categories array if the supplier exists
  if (data) {
    return {
      ...data,
      categories: [] as string[]
    };
  }
  
  return null;
};

// Search suppliers with filters
export const searchSuppliers = async (filters: SearchFilters): Promise<Supplier[]> => {
  console.log("supplierService: Searching suppliers with filters:", filters);
  let query = supabase.from('suppliers').select('*');

  if (filters.searchTerm) {
    // Using or for searching in name or description. Adjust based on your FTS setup or preference.
    // For basic text search, ilike is simpler. For advanced, use textSearch with a tsvector column.
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }
  if (filters.categoryId) {
    // This will need to be handled differently since categories is not directly in the suppliers table
    // We'll need to join with suppliers_categories or handle this post-query
    console.log("Category filtering will be handled post-query");
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
  
  // Add empty categories array to each supplier
  const suppliersWithCategories = data?.map(supplier => ({
    ...supplier,
    categories: [] as string[]
  })) || [];
  
  return suppliersWithCategories;
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
export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'categories'>): Promise<Supplier> => {
  console.log("supplierService: Creating a new supplier:", supplier);
  
  // Extract categories before inserting into suppliers table
  const categories = supplier.categories ? [...supplier.categories] : [];
  
  // Create a new object without the categories field for the database insert
  const supplierData = {
    code: supplier.code,
    name: supplier.name,
    description: supplier.description,
    images: supplier.images || [],
    instagram: supplier.instagram,
    whatsapp: supplier.whatsapp,
    website: supplier.website,
    min_order: supplier.min_order,
    payment_methods: supplier.payment_methods,
    requires_cnpj: supplier.requires_cnpj,
    avg_price: supplier.avg_price,
    shipping_methods: supplier.shipping_methods,
    custom_shipping_method: supplier.custom_shipping_method,
    city: supplier.city,
    state: supplier.state,
    featured: supplier.featured || false,
    hidden: supplier.hidden || false
  };

  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplierData])
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error.message);
    throw new Error(`Failed to create supplier: ${error.message}`);
  }
  
  console.log("supplierService: Supplier created successfully:", data);
  
  // Add the categories back to the return value
  const newSupplier: Supplier = {
    ...data,
    categories: categories
  };
  
  // If there are categories, associate them with the supplier
  if (categories.length > 0) {
    await associateSupplierWithCategories(newSupplier.id, categories);
  }
  
  return newSupplier;
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
export const updateSupplier = async (id: string, updates: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>): Promise<Supplier | null> => {
  console.log(`supplierService: Updating supplier with ID: ${id}`, updates);
  
  // Extract categories before updating suppliers table
  const categories = updates.categories ? [...updates.categories] : undefined;
  
  // Create a new object without the categories field for the database update
  const { categories: _, ...supplierUpdates } = updates;

  const { data, error } = await supabase
    .from('suppliers')
    .update(supplierUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating supplier with ID ${id}:`, error.message);
    throw new Error(`Failed to update supplier: ${error.message}`);
  }
  
  // If categories were provided, update the associations
  if (categories) {
    // Delete existing category associations
    await supabase
      .from('suppliers_categories')
      .delete()
      .eq('supplier_id', id);
      
    // Add new category associations
    await associateSupplierWithCategories(id, categories);
  }
  
  // Get current categories for the supplier
  const currentCategories = await getSupplierCategories(id);
  
  console.log(`supplierService: Supplier ${id} updated successfully:`, data);
  
  // Add the categories to the return value
  return {
    ...data,
    categories: categories || currentCategories
  };
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
