
import { supabase } from "@/integrations/supabase/client";
import type { Category } from '@/types';

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
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
    console.error('Error in getCategories:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  try {
    const newCategory = {
      ...category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(newCategory)
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

// Update an existing category
export const updateCategory = async (id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category> => {
  try {
    const updatedCategory = {
      ...category,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('categories')
      .update(updatedCategory)
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

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    // Delete category relationships first
    await supabase
      .from('suppliers_categories')
      .delete()
      .eq('category_id', id);
    
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
