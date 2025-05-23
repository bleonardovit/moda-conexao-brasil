import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SearchFilters, SupplierCreationPayload, SupplierUpdatePayload, PaymentMethod, ShippingMethod } from '@/types';
// Importar serviços e tipos de trial
import { getUserTrialInfo, getAllowedSuppliersForTrial } from '@/services/trialService';

// Placeholders para dados genéricos de fornecedores bloqueados em trial
const LOCKED_SUPPLIER_PLACEHOLDERS = {
  name: "Fornecedor Bloqueado",
  description: "Detalhes disponíveis apenas para assinantes.",
  city: "Localização",
  state: "Protegida",
  instagram: undefined,
  whatsapp: undefined,
  website: undefined,
  min_order: "-",
  // Manter outros campos como images (para layout), code (identificador), categories (para layout) etc.
  // avg_price pode ser genérico ou omitido
};

// Helper to map raw supplier data and sanitize if locked for trial
const mapRawSupplierToDisplaySupplier = (rawSupplier: any, isLocked: boolean): Supplier => {
  const baseSupplier = {
    ...rawSupplier,
    payment_methods: (rawSupplier.payment_methods || []).filter(
      (method: string) => ['pix', 'card', 'bankslip'].includes(method)
    ),
    shipping_methods: (rawSupplier.shipping_methods || []).filter(
      (method: string) => ['correios', 'delivery', 'transporter', 'excursion', 'air', 'custom'].includes(method)
    ),
    categories: (rawSupplier.categories || []) as string[],
    images: (rawSupplier.images || []) as string[],
    avg_price: (rawSupplier.avg_price || 'medium') as 'low' | 'medium' | 'high',
    isLockedForTrial: isLocked,
  } as Supplier;

  if (isLocked) {
    return {
      ...baseSupplier,
      name: LOCKED_SUPPLIER_PLACEHOLDERS.name,
      description: LOCKED_SUPPLIER_PLACEHOLDERS.description,
      city: LOCKED_SUPPLIER_PLACEHOLDERS.city,
      state: LOCKED_SUPPLIER_PLACEHOLDERS.state,
      instagram: LOCKED_SUPPLIER_PLACEHOLDERS.instagram,
      whatsapp: LOCKED_SUPPLIER_PLACEHOLDERS.whatsapp,
      website: LOCKED_SUPPLIER_PLACEHOLDERS.website,
      min_order: LOCKED_SUPPLIER_PLACEHOLDERS.min_order,
      // Campos que não devem ser expostos podem ser definidos como undefined ou com valores genéricos
      // Ex:
      // requires_cnpj: false, // Ou manter o original se não for sensível
      // payment_methods: [],
      // shipping_methods: [],
      // avg_price: 'medium', // Um valor genérico
    };
  }
  return baseSupplier;
};

// Fetch all suppliers, optionally filtered by user if RLS is on user_id
// Data will be sanitized if user is in trial and supplier is not allowed
export const getSuppliers = async (userId?: string): Promise<Supplier[]> => {
  console.log(`supplierService: Fetching all suppliers. UserID: ${userId}`);
  let query = supabase.from('suppliers').select('*').order('created_at', { ascending: false });

  const { data: rawSuppliers, error } = await query;

  if (error) {
    console.error('Error fetching suppliers:', error.message);
    throw new Error(`Failed to fetch suppliers: ${error.message}`);
  }
  console.log("supplierService: Raw suppliers fetched successfully:", rawSuppliers?.length);

  let allowedSupplierIdsForTrial: string[] = [];
  let isInActiveTrial = false;

  if (userId) {
    const trialInfo = await getUserTrialInfo(userId);
    if (trialInfo && trialInfo.trial_status === 'active') {
      isInActiveTrial = true;
      allowedSupplierIdsForTrial = await getAllowedSuppliersForTrial(userId);
    }
  }

  return (rawSuppliers || []).map(rawSupplier => {
    const isLocked = isInActiveTrial && !allowedSupplierIdsForTrial.includes(rawSupplier.id);
    return mapRawSupplierToDisplaySupplier(rawSupplier, isLocked);
  });
};

