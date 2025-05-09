
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

// Search suppliers with filters
export const searchSuppliers = async (
  filters: {
    searchTerm?: string;
    category?: string;
    state?: string;
    city?: string;
    minOrderRange?: [number, number];
    paymentMethods?: string[];
    requiresCnpj?: boolean | null;
    shippingMethods?: string[];
    hasWebsite?: boolean | null;
  }
): Promise<Supplier[]> => {
  try {
    console.log('Searching suppliers with filters:', filters);
    
    // Start building the query
    let query = supabase
      .from('suppliers')
      .select('*');

    // Apply filters
    // Filter by name or description
    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }

    // Filter by state
    if (filters.state && filters.state !== 'all') {
      query = query.eq('state', filters.state);
    }

    // Filter by city
    if (filters.city && filters.city !== 'all') {
      query = query.eq('city', filters.city);
    }

    // Filter by requires CNPJ
    if (filters.requiresCnpj !== null) {
      query = query.eq('requires_cnpj', filters.requiresCnpj);
    }

    // Filter by hasWebsite (website is not null)
    if (filters.hasWebsite !== null) {
      if (filters.hasWebsite) {
        query = query.not('website', 'is', null);
      } else {
        query = query.is('website', null);
      }
    }

    // Filter by payment methods (array contains)
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      // Use overlap to find if any of the selected methods are in the payment_methods array
      query = query.overlaps('payment_methods', filters.paymentMethods);
    }

    // Filter by shipping methods (array contains)
    if (filters.shippingMethods && filters.shippingMethods.length > 0) {
      // Use overlap to find if any of the selected methods are in the shipping_methods array
      query = query.overlaps('shipping_methods', filters.shippingMethods);
    }

    // Don't show hidden suppliers
    query = query.eq('hidden', false);

    // Execute the query
    const { data: suppliersData, error: suppliersError } = await query;

    if (suppliersError) {
      console.error('Error searching suppliers:', suppliersError);
      throw suppliersError;
    }

    // Safety check - if no data returned, return empty array
    if (!suppliersData) return [];

    // For each supplier, get their associated categories
    let suppliersWithCategories = await Promise.all(
      suppliersData.map(async (supplier) => {
        const categories = await getSupplierCategories(supplier.id);
        return { ...supplier, categories } as Supplier;
      })
    );

    // Filter by category (need to fetch categories first)
    if (filters.category && filters.category !== 'all') {
      suppliersWithCategories = suppliersWithCategories.filter(
        supplier => supplier.categories.includes(filters.category!)
      );
    }

    // Filter by min order range
    if (filters.minOrderRange) {
      const [min, max] = filters.minOrderRange;
      
      // Parse min_order to number (remove currency symbol, spaces, commas)
      suppliersWithCategories = suppliersWithCategories.filter(supplier => {
        if (!supplier.min_order) return true; // If no min_order, include it
        
        const minOrderValue = parseInt(supplier.min_order.replace(/\D/g, ''), 10) || 0;
        return minOrderValue >= min && minOrderValue <= max;
      });
    }

    return suppliersWithCategories;
  } catch (error) {
    console.error('Error in searchSuppliers:', error);
    throw error;
  }
};

// Get supplier by ID
export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    console.log(`Fetching supplier with ID: ${id}`);
    
    if (!id) {
      console.error('Invalid supplier ID provided');
      return null;
    }

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle not found more gracefully

    if (error) {
      console.error(`Error fetching supplier with ID ${id}:`, error);
      throw error;
    }

    if (!data) {
      console.log(`No supplier found with ID: ${id}`);
      return null;
    }

    console.log(`Supplier found:`, data);

    // Get categories for this supplier
    const categories = await getSupplierCategories(id);
    console.log(`Categories for supplier ${id}:`, categories);
    
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
    const updatedSupplier = {
      ...supplier,
      categories: undefined, // Remove categories from the update object
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
