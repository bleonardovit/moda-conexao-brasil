
// Types for suppliers
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
  payment_methods: ('pix' | 'card' | 'bankslip')[];
  requires_cnpj: boolean;
  avg_price: 'low' | 'medium' | 'high';
  shipping_methods: ('correios' | 'delivery' | 'transporter' | 'excursion' | 'air' | 'custom')[];
  custom_shipping_method?: string;
  city: string;
  state: string;
  categories: string[];
  featured: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

// Types for reviews
export interface Review {
  id: string;
  supplier_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
