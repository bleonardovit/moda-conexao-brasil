import { supabase } from "@/integrations/supabase/client";
import type { Supplier, Category } from '@/types';
import { SupplierFormValues } from '@/lib/validators/supplier-form';
import { checkFeatureAccess } from './featureAccessService';
import { getUserTrialInfo, getAllowedSuppliersForTrial } from './trialService';

// Get all suppliers - MODIFIED for trial
export const getSuppliers = async (userId: string | null | undefined): Promise<Supplier[]> => {
  try {
    let accessResult;
    if (userId) {
        accessResult = await checkFeatureAccess(userId, 'suppliers_list_view');
    } else {
        accessResult = await checkFeatureAccess(null, 'suppliers_list_view');
    }

    let query = supabase.from('suppliers').select('*').eq('hidden', false);

    if (userId && accessResult.access === 'limited_count' && accessResult.allowedIds && accessResult.allowedIds.length > 0) {
        query = query.in('id', accessResult.allowedIds);
    } else if (userId && accessResult.access === 'limited_count' && (!accessResult.allowedIds || accessResult.allowedIds.length === 0)) {
        const trialAllowedSupplierIds = await getAllowedSuppliersForTrial(userId);
        if (trialAllowedSupplierIds.length > 0) {
            query = query.in('id', trialAllowedSupplierIds);
        } else {
            return []; // No suppliers allowed for trial user or error fetching them
        }
    } else if (accessResult.access === 'none') {
        return []; // No access
    }
    // For 'full' or 'limited_blurred', fetch all non-hidden, frontend handles blurring/hiding.

    const { data: suppliersData, error: suppliersError } = await query;

    if (suppliersError) {
      console.error('Error fetching suppliers:', suppliersError);
      throw suppliersError;
    }
    if (!suppliersData) return [];

    // 2. Fetch all supplier-category relationships
    const { data: supplierCategoryRelations, error: relationsError } = await supabase
      .from('suppliers_categories') // Usando o nome correto da tabela de junção
      .select('supplier_id, category_id');

    if (relationsError) {
      console.error('Error fetching supplier_categories relations:', relationsError);
      // Continuar sem categorias se houver erro, ou lançar o erro dependendo da política
      // Por ora, vamos continuar e os fornecedores não terão categorias se isso falhar.
    }

    // 3. Create a map for easy lookup of categories per supplier
    const categoriesMap = new Map<string, string[]>();
    if (supplierCategoryRelations) {
      for (const relation of supplierCategoryRelations) {
        if (relation.supplier_id && relation.category_id) { // Checagem de nulidade
            const currentCategories = categoriesMap.get(relation.supplier_id) || [];
            currentCategories.push(relation.category_id);
            categoriesMap.set(relation.supplier_id, currentCategories);
        }
      }
    }

    // 4. Combine suppliers with their categories
    const suppliersWithCategories = suppliersData.map(supplier => {
      return {
        ...supplier,
        categories: categoriesMap.get(supplier.id) || [], // Garante que categories seja sempre um array
      } as Supplier; // Fazendo cast para Supplier, que espera categories: string[]
    });

    return suppliersWithCategories;
  } catch (error) {
    console.error('Error in getSuppliers:', error);
    throw error;
  }
};

