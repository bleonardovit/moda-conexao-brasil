
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
  min_order?: string; // This is text, e.g., "100" or "R$ 100"
  payment_methods: PaymentMethod[];
  requires_cnpj: boolean;
  avg_price: AvgPrice; 
  shipping_methods: ShippingMethod[];
  custom_shipping_method?: string;
  city: string;
  state: string;
  categories: string[]; 
  featured: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
  isLockedForTrial?: boolean;
  averageRating?: number; // Novo campo para a média de avaliações
}

// Payload for creating a supplier
export interface SupplierCreationPayload {
  code?: string;  // Changed to optional for type compatibility with form values.
                  // Runtime validation for presence and non-emptiness is done in supplierService.
  name?: string; // Changed to optional, will be validated at runtime.
  description?: string; // Changed to optional, will be validated at runtime.
  images?: string[]; // Changed to optional, will be defaulted to [] if not provided.
  instagram?: string;
  whatsapp?: string;
  website?: string;
  min_order?: string; // This is text, e.g., "100" or "R$ 100"
  payment_methods?: PaymentMethod[]; // Changed to optional
  requires_cnpj?: boolean; // Changed to optional
  avg_price?: AvgPrice; // Kept optional as per previous change
  shipping_methods?: ShippingMethod[]; // Changed to optional
  custom_shipping_method?: string;
  city?: string; // Changed to optional, will be validated at runtime
  state?: string; // Changed to optional, will be validated at runtime
  categories?: string[]; // Changed to optional
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
  minOrderMin?: number; // Added for minimum order value
  minOrderMax?: number; // Added for maximum order value
  paymentMethods?: PaymentMethod[];
  requiresCnpj?: boolean | null; // null means 'both'
  shippingMethods?: ShippingMethod[];
  hasWebsite?: boolean | null; // null means 'both'
}
