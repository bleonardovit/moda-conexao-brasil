
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

// Removed duplicate Review interface. It's defined in src/types/review.ts

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
  paymentMethods?: PaymentMethod[]; // Use specific type
  requiresCnpj?: boolean | null;
  shippingMethods?: ShippingMethod[]; // Use specific type
  hasWebsite?: boolean | null;
  // Add other potential filters here, e.g., ratingRange
}

// Payload for creating a supplier. All fields from Supplier except id, created_at, updated_at.
// Categories are included here as they are part of the creation data passed to the service.
export type SupplierCreationPayload = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;

// Payload for updating a supplier. All fields are partial.
export type SupplierUpdatePayload = Partial<SupplierCreationPayload>;

