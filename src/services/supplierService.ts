
import { supabase } from "@/integrations/supabase/client";
import type { Supplier, Category } from '@/types';
import { SupplierFormValues } from '@/lib/validators/supplier-form';

// Get all suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    // First, get all suppliers
    const { data: suppliersData, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*');

    if (suppliersError) {
      console.error('Error fetching suppliers:', suppliersError);
      throw suppliersError;
    }

    // Safety check - if no data returned, return empty array
    if (!suppliersData) return [];

    // For each supplier, get their associated categories
    const suppliersWithCategories = await Promise.all(
      suppliersData.map(async (supplier) => {
        const categories = await getSupplierCategories(supplier.id);
        return { ...supplier, categories } as Supplier;
      })
    );

    return suppliersWithCategories;
  } catch (error) {
    console.error('Error in getSuppliers:', error);
    throw error;
  }
};

// Get supplier by ID
export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching supplier by ID:', error);
      throw error;
    }

    // Get categories for this supplier
    const categories = await getSupplierCategories(id);
    return { ...data, categories } as Supplier;
  } catch (error) {
    console.error('Error in getSupplierById:', error);
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
      payment_methods: supplier.payment_methods || [],
      requires_cnpj: supplier.requires_cnpj || false,
      avg_price: supplier.avg_price || null,
      shipping_methods: supplier.shipping_methods || [],
      custom_shipping_method: supplier.custom_shipping_method || null,
      city: supplier.city || '',
      state: supplier.state || '',
      featured: supplier.featured || false,
      hidden: supplier.hidden || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

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
    const updatedSupplier = {
      ...supplier,
      categories: undefined, // Remove categories from the update object
      updated_at: new Date().toISOString(),
    };

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
    if (categories && categories.length >= 0) {
      await updateSupplierCategories(id, categories);
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
