
// Type guards and utility types for supplier service
export function isValidSupplierResponse(obj: any): obj is { id: string; [key: string]: any } {
  return (
    obj !== null && 
    typeof obj === 'object' && 
    'id' in obj && 
    typeof obj.id === 'string' && 
    obj.id.trim() !== ''
  );
}

// Placeholders para dados genéricos de fornecedores bloqueados em trial
export const LOCKED_SUPPLIER_PLACEHOLDERS = {
  name: "Fornecedor Bloqueado",
  description: "Detalhes disponíveis apenas para assinantes.",
  city: "Localização",
  state: "Protegida",
  instagram: undefined,
  whatsapp: undefined,
  website: undefined,
  min_order: "-",
};
