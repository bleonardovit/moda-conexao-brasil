
import { supabase } from "@/integrations/supabase/client";
import type { Supplier, SupplierFormValues, Category } from "@/types/supplier";

/**
 * Fetch all suppliers from the database
 */
export const fetchSuppliers = async (options?: { 
  categoryId?: string,
  featured?: boolean,
  searchTerm?: string
}): Promise<Supplier[]> => {
  try {
    let query = supabase
      .from('suppliers')
      .select(`
        *,
        suppliers_categories!inner(category_id)
      `);

    // Apply filters if provided
    if (options?.categoryId) {
      query = query.eq('suppliers_categories.category_id', options.categoryId);
    }

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    if (options?.searchTerm) {
      query = query.ilike('name', `%${options.searchTerm}%`);
    }

    // Only show visible suppliers for non-admin users
    query = query.eq('hidden', false);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    // Process the data to get unique suppliers with their category IDs
    const suppliersMap = new Map<string, Supplier>();
    
    data?.forEach(item => {
      const supplierId = item.id;
      const categoryId = item.suppliers_categories?.[0]?.category_id;
      
      if (!suppliersMap.has(supplierId)) {
        // Create new supplier entry
        const supplier = {
          ...item,
          categories: categoryId ? [categoryId] : []
        };
        delete supplier.suppliers_categories;
        suppliersMap.set(supplierId, supplier as Supplier);
      } else if (categoryId) {
        // Add category to existing supplier
        const supplier = suppliersMap.get(supplierId)!;
        if (!supplier.categories.includes(categoryId)) {
          supplier.categories.push(categoryId);
        }
      }
    });
    
    return Array.from(suppliersMap.values());
  } catch (error) {
    console.error('Error in fetchSuppliers:', error);
    throw error;
  }
};

/**
 * Fetch all categories from the database
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    throw error;
  }
};

/**
 * Get a single supplier by ID
 */
export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    // First, get the supplier
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (supplierError) {
      console.error('Error fetching supplier:', supplierError);
      throw supplierError;
    }

    if (!supplier) {
      return null;
    }

    // Then get the categories for this supplier
    const { data: categoryLinks, error: categoriesError } = await supabase
      .from('suppliers_categories')
      .select('category_id')
      .eq('supplier_id', id);

    if (categoriesError) {
      console.error('Error fetching supplier categories:', categoriesError);
      throw categoriesError;
    }

    // Return supplier with categories array
    return {
      ...supplier,
      categories: categoryLinks?.map(link => link.category_id) || []
    };
  } catch (error) {
    console.error('Error in getSupplierById:', error);
    throw error;
  }
};

/**
 * Create a new supplier
 */
export const createSupplier = async (supplierData: SupplierFormValues): Promise<Supplier> => {
  try {
    // Start a transaction
    const { data: newSupplier, error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        code: supplierData.code,
        name: supplierData.name,
        description: supplierData.description,
        images: supplierData.images || [],
        instagram: supplierData.instagram || '',
        whatsapp: supplierData.whatsapp || '',
        website: supplierData.website || '',
        min_order: supplierData.min_order || '',
        payment_methods: supplierData.payment_methods,
        requires_cnpj: supplierData.requires_cnpj,
        avg_price: supplierData.avg_price || null,
        shipping_methods: supplierData.shipping_methods,
        custom_shipping_method: supplierData.custom_shipping_method,
        city: supplierData.city,
        state: supplierData.state,
        featured: supplierData.featured,
        hidden: supplierData.hidden
      })
      .select()
      .single();

    if (supplierError) {
      console.error('Error creating supplier:', supplierError);
      throw supplierError;
    }

    // Insert category relationships
    if (supplierData.categories && supplierData.categories.length > 0) {
      const categoryLinks = supplierData.categories.map(categoryId => ({
        supplier_id: newSupplier.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('suppliers_categories')
        .insert(categoryLinks);

      if (categoryError) {
        console.error('Error linking categories:', categoryError);
        throw categoryError;
      }
    }

    return {
      ...newSupplier,
      categories: supplierData.categories || []
    };
  } catch (error) {
    console.error('Error in createSupplier:', error);
    throw error;
  }
};

/**
 * Update an existing supplier
 */
export const updateSupplier = async (id: string, supplierData: SupplierFormValues): Promise<Supplier> => {
  try {
    // Update supplier data
    const { data: updatedSupplier, error: supplierError } = await supabase
      .from('suppliers')
      .update({
        code: supplierData.code,
        name: supplierData.name,
        description: supplierData.description,
        images: supplierData.images || [],
        instagram: supplierData.instagram || '',
        whatsapp: supplierData.whatsapp || '',
        website: supplierData.website || '',
        min_order: supplierData.min_order || '',
        payment_methods: supplierData.payment_methods,
        requires_cnpj: supplierData.requires_cnpj,
        avg_price: supplierData.avg_price || null,
        shipping_methods: supplierData.shipping_methods,
        custom_shipping_method: supplierData.custom_shipping_method,
        city: supplierData.city,
        state: supplierData.state,
        featured: supplierData.featured,
        hidden: supplierData.hidden,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (supplierError) {
      console.error('Error updating supplier:', supplierError);
      throw supplierError;
    }

    // Delete existing category relationships
    const { error: deleteError } = await supabase
      .from('suppliers_categories')
      .delete()
      .eq('supplier_id', id);

    if (deleteError) {
      console.error('Error deleting category links:', deleteError);
      throw deleteError;
    }

    // Create new category relationships
    if (supplierData.categories && supplierData.categories.length > 0) {
      const categoryLinks = supplierData.categories.map(categoryId => ({
        supplier_id: id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('suppliers_categories')
        .insert(categoryLinks);

      if (categoryError) {
        console.error('Error linking categories:', categoryError);
        throw categoryError;
      }
    }

    return {
      ...updatedSupplier,
      categories: supplierData.categories || []
    };
  } catch (error) {
    console.error('Error in updateSupplier:', error);
    throw error;
  }
};

/**
 * Delete a supplier and all its relationships
 */
export const deleteSupplier = async (id: string): Promise<void> => {
  try {
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

/**
 * Create a new category
 */
export const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name,
        description: categoryData.description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: categoryData.name,
        description: categoryData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
};
