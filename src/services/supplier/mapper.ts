
import type { Supplier } from '@/types';
import { LOCKED_SUPPLIER_PLACEHOLDERS } from './types';

// Helper to map raw supplier data and sanitize if locked for trial
export const mapRawSupplierToDisplaySupplier = (rawSupplier: any, isLocked: boolean, averageRating?: number): Supplier => {
  // The 'categories' property from rawSupplier will now be an array of objects like [{ category_id: 'uuid' }, ...]
  // due to the Supabase select query: '*, categories_data:suppliers_categories(category_id)'
  // We need to map this to an array of strings.
  const categoryIds = (rawSupplier.categories_data || []).map((cat: { category_id: string }) => cat.category_id);

  const baseSupplier: Supplier = {
    id: rawSupplier.id,
    code: rawSupplier.code,
    name: rawSupplier.name,
    description: rawSupplier.description,
    images: (rawSupplier.images || []) as string[],
    instagram: rawSupplier.instagram,
    whatsapp: rawSupplier.whatsapp,
    website: rawSupplier.website,
    min_order: rawSupplier.min_order,
    payment_methods: (rawSupplier.payment_methods || []).filter(
      (method: string) => ['pix', 'card', 'bankslip'].includes(method)
    ),
    requires_cnpj: rawSupplier.requires_cnpj ?? false,
    avg_price: (rawSupplier.avg_price || 'medium') as 'low' | 'medium' | 'high',
    shipping_methods: (rawSupplier.shipping_methods || []).filter(
      (method: string) => ['correios', 'delivery', 'transporter', 'excursion', 'air', 'custom'].includes(method)
    ),
    custom_shipping_method: rawSupplier.custom_shipping_method,
    city: rawSupplier.city,
    state: rawSupplier.state,
    categories: categoryIds, // Correctly mapped category IDs
    featured: rawSupplier.featured ?? false,
    hidden: rawSupplier.hidden ?? false,
    created_at: rawSupplier.created_at,
    updated_at: rawSupplier.updated_at,
    isLockedForTrial: isLocked,
    averageRating: averageRating, // Adicionar averageRating
  };

  if (isLocked) {
    return {
      ...baseSupplier,
      name: LOCKED_SUPPLIER_PLACEHOLDERS.name,
      description: LOCKED_SUPPLIER_PLACEHOLDERS.description,
      city: LOCKED_SUPPLIER_PLACEHOLDERS.city,
      state: LOCKED_SUPPLIER_PLACEHOLDERS.state,
      instagram: LOCKED_SUPPLIER_PLACEHOLDERS.instagram,
      whatsapp: LOCKED_SUPPLIER_PLACEHOLDERS.whatsapp,
      website: LOCKED_SUPPLIER_PLACEHOLDERS.website,
      min_order: LOCKED_SUPPLIER_PLACEHOLDERS.min_order,
    };
  }
  return baseSupplier;
};
