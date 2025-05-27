import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SearchFilters, SupplierCreationPayload, SupplierUpdatePayload } from '@/types';
import { getUserTrialInfo, getAllowedSuppliersForTrial } from '@/services/trialService';
import { getAverageRatingsForSupplierIds } from '@/services/reviewService';

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
const mapRawSupplierToDisplaySupplier = (rawSupplier: any, isLocked: boolean, averageRating?: number): Supplier => {
  // The 'categories' property from rawSupplier will now be an array of objects like [{ category_id: 'uuid' }, ...]
  // due to the Supabase select query: '*, categories_data:suppliers_categories(category_id)'
  // We need to map this to an array of strings.
  const categoryIds = (rawSupplier.categories_data || []).map((cat: { category_id: string }) => cat.category_id);

  const baseSupplier: Supplier = {
    id: rawSupplier.id,
    code: rawSupplier.code,
    name: rawSupplier.name,
    description: rawSupplier.description,
    images: (rawSupplier.images || []) as string[],
    instagram: rawSupplier.instagram,
    whatsapp: rawSupplier.whatsapp,
    website: rawSupplier.website,
    min_order: rawSupplier.min_order,
    payment_methods: (rawSupplier.payment_methods || []).filter(
      (method: string) => ['pix', 'card', 'bankslip'].includes(method)
    ),
    requires_cnpj: rawSupplier.requires_cnpj ?? false,
    avg_price: (rawSupplier.avg_price || 'medium') as 'low' | 'medium' | 'high',
    shipping_methods: (rawSupplier.shipping_methods || []).filter(
      (method: string) => ['correios', 'delivery', 'transporter', 'excursion', 'air', 'custom'].includes(method)
    ),
    custom_shipping_method: rawSupplier.custom_shipping_method,
    city: rawSupplier.city,
    state: rawSupplier.state,
    categories: categoryIds, // Correctly mapped category IDs
    featured: rawSupplier.featured ?? false,
    hidden: rawSupplier.hidden ?? false,
    created_at: rawSupplier.created_at,
    updated_at: rawSupplier.updated_at,
    isLockedForTrial: isLocked,
    averageRating: averageRating, // Adicionar averageRating
  };

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
    };
  }
  return baseSupplier;
};

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

// Fetch categories for a specific supplier
export const getSupplierCategories = async (supplierId: string): Promise<string[]> => {
  console.log(`supplierService: Fetching categories for supplier ID: ${supplierId}`);
  
  const { data, error } = await supabase
    .from('suppliers_categories')
    .select('category_id')
    .eq('supplier_id', supplierId);

  if (error) {
    console.error(`Error fetching categories for supplier ${supplierId}:`, error.message);
    return []; 
  }
  
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
  
  const { categories: categoryIdsInput, ...baseSupplierData } = supplierInput;
  
  const supplierDataForTable = {
    ...baseSupplierData,
    code: supplierInput.code!, 
    name: supplierInput.name!, 
    description: supplierInput.description!,
    city: supplierInput.city!, 
    state: supplierInput.state!, 
    images: baseSupplierData.images || [],
    payment_methods: baseSupplierData.payment_methods || [], 
    requires_cnpj: baseSupplierData.requires_cnpj ?? false, 
    shipping_methods: baseSupplierData.shipping_methods || [], 
    featured: baseSupplierData.featured ?? false,
    hidden: baseSupplierData.hidden ?? false,
  };

  const { data: rawNewSupplier, error: createError } = await supabase
    .from('suppliers')
    .insert([supplierDataForTable])
    .select('*, categories_data:suppliers_categories(category_id)')
    .single();

  if (createError) {
    console.error('Error creating supplier:', createError.message, 'Details:', createError.details);
    if (createError.message.includes('duplicate key value violates unique constraint "suppliers_code_key"')) {
      throw new Error(`Failed to create supplier: Code '${String(supplierInput.code)}' already exists.`);
    }
    throw new Error(`Failed to create supplier: ${createError.message}`);
  }
  
  // After .single(), if createError is null, rawNewSupplier should be the data object.
  // Perform runtime checks to ensure rawNewSupplier is what we expect.
  if (!rawNewSupplier || typeof rawNewSupplier !== 'object') {
    console.error('Error creating supplier: No data or invalid data returned after insert, though no explicit error was thrown by Supabase client.', rawNewSupplier);
    throw new Error('Failed to create supplier: Invalid or no data returned after insert.');
  }

  // Ensure the 'id' property exists and is a non-empty string.
  // We cast to a more generic object type first to satisfy TypeScript before checking 'id'.
  const insertedSupplierObject = rawNewSupplier as { id?: unknown; [key: string]: any };

  if (typeof insertedSupplierObject.id !== 'string' || insertedSupplierObject.id.trim() === '') {
    console.error('Error creating supplier: Returned data is missing a valid "id" string property, or "id" is empty.', rawNewSupplier);
    throw new Error('Failed to create supplier: Invalid data structure returned (id missing, not a string, or empty).');
  }
  
  // Now, insertedSupplierObject.id is confirmed to be a non-empty string.
  const createdSupplierId = insertedSupplierObject.id;
  
  // If there are categories, associate them with the supplier in the join table
  if (categoryIdsInput && categoryIdsInput.length > 0) {
    await associateSupplierWithCategories(createdSupplierId, categoryIdsInput);
  }
  
  // Fetch the complete supplier data after creation and category association
  // The userId is not passed here as this is an internal fetch after creation, not subject to trial locks.
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
export const updateSupplier = async (id: string, updates: SupplierUpdatePayload, userId?: string): Promise<Supplier | null> => {
  console.log(`supplierService: Updating supplier with ID: ${id}`, updates);
  
  const { categories: newCategoryIds, ...supplierUpdatesForTable } = updates;

  // DO NOT update a 'categories' column in supplierUpdatesForTable as it doesn't exist.
  // if (newCategoryIds !== undefined) {
  //   (supplierUpdatesForTable as any).categories = newCategoryIds; // This line is removed
  // }

  if (Object.keys(supplierUpdatesForTable).length > 0) {
    const { error: updateError } = await supabase
      .from('suppliers')
      .update(supplierUpdatesForTable)
      .eq('id', id)
      .select() // select() is not strictly needed if we don't use the result, but good for consistency
      .single(); // .single() might error if the row doesn't exist, .maybeSingle() is safer or just omit select().

    if (updateError) {
      console.error(`Error updating supplier base data with ID ${id}:`, updateError.message);
      throw new Error(`Failed to update supplier base data: ${updateError.message}`);
    }
  }
  
  // If categories were provided (even an empty array, meaning clear them), update the associations in suppliers_categories
  if (newCategoryIds !== undefined) {
    await supabase
      .from('suppliers_categories')
      .delete()
      .eq('supplier_id', id);
      
    if (newCategoryIds.length > 0) {
      await associateSupplierWithCategories(id, newCategoryIds);
    }
    // The 'categories' array in the 'suppliers' table was updated in the previous step.
  }
  
  // Fetch the complete supplier data after updates, applying user-specific locking
  const finalSupplier = await getSupplierById(id, userId); 
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
