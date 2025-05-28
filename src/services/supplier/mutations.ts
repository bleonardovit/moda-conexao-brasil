
import { supabase } from '@/integrations/supabase/client';
import type { Supplier, SupplierCreationPayload, SupplierUpdatePayload } from '@/types';
import { isValidSupplierResponse } from './types';
import { associateSupplierWithCategories } from './categories';
import { getSupplierById } from './queries';

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
  
  // Use the type guard to validate the response
  if (!isValidSupplierResponse(rawNewSupplier)) {
    console.error('Error creating supplier: Invalid or no data returned after insert, or data is missing a valid "id" string property.', rawNewSupplier);
    throw new Error('Failed to create supplier: Invalid or no data returned after insert, or "id" is invalid.');
  }
  
  // At this point, rawNewSupplier is confirmed to have a valid id property
  const createdSupplierId = rawNewSupplier.id;
  
  // If there are categories, associate them with the supplier in the join table
  if (categoryIdsInput && categoryIdsInput.length > 0) {
    await associateSupplierWithCategories(createdSupplierId, categoryIdsInput);
  }
  
  // Fetch the complete supplier data after creation and category association
  const finalSupplier = await getSupplierById(createdSupplierId); 
  if (!finalSupplier) {
    console.error('Critical error: Failed to retrieve supplier immediately after creation.');
    throw new Error('Failed to retrieve supplier after creation.');
  }
  console.log("supplierService: Supplier created successfully:", finalSupplier);
  return finalSupplier;
};

// Update an existing supplier
export const updateSupplier = async (id: string, updates: SupplierUpdatePayload, userId?: string): Promise<Supplier | null> => {
  console.log(`supplierService: Updating supplier with ID: ${id}`, updates);
  
  const { categories: newCategoryIds, ...supplierUpdatesForTable } = updates;

  if (Object.keys(supplierUpdatesForTable).length > 0) {
    const { error: updateError } = await supabase
      .from('suppliers')
      .update(supplierUpdatesForTable)
      .eq('id', id)
      .select()
      .single();

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
  }
  
  // Fetch the complete supplier data after updates
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

export const updateSupplierFeaturedStatus = async (id: string, featured: boolean): Promise<void> => {
  return toggleSupplierFeatured(id, featured);
};

export const updateSupplierHiddenStatus = async (id: string, hidden: boolean): Promise<void> => {
  return toggleSupplierVisibility(id, hidden);
};