// Search suppliers with filters - MODIFIED for trial
export const searchSuppliers = async (
  userId: string | null | undefined, // Added userId parameter
  filters: {
    searchTerm?: string;
    categoryId?: string;
    state?: string;
    city?: string;
    minOrderRange?: [number, number];
    paymentMethods?: string[]; // Corrected type
    requiresCnpj?: boolean | null;
    shippingMethods?: string[]; // Corrected type
    hasWebsite?: boolean | null;
  }
): Promise<Supplier[]> => {
  try {
    let accessResult;
     if (userId) {
        accessResult = await checkFeatureAccess(userId, 'suppliers_list_view');
    } else {
        accessResult = await checkFeatureAccess(null, 'suppliers_list_view');
    }

    let query = supabase.from('suppliers').select('*').eq('hidden', false);

    // Apply general filters first
    if (filters.searchTerm) {
      const searchAccess = userId ? await checkFeatureAccess(userId, 'search_bar') : await checkFeatureAccess(null, 'search_bar');
      if (searchAccess.access !== 'full') {
         console.log("Search functionality is limited/disabled for this user.");
      } else {
        query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }
    }
    
    if (filters.state && filters.state !== 'all') {
      query = query.eq('state', filters.state);
    }
    if (filters.city && filters.city !== 'all') {
      query = query.eq('city', filters.city);
    }
    if (filters.requiresCnpj !== null && filters.requiresCnpj !== undefined) {
      query = query.eq('requires_cnpj', filters.requiresCnpj);
    }
    if (filters.hasWebsite !== null && filters.hasWebsite !== undefined) {
      if (filters.hasWebsite) {
        query = query.not('website', 'is', null);
      } else {
        query = query.is('website', null);
      }
    }
    if (filters.paymentMethods && filters.paymentMethods.length > 0) { // Corrected: filters.paymentMethods
      query = query.overlaps('payment_methods', filters.paymentMethods); // Corrected: filters.paymentMethods
    }
    if (filters.shippingMethods && filters.shippingMethods.length > 0) { // Corrected: filters.shippingMethods
      query = query.overlaps('shipping_methods', filters.shippingMethods); // Corrected: filters.shippingMethods
    }


    // Apply category filter (if any)
    if (filters.categoryId && filters.categoryId !== 'all') {
      const { data: scData, error: scError } = await supabase
        .from('suppliers_categories')
        .select('supplier_id')
        .eq('category_id', filters.categoryId);

      if (scError) throw scError;
      
      if (scData && scData.length > 0) {
        const supplierIdsFromCategoryFilter = scData.map((item: { supplier_id: string }) => item.supplier_id);
        query = query.in('id', supplierIdsFromCategoryFilter);
      } else {
        return []; // No suppliers match this category
      }
    }
    
    // Apply trial limitations / access control
    if (userId && accessResult.access === 'limited_count' && accessResult.allowedIds && accessResult.allowedIds.length > 0) {
        query = query.in('id', accessResult.allowedIds);
    } else if (userId && accessResult.access === 'limited_count' && (!accessResult.allowedIds || accessResult.allowedIds.length === 0)) {
        const trialAllowedSupplierIds = await getAllowedSuppliersForTrial(userId);
        if (trialAllowedSupplierIds.length > 0) {
            query = query.in('id', trialAllowedSupplierIds);
        } else {
            return [];
        }
    } else if (accessResult.access === 'none') {
        return []; 
    }
    // For 'limited_blurred' or 'full', all matching non-hidden suppliers are fetched.

    const { data: filteredSuppliersData, error: suppliersErrorAfterFilters } = await query;

    if (suppliersErrorAfterFilters) {
      console.error('Error searching suppliers after filters:', suppliersErrorAfterFilters);
      throw suppliersErrorAfterFilters;
    }
    if (!filteredSuppliersData) return [];

    let result = await Promise.all(
      filteredSuppliersData.map(async (supplier) => {
        const categories = await getSupplierCategories(supplier.id);
        return { ...supplier, categories } as Supplier;
      })
    );

    // Client-side min_order filter (remains unchanged)
    if (filters.minOrderRange) {
      const [min, max] = filters.minOrderRange;
      result = result.filter(supplier => {
        if (!supplier.min_order) return true; 
        const minOrderValue = parseInt(supplier.min_order.replace(/\D/g, ''), 10) || 0;
        return minOrderValue >= min && minOrderValue <= max;
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in searchSuppliers:', error);
    throw error;
  }
};

// Get supplier by ID - MODIFIED for trial
export const getSupplierById = async (id: string, userId: string | null | undefined): Promise<Supplier | null> => { // Added userId parameter
  try {
    let detailsAccess;
    if(userId) {
        detailsAccess = await checkFeatureAccess(userId, 'supplier_details_view');
    } else {
        detailsAccess = await checkFeatureAccess(null, 'supplier_details_view');
    }

    if (detailsAccess.access === 'none') {
      console.log(`User ${userId ?? 'Anonymous'} does not have access to view details for supplier ${id}. Message: ${detailsAccess.message}`);
      return null; 
    }
    
    if (userId && detailsAccess.access === 'limited_count') { 
      if (detailsAccess.allowedIds && detailsAccess.allowedIds.length > 0) {
        if (!detailsAccess.allowedIds.includes(id)) {
          console.log(`User ${userId} tried to access disallowed supplier detail ${id} based on rule.`);
          return null;
        }
      } else {
        const trialInfo = await getUserTrialInfo(userId);
        if (trialInfo?.status === 'active') {
            const allowedTrialSupplierIds = await getAllowedSuppliersForTrial(userId);
            if (!allowedTrialSupplierIds.includes(id)) {
                console.log(`Trial user ${userId} attempted to view details for non-allowed supplier ${id} (not in their general trial list).`);
                return null; 
            }
        } else if (trialInfo?.status !== 'active' && trialInfo?.status !== 'converted') {
           console.log(`User ${userId} (not active trial/subscribed) denied access to supplier ${id} under limited_count rule for details.`);
           return null;
        }
      }
    }
    
    console.log(`Fetching supplier with ID: ${id}`);
    if (!id) {
      console.error('Invalid supplier ID provided');
      return null;
    }

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('hidden', false) 
      .maybeSingle();

    if (error) {
      console.error(`Error fetching supplier with ID ${id}:`, error);
      throw error;
    }
    if (!data) {
      console.log(`No non-hidden supplier found with ID: ${id}`);
      return null;
    }

    const categories = await getSupplierCategories(id);
    return { ...data, categories } as Supplier;
  } catch (error) {
    console.error(`Error in getSupplierById for ID ${id}:`, error);
    throw error;
  }
};

// Create a new supplier
export const createSupplier = async (supplier: SupplierFormValues): Promise<Supplier> => {
  try {
    // Log for debugging
    console.log("Creating supplier with data:", JSON.stringify(supplier));
    
    // Extract categories for later use
    const categories = supplier.categories || [];
    
    // Create supplier object without categories field
    const newSupplier = {
      code: supplier.code || `SUP-${Date.now()}`,
      name: supplier.name || '',
      description: supplier.description || '',
      images: supplier.images || [],
      instagram: supplier.instagram || null,
      whatsapp: supplier.whatsapp || null,
      website: supplier.website || null,
      min_order: supplier.min_order || null,
      paymentMethods: supplier.paymentMethods || [], // Corrected
      requires_cnpj: supplier.requires_cnpj || false,
      avg_price: supplier.avg_price || null,
      shippingMethods: supplier.shippingMethods || [], // Corrected
      custom_shipping_method: supplier.custom_shipping_method || null,
      city: supplier.city || '',
      state: supplier.state || '',
      featured: supplier.featured || false,
      hidden: supplier.hidden || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert the supplier in the database
    const { data, error } = await supabase
      .from('suppliers')
      .insert(newSupplier)
      .select()
      .single();

    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }

    // If no data was returned
    if (!data) {
      throw new Error('No data returned from supplier insert');
    }

    // Insert supplier categories relationships
    if (categories.length > 0) {
      await updateSupplierCategories(data.id, categories);
    }

    // Return complete supplier with categories
    return { ...data, categories } as Supplier;
  } catch (error) {
    console.error('Error in createSupplier:', error);
    throw error;
  }
};

// Update an existing supplier
export const updateSupplier = async (id: string, supplier: Partial<SupplierFormValues>): Promise<Supplier> => {
  try {
    // Log for debugging
    console.log("Updating supplier with ID:", id, "Data:", JSON.stringify(supplier));
    
    // Extract categories for later use
    const categories = supplier.categories;
    
    // Create supplier object without categories field
    const updatedSupplierData = { ...supplier };
    delete updatedSupplierData.categories; // Remove categories from the direct update payload
    
    // Map to database column names if necessary, e.g. paymentMethods to payment_methods
    const dbSupplierData: Partial<any> = { ...updatedSupplierData };
    if (updatedSupplierData.paymentMethods) {
        dbSupplierData.payment_methods = updatedSupplierData.paymentMethods;
        delete dbSupplierData.paymentMethods;
    }
    if (updatedSupplierData.shippingMethods) {
        dbSupplierData.shipping_methods = updatedSupplierData.shippingMethods;
        delete dbSupplierData.shippingMethods;
    }
    
    const updatedSupplier = {
      ...dbSupplierData,
      updated_at: new Date().toISOString(),
    };
    
    // Update the supplier in the database
    const { data, error } = await supabase
      .from('suppliers')
      .update(updatedSupplier)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }

    // Update supplier categories if provided
    if (categories !== undefined) { // Check if categories array was explicitly passed (even if empty)
      await updateSupplierCategories(id, categories || []);
    }

    // Get updated categories for this supplier
    const updatedCategories = await getSupplierCategories(id);
    return { ...data, categories: updatedCategories } as Supplier;
  } catch (error) {
    console.error('Error in updateSupplier:', error);
    throw error;
  }
};

// Delete a supplier
export const deleteSupplier = async (id: string): Promise<void> => {
  try {
    // Log for debugging
    console.log("Deleting supplier with ID:", id);
    
    // Delete supplier categories first (cascade should handle this, but just to be safe)
    await supabase
      .from('suppliers_categories')
      .delete()
      .eq('supplier_id', id);
    
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteSupplier:', error);
    throw error;
  }
};

// Toggle featured status
export const toggleSupplierFeatured = async (id: string, featured: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .update({ featured, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error toggling supplier featured status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in toggleSupplierFeatured:', error);
    throw error;
  }
};

// Toggle visibility (hidden status)
export const toggleSupplierVisibility = async (id: string, hidden: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .update({ hidden, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error toggling supplier visibility:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in toggleSupplierVisibility:', error);
    throw error;
  }
};

// Helper function to update supplier categories
export const updateSupplierCategories = async (supplierId: string, categoryIds: string[]): Promise<void> => {
  try {
    // Log for debugging
    console.log("Updating categories for supplier ID:", supplierId, "Categories:", categoryIds);
    
    // First, remove existing relations
    const { error: deleteError } = await supabase
      .from('suppliers_categories')
      .delete()
      .eq('supplier_id', supplierId);
      
    if (deleteError) {
      console.error('Error deleting supplier categories:', deleteError);
      throw deleteError;
    }
    
    // Then add new relations if there are any categories
    if (categoryIds && categoryIds.length > 0) {
      const relations = categoryIds.map(categoryId => ({
        supplier_id: supplierId,
        category_id: categoryId
      }));
      
      const { error } = await supabase
        .from('suppliers_categories')
        .insert(relations);
      
      if (error) {
        console.error('Error updating supplier categories:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in updateSupplierCategories:', error);
    throw error;
  }
};

// Get categories for a supplier
export const getSupplierCategories = async (supplierId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('suppliers_categories')
      .select('category_id')
      .eq('supplier_id', supplierId);

    if (error) {
      console.error('Error fetching supplier categories:', error);
      throw error;
    }

    return data ? data.map(item => item.category_id) : [];
  } catch (error) {
    console.error('Error in getSupplierCategories:', error);
    throw error;
  }
};
