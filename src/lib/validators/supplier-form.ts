
import * as z from 'zod';

// Função para normalizar strings
function normalize(str: string) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Preprocessamento para string robusto
const stringPreprocess50 = z.preprocess((val) => {
  if (typeof val === "number") return String(val);
  if (val == null) return "";
  return String(val);
}, z.string().max(50, 'Deve ter no máximo 50 caracteres').optional().default(""));

const stringPreprocess20 = z.preprocess((val) => {
  if (typeof val === "number") return String(val);
  if (val == null) return "";
  return String(val);
}, z.string().max(20, 'Deve ter no máximo 20 caracteres').optional().default(""));

const stringPreprocess100 = z.preprocess((val) => {
  if (typeof val === "number") return String(val);
  if (val == null) return "";
  return String(val);
}, z.string().max(100, 'Deve ter no máximo 100 caracteres').optional().default(""));

// Booleano robusto
const booleanPreprocess = z.preprocess((val) => {
  if (typeof val === "string") {
    return ["sim", "true", "1", "yes"].includes(val.trim().toLowerCase());
  }
  if (typeof val === "number") {
    return val === 1;
  }
  return Boolean(val);
}, z.boolean());

// Preço médio robusto (agora opcional)
const avgPricePreprocess = z.preprocess((val) => {
  if (typeof val === "string") {
    const norm = normalize(val);
    if (["baixo", "low", "1"].includes(norm)) return "low";
    if (["medio", "médio", "medium", "2"].includes(norm)) return "medium";
    if (["alto", "high", "3"].includes(norm)) return "high";
    if (norm === "" || norm === "-" || norm === "na" || norm === "não informado") return undefined;
    // Se não reconhecido, retorna undefined para não acusar erro
    return undefined;
  }
  if (typeof val === "number") {
    if (val === 1) return "low";
    if (val === 2) return "medium";
    if (val === 3) return "high";
    return undefined;
  }
  return val;
}, z.enum(['low', 'medium', 'high']).optional());

// Métodos de pagamento e envio opcionais
const paymentMethodsPreprocess = z.preprocess((val) => {
  if (typeof val === "string") {
    return val.split(",").map((v: string) => {
      const norm = normalize(v.trim());
      if (["pix"].includes(norm)) return "pix";
      if (["cartao", "cartão", "card"].includes(norm)) return "card";
      if (["boleto", "bankslip"].includes(norm)) return "bankslip";
      return norm;
    });
  }
  if (val === false || val == null) return [];
  return val;
}, z.array(z.enum(['pix', 'card', 'bankslip'])).optional().default([]));

const shippingMethodsPreprocess = z.preprocess((val) => {
  if (typeof val === "string") {
    return val.split(",").map((v: string) => {
      const norm = normalize(v.trim());
      if (["correios"].includes(norm)) return "correios";
      if (["delivery", "entrega"].includes(norm)) return "delivery";
      if (["transporter", "transportadora"].includes(norm)) return "transporter";
      if (["excursion", "excursao"].includes(norm)) return "excursion";
      if (["air", "aereo", "aéreo"].includes(norm)) return "air";
      if (["custom", "outro"].includes(norm)) return "custom";
      return norm;
    });
  }
  if (val === false || val == null) return [];
  return val;
}, z.array(z.enum(['correios', 'delivery', 'transporter', 'excursion', 'air', 'custom'])).optional().default([]));

// min_order: aceita string ou número, sempre retorna string
const minOrderPreprocess = z.preprocess((val) => {
  if (typeof val === "number") return String(val);
  if (val == null) return "";
  return String(val);
}, z.string().max(50, 'Valor mínimo deve ter no máximo 50 caracteres').optional().default(""));

export const supplierFormSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório').max(20, 'Código deve ter no máximo 20 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500, 'Descrição deve ter no máximo 500 caracteres'),
  images: z.array(z.string()).min(0).default([]),
  instagram: stringPreprocess50,
  whatsapp: stringPreprocess20,
  website: stringPreprocess100,
  min_order: minOrderPreprocess,
  payment_methods: paymentMethodsPreprocess,
  requires_cnpj: booleanPreprocess,
  avg_price: avgPricePreprocess,
  shipping_methods: shippingMethodsPreprocess,
  custom_shipping_method: stringPreprocess100,
  city: z.string().min(2, 'Cidade é obrigatória').max(50, 'Cidade deve ter no máximo 50 caracteres'),
  state: z.string().min(2, 'Estado é obrigatório'),
  categories: z.array(z.string()).min(1, 'Selecione pelo menos uma categoria').default([]),
  featured: booleanPreprocess,
  hidden: booleanPreprocess,
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
