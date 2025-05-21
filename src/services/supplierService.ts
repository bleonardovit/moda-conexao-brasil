import { supabase } from "@/integrations/supabase/client";
import type { Supplier, Category } from '@/types';
import { SupplierFormValues } from '@/lib/validators/supplier-form';
import { checkFeatureAccess } from './featureAccessService';
import { getUserTrialInfo, getAllowedSuppliersForTrial } from './trialService';
import { getUserProfileForAccessCheck } from './featureAccessService';

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
    paymentMethods?: string[]; // Assuming SupplierFormValues uses this, but DB uses payment_methods
    requiresCnpj?: boolean | null;
    shippingMethods?: string[]; // Assuming SupplierFormValues uses this, but DB uses shipping_methods
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
    // Assuming filters.paymentMethods contains the values for 'payment_methods' column
    if (filters.paymentMethods && filters.paymentMethods.length > 0) { 
      query = query.overlaps('payment_methods', filters.paymentMethods); 
    }
    // Assuming filters.shippingMethods contains the values for 'shipping_methods' column
    if (filters.shippingMethods && filters.shippingMethods.length > 0) { 
      query = query.overlaps('shipping_methods', filters.shippingMethods); 
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
export const getSupplierById = async (id: string, userId: string | null | undefined): Promise<Supplier | null> => {
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
      } else { // No specific allowedIds from rule, rely on general trial status
        const userProfile = await getUserProfileForAccessCheck(userId); // Fetch profile
        
        // Check subscription status first as it overrides trial
        if (userProfile?.subscription_status === 'active' || userProfile?.subscription_status === 'trialing') {
          // This user is effectively a subscriber, this limited_count path might be an edge case or specific rule.
          // If they are subscribed, they usually get 'full' access.
          // If a rule *specifically* limits subscribers here, then we proceed.
          // For now, let's assume if they reached here as a subscriber, they are allowed by some rule.
        } else if (userProfile?.trial_status === 'active') { // Check 'trial_status' from 'profiles' table
            // Profile says active trial, check if it allows this supplier
            const allowedTrialSupplierIds = await getAllowedSuppliersForTrial(userId);
            if (!allowedTrialSupplierIds.includes(id)) {
                console.log(`Trial user ${userId} (profile active trial) attempted to view non-allowed supplier ${id}.`);
                return null; 
            }
        } else {
           // Covers 'not_started', 'expired', 'converted' (but subscription lapsed/not active).
           // Deny access if not an active trial and no specific allowedIds.
           console.log(`User ${userId} (not active subscriber/trial) denied access to supplier ${id} under limited_count rule.`);
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
// Assuming SupplierFormValues uses snake_case for payment_methods and shipping_methods based on TS errors
export const createSupplier = async (supplier: SupplierFormValues): Promise<Supplier> => {
  try {
    console.log("Creating supplier with data:", JSON.stringify(supplier));
    
    const categories = supplier.categories || [];
    
    const newSupplierData = { ...supplier };
    // Remove categories from the direct insert payload as it's handled separately
    delete (newSupplierData as any).categories; 

    const newSupplierPayload = {
      ...newSupplierData, // spread all properties from SupplierFormValues
      code: supplier.code || `SUP-${Date.now()}`, // Ensure code is present
      // Ensure all required fields in 'suppliers' table are covered by SupplierFormValues or have defaults
      images: supplier.images || [],
      payment_methods: supplier.payment_methods || [], // Expect snake_case from form values
      shipping_methods: supplier.shipping_methods || [], // Expect snake_case from form values
      requires_cnpj: supplier.requires_cnpj || false,
      featured: supplier.featured || false,
      hidden: supplier.hidden || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('suppliers')
      .insert(newSupplierPayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
    if (!data) {
      throw new Error('No data returned from supplier insert');
    }

    if (categories.length > 0) {
      await updateSupplierCategories(data.id, categories);
    }

    return { ...data, categories } as Supplier;
  } catch (error) {
    console.error('Error in createSupplier:', error);
    throw error;
  }
};

// Update an existing supplier
// Assuming SupplierFormValues uses snake_case for payment_methods and shipping_methods
export const updateSupplier = async (id: string, supplier: Partial<SupplierFormValues>): Promise<Supplier> => {
  try {
    console.log("Updating supplier with ID:", id, "Data:", JSON.stringify(supplier));
    
    const categories = supplier.categories; // Can be undefined if not updating categories
    
    const updatedSupplierData = { ...supplier };
    delete (updatedSupplierData as any).categories;

    // Ensure snake_case if SupplierFormValues might have camelCase (adjust if form is already snake_case)
    // If SupplierFormValues is confirmed to use snake_case, this mapping is not needed.
    // const dbSupplierData: Partial<any> = { ...updatedSupplierData };
    // if (updatedSupplierData.paymentMethods) { // Example if form used camelCase
    //     dbSupplierData.payment_methods = updatedSupplierData.paymentMethods;
    //     delete dbSupplierData.paymentMethods;
    // }
    // if (updatedSupplierData.shippingMethods) { // Example if form used camelCase
    //     dbSupplierData.shipping_methods = updatedSupplierData.shippingMethods;
    //     delete dbSupplierData.shippingMethods;
    // }
    // Assuming updatedSupplierData already contains snake_case fields like payment_methods
    
    const updatePayload = {
      ...updatedSupplierData, // directly use if form values are snake_case
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('suppliers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }

    if (categories !== undefined) {
      await updateSupplierCategories(id, categories || []);
    }

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
