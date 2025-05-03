
import * as z from 'zod';

export const supplierFormSchema = z.object({
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres'),
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  images: z
    .array(z.string())
    .min(0)
    .max(10, 'Máximo de 10 imagens permitidas'),
  instagram: z
    .string()
    .max(50, 'Instagram deve ter no máximo 50 caracteres')
    .optional(),
  whatsapp: z
    .string()
    .max(20, 'WhatsApp deve ter no máximo 20 caracteres')
    .optional(),
  website: z
    .string()
    .max(100, 'Website deve ter no máximo 100 caracteres')
    .optional(),
  min_order: z
    .string()
    .max(50, 'Valor mínimo deve ter no máximo 50 caracteres')
    .optional(),
  payment_methods: z
    .array(z.enum(['pix', 'card', 'bankslip']))
    .min(1, 'Selecione pelo menos um método de pagamento'),
  requires_cnpj: z.boolean(),
  avg_price: z.enum(['low', 'medium', 'high']),
  shipping_methods: z
    .array(z.enum(['correios', 'delivery', 'transporter', 'excursion', 'air', 'custom']))
    .min(1, 'Selecione pelo menos um método de envio'),
  custom_shipping_method: z.string().optional(),
  city: z
    .string()
    .min(2, 'Cidade é obrigatória')
    .max(50, 'Cidade deve ter no máximo 50 caracteres'),
  state: z.string().min(2, 'Estado é obrigatório'),
  categories: z
    .array(z.string())
    .min(1, 'Selecione pelo menos uma categoria'),
  featured: z.boolean(),
  hidden: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
