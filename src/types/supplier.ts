

// Types for suppliers

export type PaymentMethod = 'pix' | 'card' | 'bankslip';
export type ShippingMethod = 'correios' | 'delivery' | 'transporter' | 'excursion' | 'air' | 'custom';
export type AvgPrice = 'low' | 'medium' | 'high';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  description: string;
  images: string[];
  instagram?: string;
  whatsapp?: string;
  website?: string;
  min_order?: string;
  payment_methods: PaymentMethod[];
  requires_cnpj: boolean;
  avg_price: AvgPrice;
  shipping_methods: ShippingMethod[];
  custom_shipping_method?: string;
  city: string;
  state: string;
  categories: string[]; // These are category IDs
  featured: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

// Payload for creating a supplier
export interface SupplierCreationPayload {
  code: string;  // This must be required
  name: string;
  description: string;
  images: string[];
  instagram?: string;
  whatsapp?: string;
  website?: string;
  min_order?: string;
  payment_methods: PaymentMethod[];
  requires_cnpj: boolean;
  avg_price?: AvgPrice; // Changed to optional to match form values
  shipping_methods: ShippingMethod[];
  custom_shipping_method?: string;
  city: string;
  state: string;
  categories: string[];
  featured?: boolean;
  hidden?: boolean;
}

// Payload for updating a supplier
export type SupplierUpdatePayload = Partial<SupplierCreationPayload>;

// Types for supplier import history
export interface SupplierImportHistory {
  id: string;
  filename: string;
  total_count: number;
  success_count: number;
  error_count: number;
  status: 'success' | 'error' | 'pending';
  imported_by?: string;
  imported_at: string;
  error_details?: Record<string, string[]>;
}

// Type for supplier search filters
export interface SearchFilters {
  searchTerm?: string;
  categoryId?: string;
  state?: string;
  city?: string;
  minOrderRange?: [number, number];
  paymentMethods?: PaymentMethod[];
  requiresCnpj?: boolean | null;
  shippingMethods?: ShippingMethod[];
  hasWebsite?: boolean | null;
}

// Type for supplier reviews (moved from review.ts to avoid duplication)
export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  supplier_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

