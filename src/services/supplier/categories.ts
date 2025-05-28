
import { supabase } from '@/integrations/supabase/client';

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

// Helper function to associate supplier with categories
export const associateSupplierWithCategories = async (supplierId: string, categoryIds: string[]): Promise<void> => {
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