// Fetch a single supplier by ID, optionally considering userId for RLS
// Data will be sanitized if user is in trial and supplier is not allowed
export const getSupplierById = async (id: string, userId?: string): Promise<Supplier | null> => {
  console.log(`supplierService: Fetching supplier by ID: ${id}. UserID: ${userId}`);
  const { data: rawSupplier, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .maybeSingle(); 

  if (error) {
    console.error(`Error fetching supplier with ID ${id}:`, error.message);
    throw new Error(`Failed to fetch supplier: ${error.message}`);
  }
  
  if (!rawSupplier) {
    return null;
  }

  let isLocked = false;
  if (userId) {
    const trialInfo = await getUserTrialInfo(userId);
    if (trialInfo && trialInfo.trial_status === 'active') {
      const allowedSupplierIdsForTrial = await getAllowedSuppliersForTrial(userId);
      if (!allowedSupplierIdsForTrial.includes(rawSupplier.id)) {
        isLocked = true;
      }
    }
  }
  console.log(`supplierService: Supplier ${id} fetched. Is locked for trial: ${isLocked}`);
  return mapRawSupplierToDisplaySupplier(rawSupplier, isLocked);
};

// Search suppliers with filters
export const searchSuppliers = async (filters: SearchFilters, userId?: string): Promise<Supplier[]> => {
  console.log("supplierService: Searching suppliers with filters:", filters, "UserId:", userId);
  let query = supabase.from('suppliers').select('*');

  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }
  
  if (filters.categoryId && filters.categoryId !== 'all') {
    query = query.contains('categories', [filters.categoryId]);
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

  // Min Order Amount Filters
  const minOrderColumnExpression = `NULLIF(regexp_replace(min_order, '[^0-9]', '', 'g'), '')::numeric`;

  if (filters.minOrderMin !== undefined && filters.minOrderMin !== null && filters.minOrderMin !== '') {
    try {
        query = query.filter(minOrderColumnExpression, 'gte', filters.minOrderMin);
    } catch (e) {
        console.warn("Could not apply minOrderMin due to potential non-numeric min_order values or filter error", e);
    }
  }
  if (filters.minOrderMax !== undefined && filters.minOrderMax !== null && filters.minOrderMax !== '') {
     try {
        query = query.filter(minOrderColumnExpression, 'lte', filters.minOrderMax);
    } catch (e) {
        console.warn("Could not apply minOrderMax due to potential non-numeric min_order values or filter error", e);
    }
  }
  
  query = query.eq('hidden', false);
  query = query.order('featured', { ascending: false })
               .order('created_at', { ascending: false });

  const { data: rawSuppliers, error } = await query;

  if (error) {
    console.error('Error searching suppliers:', error.message);
    throw new Error(`Failed to search suppliers: ${error.message}`);
  }
  console.log("supplierService: Suppliers search completed. Raw found:", rawSuppliers?.length);
  
  let allowedSupplierIdsForTrial: string[] = [];
  let isInActiveTrial = false;

  if (userId) {
    const trialInfo = await getUserTrialInfo(userId);
    if (trialInfo && trialInfo.trial_status === 'active') {
      isInActiveTrial = true;
      allowedSupplierIdsForTrial = await getAllowedSuppliersForTrial(userId);
    }
  }

  return (rawSuppliers || []).map(rawSupplier => {
    const isLocked = isInActiveTrial && !allowedSupplierIdsForTrial.includes(rawSupplier.id);
    return mapRawSupplierToDisplaySupplier(rawSupplier, isLocked);
  });
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

  // Runtime validation for 'description'
  if (!supplierInput.description || supplierInput.description.trim() === '') {
    console.error('Error creating supplier: Description is required and cannot be empty.');
    throw new Error('Supplier description is required and cannot be empty.');
  }

  // Runtime validation for 'city'
  if (!supplierInput.city || supplierInput.city.trim() === '') {
    console.error('Error creating supplier: City is required and cannot be empty.');
    throw new Error('Supplier city is required and cannot be empty.');
  }

  // Runtime validation for 'state'
  if (!supplierInput.state || supplierInput.state.trim() === '') {
    console.error('Error creating supplier: State is required and cannot be empty.');
    throw new Error('Supplier state is required and cannot be empty.');
  }
  
  const { categories, ...baseSupplierData } = supplierInput;
  
  // Ensure required fields are passed correctly after validation
  const supplierDataForTable = {
    ...baseSupplierData,
    code: supplierInput.code, 
    name: supplierInput.name, 
    description: supplierInput.description,
    city: supplierInput.city, // Explicitly use the validated city
    state: supplierInput.state, // Explicitly use the validated state
    images: baseSupplierData.images || [],
    payment_methods: baseSupplierData.payment_methods || [], 
    requires_cnpj: baseSupplierData.requires_cnpj ?? false, 
    shipping_methods: baseSupplierData.shipping_methods || [], 
    featured: baseSupplierData.featured || false,
    hidden: baseSupplierData.hidden || false,
    // avg_price will be included from baseSupplierData if present, otherwise DB default or it's nullable
    // custom_shipping_method will be included from baseSupplierData if present
  };

  const { data: newSupplierData, error } = await supabase
    .from('suppliers')
    .insert([supplierDataForTable])
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error.message);
    if (error.message.includes('duplicate key value violates unique constraint "suppliers_code_key"')) {
      throw new Error(`Failed to create supplier: Code '${supplierInput.code}' already exists.`);
    }
    throw new Error(`Failed to create supplier: ${error.message}`);
  }
  
  const createdSupplierId = newSupplierData.id;
  
  // If there are categories, associate them with the supplier
  if (supplierInput.categories && supplierInput.categories.length > 0) {
    await associateSupplierWithCategories(createdSupplierId, supplierInput.categories);
  }
  
  const finalSupplier = await getSupplierById(createdSupplierId);
  if (!finalSupplier) {
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

// Helper function to get distinct states from suppliers
export const getDistinctStates = async (): Promise<string[]> => {
  // Removed RPC call as 'get_distinct_supplier_states' SQL function does not exist.
  // Relying on direct query fallback.
  const { data: allSuppliers, error: supplierError } = await supabase.from('suppliers').select('state');
  if (supplierError) {
    console.error('Error fetching distinct states from suppliers table:', supplierError);
    return [];
  }
  if (!allSuppliers) return [];
  const states = new Set(allSuppliers.map(s => s.state).filter(Boolean) as string[]); // Ensure state is string and filter out null/empty
  return Array.from(states).sort();
};

// Helper function to get distinct cities from suppliers
export const getDistinctCities = async (state?: string): Promise<string[]> => {
  let query = supabase.from('suppliers').select('city').neq('city', ''); // city is type text
  if (state && state !== 'all') {
    query = query.eq('state', state);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching distinct cities:', error);
    return [];
  }
  if (!data) return []; // Handle case where data is null/undefined but no error

  const cityValues = data
    .map(s => s.city) // s.city is string | null based on schema, or just string if not nullable
    .filter((city): city is string => typeof city === 'string' && city.trim() !== ''); // Ensure it's a non-empty string

  return Array.from(new Set(cityValues)).sort();
};

// REMOVED THE PROTOTYPE EXTENSIONS for gte_sql and lte_sql as they were causing the runtime error.
// The searchSuppliers function now uses query.filter() for min_order comparison.
