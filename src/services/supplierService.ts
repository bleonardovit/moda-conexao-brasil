
import { supabase } from "@/integrations/supabase/client";
import type { Supplier, Category } from '@/types';
import { SupplierFormValues } from '@/lib/validators/supplier-form';

// Get all suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*');

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    return data || [];
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

    return data;
  } catch (error) {
    console.error('Error in getSupplierById:', error);
    throw error;
  }
};

// Create a new supplier
export const createSupplier = async (supplier: SupplierFormValues): Promise<Supplier> => {
  try {
    const newSupplier = {
      ...supplier,
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

    // Insert supplier categories relationships
    if (supplier.categories && supplier.categories.length > 0) {
      await updateSupplierCategories(data.id, supplier.categories);
    }

    return data;
  } catch (error) {
    console.error('Error in createSupplier:', error);
    throw error;
  }
};

// Update an existing supplier
export const updateSupplier = async (id: string, supplier: SupplierFormValues): Promise<Supplier> => {
  try {
    const updatedSupplier = {
      ...supplier,
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

    // Update supplier categories
    if (supplier.categories) {
      await updateSupplierCategories(id, supplier.categories);
    }

    return data;
  } catch (error) {
    console.error('Error in updateSupplier:', error);
    throw error;
  }
};

// Delete a supplier
export const deleteSupplier = async (id: string): Promise<void> => {
  try {
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
    // First, remove existing relations
    await supabase
      .from('suppliers_categories')
      .delete()
      .eq('supplier_id', supplierId);
    
    // Then add new relations
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
