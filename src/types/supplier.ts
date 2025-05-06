import type { Tables } from "@/integrations/supabase/types";

// Use the existing types from Supabase but add additional app-specific types or utilities

export type Supplier = Tables<"suppliers"> & {
  categories: string[]; // References to category IDs
  delivery_time?: string; // Added this property
  shipping_cost?: string; // Added this property
};

export type Category = Tables<"categories">;

export type SupplierWithCategories = Supplier & {
  categoryNames?: string[]; // Resolved category names for display
};

// Define the SupplierFormValues type for the form
export type SupplierFormValues = {
  code: string;
  name: string;
  description: string;
  images: string[];
  instagram?: string;
  whatsapp?: string;
  website?: string;
  min_order?: string;
  payment_methods: string[];
  requires_cnpj: boolean;
  avg_price?: "low" | "medium" | "high"; // Make sure it matches the enum values in the form
  shipping_methods: string[];
  custom_shipping_method?: string;
  city: string;
  state: string;
  categories: string[];
  featured: boolean;
  hidden: boolean;
  delivery_time?: string; // Added this property
  shipping_cost?: string; // Added this property
};

// Re-export the SupplierFormValues from the validator file to maintain consistency
export { type SupplierFormValues as SupplierFormSchemaValues } from '@/lib/validators/supplier-form';
