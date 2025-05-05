
import type { Tables } from "@/integrations/supabase/types";

// Use the existing types from Supabase but add additional app-specific types or utilities

export type Supplier = Tables<"suppliers"> & {
  categories: string[]; // References to category IDs
};

export type Category = Tables<"categories">;

export type SupplierWithCategories = Supplier & {
  categoryNames?: string[]; // Resolved category names for display
};

// Re-export the SupplierFormValues from the validator file to maintain consistency
export { type SupplierFormValues } from '@/lib/validators/supplier-form';
